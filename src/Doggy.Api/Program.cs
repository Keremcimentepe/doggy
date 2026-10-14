var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

// Behind Caddy the public path is /api/health; Caddy strips the /api prefix.
app.MapGet("/health", () => Results.Ok(new HealthResponse("ok")));

app.Run();

public sealed record HealthResponse(string Status);

// Lets WebApplicationFactory<Program> in the test project reach the entry point.
public partial class Program { }
