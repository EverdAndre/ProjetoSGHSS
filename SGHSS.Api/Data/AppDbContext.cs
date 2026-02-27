using Microsoft.EntityFrameworkCore;
using SGHSS.Api.Models;

namespace SGHSS.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Pessoa> Pessoas => Set<Pessoa>();
    public DbSet<Paciente> Pacientes => Set<Paciente>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<ProfissionalSaude> ProfissionaisSaude => Set<ProfissionalSaude>();
    public DbSet<Agendamento> Agendamentos => Set<Agendamento>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Paciente>()
            .HasOne(p => p.Pessoa)
            .WithOne()
            .HasForeignKey<Paciente>(p => p.IdPessoa)
            .IsRequired();

        modelBuilder.Entity<Paciente>()
            .HasIndex(p => p.IdPessoa)
            .IsUnique();

        modelBuilder.Entity<Usuario>()
            .HasOne(u => u.Pessoa)
            .WithOne()
            .HasForeignKey<Usuario>(u => u.IdPessoa)
            .IsRequired();

        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.IdPessoa)
            .IsUnique();

        modelBuilder.Entity<ProfissionalSaude>()
            .HasOne(p => p.Pessoa)
            .WithOne()
            .HasForeignKey<ProfissionalSaude>(p => p.IdPessoa)
            .IsRequired();

        modelBuilder.Entity<ProfissionalSaude>()
            .HasIndex(p => p.IdPessoa)
            .IsUnique();
        //Agendamento - Usuario
        modelBuilder.Entity<Agendamento>()
            .HasOne(a => a.CriadoPorUsuario)   
            .WithMany()
            .HasForeignKey(a => a.IdCriadoPorUsuario)
            .OnDelete(DeleteBehavior.Restrict);
        //Profissional saude
        modelBuilder.Entity<Agendamento>()
            .HasOne(a => a.ProfissionalSaude)
            .WithMany()
            .HasForeignKey(a => a.IdProfissionalSaude)
            .OnDelete(DeleteBehavior.Restrict);
        //Paciente
        modelBuilder.Entity<Agendamento>()
            .HasOne(a => a.Paciente)
            .WithMany()
            .HasForeignKey(a => a.IdPaciente)
            .OnDelete(DeleteBehavior.Restrict);
        
    }
}