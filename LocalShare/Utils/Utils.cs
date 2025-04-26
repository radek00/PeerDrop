using LocalShare.Models.Messages;
using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;
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

    public static class HttpUserAgentStatics
    {
        private const RegexOptions DefaultPlatformsRegexFlags = RegexOptions.IgnoreCase | RegexOptions.Compiled;
        private static Regex CreateDefaultPlatformRegex(string key) => new(Regex.Escape($"{key}"),
            DefaultPlatformsRegexFlags, matchTimeout: TimeSpan.FromMilliseconds(1000));

        public static readonly HashSet<HttpUserAgentPlatformInformation> Platforms =
        [
            new(CreateDefaultPlatformRegex("winnt4.0"), "Windows NT 4.0", HttpUserAgentPlatformType.Windows, IconType.Desktop),
            new(CreateDefaultPlatformRegex("winnt 4.0"), "Windows NT", HttpUserAgentPlatformType.Windows, IconType.Desktop),
            new(CreateDefaultPlatformRegex("winnt"), "Windows NT", HttpUserAgentPlatformType.Windows, IconType.Desktop),
            new(CreateDefaultPlatformRegex("android"), "Android", HttpUserAgentPlatformType.Android, IconType.Phone),
            new(CreateDefaultPlatformRegex("iphone"), "iOS", HttpUserAgentPlatformType.IOS, IconType.Phone),
            new(CreateDefaultPlatformRegex("ipad"), "iOS", HttpUserAgentPlatformType.IOS, IconType.Tablet),
            new(CreateDefaultPlatformRegex("ipod"), "iOS", HttpUserAgentPlatformType.IOS,IconType.Phone),
            new(CreateDefaultPlatformRegex("cros"), "ChromeOS", HttpUserAgentPlatformType.ChromeOS, IconType.Desktop),
            new(CreateDefaultPlatformRegex("os x"), "Mac OS X", HttpUserAgentPlatformType.MacOS, IconType.Desktop),
            new(CreateDefaultPlatformRegex("ppc mac"), "Power PC Mac", HttpUserAgentPlatformType.MacOS, IconType.Desktop),
            new(CreateDefaultPlatformRegex("freebsd"), "FreeBSD", HttpUserAgentPlatformType.Linux, IconType.Desktop),
            new(CreateDefaultPlatformRegex("ppc"), "Macintosh", HttpUserAgentPlatformType.Linux, IconType.Desktop),
            new(CreateDefaultPlatformRegex("linux"), "Linux", HttpUserAgentPlatformType.Linux, IconType.Desktop),
            new(CreateDefaultPlatformRegex("debian"), "Debian", HttpUserAgentPlatformType.Linux, IconType.Desktop),
            new(CreateDefaultPlatformRegex("openbsd"), "OpenBSD", HttpUserAgentPlatformType.Unix, IconType.Desktop),
            new(CreateDefaultPlatformRegex("gnu"), "GNU/Linux", HttpUserAgentPlatformType.Linux, IconType.Desktop),
            new(CreateDefaultPlatformRegex("unix"), "Unknown Unix OS", HttpUserAgentPlatformType.Unix, IconType.Desktop),
    ];

        private const RegexOptions DefaultBrowserRegexFlags = RegexOptions.IgnoreCase | RegexOptions.Compiled;
        private static Regex CreateDefaultBrowserRegex(string key)
            => new($@"{key}.*?([0-9\.]+)", DefaultBrowserRegexFlags, matchTimeout: TimeSpan.FromMilliseconds(1000));

        public static readonly Dictionary<Regex, string> Browsers = new()
    {
        { CreateDefaultBrowserRegex("OPR"), "Opera" },
        { CreateDefaultBrowserRegex("Edge"), "Edge" },
        { CreateDefaultBrowserRegex("EdgA"), "Edge" },
        { CreateDefaultBrowserRegex("Edg"), "Edge" },
        { CreateDefaultBrowserRegex("Vivaldi"), "Vivaldi" },
        { CreateDefaultBrowserRegex("Brave Chrome"), "Brave" },
        { CreateDefaultBrowserRegex("Chrome"), "Chrome" },
        { CreateDefaultBrowserRegex("Opera.*?Version"), "Opera" },
        { CreateDefaultBrowserRegex("Opera"), "Opera" },
        { CreateDefaultBrowserRegex("MSIE"), "Internet Explorer" },
        { CreateDefaultBrowserRegex("Internet Explorer"), "Internet Explorer" },
        { CreateDefaultBrowserRegex("Trident.* rv"), "Internet Explorer" },
        { CreateDefaultBrowserRegex("Shiira"), "Shiira" },
        { CreateDefaultBrowserRegex("Firefox"), "Firefox" },
        { CreateDefaultBrowserRegex("FxiOS"), "Firefox" },
        { CreateDefaultBrowserRegex("Version"), "Safari" },
        { CreateDefaultBrowserRegex("Mozilla"), "Mozilla" },
        { CreateDefaultBrowserRegex("Ubuntu"), "Ubuntu Web Browser" },
    };
    }
    public enum HttpUserAgentPlatformType : byte
    {
        Unknown = 0,
        Generic,
        Windows,
        Linux,
        Unix,
        IOS,
        MacOS,
        BlackBerry,
        Android,
        Symbian,
        ChromeOS
    }

    public readonly struct HttpUserAgentPlatformInformation(Regex regex, string name, HttpUserAgentPlatformType platformType, IconType icon)
    {
        public Regex Regex { get; } = regex;
        public string Name { get; } = name;
        public HttpUserAgentPlatformType PlatformType { get; } = platformType;
        public IconType Icon { get; } = icon;
    }


    public enum HttpUserAgentType : byte
    {
        Unknown,
        Browser,
        Robot
    }

    public readonly struct HttpUserAgentInformation
    {
        public string UserAgent { get; }

        public HttpUserAgentType Type { get; }
        public HttpUserAgentPlatformInformation? Platform { get; }
        public string? Name { get; }
        public string? Version { get; }
        private HttpUserAgentInformation(string userAgent, HttpUserAgentPlatformInformation? platform, HttpUserAgentType type, string? name, string? version)
        {
            UserAgent = userAgent;
            Type = type;
            Name = name;
            Platform = platform;
            Version = version;
        }
        public static HttpUserAgentInformation Parse(string userAgent) => HttpUserAgentParser.Parse(userAgent);
        internal static HttpUserAgentInformation CreateForRobot(string userAgent, string robotName)
            => new(userAgent, platform: null, HttpUserAgentType.Robot, robotName, version: null);

        internal static HttpUserAgentInformation CreateForBrowser(string userAgent, HttpUserAgentPlatformInformation? platform, string? browserName, string? browserVersion)
            => new(userAgent, platform, HttpUserAgentType.Browser, browserName, browserVersion);

        internal static HttpUserAgentInformation CreateForUnknown(string userAgent, HttpUserAgentPlatformInformation? platform)
            => new(userAgent, platform, HttpUserAgentType.Unknown, name: null, version: null);
    }
}
