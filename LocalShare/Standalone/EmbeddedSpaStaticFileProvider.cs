#if STANDALONE
using Microsoft.AspNetCore.SpaServices.StaticFiles;
using Microsoft.Extensions.FileProviders;
using System.Reflection;

namespace LocalShare.Standalone;
internal sealed class EmbeddedSpaStaticFileProvider : ISpaStaticFileProvider
{
    public IFileProvider FileProvider { get; }

    public EmbeddedSpaStaticFileProvider(Assembly assembly, string manifestBaseNamespace)
    {
        FileProvider = new ManifestEmbeddedFileProvider(assembly, manifestBaseNamespace);
    }
}
#endif
