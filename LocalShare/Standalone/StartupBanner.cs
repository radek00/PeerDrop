#if STANDALONE
using System.Security.Cryptography.X509Certificates;

namespace LocalShare.Standalone;

/// <summary>
/// Displays startup information for Standalone mode execution.
/// </summary>
internal static class StartupBanner
{
    /// <summary>
    /// Prints startup banner with certificate and access information.
    /// </summary>
    /// <param name="certificate">The X509Certificate2 being used by the server.</param>
    /// <param name="httpsPort">The HTTPS port the server is listening on.</param>
    public static void Print(X509Certificate2 certificate, int httpsPort)
    {
        var certThumbprint = certificate.Thumbprint;
        var certSubject = certificate.Subject;

        Console.WriteLine();
        Console.WriteLine("╔═══════════════════════════════════════════════════════════╗");
        Console.WriteLine("║                    PeerDrop Standalone                      ║");
        Console.WriteLine("╚═══════════════════════════════════════════════════════════╝");
        Console.WriteLine();
        Console.WriteLine($"🔒 Server is running with HTTPS on port {httpsPort}");
        Console.WriteLine($"📍 Access at: https://localhost:{httpsPort}");
        Console.WriteLine();
        Console.WriteLine("Certificate Information:");
        Console.WriteLine($"  Subject:   {certSubject}");
        Console.WriteLine($"  Thumbprint: {certThumbprint}");
        Console.WriteLine();
        Console.WriteLine("⚠️  Using self-signed certificate. Your browser may show a security warning.");
        Console.WriteLine("   This is normal for local development.");
        Console.WriteLine();
    }
}
#endif
