using SGHSS.Api.Models;
namespace SGHSS.Api.Data;
// Cria usuario padrão do sistema
public static class DbInitializer
{
    public static void Seed(AppDbContext context)
    {
        if (context.Usuarios.Any())
            return; 

        var pessoa = new Pessoa
        {
            Nome = "SGHSS Admin",
            CPF = "054.000.000-07",
            DataNascimento = new DateTime(1986, 1, 1),
            Endereco = "Rua Principal, 123",
            Telefone = "(11) 99999-9999",
            CriadoEm = DateTime.Now,
            Ativo = true
        };
        context.Pessoas.Add(pessoa);
        context.SaveChanges();

        var usuario = new Usuario
        {
            IdPessoa = pessoa.IdPessoa,
            Email = "admin@sghss.com",
            SenhaHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Perfil = PerfilUsuario .Admin,
            Ativo = true,
            DataCriacao = DateTime.Now
};
        context.Usuarios.Add(usuario);
        context.SaveChanges();
    }
}