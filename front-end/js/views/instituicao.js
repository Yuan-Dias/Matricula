// VARIÁVEIS GLOBAIS
const appContent = document.getElementById("appContent");
const pageTitle = document.getElementById("page-title");
const sidebarMenu = document.getElementById("sidebar-menu");

// --- Autenticação ---
function instLogout() {
    // CORREÇÃO: Remover todas as chaves possíveis para garantir o logout limpo
    localStorage.removeItem("sga_token");
    localStorage.removeItem("sga_usuario");
    localStorage.removeItem("usuarioLogado"); // <--- Importante para o perfil.js funcionar
    
    // Redireciona para o login (ajuste o caminho conforme sua estrutura de pastas)
    window.location.href = "pages/login.html";
}

// --- Menu Helper ---
function atualizarMenuAtivo(textoItem) {
    const itens = document.querySelectorAll('#sidebar-menu a');
    itens.forEach(i => {
        i.classList.remove('active');
        // Verifica se o texto do botão contem a palavra chave (ex: "Perfil")
        if(i.innerText.includes(textoItem)) i.classList.add('active');
    });
}

// --- Inicialização ---
function carregarInstituicao() {
    if(pageTitle) pageTitle.innerHTML = '<span class="text-white fw-bold">Painel</span> Admin';

    // Menu Lateral
    sidebarMenu.innerHTML = `
        <div class="px-3 mb-2 text-white-50 small text-uppercase fw-bold" style="letter-spacing: 1px;">Menu Principal</div>
        
        <a href="#" onclick="instRenderHome()" class="list-group-item list-group-item-action active">
            <i class="fas fa-chart-pie me-2"></i> Dashboard
        </a>
        
        <div class="px-3 mt-4 mb-2 text-white-50 small text-uppercase fw-bold" style="letter-spacing: 1px;">Gestão</div>
        
        <a href="#" onclick="instRenderUsuarios()" class="list-group-item list-group-item-action">
            <i class="fas fa-users me-2"></i> Usuários
        </a>
        <a href="#" onclick="instRenderCursos()" class="list-group-item list-group-item-action">
            <i class="fas fa-graduation-cap me-2"></i> Cursos
        </a>
        <a href="#" onclick="instRenderMaterias()" class="list-group-item list-group-item-action">
            <i class="fas fa-book-open me-2"></i> Matérias
        </a>

        <div class="px-3 mt-4 mb-2 text-white-50 small text-uppercase fw-bold" style="letter-spacing: 1px;">Configurações</div>

        <a href="#" onclick="instRenderPerfil()" class="list-group-item list-group-item-action">
            <i class="fas fa-user-cog me-2"></i> Meu Perfil
        </a>
        
        <div class="mt-auto border-top border-white-50 pt-3 mx-3 mt-5 mb-3">
             <a href="#" onclick="instLogout()" class="text-white text-decoration-none d-flex align-items-center opacity-75 hover-opacity-100 p-2">
                <i class="fas fa-sign-out-alt me-2"></i> Sair do Sistema
             </a>
        </div>
    `;
    
    // Renderiza a Home inicialmente
    instRenderHome();
}