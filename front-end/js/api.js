const API_URL = "http://localhost:8080";

// ==================================================================================
// GERENCIAMENTO DE TOKEN E CABEÇALHOS
// ==================================================================================
function getAuthHeaders() {
    const token = localStorage.getItem("sga_token");
    
    // CORREÇÃO: Se não tiver token, para tudo imediatamente!
    if (!token || token === "null" || token === "undefined") {
        console.warn("Tentativa de acesso sem token. Redirecionando...");
        logout(); // Limpa e redireciona
        throw new Error("Usuário não autenticado."); // Interrompe o código aqui
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// Recupera o usuário logado
function getUser() {
    const userStr = localStorage.getItem("sga_user");
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        logout(); // Se o JSON estiver corrompido, desloga
        return null;
    }
}

// Função de Logout
function logout() {
    localStorage.removeItem("sga_token");
    localStorage.removeItem("sga_user");
    sessionStorage.clear();

    const loginPath = window.location.origin + "/pages/login.html";

    if (window.location.pathname.includes("login.html")) return;

    window.location.replace("pages/login.html?expired=true");
}

// ==================================================================================
// FUNÇÃO DE FETCH GENÉRICA
// ==================================================================================
function exibirErroVisual(mensagem) {
    const modalEl = document.getElementById('modalErroGlobal');
    const msgEl = document.getElementById('mensagemErroGlobal');
    if (modalEl && msgEl) {
        msgEl.textContent = mensagem;
        new bootstrap.Modal(modalEl).show();
    } else {
        alert(mensagem);
    }
}

async function fetchAPI(endpoint, method = 'GET', body = null) {
    try {
        const headers = getAuthHeaders(); 
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        console.log(`[API] Requisição: ${method} ${endpoint}`);

        const response = await fetch(`${API_URL}${endpoint}`, options);
        
        // 1. Pega o texto bruto
        const text = await response.text();

        // 2. Verificação de Token
        if (response.status === 401 || response.status === 403) {
            console.warn("[API] Token inválido ou expirado.");
            logout();
            return null;
        }

        let data = null;
        
        // 3. Tenta converter para JSON (BLINDADO)
        try {
            if (text && text.trim().length > 0) {
                data = JSON.parse(text);
            }
        } catch (e) {
            // Se der erro de JSON, ignoramos por enquanto
            // Se for sucesso (200), assumimos que é texto puro.
        }

        // 4. Se a resposta HTTP for ERRO (400, 404, 500...)
        if (!response.ok) {
            if (data) {
                console.log("[API] Erro estruturado recebido:", data);
                throw data; // Lança o JSON de erro (ex: validação de campos)
            }
            // Se não tem JSON, lança o texto ou status
            throw new Error(text || `Erro na requisição: ${response.status}`);
        }

        // 5. Se a resposta for SUCESSO (200 OK)
        if (data) return data; // Retorna o JSON se existir
        
        // Se não tem JSON, cria um objeto de sucesso falso com o texto
        return { message: text || "Operação realizada com sucesso" };

    } catch (error) {
        // Se for array de erros (validação), relança para o formulário tratar
        if (Array.isArray(error) || (typeof error === 'object' && error.campo)) {
            throw error;
        }
        
        console.error("[API] Erro crítico:", error);
        throw error; 
    }
}