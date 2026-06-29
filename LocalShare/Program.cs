using LocalShare.Hubs;
using Microsoft.AspNetCore.SpaServices.StaticFiles;
using Microsoft.Net.Http.Headers;


#if STANDALONE
using LocalShare.Standalone;
#endif

var builder = WebApplication.CreateBuilder(args);

#if !STANDALONE
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto | ForwardedHeaders.XForwardedHost;

    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();

    // Trust all private networks commonly used by Docker
    options.KnownIPNetworks.Add(new System.Net.IPNetwork(IPAddress.Parse("10.0.0.0"), 8));
    options.KnownIPNetworks.Add(new System.Net.IPNetwork(IPAddress.Parse("172.16.0.0"), 12));
});
#endif

builder.Services.AddControllers();

builder.Services.AddSignalR(hubOptions =>
{
    hubOptions.KeepAliveInterval = TimeSpan.FromSeconds(15);
    hubOptions.HandshakeTimeout = TimeSpan.FromSeconds(15);
    hubOptions.EnableDetailedErrors = true;
});

#if STANDALONE
builder.Services.AddSingleton<ISpaStaticFileProvider>(_ =>
    new EmbeddedSpaStaticFileProvider(typeof(Program).Assembly, "ClientApp/dist"));

builder.WebHost.ConfigureKestrel((context, serverOptions) =>
{
    serverOptions.ListenAnyIP(5443);
});
#else
builder.Services.AddSpaStaticFiles(config =>
{
    config.RootPath = "ClientApp/dist";
});
#endif

var app = builder.Build();
#if !STANDALONE
app.UseForwardedHeaders();
#endif

app.UseSpaStaticFiles(new StaticFileOptions()
{
    OnPrepareResponse = ctx =>
    {
        var headers = ctx.Context.Response.GetTypedHeaders();
        headers.CacheControl = new CacheControlHeaderValue
        {
            Public = true,
            MaxAge = TimeSpan.FromDays(400)
        };
    }
});

app.UseSpa(config =>
{
    config.Options.SourcePath = "ClientApp";
});

app.MapHub<WebRtcSignallingHub>($"/signalr{WebRtcSignallingHub.Url}");


app.UseAuthorization();

app.MapControllers();

app.Run();