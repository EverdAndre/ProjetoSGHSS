using System.ComponentModel.DataAnnotations;

namespace SGHSS.Api.Dtos.Paciente;

public class CreatePacienteDto
{
    [Required(ErrorMessage = "O número do Cartão SUS é obrigatório.")]
    [StringLength(20)]
    public string NumeroCartaoSUS { get; set; } = string.Empty;

    [StringLength(10)]
    public string TipoSanguineo { get; set; } = string.Empty;

    [StringLength(500)]
    public string Alergias { get; set; } = string.Empty;
}
