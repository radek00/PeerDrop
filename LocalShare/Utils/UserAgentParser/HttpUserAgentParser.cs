using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;

namespace LocalShare.Utils.UserAgentParser
{
    public static class HttpUserAgentParser

    {
        public static HttpUserAgentInformation Parse(string userAgent)
        {
            userAgent = userAgent.Trim();


            var platform = GetPlatform(userAgent);
            var browser = GetBrowser(userAgent);

            return HttpUserAgentInformation.CreateForBrowser(userAgent, platform, browser.Name, browser.Version);
        }

        public static HttpUserAgentPlatformInformation GetPlatform(string userAgent)
        {
            foreach (HttpUserAgentPlatformInformation item in HttpUserAgentStatics.Platforms)
            {
                if (item.Regex.IsMatch(userAgent))
                {
                    return item;
                }
            }

            return new();
        }

        public static (string Name, string Version) GetBrowser(string userAgent)
        {
            foreach ((Regex key, string? value) in HttpUserAgentStatics.Browsers)
            {
                Match match = key.Match(userAgent);
                if (match.Success)
                {
                    return (value, match.Groups[1].Value);
                }
            }

            return ("Unknown", "Unknown");
        }
    }
}
