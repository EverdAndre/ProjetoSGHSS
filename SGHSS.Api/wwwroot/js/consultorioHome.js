const usuarioPerfil = localStorage.getItem("usuarioPerfil");
const mensagemConsultorio = document.getElementById("mensagemConsultorio");
const statusConsultorio = document.getElementById("statusConsultorio");
const modalConsultaVirtual = document.getElementById("modalConsultaVirtual");
const cardSalaConsulta = document.getElementById("cardSalaConsulta");
const btnEntrarSalaConsulta = document.getElementById("btnEntrarSalaConsulta");
const cardAcoesProfissional = document.getElementById("cardAcoesProfissional");
const btnVerAgendaProfissional = document.getElementById("btnVerAgendaProfissional");
const cardAgendaProfissional = document.getElementById("cardAgendaProfissional");
const tabelaAgendaProfissional = document.getElementById("tabelaAgendaProfissional");
const cardConsultasAdmin = document.getElementById("cardConsultasAdmin");
const tabelaConsultasAdmin = document.getElementById("tabelaConsultasAdmin");
const dataConsultasAdmin = document.getElementById("dataConsultasAdmin");
const totalAgendadas = document.getElementById("totalAgendadas");
const totalEmAtendimento = document.getElementById("totalEmAtendimento");
const totalCanceladas = document.getElementById("totalCanceladas");
const totalRemarcadas = document.getElementById("totalRemarcadas");
const modalEditarConsultaAdmin = document.getElementById("modalEditarConsultaAdmin");
const formEditarConsultaAdmin = document.getElementById("formEditarConsultaAdmin");
const filtroPeriodoAdmin = document.getElementById("filtroPeriodoAdmin");
const filtroDiaAdmin = document.getElementById("filtroDiaAdmin");
const filtroMesAdmin = document.getElementById("filtroMesAdmin");
const filtroAnoAdmin = document.getElementById("filtroAnoAdmin");
const btnAplicarFiltroAdmin = document.getElementById("btnAplicarFiltroAdmin");
const campoFiltroDiaAdmin = document.getElementById("campoFiltroDiaAdmin");
const campoFiltroMesAdmin = document.getElementById("campoFiltroMesAdmin");
const campoFiltroAnoAdmin = document.getElementById("campoFiltroAnoAdmin");

const consultasProfissional = [
    {
        id: 1,
        horario: "09:00",
        paciente: "Joao Pereira",
        especialidade: "Clinica Geral",
        status: "Agendada"
    },
    {
        id: 2,
        horario: "10:30",
        paciente: "Mariana Costa",
        especialidade: "Cardiologia",
        status: "Aguardando"
    },
    {
        id: 3,
        horario: "14:00",
        paciente: "Rafael Almeida",
        especialidade: "Dermatologia",
        status: "Agendada"
    }
];

const historicoConsultasAdmin = [
    {
        id: 1,
        data: "2026-05-01",
        horario: "08:30",
        paciente: "Claudia Martins",
        profissional: "Dra. Ana Souza",
        especialidade: "Clinica Geral",
        status: "Agendada",
        observacao: ""
    },
    {
        id: 2,
        data: "2026-05-01",
        horario: "09:00",
        paciente: "Joao Pereira",
        profissional: "Dr. Carlos Lima",
        especialidade: "Cardiologia",
        status: "Em atendimento",
        observacao: ""
    },
    {
        id: 3,
        data: "2026-05-01",
        horario: "10:30",
        paciente: "Mariana Costa",
        profissional: "Dra. Ana Souza",
        especialidade: "Dermatologia",
        status: "Remarcada",
        observacao: "Paciente solicitou novo horario."
    },
    {
        id: 4,
        data: "2026-04-22",
        horario: "11:15",
        paciente: "Rafael Almeida",
        profissional: "Dr. Carlos Lima",
        especialidade: "Clinica Geral",
        status: "Cancelada",
        observacao: "Cancelada pelo paciente."
    },
    {
        id: 5,
        data: "2026-03-18",
        horario: "14:00",
        paciente: "Bianca Rocha",
        profissional: "Dra. Mariana Alves",
        especialidade: "Pediatria",
        status: "Agendada",
        observacao: ""
    },
    {
        id: 6,
        data: "2025-12-12",
        horario: "15:30",
        paciente: "Lucas Andrade",
        profissional: "Dr. Carlos Lima",
        especialidade: "Cardiologia",
        status: "Remarcada",
        observacao: "Remarcada por indisponibilidade do profissional."
    }
];

function normalizarPerfil(perfil) {
    return (perfil ?? "").toLowerCase();
}

