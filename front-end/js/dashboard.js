/**
 * js/dashboard.js
 * Script principal de orquestração do Dashboard
 */

// --- Elementos Globais (Disponíveis para outros scripts) ---
window.appContent = document.getElementById("appContent");
window.pageTitle = document.getElementById("page-title");
window.userNameDisplay = document.getElementById("user-name-display");

// --- Inicialização ao Carregar a Página ---
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Verificação de Segurança (Auth Guard)
    // Precisamos garantir que existe usuário E token antes de prosseguir
    const user = getUser(); 
    const token = localStorage.getItem('sga_token'); 

    if (!user || !token) {
        console.warn("Autenticação falhou: Usuário ou Token ausentes.");
        logout(); // Redireciona para login.html
        return;   // Para a execução do script
    }

    // 2. Renderiza o nome do usuário na Navbar
    if (window.userNameDisplay) {
        window.userNameDisplay.textContent = `${user.nome} (${user.tipo})`;
    }

    // 3. Configura o botão de Toggle do Menu Lateral (Sidebar)
    const toggleButton = document.getElementById("menu-toggle");
    const wrapper = document.getElementById("wrapper");
    
    if (toggleButton && wrapper) {
        toggleButton.onclick = () => {
            wrapper.classList.toggle("toggled");
        };
    }

    // 4. Inicia o roteamento para o perfil correto
    console.log(`Iniciando Dashboard para o perfil: ${user.tipo}`);
    direcionarUsuario(user.tipo);
});

/**
 * Roteia o usuário para carregar os scripts e visualizações corretas
 * baseado no tipo de perfil (ALUNO, PROFESSOR, INSTITUICAO).
 */
function direcionarUsuario(tipo) {
    switch (tipo) {
        case "INSTITUICAO":
            if (typeof carregarInstituicao === 'function') {
                carregarInstituicao();
            } else {
                exibirErroCarregamento("Script de Instituição não carregado.");
            }
            break;

        case "PROFESSOR":
            if (typeof carregarProfessor === 'function') {
                carregarProfessor();
            } else {
                exibirErroCarregamento("Script de Professor não carregado.");
            }
            break;

        case "ALUNO":
            if (typeof carregarAluno === 'function') {
                carregarAluno();
            } else {
                exibirErroCarregamento("Script de Aluno não carregado.");
            }
            break;

        default:
            console.error(`Tipo de usuário desconhecido: ${tipo}`);
            logout();
    }
}

/**
 * Chamada pelo botão "Meu Perfil" na Navbar.
 * Redireciona para a função de perfil específica de cada módulo.
 */
function renderPerfilGlobal() {
    const user = getUser();
    if (!user) return;

    // Atualiza o título da página
    if (window.pageTitle) window.pageTitle.textContent = "Meu Perfil";

    if (user.tipo === 'ALUNO' && typeof alunoRenderPerfil === 'function') {
        alunoRenderPerfil();
    } else if (user.tipo === 'PROFESSOR' && typeof profRenderPerfil === 'function') {
        profRenderPerfil();
    } else if (user.tipo === 'INSTITUICAO' && typeof instRenderPerfil === 'function') {
        instRenderPerfil();
    } else {
        console.warn("Função de perfil não encontrada para este usuário.");
        if (window.appContent) {
            window.appContent.innerHTML = `
                <div class="alert alert-info text-center mt-4">
                    <h4>Perfil de Usuário</h4>
                    <p>Funcionalidade de perfil em desenvolvimento para ${user.tipo}.</p>
                </div>
            `;
        }
    }
}

/**
 * Utilitário para marcar visualmente o item ativo no menu lateral.
 * Remove a classe 'active' de todos e adiciona apenas no que contém o texto.
 */
function atualizarMenuAtivo(textoItem) {
    const links = document.querySelectorAll("#sidebar-menu a");
    
    links.forEach(link => {
        // Verifica se o texto do link contém a palavra-chave (case insensitive)
        if (link.textContent.toLowerCase().includes(textoItem.toLowerCase())) {
            link.classList.add("active"); // Bootstrap usa 'active' ou use sua classe 'active-menu-item'
            link.classList.add("bg-white"); 
            link.classList.add("text-success");
            link.classList.remove("text-white-50");
        } else {
            link.classList.remove("active");
            link.classList.remove("bg-white");
            link.classList.remove("text-success");
            link.classList.add("text-white-50");
        }
    });
}

/**
 * Helper para exibir erro na tela caso um script JS falhe ao carregar
 */
function exibirErroCarregamento(mensagem) {
    console.error(mensagem);
    if (window.appContent) {
        window.appContent.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center h-100 mt-5">
                <i class="fas fa-bug text-danger fs-1 mb-3"></i>
                <h4 class="text-danger">Erro de Carregamento</h4>
                <p class="text-muted">${mensagem}</p>
                <button class="btn btn-outline-primary btn-sm mt-2" onclick="window.location.reload()">
                    <i class="fas fa-sync-alt me-2"></i> Recarregar Página
                </button>
            </div>
        `;
    }
}

/**
 * Fallback para Logout caso api.js falhe
 */
if (typeof logout !== 'function') {
    window.logout = function() {
        localStorage.clear();
        window.location.href = 'login.html';
    };
}