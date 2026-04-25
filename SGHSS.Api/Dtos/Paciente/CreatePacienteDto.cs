using System.ComponentModel.DataAnnotations;

namespace SGHSS.Api.Dtos.Paciente;

public class CreatePacienteDto
{
    [Required(ErrorMessage = "O número do Cartão SUS é obrigatório.")]
    [RegularExpression(
        @"^\d+$",
        ErrorMessage = "O número do Cartão SUS deve conter apenas números."
    )]
    [StringLength(20)]
    public string NumeroCartaoSUS { get; set; } = string.Empty;

    [StringLength(10)]
    public string TipoSanguineo { get; set; } = string.Empty;

    [StringLength(500)]
    public string Alergias { get; set; } = string.Empty;
}