function criarAlerta(tipo, texto) {
    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} mb-0`;
    alerta.setAttribute("role", "alert");
    alerta.textContent = texto;
    return alerta;
}

function criarCelula(texto, classes = "") {
    const celula = document.createElement("td");
    if (classes) celula.className = classes;
    celula.textContent = texto;
    return celula;
}

function criarBadgeStatus(texto, classes) {
    const badge = document.createElement("span");
    badge.className = "badge badge-status";
    classes.split(" ").filter(Boolean).forEach((classe) => badge.classList.add(classe));
    badge.textContent = texto;
    return badge;
}

function exibirMensagemConsultorio(tipo, texto) {
    if (!mensagemConsultorio) return;

    mensagemConsultorio.replaceChildren(criarAlerta(tipo, texto));
}

function abrirModalConsultaPaciente() {
    if (!modalConsultaVirtual || !window.bootstrap) return;

    const modal = new bootstrap.Modal(modalConsultaVirtual);
    modal.show();
}

function formatarDataHoje() {
    return new Date().toLocaleDateString("pt-BR");
}

function obterDataHojeIso() {
    return new Date().toISOString().slice(0, 10);
}

function formatarDataIso(dataIso) {
    if (!dataIso) return "-";

    const partes = dataIso.split("-");
    if (partes.length !== 3) return dataIso;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterClasseStatus(status) {
    const statusNormalizado = normalizarPerfil(status);

    if (statusNormalizado === "agendada") return "bg-primary";
    if (statusNormalizado === "em atendimento") return "bg-success";
    if (statusNormalizado === "cancelada") return "bg-danger";
    if (statusNormalizado === "remarcada") return "bg-warning text-dark";

    return "bg-secondary";
}

function obterConsultasAdminFiltradas() {
    const periodo = filtroPeriodoAdmin ? filtroPeriodoAdmin.value : "todos";

    if (periodo === "dia") {
        const dia = filtroDiaAdmin?.value;
        return historicoConsultasAdmin.filter((consulta) => consulta.data === dia);
    }

    if (periodo === "mes") {
        const mes = filtroMesAdmin?.value;
        return historicoConsultasAdmin.filter((consulta) => consulta.data.startsWith(mes));
    }

    if (periodo === "ano") {
        const ano = filtroAnoAdmin?.value;
        return historicoConsultasAdmin.filter((consulta) => consulta.data.startsWith(ano));
    }

    return historicoConsultasAdmin;
}

function renderizarConsultasAdmin() {
    if (!tabelaConsultasAdmin) return;

    const consultas = obterConsultasAdminFiltradas();

    if (consultas.length === 0) {
        const linha = document.createElement("tr");
        const celula = criarCelula("Nenhuma consulta encontrada para o filtro selecionado.", "text-center text-muted py-4");
        celula.colSpan = 7;
        linha.appendChild(celula);
        tabelaConsultasAdmin.replaceChildren(linha);
        return;
    }

    const linhas = consultas.map((consulta) => {
        const linha = document.createElement("tr");
        linha.appendChild(criarCelula(formatarDataIso(consulta.data)));
        linha.appendChild(criarCelula(consulta.horario));
        linha.appendChild(criarCelula(consulta.paciente));
        linha.appendChild(criarCelula(consulta.profissional));
        linha.appendChild(criarCelula(consulta.especialidade));

        const celulaStatus = document.createElement("td");
        celulaStatus.appendChild(criarBadgeStatus(consulta.status, obterClasseStatus(consulta.status)));
        linha.appendChild(celulaStatus);

        const celulaAcoes = document.createElement("td");
        const acoes = document.createElement("div");
        acoes.className = "acoes-admin";
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = "btn btn-outline-primary btn-sm btn-editar-admin";
        botao.dataset.id = consulta.id;
        botao.textContent = "Editar";
        acoes.appendChild(botao);
        celulaAcoes.appendChild(acoes);
        linha.appendChild(celulaAcoes);

        return linha;
    });

    tabelaConsultasAdmin.replaceChildren(...linhas);
}

function atualizarTotaisAdmin() {
    const consultas = obterConsultasAdminFiltradas();
    const totalPorStatus = consultas.reduce((totais, consulta) => {
        totais[consulta.status] = (totais[consulta.status] ?? 0) + 1;
        return totais;
    }, {});

    if (totalAgendadas) totalAgendadas.textContent = totalPorStatus.Agendada ?? 0;
    if (totalEmAtendimento) totalEmAtendimento.textContent = totalPorStatus["Em atendimento"] ?? 0;
    if (totalCanceladas) totalCanceladas.textContent = totalPorStatus.Cancelada ?? 0;
    if (totalRemarcadas) totalRemarcadas.textContent = totalPorStatus.Remarcada ?? 0;
}

function obterConsultaAdminPorId(id) {
    return historicoConsultasAdmin.find((consulta) => consulta.id === Number(id));
}

function abrirEdicaoConsultaAdmin(id) {
    const consulta = obterConsultaAdminPorId(id);
    if (!consulta || !modalEditarConsultaAdmin || !window.bootstrap) return;

    document.getElementById("editConsultaId").value = consulta.id;
    document.getElementById("editHorarioConsulta").value = consulta.horario;
    document.getElementById("editStatusConsulta").value = consulta.status;
    document.getElementById("editProfissionalConsulta").value = consulta.profissional;
    document.getElementById("editObservacaoConsulta").value = consulta.observacao ?? "";

    const modal = new bootstrap.Modal(modalEditarConsultaAdmin);
    modal.show();
}

function configurarEdicaoConsultasAdmin() {
    if (tabelaConsultasAdmin) {
        tabelaConsultasAdmin.addEventListener("click", function (event) {
            const botaoEditar = event.target.closest(".btn-editar-admin");

            if (botaoEditar) {
                abrirEdicaoConsultaAdmin(botaoEditar.dataset.id);
            }
        });
    }

    if (formEditarConsultaAdmin) {
        formEditarConsultaAdmin.addEventListener("submit", function (event) {
            event.preventDefault();

            const consulta = obterConsultaAdminPorId(document.getElementById("editConsultaId").value);
            if (!consulta) return;

            consulta.horario = document.getElementById("editHorarioConsulta").value;
            consulta.status = document.getElementById("editStatusConsulta").value;
            consulta.profissional = document.getElementById("editProfissionalConsulta").value.trim();
            consulta.observacao = document.getElementById("editObservacaoConsulta").value.trim();

            atualizarTotaisAdmin();
            renderizarConsultasAdmin();
            bootstrap.Modal.getInstance(modalEditarConsultaAdmin)?.hide();
            exibirMensagemConsultorio("success", "Consulta atualizada no historico administrativo.");
        });
    }
}

function atualizarCamposFiltroAdmin() {
    const periodo = filtroPeriodoAdmin ? filtroPeriodoAdmin.value : "todos";

    if (campoFiltroDiaAdmin) campoFiltroDiaAdmin.classList.toggle("d-none", periodo !== "dia");
    if (campoFiltroMesAdmin) campoFiltroMesAdmin.classList.toggle("d-none", periodo !== "mes");
    if (campoFiltroAnoAdmin) campoFiltroAnoAdmin.classList.toggle("d-none", periodo !== "ano");
}

function atualizarVisaoHistoricoAdmin() {
    atualizarTotaisAdmin();
    renderizarConsultasAdmin();
}

function configurarFiltrosAdmin() {
    const hojeIso = obterDataHojeIso();

    if (filtroDiaAdmin) filtroDiaAdmin.value = hojeIso;
    if (filtroMesAdmin) filtroMesAdmin.value = hojeIso.slice(0, 7);
    if (filtroAnoAdmin) filtroAnoAdmin.value = hojeIso.slice(0, 4);

    atualizarCamposFiltroAdmin();

    if (filtroPeriodoAdmin) {
        filtroPeriodoAdmin.addEventListener("change", function () {
            atualizarCamposFiltroAdmin();
            atualizarVisaoHistoricoAdmin();
        });
    }

    if (btnAplicarFiltroAdmin) {
        btnAplicarFiltroAdmin.addEventListener("click", atualizarVisaoHistoricoAdmin);
    }
}

function configurarVisaoAdmin() {
    if (cardConsultasAdmin) {
        cardConsultasAdmin.classList.remove("d-none");
    }

    if (dataConsultasAdmin) {
        dataConsultasAdmin.textContent = `Historico completo com filtros por dia, mes e ano - hoje ${formatarDataHoje()}`;
    }

    if (statusConsultorio) {
        statusConsultorio.textContent =
            "Administrador visualizando o historico de consultas virtuais por status e periodo.";
    }

    configurarFiltrosAdmin();
    atualizarVisaoHistoricoAdmin();
    configurarEdicaoConsultasAdmin();
    exibirMensagemConsultorio("info", "Historico administrativo de consultas carregado.");
}

function renderizarAgendaProfissional() {
    if (!tabelaAgendaProfissional) return;

    const linhas = consultasProfissional.map((consulta) => {
        const linha = document.createElement("tr");
        linha.appendChild(criarCelula(consulta.horario));
        linha.appendChild(criarCelula(consulta.paciente));
        linha.appendChild(criarCelula(consulta.especialidade));

        const celulaStatus = document.createElement("td");
        celulaStatus.appendChild(criarBadgeStatus(consulta.status, "bg-primary"));
        linha.appendChild(celulaStatus);

        const celulaAcoes = document.createElement("td");
        const acoes = document.createElement("div");
        acoes.className = "acoes-consulta";

        const botaoRemarcar = document.createElement("button");
        botaoRemarcar.type = "button";
        botaoRemarcar.className = "btn btn-outline-primary btn-sm btn-remarcar";
        botaoRemarcar.dataset.id = consulta.id;
        botaoRemarcar.textContent = "Remarcar";

        const botaoAtender = document.createElement("button");
        botaoAtender.type = "button";
        botaoAtender.className = "btn btn-success btn-sm btn-atender";
        botaoAtender.dataset.id = consulta.id;
        botaoAtender.textContent = "Atender";

        acoes.append(botaoRemarcar, botaoAtender);
        celulaAcoes.appendChild(acoes);
        linha.appendChild(celulaAcoes);

        return linha;
    });

    tabelaAgendaProfissional.replaceChildren(...linhas);
}

function obterConsultaPorId(id) {
    return consultasProfissional.find((consulta) => consulta.id === Number(id));
}

function configurarAcoesAgendaProfissional() {
    if (!tabelaAgendaProfissional) return;

    tabelaAgendaProfissional.addEventListener("click", function (event) {
        const botaoAtender = event.target.closest(".btn-atender");
        const botaoRemarcar = event.target.closest(".btn-remarcar");

        if (botaoAtender) {
            const consulta = obterConsultaPorId(botaoAtender.dataset.id);
            sessionStorage.setItem("consultaEmAtendimento", JSON.stringify(consulta));
            window.location.href = "/pages/consultaHome.html";
            return;
        }

        if (botaoRemarcar) {
            exibirMensagemConsultorio(
                "info",
                "Remarcacao selecionada. Em breve esta acao abrira os horarios disponiveis."
            );
        }
    });
}

function configurarAcessoAgendaProfissional() {
    if (!btnVerAgendaProfissional || !cardAgendaProfissional) return;

    btnVerAgendaProfissional.addEventListener("click", function () {
        alternarAgendaProfissional();
    });
}

function configurarEntradaSalaConsulta() {
    if (!btnEntrarSalaConsulta) return;

    btnEntrarSalaConsulta.addEventListener("click", function () {
        const consultaPadrao = consultasProfissional[0];
        sessionStorage.setItem("consultaEmAtendimento", JSON.stringify(consultaPadrao));
        window.location.href = "/pages/consultaHome.html";
    });
}

function alternarAgendaProfissional(deveAbrir = null) {
    if (!btnVerAgendaProfissional || !cardAgendaProfissional) return;

    if (deveAbrir === null) {
        cardAgendaProfissional.classList.toggle("d-none");
    } else {
        cardAgendaProfissional.classList.toggle("d-none", !deveAbrir);
    }

    const agendaVisivel = !cardAgendaProfissional.classList.contains("d-none");
    btnVerAgendaProfissional.textContent = agendaVisivel
        ? "Ocultar Agenda de Consultas"
        : "Ver Agenda de Consultas";

    if (agendaVisivel) {
        cardAgendaProfissional.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function configurarConsultorioPorPerfil() {
    const perfil = normalizarPerfil(usuarioPerfil);
    const ehAdmin = perfil === "admin" || perfil === "administrador";
    const ehPaciente = perfil === "paciente";
    const ehProfissional = perfil === "profissionalsaude";

    if (ehAdmin) {
        configurarVisaoAdmin();
        return;
    }

    if (ehPaciente) {
        if (statusConsultorio) {
            statusConsultorio.textContent =
                "Paciente conectado ao ambiente virtual. O link da videochamada sera adicionado pelo administrador em uma proxima etapa.";
        }

        abrirModalConsultaPaciente();
        return;
    }

    if (ehProfissional) {
        if (cardAcoesProfissional) {
            cardAcoesProfissional.classList.remove("d-none");
        }

        if (statusConsultorio) {
            statusConsultorio.textContent =
                "Profissional conectado ao consultorio virtual. Use o botao de agenda para remarcar ou iniciar um atendimento.";
        }

        renderizarAgendaProfissional();
        configurarAcoesAgendaProfissional();
        configurarAcessoAgendaProfissional();
        configurarEntradaSalaConsulta();

        const parametrosUrl = new URLSearchParams(window.location.search);
        if (parametrosUrl.get("abrirAgenda") === "true") {
            if (cardSalaConsulta) {
                cardSalaConsulta.classList.add("d-none");
            }
            alternarAgendaProfissional(true);
        }

        exibirMensagemConsultorio(
            "info",
            "Area do profissional carregada. A agenda pode ser aberta pelo botao acima."
        );
        return;
    }

    exibirMensagemConsultorio(
        "warning",
        "Perfil nao reconhecido para o consultorio virtual."
    );
}

configurarConsultorioPorPerfil();
