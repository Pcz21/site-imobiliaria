using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ApiImobiliaria.Models;

/// <summary>
/// Lead captado pelo formulário de interesse de um imóvel.
/// </summary>
public class Lead
{
    public int Id { get; set; }

    [Required, MaxLength(150)]
    public string Nome { get; set; } = "";

    // Apenas dígitos — normalizado antes de salvar (ex.: "5511999998888")
    [Required, MaxLength(20)]
    public string Whatsapp { get; set; } = "";

    [MaxLength(1000)]
    public string? Mensagem { get; set; }

    // "visitar" | "informacoes" | "negociar" | "financiamento"
    [Required, MaxLength(30)]
    public string TipoInteresse { get; set; } = "informacoes";

    // Origem do lead — ex.: "detalhe_imovel"
    [MaxLength(40)]
    public string Origem { get; set; } = "detalhe_imovel";

    // "novo" | "atendido" | "visita_marcada" | "fechado" | "arquivado"
    [MaxLength(20)]
    public string Status { get; set; } = "novo";

    // Imóvel relacionado (opcional — leads genéricos podem não ter imóvel)
    public int? ImovelId { get; set; }

    [ForeignKey(nameof(ImovelId))]
    public Imovel? Imovel { get; set; }

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    public DateTime? AtualizadoEm { get; set; }
}
