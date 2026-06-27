using Microsoft.EntityFrameworkCore;
using ApiImobiliaria.Data;
using ApiImobiliaria.Interfaces;
using ApiImobiliaria.Models;

namespace ApiImobiliaria.Repositories;

public class LeadRepository : ILeadRepository
{
    private readonly AppDbContext _db;

    public LeadRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Lead> CriarAsync(Lead lead)
    {
        _db.Leads.Add(lead);
        await _db.SaveChangesAsync();
        return lead;
    }

    public async Task<bool> ExisteLeadRecenteAsync(string whatsapp, int? imovelId, TimeSpan janela)
    {
        var limite = DateTime.UtcNow - janela;
        return await _db.Leads
            .AsNoTracking()
            .AnyAsync(l =>
                l.Whatsapp == whatsapp &&
                l.ImovelId == imovelId &&
                l.CriadoEm >= limite);
    }

    public async Task<(List<Lead> Itens, int Total)> ListarAsync(
        int pagina, int tamanhoPagina, string? status = null, int? imovelId = null)
    {
        var query = _db.Leads.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(l => l.Status == status);

        if (imovelId.HasValue)
            query = query.Where(l => l.ImovelId == imovelId.Value);

        var total = await query.CountAsync();

        var itens = await query
            .OrderByDescending(l => l.CriadoEm)
            .Skip((pagina - 1) * tamanhoPagina)
            .Take(tamanhoPagina)
            .Include(l => l.Imovel)
            .ToListAsync();

        return (itens, total);
    }

    public async Task<int> ContarPorStatusAsync(string status)
        => await _db.Leads.AsNoTracking().CountAsync(l => l.Status == status);

    public async Task<Lead?> ObterPorIdAsync(int id)
        => await _db.Leads.FindAsync(id);

    public async Task<Lead> AtualizarAsync(Lead lead)
    {
        _db.Leads.Update(lead);
        await _db.SaveChangesAsync();
        return lead;
    }
}
