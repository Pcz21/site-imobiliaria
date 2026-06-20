using System.ComponentModel.DataAnnotations;

namespace ApiImobiliaria.DTOs;

// ─── Resposta ─────────────────────────────────────────────────────────────────
// O que a API retorna ao frontend em qualquer operação de leitura
public class ImovelDto
{
    public int     Id            { get; set; }
    public string  Titulo        { get; set; } = "";
    public string  Cidade        { get; set; } = "";
    public decimal Preco         { get; set; }
    public string  Descricao     { get; set; } = "";
    public string  Tipo          { get; set; } = "venda";
    public string? Imagem        { get; set; }
    public string? Capa          { get; set; }
    public int     Quartos       { get; set; }
    public int     Banheiros     { get; set; }
    public decimal? Area         { get; set; }
    public int     Vagas         { get; set; }
    public bool    Destaque      { get; set; }
    public bool    Ativo         { get; set; }
    public int     Visualizacoes { get; set; }
    public string? CorretorEmail { get; set; }
    public string? Whatsapp      { get; set; }
    public string? Endereco      { get; set; }
    public int     Leads         { get; set; }
    public List<string> Imagens  { get; set; } = new();
    public List<string> Videos   { get; set; } = new();
    public DateTime CriadoEm     { get; set; }
    public DateTime AtualizadoEm { get; set; }
}

// ─── Criação (POST) ───────────────────────────────────────────────────────────
// O que o frontend envia para criar um novo imóvel
public class CriarImovelDto
{
    [Required(ErrorMessage = "Título é obrigatório.")]
    [StringLength(300, ErrorMessage = "Título deve ter no máximo 300 caracteres.")]
    public string Titulo { get; set; } = "";

    [Required(ErrorMessage = "Cidade é obrigatória.")]
    [StringLength(200, ErrorMessage = "Cidade deve ter no máximo 200 caracteres.")]
    public string Cidade { get; set; } = "";

    [Required(ErrorMessage = "Preço é obrigatório.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Preço deve ser maior que zero.")]
    public decimal Preco { get; set; }

    public string Descricao { get; set; } = "";

    [Required(ErrorMessage = "Tipo é obrigatório.")]
    [RegularExpression("^(venda|aluguel)$", ErrorMessage = "Tipo deve ser 'venda' ou 'aluguel'.")]
    public string Tipo { get; set; } = "venda";

    public string? Imagem    { get; set; }

    [Range(0, 99, ErrorMessage = "Quartos deve estar entre 0 e 99.")]
    public int Quartos       { get; set; }

    [Range(0, 99, ErrorMessage = "Banheiros deve estar entre 0 e 99.")]
    public int Banheiros     { get; set; }

    [Range(0, 999999, ErrorMessage = "Área inválida.")]
    public decimal? Area     { get; set; }

    [Range(0, 99, ErrorMessage = "Vagas deve estar entre 0 e 99.")]
    public int Vagas         { get; set; }

    public bool Destaque     { get; set; }

    [EmailAddress(ErrorMessage = "E-mail do corretor inválido.")]
    [StringLength(200)]
    public string? CorretorEmail { get; set; }

    [StringLength(30, ErrorMessage = "WhatsApp deve ter no máximo 30 caracteres.")]
    public string? Whatsapp  { get; set; }

    [StringLength(500)]
    public string? Endereco  { get; set; }

    public List<string> Imagens { get; set; } = new();
    public List<string> Videos  { get; set; } = new();
}

// ─── Atualização (PUT) ────────────────────────────────────────────────────────
// Todos os campos são opcionais — só envia o que precisa atualizar
public class AtualizarImovelDto
{
    [StringLength(300)]
    public string? Titulo    { get; set; }

    [StringLength(200)]
    public string? Cidade    { get; set; }

    [Range(0.01, double.MaxValue, ErrorMessage = "Preço deve ser maior que zero.")]
    public decimal? Preco    { get; set; }

    public string? Descricao { get; set; }

    [RegularExpression("^(venda|aluguel)$", ErrorMessage = "Tipo deve ser 'venda' ou 'aluguel'.")]
    public string? Tipo      { get; set; }

    public string? Imagem    { get; set; }

    [Range(0, 99)]
    public int? Quartos      { get; set; }

    [Range(0, 99)]
    public int? Banheiros    { get; set; }

    [Range(0, 999999)]
    public decimal? Area     { get; set; }

    [Range(0, 99)]
    public int? Vagas        { get; set; }

    public bool? Destaque    { get; set; }
    public bool? Ativo       { get; set; }

    [StringLength(30)]
    public string? Whatsapp  { get; set; }

    [StringLength(500)]
    public string? Endereco  { get; set; }

    public List<string>? Imagens { get; set; }
    public List<string>? Videos  { get; set; }
}
