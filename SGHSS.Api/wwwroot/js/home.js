const token = localStorage.getItem("token");
const usuarioNome = localStorage.getItem("usuarioNome");

const API_BASE_URL = "http://localhost:5128";
const ENDPOINT_PESSOAS = `${API_BASE_URL}/api/Pessoas`;

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

if (!token) {
    window.location.href = "/pages/login.html";
}

boasVindas.textContent = `Bem-vindo, ${usuarioNome ?? "usuário"}`;

function exibirMensagem(tipo, texto) {
    mensagem.innerHTML = `
        <div class="alert alert-${tipo}">
            ${texto}
        </div>
    `;
}

function limparMensagem() {
    mensagem.innerHTML = "";
}

function exibirResultado(data) {
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
            "Authorization": `Bearer ${token}`
        }
    };

    if (body !== null) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    const contentType = response.headers.get("content-type");
    let data = null;

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

function preencherFormularioPessoa(pessoa) {
    document.getElementById("updIdPessoa").value = pessoa.idPessoa ?? pessoa.IdPessoa ?? "";
    document.getElementById("updNome").value = pessoa.nome ?? pessoa.Nome ?? "";
    document.getElementById("updCpf").value = pessoa.cpf ?? pessoa.CPF ?? pessoa.Cpf ?? "";
    document.getElementById("updDataNascimento").value = converterISOParaDataBR(
        pessoa.dataNascimento ?? pessoa.DataNascimento
    );
    document.getElementById("updEndereco").value = pessoa.endereco ?? pessoa.Endereco ?? "";
    document.getElementById("updTelefone").value = pessoa.telefone ?? pessoa.Telefone ?? "";
    document.getElementById("updAtivo").checked = pessoa.ativo ?? pessoa.Ativo ?? true;
}

function preencherCardPessoaSelecionada(pessoa) {
    const id = pessoa.idPessoa ?? pessoa.IdPessoa ?? "";
    const nome = pessoa.nome ?? pessoa.Nome ?? "";
    const cpf = pessoa.cpf ?? pessoa.CPF ?? pessoa.Cpf ?? "";

    document.getElementById("selIdPessoa").textContent = id;
    document.getElementById("selNomePessoa").textContent = nome;
    document.getElementById("selCpfPessoa").textContent = cpf;
}

