using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SGHSS.Api.Data;
using SGHSS.Api.Dtos;
using SGHSS.Api.Models;

namespace SGHSS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsuariosController(AppDbContext context)
    {
        _context = context;
    }

    private async Task<ActionResult?> ValidarVinculoPerfilPessoa(int idPessoa, PerfilUsuario perfil)
    {
        var possuiPaciente = await _context.Pacientes.AnyAsync(p =>
            p.IdPessoa == idPessoa && p.Ativo && p.Pessoa.Ativo
        );
        var possuiProfissional = await _context.ProfissionaisSaude.AnyAsync(p =>
            p.IdPessoa == idPessoa && p.Ativo && p.Pessoa.Ativo
        );
        if (perfil == PerfilUsuario.Admin && (possuiPaciente || possuiProfissional))
            return BadRequest(
                "Usuário administrador não deve estar vinculado a paciente ou profissional."
            );
        if (perfil == PerfilUsuario.Paciente && (!possuiPaciente || possuiProfissional))
            return BadRequest(
                "Usuário paciente deve estar vinculado somente a um cadastro de paciente."
            );
        if (perfil == PerfilUsuario.ProfissionalSaude && (!possuiProfissional || possuiPaciente))
            return BadRequest(
                "Usuário profissional deve estar vinculado somente a um cadastro de profissional de saúde."
            );
        return null;
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioResponseDto>>> GetAllUsuarios()
    {
        var usuarios = await _context
            .Usuarios.Include(u => u.Pessoa)
            .Where(u => u.Ativo && u.Pessoa.Ativo)
            .Select(u => new UsuarioResponseDto
            {
                IdUsuario = u.IdUsuario,
                IdPessoa = u.IdPessoa,
                NomePessoa = u.Pessoa.Nome,
                Email = u.Email,
                Perfil = u.Perfil,
                Ativo = u.Ativo,
                DataCriacao = u.DataCriacao,
            })
            .ToListAsync();
        return Ok(usuarios);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<ActionResult<UsuarioResponseDto>> GetByIdUsuario(int id)
    {
        var usuario = await _context
            .Usuarios.Include(u => u.Pessoa)
            .Where(u => u.IdUsuario == id && u.Ativo && u.Pessoa.Ativo)
            .Select(u => new UsuarioResponseDto
            {
                IdUsuario = u.IdUsuario,
                IdPessoa = u.IdPessoa,
                NomePessoa = u.Pessoa.Nome,
                Email = u.Email,
                Perfil = u.Perfil,
                Ativo = u.Ativo,
                DataCriacao = u.DataCriacao,
            })
            .FirstOrDefaultAsync();
        if (usuario == null)
            return NotFound("Usuário não encontrado.");
        return Ok(usuario);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("buscar")]
    public async Task<ActionResult<IEnumerable<UsuarioResponseDto>>> BuscarPorNome(
        [FromQuery] string nome
    )
    {
        if (string.IsNullOrWhiteSpace(nome))
            return BadRequest("Informe um nome para busca.");
        var usuarios = await _context
            .Usuarios.Include(u => u.Pessoa)
            .Where(u => u.Ativo && u.Pessoa.Ativo && u.Pessoa.Nome.Contains(nome))
            .Select(u => new UsuarioResponseDto
            {
                IdUsuario = u.IdUsuario,
                IdPessoa = u.IdPessoa,
                NomePessoa = u.Pessoa.Nome,
                Email = u.Email,
                Perfil = u.Perfil,
                Ativo = u.Ativo,
                DataCriacao = u.DataCriacao,
            })
            .ToListAsync();
        return Ok(usuarios);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<UsuarioResponseDto>> CreateUsuario(CreateUsuarioDto dto)
    {
        var pessoa = await _context.Pessoas.FirstOrDefaultAsync(p =>
            p.IdPessoa == dto.IdPessoa && p.Ativo
        );
        if (pessoa == null)
            return BadRequest("Pessoa não encontrada.");
        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.IdPessoa == dto.IdPessoa);
        if (usuarioExiste)
            return BadRequest("Esta pessoa já possui um usuário.");
        var emailNormalizado = dto.Email.Trim().ToLower();
        var emailExiste = await _context.Usuarios.AnyAsync(u =>
            u.Email.ToLower() == emailNormalizado
        );
        if (emailExiste)
            return BadRequest("Email já cadastrado.");
        var erroPerfil = await ValidarVinculoPerfilPessoa(dto.IdPessoa, dto.Perfil);
        if (erroPerfil != null)
            return erroPerfil;
        var usuario = new Usuario
        {
            IdPessoa = dto.IdPessoa,
            Email = emailNormalizado,
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha),
            Perfil = dto.Perfil,
            Ativo = true,
            DataCriacao = DateTime.UtcNow,
        };
        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        var response = new UsuarioResponseDto
        {
            IdUsuario = usuario.IdUsuario,
            IdPessoa = usuario.IdPessoa,
            NomePessoa = pessoa.Nome,
            Email = usuario.Email,
            Perfil = usuario.Perfil,
            Ativo = usuario.Ativo,
            DataCriacao = usuario.DataCriacao,
        };
        return Ok(response);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}")]
    public async Task<IActionResult> PatchUsuario(int id, UpdateUsuarioDto dto)
    {
        var usuario = await _context
            .Usuarios.Include(u => u.Pessoa)
            .FirstOrDefaultAsync(u => u.IdUsuario == id && u.Ativo && u.Pessoa.Ativo);
        if (usuario == null)
            return NotFound("Usuário não encontrado.");
        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            var emailNormalizado = dto.Email.Trim().ToLower();
            var emailExiste = await _context.Usuarios.AnyAsync(u =>
                u.IdUsuario != id && u.Email.ToLower() == emailNormalizado
            );
            if (emailExiste)
                return BadRequest("Email já cadastrado.");
            usuario.Email = emailNormalizado;
        }
        if (!string.IsNullOrWhiteSpace(dto.Senha))
        {
            usuario.SenhaHash = BCrypt.Net.BCrypt.HashPassword(dto.Senha);
        }
        if (dto.Ativo.HasValue)
        {
            usuario.Ativo = dto.Ativo.Value;
        }
        if (dto.Perfil.HasValue)
        {
            var erroPerfil = await ValidarVinculoPerfilPessoa(usuario.IdPessoa, dto.Perfil.Value);
            if (erroPerfil != null)
                return erroPerfil;
            usuario.Perfil = dto.Perfil.Value;
        }
        await _context.SaveChangesAsync();
        var response = new UsuarioResponseDto
        {
            IdUsuario = usuario.IdUsuario,
            IdPessoa = usuario.IdPessoa,
            NomePessoa = usuario.Pessoa.Nome,
            Email = usuario.Email,
            Perfil = usuario.Perfil,
            Ativo = usuario.Ativo,
            DataCriacao = usuario.DataCriacao,
        };
        return Ok(response);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUsuario(int id)
    {
        var usuario = await _context.Usuarios.FirstOrDefaultAsync(u =>
            u.IdUsuario == id && u.Ativo
        );
        if (usuario == null)
            return NotFound("Usuário não encontrado.");
        usuario.Ativo = false;
        await _context.SaveChangesAsync();
        return Ok("Usuário desativado com sucesso.");
    }
}
