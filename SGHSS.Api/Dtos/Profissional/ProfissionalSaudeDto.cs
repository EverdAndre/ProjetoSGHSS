using System.ComponentModel.DataAnnotations;

namespace SGHSS.Api.Dtos.Profissional;

public class CreateProfissionalSaudeDto
{
    [Required(ErrorMessage = "O número do Registro Profissional é obrigatório.")]
    [RegularExpression(
        @"^\d+$",
        ErrorMessage = "O Registro Profissional deve conter apenas números."
    )]
    [StringLength(20)]
    public string CodRegProf { get; set; } = string.Empty;

    [Required(ErrorMessage = "A especialidade é obrigatória.")]
    [StringLength(100)]
    public string Especialidade { get; set; } = string.Empty;
}
