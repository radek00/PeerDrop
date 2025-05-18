using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using LocalShare.Models;
using LocalShare.Models.Messages;
using LocalShare.Utils.UserAgentParser;

namespace LocalShare.Hubs;

public class WebRtcSignallingHub : Hub
{
    public static readonly string Url = "/signalling";
    private static readonly ConcurrentDictionary<string, ClientConnectionInfo> Connections = new();
    private static readonly ConcurrentDictionary<string, ConcurrentBag<ClientConnectionInfo>> IpBasedGroups = new();
    private readonly ILogger<WebRtcSignallingHub> _logger;

    public WebRtcSignallingHub(ILogger<WebRtcSignallingHub> logger)
    {
        _logger = logger;
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        Connections.TryRemove(Context.ConnectionId, out _);
        Clients.Others.SendAsync(SignallingEvents.RemoveDisconnectedClient, Context.ConnectionId);
        var httpContext = Context.GetHttpContext();
        string ipAddr = (httpContext?.Connection.RemoteIpAddress?.ToString()) ?? throw new InvalidOperationException("Could not retrieve IP address.");
        IpBasedGroups.TryRemove(ipAddr, out _);
        return base.OnDisconnectedAsync(exception);
    }
    
    public override async Task OnConnectedAsync()
    {
        await Join();
    }
    private async Task Join()
    {
        var httpContext = Context.GetHttpContext();
        var userAgent = HttpUserAgentParser.Parse(httpContext?.Request.Headers.UserAgent.ToString() ?? "").MapToUserAgent();
        var ipAddr = (httpContext?.Connection.RemoteIpAddress?.ToString()) ?? throw new InvalidOperationException("Could not retrieve IP address.");
        _logger.LogInformation("Client connected: {ConnectionId} from IP: {IpAddress}", Context.ConnectionId, ipAddr);
        var joinedClient = new ClientConnectionInfo() { Id = Context.ConnectionId, UserAgent = userAgent, Name = NameGenerator.GenerateName() };
        Connections.TryAdd(Context.ConnectionId, joinedClient);
        var ipGroup = IpBasedGroups.GetOrAdd(ipAddr, _ => []);
        ipGroup.Add(joinedClient);
        await Clients.Client(Context.ConnectionId).SendAsync(SignallingEvents.UpdateSelf, new AllClientsConnectionInfo() {Self = joinedClient 
        , OtherClients = [.. ipGroup.Where(x => x.Id != Context.ConnectionId)]
        });
        await Clients.Others.SendAsync(SignallingEvents.AddConnectedClient, joinedClient);
    }

    public async Task SendOffer(SendOffer payload)
    {
        if (Connections.TryGetValue(payload.TargetConnectionId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId.Id).SendAsync(SignallingEvents.ReceiveOffer, new ReceiveOffer() { Offer = payload.Offer, SenderConnectionId = Context.ConnectionId});
        }
    }

    public async Task SendAnswer(SendAnswer payload)
    {
        if (Connections.TryGetValue(payload.TargetConnectionId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId.Id).SendAsync(SignallingEvents.ReceiveAnswer, new ReceiveAnswer() { Answer = payload.Answer, SenderConnectionId = Context.ConnectionId});
        }
    }

    public async Task SendIceCandidate(SendIceCandidate payload)
    {
        if (Connections.TryGetValue(payload.TargetConnectionId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId.Id).SendAsync(SignallingEvents.ReceiveIceCandidate, new ReceiveIceCandidate() { Candidate = payload.Candidate, SenderConnectionId = Context.ConnectionId });
        }
    }
}
