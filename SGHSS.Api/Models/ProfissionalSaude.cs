using System.ComponentModel.DataAnnotations;
namespace SGHSS.Api.Models;
public class ProfissionalSaude
{
    [Key]
    public int IdProfissionalSaude { get; set; }
    public int IdPessoa { get; set; }
    public Pessoa Pessoa { get; set; } = null!;
    public string CodRegProf { get; set; } = string.Empty;
    public string Especialidade { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}