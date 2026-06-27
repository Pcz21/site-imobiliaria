using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ApiImobiliaria.Services;

namespace ApiImobiliaria.Controllers;

[ApiController]
[Route("api/uploads")]
[Authorize]
public class UploadController : ControllerBase
{
    private const long LimiteImagem = 10L * 1024 * 1024;  // 10 MB
    private const long LimiteVideo  = 50L * 1024 * 1024;  // 50 MB

    private static readonly HashSet<string> ExtensoesImagem = [".jpg", ".jpeg", ".png", ".webp"];
    private static readonly HashSet<string> ExtensoesVideo  = [".mp4", ".mov"];

    private readonly IStorageService _storage;

    public UploadController(IStorageService storage)
    {
        _storage = storage;
    }

    [HttpPost("imoveis")]
    public async Task<IActionResult> UploadImovel(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { erro = "Arquivo inválido ou vazio." });

        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

        var ehImagem = ExtensoesImagem.Contains(ext);
        var ehVideo  = ExtensoesVideo.Contains(ext);

        if (!ehImagem && !ehVideo)
            return BadRequest(new { erro = $"Extensão '{ext}' não permitida. Use: .jpg, .jpeg, .png, .webp, .mp4, .mov" });

        if (ehImagem && file.Length > LimiteImagem)
            return BadRequest(new { erro = $"Imagem excede o limite de 10 MB." });

        if (ehVideo && file.Length > LimiteVideo)
            return BadRequest(new { erro = $"Vídeo excede o limite de 50 MB." });

        // Um único stream (seekable) para validar e enviar.
        await using var conteudo = file.OpenReadStream();

        // Validação de conteúdo (magic bytes) — impede arquivo malicioso com extensão forjada
        var cabecalho = new byte[12];
        var lidos = await conteudo.ReadAsync(cabecalho.AsMemory(0, 12), ct);
        if (lidos < 12) Array.Resize(ref cabecalho, lidos);

        if (!AssinaturaConfere(cabecalho, ext))
            return BadRequest(new { erro = "O conteúdo do arquivo não corresponde à extensão informada." });

        // Rebobina para o upload ler desde o início
        if (conteudo.CanSeek) conteudo.Position = 0;

        // Nome único via Guid, sob o prefixo "imoveis/"
        var chave = $"imoveis/{Guid.NewGuid()}{ext}";

        var contentType = string.IsNullOrWhiteSpace(file.ContentType)
            ? "application/octet-stream"
            : file.ContentType;

        var url = await _storage.SalvarAsync(conteudo, chave, contentType, ct);
        return Ok(new { url });
    }

    // ─── Validação de assinatura binária (magic bytes) ──────────────────────────
    private static bool AssinaturaConfere(byte[] b, string ext) => ext switch
    {
        ".jpg" or ".jpeg" => Comeca(b, 0xFF, 0xD8, 0xFF),
        ".png"            => Comeca(b, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A),
        ".webp"           => b.Length >= 12
                              && Comeca(b, 0x52, 0x49, 0x46, 0x46)                         // "RIFF"
                              && b[8] == 0x57 && b[9] == 0x45 && b[10] == 0x42 && b[11] == 0x50, // "WEBP"
        ".mp4" or ".mov"  => b.Length >= 8 && AtomMp4(b),
        _                 => false,
    };

    private static bool Comeca(byte[] b, params byte[] sig)
    {
        if (b.Length < sig.Length) return false;
        for (var i = 0; i < sig.Length; i++)
            if (b[i] != sig[i]) return false;
        return true;
    }

    // Caixas (atoms) ISO-BMFF válidas no offset 4: ftyp, moov, mdat, free, skip, wide
    private static bool AtomMp4(byte[] b)
    {
        var atom = System.Text.Encoding.ASCII.GetString(b, 4, 4);
        return atom is "ftyp" or "moov" or "mdat" or "free" or "skip" or "wide";
    }
}