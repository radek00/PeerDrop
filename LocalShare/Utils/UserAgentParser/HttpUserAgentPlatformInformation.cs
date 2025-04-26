using System.Text.RegularExpressions;
// Ensure IconType enum is accessible

namespace LocalShare.Utils.UserAgentParser
{
    public readonly struct HttpUserAgentPlatformInformation(Regex regex, string name, HttpUserAgentPlatformType platformType, IconType icon)
    {
        public Regex Regex { get; } = regex;
        public string Name { get; } = name;
        public HttpUserAgentPlatformType PlatformType { get; } = platformType;
        public IconType Icon { get; } = icon;
    }
}
