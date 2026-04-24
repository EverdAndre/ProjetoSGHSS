namespace SGHSS.Api.Dtos.Paciente;

public class PacienteResponseDto
{
    public int IdPaciente { get; set; }
    public int IdPessoa { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string CPF { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string NumeroCartaoSUS { get; set; } = string.Empty;
    public string TipoSanguineo { get; set; } = string.Empty;
    public string Alergias { get; set; } = string.Empty;
    public DateTime CriadoEm { get; set; }
}
