using Microsoft.EntityFrameworkCore;
using SGHSS.Api.Models;

namespace SGHSS.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Pessoa> Pessoas => Set<Pessoa>();
    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<ProfissionalSaude> ProfissionaisSaude => Set<ProfissionalSaude>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder
            .Entity<Paciente>()
            .HasOne(p => p.Pessoa)
            .WithOne(p => p.Paciente)
            .HasForeignKey<Paciente>(p => p.IdPessoa)
            .IsRequired();

        modelBuilder.Entity<Paciente>().HasIndex(p => p.IdPessoa).IsUnique();

        modelBuilder
            .Entity<Usuario>()
            .HasOne(u => u.Pessoa)
            .WithOne(p => p.Usuario)
            .HasForeignKey<Usuario>(u => u.IdPessoa)
            .IsRequired();

        modelBuilder.Entity<Usuario>().HasIndex(u => u.IdPessoa).IsUnique();
        modelBuilder.Entity<Usuario>().HasIndex(u => u.Email).IsUnique();
        modelBuilder
            .Entity<ProfissionalSaude>()
            .HasOne(ps => ps.Pessoa)
            .WithOne(p => p.ProfissionalSaude)
            .HasForeignKey<ProfissionalSaude>(ps => ps.IdPessoa)
            .IsRequired();

        modelBuilder.Entity<ProfissionalSaude>().HasIndex(ps => ps.IdPessoa).IsUnique();
        //Agendamento - Usuario
    }
}
