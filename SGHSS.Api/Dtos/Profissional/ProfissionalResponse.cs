namespace SGHSS.Api.Dtos.Profissional;

public class ProfissionalResponseDto
{
    public int IdProfissionalSaude { get; set; }
    public int IdPessoa { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string CPF { get; set; } = string.Empty;
    public string Telefone { get; set; } = string.Empty;
    public string CodRegProf { get; set; } = string.Empty;
    public string Especialidade { get; set; } = string.Empty;
    public bool Ativo { get; set; }
    public DateTime CriadoEm { get; set; }
}
