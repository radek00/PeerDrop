using LocalShare.Models.Messages;
using LocalShare.Utils.UserAgentParser;
// Ensure IconType enum is accessible

namespace LocalShare.Utils
{
    public static class Utils
    {
        public static UserAgent ParseUserAgent(string userAgent)
        {
            var agent = HttpUserAgentParser.Parse(userAgent);
            return new UserAgent()
            {
                BrowserName = agent.Name ?? "Unknown",
                BrowserVersion = agent.Version ?? "Unknown",
                OSName = agent.Platform != null ? agent.Platform.Value.Name.ToString() : "Unknown",
                Icon = agent.Platform != null ? agent.Platform.Value.Icon : IconType.Desktop,
            };
        }

    }
}
