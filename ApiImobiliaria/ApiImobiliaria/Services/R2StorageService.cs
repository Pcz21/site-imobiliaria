using Amazon.S3;
using Amazon.S3.Model;

namespace ApiImobiliaria.Services;

/// <summary>
/// Armazenamento em Cloudflare R2 (compatível com a API S3).
/// As credenciais e o bucket vêm da seção "R2" da configuração.
/// A URL pública devolvida usa R2:PublicBaseUrl (domínio próprio ou r2.dev).
/// </summary>
public class R2StorageService : IStorageService
{
    private readonly IAmazonS3 _s3;
    private readonly string _bucket;
    private readonly string _publicBaseUrl;

    public R2StorageService(IAmazonS3 s3, IConfiguration config)
    {
        _s3 = s3;
        var r2 = config.GetSection("R2");
        _bucket = r2["Bucket"]!;
        _publicBaseUrl = (r2["PublicBaseUrl"] ?? "").TrimEnd('/');
    }

    public async Task<string> SalvarAsync(Stream conteudo, string chave, string contentType, CancellationToken ct = default)
    {
        var req = new PutObjectRequest
        {
            BucketName  = _bucket,
            Key         = chave,
            InputStream = conteudo,
            ContentType = contentType,
            // R2 não aceita o streaming chunked com assinatura de payload da AWS.
            DisablePayloadSigning = true,
        };

        await _s3.PutObjectAsync(req, ct);
        return $"{_publicBaseUrl}/{chave}";
    }
}
