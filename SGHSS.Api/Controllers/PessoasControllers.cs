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
public class PessoasController : ControllerBase
{
    private readonly AppDbContext _context;

    public PessoasController(AppDbContext context)
    {
        _context = context;
    }

    private static string NormalizarCpf(string cpf)
    {
        return new string(cpf.Where(char.IsDigit).ToArray());
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PessoaResponseDto>>> GetAll()
    {
        var pessoas = await _context
            .Pessoas.Where(p => p.Ativo)
            .Select(p => new PessoaResponseDto
            {
                IdPessoa = p.IdPessoa,
                Nome = p.Nome,
                CPF = p.CPF,
                DataNascimento = p.DataNascimento,
                Endereco = p.Endereco,
                Telefone = p.Telefone,
                CriadoEm = p.CriadoEm,
                Ativo = p.Ativo,
            })
            .ToListAsync();
        return Ok(pessoas);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<ActionResult<PessoaResponseDto>> GetByIdPessoa(int id)
    {
        var pessoa = await _context
            .Pessoas.Where(p => p.IdPessoa == id && p.Ativo)
            .Select(p => new PessoaResponseDto
            {
                IdPessoa = p.IdPessoa,
                Nome = p.Nome,
                CPF = p.CPF,
                DataNascimento = p.DataNascimento,
                Endereco = p.Endereco,
                Telefone = p.Telefone,
                CriadoEm = p.CriadoEm,
                Ativo = p.Ativo,
            })
            .FirstOrDefaultAsync();
        if (pessoa == null)
            return NotFound("Pessoa não encontrada");
        return Ok(pessoa);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("buscar")]
    public async Task<ActionResult<IEnumerable<PessoaResponseDto>>> BuscarPorNome(
        [FromQuery] string nome
    )
    {
        if (string.IsNullOrWhiteSpace(nome))
            return BadRequest("Informe um nome para busca");
        var pessoas = await _context
            .Pessoas.Where(p => p.Ativo && p.Nome.Contains(nome))
            .Select(p => new PessoaResponseDto
            {
                IdPessoa = p.IdPessoa,
                Nome = p.Nome,
                CPF = p.CPF,
                DataNascimento = p.DataNascimento,
                Endereco = p.Endereco,
                Telefone = p.Telefone,
                CriadoEm = p.CriadoEm,
                Ativo = p.Ativo,
            })
            .ToListAsync();
        return Ok(pessoas);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<PessoaResponseDto>> CreatePessoa(CreatePessoaDto dto)
    {
        var cpfNormalizado = NormalizarCpf(dto.CPF);
        var cpfJaExiste = await _context.Pessoas.AnyAsync(p =>
            p.Ativo && p.CPF.Replace(".", "").Replace("-", "") == cpfNormalizado
        );
        if (cpfJaExiste)
            return BadRequest("CPF já cadastrado.");
        var pessoa = new Pessoa
        {
            Nome = dto.Nome.Trim(),
            CPF = cpfNormalizado,
            DataNascimento = dto.DataNascimento,
            Endereco = dto.Endereco.Trim(),
            Telefone = dto.Telefone.Trim(),
            CriadoEm = DateTime.Now,
            Ativo = true,
        };
        _context.Pessoas.Add(pessoa);
        await _context.SaveChangesAsync();
        var response = new PessoaResponseDto
        {
            IdPessoa = pessoa.IdPessoa,
            Nome = pessoa.Nome,
            CPF = pessoa.CPF,
            DataNascimento = pessoa.DataNascimento,
            Endereco = pessoa.Endereco,
            Telefone = pessoa.Telefone,
            CriadoEm = pessoa.CriadoEm,
            Ativo = pessoa.Ativo,
        };
        return CreatedAtAction(nameof(GetByIdPessoa), new { id = pessoa.IdPessoa }, response);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}")]
    public async Task<IActionResult> PatchPessoa(int id, UpdatePessoaDto dto)
    {
        var pessoa = await _context.Pessoas.FirstOrDefaultAsync(p => p.IdPessoa == id && p.Ativo);
        if (pessoa == null)
            return NotFound("Pessoa não encontrada");
        if (!string.IsNullOrEmpty(dto.Nome))
            pessoa.Nome = dto.Nome.Trim();
        if (!string.IsNullOrEmpty(dto.CPF))
        {
            var cpfNormalizado = NormalizarCpf(dto.CPF);
            var cpfJaExiste = await _context.Pessoas.AnyAsync(p =>
                p.IdPessoa != id
                && p.Ativo
                && p.CPF.Replace(".", "").Replace("-", "") == cpfNormalizado
            );
            if (cpfJaExiste)
                return BadRequest("CPF já cadastrado.");
            pessoa.CPF = cpfNormalizado;
        }
        if (dto.DataNascimento.HasValue)
            pessoa.DataNascimento = dto.DataNascimento.Value;
        if (!string.IsNullOrEmpty(dto.Endereco))
            pessoa.Endereco = dto.Endereco.Trim();
        if (!string.IsNullOrEmpty(dto.Telefone))
            pessoa.Telefone = dto.Telefone.Trim();
        if (dto.Ativo.HasValue)
            pessoa.Ativo = dto.Ativo.Value;
        await _context.SaveChangesAsync();
        return Ok("Pessoa atualizada com sucesso");
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePessoa(int id)
    {
        var pessoa = await _context
            .Pessoas.Include(p => p.Usuario)
            .Include(p => p.Paciente)
            .Include(p => p.ProfissionalSaude)
            .FirstOrDefaultAsync(p => p.IdPessoa == id && p.Ativo);
        if (pessoa == null)
            return NotFound("Pessoa não encontrada");
        pessoa.Ativo = false;
        if (pessoa.Usuario != null)
            pessoa.Usuario.Ativo = false;
        if (pessoa.Paciente != null)
            pessoa.Paciente.Ativo = false;
        if (pessoa.ProfissionalSaude != null)
            pessoa.ProfissionalSaude.Ativo = false;
        await _context.SaveChangesAsync();
        return Ok("Pessoa removida com sucesso");
    }
}
