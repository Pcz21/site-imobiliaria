using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ApiImobiliaria.DTOs;
using ApiImobiliaria.Interfaces;
using ApiImobiliaria.Models;

namespace ApiImobiliaria.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class LeadsController : ControllerBase
{
    private readonly ILeadRepository   _repo;
    private readonly IImovelRepository _imoveis;

    // Janela anti-spam: mesmo WhatsApp + mesmo imóvel não pode repetir em 2 min.
    private static readonly TimeSpan JanelaAntiSpam = TimeSpan.FromMinutes(2);

    public LeadsController(ILeadRepository repo, IImovelRepository imoveis)
    {
        _repo    = repo;
        _imoveis = imoveis;
    }

    /// <summary>
    /// Registra um novo lead (interesse em um imóvel). Endpoint público.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(LeadDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<LeadDto>> Criar([FromBody] CriarLeadDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Normaliza o WhatsApp: mantém apenas dígitos
        var whatsapp = SomenteDigitos(dto.Whatsapp);
        if (whatsapp.Length < 10 || whatsapp.Length > 13)
            return BadRequest(new { mensagem = "WhatsApp inválido. Informe DDD + número." });

        var nome = dto.Nome.Trim();
        if (nome.Length < 2)
            return BadRequest(new { mensagem = "Nome deve ter ao menos 2 caracteres." });

        // Se veio vinculado a um imóvel, ele precisa existir e estar ativo
        if (dto.ImovelId.HasValue)
        {
            var imovel = await _imoveis.ObterPorIdAsync(dto.ImovelId.Value);
            if (imovel is null || !imovel.Ativo)
                return NotFound(new { mensagem = "Imóvel não encontrado." });
        }

        // Anti-spam: rejeita envios repetidos do mesmo número para o mesmo imóvel
        if (await _repo.ExisteLeadRecenteAsync(whatsapp, dto.ImovelId, JanelaAntiSpam))
            return StatusCode(StatusCodes.Status429TooManyRequests,
                new { mensagem = "Recebemos seu contato há instantes. Aguarde alguns minutos." });

        var lead = new Lead
        {
            Nome          = nome,
            Whatsapp      = whatsapp,
            Mensagem      = string.IsNullOrWhiteSpace(dto.Mensagem) ? null : dto.Mensagem.Trim(),
            TipoInteresse = dto.TipoInteresse,
            Origem        = string.IsNullOrWhiteSpace(dto.Origem) ? "detalhe_imovel" : dto.Origem,
            Status        = "novo",
            ImovelId      = dto.ImovelId,
            CriadoEm      = DateTime.UtcNow,
        };

        var criado = await _repo.CriarAsync(lead);

        // Mantém o contador de leads do imóvel (KPI já existente no painel)
        if (criado.ImovelId.HasValue)
            await _imoveis.IncrementarLeadsAsync(criado.ImovelId.Value);

        // Resposta mínima — não expõe dados desnecessários ao cliente público
        return StatusCode(StatusCodes.Status201Created, new
        {
            id       = criado.Id,
            status   = criado.Status,
            mensagem = "Recebemos seu interesse! Em breve entraremos em contato."
        });
    }

    /// <summary>
    /// Lista leads com paginação e KPIs. Requer autenticação.
    /// </summary>
    [Authorize]
    [HttpGet]
    [ProducesResponseType(typeof(LeadsPaginaDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LeadsPaginaDto>> Listar(
        [FromQuery] int     pagina   = 1,
        [FromQuery] int     tamanho  = 20,
        [FromQuery] string? status   = null,
        [FromQuery] int?    imovelId = null)
    {
        pagina  = pagina  < 1 ? 1 : pagina;
        tamanho = tamanho is < 1 or > 100 ? 20 : tamanho;

        // Ignora status fora da lista permitida (evita filtro inválido vazio)
        if (status is not null &&
            !Regex.IsMatch(status, "^(novo|atendido|visita_marcada|fechado|arquivado)$"))
            status = null;

        var (itens, total) = await _repo.ListarAsync(pagina, tamanho, status, imovelId);

        return Ok(new LeadsPaginaDto
        {
            Itens          = itens.Select(ToDto).ToList(),
            Total          = total,
            Pagina         = pagina,
            TamanhoPagina  = tamanho,
            TotalNovos     = await _repo.ContarPorStatusAsync("novo"),
            TotalAtendidos = await _repo.ContarPorStatusAsync("atendido"),
        });
    }

    /// <summary>
    /// Atualiza o status de um lead. Requer autenticação.
    /// </summary>
    [Authorize]
    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(LeadDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LeadDto>> AtualizarStatus(int id, [FromBody] AtualizarStatusLeadDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var lead = await _repo.ObterPorIdAsync(id);
        if (lead is null)
            return NotFound(new { mensagem = "Lead não encontrado." });

        lead.Status       = dto.Status;
        lead.AtualizadoEm = DateTime.UtcNow;

        var atualizado = await _repo.AtualizarAsync(lead);
        return Ok(ToDto(atualizado));
    }

    // ─── Helpers ────────────────────────────────────────────────────────────────
    private static string SomenteDigitos(string s) => Regex.Replace(s ?? "", @"\D", "");

    private static LeadDto ToDto(Lead l) => new()
    {
        Id            = l.Id,
        Nome          = l.Nome,
        Whatsapp      = l.Whatsapp,
        Mensagem      = l.Mensagem,
        TipoInteresse = l.TipoInteresse,
        Origem        = l.Origem,
        Status        = l.Status,
        ImovelId      = l.ImovelId,
        ImovelTitulo  = l.Imovel?.Titulo,
        ImovelCidade  = l.Imovel?.Cidade,
        CriadoEm      = l.CriadoEm,
        AtualizadoEm  = l.AtualizadoEm,
    };
}
