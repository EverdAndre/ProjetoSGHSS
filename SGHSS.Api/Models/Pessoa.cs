namespace SGHSS.Api.Models;
using System.ComponentModel.DataAnnotations;
public class Pessoa
{
    [Key]
    public int IdPessoa { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string CPF { get; set; } = string.Empty;
    public DateTime DataNascimento { get; set; }

    public string Endereco { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;

    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}