using Microsoft.EntityFrameworkCore;
using SGHSS.Api.Models;

namespace SGHSS.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Pessoa> Pessoas => Set<Pessoa>();
}