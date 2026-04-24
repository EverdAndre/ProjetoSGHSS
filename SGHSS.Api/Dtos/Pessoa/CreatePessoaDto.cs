using System.ComponentModel.DataAnnotations;

namespace SGHSS.Api.Dtos
{
    public class CreatePessoaDto
    {
        [Required(ErrorMessage = "O nome é obrigatório")]
        [RegularExpression(@"^[A-Za-zÀ-ÿ\s]+$", ErrorMessage = "O nome deve conter apenas letras")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O CPF é obrigatório")]
        [RegularExpression(@"^\d{11}$", ErrorMessage = "O CPF deve conter exatamente 11 números")]
        public string CPF { get; set; } = string.Empty;
        public DateTime DataNascimento { get; set; }
        public string Endereco { get; set; } = string.Empty;

        [Required(ErrorMessage = "O telefone é obrigatório")]
        public string Telefone { get; set; } = string.Empty;
    }
}
