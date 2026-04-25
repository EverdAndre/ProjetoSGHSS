using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SGHSS.Api.Data;
using SGHSS.Api.Dtos;

namespace SGHSS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Senha))
            return BadRequest("Email e senha são obrigatórios");

        var usuario = await _context
            .Usuarios.Include(u => u.Pessoa)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (usuario == null)
            return Unauthorized("Usuário ou senha inválidos");

        if (!usuario.Ativo)
            return Unauthorized("Usuário inativo");

        var senhaValida = BCrypt.Net.BCrypt.Verify(dto.Senha, usuario.SenhaHash);
        if (!senhaValida)
            return Unauthorized("Usuário ou senha inválidos");

        var expiraEmHoras = int.TryParse(_configuration["Jwt:ExpiresInHours"], out var horas)
            ? horas
            : 2;
        var expiraEm = DateTime.UtcNow.AddHours(expiraEmHoras);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.IdUsuario.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, usuario.Email),
            new Claim(ClaimTypes.Name, usuario.Pessoa.Nome),
            new Claim(ClaimTypes.Role, usuario.Perfil.ToString()),
            new Claim("IdUsuario", usuario.IdUsuario.ToString()),
            new Claim("IdPessoa", usuario.IdPessoa.ToString()),
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credenciais = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: expiraEm,
            signingCredentials: credenciais
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        var resposta = new
        {
            Token = tokenString,
            Nome = usuario.Pessoa.Nome,
            Email = usuario.Email,
            Perfil = usuario.Perfil.ToString(),
            ExpiraEm = expiraEm,
        };
        return Ok(resposta);
    }
}
