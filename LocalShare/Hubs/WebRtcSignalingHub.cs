using Microsoft.AspNetCore.SignalR;

namespace LocalShare.Hubs
{
    public class WebRtcSignalingHub: Hub
    {
        public static readonly string Url = "/signalling";

        public async Task SendMessage(string user, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

    }
}
