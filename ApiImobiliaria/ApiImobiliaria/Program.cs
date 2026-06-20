using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using ApiImobiliaria.Data;
using ApiImobiliaria.Interfaces;
using ApiImobiliaria.Repositories;
using ApiImobiliaria.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Controllers ──────────────────────────────────────────────────────────────
builder.Services.AddControllers();

// ─── OpenAPI / Swagger ────────────────────────────────────────────────────────
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((doc, _, _) =>
    {
        doc.Info.Title       = "Fabiju Imóveis API";
        doc.Info.Version     = "v1";
        doc.Info.Description = ".NET 10 · SQL Server · Entity Framework Core — Sistema imobiliário profissional";
        return Task.CompletedTask;
    });
});

// ─── Entity Framework + SQL Server ────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sql => sql.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null)
    ));

// ─── Repository Pattern ───────────────────────────────────────────────────────
builder.Services.AddScoped<IImovelRepository, ImovelRepository>();

// ─── Serviço de senha (BCrypt) ────────────────────────────────────────────────
builder.Services.AddSingleton<IPasswordService, PasswordService>();

// ─── JWT Authentication ───────────────────────────────────────────────────────
var jwtConfig = builder.Configuration.GetSection("Jwt");
var secretKey  = Encoding.UTF8.GetBytes(jwtConfig["SecretKey"]!);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtConfig["Issuer"],
            ValidAudience            = jwtConfig["Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(secretKey),
            ClockSkew                = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Admin", policy =>
        policy.RequireClaim("isAdmin", "true"));
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Allow any origin in dev so mobile devices on the LAN can reach the API
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
        else
        {
            policy
                .WithOrigins(
                    "http://localhost:3000",
                    "https://localhost:3000"
                    // Adicione o domínio de produção aqui antes do deploy
                )
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

var app = builder.Build();

// ─── Pipeline ─────────────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("Fabiju Imóveis API")
               .WithTheme(ScalarTheme.DeepSpace)
               .WithDefaultHttpClient(ScalarTarget.JavaScript, ScalarClient.Fetch);
    });

    // Endpoint para gerar hash BCrypt de uma senha — USE UMA VEZ para configurar SenhaHash.
    // Nunca estará disponível em produção (apenas quando ASPNETCORE_ENVIRONMENT=Development).
    app.MapGet("/api/auth/gerar-hash", (string senha) =>
        Results.Ok(new { hash = BCrypt.Net.BCrypt.HashPassword(senha, workFactor: 12) }));
}

// Aplica migrações pendentes automaticamente na inicialização
var startupLogger = app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}
catch (Exception ex)
{
    startupLogger.LogError(ex, "Falha ao executar migrations. A API iniciará sem aplicá-las.");
}

app.UseCors("FrontendPolicy");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
