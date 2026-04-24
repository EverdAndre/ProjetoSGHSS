using System.ComponentModel.DataAnnotations;
using SGHSS.Api.Models;

namespace SGHSS.Api.Dtos
{
    public class CreateUsuarioDto
    {
        [Required]
        public int IdPessoa { get; set; }

        [Required(ErrorMessage = "O email é obrigatório")]
        [EmailAddress(ErrorMessage = "O email deve ser válido")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "A senha é obrigatória")]
        [RegularExpression(
            @"^(?=.*[A-Za-z])(?=.*\d).{8,}$",
            ErrorMessage = "A senha deve conter letras e números"
        )]
        public string Senha { get; set; } = string.Empty;

        [Required]
        public PerfilUsuario Perfil { get; set; }
    }
}
