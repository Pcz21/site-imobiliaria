using ApiImobiliaria.Models;

namespace ApiImobiliaria.Interfaces;

public interface ILeadRepository
{
    /// <summary>
    /// Persiste um novo lead e retorna com o Id gerado.
    /// </summary>
    Task<Lead> CriarAsync(Lead lead);

    /// <summary>
    /// Indica se já existe um lead do mesmo WhatsApp para o mesmo imóvel
    /// dentro da janela informada (anti-spam).
    /// </summary>
    Task<bool> ExisteLeadRecenteAsync(string whatsapp, int? imovelId, TimeSpan janela);

    /// <summary>
    /// Lista leads (mais recentes primeiro) com paginação e filtro opcional de status.
    /// Inclui o imóvel relacionado para exibição no painel.
    /// </summary>
    Task<(List<Lead> Itens, int Total)> ListarAsync(
        int pagina, int tamanhoPagina, string? status = null, int? imovelId = null);

    /// <summary>
    /// Conta leads por status (para os KPIs do painel).
    /// </summary>
    Task<int> ContarPorStatusAsync(string status);

    /// <summary>
    /// Retorna um lead pelo Id.
    /// </summary>
    Task<Lead?> ObterPorIdAsync(int id);

    /// <summary>
    /// Salva as alterações de um lead existente.
    /// </summary>
    Task<Lead> AtualizarAsync(Lead lead);
}
