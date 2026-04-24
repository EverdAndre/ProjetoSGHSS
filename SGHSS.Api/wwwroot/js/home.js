const token = localStorage.getItem("token");
const usuarioNome = localStorage.getItem("usuarioNome");
const API_BASE_URL = "http://localhost:5128";

const ENDPOINT_PESSOAS = `${API_BASE_URL}/api/Pessoas`;
const ENDPOINT_USUARIOS = `${API_BASE_URL}/api/Usuarios`;
const ENDPOINT_PACIENTES = `${API_BASE_URL}/api/Paciente`;

const boasVindas = document.getElementById("boasVindas");
const mensagem = document.getElementById("mensagem");
const resultado = document.getElementById("resultado");
const btnLogout = document.getElementById("btnLogout");
const btnListar = document.getElementById("btnListar");
const formCadastroPessoa = document.getElementById("formCadastroPessoa");
const btnBuscarPessoa = document.getElementById("btnBuscarPessoa");
const tabelaBuscaPessoa = document.getElementById("tabelaBuscaPessoa");
const cardPessoaSelecionada = document.getElementById("cardPessoaSelecionada");
const formAtualizacao = document.getElementById("formAtualizacao");
const perfilComplementar = document.getElementById("perfilComplementar");
const btnLimparAtualizacao = document.getElementById("btnLimparAtualizacao");
const btnAgendarConsulta = document.getElementById("btnAgendarConsulta");
const btnConsultorioVirtual = document.getElementById("btnConsultorioVirtual");
const btnFinanceiro = document.getElementById("btnFinanceiro");
const filtroListagem = document.getElementById("filtroListagem");

if (!token) {
    window.location.href = "/pages/login.html";
}

if (boasVindas) {
    boasVindas.textContent = `Bem-vindo, ${usuarioNome ?? "usuário"}`;
}

// Base comum
function exibirMensagem(tipo, texto) {
    if (!mensagem) return;

    mensagem.innerHTML = `
        <div class="alert alert-${tipo}">
            ${texto}
        </div>
    `;
}

function limparMensagem() {
    if (!mensagem) return;
    mensagem.innerHTML = "";
}

function exibirResultado(data) {
    if (!resultado) return;
    resultado.textContent = JSON.stringify(data, null, 2);
}

function validarFormatoDataBR(data) {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(data);
}

function converterDataBRParaISO(dataBR) {
    if (!validarFormatoDataBR(dataBR)) {
        throw new Error("Formato de data inválido. Use DD/MM/AAAA.");
    }

    const [dia, mes, ano] = dataBR.split("/");
    const data = new Date(`${ano}-${mes}-${dia}T00:00:00`);

    if (isNaN(data.getTime())) {
        throw new Error("Data inválida.");
    }

    return data.toISOString();
}

function converterISOParaDataBR(dataISO) {
    if (!dataISO) return "";

    const data = new Date(dataISO);
    if (isNaN(data.getTime())) return "";

    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
}

async function chamarApi(url, metodo, body = null) {
    const options = {
        method: metodo,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    };

    if (body !== null) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const contentType = response.headers.get("content-type");

    let data;
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data?.title ||
            data ||
            `Erro ${response.status} ao processar requisição.`
        );
    }

    return data;
}
// Mensagem de construção

