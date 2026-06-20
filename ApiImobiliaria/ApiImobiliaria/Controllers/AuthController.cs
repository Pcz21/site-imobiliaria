using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ApiImobiliaria.DTOs;
using ApiImobiliaria.Services;

namespace ApiImobiliaria.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private static readonly HashSet<string> AdminsIniciais = new(StringComparer.OrdinalIgnoreCase)
    {
        "corretora.fabiju243454@gmail.com",
        "spaulo456.com@gmail.com",
    };

    private readonly IConfiguration   _config;
    private readonly IPasswordService _passwordService;

    public AuthController(IConfiguration config, IPasswordService passwordService)
    {
        _config          = config;
        _passwordService = passwordService;
    }

    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public IActionResult Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Monta lista de credenciais aceitas
        var credenciais = new List<(string Email, string SenhaHash)>();

        // Formato legado: Corretor:Email + Corretor:SenhaHash
        var emailLegado = _config["Corretor:Email"];
        var senhaLegado = _config["Corretor:SenhaHash"];
        if (!string.IsNullOrEmpty(emailLegado) && !string.IsNullOrEmpty(senhaLegado))
            credenciais.Add((emailLegado, senhaLegado));

        // Formato múltiplo: CredenciaisIniciais:0:Email / CredenciaisIniciais:1:Email ...
        foreach (var section in _config.GetSection("CredenciaisIniciais").GetChildren())
        {
            var email = section["Email"];
            var hash  = section["SenhaHash"];
            if (!string.IsNullOrEmpty(email) && !string.IsNullOrEmpty(hash)
                && !credenciais.Any(c => string.Equals(c.Email, email, StringComparison.OrdinalIgnoreCase)))
            {
                credenciais.Add((email, hash));
            }
        }

        if (credenciais.Count == 0)
            return StatusCode(503, new { mensagem = "Autenticação não configurada no servidor." });

        var match = credenciais.FirstOrDefault(c =>
            string.Equals(c.Email, dto.Email, StringComparison.OrdinalIgnoreCase));

        if (match == default || !_passwordService.VerifyPassword(dto.Senha, match.SenhaHash))
            return Unauthorized(new { mensagem = "Email ou senha incorretos." });

        var ehAdmin = AdminsIniciais.Contains(match.Email);
        var token   = GerarToken(match.Email, ehAdmin);
        return Ok(new { token, email = match.Email, isAdmin = ehAdmin });
    }

    private string GerarToken(string email, bool isAdmin)
    {
        var jwtConfig = _config.GetSection("Jwt");
        var key       = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig["SecretKey"]!));
        var creds     = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiracao = int.Parse(jwtConfig["ExpiracaoHoras"] ?? "24");

        var claims = new[]
        {
            new Claim(ClaimTypes.Email, email),
            new Claim("isAdmin", isAdmin ? "true" : "false"),
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