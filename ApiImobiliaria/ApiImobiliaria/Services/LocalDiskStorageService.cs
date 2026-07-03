namespace ApiImobiliaria.Services;

/// <summary>
/// Armazenamento em disco local (fallback quando o R2 não está configurado).
/// Grava em {ContentRoot}/uploads/{chave} e devolve URL RELATIVA (/uploads/...):
/// o navegador resolve na origem do site, e o Nginx repassa /uploads/ para a API.
/// (URL absoluta com o host da API quebrava em produção: apontava p/ 127.0.0.1:5162.)
/// </summary>
public class LocalDiskStorageService : IStorageService
{
    private readonly IWebHostEnvironment _env;

    public LocalDiskStorageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public async Task<string> SalvarAsync(Stream conteudo, string chave, string contentType, CancellationToken ct = default)
    {
        var relativo = chave.Replace('/', Path.DirectorySeparatorChar);
        var caminho = Path.Combine(_env.ContentRootPath, "uploads", relativo);
        Directory.CreateDirectory(Path.GetDirectoryName(caminho)!);

        await using (var stream = new FileStream(caminho, FileMode.Create))
            await conteudo.CopyToAsync(stream, ct);

        return $"/uploads/{chave}";
    }
}
