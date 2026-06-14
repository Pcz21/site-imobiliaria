using Microsoft.EntityFrameworkCore;
using ApiImobiliaria.Data;
using ApiImobiliaria.Interfaces;
using ApiImobiliaria.Models;

namespace ApiImobiliaria.Repositories;

public class ImovelRepository : IImovelRepository
{
    private readonly AppDbContext _db;

    public ImovelRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Imovel>> BuscarAsync(
        string? tipo        = null,
        string? cidade      = null,
        string? busca       = null,
        int?    quartos     = null,
        decimal? precoMax   = null,
        string? corretorEmail = null,
        string  ordenacao   = "recentes")
    {
        var query = _db.Imoveis
            .Where(i => i.Ativo)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(tipo))
            query = query.Where(i => i.Tipo == tipo);

        if (!string.IsNullOrWhiteSpace(cidade))
            query = query.Where(i => i.Cidade.Contains(cidade));

        if (!string.IsNullOrWhiteSpace(busca))
            query = query.Where(i =>
                i.Titulo.Contains(busca)   ||
                i.Cidade.Contains(busca)   ||
                i.Descricao.Contains(busca));

        if (quartos.HasValue)
            query = query.Where(i => i.Quartos >= quartos.Value);

        if (precoMax.HasValue)
            query = query.Where(i => i.Preco <= precoMax.Value);

        if (!string.IsNullOrWhiteSpace(corretorEmail))
            query = query.Where(i => i.CorretorEmail == corretorEmail);

        query = ordenacao switch
        {
            "menor-preco"  => query.OrderBy(i => i.Preco),
            "maior-preco"  => query.OrderByDescending(i => i.Preco),
            _              => query.OrderByDescending(i => i.CriadoEm)
        };

        return await query.AsNoTracking().ToListAsync();
    }

    public async Task<Imovel?> ObterPorIdAsync(int id)
        => await _db.Imoveis.FindAsync(id);

    public async Task<Imovel> CriarAsync(Imovel imovel)
    {
        _db.Imoveis.Add(imovel);
        await _db.SaveChangesAsync();
        return imovel;
    }

    public async Task<Imovel> AtualizarAsync(Imovel imovel)
    {
        _db.Imoveis.Update(imovel);
        await _db.SaveChangesAsync();
        return imovel;
    }

    public async Task RemoverAsync(Imovel imovel)
    {
        imovel.Ativo = false;
        imovel.AtualizadoEm = DateTime.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task IncrementarVisualizacoesAsync(int id)
    {
        await _db.Imoveis
            .Where(i => i.Id == id)
            .ExecuteUpdateAsync(s =>
                s.SetProperty(i => i.Visualizacoes, i => i.Visualizacoes + 1));
    }

    public async Task IncrementarLeadsAsync(int id)
    {
        await _db.Imoveis
            .Where(i => i.Id == id)
            .ExecuteUpdateAsync(s =>
                s.SetProperty(i => i.Leads, i => i.Leads + 1));
    }
}
