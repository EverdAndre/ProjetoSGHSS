namespace SGHSS.Api.Dtos
{
    public class LoginRespostaDto
    {
        public string Token { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Perfil { get; set; } = string.Empty;
        public DateTime ExpiraEm { get; set; }
    }
}