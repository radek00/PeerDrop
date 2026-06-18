#if STANDALONE
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;

namespace LocalShare.Standalone;

/// <summary>
/// Provisions and manages self-signed certificates for Standalone mode.
/// Generates certificates on first use and persists them in the local app data directory.
/// </summary>
internal static class CertificateProvisioner
{
    /// <summary>
    /// Gets an existing certificate or creates a new self-signed certificate if one doesn't exist.
    /// </summary>
    /// <param name="certPath">Full path to the certificate file (PFX format).</param>
    /// <returns>An X509Certificate2 instance ready for use by Kestrel.</returns>
    public static X509Certificate2 GetOrCreate(string certPath)
    {
        if (File.Exists(certPath))
        {
            try
            {
                var certData = File.ReadAllBytes(certPath);
                return X509CertificateLoader.LoadPkcs12(certData, null, X509KeyStorageFlags.Exportable);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to load certificate from {certPath}", ex);
            }
        }

        return CreateAndSaveSelfSignedCert(certPath);
    }

    private static X509Certificate2 CreateAndSaveSelfSignedCert(string certPath)
    {
        // Ensure directory exists
        var directory = Path.GetDirectoryName(certPath);
        if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
        {
            Directory.CreateDirectory(directory);
        }

        // Generate a self-signed certificate
        using var rsa = RSA.Create(2048);
        var certificateRequest = new CertificateRequest(
            "CN=localhost",
            rsa,
            HashAlgorithmName.SHA256,
            RSASignaturePadding.Pkcs1);

        // Add Subject Alternative Name extension for localhost
        var sanBuilder = new SubjectAlternativeNameBuilder();
        sanBuilder.AddDnsName("localhost");
        sanBuilder.AddDnsName("*.localhost");
        var sanExtension = sanBuilder.Build();
        certificateRequest.CertificateExtensions.Add(sanExtension);

        using var cert = certificateRequest.CreateSelfSigned(
            DateTimeOffset.UtcNow,
            DateTimeOffset.UtcNow.AddYears(10));

        // Export to PFX format and save
        var pfxBytes = cert.Export(X509ContentType.Pfx);
        File.WriteAllBytes(certPath, pfxBytes);

        // Return a new instance for use
        return X509CertificateLoader.LoadPkcs12(pfxBytes, null);
    }
}
#endif
