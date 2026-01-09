// Elementos Globais
window.appContent = document.getElementById("app-content");
window.pageTitle = document.getElementById("page-title");
window.userNameDisplay = document.getElementById("user-name-display");

document.addEventListener("DOMContentLoaded", () => {
    const user = getUser();
    if (!user) return logout();

    // Renderiza o nome na Navbar (Verifica o ID exato do seu HTML)
    if (window.userNameDisplay) {
        window.userNameDisplay.textContent = `${user.nome} (${user.tipo})`;
    }

    // Toggle Menu Sidebar
    const toggleButton = document.getElementById("menu-toggle");
    const wrapper = document.getElementById("wrapper");
    if (toggleButton) {
        toggleButton.onclick = () => wrapper.classList.toggle("toggled");
    }

    direcionarUsuario(user.tipo);
});

// Função de roteamento baseada no tipo de usuário
function direcionarUsuario(tipo) {
    switch (tipo) {
        case "INSTITUICAO":
            carregarInstituicao();
            break;
        case "PROFESSOR":
            carregarProfessor();
            break;
        case "ALUNO":
            carregarAluno();
            break;
        default:
            console.error("Tipo de usuário desconhecido.");
            logout();
    }
}

// CORREÇÃO: Função movida para fora para ser acessível pelo HTML (onclick)
function renderPerfilGlobal() {
    const user = getUser();
    if (!user) return;

    if (user.tipo === 'ALUNO' && typeof alunoRenderPerfil === 'function') {
        alunoRenderPerfil();
    } else if (user.tipo === 'PROFESSOR' && typeof profRenderPerfil === 'function') {
        profRenderPerfil();
    } else if (typeof instRenderPerfil === 'function') {
        instRenderPerfil();
    }
}

// Utilitário para marcar item ativo no menu lateral
function atualizarMenuAtivo(textoItem) {
    const links = document.querySelectorAll("#sidebar-menu a");
    links.forEach(link => {
        if (link.textContent.trim().includes(textoItem)) {
            link.classList.add("active-menu-item"); // Defina este estilo no seu CSS
        } else {
            link.classList.remove("active-menu-item");
        }
    });
}