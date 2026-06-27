using System.ComponentModel.DataAnnotations;

namespace ApiImobiliaria.DTOs;

// ─── Criação (POST público) ─────────────────────────────────────────────────────
// O que o frontend envia ao registrar interesse em um imóvel.
public class CriarLeadDto
{
    [Required(ErrorMessage = "Nome é obrigatório.")]
    [StringLength(150, MinimumLength = 2, ErrorMessage = "Nome deve ter entre 2 e 150 caracteres.")]
    public string Nome { get; set; } = "";

    [Required(ErrorMessage = "WhatsApp é obrigatório.")]
    [StringLength(20, ErrorMessage = "WhatsApp inválido.")]
    public string Whatsapp { get; set; } = "";

    [StringLength(1000, ErrorMessage = "Mensagem deve ter no máximo 1000 caracteres.")]
    public string? Mensagem { get; set; }

    [Required(ErrorMessage = "Tipo de interesse é obrigatório.")]
    [RegularExpression("^(visitar|informacoes|negociar|financiamento)$",
        ErrorMessage = "Tipo de interesse inválido.")]
    public string TipoInteresse { get; set; } = "informacoes";

    // Opcional — quando o lead parte da página de um imóvel.
    public int? ImovelId { get; set; }

    // Opcional — definido pelo cliente, mas validado/normalizado no servidor.
    [RegularExpression("^(detalhe_imovel|listagem|home|alerta)$",
        ErrorMessage = "Origem inválida.")]
    public string? Origem { get; set; }
}

// ─── Resposta (GET protegido) ────────────────────────────────────────────────────
public class LeadDto
{
    public int      Id            { get; set; }
    public string   Nome          { get; set; } = "";
    public string   Whatsapp      { get; set; } = "";
    public string?  Mensagem      { get; set; }
    public string   TipoInteresse { get; set; } = "";
    public string   Origem        { get; set; } = "";
    public string   Status        { get; set; } = "";
    public int?     ImovelId      { get; set; }
    public string?  ImovelTitulo  { get; set; }
    public string?  ImovelCidade  { get; set; }
    public DateTime CriadoEm      { get; set; }
    public DateTime? AtualizadoEm { get; set; }
}

// ─── Atualização de status (PATCH protegido) ─────────────────────────────────────
public class AtualizarStatusLeadDto
{
    [Required(ErrorMessage = "Status é obrigatório.")]
    [RegularExpression("^(novo|atendido|visita_marcada|fechado|arquivado)$",
        ErrorMessage = "Status inválido.")]
    public string Status { get; set; } = "";
}

// ─── Resposta paginada da listagem administrativa ───────────────────────────────
public class LeadsPaginaDto
{
    public List<LeadDto> Itens          { get; set; } = new();
    public int           Total          { get; set; }
    public int           Pagina         { get; set; }
    public int           TamanhoPagina  { get; set; }
    public int           TotalNovos     { get; set; }
    public int           TotalAtendidos { get; set; }
}
