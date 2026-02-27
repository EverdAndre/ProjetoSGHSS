using System.ComponentModel.DataAnnotations;
namespace SGHSS.Api.Models;
public class Paciente
{
    [Key]
    public int IdPaciente { get; set; }
    public int IdPessoa { get; set; }
    public Pessoa Pessoa { get; set; } = null!;
    public string NumeroCartaoSUS { get; set; } = string.Empty;
    public string TipoSanguineo { get; set; } = string.Empty;
    public string Alergias { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}