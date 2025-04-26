using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;
// Ensure IconType enum is accessible

namespace LocalShare.Utils.UserAgentParser
{
    public static class HttpUserAgentParser

    {
        public static HttpUserAgentInformation Parse(string userAgent)
        {
            userAgent = userAgent.Trim();


            HttpUserAgentPlatformInformation? platform = GetPlatform(userAgent);

            if (TryGetBrowser(userAgent, out (string Name, string? Version)? browser))
            {
                return HttpUserAgentInformation.CreateForBrowser(userAgent, platform, browser?.Name, browser?.Version);
            }

            return HttpUserAgentInformation.CreateForUnknown(userAgent, platform);
        }

        public static HttpUserAgentPlatformInformation? GetPlatform(string userAgent)
        {
            foreach (HttpUserAgentPlatformInformation item in HttpUserAgentStatics.Platforms)
            {
                if (item.Regex.IsMatch(userAgent))
                {
                    return item;
                }
            }

            return null;
        }

        public static bool TryGetPlatform(string userAgent, [NotNullWhen(true)] out HttpUserAgentPlatformInformation? platform)
        {
            platform = GetPlatform(userAgent);
            return platform is not null;
        }

        public static (string Name, string? Version)? GetBrowser(string userAgent)
        {
            foreach ((Regex key, string? value) in HttpUserAgentStatics.Browsers)
            {
                Match match = key.Match(userAgent);
                if (match.Success)
                {
                    return (value, match.Groups[1].Value);
                }
            }

            return null;
        }

        public static bool TryGetBrowser(string userAgent, [NotNullWhen(true)] out (string Name, string? Version)? browser)
        {
            browser = GetBrowser(userAgent);
            return browser is not null;
        }
    }
}
