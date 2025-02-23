using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using LocalShare.Models;
using LocalShare.Models.Messages;

namespace LocalShare.Hubs;

public class WebRtcSignallingHub() : Hub
{
    public static readonly string Url = "/signalling";
    private static readonly ConcurrentDictionary<string, ClientConnectionInfo> Connections = new ConcurrentDictionary<string, ClientConnectionInfo>();

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        Connections.TryRemove(Context.ConnectionId, out _);
        Clients.Others.SendAsync(SignallingEvents.RemoveDisconnectedClient, Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }
    
    public override async Task OnConnectedAsync()
    {
        var context = Context.GetHttpContext();
        var userAgent = context?.Request.Headers["User-Agent"].ToString();
        await Join();
    }
    private async Task Join()
    {
        var httpContext = Context.GetHttpContext();
        var userAgent = Utils.Utils.ParseUserAgent(httpContext?.Request.Headers["User-Agent"].ToString() ?? "");
        Connections.TryAdd(Context.ConnectionId, new ClientConnectionInfo() { Id = Context.ConnectionId, UserAgent = userAgent });
        await Clients.Client(Context.ConnectionId).SendAsync(SignallingEvents.UpdateSelf, new AllClientsConnectionInfo() {Self = new ClientConnectionInfo() { Id = Context.ConnectionId, UserAgent = userAgent }
        , OtherClients = Connections
        .Where(x => x.Key != Context.ConnectionId)
        .Select(x => new ClientConnectionInfo { Id = x.Key, UserAgent = x.Value.UserAgent })
        .ToArray()
        });
        await Clients.Others.SendAsync(SignallingEvents.AddConnectedClient, new ClientConnectionInfo() { Id = Context.ConnectionId, UserAgent = userAgent});
    }

    public async Task SendOffer(string targetClientId, SdpMessage offer)
    {
        if (Connections.TryGetValue(targetClientId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId.Id).SendAsync(SignallingEvents.ReceiveOffer, Context.ConnectionId, offer);
        }
    }

    public async Task SendAnswer(string targetClientId, SdpMessage answer)
    {
        if (Connections.TryGetValue(targetClientId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId.Id).SendAsync(SignallingEvents.ReceiveAnswer, Context.ConnectionId, answer);
        }
    }

    public async Task SendIceCandidate(string targetClientId, object candidate)
    {
        if (Connections.TryGetValue(targetClientId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId.Id).SendAsync(SignallingEvents.ReceiveIceCandidate, Context.ConnectionId, candidate);
        }
    }
}
