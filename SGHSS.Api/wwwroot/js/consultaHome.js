const mensagemConsulta = document.getElementById("mensagemConsulta");
const btnFinalizarConsulta = document.getElementById("btnFinalizarConsulta");
const btnVerDadosPaciente = document.getElementById("btnVerDadosPaciente");
const btnVerProntuario = document.getElementById("btnVerProntuario");
const btnCriarProntuario = document.getElementById("btnCriarProntuario");
const cardDadosPaciente = document.getElementById("cardDadosPaciente");
const cardProntuario = document.getElementById("cardProntuario");
const statusProntuario = document.getElementById("statusProntuario");
const formAnotacaoAtendimento = document.getElementById("formAnotacaoAtendimento");
const formDocumentoPaciente = document.getElementById("formDocumentoPaciente");
const listaDocumentosPaciente = document.getElementById("listaDocumentosPaciente");
const listaHistoricoPaciente = document.getElementById("listaHistoricoPaciente");
const itemAbaHistorico = document.getElementById("itemAbaHistorico");
const abaAnotacoes = document.getElementById("aba-anotacoes");

let documentosPaciente = [
    {
        tipo: "Exame",
        descricao: "Hemograma completo",
        arquivo: "hemograma.pdf"
    },
    {
        tipo: "Autorizacao",
        descricao: "Autorizacao para teleconsulta",
        arquivo: "autorizacao.pdf"
    }
];

let historicoPaciente = [
    {
        data: "15/04/2026",
        descricao: "Consulta de retorno com queixa de dor persistente. Orientado repouso e acompanhamento."
    },
    {
        data: "02/03/2026",
        descricao: "Primeira avaliacao. Solicitados exames laboratoriais."
    }
];

function obterConsultaEmAtendimento() {
    const dados = sessionStorage.getItem("consultaEmAtendimento");

    if (!dados) {
        return null;
    }

    try {
        return JSON.parse(dados);
    } catch {
        return null;
    }
}

function preencherTexto(id, texto) {
    const elemento = document.getElementById(id);
    if (elemento) elemento.textContent = texto;
}

function obterValorCampo(id) {
    const campo = document.getElementById(id);
    return campo ? campo.value.trim() : "";
}

function escaparHtml(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

function exibirMensagemConsulta(tipo, texto) {
    if (!mensagemConsulta) return;

    mensagemConsulta.innerHTML = `
        <div class="alert alert-${tipo} mb-0" role="alert">
            ${texto}
        </div>
    `;
}

function alternarCard(card) {
    if (!card) return;
    card.classList.toggle("d-none");
}

function exibirCard(card) {
    if (!card) return;
    card.classList.remove("d-none");
    card.scrollIntoView({ behavior: "smooth", block: "start" });
}

function configurarHistoricoProntuario(deveExibir) {
    if (itemAbaHistorico) {
        itemAbaHistorico.classList.toggle("d-none", !deveExibir);
    }

    if (!deveExibir && abaAnotacoes && window.bootstrap) {
        const aba = new bootstrap.Tab(abaAnotacoes);
        aba.show();
    }
}

function renderizarDocumentosPaciente() {
    if (!listaDocumentosPaciente) return;

    listaDocumentosPaciente.innerHTML = documentosPaciente
        .map((documento) => `
            <li>
                <strong>${escaparHtml(documento.tipo)}:</strong>
                ${escaparHtml(documento.descricao)}
                <span class="d-block text-muted">${escaparHtml(documento.arquivo)}</span>
            </li>
        `)
        .join("");
}

function renderizarHistoricoPaciente() {
    if (!listaHistoricoPaciente) return;

    listaHistoricoPaciente.innerHTML = historicoPaciente
        .map((item) => `
            <li>
                <strong>${escaparHtml(item.data)}</strong>
                <span class="d-block">${escaparHtml(item.descricao)}</span>
            </li>
        `)
        .join("");
}

function carregarConsulta() {
    const consulta = obterConsultaEmAtendimento();

    if (!consulta) {
        exibirMensagemConsulta(
            "warning",
            "Nenhuma consulta foi selecionada. Volte ao consultorio virtual e escolha uma consulta para atender."
        );
        if (btnFinalizarConsulta) btnFinalizarConsulta.disabled = true;
        return;
    }

    preencherTexto("consultaPaciente", consulta.paciente);
    preencherTexto("consultaHorario", consulta.horario);
    preencherTexto("consultaEspecialidade", consulta.especialidade);
    preencherTexto("consultaStatus", "Em atendimento");
    preencherTexto("pacienteNome", consulta.paciente);
}

if (btnVerDadosPaciente) {
    btnVerDadosPaciente.addEventListener("click", function () {
        alternarCard(cardDadosPaciente);
    });
}

if (btnVerProntuario) {
    btnVerProntuario.addEventListener("click", function () {
        exibirCard(cardProntuario);
        configurarHistoricoProntuario(true);
        if (statusProntuario) statusProntuario.textContent = "Prontuario existente";
    });
}

if (btnCriarProntuario) {
    btnCriarProntuario.addEventListener("click", function () {
        exibirCard(cardProntuario);
        configurarHistoricoProntuario(false);
        if (statusProntuario) statusProntuario.textContent = "Novo prontuario";
        exibirMensagemConsulta(
            "info",
            "Novo prontuario iniciado. Preencha as anotacoes e inclua exames ou documentos quando necessario."
        );
    });
}

if (formAnotacaoAtendimento) {
    formAnotacaoAtendimento.addEventListener("submit", function (event) {
        event.preventDefault();

        const anotacao = obterValorCampo("anotacoesAtendimento");
        if (!anotacao) {
            exibirMensagemConsulta("warning", "Digite uma anotacao para salvar no prontuario.");
            return;
        }

        historicoPaciente.unshift({
            data: "Hoje",
            descricao: anotacao
        });
        renderizarHistoricoPaciente();
        exibirMensagemConsulta("success", "Anotacoes salvas no prontuario desta consulta.");
    });
}

if (formDocumentoPaciente) {
    formDocumentoPaciente.addEventListener("submit", function (event) {
        event.preventDefault();

        const tipo = obterValorCampo("tipoDocumento");
        const descricao = obterValorCampo("nomeDocumento");
        const arquivoInput = document.getElementById("arquivoDocumento");
        const arquivo = arquivoInput?.files?.[0]?.name ?? "Arquivo nao selecionado";

        if (!descricao) {
            exibirMensagemConsulta("warning", "Informe uma descricao para incluir o documento.");
            return;
        }

        documentosPaciente.push({ tipo, descricao, arquivo });
        formDocumentoPaciente.reset();
        renderizarDocumentosPaciente();
        exibirMensagemConsulta("success", "Documento incluido no prontuario do paciente.");
    });
}

if (btnFinalizarConsulta) {
    btnFinalizarConsulta.addEventListener("click", function () {
        sessionStorage.removeItem("consultaEmAtendimento");
        exibirMensagemConsulta(
            "success",
            'Consulta finalizada. <a class="alert-link" href="/pages/consultorioHome.html">Voltar para agenda</a>.'
        );
        btnFinalizarConsulta.disabled = true;
    });
}

carregarConsulta();
renderizarDocumentosPaciente();
renderizarHistoricoPaciente();
