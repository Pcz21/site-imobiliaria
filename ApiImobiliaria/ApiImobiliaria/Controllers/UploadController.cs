using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

    private readonly IWebHostEnvironment _env;

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost("imoveis")]
    public async Task<IActionResult> UploadImovel(IFormFile file)
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

        // Garante que a pasta existe
        var pasta = Path.Combine(_env.ContentRootPath, "uploads", "imoveis");
        Directory.CreateDirectory(pasta);

        // Nome único via Guid
        var nome    = $"{Guid.NewGuid()}{ext}";
        var caminho = Path.Combine(pasta, nome);

        await using var stream = new FileStream(caminho, FileMode.Create);
        await file.CopyToAsync(stream);

        // URL dinâmica — funciona em localhost e produção
        var url = $"{Request.Scheme}://{Request.Host}/uploads/imoveis/{nome}";
        return Ok(new { url });
    }
}