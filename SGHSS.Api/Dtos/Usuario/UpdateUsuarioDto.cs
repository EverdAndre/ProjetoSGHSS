using System.ComponentModel.DataAnnotations;
using SGHSS.Api.Models;

namespace SGHSS.Api.Dtos
{
    public class UpdateUsuarioDto
    {
        [EmailAddress(ErrorMessage = "O email deve ser válido")]
        public string? Email { get; set; }

        [Required(ErrorMessage = "A senha é obrigatória")]
        [RegularExpression(
            @"^(?=.*[A-Za-z])(?=.*\d).{8,}$",
            ErrorMessage = "A senha deve conter no mínimo 8 caracteres, incluindo letras e números"
        )]
        public string Senha { get; set; } = string.Empty;
        public bool? Ativo { get; set; }

        public PerfilUsuario? Perfil { get; set; }
    }
}
