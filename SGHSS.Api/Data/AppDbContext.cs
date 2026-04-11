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
    public DbSet<Pagamento> Pagamentos => Set<Pagamento>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Paciente>()
            .HasOne(p => p.Pessoa)
            .WithOne(p => p.Paciente)
            .HasForeignKey<Paciente>(p => p.IdPessoa)
            .IsRequired();

        modelBuilder.Entity<Paciente>()
            .HasIndex(p => p.IdPessoa)
            .IsUnique();

        modelBuilder.Entity<Usuario>()
            .HasOne(u => u.Pessoa)
            .WithOne(p => p.Usuario)
            .HasForeignKey<Usuario>(u => u.IdPessoa)
            .IsRequired();

        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.IdPessoa)
            .IsUnique();
        modelBuilder.Entity<Usuario>()
            .HasIndex(u => u.Email)
            .IsUnique();    
        modelBuilder.Entity<ProfissionalSaude>()
            .HasOne(ps => ps.Pessoa)
            .WithOne(p => p.ProfissionalSaude)
            .HasForeignKey<ProfissionalSaude>(ps => ps.IdPessoa)
            .IsRequired();

        modelBuilder.Entity<ProfissionalSaude>()
            .HasIndex(ps => ps.IdPessoa)
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
        //Pagamento - Agendamento
        modelBuilder.Entity<Pagamento>()
            .HasOne(p => p.Agendamento)
            .WithOne()
            .HasForeignKey<Pagamento>(p => p.IdAgendamento)
            .OnDelete(DeleteBehavior.Restrict);
            // Formata valor pago para ter 2 casas decimais
            modelBuilder.Entity<Pagamento>()
            .Property(p => p.ValorPago)
            .HasPrecision(10,2);
    }
}