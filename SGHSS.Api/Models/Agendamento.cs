using System.ComponentModel.DataAnnotations;
namespace SGHSS.Api.Models;
using SGHSS.Api.Enums;
public class Agendamento
{
    [Key]
    public int IdAgendamento { get; set; }
    public int IdPaciente { get; set; }
    public Paciente Paciente { get; set; } = null!;
    public int IdProfissionalSaude { get; set; }
    public ProfissionalSaude ProfissionalSaude { get; set; } = null!;
    public int IdCriadoPorUsuario { get; set; }
    public Usuario CriadoPorUsuario { get; set; } = null!;
    public decimal ValorConsulta { get; set; }
    public StatusAgendamento? Status { get; set; }
    public DateTime DataHora { get; set; }
}