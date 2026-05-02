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

function criarAlertaPagamento(tipo, texto, link = null) {
    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} mb-0`;
    alerta.setAttribute("role", "alert");
    alerta.append(document.createTextNode(texto));

    if (link) {
        alerta.append(document.createTextNode(" "));
        const ancora = document.createElement("a");
        ancora.className = "alert-link";
        ancora.href = link.href;
        ancora.textContent = link.texto;
        alerta.appendChild(ancora);
        alerta.append(document.createTextNode("."));
    }

    return alerta;
}

function exibirMensagemPagamento(tipo, texto, link = null) {
    if (!mensagemPagamento) return;

    mensagemPagamento.replaceChildren(criarAlertaPagamento(tipo, texto, link));
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
            "Pagamento aprovado. Agenda concluida com sucesso.",
            {
                href: "/pages/home.html",
                texto: "Voltar para Home"
            }
        );
    });
}

preencherResumo();
alternarCamposCartao();
