#if STANDALONE
using Microsoft.AspNetCore.SpaServices.StaticFiles;
using Microsoft.Extensions.FileProviders;
using System.Reflection;

namespace LocalShare.Standalone;

/// <summary>
/// Serves the SPA's built assets from resources embedded in the single-file executable,
/// instead of from a physical folder on disk. Used only in Standalone packaging mode.
/// </summary>
internal sealed class EmbeddedSpaStaticFileProvider : ISpaStaticFileProvider
{
    public IFileProvider FileProvider { get; }

    public EmbeddedSpaStaticFileProvider(Assembly assembly, string manifestBaseNamespace)
    {
        FileProvider = new ManifestEmbeddedFileProvider(assembly, manifestBaseNamespace);
    }
}
#endif
