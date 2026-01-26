const API_URL = "http://localhost:8080";

// --- 1. INICIALIZAÇÃO ---

document.addEventListener("DOMContentLoaded", () => {

    // 1. Verifica se o usuário foi "chutado" do sistema (veio pelo logout)
    const params = new URLSearchParams(window.location.search);
    const sessaoExpirada = params.get('expired');

    if (sessaoExpirada) {
        localStorage.clear();
        sessionStorage.clear();

        mostrarToast("Sua sessão expirou. Faça login novamente.", "danger");

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

// --- 2. LÓGICA DO PRIMEIRO ACESSO (O SEGREDO ESTÁ AQUI) ---

async function verificarEstadoDoSistema() {
    const setupBtn = document.getElementById('setup-wrapper');
    
    try {
        // Tenta buscar usuários
        const response = await fetch(`${API_URL}/usuarios`);
        
        if (response.ok) {
            const listaUsuarios = await response.json();
            
            // SE E SOMENTE SE a lista for vazia (0 usuários no banco)
            if (Array.isArray(listaUsuarios) && listaUsuarios.length === 0) {
                setupBtn.classList.remove('d-none'); // MOSTRA O BOTÃO
                console.log("Sistema zerado. Modo de configuração ativado.");
            } else {
                // Se tem gente, garante que fica oculto
                setupBtn.classList.add('d-none'); 
            }
        } else {
            // Se der 403 (Proibido) ou 401, significa que o sistema já tem segurança
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
    
    // Efeito de alternância
    if (formLogin.classList.contains('d-none')) {
        formLogin.classList.remove('d-none');
        formPA.classList.add('d-none');
    } else {
        formLogin.classList.add('d-none');
        formPA.classList.remove('d-none');
    }
}

function msg(texto, tipo = 'primary') {
    const el = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    
    msgEl.innerText = texto;
    // Remove classes antigas de cor e adiciona a nova
    el.className = `toast align-items-center text-white border-0 bg-${tipo} shadow`;
    
    const toast = new bootstrap.Toast(el);
    toast.show();
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

        // --- No trecho de sucesso do fazerLogin ---
        if (response.ok) {
            const data = await response.json();

            console.log("O QUE O JAVA RESPONDEU DE VERDADE:", data);
            
            if (!data.token) throw new Error("Token ausente.");

            // Armazena o token para o cabeçalho das próximas requisições
            localStorage.setItem("sga_token", data.token);
            
            // Monta o objeto com o ID que agora vem do Java
            const user = {
                id: data.id,      // <--- O ID QUE CORRIGIMOS NO JAVA
                nome: data.nome || "Usuário", // Fallback caso o nome não venha no DTO
                tipo: data.tipo,
                login: data.login // Use o login que veio da resposta (garante consistência)
            };
            
            localStorage.setItem("sga_user", JSON.stringify(user));
            
            msg("Login realizado com sucesso!", "success");
            setTimeout(() => { window.location.href = '../index.html'; }, 1000);
        } else {
            msg("Login ou senha inválidos.", "danger");
        }
    } catch(e) {
        msg("Erro de conexão com o servidor.", "danger");
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
        tipo: 'INSTITUICAO' // Força o Admin
    };

    if(!dados.nome || !dados.login || !dados.senha) {
        return msg("Preencha todos os campos.", "warning");
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
            
            // -----------------------------------------------------------
            // TRUQUE VISUAL: Oculta o botão de setup imediatamente
            // -----------------------------------------------------------
            document.getElementById('setup-wrapper').classList.add('d-none');
            
            // Limpa o formulário
            document.getElementById('paNome').value = "";
            document.getElementById('paEmail').value = "";
            document.getElementById('paSenha').value = "";
            
            // Volta para a tela de login
            toggleLoginMode();
            
        } else {
            const erro = await response.text();
            msg("Erro ao criar: " + erro, "warning");
        }
    } catch(e) {
        msg("Erro ao conectar ao servidor.", "danger");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function mostrarToast(mensagem, tipo = 'danger') {
    const toastEl = document.getElementById('toast');
    const toastBody = document.getElementById('toast-msg');

    if(toastEl && toastBody) {
        toastBody.innerText = mensagem;
        const bgClass = tipo === 'success' ? 'bg-success' : 'bg-danger';
        toastEl.className = `toast align-items-center text-white border-0 shadow ${bgClass}`;
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}