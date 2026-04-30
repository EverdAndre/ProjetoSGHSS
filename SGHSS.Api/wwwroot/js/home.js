const token = localStorage.getItem("token");
const usuarioNome = localStorage.getItem("usuarioNome");
const usuarioPerfil = localStorage.getItem("usuarioPerfil");
const API_BASE_URL = window.location.origin;

const ENDPOINT_PESSOAS = `${API_BASE_URL}/api/Pessoas`;
const ENDPOINT_USUARIOS = `${API_BASE_URL}/api/Usuarios`;
const ENDPOINT_PACIENTES = `${API_BASE_URL}/api/Paciente`;
const ENDPOINT_PROFISSIONAIS = `${API_BASE_URL}/api/Profissional`;

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
const accordionHome = document.getElementById("accordionHome");
const blocoUsuario = document.getElementById("blocoUsuario");
const blocoProfissional = document.getElementById("blocoProfissional");
const blocoPaciente = document.getElementById("blocoPaciente");
const cadDataNascimentoCampo = document.getElementById("cadDataNascimento");
const updDataNascimentoCampo = document.getElementById("updDataNascimento");

if (!token) {
    window.location.href = "/pages/login.html";
}
if (boasVindas) {
    boasVindas.textContent = `Bem-vindo, ${usuarioNome ?? "usuário"}`;
}

configurarMascaraDataBR(cadDataNascimentoCampo);
configurarMascaraDataBR(updDataNascimentoCampo);
aplicarControleAcessoPorPerfil();

// Base comum
function ocultarElemento(elemento, deveOcultar) {
    if (!elemento) return;
    elemento.classList.toggle("d-none", deveOcultar);
}

function normalizarPerfil(perfil) {
    return (perfil ?? "").toLowerCase();
}

function aplicarControleAcessoPorPerfil() {
    const perfil = normalizarPerfil(usuarioPerfil);
    const ehAdmin = perfil === "admin" || perfil === "administrador";
    const ehProfissional = perfil === "profissionalsaude";
    const ehPaciente = perfil === "paciente";

    if (ehAdmin) {
        return;
    }

    ocultarElemento(btnAgendarConsulta?.closest(".col-md-4"), !ehPaciente);
    ocultarElemento(btnConsultorioVirtual?.closest(".col-md-4"), !(ehProfissional || ehPaciente));
    ocultarElemento(btnFinanceiro?.closest(".col-md-4"), true);
    ocultarElemento(accordionHome, true);
    ocultarElemento(resultado?.closest(".card"), true);

    if (ehProfissional) {
        exibirMensagem("info", "Acesso de profissional: Consultório Virtual disponível.");
        return;
    }

    if (ehPaciente) {
        exibirMensagem("info", "Acesso de paciente: Agendar Consulta e Consultório Virtual disponíveis.");
        return;
    }
    exibirMensagem("warning", "Perfil de acesso não reconhecido.");
}

function exibirMensagem(tipo, texto) {
    if (!mensagem) return;
    mensagem.replaceChildren();
    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = texto;
    mensagem.appendChild(alerta);

    if (tipo === "danger") {
        exibirPopupAmigavel("Não foi possível concluir", texto, "danger");
    }
}

function limparMensagem() {
    if (!mensagem) return;
    mensagem.replaceChildren();
}

function exibirPopupAmigavel(titulo, texto, tipo = "primary") {
    const modalElement = document.getElementById("modalConstrucao");
    const textoModal = document.getElementById("textoModal");
    const tituloModal = modalElement?.querySelector(".modal-title");
    const cabecalhoModal = modalElement?.querySelector(".modal-header");

    if (!modalElement || !textoModal || !tituloModal || !cabecalhoModal || !window.bootstrap) {
        return;
    }

    tituloModal.textContent = titulo;
    textoModal.textContent = texto;
    cabecalhoModal.className = `modal-header bg-${tipo} text-white`;

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
}

function exibirCampoInvalido(campo) {
    const rotulo = campo.labels?.[0]?.textContent?.trim();
    const texto = rotulo
        ? `${rotulo}: ${campo.validationMessage}`
        : campo.validationMessage;

    exibirMensagem("danger", texto);
}

function extrairMensagemErroApi(data, status) {
    if (typeof data === "string") {
        try {
            return extrairMensagemErroApi(JSON.parse(data), status);
        } catch {
            return data || `Erro ${status} ao processar requisição.`;
        }
    }

    if (data?.errors) {
        return Object.values(data.errors).flat().join(" ");
    }

    return (
        data?.message ||
        data?.title ||
        `Erro ${status} ao processar requisição.`
    );
}

function exibirResultado(data) {
    if (!resultado) return;
    resultado.textContent = JSON.stringify(data, null, 2);
}

function validarFormatoDataBR(data) {
    return /^\d{2}\/\d{2}\/\d{4}$/.test(data);
}

function aplicarMascaraDataBR(valor) {
    const digitos = valor.replace(/\D/g, "").slice(0, 8);
    const partes = [];

    if (digitos.length > 0) {
        partes.push(digitos.slice(0, 2));
    }
    if (digitos.length > 2) {
        partes.push(digitos.slice(2, 4));
    }
    if (digitos.length > 4) {
        partes.push(digitos.slice(4, 8));
    }
    return partes.join("/");
}

