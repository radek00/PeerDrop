#if STANDALONE
namespace LocalShare.Standalone;

/// <summary>
/// Configuration for Standalone mode (single-file executable).
/// </summary>
internal static class StandaloneConfig
{
    private const int DefaultHttpsPort = 5443;

    /// <summary>
    /// Gets the HTTPS port for the Kestrel server in Standalone mode.
    /// </summary>
    public static int GetHttpsPort()
    {
        var portStr = Environment.GetEnvironmentVariable("PEERDROP_HTTPS_PORT");
        if (int.TryParse(portStr, out var port) && port > 0 && port <= 65535)
        {
            return port;
        }

        return DefaultHttpsPort;
    }
}
#endif
