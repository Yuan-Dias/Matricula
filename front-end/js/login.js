const API_URL = "http://localhost:8080";

// --- 1. INICIALIZAÇÃO ---

document.addEventListener("DOMContentLoaded", () => {

    // 1. Verifica se o usuário foi "chutado" do sistema (veio pelo logout)
    const params = new URLSearchParams(window.location.search);
    const sessaoExpirada = params.get('expired');

    if (sessaoExpirada) {
        localStorage.clear();
        sessionStorage.clear();

        mostrarToast("Sua sessão expirou. Faça login novamente.", "error");

        window.history.replaceState({}, document.title, window.location.pathname);

        verificarEstadoDoSistema();

        return;
    }

    // 2. Lógica normal: Se tem token e NÃO foi expulso agora, entra direto
    const token = localStorage.getItem("sga_token");
    if (token && token !== "null" && token !== "undefined") {
        console.log("Token encontrado, redirecionando para dashboard...");
        window.location.href = "../index.html";
    }

    verificarEstadoDoSistema();
});

// --- 2. LÓGICA DO PRIMEIRO ACESSO ---

async function verificarEstadoDoSistema() {
    const setupBtn = document.getElementById('setup-wrapper');
    
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        
        if (response.ok) {
            const listaUsuarios = await response.json();
            
            if (Array.isArray(listaUsuarios) && listaUsuarios.length === 0) {
                setupBtn.classList.remove('d-none');
                console.log("Sistema zerado. Modo de configuração ativado.");
            } else {
                setupBtn.classList.add('d-none'); 
            }
        } else {
            setupBtn.classList.add('d-none');
        }
    } catch (e) {
        console.warn("API inacessível. Mantendo segurança padrão.");
        setupBtn.classList.add('d-none');
    }
}

// --- 3. INTERFACE E UTILITÁRIOS ---

function toggleLoginMode() {
    const formLogin = document.getElementById('form-login');
    const formPA = document.getElementById('form-primeiro-acesso');
    
    if (formLogin.classList.contains('d-none')) {
        formLogin.classList.remove('d-none');
        formPA.classList.add('d-none');
    } else {
        formLogin.classList.add('d-none');
        formPA.classList.remove('d-none');
    }
}

// Função unificada de Toast
function msg(texto, tipo = 'success') {
    mostrarToast(texto, tipo);
}

function mostrarToast(mensagem, tipo = 'error') {
    const toastEl = document.getElementById('toast');
    const toastBody = document.getElementById('toast-msg');

    if(toastEl && toastBody) {
        toastBody.innerText = mensagem;
        
        const variantClass = tipo === 'success' ? 'toast-success' : 'toast-error';
        
        toastEl.className = `toast align-items-center text-white border-0 shadow ${variantClass}`;
        
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

// --- 4. FUNÇÕES DE AÇÃO ---

async function fazerLogin() {
    const login = document.getElementById('loginEmail').value;
    const senha = document.getElementById('loginSenha').value;

    if(!login || !senha) return msg("Preencha todos os campos.", "warning");

    const btn = document.querySelector('#form-login button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Entrando...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ login, senha })
        });

        if (response.ok) {
            const data = await response.json();

            if (!data.token) throw new Error("Token ausente.");

            localStorage.setItem("sga_token", data.token);
            
            const user = {
                id: data.id,
                nome: data.nome || "Usuário",
                tipo: data.tipo,
                login: data.login
            };
            
            localStorage.setItem("sga_user", JSON.stringify(user));
            
            msg("Login realizado com sucesso!", "success");
            setTimeout(() => { window.location.href = '../index.html'; }, 1000);
        } else {
            msg("Login ou senha inválidos.", "error");
        }
    } catch(e) {
        msg("Erro de conexão com o servidor.", "error");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function realizarPrimeiroAcesso() {
    const dados = {
        nome: document.getElementById('paNome').value,
        login: document.getElementById('paEmail').value,
        senha: document.getElementById('paSenha').value,
        tipo: 'INSTITUICAO'
    };

    if(!dados.nome || !dados.login || !dados.senha) {
        return msg("Preencha todos os campos.", "error");
    }

    const btn = document.querySelector('#form-primeiro-acesso button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Configurando...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if(response.ok) {
            msg("Instituição configurada com sucesso!", "success");
            
            document.getElementById('setup-wrapper').classList.add('d-none');
            
            document.getElementById('paNome').value = "";
            document.getElementById('paEmail').value = "";
            document.getElementById('paSenha').value = "";
            
            toggleLoginMode();
            
        } else {
            const erro = await response.text();
            msg("Erro ao criar: " + erro, "error");
        }
    } catch(e) {
        msg("Erro ao conectar ao servidor.", "error");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}