using System.ComponentModel.DataAnnotations;

namespace ApiImobiliaria.Models;

public class Corretor
{
    public int    Id              { get; set; }

    [Required]
    [MaxLength(200)]
    public string Email           { get; set; } = "";

    [Required]
    public string SenhaHash       { get; set; } = "";

    public bool   IsAdmin         { get; set; } = false;

    public bool   EmailVerificado { get; set; } = true;

    public DateTime CriadoEm     { get; set; } = DateTime.UtcNow;
}