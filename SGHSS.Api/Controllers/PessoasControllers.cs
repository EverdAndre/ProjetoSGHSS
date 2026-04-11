using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SGHSS.Api.Data;
using SGHSS.Api.Models;
using SGHSS.Api.Dtos;

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
    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Pessoa>>> GetAll()
    {
        var pessoas = await _context.Pessoas.Where(p => p.Ativo).ToListAsync();
        return Ok(pessoas);
    }
    [Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<ActionResult<Pessoa>> GetByIdPessoa(int id)
    {
        var pessoa = await _context.Pessoas.FirstOrDefaultAsync(p => p.IdPessoa == id && p.Ativo);
        if (pessoa == null) return NotFound("Pessoa não encontrada");
        return Ok(pessoa);
    }
    
    [Authorize(Roles = "Admin")]
    [HttpGet("buscar")]
    public async Task<ActionResult<IEnumerable<Pessoa>>> BuscarPorNome([FromQuery] string nome)
    {
        if (string.IsNullOrWhiteSpace(nome))
            return BadRequest("Informe um nome para busca");

        var pessoas = await _context.Pessoas
            .Where(p => p.Ativo && p.Nome.Contains(nome))
            .ToListAsync();

        return Ok(pessoas);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<ActionResult<Pessoa>> CreatePessoa(Pessoa pessoa)
    {
        _context.Pessoas.Add(pessoa);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetByIdPessoa), new { id = pessoa.IdPessoa }, pessoa);
    }
    
    [Authorize(Roles = "Admin")]

    [HttpPatch("{id}")]
    public async Task<IActionResult> PatchPessoa(int id, UpdatePessoaDto dto)
    {
        var pessoa = await _context.Pessoas.FirstOrDefaultAsync(p => p.IdPessoa == id && p.Ativo);
        if (pessoa == null) return NotFound("Pessoa não encontrada");
        
        if (!string.IsNullOrEmpty(dto.Nome)) pessoa.Nome = dto.Nome;
        if (!string.IsNullOrEmpty(dto.CPF)) pessoa.CPF = dto.CPF;
        if (dto.DataNascimento.HasValue) pessoa.DataNascimento = dto.DataNascimento.Value;
        if (!string.IsNullOrEmpty(dto.Endereco)) pessoa.Endereco = dto.Endereco;
        if (!string.IsNullOrEmpty(dto.Telefone)) pessoa.Telefone = dto.Telefone;
        if (dto.Ativo.HasValue) pessoa.Ativo = dto.Ativo.Value;  
        await _context.SaveChangesAsync();
        return Ok("Pessoa atualizada com sucesso");
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePessoa(int id)
    {
        var pessoa = await _context.Pessoas.FirstOrDefaultAsync(p => p.IdPessoa == id && p.Ativo);
        if (pessoa == null) return NotFound("Pessoa não encontrada");
        pessoa.Ativo = false;
        await _context.SaveChangesAsync();
        return Ok("Pessoa removida com sucesso");
    }
}