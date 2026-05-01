const formAgendamento = document.getElementById("formAgendamento");
const mensagemAgendamento = document.getElementById("mensagemAgendamento");
const resumoAgendamento = document.getElementById("resumoAgendamento");

function exibirMensagemAgendamento(tipo, texto) {
    if (!mensagemAgendamento) return;

    mensagemAgendamento.innerHTML = `
        <div class="alert alert-${tipo} mb-0" role="alert">
            ${texto}
        </div>
    `;
}

function obterValorCampo(id) {
    const campo = document.getElementById(id);
    return campo ? campo.value.trim() : "";
}

function atualizarResumoAgendamento(dados) {
    if (!resumoAgendamento) return;

    resumoAgendamento.textContent =
        `Consulta ${dados.tipo.toLowerCase()} com ${dados.profissional}, ` +
        `na especialidade ${dados.especialidade}, agendada para ${dados.data} ` +
        `as ${dados.horario}.`;
}

if (formAgendamento) {
    formAgendamento.addEventListener("submit", function (event) {
        event.preventDefault();

        const dados = {
            especialidade: obterValorCampo("especialidade"),
            profissional: obterValorCampo("profissional"),
            data: obterValorCampo("dataConsulta"),
            horario: obterValorCampo("horarioConsulta"),
            tipo: obterValorCampo("tipoConsulta"),
            observacoes: obterValorCampo("observacoes")
        };

        if (!dados.especialidade || !dados.profissional || !dados.data || !dados.horario) {
            exibirMensagemAgendamento(
                "warning",
                "Preencha especialidade, profissional, data e horario para continuar."
            );
            return;
        }

        atualizarResumoAgendamento(dados);
        sessionStorage.setItem("agendamentoPendente", JSON.stringify(dados));
        window.location.href = "/pages/pagamentoHome.html";
    });
}
