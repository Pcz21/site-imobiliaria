using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using ApiImobiliaria.Models;
using System.Text.Json;

namespace ApiImobiliaria.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Imovel>   Imoveis    { get; set; }
    public DbSet<Corretor> Corretores { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var jsonOptions = new JsonSerializerOptions();

        // Comparer necessário para o EF detectar mudanças em List<string>
        var listaStringComparer = new ValueComparer<List<string>>(
            (a, b) => JsonSerializer.Serialize(a, jsonOptions) == JsonSerializer.Serialize(b, jsonOptions),
            v => v.Aggregate(0, (acc, s) => HashCode.Combine(acc, s.GetHashCode())),
            v => v.ToList()
        );

        modelBuilder.Entity<Corretor>(entity =>
        {
            entity.ToTable("Corretores");
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.SenhaHash).IsRequired();
            entity.Property(e => e.IsAdmin).HasDefaultValue(false);
            entity.Property(e => e.EmailVerificado).HasDefaultValue(true);
        });

        modelBuilder.Entity<Imovel>(entity =>
        {
            entity.ToTable("Imoveis");

            entity.HasKey(e => e.Id);

            // Índices para buscas comuns
            entity.HasIndex(e => e.Cidade);
            entity.HasIndex(e => e.Tipo);
            entity.HasIndex(e => e.CorretorEmail);
            entity.HasIndex(e => e.Ativo);
            entity.HasIndex(e => e.CriadoEm);

            // List<string> → JSON (nvarchar(max)) — compatível com qualquer SQL Server
            entity.Property(e => e.Imagens)
                .HasColumnType("nvarchar(max)")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, jsonOptions),
                    v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>()
                )
                .Metadata.SetValueComparer(listaStringComparer);

            entity.Property(e => e.Videos)
                .HasColumnType("nvarchar(max)")
                .HasConversion(
                    v => JsonSerializer.Serialize(v, jsonOptions),
                    v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>()
                )
                .Metadata.SetValueComparer(listaStringComparer);
        });
    }
}
