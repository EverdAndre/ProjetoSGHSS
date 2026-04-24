using System.ComponentModel.DataAnnotations;

namespace SGHSS.Api.Dtos.Paciente;

public class UpdatePacienteDto
{
    [StringLength(100)]
    public string? Nome { get; set; }

    [StringLength(11)]
    public string? CPF { get; set; }

    [StringLength(20)]
    public string? Telefone { get; set; }

    [StringLength(20)]
    public string? NumeroCartaoSUS { get; set; }

    [StringLength(10)]
    public string? TipoSanguineo { get; set; }

    [StringLength(500)]
    public string? Alergias { get; set; }
}
