using System.ComponentModel.DataAnnotations;

namespace SGHSS.Api.Dtos.Profissional;

public class UpdateProfissionalDto
{
    [RegularExpression(
        @"^\d+$",
        ErrorMessage = "O Registro Profissional deve conter apenas números."
    )]
    [StringLength(20)]
    public string? CodRegProf { get; set; }

    [StringLength(100)]
    public string? Especialidade { get; set; }

    public bool? Ativo { get; set; }
}
