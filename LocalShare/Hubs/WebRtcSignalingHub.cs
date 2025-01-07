using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Text.Json.Nodes;

namespace LocalShare.Hubs;

public class WebRtcSignalingHub : Hub
{
    public class SdpMessage
    {
        public string Sdp { get; set; }
        public string Type { get; set; }
    }
    
    public class CleintInfo
    {
        public string SelfId { get; set; }
        public string[] OtherClients { get; set; }
    }

    public static readonly string Url = "/signalling";
    private static readonly ConcurrentDictionary<string, string> Connections = new ConcurrentDictionary<string, string>();

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        Connections.TryRemove(Context.ConnectionId, out _);
        return base.OnDisconnectedAsync(exception);
    }
    
    public override async Task OnConnectedAsync()
    {
        await Join();
    }
    public async Task Join()
    {
        Connections.TryAdd(Context.ConnectionId, Context.ConnectionId);
        await Clients.Client(Context.ConnectionId).SendAsync("UpdateSelf", new CleintInfo() {SelfId = Context.ConnectionId, OtherClients = Connections.Keys.Where(x => x != Context.ConnectionId).ToArray()});
        await Clients.Others.SendAsync("UpdateClientList", Context.ConnectionId);
    }

    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public async Task SendOffer(string targetClientId, SdpMessage offer)
    {
        if (Connections.TryGetValue(targetClientId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId).SendAsync("ReceiveOffer", Context.ConnectionId, offer);
        }
    }

    public async Task SendAnswer(string targetClientId, SdpMessage answer)
    {
        if (Connections.TryGetValue(targetClientId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId).SendAsync("ReceiveAnswer", Context.ConnectionId, answer);
        }
    }

    public async Task SendIceCandidate(string targetClientId, object candidate)
    {
        if (Connections.TryGetValue(targetClientId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId).SendAsync("ReceiveIceCandidate", Context.ConnectionId, candidate);
        }
    }
}
