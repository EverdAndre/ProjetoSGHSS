using SGHSS.Api.Models;

namespace SGHSS.Api.Dtos
{
    public class UsuarioResponseDto
    {
        public int IdUsuario { get; set; }
        public int IdPessoa { get; set; }
        public string NomePessoa { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public PerfilUsuario Perfil { get; set; }
        public bool Ativo { get; set; }
        public DateTime DataCriacao { get; set; }
    }
}
