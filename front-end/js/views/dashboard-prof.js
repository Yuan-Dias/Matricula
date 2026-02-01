// js/views/dashboard-prof.js

// --- Autenticação ---
function instLogout() {
    localStorage.removeItem("sga_token");
    localStorage.removeItem("sga_usuario");
    localStorage.removeItem("usuarioLogado");
    window.location.href = "pages/login.html";
}

// --- Menu Helper ---
function atualizarMenuAtivo(textoItem) {
    // Busca o elemento dentro da função para evitar erro de escopo global
    const sidebarMenu = document.getElementById("sidebar-menu");
    if (!sidebarMenu) return;

    const itens = sidebarMenu.querySelectorAll('a');
    itens.forEach(i => {
        i.classList.remove('active');
        if(i.innerText.includes(textoItem)) i.classList.add('active');
    });
}

// --- Inicialização (Admin/Instituição) ---
async function carregarInstituicao() {
    // Declaração LOCAL para evitar conflito
    const pageTitle = document.getElementById("page-title");
    const sidebarMenu = document.getElementById("sidebar-menu");

    if(pageTitle) pageTitle.innerHTML = '<span class="text-white fw-bold">Painel</span> Admin';

    if(sidebarMenu) {
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
        `;
    }

    if (typeof window.instRenderHome === 'function') {
        await window.instRenderHome();
    }
}

// ============================================================================
// FUNÇÕES DO PROFESSOR - DASHBOARD
// ============================================================================

/**
 * Inicializa o ambiente do professor (Menu + Home)
 */
function carregarProfessor() {
    console.log("[View] Iniciando Área do Professor...");
    
    // Declaração LOCAL
    const sidebarMenu = document.getElementById("sidebar-menu");
    const pageTitle = document.getElementById('page-title');

    if (sidebarMenu) {
        sidebarMenu.innerHTML = `
            <div class="small fw-bold text-uppercase text-muted mb-2 px-3 mt-3">Menu Docente</div>
            <a href="#" onclick="profRenderHome(); return false;" class="list-group-item list-group-item-action active border-0 rounded-3 mb-1" id="menu-prof-home">
                <i class="fas fa-home me-2"></i> Visão Geral
            </a>
            <a href="#" onclick="if(window.profRenderTurmas) profRenderTurmas(); else alert('Módulo de turmas carregando...'); return false;" class="list-group-item list-group-item-action border-0 rounded-3 mb-1" id="menu-prof-turmas">
                <i class="fas fa-chalkboard-teacher me-2"></i> Minhas Turmas
            </a>
        `;
    }
    
    if (pageTitle) pageTitle.innerHTML = '<i class="fas fa-user-tie me-2"></i>Portal do Professor';

    profRenderHome();
}

/**
 * Renderiza a Dashboard (Home) com KPIs e Cards
 */
async function profRenderHome() {
    console.log("[Dashboard] Renderizando Home...");
    
    // Declaração LOCAL (Segura)
    const appContent = document.getElementById('appContent');
    
    if (!appContent) {
        console.error("[Erro] Elemento 'appContent' não encontrado no HTML.");
        return;
    }

    // Atualiza Menu Ativo
    const menuHome = document.getElementById('menu-prof-home');
    if (menuHome) {
        // Remove active de todos primeiro
        document.querySelectorAll('#sidebar-menu .list-group-item').forEach(el => el.classList.remove('active'));
        menuHome.classList.add('active');
    }

    // Loading State
    appContent.innerHTML = `
        <div class="d-flex flex-column justify-content-center align-items-center" style="height: 50vh;">
            <div class="spinner-grow text-primary mb-3" role="status"></div>
            <h5 class="text-muted fw-normal">Sincronizando dados acadêmicos...</h5>
        </div>`;

    try {
        if (typeof getUser !== 'function') {
            throw new Error("Função getUser() não está definida.");
        }

        const user = getUser();
        
        const [minhasMaterias, todasMatriculas] = await Promise.all([
            fetchAPI(`/materias?professorId=${user.id}`).catch(err => { console.error("Erro matérias:", err); return []; }), 
            fetchAPI('/matriculas').catch(err => { console.error("Erro matrículas:", err); return []; })
        ]);

        const listaMaterias = Array.isArray(minhasMaterias) ? minhasMaterias : [];
        const listaMatriculas = Array.isArray(todasMatriculas) ? todasMatriculas : [];

        // Filtros
        const materiasAtivas = listaMaterias.filter(m => !m.encerrada && m.status !== 'FINALIZADA');
        const materiasFinalizadas = listaMaterias.filter(m => m.encerrada || m.status === 'FINALIZADA');

        // Contagem de alunos únicos
        const idsMinhasMaterias = new Set(listaMaterias.map(m => m.id));
        const meusAlunos = listaMatriculas.filter(mat => idsMinhasMaterias.has(mat.idMateria));
        const totalAlunosUnicos = new Set(meusAlunos.map(mat => mat.idAluno)).size;

        const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const saudacao = getSaudacao();
        const nomeProf = user.nome ? user.nome.split(' ')[0] : 'Professor';

        // Renderização Final
        appContent.innerHTML = `
            <div class="fade-in">
                <div class="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
                    <div>
                        <h2 class="fw-bold text-dark mb-0">${saudacao}, ${nomeProf}.</h2>
                        <p class="text-muted mb-0 small text-capitalize"><i class="far fa-calendar-alt me-1"></i> ${hoje}</p>
                    </div>
                </div>

                <div class="row g-4 mb-5">
                    <div class="col-md-4">
                        <div class="card border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
                            <div class="card-body p-4">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p class="text-uppercase text-muted small fw-bold mb-1">Disciplinas</p>
                                        <h2 class="fw-bold mb-0 text-dark">${listaMaterias.length}</h2>
                                        <small class="text-success fw-bold"><i class="fas fa-check-circle me-1"></i>${materiasAtivas.length} Ativas</small>
                                    </div>
                                    <div class="bg-primary bg-opacity-10 text-primary rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                        <i class="fas fa-book fa-lg"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="card border-0 shadow-sm rounded-4 h-100">
                            <div class="card-body p-4">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p class="text-uppercase text-muted small fw-bold mb-1">Total de Alunos</p>
                                        <h2 class="fw-bold mb-0 text-dark">${totalAlunosUnicos}</h2>
                                        <small class="text-muted">Em todas as turmas</small>
                                    </div>
                                    <div class="bg-info bg-opacity-10 text-info rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                        <i class="fas fa-user-graduate fa-lg"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <div class="card border-0 shadow-sm rounded-4 h-100">
                            <div class="card-body p-4">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p class="text-uppercase text-muted small fw-bold mb-1">Histórico</p>
                                        <h2 class="fw-bold mb-0 text-dark">${materiasFinalizadas.length}</h2>
                                        <small class="text-secondary">Turmas Finalizadas</small>
                                    </div>
                                    <div class="bg-warning bg-opacity-10 text-warning rounded-circle p-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                        <i class="fas fa-history fa-lg"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <h5 class="fw-bold text-dark mb-3"><i class="fas fa-clock me-2 text-primary"></i>Disciplinas em Andamento</h5>
                
                ${materiasAtivas.length === 0 ? `
                    <div class="text-center py-5 bg-white rounded-4 shadow-sm">
                        <i class="fas fa-mug-hot fa-3x text-muted mb-3 opacity-50"></i>
                        <h6 class="text-muted">Nenhuma disciplina ativa no momento.</h6>
                    </div>
                ` : `
                    <div class="row g-3">
                        ${materiasAtivas.map(m => renderCardMateriaProfessor(m)).join('')}
                    </div>
                `}
            </div>
        `;
    } catch (err) {
        console.error("Erro crítico na dashboard:", err);
        appContent.innerHTML = `
            <div class="alert alert-danger m-4 rounded-3 shadow-sm">
                <h5 class="alert-heading"><i class="fas fa-exclamation-triangle me-2"></i>Erro ao carregar Dashboard</h5>
                <p class="mb-0">${err.message}</p>
            </div>`;
    }
}

/**
 * Gera o HTML de um Card individual
 */
function renderCardMateriaProfessor(materia) {
    const qtdAvaliacoes = (materia.avaliacoes || []).length;
    const nomeSafe = (materia.nome || 'Matéria sem nome').replace(/'/g, "&apos;");
    const idSafe = materia.id;
    
    return `
    <div class="col-md-6 col-xl-4">
        <div class="card border-0 shadow-sm h-100 rounded-4 hover-shadow transition-all">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <span class="badge bg-light text-primary border border-primary-subtle rounded-pill px-3 py-2">
                        ${materia.nomeCurso || 'Curso Geral'}
                    </span>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-link text-muted p-0" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                            <li><a class="dropdown-item" href="#" onclick="if(window.profVerAlunos) { profVerAlunos(${idSafe}, '${nomeSafe}'); } else { console.error('profVerAlunos não encontrada'); }; return false;">
                                <i class="fas fa-list-ol me-2 text-primary"></i>Abrir Diário
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="if(window.profAbrirModalConfiguracao) { profAbrirModalConfiguracao(${idSafe}); } else { console.error('profAbrirModalConfiguracao não encontrada'); }; return false;">
                                <i class="fas fa-cog me-2 text-muted"></i>Configurar
                            </a></li>
                        </ul>
                    </div>
                </div>
                
                <h5 class="card-title fw-bold text-truncate" title="${nomeSafe}">${materia.nome}</h5>
                <p class="card-text text-muted small line-clamp-2" style="min-height: 40px;">
                    ${materia.descricao || 'Sem descrição definida.'}
                </p>

                <div class="d-flex align-items-center justify-content-between mt-4 pt-3 border-top border-light">
                    <div class="small text-muted">
                        <i class="fas fa-clipboard-check me-1"></i> ${qtdAvaliacoes} avaliações
                    </div>
                    <button class="btn btn-outline-primary btn-sm rounded-pill px-3" onclick="if(window.profVerAlunos) { profVerAlunos(${idSafe}, '${nomeSafe}'); }">
                        Acessar Diário <i class="fas fa-arrow-right ms-1"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>`;
}

function getSaudacao() {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Bom dia";
    if (hora >= 12 && hora < 18) return "Boa tarde";
    return "Boa noite";
}

// FIX CSS (Estilos exclusivos da dashboard)
(function() {
    const styleId = 'prof-dashboard-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
            .hover-shadow:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
            .transition-all { transition: all 0.3s ease; }
            .line-clamp-2 {
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }
})();

// ============================================================================
// EXPORTAÇÕES
// ============================================================================
window.carregarProfessor = carregarProfessor;
window.profRenderHome = profRenderHome;