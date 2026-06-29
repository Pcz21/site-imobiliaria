using System.Text;
using System.Threading.RateLimiting;
using Amazon.Runtime;
using Amazon.S3;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
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
builder.Services.AddScoped<ILeadRepository, LeadRepository>();

// ─── Serviço de senha (BCrypt) ────────────────────────────────────────────────
builder.Services.AddSingleton<IPasswordService, PasswordService>();

// ─── Storage de arquivos (Cloudflare R2 com fallback p/ disco local) ──────────
// Se a seção "R2" estiver totalmente preenchida (Account/Access/Secret/Bucket),
// usa o R2 (compatível com S3). Caso contrário, cai no disco local (dev).
builder.Services.AddHttpContextAccessor();

var r2 = builder.Configuration.GetSection("R2");
var r2Configurado =
    !string.IsNullOrWhiteSpace(r2["AccountId"]) &&
    !string.IsNullOrWhiteSpace(r2["AccessKeyId"]) &&
    !string.IsNullOrWhiteSpace(r2["SecretAccessKey"]) &&
    !string.IsNullOrWhiteSpace(r2["Bucket"]);

if (r2Configurado)
{
    builder.Services.AddSingleton<IAmazonS3>(_ =>
    {
        var cfg = new AmazonS3Config
        {
            ServiceURL           = $"https://{r2["AccountId"]}.r2.cloudflarestorage.com",
            ForcePathStyle       = true,
            AuthenticationRegion = "auto",
            // O R2 rejeita os checksums automáticos (CRC) que o SDK v4 adiciona por padrão.
            RequestChecksumCalculation = RequestChecksumCalculation.WHEN_REQUIRED,
            ResponseChecksumValidation = ResponseChecksumValidation.WHEN_REQUIRED,
        };
        return new AmazonS3Client(r2["AccessKeyId"], r2["SecretAccessKey"], cfg);
    });
    builder.Services.AddScoped<IStorageService, R2StorageService>();
}
else
{
    builder.Services.AddScoped<IStorageService, LocalDiskStorageService>();
}

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

builder.Services.AddAuthorization();

// ─── Rate Limiting ──────────────────────────────────────────────────────────────
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Política "login": no máximo 5 tentativas por minuto por IP
    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "desconhecido",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window      = TimeSpan.FromMinutes(1),
            }));
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
            // Origens de produção via variável de ambiente / configuração.
            // Ex.: CORS_ALLOWED_ORIGINS="https://fabijuimoveis.com.br,https://www.fabijuimoveis.com.br"
            var allowedOrigins = (builder.Configuration["Cors:AllowedOrigins"]
                ?? Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS")
                ?? "http://localhost:3000;https://localhost:3000")
                .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            policy
                .WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod();
        }
    });
});

// ─── Forwarded Headers (API atrás do Nginx/Next) ──────────────────────────────
// Faz a API enxergar o IP e o protocolo REAIS do cliente via X-Forwarded-For/Proto.
// Sem isso, atrás do proxy todo request pareceria vir de 127.0.0.1 e o rate-limit
// de login ficaria global. Loopback (127.0.0.1/::1) já é proxy confiável por padrão.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
});

var app = builder.Build();

// ─── Pipeline ─────────────────────────────────────────────────────────────────
// Forwarded headers PRIMEIRO — para todo o restante já operar com IP/proto reais.
app.UseForwardedHeaders();

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
else
{
    // HSTS — força HTTPS no navegador em produção
    app.UseHsts();
}

app.UseCors("FrontendPolicy");
app.UseHttpsRedirection();

// Serve arquivos de /uploads/ sem autenticação (URLs públicas das imagens)
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");
Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath  = "/uploads",
});

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();

app.Run();
