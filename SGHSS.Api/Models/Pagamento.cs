using System.ComponentModel.DataAnnotations;
namespace SGHSS.Api.Models;
using SGHSS.Api.Enums;

public class Pagamento
{
    [Key]
    public int IdPagamento { get; set; }
    public int IdAgendamento { get; set; }
    public Agendamento Agendamento { get; set; } = null!;
    public decimal ValorPago { get; set; }
    public FormaPagamento? FormaPagamento { get; set; }
    public StatusPagamento? Status { get; set; }
    public DateTime DataHoraPagamento { get; set; }
}