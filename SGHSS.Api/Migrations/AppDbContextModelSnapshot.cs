using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using SGHSS.Api.Data;
#nullable disable
namespace SGHSS.Api.Migrations
{
    [DbContext(typeof(AppDbContext))]
    partial class AppDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);
            MySqlModelBuilderExtensions.AutoIncrementColumns(modelBuilder);
            modelBuilder.Entity(
                "SGHSS.Api.Models.Paciente",
                b =>
                {
                    b.Property<int>("IdPaciente").ValueGeneratedOnAdd().HasColumnType("int");
                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(
                        b.Property<int>("IdPaciente")
                    );
                    b.Property<string>("Alergias").IsRequired().HasColumnType("longtext");
                    b.Property<bool>("Ativo").HasColumnType("tinyint(1)");
                    b.Property<DateTime>("CriadoEm").HasColumnType("datetime(6)");
                    b.Property<int>("IdPessoa").HasColumnType("int");
                    b.Property<string>("NumeroCartaoSUS").IsRequired().HasColumnType("longtext");
                    b.Property<string>("TipoSanguineo").IsRequired().HasColumnType("longtext");
                    b.HasKey("IdPaciente");
                    b.HasIndex("IdPessoa").IsUnique();
                    b.ToTable("Pacientes");
                }
            );
            modelBuilder.Entity(
                "SGHSS.Api.Models.Pessoa",
                b =>
                {
                    b.Property<int>("IdPessoa").ValueGeneratedOnAdd().HasColumnType("int");
                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(
                        b.Property<int>("IdPessoa")
                    );
                    b.Property<bool>("Ativo").HasColumnType("tinyint(1)");
                    b.Property<string>("CPF").IsRequired().HasColumnType("longtext");
                    b.Property<DateTime>("CriadoEm").HasColumnType("datetime(6)");
                    b.Property<DateTime>("DataNascimento").HasColumnType("datetime(6)");
                    b.Property<string>("Endereco").IsRequired().HasColumnType("longtext");
                    b.Property<string>("Nome").IsRequired().HasColumnType("longtext");
                    b.Property<string>("Telefone").IsRequired().HasColumnType("longtext");
                    b.HasKey("IdPessoa");
                    b.ToTable("Pessoas");
                }
            );
            modelBuilder.Entity(
                "SGHSS.Api.Models.ProfissionalSaude",
                b =>
                {
                    b.Property<int>("IdProfissionalSaude")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");
                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(
                        b.Property<int>("IdProfissionalSaude")
                    );
                    b.Property<bool>("Ativo").HasColumnType("tinyint(1)");
                    b.Property<string>("CodRegProf").IsRequired().HasColumnType("longtext");
                    b.Property<DateTime>("CriadoEm").HasColumnType("datetime(6)");
                    b.Property<string>("Especialidade").IsRequired().HasColumnType("longtext");
                    b.Property<int>("IdPessoa").HasColumnType("int");
                    b.HasKey("IdProfissionalSaude");
                    b.HasIndex("IdPessoa").IsUnique();
                    b.ToTable("ProfissionaisSaude");
                }
            );
            modelBuilder.Entity(
                "SGHSS.Api.Models.Usuario",
                b =>
                {
                    b.Property<int>("IdUsuario").ValueGeneratedOnAdd().HasColumnType("int");
                    MySqlPropertyBuilderExtensions.UseMySqlIdentityColumn(
                        b.Property<int>("IdUsuario")
                    );
                    b.Property<bool>("Ativo").HasColumnType("tinyint(1)");
                    b.Property<DateTime>("DataCriacao").HasColumnType("datetime(6)");
                    b.Property<string>("Email").IsRequired().HasColumnType("varchar(255)");
                    b.Property<int>("IdPessoa").HasColumnType("int");
                    b.Property<int>("Perfil").HasColumnType("int");
                    b.Property<string>("SenhaHash").IsRequired().HasColumnType("longtext");
                    b.HasKey("IdUsuario");
                    b.HasIndex("Email").IsUnique();
                    b.HasIndex("IdPessoa").IsUnique();
                    b.ToTable("Usuarios");
                }
            );
            modelBuilder.Entity(
                "SGHSS.Api.Models.Paciente",
                b =>
                {
                    b.HasOne("SGHSS.Api.Models.Pessoa", "Pessoa")
                        .WithOne("Paciente")
                        .HasForeignKey("SGHSS.Api.Models.Paciente", "IdPessoa")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                    b.Navigation("Pessoa");
                }
            );
            modelBuilder.Entity(
                "SGHSS.Api.Models.ProfissionalSaude",
                b =>
                {
                    b.HasOne("SGHSS.Api.Models.Pessoa", "Pessoa")
                        .WithOne("ProfissionalSaude")
                        .HasForeignKey("SGHSS.Api.Models.ProfissionalSaude", "IdPessoa")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                    b.Navigation("Pessoa");
                }
            );
            modelBuilder.Entity(
                "SGHSS.Api.Models.Usuario",
                b =>
                {
                    b.HasOne("SGHSS.Api.Models.Pessoa", "Pessoa")
                        .WithOne("Usuario")
                        .HasForeignKey("SGHSS.Api.Models.Usuario", "IdPessoa")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                    b.Navigation("Pessoa");
                }
            );
            modelBuilder.Entity(
                "SGHSS.Api.Models.Pessoa",
                b =>
                {
                    b.Navigation("Paciente");
                    b.Navigation("ProfissionalSaude");
                    b.Navigation("Usuario");
                }
            );
#pragma warning restore 612, 618
        }
    }
}
