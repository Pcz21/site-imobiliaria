using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiImobiliaria.Models;

public class Imovel
{
    public int Id { get; set; }

    [Required, MaxLength(300)]
    public string Titulo { get; set; } = "";

    [Required, MaxLength(200)]
    public string Cidade { get; set; } = "";

    [Column(TypeName = "decimal(18,2)")]
    public decimal Preco { get; set; }

    public string Descricao { get; set; } = "";

    // "venda" ou "aluguel"
    [MaxLength(10)]
    public string Tipo { get; set; } = "venda";

    // URL da imagem de capa (compatibilidade com Supabase)
    public string? Imagem { get; set; }

    public string? Capa { get; set; }

    public int Quartos { get; set; }

    public int Banheiros { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? Area { get; set; }

    public int Vagas { get; set; }

    public bool Destaque { get; set; }

    public bool Ativo { get; set; } = true;

    public int Visualizacoes { get; set; }

    [MaxLength(200)]
    public string? CorretorEmail { get; set; }

    [MaxLength(30)]
    public string? Whatsapp { get; set; }

    // Listas serializadas como JSON no banco via value converter no DbContext
    public List<string> Imagens { get; set; } = new();

    public List<string> Videos { get; set; } = new();

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
}
