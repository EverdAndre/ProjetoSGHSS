const formLancamentoFinanceiro = document.getElementById("formLancamentoFinanceiro");
const mensagemFinanceiro = document.getElementById("mensagemFinanceiro");
const tabelaLancamentosFinanceiros = document.getElementById("tabelaLancamentosFinanceiros");
const filtroFinanceiro = document.getElementById("filtroFinanceiro");
const totalReceitas = document.getElementById("totalReceitas");
const totalDespesas = document.getElementById("totalDespesas");
const saldoFinanceiro = document.getElementById("saldoFinanceiro");

let lancamentosFinanceiros = [
    {
        data: "2026-05-01",
        descricao: "Consulta particular",
        tipo: "receita",
        status: "pago",
        valor: 280
    },
    {
        data: "2026-05-02",
        descricao: "Compra de materiais",
        tipo: "despesa",
        status: "pendente",
        valor: 145.9
    },
    {
        data: "2026-05-03",
        descricao: "Repasse de convenio",
        tipo: "receita",
        status: "pendente",
        valor: 620
    }
];

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

function obterValorCampo(id) {
    const campo = document.getElementById(id);
    return campo ? campo.value.trim() : "";
}

function exibirMensagemFinanceiro(tipo, texto) {
    if (!mensagemFinanceiro) return;

    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} mb-0`;
    alerta.setAttribute("role", "alert");
    alerta.textContent = texto;
    mensagemFinanceiro.replaceChildren(alerta);
}

function criarCelulaFinanceira(texto, classes = "") {
    const celula = document.createElement("td");
    if (classes) celula.className = classes;
    celula.textContent = texto;
    return celula;
}

function calcularTotais() {
    const receitas = lancamentosFinanceiros
        .filter((lancamento) => lancamento.tipo === "receita")
        .reduce((total, lancamento) => total + lancamento.valor, 0);

    const despesas = lancamentosFinanceiros
        .filter((lancamento) => lancamento.tipo === "despesa")
        .reduce((total, lancamento) => total + lancamento.valor, 0);

    if (totalReceitas) totalReceitas.textContent = formatarMoeda(receitas);
    if (totalDespesas) totalDespesas.textContent = formatarMoeda(despesas);
    if (saldoFinanceiro) saldoFinanceiro.textContent = formatarMoeda(receitas - despesas);
}

function obterLancamentosFiltrados() {
    const filtro = filtroFinanceiro ? filtroFinanceiro.value : "todos";

    if (filtro === "todos") {
        return lancamentosFinanceiros;
    }

    if (filtro === "pendente") {
        return lancamentosFinanceiros.filter((lancamento) => lancamento.status === "pendente");
    }

    return lancamentosFinanceiros.filter((lancamento) => lancamento.tipo === filtro);
}

function renderizarLancamentos() {
    if (!tabelaLancamentosFinanceiros) return;

    const lancamentos = obterLancamentosFiltrados();

    if (lancamentos.length === 0) {
        const linha = document.createElement("tr");
        const celula = criarCelulaFinanceira("Nenhum lancamento encontrado.", "text-center text-muted py-4");
        celula.colSpan = 5;
        linha.appendChild(celula);
        tabelaLancamentosFinanceiros.replaceChildren(linha);
        return;
    }

    const linhas = lancamentos.map((lancamento) => {
        const ehReceita = lancamento.tipo === "receita";
        const classeValor = ehReceita ? "text-success" : "text-danger";
        const sinal = ehReceita ? "+" : "-";
        const statusClasse = lancamento.status === "pago" ? "bg-success" : "bg-warning text-dark";

        const linha = document.createElement("tr");
        linha.appendChild(criarCelulaFinanceira(formatarData(lancamento.data)));
        linha.appendChild(criarCelulaFinanceira(lancamento.descricao));
        linha.appendChild(criarCelulaFinanceira(ehReceita ? "Receita" : "Despesa"));

        const celulaStatus = document.createElement("td");
        const badge = document.createElement("span");
        badge.className = "badge badge-status";
        statusClasse.split(" ").forEach((classe) => badge.classList.add(classe));
        badge.textContent = lancamento.status;
        celulaStatus.appendChild(badge);
        linha.appendChild(celulaStatus);

        linha.appendChild(
            criarCelulaFinanceira(`${sinal} ${formatarMoeda(lancamento.valor)}`, `text-end ${classeValor} fw-bold`)
        );

        return linha;
    });

    tabelaLancamentosFinanceiros.replaceChildren(...linhas);
}

function atualizarTelaFinanceira() {
    calcularTotais();
    renderizarLancamentos();
}

if (formLancamentoFinanceiro) {
    formLancamentoFinanceiro.addEventListener("submit", function (event) {
        event.preventDefault();

        const valor = Number(obterValorCampo("valorLancamento"));
        const lancamento = {
            tipo: obterValorCampo("tipoLancamento"),
            data: obterValorCampo("dataLancamento"),
            valor,
            status: obterValorCampo("statusLancamento"),
            descricao: obterValorCampo("descricaoLancamento")
        };

        if (!lancamento.data || !lancamento.descricao || !valor || valor <= 0) {
            exibirMensagemFinanceiro(
                "warning",
                "Preencha data, descricao e um valor maior que zero para adicionar o lancamento."
            );
            return;
        }

        lancamentosFinanceiros.push(lancamento);
        formLancamentoFinanceiro.reset();
        atualizarTelaFinanceira();
        exibirMensagemFinanceiro(
            "success",
            "Lancamento adicionado na tela. Nesta etapa, os dados ainda nao sao enviados ao backend."
        );
    });
}

if (filtroFinanceiro) {
    filtroFinanceiro.addEventListener("change", renderizarLancamentos);
}

atualizarTelaFinanceira();
