namespace LocalShare.Utils.UserAgentParser
{
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
