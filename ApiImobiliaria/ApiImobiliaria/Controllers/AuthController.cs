using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using ApiImobiliaria.DTOs;

namespace ApiImobiliaria.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    /// <summary>
    /// Autentica o corretor e retorna um token JWT.
    /// </summary>
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var emailConfig = _config["Corretor:Email"];
        var senhaConfig = _config["Corretor:Senha"];

        if (dto.Email != emailConfig || dto.Senha != senhaConfig)
            return Unauthorized(new { mensagem = "Email ou senha incorretos." });

        var token = GerarToken(dto.Email);
        return Ok(new { token, email = dto.Email });
    }

    private string GerarToken(string email)
    {
        var jwtConfig  = _config.GetSection("Jwt");
        var key        = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtConfig["SecretKey"]!));
        var creds      = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expiracao  = int.Parse(jwtConfig["ExpiracaoHoras"] ?? "24");

        var claims = new[]
        {
            new Claim(ClaimTypes.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:            jwtConfig["Issuer"],
            audience:          jwtConfig["Audience"],
            claims:            claims,
            expires:           DateTime.UtcNow.AddHours(expiracao),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
