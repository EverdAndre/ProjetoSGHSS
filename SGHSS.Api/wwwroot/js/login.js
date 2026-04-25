const form = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");
const btnLogin = document.getElementById("btnLogin");

const API_BASE_URL = window.location.origin;
const LOGIN_URL = `${API_BASE_URL}/api/Auth/login`;

function exibirMensagem(tipo, texto) {
    if (!mensagem) return;

    mensagem.replaceChildren();

    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo}`;
    alerta.textContent = texto;

    mensagem.appendChild(alerta);
}

form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (mensagem) {
        mensagem.replaceChildren();
    }
    btnLogin.disabled = true;
    btnLogin.textContent = "Entrando...";

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    try {
        const response = await fetch(LOGIN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        const contentType = response.headers.get("content-type");
        let data = null;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (!response.ok) {
            const erro =
                data?.message ||
                data?.title ||
                "Usuário ou senha inválidos.";
            throw new Error(erro);
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("usuarioNome", data.nome);
        localStorage.setItem("usuarioEmail", data.email);
        localStorage.setItem("usuarioPerfil", data.perfil);
        localStorage.setItem("tokenExpiraEm", data.expiraEm);

        exibirMensagem("success", `Login realizado com sucesso. Bem-vindo, ${data.nome}.`);

        setTimeout(() => {
            window.location.href = "/pages/home.html";
        }, 1200);

    } catch (error) {
        exibirMensagem("danger", error.message);
    } finally {
        btnLogin.disabled = false;
        btnLogin.textContent = "Entrar";
    }
});
