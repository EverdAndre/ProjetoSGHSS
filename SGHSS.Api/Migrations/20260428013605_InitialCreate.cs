using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable
// Criação inicial do banco
namespace SGHSS.Api.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase().Annotation("MySql:CharSet", "utf8mb4");
            migrationBuilder
                .CreateTable(
                    name: "Pessoas",
                    columns: table => new
                    {
                        IdPessoa = table
                            .Column<int>(type: "int", nullable: false)
                            .Annotation(
                                "MySql:ValueGenerationStrategy",
                                MySqlValueGenerationStrategy.IdentityColumn
                            ),
                        Nome = table
                            .Column<string>(type: "longtext", nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        CPF = table
                            .Column<string>(type: "longtext", nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        DataNascimento = table.Column<DateTime>(
                            type: "datetime(6)",
                            nullable: false
                        ),
                        Endereco = table
                            .Column<string>(type: "longtext", nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        Telefone = table
                            .Column<string>(type: "longtext", nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        CriadoEm = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                        Ativo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_Pessoas", x => x.IdPessoa);
                    }
                )
                .Annotation("MySql:CharSet", "utf8mb4");
            migrationBuilder
                .CreateTable(
                    name: "Pacientes",
                    columns: table => new
                    {
                        IdPaciente = table
                            .Column<int>(type: "int", nullable: false)
                            .Annotation(
                                "MySql:ValueGenerationStrategy",
                                MySqlValueGenerationStrategy.IdentityColumn
                            ),
                        IdPessoa = table.Column<int>(type: "int", nullable: false),
                        NumeroCartaoSUS = table
                            .Column<string>(type: "longtext", nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        TipoSanguineo = table
                            .Column<string>(type: "longtext", nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        Alergias = table
                            .Column<string>(type: "longtext", nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        Ativo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                        CriadoEm = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_Pacientes", x => x.IdPaciente);
                        table.ForeignKey(
                            name: "FK_Pacientes_Pessoas_IdPessoa",
                            column: x => x.IdPessoa,
                            principalTable: "Pessoas",
                            principalColumn: "IdPessoa",
                            onDelete: ReferentialAction.Cascade
                        );
                    }
                )
                .Annotation("MySql:CharSet", "utf8mb4");
            migrationBuilder
                .CreateTable(
                    name: "ProfissionaisSaude",
                    columns: table => new
                    {
                        IdProfissionalSaude = table
                            .Column<int>(type: "int", nullable: false)
                            .Annotation(
                                "MySql:ValueGenerationStrategy",
                                MySqlValueGenerationStrategy.IdentityColumn
                            ),
                        IdPessoa = table.Column<int>(type: "int", nullable: false),
                        CodRegProf = table
                            .Column<string>(type: "longtext", nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        Especialidade = table
                            .Column<string>(type: "longtext", nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        Ativo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                        CriadoEm = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_ProfissionaisSaude", x => x.IdProfissionalSaude);
                        table.ForeignKey(
                            name: "FK_ProfissionaisSaude_Pessoas_IdPessoa",
                            column: x => x.IdPessoa,
                            principalTable: "Pessoas",
                            principalColumn: "IdPessoa",
                            onDelete: ReferentialAction.Cascade
                        );
                    }
                )
                .Annotation("MySql:CharSet", "utf8mb4");
            migrationBuilder
                .CreateTable(
                    name: "Usuarios",
                    columns: table => new
                    {
                        IdUsuario = table
                            .Column<int>(type: "int", nullable: false)
                            .Annotation(
                                "MySql:ValueGenerationStrategy",
                                MySqlValueGenerationStrategy.IdentityColumn
                            ),
                        IdPessoa = table.Column<int>(type: "int", nullable: false),
                        Email = table
                            .Column<string>(type: "varchar(255)", nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        SenhaHash = table
                            .Column<string>(type: "longtext", nullable: false)
                            .Annotation("MySql:CharSet", "utf8mb4"),
                        Ativo = table.Column<bool>(type: "tinyint(1)", nullable: false),
                        DataCriacao = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                        Perfil = table.Column<int>(type: "int", nullable: false),
                    },
                    constraints: table =>
                    {
                        table.PrimaryKey("PK_Usuarios", x => x.IdUsuario);
                        table.ForeignKey(
                            name: "FK_Usuarios_Pessoas_IdPessoa",
                            column: x => x.IdPessoa,
                            principalTable: "Pessoas",
                            principalColumn: "IdPessoa",
                            onDelete: ReferentialAction.Cascade
                        );
                    }
                )
                .Annotation("MySql:CharSet", "utf8mb4");
            migrationBuilder.CreateIndex(
                name: "IX_Pacientes_IdPessoa",
                table: "Pacientes",
                column: "IdPessoa",
                unique: true
            );
            migrationBuilder.CreateIndex(
                name: "IX_ProfissionaisSaude_IdPessoa",
                table: "ProfissionaisSaude",
                column: "IdPessoa",
                unique: true
            );
            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_Email",
                table: "Usuarios",
                column: "Email",
                unique: true
            );
            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_IdPessoa",
                table: "Usuarios",
                column: "IdPessoa",
                unique: true
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "Pacientes");
            migrationBuilder.DropTable(name: "ProfissionaisSaude");
            migrationBuilder.DropTable(name: "Usuarios");
            migrationBuilder.DropTable(name: "Pessoas");
        }
    }
}
