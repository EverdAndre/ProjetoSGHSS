using System.ComponentModel.DataAnnotations;

namespace SGHSS.Api.Models;

public class Usuario
{
    [Key]
    public int IdUsuario { get; set; }
    public int IdPessoa { get; set; }
    public Pessoa Pessoa { get; set; } = null!;
    public string Email { get; set; } = string.Empty;
    public string SenhaHash { get; set; } = string.Empty;
    public bool Ativo { get; set; } = true;
    public DateTime DataCriacao { get; set; } = DateTime.Now;
    public PerfilUsuario Perfil { get; set; }
}
