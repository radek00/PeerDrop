using LocalShare.Models.Messages;
using System.Text.RegularExpressions;

namespace LocalShare.Utils
{
    public static class Utils
    {
        public static UserAgent ParseUserAgent(string userAgent)
        {
            var browserRegex = new Regex(@"(Firefox|MSIE|Trident|Edge|Chrome|Safari|Opera)[\/\s]?([\d\.]+)?", RegexOptions.IgnoreCase);
            var osRegex = new Regex(@"(Windows NT|Mac OS X|Linux|Android|iPhone OS|iPad OS)[\/\s]?([\d\._]+)?", RegexOptions.IgnoreCase);

            var browserMatch = browserRegex.Match(userAgent);
            var osMatch = osRegex.Match(userAgent);

            var browserName = browserMatch.Success ? browserMatch.Groups[1].Value : "Unknown";
            var browserVersion = browserMatch.Success ? TrimVersion(browserMatch.Groups[2].Value) : "";

            var osName = osMatch.Success ? osMatch.Groups[1].Value : "Unknown";
            var osVersion = osMatch.Success ? TrimVersion(osMatch.Groups[2].Value.Replace('_', '.')) : "";

            osName = osName switch
            {
                "Windows NT" => "Windows",
                "iPhone OS" => "iOS",
                "Mac OS X" => "macOS",
                _ => osName
            };

            return new UserAgent() { 
                BrowserName = browserName, 
                BrowserVersion = browserVersion, 
                OSName = osName, 
                OSVersion = osVersion 
            };
        }

        private static string TrimVersion(string version)
        {
            if (string.IsNullOrEmpty(version))
                return version;

            var parts = version.Split('.');
            var trimmedParts = parts.Reverse().SkipWhile(p => p == "0").Reverse().ToArray();
            return string.Join('.', trimmedParts);
        }
    }
}
