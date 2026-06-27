namespace ApiImobiliaria.Services;

/// <summary>
/// Abstração de armazenamento de arquivos. A implementação concreta
/// (R2 ou disco local) é escolhida em Program.cs conforme a configuração.
/// </summary>
public interface IStorageService
{
    /// <summary>
    /// Salva o conteúdo sob a chave informada (ex.: "imoveis/abc.jpg")
    /// e devolve a URL pública final do arquivo.
    /// </summary>
    Task<string> SalvarAsync(Stream conteudo, string chave, string contentType, CancellationToken ct = default);
}
