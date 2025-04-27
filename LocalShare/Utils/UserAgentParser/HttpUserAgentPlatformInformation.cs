using System.Text.RegularExpressions;

namespace LocalShare.Utils.UserAgentParser
{
    public readonly struct HttpUserAgentPlatformInformation
    {
        public Regex Regex { get; }
        public string Name { get; }
        public HttpUserAgentPlatformType PlatformType { get; }
        public IconType Icon { get; }

        public HttpUserAgentPlatformInformation()
        {
            Regex = new Regex("");
            Name = "Unknown";
            PlatformType = HttpUserAgentPlatformType.Unknown;
            Icon = IconType.Desktop;
        }

        public HttpUserAgentPlatformInformation(Regex regex, string name, HttpUserAgentPlatformType platformType, IconType icon)
        {
            Regex = regex;
            Name = name;
            PlatformType = platformType;
            Icon = icon;
        }
    }
}
