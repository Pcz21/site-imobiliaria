namespace ApiImobiliaria.Services;

/// <summary>
/// Armazenamento em disco local (fallback de desenvolvimento).
/// Grava em {ContentRoot}/uploads/{chave} e devolve a URL absoluta servida
/// pelo middleware de arquivos estáticos em /uploads. NÃO use em produção:
/// o sistema de arquivos é efêmero e some a cada deploy.
/// </summary>
public class LocalDiskStorageService : IStorageService
{
    private readonly IWebHostEnvironment _env;
    private readonly IHttpContextAccessor _http;

    public LocalDiskStorageService(IWebHostEnvironment env, IHttpContextAccessor http)
    {
        _env = env;
        _http = http;
    }

    public async Task<string> SalvarAsync(Stream conteudo, string chave, string contentType, CancellationToken ct = default)
    {
        var relativo = chave.Replace('/', Path.DirectorySeparatorChar);
        var caminho = Path.Combine(_env.ContentRootPath, "uploads", relativo);
        Directory.CreateDirectory(Path.GetDirectoryName(caminho)!);

        await using (var stream = new FileStream(caminho, FileMode.Create))
            await conteudo.CopyToAsync(stream, ct);

        var req = _http.HttpContext!.Request;
        return $"{req.Scheme}://{req.Host}/uploads/{chave}";
    }
}
