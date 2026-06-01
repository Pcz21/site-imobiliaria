using ApiImobiliaria.Models;

namespace ApiImobiliaria.Interfaces;

public interface IImovelRepository
{
    /// <summary>
    /// Busca imóveis ativos com filtros e ordenação.
    /// </summary>
    Task<IEnumerable<Imovel>> BuscarAsync(
        string? tipo        = null,
        string? cidade      = null,
        string? busca       = null,
        int?    quartos     = null,
        decimal? precoMax   = null,
        string? corretorEmail = null,
        string  ordenacao   = "recentes");

    /// <summary>
    /// Retorna um imóvel pelo ID (apenas ativos).
    /// </summary>
    Task<Imovel?> ObterPorIdAsync(int id);

    /// <summary>
    /// Persiste um novo imóvel e retorna com o Id gerado.
    /// </summary>
    Task<Imovel> CriarAsync(Imovel imovel);

    /// <summary>
    /// Salva as alterações em um imóvel existente.
    /// </summary>
    Task<Imovel> AtualizarAsync(Imovel imovel);

    /// <summary>
    /// Soft delete: marca o imóvel como inativo.
    /// </summary>
    Task RemoverAsync(Imovel imovel);

    /// <summary>
    /// Incrementa o contador de visualizações.
    /// </summary>
    Task IncrementarVisualizacoesAsync(int id);
}
