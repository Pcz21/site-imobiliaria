using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ApiImobiliaria.DTOs;
using ApiImobiliaria.Interfaces;
using ApiImobiliaria.Models;

namespace ApiImobiliaria.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class ImoveisController : ControllerBase
{
    private readonly IImovelRepository _repo;

    public ImoveisController(IImovelRepository repo)
    {
        _repo = repo;
    }

    /// <summary>
    /// Lista imóveis ativos com filtros e ordenação opcionais.
    /// </summary>
    /// <param name="tipo">Filtrar por tipo: "venda" ou "aluguel"</param>
    /// <param name="cidade">Filtrar por cidade (busca parcial)</param>
    /// <param name="busca">Busca no título, cidade e descrição</param>
    /// <param name="quartos">Mínimo de quartos</param>
    /// <param name="precoMax">Preço máximo</param>
    /// <param name="corretorEmail">Filtrar por e-mail do corretor</param>
    /// <param name="ordenacao">recentes | menor-preco | maior-preco</param>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<ImovelDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IEnumerable<ImovelDto>>> GetAll(
        [FromQuery] string? tipo,
        [FromQuery] string? cidade,
        [FromQuery] string? busca,
        [FromQuery] int?    quartos,
        [FromQuery] decimal? precoMax,
        [FromQuery] string? corretorEmail,
        [FromQuery] string  ordenacao = "recentes")
    {
        var imoveis = await _repo.BuscarAsync(
            tipo, cidade, busca, quartos, precoMax, corretorEmail, ordenacao);

        return Ok(imoveis.Select(ToDto));
    }

    /// <summary>
    /// Retorna os detalhes de um imóvel e incrementa as visualizações.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ImovelDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ImovelDto>> GetById(int id)
    {
        var imovel = await _repo.ObterPorIdAsync(id);

        if (imovel is null || !imovel.Ativo)
            return NotFound(new { mensagem = "Imóvel não encontrado." });

        await _repo.IncrementarVisualizacoesAsync(id);

        return Ok(ToDto(imovel));
    }

    /// <summary>
    /// Cria um novo imóvel.
    /// </summary>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(ImovelDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<ImovelDto>> Create([FromBody] CriarImovelDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // E-mail sempre vem do JWT — não confiamos no que o cliente envia
        var emailCorretor = User.FindFirstValue(ClaimTypes.Email);

        var imovel = new Imovel
        {
            Titulo        = dto.Titulo,
            Cidade        = dto.Cidade,
            Preco         = dto.Preco,
            Descricao     = dto.Descricao,
            Tipo          = dto.Tipo,
            Imagem        = dto.Imagem,
            Capa          = dto.Imagens.Count > 0 ? dto.Imagens[0] : dto.Imagem,
            Quartos       = dto.Quartos,
            Banheiros     = dto.Banheiros,
            Area          = dto.Area,
            Vagas         = dto.Vagas,
            Destaque      = dto.Destaque,
            CorretorEmail = emailCorretor,
            Whatsapp      = dto.Whatsapp,
            Imagens       = dto.Imagens,
            Videos        = dto.Videos,
            Ativo         = true,
            Visualizacoes = 0,
            CriadoEm      = DateTime.UtcNow,
            AtualizadoEm  = DateTime.UtcNow,
        };

        var criado = await _repo.CriarAsync(imovel);

        return CreatedAtAction(nameof(GetById), new { id = criado.Id }, ToDto(criado));
    }

    /// <summary>
    /// Atualiza parcialmente um imóvel (apenas os campos enviados).
    /// </summary>
    [Authorize]
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ImovelDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ImovelDto>> Update(int id, [FromBody] AtualizarImovelDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var imovel = await _repo.ObterPorIdAsync(id);

        if (imovel is null)
            return NotFound(new { mensagem = "Imóvel não encontrado." });

        if (dto.Titulo     is not null) imovel.Titulo     = dto.Titulo;
        if (dto.Cidade     is not null) imovel.Cidade     = dto.Cidade;
        if (dto.Preco.HasValue)         imovel.Preco      = dto.Preco.Value;
        if (dto.Descricao  is not null) imovel.Descricao  = dto.Descricao;
        if (dto.Tipo       is not null) imovel.Tipo       = dto.Tipo;
        if (dto.Imagem     is not null) imovel.Imagem     = dto.Imagem;
        if (dto.Quartos.HasValue)       imovel.Quartos    = dto.Quartos.Value;
        if (dto.Banheiros.HasValue)     imovel.Banheiros  = dto.Banheiros.Value;
        if (dto.Area.HasValue)          imovel.Area       = dto.Area.Value;
        if (dto.Vagas.HasValue)         imovel.Vagas      = dto.Vagas.Value;
        if (dto.Destaque.HasValue)      imovel.Destaque   = dto.Destaque.Value;
        if (dto.Ativo.HasValue)         imovel.Ativo      = dto.Ativo.Value;
        if (dto.Whatsapp   is not null) imovel.Whatsapp   = dto.Whatsapp;
        if (dto.Imagens    is not null)
        {
            imovel.Imagens = dto.Imagens;
            imovel.Capa    = dto.Imagens.Count > 0 ? dto.Imagens[0] : imovel.Capa;
        }
        if (dto.Videos is not null) imovel.Videos = dto.Videos;

        imovel.AtualizadoEm = DateTime.UtcNow;

        var atualizado = await _repo.AtualizarAsync(imovel);
        return Ok(ToDto(atualizado));
    }

    /// <summary>
    /// Remove um imóvel (soft delete — marca como inativo).
    /// </summary>
    [Authorize]
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        var imovel = await _repo.ObterPorIdAsync(id);

        if (imovel is null)
            return NotFound(new { mensagem = "Imóvel não encontrado." });

        await _repo.RemoverAsync(imovel);
        return NoContent();
    }

    // ─── Mapeamento interno ────────────────────────────────────────────────────
    private static ImovelDto ToDto(Imovel i) => new()
    {
        Id            = i.Id,
        Titulo        = i.Titulo,
        Cidade        = i.Cidade,
        Preco         = i.Preco,
        Descricao     = i.Descricao,
        Tipo          = i.Tipo,
        Imagem        = i.Imagem,
        Capa          = i.Capa,
        Quartos       = i.Quartos,
        Banheiros     = i.Banheiros,
        Area          = i.Area,
        Vagas         = i.Vagas,
        Destaque      = i.Destaque,
        Ativo         = i.Ativo,
        Visualizacoes = i.Visualizacoes,
        CorretorEmail = i.CorretorEmail,
        Whatsapp      = i.Whatsapp,
        Imagens       = i.Imagens,
        Videos        = i.Videos,
        CriadoEm      = i.CriadoEm,
        AtualizadoEm  = i.AtualizadoEm,
    };
}
