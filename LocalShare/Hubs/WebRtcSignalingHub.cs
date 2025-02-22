using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using LocalShare.Hubs.Messages;
using LocalShare.Models;

namespace LocalShare.Hubs;

public class WebRtcSignallingHub : Hub
{
    public static readonly string Url = "/signalling";
    private static readonly ConcurrentDictionary<string, string> Connections = new ConcurrentDictionary<string, string>();

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        Connections.TryRemove(Context.ConnectionId, out _);
        Clients.Others.SendAsync(SignallingEvents.RemoveDisconnectedClient, Context.ConnectionId);
        return base.OnDisconnectedAsync(exception);
    }
    
    public override async Task OnConnectedAsync()
    {
        await Join();
    }
    private async Task Join()
    {
        Connections.TryAdd(Context.ConnectionId, Context.ConnectionId);
        await Clients.Client(Context.ConnectionId).SendAsync(SignallingEvents.UpdateSelf, new ClientInfo() {SelfId = Context.ConnectionId, OtherClients = Connections.Keys.Where(x => x != Context.ConnectionId).ToArray()});
        await Clients.Others.SendAsync(SignallingEvents.AddConnectedClient, Context.ConnectionId);
    }

    public async Task SendOffer(string targetClientId, SdpMessage offer)
    {
        if (Connections.TryGetValue(targetClientId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId).SendAsync(SignallingEvents.ReceiveOffer, Context.ConnectionId, offer);
        }
    }

    public async Task SendAnswer(string targetClientId, SdpMessage answer)
    {
        if (Connections.TryGetValue(targetClientId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId).SendAsync(SignallingEvents.ReceiveAnswer, Context.ConnectionId, answer);
        }
    }

    public async Task SendIceCandidate(string targetClientId, object candidate)
    {
        if (Connections.TryGetValue(targetClientId, out var targetConnectionId))
        {
            await Clients.Client(targetConnectionId).SendAsync(SignallingEvents.ReceiveIceCandidate, Context.ConnectionId, candidate);
        }
    }
}
