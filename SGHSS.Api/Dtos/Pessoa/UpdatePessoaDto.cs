using System.ComponentModel.DataAnnotations;

namespace SGHSS.Api.Dtos
{
    public class UpdatePessoaDto
    {
        [RegularExpression(
            @"^[A-Za-zÀ-ÿ'\-\s]+$",
            ErrorMessage = "O nome deve conter apenas letras."
        )]
        public string? Nome { get; set; }

        [RegularExpression(@"^\d{11}$", ErrorMessage = "O CPF deve conter exatamente 11 números.")]
        public string? CPF { get; set; }

        public DateTime? DataNascimento { get; set; }

        public string? Endereco { get; set; }

        public string? Telefone { get; set; }

        public bool? Ativo { get; set; }
    }
}
