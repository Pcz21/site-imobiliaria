using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using ApiImobiliaria.DTOs;
using ApiImobiliaria.Services;

namespace ApiImobiliaria.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration   _config;
    private readonly IPasswordService _passwordService;

    public AuthController(IConfiguration config, IPasswordService passwordService)
    {
        _config          = config;
        _passwordService = passwordService;
    }

    /// <summary>
    /// Autentica o corretor e retorna um token JWT.
    /// </summary>
    [HttpPost("login")]
    [EnableRateLimiting("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public IActionResult Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var credenciais = CarregarCredenciais();

        // Nenhuma credencial configurada no servidor
        if (credenciais.Count == 0)
            return StatusCode(503, new { mensagem = "Autenticação não configurada no servidor." });

        // Procura a conta pelo email — várias contas suportadas (ex.: dev + corretora)
        var conta = credenciais.FirstOrDefault(c =>
            string.Equals(c.Email, dto.Email, StringComparison.OrdinalIgnoreCase));

        // Mesma mensagem para email e senha — evita enumeração de usuários
        if (conta.Email is null || !_passwordService.VerifyPassword(dto.Senha, conta.SenhaHash))
            return Unauthorized(new { mensagem = "Email ou senha incorretos." });

        var token = GerarToken(conta.Email);
        return Ok(new { token, email = conta.Email });
    }

    /// <summary>
    /// Carrega as credenciais aceitas a partir da configuração: a lista
    /// "CredenciaisIniciais" (0..N) e, por compatibilidade, a conta única
    /// "Corretor". Cada item tem Email + SenhaHash (BCrypt).
    /// </summary>
    private List<(string Email, string SenhaHash)> CarregarCredenciais()
    {
        var lista = new List<(string Email, string SenhaHash)>();

        foreach (var item in _config.GetSection("CredenciaisIniciais").GetChildren())
        {
            var email = item["Email"];
            var hash  = item["SenhaHash"];
            if (!string.IsNullOrEmpty(email) && !string.IsNullOrEmpty(hash))
                lista.Add((email, hash));
        }

        // Conta única (compatibilidade) — só adiciona se ainda não estiver na lista
        var emailUnico = _config["Corretor:Email"];
        var hashUnico  = _config["Corretor:SenhaHash"];
        if (!string.IsNullOrEmpty(emailUnico) && !string.IsNullOrEmpty(hashUnico) &&
            !lista.Any(c => string.Equals(c.Email, emailUnico, StringComparison.OrdinalIgnoreCase)))
            lista.Add((emailUnico, hashUnico));

        return lista;
    }

    private string GerarToken(string email)
    {
        var jwtConfig = _config.GetSection("Jwt");
        var key       = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig["SecretKey"]!));
        var creds     = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiracao = int.Parse(jwtConfig["ExpiracaoHoras"] ?? "24");

        var claims = new[]
        {
            new Claim(ClaimTypes.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:             jwtConfig["Issuer"],
            audience:           jwtConfig["Audience"],
            claims:             claims,
            expires:            DateTime.UtcNow.AddHours(expiracao),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
