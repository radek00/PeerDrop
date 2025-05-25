using LocalShare.Hubs;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Net.Http.Headers;
using System.Net;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownNetworks.Add(new Microsoft.AspNetCore.HttpOverrides.IPNetwork(IPAddress.Parse("172.18.0.0"), 16)); 
});

builder.Services.AddControllers();

builder.Services.AddSignalR(hubOptions =>
{
    hubOptions.KeepAliveInterval = TimeSpan.FromSeconds(15);
    hubOptions.HandshakeTimeout = TimeSpan.FromSeconds(15);
    hubOptions.EnableDetailedErrors = true;
});

builder.Services.AddSpaStaticFiles(config =>
{
    config.RootPath = "ClientApp/dist";
});

var app = builder.Build();

app.UseForwardedHeaders();

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

app.MapGet("/api/test", (HttpContext context) =>
{
    return Results.Ok(context.Connection.RemoteIpAddress?.ToString() ?? "No IP address found");
});

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
