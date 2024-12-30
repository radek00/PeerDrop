using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace LocalShare.Hubs
{
    public class WebRtcSignalingHub: Hub
    {
        public static readonly string Url = "/signalling";

        private static readonly ConcurrentDictionary<string, string> Connections = new ConcurrentDictionary<string, string>();

        public override Task OnConnectedAsync()
        {
            // Add the connection ID to the dictionary
            Connections.TryAdd(Context.ConnectionId, Context.ConnectionId);
            // Notify all clients about the updated list of connected clients
            Clients.All.SendAsync("UpdateClientList", Context.ConnectionId);
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            // Remove the connection ID from the dictionary
            Connections.TryRemove(Context.ConnectionId, out var removedId);
            // Notify all clients about the updated list of connected clients
            Clients.All.SendAsync("UpdateClientList", removedId);
            return base.OnDisconnectedAsync(exception);
        }

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendOffer(string targetConnectionId, string offer)
        {
            if (Connections.ContainsKey(targetConnectionId))
            {
                await Clients.Client(targetConnectionId).SendAsync("ReceiveOffer", Context.ConnectionId, offer);
            }
        }

        public async Task SendAnswer(string targetConnectionId, string answer)
        {
            if (Connections.ContainsKey(targetConnectionId))
            {
                await Clients.Client(targetConnectionId).SendAsync("ReceiveAnswer", Context.ConnectionId, answer);
            }
        }

        public async Task SendIceCandidate(string targetConnectionId, string candidate)
        {
            if (Connections.ContainsKey(targetConnectionId))
            {
                await Clients.Client(targetConnectionId).SendAsync("ReceiveIceCandidate", Context.ConnectionId, candidate);
            }
        }

    }
}
