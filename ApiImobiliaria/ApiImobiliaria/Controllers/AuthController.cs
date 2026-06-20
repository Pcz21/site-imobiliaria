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
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public IActionResult Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var emailConfig = _config["Corretor:Email"];
        var senhaHash   = _config["Corretor:SenhaHash"];

        // Credenciais não configuradas no servidor
        if (string.IsNullOrEmpty(emailConfig) || string.IsNullOrEmpty(senhaHash))
            return StatusCode(503, new { mensagem = "Autenticação não configurada no servidor." });

        // Mesma mensagem para email e senha — evita enumeração de usuários
        if (!string.Equals(dto.Email, emailConfig, StringComparison.OrdinalIgnoreCase) ||
            !_passwordService.VerifyPassword(dto.Senha, senhaHash))
            return Unauthorized(new { mensagem = "Email ou senha incorretos." });

        var token = GerarToken(emailConfig);
        return Ok(new { token, email = emailConfig });
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
