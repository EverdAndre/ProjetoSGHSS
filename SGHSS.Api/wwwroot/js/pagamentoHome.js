const VALOR_CONSULTA = 180;

const formPagamento = document.getElementById("formPagamento");
const mensagemPagamento = document.getElementById("mensagemPagamento");
const formaPagamento = document.getElementById("formaPagamento");
const camposCartao = document.querySelectorAll(".campo-cartao");

function obterAgendamentoPendente() {
    const dados = sessionStorage.getItem("agendamentoPendente");

    if (!dados) {
        return null;
    }

    try {
        return JSON.parse(dados);
    } catch {
        return null;
    }
}

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(dataIso) {
    if (!dataIso) return "-";

    const partes = dataIso.split("-");
    if (partes.length !== 3) return dataIso;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function preencherTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = texto;
}

function exibirMensagemPagamento(tipo, texto) {
    if (!mensagemPagamento) return;

    mensagemPagamento.innerHTML = `
        <div class="alert alert-${tipo} mb-0" role="alert">
            ${texto}
        </div>
    `;
}

function obterValorCampo(id) {
    const campo = document.getElementById(id);
    return campo ? campo.value.trim() : "";
}

function preencherResumo() {
    const agendamento = obterAgendamentoPendente();

    if (!agendamento) {
        exibirMensagemPagamento(
            "warning",
            "Nenhum agendamento pendente encontrado. Volte para a tela de agendamento."
        );
        if (formPagamento) formPagamento.classList.add("d-none");
        return;
    }

    preencherTexto("resumoEspecialidade", agendamento.especialidade);
    preencherTexto("resumoProfissional", agendamento.profissional);
    preencherTexto("resumoDataHorario", `${formatarData(agendamento.data)} as ${agendamento.horario}`);
    preencherTexto("resumoTipo", agendamento.tipo);
    preencherTexto("resumoValor", formatarMoeda(VALOR_CONSULTA));
}

function alternarCamposCartao() {
    const pagamentoPorCartao = formaPagamento && formaPagamento.value === "cartao";

    camposCartao.forEach((campo) => {
        campo.classList.toggle("d-none", !pagamentoPorCartao);
    });
}

function validarPagamento() {
    const pagamentoPorCartao = formaPagamento && formaPagamento.value === "cartao";

    if (!obterValorCampo("nomePagador") || !obterValorCampo("documentoPagador")) {
        return "Preencha nome e CPF do pagador.";
    }

    if (pagamentoPorCartao) {
        if (!obterValorCampo("numeroCartao") || !obterValorCampo("validadeCartao") || !obterValorCampo("cvvCartao")) {
            return "Preencha os dados do cartao para concluir o pagamento.";
        }
    }

    return "";
}

if (formaPagamento) {
    formaPagamento.addEventListener("change", alternarCamposCartao);
}

if (formPagamento) {
    formPagamento.addEventListener("submit", function (event) {
        event.preventDefault();

        const erro = validarPagamento();
        if (erro) {
            exibirMensagemPagamento("warning", erro);
            return;
        }

        const agendamento = obterAgendamentoPendente();
        if (!agendamento) {
            exibirMensagemPagamento(
                "warning",
                "Nenhum agendamento pendente encontrado. Volte para a tela de agendamento."
            );
            return;
        }

        const agendamentoConcluido = {
            ...agendamento,
            pagamento: {
                valor: VALOR_CONSULTA,
                forma: obterValorCampo("formaPagamento"),
                status: "pago"
            }
        };

        sessionStorage.setItem("agendamentoConcluido", JSON.stringify(agendamentoConcluido));
        sessionStorage.removeItem("agendamentoPendente");

        formPagamento.classList.add("d-none");
        exibirMensagemPagamento(
            "success",
            'Pagamento aprovado. Agenda concluida com sucesso. <a class="alert-link" href="/pages/home.html">Voltar para Home</a>.'
        );
    });
}

preencherResumo();
alternarCamposCartao();
