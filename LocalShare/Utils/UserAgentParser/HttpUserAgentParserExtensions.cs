using LocalShare.Models.Messages;

namespace LocalShare.Utils.UserAgentParser
{
    public static class HttpUserAgentParserExtensions
    {
        public static UserAgent MapToUserAgent(this HttpUserAgentInformation agent) 
        {
            return new()
            {
                BrowserName = agent.Name,
                BrowserVersion = agent.Version,
                OSName = agent.Platform.Name,
                Icon = agent.Platform.Icon,
            };
        }
    }
}