function configurarMascaraDataBR(campo) {
    if (!campo) return;
    campo.addEventListener("input", function () {
        campo.value = aplicarMascaraDataBR(campo.value);
    });
}

function validarNumeroCartaoSUS(numeroCartaoSUS) {
    return /^\d+$/.test(numeroCartaoSUS);
}

function validarCampoNumeroCartaoSUS(campo) {
    if (!campo) return true;
    const valor = campo.value.trim();
    if (!valor || validarNumeroCartaoSUS(valor)) {
        campo.setCustomValidity("");
        return true;
    }

    campo.setCustomValidity("O número do Cartão SUS deve conter apenas números.");
    return false;
}

function validarSenhasIguais(senha, confirmarSenha, senhaObrigatoria) {
    if (senhaObrigatoria && !senha) {
        throw new Error("Informe a senha do usuário.");
    }
    if (senhaObrigatoria && !confirmarSenha) {
        throw new Error("Confirme a senha do usuário.");
    }
    if ((senha || confirmarSenha) && senha !== confirmarSenha) {
        throw new Error("As senhas digitadas não conferem.");
    }
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
        const error = new Error(extrairMensagemErroApi(data, response.status));
        error.status = response.status;
        throw error;
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
    exibirPopupAmigavel("Aviso", textoModal.textContent, "primary");
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
    const updIdUsuario = document.getElementById("updIdUsuario");
    const updIdPaciente = document.getElementById("updIdPaciente");
    const updIdProfissionalSaude = document.getElementById("updIdProfissionalSaude");

    if (updIdPessoa) updIdPessoa.value = "";
    if (updIdUsuario) updIdUsuario.value = "";
    if (updIdPaciente) updIdPaciente.value = "";
    if (updIdProfissionalSaude) updIdProfissionalSaude.value = "";
    if (perfilComplementar) {
        perfilComplementar.value = "";
    }
    if (blocoUsuario) {
        blocoUsuario.classList.add("d-none");
    }
    if (blocoProfissional) {
        blocoProfissional.classList.add("d-none");
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

function criarCelula(texto) {
    const td = document.createElement("td");
    td.textContent = texto;
    return td;
}

function renderizarLinhaVazia() {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 5;
    td.className = "text-center text-muted";
    td.textContent = "Nenhum registro encontrado.";
    tr.appendChild(td);
    tabelaBuscaPessoa.appendChild(tr);
}

function renderizarTabelaBuscaPessoas(lista) {
    if (!tabelaBuscaPessoa) return;

    tabelaBuscaPessoa.replaceChildren();

    if (!Array.isArray(lista) || lista.length === 0) {
        renderizarLinhaVazia();
        return;
    }

    lista.forEach((pessoa) => {
        const id = obterValor(pessoa, "idPessoa", "IdPessoa");
        const nome = obterValor(pessoa, "nome", "Nome");
        const cpf = obterValor(pessoa, "cpf", "CPF", "Cpf");

        const tr = document.createElement("tr");
        tr.appendChild(criarCelula(String(id)));
        tr.appendChild(criarCelula(nome));
        tr.appendChild(criarCelula(cpf));

        const tdSelecionar = document.createElement("td");
        const btnSelecionar = document.createElement("button");
        btnSelecionar.className = "btn btn-sm btn-outline-primary btn-selecionar-pessoa";
        btnSelecionar.dataset.id = String(id);
        btnSelecionar.textContent = "Selecionar";
        tdSelecionar.appendChild(btnSelecionar);

        const tdExcluir = document.createElement("td");
        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn btn-sm btn-outline-danger btn-excluir-pessoa";
        btnExcluir.dataset.id = String(id);
        btnExcluir.dataset.nome = nome;
        btnExcluir.textContent = "Excluir";
        tdExcluir.appendChild(btnExcluir);

        tr.appendChild(tdSelecionar);
        tr.appendChild(tdExcluir);

        tabelaBuscaPessoa.appendChild(tr);
    });
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
    } catch (error) {
        if (error.status !== 404 && error.status !== 405) {
            throw error;
        }

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

    tabelaBuscaPessoa.replaceChildren();

    if (!Array.isArray(lista) || lista.length === 0) {
        renderizarLinhaVazia();
        return;
    }

    lista.forEach((usuario) => {
        const id = obterValor(usuario, "idUsuario", "IdUsuario");
        const idPessoa = obterValor(usuario, "idPessoa", "IdPessoa");
        const nome = obterValor(usuario, "nomePessoa", "NomePessoa");
        const email = obterValor(usuario, "email", "Email");

        const tr = document.createElement("tr");
        tr.appendChild(criarCelula(String(id)));
        tr.appendChild(criarCelula(nome));
        tr.appendChild(criarCelula(email));

        const tdSelecionar = document.createElement("td");
        const btnSelecionar = document.createElement("button");
        btnSelecionar.className = "btn btn-sm btn-outline-primary btn-selecionar-usuario";
        btnSelecionar.dataset.id = String(id);
        btnSelecionar.dataset.idPessoa = String(idPessoa);
        btnSelecionar.textContent = "Selecionar";
        tdSelecionar.appendChild(btnSelecionar);

        const tdExcluir = document.createElement("td");
        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn btn-sm btn-outline-danger btn-excluir-usuario";
        btnExcluir.dataset.id = String(id);
        btnExcluir.dataset.nome = nome;
        btnExcluir.textContent = "Excluir";
        tdExcluir.appendChild(btnExcluir);

        tr.appendChild(tdSelecionar);
        tr.appendChild(tdExcluir);

        tabelaBuscaPessoa.appendChild(tr);
    });
}

async function listarUsuarios() {
    return chamarApi(ENDPOINT_USUARIOS, "GET");
}

function preencherFormularioUsuario(usuario) {
    const updIdUsuario = document.getElementById("updIdUsuario");
    const updEmailUsuario = document.getElementById("updEmailUsuario");
    const updSenhaUsuario = document.getElementById("updSenhaUsuario");
    const updConfirmarSenhaUsuario = document.getElementById("updConfirmarSenhaUsuario");
    const updPerfilUsuario = document.getElementById("updPerfilUsuario");
    const updUsuarioAtivo = document.getElementById("updUsuarioAtivo");

    if (updIdUsuario) updIdUsuario.value = obterValor(usuario, "idUsuario", "IdUsuario");
    if (updEmailUsuario) updEmailUsuario.value = obterValor(usuario, "email", "Email");
    if (updSenhaUsuario) updSenhaUsuario.value = "";
    if (updConfirmarSenhaUsuario) updConfirmarSenhaUsuario.value = "";
    if (updPerfilUsuario) {
        updPerfilUsuario.value = String(obterValor(usuario, "perfil", "Perfil"));
    }
    if (updUsuarioAtivo) {
        updUsuarioAtivo.checked = obterValor(usuario, "ativo", "Ativo") !== false;
    }
}

function limparFormularioUsuario() {
    const updIdUsuario = document.getElementById("updIdUsuario");
    const updEmailUsuario = document.getElementById("updEmailUsuario");
    const updSenhaUsuario = document.getElementById("updSenhaUsuario");
    const updConfirmarSenhaUsuario = document.getElementById("updConfirmarSenhaUsuario");
    const updPerfilUsuario = document.getElementById("updPerfilUsuario");
    const updUsuarioAtivo = document.getElementById("updUsuarioAtivo");

    if (updIdUsuario) updIdUsuario.value = "";
    if (updEmailUsuario) updEmailUsuario.value = "";
    if (updSenhaUsuario) updSenhaUsuario.value = "";
    if (updConfirmarSenhaUsuario) updConfirmarSenhaUsuario.value = "";
    if (updPerfilUsuario) updPerfilUsuario.value = "";
    if (updUsuarioAtivo) updUsuarioAtivo.checked = true;
}

function obterPerfilUsuarioPorTipo(tipo) {
    const perfis = {
        admin: 1,
        profissional: 2,
        paciente: 3
    };

    return perfis[tipo] ?? "";
}

function obterTipoPorPerfilUsuario(perfil) {
    const tipos = {
        1: "admin",
        2: "profissional",
        3: "paciente"
    };

    return tipos[Number(perfil)] ?? "";
}

function sincronizarPerfilUsuario(tipo) {
    const updPerfilUsuario = document.getElementById("updPerfilUsuario");

    if (updPerfilUsuario) {
        updPerfilUsuario.value = String(obterPerfilUsuarioPorTipo(tipo));
    }
}

function configurarObrigatoriedadeUsuario(loginObrigatorio, senhaObrigatoria) {
    const updEmailUsuario = document.getElementById("updEmailUsuario");
    const updSenhaUsuario = document.getElementById("updSenhaUsuario");
    const updConfirmarSenhaUsuario = document.getElementById("updConfirmarSenhaUsuario");
    const updPerfilUsuario = document.getElementById("updPerfilUsuario");

    if (updEmailUsuario) updEmailUsuario.required = loginObrigatorio;
    if (updPerfilUsuario) updPerfilUsuario.required = loginObrigatorio;
    if (updSenhaUsuario) updSenhaUsuario.required = senhaObrigatoria;
    if (updConfirmarSenhaUsuario) updConfirmarSenhaUsuario.required = senhaObrigatoria;
}

function montarPayloadUsuarioCriacao(idPessoa) {
    const updEmailUsuario = document.getElementById("updEmailUsuario");
    const updSenhaUsuario = document.getElementById("updSenhaUsuario");
    const updConfirmarSenhaUsuario = document.getElementById("updConfirmarSenhaUsuario");
    const updPerfilUsuario = document.getElementById("updPerfilUsuario");

    const email = updEmailUsuario ? updEmailUsuario.value.trim() : "";
    const senha = updSenhaUsuario ? updSenhaUsuario.value : "";
    const confirmarSenha = updConfirmarSenhaUsuario ? updConfirmarSenhaUsuario.value : "";
    const perfil = updPerfilUsuario ? Number(updPerfilUsuario.value) : 0;

    if (!email) {
        throw new Error("Informe o email do usuário.");
    }

    validarSenhasIguais(senha, confirmarSenha, true);

    if (!perfil) {
        throw new Error("Selecione o perfil do usuário.");
    }

    return {
        idPessoa: Number(idPessoa),
        email,
        senha,
        perfil
    };
}

function montarPayloadUsuarioAtualizacao() {
    const updEmailUsuario = document.getElementById("updEmailUsuario");
    const updSenhaUsuario = document.getElementById("updSenhaUsuario");
    const updConfirmarSenhaUsuario = document.getElementById("updConfirmarSenhaUsuario");
    const updPerfilUsuario = document.getElementById("updPerfilUsuario");
    const updUsuarioAtivo = document.getElementById("updUsuarioAtivo");

    const payload = {
        email: updEmailUsuario ? updEmailUsuario.value.trim() : "",
        perfil: updPerfilUsuario ? Number(updPerfilUsuario.value) : null,
        ativo: updUsuarioAtivo ? updUsuarioAtivo.checked : true
    };

    const senha = updSenhaUsuario ? updSenhaUsuario.value : "";
    const confirmarSenha = updConfirmarSenhaUsuario ? updConfirmarSenhaUsuario.value : "";

    validarSenhasIguais(senha, confirmarSenha, false);

    if (senha) {
        payload.senha = senha;
    }

    if (!payload.email) {
        throw new Error("Informe o email do usuário.");
    }

    if (!payload.perfil) {
        throw new Error("Selecione o perfil do usuário.");
    }

    return payload;
}

async function carregarUsuario(idUsuario) {
    return chamarApi(`${ENDPOINT_USUARIOS}/${idUsuario}`, "GET");
}

async function carregarUsuarioPorPessoa(idPessoa) {
    const usuarios = await listarUsuarios();
    return usuarios.find((usuario) => {
        return String(obterValor(usuario, "idPessoa", "IdPessoa")) === String(idPessoa);
    }) ?? null;
}

async function carregarUsuarioParaPerfil(idPessoa, tipo) {
    const usuario = await carregarUsuarioPorPessoa(idPessoa);

    if (usuario) {
        preencherFormularioUsuario(usuario);
    } else {
        limparFormularioUsuario();
    }

    sincronizarPerfilUsuario(tipo);
    configurarObrigatoriedadeUsuario(true, !usuario);
    return usuario;
}

async function criarUsuario(payload) {
    return chamarApi(ENDPOINT_USUARIOS, "POST", payload);
}

async function atualizarUsuario(idUsuario, payload) {
    return chamarApi(`${ENDPOINT_USUARIOS}/${idUsuario}`, "PATCH", payload);
}

async function excluirUsuario(idUsuario) {
    return chamarApi(`${ENDPOINT_USUARIOS}/${idUsuario}`, "DELETE");
}

// Profissional
function preencherFormularioProfissional(profissional) {
    const updIdProfissionalSaude = document.getElementById("updIdProfissionalSaude");
    const updCodRegProf = document.getElementById("updCodRegProf");
    const updEspecialidade = document.getElementById("updEspecialidade");
    const updProfissionalAtivo = document.getElementById("updProfissionalAtivo");

    if (updIdProfissionalSaude) {
        updIdProfissionalSaude.value = obterValor(
            profissional,
            "idProfissionalSaude",
            "IdProfissionalSaude"
        );
    }
    if (updCodRegProf) {
        updCodRegProf.value = obterValor(profissional, "codRegProf", "CodRegProf");
    }
    if (updEspecialidade) {
        updEspecialidade.value = obterValor(profissional, "especialidade", "Especialidade");
    }
    if (updProfissionalAtivo) {
        updProfissionalAtivo.checked = obterValor(profissional, "ativo", "Ativo") !== false;
    }
}

function limparFormularioProfissional() {
    const updIdProfissionalSaude = document.getElementById("updIdProfissionalSaude");
    const updCodRegProf = document.getElementById("updCodRegProf");
    const updEspecialidade = document.getElementById("updEspecialidade");
    const updProfissionalAtivo = document.getElementById("updProfissionalAtivo");

    if (updIdProfissionalSaude) updIdProfissionalSaude.value = "";
    if (updCodRegProf) updCodRegProf.value = "";
    if (updEspecialidade) updEspecialidade.value = "";
    if (updProfissionalAtivo) updProfissionalAtivo.checked = true;
}

function montarPayloadProfissionalCriacao() {
    const updCodRegProf = document.getElementById("updCodRegProf");
    const updEspecialidade = document.getElementById("updEspecialidade");
    const codRegProf = updCodRegProf ? updCodRegProf.value.trim() : "";
    const especialidade = updEspecialidade ? updEspecialidade.value.trim() : "";

    if (!codRegProf || !validarNumeroCartaoSUS(codRegProf)) {
        throw new Error("O Registro Profissional deve conter apenas números.");
    }

    if (!especialidade) {
        throw new Error("Informe a especialidade do profissional.");
    }

    return {
        codRegProf,
        especialidade
    };
}

function montarPayloadProfissionalAtualizacao() {
    const updProfissionalAtivo = document.getElementById("updProfissionalAtivo");

    return {
        ...montarPayloadProfissionalCriacao(),
        ativo: updProfissionalAtivo ? updProfissionalAtivo.checked : true
    };
}

function renderizarTabelaProfissionais(lista) {
    if (!tabelaBuscaPessoa) return;

    tabelaBuscaPessoa.replaceChildren();

    if (!Array.isArray(lista) || lista.length === 0) {
        renderizarLinhaVazia();
        return;
    }

    lista.forEach((profissional) => {
        const id = obterValor(profissional, "idProfissionalSaude", "IdProfissionalSaude");
        const idPessoa = obterValor(profissional, "idPessoa", "IdPessoa");
        const nome = obterValor(profissional, "nome", "Nome");
        const cpf = obterValor(profissional, "cpf", "CPF");

        const tr = document.createElement("tr");
        tr.appendChild(criarCelula(String(id)));
        tr.appendChild(criarCelula(nome));
        tr.appendChild(criarCelula(cpf));

        const tdSelecionar = document.createElement("td");
        const btnSelecionar = document.createElement("button");
        btnSelecionar.className = "btn btn-sm btn-outline-primary btn-selecionar-profissional";
        btnSelecionar.dataset.id = String(id);
        btnSelecionar.dataset.idPessoa = String(idPessoa);
        btnSelecionar.textContent = "Selecionar";
        tdSelecionar.appendChild(btnSelecionar);

        const tdExcluir = document.createElement("td");
        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn btn-sm btn-outline-danger btn-excluir-profissional";
        btnExcluir.dataset.id = String(id);
        btnExcluir.dataset.nome = nome;
        btnExcluir.textContent = "Excluir";
        tdExcluir.appendChild(btnExcluir);

        tr.appendChild(tdSelecionar);
        tr.appendChild(tdExcluir);

        tabelaBuscaPessoa.appendChild(tr);
    });
}

async function carregarProfissional(idProfissional) {
    return chamarApi(`${ENDPOINT_PROFISSIONAIS}/${idProfissional}`, "GET");
}

async function listarProfissionais() {
    return chamarApi(ENDPOINT_PROFISSIONAIS, "GET");
}

async function carregarProfissionalPorPessoa(idPessoa) {
    const profissionais = await listarProfissionais();
    return profissionais.find((profissional) => {
        return String(obterValor(profissional, "idPessoa", "IdPessoa")) === String(idPessoa);
    }) ?? null;
}

async function buscarProfissionaisPorNome(nome) {
    return chamarApi(
        `${ENDPOINT_PROFISSIONAIS}/buscar?nome=${encodeURIComponent(nome)}`,
        "GET"
    );
}

async function criarProfissional(idPessoa, payload) {
    return chamarApi(`${ENDPOINT_PROFISSIONAIS}/pessoa/${idPessoa}`, "POST", payload);
}

async function atualizarProfissional(idProfissional, payload) {
    return chamarApi(`${ENDPOINT_PROFISSIONAIS}/${idProfissional}`, "PATCH", payload);
}

async function excluirProfissional(idProfissional) {
    return chamarApi(`${ENDPOINT_PROFISSIONAIS}/${idProfissional}`, "DELETE");
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

    const numeroCartaoSUS = updNumeroCartaoSUS ? updNumeroCartaoSUS.value.trim() : "";

    if (!numeroCartaoSUS || !validarNumeroCartaoSUS(numeroCartaoSUS)) {
        throw new Error("O número do Cartão SUS deve conter apenas números.");
    }

    return {
        nome: updNome ? updNome.value.trim() : "",
        cpf: updCpf ? updCpf.value.trim() : "",
        telefone: updTelefone ? updTelefone.value.trim() : "",
        numeroCartaoSUS,
        tipoSanguineo: updTipoSanguineo ? updTipoSanguineo.value.trim() : "",
        alergias: updAlergias ? updAlergias.value.trim() : ""
    };
}

function montarPayloadPacienteCriacao() {
    const updNumeroCartaoSUS = document.getElementById("updNumeroCartaoSUS");
    const updTipoSanguineo = document.getElementById("updTipoSanguineo");
    const updAlergias = document.getElementById("updAlergias");
    const numeroCartaoSUS = updNumeroCartaoSUS ? updNumeroCartaoSUS.value.trim() : "";

    if (!numeroCartaoSUS || !validarNumeroCartaoSUS(numeroCartaoSUS)) {
        throw new Error("O número do Cartão SUS deve conter apenas números.");
    }

    return {
        numeroCartaoSUS,
        tipoSanguineo: updTipoSanguineo ? updTipoSanguineo.value.trim() : "",
        alergias: updAlergias ? updAlergias.value.trim() : ""
    };
}

function renderizarTabelaPacientes(lista) {
    if (!tabelaBuscaPessoa) return;

    tabelaBuscaPessoa.replaceChildren();

    if (!Array.isArray(lista) || lista.length === 0) {
        renderizarLinhaVazia();
        return;
    }

    lista.forEach((paciente) => {
        const id = obterValor(paciente, "idPaciente", "IdPaciente");
        const idPessoa = obterValor(paciente, "idPessoa", "IdPessoa");
        const nome = obterValor(paciente, "nome", "Nome");
        const cpf = obterValor(paciente, "cpf", "CPF");

        const tr = document.createElement("tr");
        tr.appendChild(criarCelula(String(id)));
        tr.appendChild(criarCelula(nome));
        tr.appendChild(criarCelula(cpf));

        const tdSelecionar = document.createElement("td");
        const btnSelecionar = document.createElement("button");
        btnSelecionar.className = "btn btn-sm btn-outline-primary btn-selecionar-paciente";
        btnSelecionar.dataset.id = String(id);
        btnSelecionar.dataset.idPessoa = String(idPessoa);
        btnSelecionar.textContent = "Selecionar";
        tdSelecionar.appendChild(btnSelecionar);

        const tdExcluir = document.createElement("td");
        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn btn-sm btn-outline-danger btn-excluir-paciente";
        btnExcluir.dataset.id = String(id);
        btnExcluir.dataset.nome = nome;
        btnExcluir.textContent = "Excluir";
        tdExcluir.appendChild(btnExcluir);

        tr.appendChild(tdSelecionar);
        tr.appendChild(tdExcluir);

        tabelaBuscaPessoa.appendChild(tr);
    });
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
    } catch (error) {
        if (error.status !== 404 && error.status !== 405) {
            throw error;
        }

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
    const deveMostrarUsuario = ["admin", "profissional", "paciente"].includes(tipo);
    const updIdUsuario = document.getElementById("updIdUsuario");
    const usuarioNovo = !(updIdUsuario?.value);

    if (blocoUsuario) {
        blocoUsuario.classList.toggle("d-none", !deveMostrarUsuario);
    }

    if (blocoProfissional) {
        blocoProfissional.classList.toggle("d-none", tipo !== "profissional");
    }

    if (blocoPaciente) {
        blocoPaciente.classList.toggle("d-none", tipo !== "paciente");
    }

    sincronizarPerfilUsuario(tipo);
    configurarObrigatoriedadeUsuario(deveMostrarUsuario, deveMostrarUsuario && usuarioNovo);
}

async function carregarComplementosPessoaSelecionada(idPessoa) {
    const [usuario, profissional, paciente] = await Promise.all([
        carregarUsuarioPorPessoa(idPessoa),
        carregarProfissionalPorPessoa(idPessoa),
        carregarPacientePorPessoa(idPessoa)
    ]);

    let tipo = usuario
        ? obterTipoPorPerfilUsuario(obterValor(usuario, "perfil", "Perfil"))
        : "";

    if (!tipo && profissional) {
        tipo = "profissional";
    }

    if (!tipo && paciente) {
        tipo = "paciente";
    }

    if (usuario) {
        preencherFormularioUsuario(usuario);
    } else {
        limparFormularioUsuario();
    }

    if (profissional) {
        preencherFormularioProfissional(profissional);
    } else {
        limparFormularioProfissional();
    }

    if (paciente) {
        preencherFormularioPaciente(paciente);
    } else {
        limparFormularioPaciente();
    }

    if (perfilComplementar) {
        perfilComplementar.value = tipo;
    }

    mostrarBlocosComplementares(tipo);
}

mostrarBlocosComplementares(perfilComplementar ? perfilComplementar.value : "");

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

                case "profissionais":
                    data = await listarProfissionais();
                    renderizarTabelaProfissionais(data);
                    exibirMensagem("success", "Profissionais carregados com sucesso.");
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
        const botaoSelecionarUsuario = event.target.closest(".btn-selecionar-usuario");
        const botaoExcluirUsuario = event.target.closest(".btn-excluir-usuario");
        const botaoSelecionarPaciente = event.target.closest(".btn-selecionar-paciente");
        const botaoExcluirPaciente = event.target.closest(".btn-excluir-paciente");
        const botaoSelecionarProfissional = event.target.closest(".btn-selecionar-profissional");
        const botaoExcluirProfissional = event.target.closest(".btn-excluir-profissional");

        if (botaoSelecionar) {
            limparMensagem();
            if (resultado) resultado.textContent = "Carregando dados da pessoa...";

            try {
                const idPessoa = botaoSelecionar.dataset.id;
                const pessoa = await carregarPessoaPorId(idPessoa);

                preencherCardPessoaSelecionada(pessoa);
                preencherFormularioPessoa(pessoa);
                await carregarComplementosPessoaSelecionada(idPessoa);

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
                limparFormularioUsuario();
                limparFormularioProfissional();
                preencherFormularioPaciente(paciente);
                await carregarUsuarioParaPerfil(idPessoa, "paciente");
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

        if (botaoSelecionarUsuario) {
            limparMensagem();
            if (resultado) resultado.textContent = "Carregando dados do usuário...";

            try {
                const idUsuario = botaoSelecionarUsuario.dataset.id;
                const idPessoa = botaoSelecionarUsuario.dataset.idPessoa;
                const usuario = await carregarUsuario(idUsuario);
                const pessoa = await carregarPessoaPorId(idPessoa);
                const tipoUsuario = obterTipoPorPerfilUsuario(obterValor(usuario, "perfil", "Perfil"));

                preencherCardPessoaSelecionada(pessoa);
                preencherFormularioPessoa(pessoa);
                preencherFormularioUsuario(usuario);
                limparFormularioPaciente();
                limparFormularioProfissional();

                if (tipoUsuario === "paciente") {
                    const paciente = await carregarPacientePorPessoa(idPessoa);
                    if (paciente) preencherFormularioPaciente(paciente);
                }

                if (tipoUsuario === "profissional") {
                    const profissional = await carregarProfissionalPorPessoa(idPessoa);
                    if (profissional) preencherFormularioProfissional(profissional);
                }

                mostrarBlocosComplementares(tipoUsuario);

                if (perfilComplementar) {
                    perfilComplementar.value = tipoUsuario;
                }

                if (cardPessoaSelecionada) {
                    cardPessoaSelecionada.classList.remove("d-none");
                }

                if (formAtualizacao) {
                    formAtualizacao.classList.remove("d-none");
                }

                exibirMensagem("success", `Usuário ${idUsuario} selecionado para atualização.`);
                exibirResultado(usuario);
            } catch (error) {
                exibirMensagem("danger", error.message);
                if (resultado) resultado.textContent = "";
            }

            return;
        }

        if (botaoSelecionarProfissional) {
            limparMensagem();
            if (resultado) resultado.textContent = "Carregando dados do profissional...";

            try {
                const idProfissional = botaoSelecionarProfissional.dataset.id;
                const idPessoa = botaoSelecionarProfissional.dataset.idPessoa;
                const profissional = await carregarProfissional(idProfissional);
                const pessoa = await carregarPessoaPorId(idPessoa);

                preencherCardPessoaSelecionada(pessoa);
                preencherFormularioPessoa(pessoa);
                limparFormularioUsuario();
                limparFormularioPaciente();
                preencherFormularioProfissional(profissional);
                await carregarUsuarioParaPerfil(idPessoa, "profissional");
                mostrarBlocosComplementares("profissional");

                if (perfilComplementar) {
                    perfilComplementar.value = "profissional";
                }

                if (cardPessoaSelecionada) {
                    cardPessoaSelecionada.classList.remove("d-none");
                }

                if (formAtualizacao) {
                    formAtualizacao.classList.remove("d-none");
                }

                exibirMensagem("success", `Profissional ${idProfissional} selecionado para atualização.`);
                exibirResultado(profissional);
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

        if (botaoExcluirUsuario) {
            const idUsuario = botaoExcluirUsuario.dataset.id;
            const nomeUsuario = botaoExcluirUsuario.dataset.nome;
            const confirmar = confirm(`Deseja excluir o usuário "${nomeUsuario}" (ID ${idUsuario})?`);

            if (!confirmar) return;

            limparMensagem();
            if (resultado) resultado.textContent = "Excluindo usuário...";

            try {
                const resposta = await excluirUsuario(idUsuario);
                exibirMensagem(
                    "success",
                    typeof resposta === "string" ? resposta : "Usuário removido com sucesso."
                );
                exibirResultado(resposta);

                const listaAtualizada = await listarUsuarios();
                renderizarTabelaUsuarios(listaAtualizada);
            } catch (error) {
                exibirMensagem("danger", error.message);
                if (resultado) resultado.textContent = "";
            }
        }

        if (botaoExcluirProfissional) {
            const idProfissional = botaoExcluirProfissional.dataset.id;
            const nomeProfissional = botaoExcluirProfissional.dataset.nome;
            const confirmar = confirm(`Deseja excluir o profissional "${nomeProfissional}" (ID ${idProfissional})?`);

            if (!confirmar) return;

            limparMensagem();
            if (resultado) resultado.textContent = "Excluindo profissional...";

            try {
                const resposta = await excluirProfissional(idProfissional);
                exibirMensagem(
                    "success",
                    typeof resposta === "string" ? resposta : "Profissional removido com sucesso."
                );
                exibirResultado(resposta);

                const listaAtualizada = await listarProfissionais();
                renderizarTabelaProfissionais(listaAtualizada);
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
            limparFormularioUsuario();
            limparFormularioPaciente();
            limparFormularioProfissional();
            return;
        }

        if (tipo === "admin") {
            if (!idPessoa) {
                exibirMensagem("warning", "Selecione uma pessoa antes de carregar o usuário.");
                return;
            }

            try {
                const usuario = await carregarUsuarioParaPerfil(idPessoa, tipo);

                if (usuario) {
                    exibirMensagem("success", "Usuário carregado para edição.");
                } else {
                    sincronizarPerfilUsuario(tipo);
                    exibirMensagem("warning", "Nenhum usuário encontrado para esta pessoa. Você pode criar um login agora.");
                }
            } catch (error) {
                exibirMensagem("danger", error.message);
            }

            return;
        }

        if (tipo === "profissional") {
            if (!idPessoa) {
                exibirMensagem("warning", "Selecione uma pessoa antes de carregar o perfil de profissional.");
                return;
            }

            try {
                const profissional = await carregarProfissionalPorPessoa(idPessoa);

                if (profissional) {
                    preencherFormularioProfissional(profissional);
                    exibirMensagem("success", "Profissional carregado para edição.");
                } else {
                    limparFormularioProfissional();
                    exibirMensagem("warning", "Nenhum profissional encontrado para esta pessoa. Você pode criar um agora.");
                }

                await carregarUsuarioParaPerfil(idPessoa, tipo);
            } catch (error) {
                exibirMensagem("danger", error.message);
            }

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

                await carregarUsuarioParaPerfil(idPessoa, tipo);
            } catch (error) {
                exibirMensagem("danger", error.message);
            }

            return;
        }

        exibirMensagem("warning", `Perfil complementar "${tipo}" ainda não está implementado no backend.`);
    });
}

const updNumeroCartaoSUSCampo = document.getElementById("updNumeroCartaoSUS");

document.querySelectorAll(".btn-toggle-senha").forEach((botao) => {
    botao.addEventListener("click", function () {
        const campo = document.getElementById(botao.dataset.target);

        if (!campo) return;

        const deveMostrar = campo.type === "password";
        campo.type = deveMostrar ? "text" : "password";
        botao.textContent = deveMostrar ? "Ocultar" : "Mostrar";
    });
});

if (updNumeroCartaoSUSCampo) {
    updNumeroCartaoSUSCampo.addEventListener("input", function () {
        validarCampoNumeroCartaoSUS(updNumeroCartaoSUSCampo);
    });

    updNumeroCartaoSUSCampo.addEventListener("blur", function () {
        if (!validarCampoNumeroCartaoSUS(updNumeroCartaoSUSCampo)) {
            updNumeroCartaoSUSCampo.reportValidity();
            exibirMensagem("danger", "O número do Cartão SUS deve conter apenas números.");
        }
    });
}

if (formAtualizacao) {
    formAtualizacao.addEventListener("invalid", function (event) {
        event.preventDefault();
        exibirCampoInvalido(event.target);
        if (resultado) resultado.textContent = "";
    }, true);

    formAtualizacao.addEventListener("submit", function (event) {
        const tipoPerfil = perfilComplementar ? perfilComplementar.value : "";

        if (tipoPerfil !== "paciente" || !updNumeroCartaoSUSCampo) {
            return;
        }

        if (!validarCampoNumeroCartaoSUS(updNumeroCartaoSUSCampo)) {
            event.preventDefault();
            updNumeroCartaoSUSCampo.reportValidity();
            exibirMensagem("danger", "O número do Cartão SUS deve conter apenas números.");
            if (resultado) resultado.textContent = "";
        }
    }, true);

    formAtualizacao.addEventListener("submit", async function (event) {
        event.preventDefault();

        limparMensagem();
        if (resultado) resultado.textContent = "Salvando atualização...";

        try {
            const updIdPessoa = document.getElementById("updIdPessoa");
            const updIdUsuario = document.getElementById("updIdUsuario");
            const updIdPaciente = document.getElementById("updIdPaciente");
            const updIdProfissionalSaude = document.getElementById("updIdProfissionalSaude");
            const idPessoa = updIdPessoa ? updIdPessoa.value : "";
            const idUsuario = updIdUsuario ? updIdUsuario.value : "";
            const idPaciente = updIdPaciente ? updIdPaciente.value : "";
            const idProfissional = updIdProfissionalSaude ? updIdProfissionalSaude.value : "";
            const tipoPerfil = perfilComplementar ? perfilComplementar.value : "";

            if (!idPessoa) {
                throw new Error("Nenhuma pessoa selecionada.");
            }

            if (["admin", "profissional", "paciente"].includes(tipoPerfil)) {
                const payloadUsuario = idUsuario
                    ? montarPayloadUsuarioAtualizacao()
                    : montarPayloadUsuarioCriacao(idPessoa);
                const payloadPaciente = tipoPerfil === "paciente"
                    ? (idPaciente ? montarPayloadPacienteAtualizacao() : montarPayloadPacienteCriacao())
                    : null;
                const payloadProfissional = tipoPerfil === "profissional"
                    ? (idProfissional ? montarPayloadProfissionalAtualizacao() : montarPayloadProfissionalCriacao())
                    : null;
                const payloadPessoa = montarPayloadPessoaAtualizacao();
                await atualizarPessoa(idPessoa, payloadPessoa);

                let perfilAtualizado = null;
                let usuarioAtualizado;

                if (tipoPerfil === "paciente") {
                    perfilAtualizado = idPaciente
                        ? await atualizarPaciente(idPaciente, payloadPaciente)
                        : await criarPaciente(idPessoa, payloadPaciente);
                    preencherFormularioPaciente(perfilAtualizado);
                }

                if (tipoPerfil === "profissional") {
                    perfilAtualizado = idProfissional
                        ? await atualizarProfissional(idProfissional, payloadProfissional)
                        : await criarProfissional(idPessoa, payloadProfissional);
                    preencherFormularioProfissional(perfilAtualizado);
                }

                if (idUsuario) {
                    usuarioAtualizado = await atualizarUsuario(
                        idUsuario,
                        payloadUsuario
                    );
                    exibirMensagem("success", "Usuário atualizado com sucesso.");
                } else {
                    usuarioAtualizado = await criarUsuario(
                        payloadUsuario
                    );
                    preencherFormularioUsuario(usuarioAtualizado);
                    exibirMensagem("success", "Usuário criado com sucesso.");
                }

                exibirResultado({
                    perfil: perfilAtualizado,
                    usuario: usuarioAtualizado
                });
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
        localStorage.removeItem("token");
        localStorage.removeItem("usuarioNome");
        localStorage.removeItem("usuarioEmail");
        localStorage.removeItem("usuarioPerfil");
        localStorage.removeItem("tokenExpiraEm");
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
