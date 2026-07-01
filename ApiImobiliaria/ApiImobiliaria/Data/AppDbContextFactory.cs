using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ApiImobiliaria.Data;

/// <summary>
/// Usado APENAS em design time pelo `dotnet ef` (migrations). Constrói o
/// DbContext sem subir o host completo da aplicação — assim as migrations
/// dependem só da connection string (env ConnectionStrings__DefaultConnection),
/// e não de Jwt/segredos/serviços registrados no Program.cs.
/// Em runtime a aplicação continua usando o DbContext registrado via AddDbContext.
/// </summary>
public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var config = new ConfigurationBuilder()
            .AddEnvironmentVariables()
            .Build();

        var connectionString =
            config.GetConnectionString("DefaultConnection")
            ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException(
                "ConnectionStrings__DefaultConnection nao definido. Exporte a connection string " +
                "antes de rodar `dotnet ef` (ex.: export ConnectionStrings__DefaultConnection='Server=...').");

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new AppDbContext(options);
    }
}