function renderizarTabelaBuscaPessoas(lista) {
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

    tabelaBuscaPessoa.innerHTML = lista.map(pessoa => {
        const id = pessoa.idPessoa ?? pessoa.IdPessoa ?? "";
        const nome = pessoa.nome ?? pessoa.Nome ?? "";
        const cpf = pessoa.cpf ?? pessoa.CPF ?? pessoa.Cpf ?? "";

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
    return await chamarApi(`${ENDPOINT_PESSOAS}/${idPessoa}`, "GET");
}

async function listarPessoas() {
    return await chamarApi(ENDPOINT_PESSOAS, "GET");
}

async function buscarPessoasPorNome(nome) {
    // Usa endpoint dedicado se você criar o /buscar
    try {
        return await chamarApi(`${ENDPOINT_PESSOAS}/buscar?nome=${encodeURIComponent(nome)}`, "GET");
    } catch {
        // fallback temporário: filtra no front
        const todas = await listarPessoas();
        return todas.filter(p => {
            const nomePessoa = (p.nome ?? p.Nome ?? "").toLowerCase();
            return nomePessoa.includes(nome.toLowerCase());
        });
    }
}

btnListar.addEventListener("click", async function () {
    limparMensagem();
    resultado.textContent = "Carregando...";

    try {
        const data = await listarPessoas();
        exibirMensagem("success", "Pessoas carregadas com sucesso.");
        exibirResultado(data);
        renderizarTabelaBuscaPessoas(data);
    } catch (error) {
        exibirMensagem("danger", error.message);
        resultado.textContent = "";
    }
});

formCadastroPessoa.addEventListener("submit", async function (event) {
    event.preventDefault();

    limparMensagem();
    resultado.textContent = "Cadastrando pessoa...";

    try {
        const novaPessoa = {
            nome: document.getElementById("cadNome").value.trim(),
            cpf: document.getElementById("cadCpf").value.trim(),
            dataNascimento: converterDataBRParaISO(
                document.getElementById("cadDataNascimento").value.trim()
            ),
            endereco: document.getElementById("cadEndereco").value.trim(),
            telefone: document.getElementById("cadTelefone").value.trim(),
            ativo: document.getElementById("cadAtivo").checked
        };

        const data = await chamarApi(ENDPOINT_PESSOAS, "POST", novaPessoa);

        exibirMensagem("success", "Pessoa cadastrada com sucesso.");
        exibirResultado(data);
        formCadastroPessoa.reset();
        document.getElementById("cadAtivo").checked = true;
    } catch (error) {
        exibirMensagem("danger", error.message);
        resultado.textContent = "";
    }
});

btnBuscarPessoa.addEventListener("click", async function () {
    limparMensagem();
    resultado.textContent = "Buscando pessoas...";

    try {
        const nome = document.getElementById("buscaNomeAtualizacao").value.trim();

        if (!nome) {
            throw new Error("Digite um nome para buscar.");
        }

        const lista = await buscarPessoasPorNome(nome);
        renderizarTabelaBuscaPessoas(lista);
        exibirMensagem("success", "Busca realizada com sucesso.");
        exibirResultado(lista);
    } catch (error) {
        exibirMensagem("danger", error.message);
        resultado.textContent = "";
    }
});

tabelaBuscaPessoa.addEventListener("click", async function (event) {
    const botaoSelecionar = event.target.closest(".btn-selecionar-pessoa");
    const botaoExcluir = event.target.closest(".btn-excluir-pessoa");

    if (botaoSelecionar) {
        limparMensagem();
        resultado.textContent = "Carregando dados da pessoa...";

        try {
            const idPessoa = botaoSelecionar.dataset.id;
            const pessoa = await carregarPessoaPorId(idPessoa);

            preencherCardPessoaSelecionada(pessoa);
            preencherFormularioPessoa(pessoa);

            cardPessoaSelecionada.classList.remove("d-none");
            formAtualizacao.classList.remove("d-none");
            perfilComplementar.value = "";

            exibirMensagem("success", `Pessoa ${idPessoa} selecionada para atualização.`);
            exibirResultado(pessoa);
        } catch (error) {
            exibirMensagem("danger", error.message);
            resultado.textContent = "";
        }

        return;
    }

    if (botaoExcluir) {
        const idPessoa = botaoExcluir.dataset.id;
        const nomePessoa = botaoExcluir.dataset.nome;

        const confirmar = confirm(`Deseja excluir a pessoa "${nomePessoa}" (ID ${idPessoa})?`);
        if (!confirmar) return;

        limparMensagem();
        resultado.textContent = "Excluindo pessoa...";

        try {
            const resposta = await chamarApi(`${ENDPOINT_PESSOAS}/${idPessoa}`, "DELETE");
            exibirMensagem("success", typeof resposta === "string" ? resposta : "Pessoa removida com sucesso.");
            exibirResultado(resposta);

            const listaAtualizada = await listarPessoas();
            renderizarTabelaBuscaPessoas(listaAtualizada);
        } catch (error) {
            exibirMensagem("danger", error.message);
            resultado.textContent = "";
        }
    }
});

perfilComplementar.addEventListener("change", function () {
    const tipo = perfilComplementar.value;

    if (!tipo) return;

    exibirMensagem("warning", `Perfil complementar "${tipo}" ainda não está implementado no backend.`);
});

formAtualizacao.addEventListener("submit", async function (event) {
    event.preventDefault();

    limparMensagem();
    resultado.textContent = "Salvando atualização...";

    try {
        const idPessoa = document.getElementById("updIdPessoa").value;

        if (!idPessoa) {
            throw new Error("Nenhuma pessoa selecionada.");
        }

        const payload = {
            nome: document.getElementById("updNome").value.trim(),
            cpf: document.getElementById("updCpf").value.trim(),
            dataNascimento: converterDataBRParaISO(
                document.getElementById("updDataNascimento").value.trim()
            ),
            endereco: document.getElementById("updEndereco").value.trim(),
            telefone: document.getElementById("updTelefone").value.trim(),
            ativo: document.getElementById("updAtivo").checked
        };

        const pessoaAtualizada = await chamarApi(`${ENDPOINT_PESSOAS}/${idPessoa}`, "PATCH", payload);

        if (perfilComplementar.value) {
            exibirMensagem(
                "warning",
                `Pessoa atualizada com sucesso. O perfil complementar "${perfilComplementar.value}" ainda não foi implementado no backend.`
            );
        } else {
            exibirMensagem("success", "Pessoa atualizada com sucesso.");
        }

        exibirResultado(pessoaAtualizada);
    } catch (error) {
        exibirMensagem("danger", error.message);
        resultado.textContent = "";
    }
});

btnLimparAtualizacao.addEventListener("click", function () {
    formAtualizacao.reset();
    document.getElementById("updIdPessoa").value = "";
    cardPessoaSelecionada.classList.add("d-none");
    formAtualizacao.classList.add("d-none");

    limparMensagem();
    resultado.textContent = "";
});

btnLogout.addEventListener("click", function () {
    localStorage.clear();
    window.location.href = "/pages/login.html";
});