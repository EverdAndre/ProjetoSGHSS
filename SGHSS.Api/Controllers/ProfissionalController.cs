using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SGHSS.Api.Data;
using SGHSS.Api.Dtos.Profissional;
using SGHSS.Api.Models;

namespace SGHSS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfissionalController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfissionalController(AppDbContext context)
    {
        _context = context;
    }

    private static bool ContemApenasDigitos(string valor)
    {
        return valor.All(char.IsDigit);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProfissionalResponseDto>>> GetAll()
    {
        var profissionais = await _context
            .ProfissionaisSaude.Include(p => p.Pessoa)
            .Where(p => p.Ativo && p.Pessoa.Ativo)
            .Select(p => new ProfissionalResponseDto
            {
                IdProfissionalSaude = p.IdProfissionalSaude,
                IdPessoa = p.IdPessoa,
                Nome = p.Pessoa.Nome,
                CPF = p.Pessoa.CPF,
                Telefone = p.Pessoa.Telefone,
                CodRegProf = p.CodRegProf,
                Especialidade = p.Especialidade,
                Ativo = p.Ativo,
                CriadoEm = p.CriadoEm,
            })
            .ToListAsync();
        return Ok(profissionais);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<ActionResult<ProfissionalResponseDto>> GetById(int id)
    {
        var profissional = await _context
            .ProfissionaisSaude.Include(p => p.Pessoa)
            .Where(p => p.IdProfissionalSaude == id && p.Ativo && p.Pessoa.Ativo)
            .Select(p => new ProfissionalResponseDto
            {
                IdProfissionalSaude = p.IdProfissionalSaude,
                IdPessoa = p.IdPessoa,
                Nome = p.Pessoa.Nome,
                CPF = p.Pessoa.CPF,
                Telefone = p.Pessoa.Telefone,
                CodRegProf = p.CodRegProf,
                Especialidade = p.Especialidade,
                Ativo = p.Ativo,
                CriadoEm = p.CriadoEm,
            })
            .FirstOrDefaultAsync();
        if (profissional == null)
            return NotFound("Profissional não encontrado.");
        return Ok(profissional);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("buscar")]
    public async Task<ActionResult<IEnumerable<ProfissionalResponseDto>>> BuscarPorNome(
        [FromQuery] string nome
    )
    {
        if (string.IsNullOrWhiteSpace(nome))
            return BadRequest("Informe um nome para busca.");
        var profissionais = await _context
            .ProfissionaisSaude.Include(p => p.Pessoa)
            .Where(p => p.Ativo && p.Pessoa.Ativo && p.Pessoa.Nome.Contains(nome.Trim()))
            .Select(p => new ProfissionalResponseDto
            {
                IdProfissionalSaude = p.IdProfissionalSaude,
                IdPessoa = p.IdPessoa,
                Nome = p.Pessoa.Nome,
                CPF = p.Pessoa.CPF,
                Telefone = p.Pessoa.Telefone,
                CodRegProf = p.CodRegProf,
                Especialidade = p.Especialidade,
                Ativo = p.Ativo,
                CriadoEm = p.CriadoEm,
            })
            .ToListAsync();
        return Ok(profissionais);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("pessoa/{idPessoa}")]
    public async Task<ActionResult<ProfissionalResponseDto>> CreateProfissional(
        int idPessoa,
        CreateProfissionalSaudeDto dto
    )
    {
        var pessoa = await _context.Pessoas.FirstOrDefaultAsync(p =>
            p.IdPessoa == idPessoa && p.Ativo
        );
        if (pessoa == null)
            return BadRequest("Pessoa não encontrada.");
        var pacienteExiste = await _context.Pacientes.AnyAsync(p =>
            p.IdPessoa == idPessoa && p.Ativo
        );
        if (pacienteExiste)
            return BadRequest("Esta pessoa já possui um paciente cadastrado.");
        var profissionalExiste = await _context.ProfissionaisSaude.AnyAsync(p =>
            p.IdPessoa == idPessoa && p.Ativo
        );
        if (profissionalExiste)
            return BadRequest("Esta pessoa já possui um profissional de saúde cadastrado.");
        if (!ContemApenasDigitos(dto.CodRegProf.Trim()))
            return BadRequest("O Registro Profissional deve conter apenas números.");
        var profissional = new ProfissionalSaude
        {
            IdPessoa = idPessoa,
            CodRegProf = dto.CodRegProf.Trim(),
            Especialidade = dto.Especialidade.Trim(),
            CriadoEm = DateTime.UtcNow,
            Ativo = true,
        };
        _context.ProfissionaisSaude.Add(profissional);
        await _context.SaveChangesAsync();
        var response = new ProfissionalResponseDto
        {
            IdProfissionalSaude = profissional.IdProfissionalSaude,
            IdPessoa = profissional.IdPessoa,
            Nome = pessoa.Nome,
            CPF = pessoa.CPF,
            Telefone = pessoa.Telefone,
            CodRegProf = profissional.CodRegProf,
            Especialidade = profissional.Especialidade,
            Ativo = profissional.Ativo,
            CriadoEm = profissional.CriadoEm,
        };
        return CreatedAtAction(
            nameof(GetById),
            new { id = profissional.IdProfissionalSaude },
            response
        );
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}")]
    public async Task<ActionResult<ProfissionalResponseDto>> PatchProfissional(
        int id,
        UpdateProfissionalDto dto
    )
    {
        var profissional = await _context
            .ProfissionaisSaude.Include(p => p.Pessoa)
            .FirstOrDefaultAsync(p => p.IdProfissionalSaude == id && p.Ativo && p.Pessoa.Ativo);
        if (profissional == null)
            return NotFound("Profissional não encontrado.");
        if (!string.IsNullOrWhiteSpace(dto.CodRegProf))
        {
            var codRegProf = dto.CodRegProf.Trim();
            if (!ContemApenasDigitos(codRegProf))
                return BadRequest("O Registro Profissional deve conter apenas números.");
            profissional.CodRegProf = codRegProf;
        }
        if (!string.IsNullOrWhiteSpace(dto.Especialidade))
            profissional.Especialidade = dto.Especialidade.Trim();
        if (dto.Ativo.HasValue)
            profissional.Ativo = dto.Ativo.Value;
        await _context.SaveChangesAsync();
        var response = new ProfissionalResponseDto
        {
            IdProfissionalSaude = profissional.IdProfissionalSaude,
            IdPessoa = profissional.IdPessoa,
            Nome = profissional.Pessoa.Nome,
            CPF = profissional.Pessoa.CPF,
            Telefone = profissional.Pessoa.Telefone,
            CodRegProf = profissional.CodRegProf,
            Especialidade = profissional.Especialidade,
            Ativo = profissional.Ativo,
            CriadoEm = profissional.CriadoEm,
        };
        return Ok(response);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProfissional(int id)
    {
        var profissional = await _context.ProfissionaisSaude.FirstOrDefaultAsync(p =>
            p.IdProfissionalSaude == id && p.Ativo
        );
        if (profissional == null)
            return NotFound("Profissional não encontrado.");
        profissional.Ativo = false;
        await _context.SaveChangesAsync();
        return Ok("Profissional removido com sucesso.");
    }
}
