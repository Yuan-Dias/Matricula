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
        alert(mensagem); // Fallback caso o modal não exista
    }
}

async function fetchAPI(endpoint, method = 'GET', body = null) {
    try {
        const headers = getAuthHeaders(); 
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (response.status === 401 || response.status === 403) {
            logout();
            return null;
        }

        // --- MELHORIA AQUI: Captura mensagens de erro em texto ou JSON ---
        if (!response.ok) {
            const errorText = await response.text(); // Lê como texto primeiro
            let message = `Erro ${response.status}`;
            
            try {
                const errorJson = JSON.parse(errorText);
                message = errorJson.message || message;
            } catch (e) {
                // Se não for JSON, usa o texto puro retornado pelo e.getMessage() do Java
                message = errorText || message;
            }
            throw new Error(message);
        }

        const text = await response.text();
        if (!text) return {};

        try {
            return JSON.parse(text);
        } catch (e) {
            // Se não for JSON (ex: String pura do Java), retorna o texto como um objeto
            return { message: text }; 
        }
        
    } catch (error) {
        console.error("Fetch Error:", error.message);
        throw error; 
    }
}