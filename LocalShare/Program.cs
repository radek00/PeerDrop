using LocalShare.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
builder.Services.AddControllers();
builder.Services.AddSignalR();

var app = builder.Build();
app.UseCors("AllowAll");

app.MapGet("/", async context =>
{
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync("ClientApp/index.html");
});
// Configure the HTTP request pipeline.

app.MapHub<WebRtcSignalingHub>(WebRtcSignalingHub.Url);

app.UseAuthorization();

app.MapControllers();

app.Run();
