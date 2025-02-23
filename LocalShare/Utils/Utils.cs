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

            var browser = browserMatch.Success ? $"{browserMatch.Groups[1].Value} {TrimVersion(browserMatch.Groups[2].Value)}" : "Unknown Browser";
            var os = osMatch.Success ? $"{osMatch.Groups[1].Value} {TrimVersion(osMatch.Groups[2].Value)}" : "Unknown OS";

            return new UserAgent() { Browser = browser, OS = os };
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
