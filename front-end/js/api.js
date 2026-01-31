const API_URL = "http://localhost:8080";

// ==================================================================================
// 1. GERENCIAMENTO DE SESSÃO (TOKEN E USUÁRIO)
// ==================================================================================

// Gera os cabeçalhos com o Token JWT
function getAuthHeaders() {
    const token = localStorage.getItem("sga_token");
    
    // Se não tiver token, força o logout imediatamente
    if (!token || token === "null" || token === "undefined") {
        console.warn("Acesso negado: Token ausente.");
        logout(); 
        throw new Error("Usuário não autenticado.");
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Recupera os dados do usuário logado
function getUser() {
    const userStr = localStorage.getItem("sga_user");
    if (!userStr) return null;
    
    try {
        return JSON.parse(userStr);
    } catch (e) {
        console.error("Erro ao ler dados do usuário. Reiniciando sessão.");
        logout(); 
        return null;
    }
}

// Função ÚNICA e padronizada de Logout
function logout() {
    localStorage.removeItem("sga_token");
    localStorage.removeItem("sga_user");
    localStorage.removeItem("user");
    sessionStorage.clear();

    if (window.location.pathname.includes("/pages/")) {
        window.location.href = "login.html";
    } else {
        window.location.href = "pages/login.html"; 
    }
}

// ==================================================================================
// 2. FUNÇÃO DE FETCH GENÉRICA (REQUISIÇÕES HTTP)
// ==================================================================================

// Exibe erros na interface (Modal ou Alert)
function exibirErroVisual(mensagem) {
    const modalEl = document.getElementById('modalErroGlobal');
    const msgEl = document.getElementById('mensagemErroGlobal');
    
    if (modalEl && msgEl) {
        msgEl.textContent = mensagem;
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } else {
        alert(mensagem);
    }
}

// Função principal para chamar o Backend
async function fetchAPI(endpoint, method = 'GET', body = null) {
    try {
        const headers = getAuthHeaders(); 
        const options = { method, headers };
        
        if (body) {
            options.body = JSON.stringify(body);
        }

        console.log(`[API] ${method} ${endpoint}`);

        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        // 1. Pega o texto bruto da resposta
        const text = await response.text();

        // 2. Verifica se o token expirou (401/403)
        if (response.status === 401 || response.status === 403) {
            console.warn("[API] Sessão expirada.");
            logout();
            return null;
        }

        let data = null;
        
        // 3. Tenta converter para JSON de forma segura
        try {
            if (text && text.trim().length > 0) {
                data = JSON.parse(text);
            }
        } catch (e) {
            // Se falhar o parse, assume que é apenas texto ou vazio
        }

        // 4. Se a resposta HTTP for ERRO (400, 404, 500...)
        if (!response.ok) {
            if (data) {
                console.log("[API] Erro do servidor:", data);
                throw data; // Lança o objeto de erro (ex: validações do Java)
            }
            // Se não tem JSON, lança o texto ou o status
            throw new Error(text || `Erro na requisição: ${response.status}`);
        }

        // 5. Sucesso (200 OK)
        if (data) return data; 
        
        // Se não retornou JSON, cria um objeto simples de sucesso
        return { message: text || "Operação realizada com sucesso" };

    } catch (error) {
        // Se for erro de conexão (fetch failed) ou erro crítico
        console.error("[API] Falha:", error);
        throw error; // Repassa o erro para quem chamou a função tratar
    }
}

// ==================================================================================
// 3. INTEGRAÇÃO COM A INTERFACE (GLOBAL)
// ==================================================================================

// Chama a função do perfil.js se ela existir
function renderPerfilGlobal() {
    if (typeof carregarPerfil === 'function') {
        carregarPerfil();
    } else {
        console.warn("Módulo de perfil (perfil.js) não carregado.");
        alert("Funcionalidade em carregamento, tente novamente em instantes.");
    }
}