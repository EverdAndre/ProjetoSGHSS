const form = document.getElementById("loginForm");
const mensagem = document.getElementById("mensagem");
const btnLogin = document.getElementById("btnLogin");

const API_BASE_URL = "http://localhost:5128";
const LOGIN_URL = `${API_BASE_URL}/api/Auth/login`;

form.addEventListener("submit", async function (event) {
    event.preventDefault();
    mensagem.innerHTML = "";
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

        mensagem.innerHTML = `
            <div class="alert alert-success">
                Login realizado com sucesso. Bem-vindo, ${data.nome}.
            </div>
        `;

        setTimeout(() => {
            window.location.href = "http://localhost:5128/pages/home.html";
        }, 1200);

    } catch (error) {
        mensagem.innerHTML = `
            <div class="alert alert-danger">
                ${error.message}
            </div>
        `;
    } finally {
        btnLogin.disabled = false;
        btnLogin.textContent = "Entrar";
    }
});