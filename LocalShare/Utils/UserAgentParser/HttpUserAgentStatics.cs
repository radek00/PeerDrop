using System.Text.RegularExpressions;

namespace LocalShare.Utils.UserAgentParser
{
    public static class HttpUserAgentStatics
    {
        private const RegexOptions DefaultPlatformsRegexFlags = RegexOptions.IgnoreCase | RegexOptions.Compiled;
        private static Regex CreateDefaultPlatformRegex(string key) => new(Regex.Escape($"{key}"),
            DefaultPlatformsRegexFlags, matchTimeout: TimeSpan.FromMilliseconds(1000));

        public static readonly HashSet<HttpUserAgentPlatformInformation> Platforms =
        [
            new(CreateDefaultPlatformRegex("windows nt 10.0"), "Windows 10", HttpUserAgentPlatformType.Windows, IconType.Desktop),
            new(CreateDefaultPlatformRegex("windows nt 6.3"), "Windows 8.1", HttpUserAgentPlatformType.Windows, IconType.Desktop),
            new(CreateDefaultPlatformRegex("windows nt 6.2"), "Windows 8", HttpUserAgentPlatformType.Windows, IconType.Desktop),
            new(CreateDefaultPlatformRegex("windows nt 6.1"), "Windows 7", HttpUserAgentPlatformType.Windows, IconType.Desktop),
            new(CreateDefaultPlatformRegex("windows nt 6.0"), "Windows Vista", HttpUserAgentPlatformType.Windows, IconType.Desktop),
            new(CreateDefaultPlatformRegex("windows nt 5.2"), "Windows 2003", HttpUserAgentPlatformType.Windows, IconType.Desktop),
            new(CreateDefaultPlatformRegex("windows nt 5.1"), "Windows XP", HttpUserAgentPlatformType.Windows, IconType.Desktop),
            new(CreateDefaultPlatformRegex("windows nt 5.0"), "Windows 2000", HttpUserAgentPlatformType.Windows, IconType.Desktop),
            new(CreateDefaultPlatformRegex("windows nt 4.0"), "Windows NT 4.0", HttpUserAgentPlatformType.Windows, IconType.Desktop),
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
            new(CreateDefaultPlatformRegex("unix"), "Unknown Unix OS", HttpUserAgentPlatformType.Unix, IconType.Desktop)
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
}
