using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SGHSS.Api.Data;
using SGHSS.Api.Dtos.Paciente;
using SGHSS.Api.Models;

namespace SGHSS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PacienteController : ControllerBase
{
    private readonly AppDbContext _context;

    public PacienteController(AppDbContext context)
    {
        _context = context;
    }

    private static string NormalizarCpf(string cpf)
    {
        return new string(cpf.Where(char.IsDigit).ToArray());
    }

    private static bool ContemApenasDigitos(string valor)
    {
        return valor.All(char.IsDigit);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PacienteResponseDto>>> GetAll()
    {
        var pacientes = await _context
            .Pacientes.Include(p => p.Pessoa)
            .Where(p => p.Ativo && p.Pessoa.Ativo)
            .Select(p => new PacienteResponseDto
            {
                IdPaciente = p.IdPaciente,
                IdPessoa = p.IdPessoa,
                Nome = p.Pessoa.Nome,
                CPF = p.Pessoa.CPF,
                Telefone = p.Pessoa.Telefone,
                NumeroCartaoSUS = p.NumeroCartaoSUS,
                TipoSanguineo = p.TipoSanguineo,
                Alergias = p.Alergias,
                CriadoEm = p.CriadoEm,
            })
            .ToListAsync();

        return Ok(pacientes);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<ActionResult<PacienteResponseDto>> GetById(int id)
    {
        var paciente = await _context
            .Pacientes.Include(p => p.Pessoa)
            .Where(p => p.IdPaciente == id && p.Ativo && p.Pessoa.Ativo)
            .Select(p => new PacienteResponseDto
            {
                IdPaciente = p.IdPaciente,
                IdPessoa = p.IdPessoa,
                Nome = p.Pessoa.Nome,
                CPF = p.Pessoa.CPF,
                Telefone = p.Pessoa.Telefone,
                NumeroCartaoSUS = p.NumeroCartaoSUS,
                TipoSanguineo = p.TipoSanguineo,
                Alergias = p.Alergias,
                CriadoEm = p.CriadoEm,
            })
            .FirstOrDefaultAsync();

        if (paciente == null)
            return NotFound("Paciente não encontrado.");

        return Ok(paciente);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("buscar")]
    public async Task<ActionResult<IEnumerable<PacienteResponseDto>>> BuscarPorNome(
        [FromQuery] string nome
    )
    {
        if (string.IsNullOrWhiteSpace(nome))
            return BadRequest("Informe um nome para busca.");

        var pacientes = await _context
            .Pacientes.Include(p => p.Pessoa)
            .Where(p => p.Ativo && p.Pessoa.Ativo && p.Pessoa.Nome.Contains(nome.Trim()))
            .Select(p => new PacienteResponseDto
            {
                IdPaciente = p.IdPaciente,
                IdPessoa = p.IdPessoa,
                Nome = p.Pessoa.Nome,
                CPF = p.Pessoa.CPF,
                Telefone = p.Pessoa.Telefone,
                NumeroCartaoSUS = p.NumeroCartaoSUS,
                TipoSanguineo = p.TipoSanguineo,
                Alergias = p.Alergias,
                CriadoEm = p.CriadoEm,
            })
            .ToListAsync();

        return Ok(pacientes);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("pessoa/{idPessoa}")]
    public async Task<ActionResult<PacienteResponseDto>> CreatePaciente(
        int idPessoa,
        CreatePacienteDto dto
    )
    {
        var pessoa = await _context.Pessoas.FirstOrDefaultAsync(p =>
            p.IdPessoa == idPessoa && p.Ativo
        );

        if (pessoa == null)
            return BadRequest("Pessoa não encontrada.");

        var profissionalExiste = await _context.ProfissionaisSaude.AnyAsync(p =>
            p.IdPessoa == idPessoa && p.Ativo
        );

        if (profissionalExiste)
            return BadRequest("Esta pessoa já possui um profissional de saúde cadastrado.");

        var pacienteExiste = await _context.Pacientes.AnyAsync(p =>
            p.IdPessoa == idPessoa && p.Ativo
        );

        if (pacienteExiste)
            return BadRequest("Esta pessoa já possui um paciente cadastrado.");

        if (!ContemApenasDigitos(dto.NumeroCartaoSUS.Trim()))
            return BadRequest("O número do Cartão SUS deve conter apenas números.");

        var paciente = new Paciente
        {
            IdPessoa = idPessoa,
            NumeroCartaoSUS = dto.NumeroCartaoSUS.Trim(),
            TipoSanguineo = dto.TipoSanguineo.Trim(),
            Alergias = dto.Alergias.Trim(),
            CriadoEm = DateTime.UtcNow,
            Ativo = true,
        };

        _context.Pacientes.Add(paciente);
        await _context.SaveChangesAsync();

        var response = new PacienteResponseDto
        {
            IdPaciente = paciente.IdPaciente,
            IdPessoa = paciente.IdPessoa,
            Nome = pessoa.Nome,
            CPF = pessoa.CPF,
            Telefone = pessoa.Telefone,
            NumeroCartaoSUS = paciente.NumeroCartaoSUS,
            TipoSanguineo = paciente.TipoSanguineo,
            Alergias = paciente.Alergias,
            CriadoEm = paciente.CriadoEm,
        };

        return CreatedAtAction(nameof(GetById), new { id = paciente.IdPaciente }, response);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}")]
    public async Task<ActionResult<PacienteResponseDto>> PatchPaciente(
        int id,
        UpdatePacienteDto dto
    )
    {
        var paciente = await _context
            .Pacientes.Include(p => p.Pessoa)
            .FirstOrDefaultAsync(p => p.IdPaciente == id && p.Ativo && p.Pessoa.Ativo);

        if (paciente == null)
            return NotFound("Paciente não encontrado.");

        if (!string.IsNullOrWhiteSpace(dto.CPF))
        {
            var cpfNormalizado = NormalizarCpf(dto.CPF);

            var cpfExiste = await _context.Pessoas.AnyAsync(p =>
                p.IdPessoa != paciente.IdPessoa
                && p.Ativo
                && p.CPF.Replace(".", "").Replace("-", "") == cpfNormalizado
            );

            if (cpfExiste)
                return BadRequest("CPF já cadastrado.");

            paciente.Pessoa.CPF = cpfNormalizado;
        }

        if (!string.IsNullOrWhiteSpace(dto.Nome))
            paciente.Pessoa.Nome = dto.Nome.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Telefone))
            paciente.Pessoa.Telefone = dto.Telefone.Trim();

        if (!string.IsNullOrWhiteSpace(dto.NumeroCartaoSUS))
        {
            if (!ContemApenasDigitos(dto.NumeroCartaoSUS.Trim()))
                return BadRequest("O número do Cartão SUS deve conter apenas números.");

            paciente.NumeroCartaoSUS = dto.NumeroCartaoSUS.Trim();
        }

        if (!string.IsNullOrWhiteSpace(dto.TipoSanguineo))
            paciente.TipoSanguineo = dto.TipoSanguineo.Trim();

        if (!string.IsNullOrWhiteSpace(dto.Alergias))
            paciente.Alergias = dto.Alergias.Trim();

        await _context.SaveChangesAsync();

        var response = new PacienteResponseDto
        {
            IdPaciente = paciente.IdPaciente,
            IdPessoa = paciente.IdPessoa,
            Nome = paciente.Pessoa.Nome,
            CPF = paciente.Pessoa.CPF,
            Telefone = paciente.Pessoa.Telefone,
            NumeroCartaoSUS = paciente.NumeroCartaoSUS,
            TipoSanguineo = paciente.TipoSanguineo,
            Alergias = paciente.Alergias,
            CriadoEm = paciente.CriadoEm,
        };

        return Ok(response);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePaciente(int id)
    {
        var paciente = await _context.Pacientes.FirstOrDefaultAsync(p =>
            p.IdPaciente == id && p.Ativo
        );

        if (paciente == null)
            return NotFound("Paciente não encontrado.");

        paciente.Ativo = false;
        await _context.SaveChangesAsync();

        return Ok("Paciente removido com sucesso.");
    }
}
