/**
 * js/dashboard.js
 * Orquestrador Principal do Sistema
 */

// --- 1. Elementos Globais e Configuração ---
window.appContent = document.getElementById("appContent");
window.pageTitle = document.getElementById("page-title");
window.userNameDisplay = document.getElementById("user-name-display");

// --- 2. Função Helper: Carregador Dinâmico de Scripts ---
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Evita carregar se já existir
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }

        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = () => {
            console.warn(`[Sistema] Módulo opcional não encontrado ou falhou: ${src}`);
            // Resolvemos mesmo com erro para não travar toda a aplicação, 
            // mas logamos o aviso.
            resolve(); 
        };
        document.body.appendChild(s);
    });
}

// --- 3. Inicialização do Ambiente (Async) ---
async function iniciarDashboard() {
    try {
        // A. Verificação de Dependências Básicas
        if (typeof getUser !== 'function') {
            throw new Error("api.js não foi carregado corretamente.");
        }

        const user = getUser();
        const token = localStorage.getItem('sga_token');

        // B. Auth Guard
        if (!user || !token) {
            console.warn("Usuário não autenticado. Redirecionando...");
            window.location.href = 'pages/login.html'; // Ajuste o caminho conforme sua estrutura
            return;
        }

        // C. Atualiza UI Básica
        if (window.userNameDisplay) {
            window.userNameDisplay.textContent = `${user.nome.split(' ')[0]} (${user.tipo})`;
        }

        console.log(`[Sistema] Carregando módulos para perfil: ${user.tipo}`);

        // D. Roteamento e Carregamento de Scripts (Lazy Loading)
        switch (user.tipo) {
            case 'INSTITUICAO':
                // Carrega dependências da Instituição em ordem
                await loadScript('js/views/dashboard-inst.js');
                await loadScript('js/views/usuarios.js');
                await loadScript('js/views/cursos.js');
                await loadScript('js/views/materias.js');
                await loadScript('js/views/instituicao.js');
                
                if (typeof carregarInstituicao === 'function') {
                    carregarInstituicao();
                }
                break;

            case 'PROFESSOR':
                // Carrega dependências do Professor
                await loadScript('js/views/dashboard-prof.js'); // Contém carregarProfessor e profRenderHome
                await loadScript('js/views/turmas.js');         // Contém lógica de notas/turmas
                
                if (typeof carregarProfessor === 'function') {
                    carregarProfessor();
                } else {
                    throw new Error("Função carregarProfessor não encontrada após carregar scripts.");
                }
                break;

            case 'ALUNO':
                // Carrega dependências do Aluno
                await loadScript('js/views/dashboard-aluno.js');
                
                if (typeof carregarAluno === 'function') {
                    carregarAluno();
                }
                break;

            default:
                throw new Error("Tipo de usuário desconhecido.");
        }

        // E. Exibe a tela final (remove o display:none do wrapper)
        const wrapper = document.getElementById("wrapper");
        if (wrapper) wrapper.style.setProperty('display', 'flex', 'important');

    } catch (error) {
        console.error("[Erro Fatal]", error);
        if (window.appContent) {
            window.appContent.innerHTML = `
                <div class="alert alert-danger text-center mt-5">
                    <h4>Erro ao iniciar o sistema</h4>
                    <p>${error.message}</p>
                    <a href="index.html" class="btn btn-outline-danger btn-sm">Tentar Novamente</a>
                </div>
            `;
        }
        // Garante que o wrapper apareça para mostrar o erro
        const wrapper = document.getElementById("wrapper");
        if (wrapper) wrapper.style.setProperty('display', 'flex', 'important');
    }
}

// --- 4. Eventos Globais ---

// Logout Global
window.logout = function() {
    localStorage.removeItem('sga_user');
    localStorage.removeItem('sga_token');
    window.location.href = 'pages/login.html';
};

// Toggle Menu Lateral
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("menu-toggle");
    if (toggleButton) {
        toggleButton.onclick = (e) => {
            e.preventDefault();
            document.getElementById("wrapper").classList.toggle("toggled");
        };
    }

    // Dispara a inicialização
    iniciarDashboard();
});

// Renderização de Perfil (Menu Dropdown)
window.renderPerfilGlobal = function() {
    const user = getUser();
    if (!user) return;
    
    // Roteia para a função de perfil específica se existir
    if (user.tipo === 'ALUNO' && typeof alunoRenderPerfil === 'function') return alunoRenderPerfil();
    if (user.tipo === 'PROFESSOR' && typeof profRenderPerfil === 'function') return profRenderPerfil();
    if (user.tipo === 'INSTITUICAO' && typeof instRenderPerfil === 'function') return instRenderPerfil();

    // Fallback genérico
    window.pageTitle.textContent = "Meu Perfil";
    window.appContent.innerHTML = `
        <div class="card p-4 shadow-sm border-0 rounded-4">
            <h3>${user.nome}</h3>
            <p class="text-muted">${user.email}</p>
            <span class="badge bg-primary w-auto align-self-start">${user.tipo}</span>
        </div>`;
};