function paginaEmConstrucao(nome) {
    const modalElement = document.getElementById("modalConstrucao");
    const textoModal = document.getElementById("textoModal");

    if (!modalElement || !textoModal) {
        exibirMensagem("warning", `Modal não encontrado. ${nome} - página em construção.`);
        if (resultado) {
            resultado.textContent = `${nome} ainda não foi implementado.`;
        }
        return;
    }

    textoModal.textContent = `${nome} - página em construção. Esta funcionalidade será apresentada em uma próxima etapa do sistema.`;

    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

function obterValor(objeto, ...chaves) {
    for (const chave of chaves) {
        if (objeto?.[chave] !== undefined && objeto?.[chave] !== null) {
            return objeto[chave];
        }
    }

    return "";
}
// Limpeza e preenchimento de formulários

function limparSelecaoPessoa() {
    if (formAtualizacao) {
        formAtualizacao.reset();
        formAtualizacao.classList.add("d-none");
    }

    const updIdPessoa = document.getElementById("updIdPessoa");
    const updIdPaciente = document.getElementById("updIdPaciente");
    const blocoUsuario = document.getElementById("blocoUsuario");
    const blocoPaciente = document.getElementById("blocoPaciente");

    if (updIdPessoa) updIdPessoa.value = "";
    if (updIdPaciente) updIdPaciente.value = "";

    if (perfilComplementar) {
        perfilComplementar.value = "";
    }

    if (blocoUsuario) {
        blocoUsuario.classList.add("d-none");
    }

    if (blocoPaciente) {
        blocoPaciente.classList.add("d-none");
    }

    if (cardPessoaSelecionada) {
        cardPessoaSelecionada.classList.add("d-none");
    }
}

// Pessoa
function preencherFormularioPessoa(pessoa) {
    const updIdPessoa = document.getElementById("updIdPessoa");
    const updNome = document.getElementById("updNome");
    const updCpf = document.getElementById("updCpf");
    const updDataNascimento = document.getElementById("updDataNascimento");
    const updEndereco = document.getElementById("updEndereco");
    const updTelefone = document.getElementById("updTelefone");
    const updAtivo = document.getElementById("updAtivo");

    if (updIdPessoa) updIdPessoa.value = obterValor(pessoa, "idPessoa", "IdPessoa");
    if (updNome) updNome.value = obterValor(pessoa, "nome", "Nome");
    if (updCpf) updCpf.value = obterValor(pessoa, "cpf", "CPF", "Cpf");

    if (updDataNascimento) {
        updDataNascimento.value = converterISOParaDataBR(
            obterValor(pessoa, "dataNascimento", "DataNascimento")
        );
    }

    if (updEndereco) updEndereco.value = obterValor(pessoa, "endereco", "Endereco");
    if (updTelefone) updTelefone.value = obterValor(pessoa, "telefone", "Telefone");
    if (updAtivo) updAtivo.checked = obterValor(pessoa, "ativo", "Ativo") !== false;
}

function preencherCardPessoaSelecionada(pessoa) {
    const selIdPessoa = document.getElementById("selIdPessoa");
    const selNomePessoa = document.getElementById("selNomePessoa");
    const selCpfPessoa = document.getElementById("selCpfPessoa");

    if (selIdPessoa) selIdPessoa.textContent = obterValor(pessoa, "idPessoa", "IdPessoa");
    if (selNomePessoa) selNomePessoa.textContent = obterValor(pessoa, "nome", "Nome");
    if (selCpfPessoa) selCpfPessoa.textContent = obterValor(pessoa, "cpf", "CPF", "Cpf");
}

function montarPayloadPessoaAtualizacao() {
    const updNome = document.getElementById("updNome");
    const updCpf = document.getElementById("updCpf");
    const updDataNascimento = document.getElementById("updDataNascimento");
    const updEndereco = document.getElementById("updEndereco");
    const updTelefone = document.getElementById("updTelefone");
    const updAtivo = document.getElementById("updAtivo");

    return {
        nome: updNome ? updNome.value.trim() : "",
        cpf: updCpf ? updCpf.value.trim() : "",
        dataNascimento: converterDataBRParaISO(
            updDataNascimento ? updDataNascimento.value.trim() : ""
        ),
        endereco: updEndereco ? updEndereco.value.trim() : "",
        telefone: updTelefone ? updTelefone.value.trim() : "",
        ativo: updAtivo ? updAtivo.checked : true
    };
}

function renderizarTabelaBuscaPessoas(lista) {
    if (!tabelaBuscaPessoa) return;

    if (!Array.isArray(lista) || lista.length === 0) {
        tabelaBuscaPessoa.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Nenhum registro encontrado.
                </td>
            </tr>
        `;
        return;
    }

    tabelaBuscaPessoa.innerHTML = lista.map((pessoa) => {
        const id = obterValor(pessoa, "idPessoa", "IdPessoa");
        const nome = obterValor(pessoa, "nome", "Nome");
        const cpf = obterValor(pessoa, "cpf", "CPF", "Cpf");

        return `
            <tr>
                <td>${id}</td>
                <td>${nome}</td>
                <td>${cpf}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-selecionar-pessoa" data-id="${id}">
                        Selecionar
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger btn-excluir-pessoa" data-id="${id}" data-nome="${nome}">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

async function carregarPessoaPorId(idPessoa) {
    return chamarApi(`${ENDPOINT_PESSOAS}/${idPessoa}`, "GET");
}

async function listarPessoas() {
    return chamarApi(ENDPOINT_PESSOAS, "GET");
}

async function buscarPessoasPorNome(nome) {
    try {
        return await chamarApi(
            `${ENDPOINT_PESSOAS}/buscar?nome=${encodeURIComponent(nome)}`,
            "GET"
        );
    } catch {
        const todas = await listarPessoas();
        return todas.filter((pessoa) => {
            const nomePessoa = obterValor(pessoa, "nome", "Nome").toLowerCase();
            return nomePessoa.includes(nome.toLowerCase());
        });
    }
}

async function criarPessoa(payload) {
    return chamarApi(ENDPOINT_PESSOAS, "POST", payload);
}

async function atualizarPessoa(idPessoa, payload) {
    return chamarApi(`${ENDPOINT_PESSOAS}/${idPessoa}`, "PATCH", payload);
}

async function excluirPessoa(idPessoa) {
    return chamarApi(`${ENDPOINT_PESSOAS}/${idPessoa}`, "DELETE");
}

// Usuário
function renderizarTabelaUsuarios(lista) {
    if (!tabelaBuscaPessoa) return;

    if (!Array.isArray(lista) || lista.length === 0) {
        tabelaBuscaPessoa.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Nenhum registro encontrado.
                </td>
            </tr>
        `;
        return;
    }

    tabelaBuscaPessoa.innerHTML = lista.map((usuario) => {
        const id = obterValor(usuario, "idUsuario", "IdUsuario");
        const nome = obterValor(usuario, "nomePessoa", "NomePessoa");
        const email = obterValor(usuario, "email", "Email");

        return `
            <tr>
                <td>${id}</td>
                <td>${nome}</td>
                <td>${email}</td>
                <td colspan="2" class="text-center text-muted">
                    Usuário
                </td>
            </tr>
        `;
    }).join("");
}

async function listarUsuarios() {
    return chamarApi(ENDPOINT_USUARIOS, "GET");
}

// Paciente
function preencherFormularioPaciente(paciente) {
    const updIdPaciente = document.getElementById("updIdPaciente");
    const updNumeroCartaoSUS = document.getElementById("updNumeroCartaoSUS");
    const updTipoSanguineo = document.getElementById("updTipoSanguineo");
    const updAlergias = document.getElementById("updAlergias");

    if (updIdPaciente) updIdPaciente.value = obterValor(paciente, "idPaciente", "IdPaciente");
    if (updNumeroCartaoSUS) {
        updNumeroCartaoSUS.value = obterValor(paciente, "numeroCartaoSUS", "NumeroCartaoSUS");
    }
    if (updTipoSanguineo) {
        updTipoSanguineo.value = obterValor(paciente, "tipoSanguineo", "TipoSanguineo");
    }
    if (updAlergias) {
        updAlergias.value = obterValor(paciente, "alergias", "Alergias");
    }
}

function limparFormularioPaciente() {
    const updIdPaciente = document.getElementById("updIdPaciente");
    const updNumeroCartaoSUS = document.getElementById("updNumeroCartaoSUS");
    const updTipoSanguineo = document.getElementById("updTipoSanguineo");
    const updAlergias = document.getElementById("updAlergias");

    if (updIdPaciente) updIdPaciente.value = "";
    if (updNumeroCartaoSUS) updNumeroCartaoSUS.value = "";
    if (updTipoSanguineo) updTipoSanguineo.value = "";
    if (updAlergias) updAlergias.value = "";
}

function montarPayloadPacienteAtualizacao() {
    const updNome = document.getElementById("updNome");
    const updCpf = document.getElementById("updCpf");
    const updTelefone = document.getElementById("updTelefone");
    const updNumeroCartaoSUS = document.getElementById("updNumeroCartaoSUS");
    const updTipoSanguineo = document.getElementById("updTipoSanguineo");
    const updAlergias = document.getElementById("updAlergias");

    return {
        nome: updNome ? updNome.value.trim() : "",
        cpf: updCpf ? updCpf.value.trim() : "",
        telefone: updTelefone ? updTelefone.value.trim() : "",
        numeroCartaoSUS: updNumeroCartaoSUS ? updNumeroCartaoSUS.value.trim() : "",
        tipoSanguineo: updTipoSanguineo ? updTipoSanguineo.value.trim() : "",
        alergias: updAlergias ? updAlergias.value.trim() : ""
    };
}

function montarPayloadPacienteCriacao() {
    const updNumeroCartaoSUS = document.getElementById("updNumeroCartaoSUS");
    const updTipoSanguineo = document.getElementById("updTipoSanguineo");
    const updAlergias = document.getElementById("updAlergias");

    return {
        numeroCartaoSUS: updNumeroCartaoSUS ? updNumeroCartaoSUS.value.trim() : "",
        tipoSanguineo: updTipoSanguineo ? updTipoSanguineo.value.trim() : "",
        alergias: updAlergias ? updAlergias.value.trim() : ""
    };
}

function renderizarTabelaPacientes(lista) {
    if (!tabelaBuscaPessoa) return;

    if (!Array.isArray(lista) || lista.length === 0) {
        tabelaBuscaPessoa.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted">
                    Nenhum registro encontrado.
                </td>
            </tr>
        `;
        return;
    }

    tabelaBuscaPessoa.innerHTML = lista.map((paciente) => {
        const id = obterValor(paciente, "idPaciente", "IdPaciente");
        const idPessoa = obterValor(paciente, "idPessoa", "IdPessoa");
        const nome = obterValor(paciente, "nome", "Nome");
        const cpf = obterValor(paciente, "cpf", "CPF");

        return `
            <tr>
                <td>${id}</td>
                <td>${nome}</td>
                <td>${cpf}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-selecionar-paciente" data-id="${id}" data-id-pessoa="${idPessoa}">
                        Selecionar
                    </button>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger btn-excluir-paciente" data-id="${id}" data-nome="${nome}">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

async function carregarPaciente(idPaciente) {
    return chamarApi(`${ENDPOINT_PACIENTES}/${idPaciente}`, "GET");
}

async function listarPacientes() {
    return chamarApi(ENDPOINT_PACIENTES, "GET");
}

async function carregarPacientePorPessoa(idPessoa) {
    const pacientes = await listarPacientes();
    return pacientes.find((paciente) => String(obterValor(paciente, "idPessoa", "IdPessoa")) === String(idPessoa)) ?? null;
}

async function buscarPacientesPorNome(nome) {
    try {
        return await chamarApi(
            `${ENDPOINT_PACIENTES}/buscar?nome=${encodeURIComponent(nome)}`,
            "GET"
        );
    } catch {
        const todos = await listarPacientes();
        return todos.filter((paciente) => {
            const nomePaciente = obterValor(paciente, "nome", "Nome").toLowerCase();
            return nomePaciente.includes(nome.toLowerCase());
        });
    }
}

async function criarPaciente(idPessoa, payload) {
    return chamarApi(`${ENDPOINT_PACIENTES}/pessoa/${idPessoa}`, "POST", payload);
}

async function atualizarPaciente(idPaciente, payload) {
    return chamarApi(`${ENDPOINT_PACIENTES}/${idPaciente}`, "PATCH", payload);
}

async function excluirPaciente(idPaciente) {
    return chamarApi(`${ENDPOINT_PACIENTES}/${idPaciente}`, "DELETE");
}

function mostrarBlocosComplementares(tipo) {
    const blocoUsuario = document.getElementById("blocoUsuario");
    const blocoPaciente = document.getElementById("blocoPaciente");

    if (blocoUsuario) {
        blocoUsuario.classList.toggle("d-none", tipo !== "usuario");
    }

    if (blocoPaciente) {
        blocoPaciente.classList.toggle("d-none", tipo !== "paciente");
    }
}

// Eventos
if (btnListar) {
    btnListar.addEventListener("click", async function () {
        limparMensagem();
        if (resultado) resultado.textContent = "Carregando...";

        try {
            const filtro = filtroListagem ? filtroListagem.value : "";
            let data = [];

            switch (filtro) {
                case "usuarios":
                    data = await listarUsuarios();
                    renderizarTabelaUsuarios(data);
                    exibirMensagem("success", "Usuários carregados com sucesso.");
                    break;

                case "pacientes":
                    data = await listarPacientes();
                    renderizarTabelaPacientes(data);
                    exibirMensagem("success", "Pacientes carregados com sucesso.");
                    break;

                case "pessoas":
                default:
                    data = await listarPessoas();
                    renderizarTabelaBuscaPessoas(data);
                    exibirMensagem("success", "Pessoas carregadas com sucesso.");
                    break;
            }

            exibirResultado(data);
        } catch (error) {
            exibirMensagem("danger", error.message);
            if (resultado) resultado.textContent = "";
        }
    });
}

if (formCadastroPessoa) {
    formCadastroPessoa.addEventListener("submit", async function (event) {
        event.preventDefault();

        limparMensagem();
        if (resultado) resultado.textContent = "Cadastrando pessoa...";

        try {
            const cadNome = document.getElementById("cadNome");
            const cadCpf = document.getElementById("cadCpf");
            const cadDataNascimento = document.getElementById("cadDataNascimento");
            const cadEndereco = document.getElementById("cadEndereco");
            const cadTelefone = document.getElementById("cadTelefone");
            const cadAtivo = document.getElementById("cadAtivo");

            const novaPessoa = {
                nome: cadNome ? cadNome.value.trim() : "",
                cpf: cadCpf ? cadCpf.value.trim() : "",
                dataNascimento: converterDataBRParaISO(
                    cadDataNascimento ? cadDataNascimento.value.trim() : ""
                ),
                endereco: cadEndereco ? cadEndereco.value.trim() : "",
                telefone: cadTelefone ? cadTelefone.value.trim() : "",
                ativo: cadAtivo ? cadAtivo.checked : true
            };

            const data = await criarPessoa(novaPessoa);

            exibirMensagem("success", "Pessoa cadastrada com sucesso.");
            exibirResultado(data);
            formCadastroPessoa.reset();

            if (cadAtivo) {
                cadAtivo.checked = true;
            }
        } catch (error) {
            exibirMensagem("danger", error.message);
            if (resultado) resultado.textContent = "";
        }
    });
}

if (btnBuscarPessoa) {
    btnBuscarPessoa.addEventListener("click", async function () {
        limparMensagem();
        if (resultado) resultado.textContent = "Buscando pessoas...";

        try {
            const buscaNomeAtualizacao = document.getElementById("buscaNomeAtualizacao");
            const nome = buscaNomeAtualizacao ? buscaNomeAtualizacao.value.trim() : "";

            if (!nome) {
                throw new Error("Digite um nome para buscar.");
            }

            const lista = await buscarPessoasPorNome(nome);
            renderizarTabelaBuscaPessoas(lista);
            exibirMensagem("success", "Busca realizada com sucesso.");
            exibirResultado(lista);
        } catch (error) {
            exibirMensagem("danger", error.message);
            if (resultado) resultado.textContent = "";
        }
    });
}

if (tabelaBuscaPessoa) {
    tabelaBuscaPessoa.addEventListener("click", async function (event) {
        const botaoSelecionar = event.target.closest(".btn-selecionar-pessoa");
        const botaoExcluir = event.target.closest(".btn-excluir-pessoa");
        const botaoSelecionarPaciente = event.target.closest(".btn-selecionar-paciente");
        const botaoExcluirPaciente = event.target.closest(".btn-excluir-paciente");

        if (botaoSelecionar) {
            limparMensagem();
            if (resultado) resultado.textContent = "Carregando dados da pessoa...";

            try {
                const idPessoa = botaoSelecionar.dataset.id;
                const pessoa = await carregarPessoaPorId(idPessoa);

                preencherCardPessoaSelecionada(pessoa);
                preencherFormularioPessoa(pessoa);
                mostrarBlocosComplementares("");

                if (perfilComplementar) {
                    perfilComplementar.value = "";
                }

                if (cardPessoaSelecionada) {
                    cardPessoaSelecionada.classList.remove("d-none");
                }

                if (formAtualizacao) {
                    formAtualizacao.classList.remove("d-none");
                }

                exibirMensagem("success", `Pessoa ${idPessoa} selecionada para atualização.`);
                exibirResultado(pessoa);
            } catch (error) {
                exibirMensagem("danger", error.message);
                if (resultado) resultado.textContent = "";
            }

            return;
        }

        if (botaoSelecionarPaciente) {
            limparMensagem();
            if (resultado) resultado.textContent = "Carregando dados do paciente...";

            try {
                const idPaciente = botaoSelecionarPaciente.dataset.id;
                const idPessoa = botaoSelecionarPaciente.dataset.idPessoa;
                const paciente = await carregarPaciente(idPaciente);
                const pessoa = await carregarPessoaPorId(idPessoa);

                preencherCardPessoaSelecionada(pessoa);
                preencherFormularioPessoa(pessoa);
                preencherFormularioPaciente(paciente);
                mostrarBlocosComplementares("paciente");

                if (perfilComplementar) {
                    perfilComplementar.value = "paciente";
                }

                if (cardPessoaSelecionada) {
                    cardPessoaSelecionada.classList.remove("d-none");
                }

                if (formAtualizacao) {
                    formAtualizacao.classList.remove("d-none");
                }

                exibirMensagem("success", `Paciente ${idPaciente} selecionado para atualização.`);
                exibirResultado(paciente);
            } catch (error) {
                exibirMensagem("danger", error.message);
                if (resultado) resultado.textContent = "";
            }

            return;
        }

        if (botaoExcluir) {
            const idPessoa = botaoExcluir.dataset.id;
            const nomePessoa = botaoExcluir.dataset.nome;
            const confirmar = confirm(`Deseja excluir a pessoa "${nomePessoa}" (ID ${idPessoa})?`);

            if (!confirmar) return;

            limparMensagem();
            if (resultado) resultado.textContent = "Excluindo pessoa...";

            try {
                const resposta = await excluirPessoa(idPessoa);
                exibirMensagem(
                    "success",
                    typeof resposta === "string" ? resposta : "Pessoa removida com sucesso."
                );
                exibirResultado(resposta);

                const listaAtualizada = await listarPessoas();
                renderizarTabelaBuscaPessoas(listaAtualizada);
            } catch (error) {
                exibirMensagem("danger", error.message);
                if (resultado) resultado.textContent = "";
            }
        }

        if (botaoExcluirPaciente) {
            const idPaciente = botaoExcluirPaciente.dataset.id;
            const nomePaciente = botaoExcluirPaciente.dataset.nome;
            const confirmar = confirm(`Deseja excluir o paciente "${nomePaciente}" (ID ${idPaciente})?`);

            if (!confirmar) return;

            limparMensagem();
            if (resultado) resultado.textContent = "Excluindo paciente...";

            try {
                const resposta = await excluirPaciente(idPaciente);
                exibirMensagem(
                    "success",
                    typeof resposta === "string" ? resposta : "Paciente removido com sucesso."
                );
                exibirResultado(resposta);

                const listaAtualizada = await listarPacientes();
                renderizarTabelaPacientes(listaAtualizada);
            } catch (error) {
                exibirMensagem("danger", error.message);
                if (resultado) resultado.textContent = "";
            }
        }
    });
}

if (perfilComplementar) {
    perfilComplementar.addEventListener("change", async function () {
        const tipo = perfilComplementar.value;
        const updIdPessoa = document.getElementById("updIdPessoa");
        const idPessoa = updIdPessoa ? updIdPessoa.value : "";

        mostrarBlocosComplementares(tipo);

        if (!tipo) {
            limparFormularioPaciente();
            return;
        }

        if (tipo === "paciente") {
            if (!idPessoa) {
                exibirMensagem("warning", "Selecione uma pessoa antes de carregar o perfil de paciente.");
                return;
            }

            try {
                const paciente = await carregarPacientePorPessoa(idPessoa);

                if (paciente) {
                    preencherFormularioPaciente(paciente);
                    exibirMensagem("success", "Paciente carregado para edição.");
                } else {
                    limparFormularioPaciente();
                    exibirMensagem("warning", "Nenhum paciente encontrado para esta pessoa. Você pode criar um agora.");
                }
            } catch (error) {
                exibirMensagem("danger", error.message);
            }

            return;
        }

        exibirMensagem("warning", `Perfil complementar "${tipo}" ainda não está implementado no backend.`);
    });
}

if (formAtualizacao) {
    formAtualizacao.addEventListener("submit", async function (event) {
        event.preventDefault();

        limparMensagem();
        if (resultado) resultado.textContent = "Salvando atualização...";

        try {
            const updIdPessoa = document.getElementById("updIdPessoa");
            const updIdPaciente = document.getElementById("updIdPaciente");
            const idPessoa = updIdPessoa ? updIdPessoa.value : "";
            const idPaciente = updIdPaciente ? updIdPaciente.value : "";
            const tipoPerfil = perfilComplementar ? perfilComplementar.value : "";

            if (!idPessoa) {
                throw new Error("Nenhuma pessoa selecionada.");
            }

            if (tipoPerfil === "paciente") {
                let pacienteAtualizado;

                if (idPaciente) {
                    pacienteAtualizado = await atualizarPaciente(
                        idPaciente,
                        montarPayloadPacienteAtualizacao()
                    );
                    exibirMensagem("success", "Paciente atualizado com sucesso.");
                } else {
                    pacienteAtualizado = await criarPaciente(
                        idPessoa,
                        montarPayloadPacienteCriacao()
                    );
                    preencherFormularioPaciente(pacienteAtualizado);
                    exibirMensagem("success", "Paciente criado com sucesso.");
                }

                exibirResultado(pacienteAtualizado);
            } else {
                const payloadPessoa = montarPayloadPessoaAtualizacao();
                const pessoaAtualizada = await atualizarPessoa(idPessoa, payloadPessoa);

                if (tipoPerfil) {
                    exibirMensagem(
                        "warning",
                        `Pessoa atualizada com sucesso. O perfil complementar "${tipoPerfil}" ainda não foi implementado no backend.`
                    );
                } else {
                    exibirMensagem("success", "Pessoa atualizada com sucesso.");
                }

                exibirResultado(pessoaAtualizada);
            }
        } catch (error) {
            exibirMensagem("danger", error.message);
            if (resultado) resultado.textContent = "";
        }
    });
}

if (btnLimparAtualizacao) {
    btnLimparAtualizacao.addEventListener("click", function () {
        limparSelecaoPessoa();
        limparMensagem();
        if (resultado) resultado.textContent = "";
    });
}

if (btnLogout) {
    btnLogout.addEventListener("click", function () {
        localStorage.clear();
        window.location.href = "/pages/login.html";
    });
}

if (btnAgendarConsulta) {
    btnAgendarConsulta.addEventListener("click", function () {
        paginaEmConstrucao("Agendar Consulta");
    });
}

if (btnConsultorioVirtual) {
    btnConsultorioVirtual.addEventListener("click", function () {
        paginaEmConstrucao("Consultório Virtual");
    });
}

if (btnFinanceiro) {
    btnFinanceiro.addEventListener("click", function () {
        paginaEmConstrucao("Financeiro");
    });
}
