/**
 * dashboard-inst.js
 * Lógica específica para o Dashboard da Instituição (Admin).
 */

// ============================================================================
// 1. AUTENTICAÇÃO E LOGOUT
// ============================================================================

function instLogout() {
    // Remove chaves de sessão
    localStorage.removeItem("sga_token");
    localStorage.removeItem("sga_usuario");
    localStorage.removeItem("usuarioLogado");

    // Feedback visual opcional antes de redirecionar
    const btn = document.getElementById('btnLogout');
    if(btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saindo...';

    // Redireciona
    setTimeout(() => {
        window.location.href = "pages/login.html"; // Ajuste o caminho se necessário (ex: ../index.html)
    }, 500);
}

// ============================================================================
// 2. INICIALIZAÇÃO DA ÁREA ADMIN
// ============================================================================

/**
 * Configura o menu lateral e a barra de título para o perfil ADMIN.
 * Deve ser chamado ao carregar o layout principal.
 */
async function carregarInstituicao() {
    // Seleciona elementos localmente para evitar erros de escopo global
    const pageTitle = document.getElementById("page-title");
    const sidebarMenu = document.getElementById("sidebar-menu");

    if(pageTitle) pageTitle.innerHTML = '<span class="text-white fw-bold">Painel</span> Admin';

    // Renderiza Menu Lateral
    if (sidebarMenu) {
        sidebarMenu.innerHTML = `
            <div class="px-3 mb-2 text-white-50 small text-uppercase fw-bold" style="letter-spacing: 1px;">Menu Principal</div>
            
            <a href="#" onclick="instRenderHome()" class="list-group-item list-group-item-action active border-0" id="menu-dashboard">
                <i class="fas fa-chart-pie me-2"></i> Dashboard
            </a>
            
            <div class="px-3 mt-4 mb-2 text-white-50 small text-uppercase fw-bold" style="letter-spacing: 1px;">Gestão</div>
            
            <a href="#" onclick="instRenderUsuarios()" class="list-group-item list-group-item-action bg-transparent text-white border-0" id="menu-usuarios">
                <i class="fas fa-users me-2"></i> Usuários
            </a>
            <a href="#" onclick="instRenderCursos()" class="list-group-item list-group-item-action bg-transparent text-white border-0" id="menu-cursos">
                <i class="fas fa-graduation-cap me-2"></i> Cursos
            </a>
            <a href="#" onclick="instRenderMaterias()" class="list-group-item list-group-item-action bg-transparent text-white border-0" id="menu-materias">
                <i class="fas fa-book-open me-2"></i> Matérias
            </a>
        `;
    }

    // Carrega a Home por padrão
    await instRenderHome();
}

// ============================================================================
// 3. RENDERIZAÇÃO DO DASHBOARD (HOME)
// ============================================================================

async function instRenderHome() {
    // Declaração segura do appContent
    const appContent = document.getElementById("appContent");
    if (!appContent) return;

    // Atualiza menu (função do utils.js ou local)
    if (typeof atualizarMenuAtivo === 'function') {
        atualizarMenuAtivo('Dashboard');
    }

    // Mostra loading
    if (typeof instLoading === 'function') instLoading(true);

    try {
        // Busca dados em paralelo para performance
        // Nota: fetchAPI deve estar disponível globalmente via api.js ou utils.js
        const [usuarios, cursos, materias] = await Promise.all([
            fetchAPI('/usuarios'), 
            fetchAPI('/cursos'), 
            fetchAPI('/materias')
        ]);

        // Cálculos de Estatísticas
        const totalAlunos = usuarios.filter(u => u.tipo === 'ALUNO').length;
        const totalProfs = usuarios.filter(u => u.tipo === 'PROFESSOR').length;

        const stats = [
            { 
                titulo: 'Total de Alunos', 
                valor: totalAlunos, 
                icon: 'fa-user-graduate', 
                color: 'success', 
                desc: 'Matriculados'
            },
            { 
                titulo: 'Corpo Docente', 
                valor: totalProfs, 
                icon: 'fa-chalkboard-teacher', 
                color: 'warning', 
                desc: 'Professores ativos'
            },
            { 
                titulo: 'Cursos Ativos', 
                valor: cursos.length, 
                icon: 'fa-laptop-code', 
                color: 'info', 
                desc: 'Grades curriculares'
            },
            { 
                titulo: 'Disciplinas', 
                valor: materias.length, 
                icon: 'fa-book', 
                color: 'danger', 
                desc: 'Total cadastrado'
            }
        ];

        // Gera HTML dos Cards KPI
        const kpiCardsHtml = stats.map(stat => `
            <div class="col-md-6 col-lg-3">
                <div class="card border-0 shadow-sm h-100 rounded-4 overflow-hidden position-relative hover-lift">
                    <div class="position-absolute top-0 start-0 bottom-0 bg-${stat.color}" style="width: 5px;"></div>
                    <div class="card-body p-4 d-flex align-items-center justify-content-between">
                        <div>
                            <div class="text-uppercase text-muted fw-bold small mb-1" style="font-size: 0.75rem; letter-spacing: 0.5px;">
                                ${stat.titulo}
                            </div>
                            <div class="h2 fw-bold text-dark mb-0">${stat.valor}</div>
                            <small class="text-muted mt-1 d-block" style="font-size: 0.8rem;">${stat.desc}</small>
                        </div>
                        <div class="d-flex align-items-center justify-content-center rounded-3 bg-${stat.color} bg-opacity-10 text-${stat.color}" 
                             style="width: 56px; height: 56px;">
                            <i class="fas ${stat.icon} fa-lg"></i>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        // Saudação dinâmica (tenta usar a do utils.js, senão usa fallback)
        const saudacao = (typeof getSaudacao === 'function') ? getSaudacao() : 'Olá';

        // Renderiza HTML Final
        appContent.innerHTML = `
            <div class="fade-in">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
                    <div class="card-body p-4 p-md-5">
                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 border-bottom pb-4">
                            <div class="mb-3 mb-md-0">
                                <h2 class="fw-bold text-dark mb-1">${saudacao}, Administrador</h2>
                                <p class="text-muted mb-0">Visão geral da instituição em tempo real.</p>
                            </div>
                            <div>
                                <span class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill shadow-sm">
                                   <i class="fas fa-wifi me-1"></i> Sistema Online
                                </span>
                            </div>
                        </div>

                        <div class="row g-4 mb-5">
                            ${kpiCardsHtml}
                        </div>

                        <div class="bg-light rounded-4 p-4 border border-light">
                            <div class="d-flex align-items-center mb-4">
                                <div class="bg-white text-dark shadow-sm rounded-3 me-3 d-flex align-items-center justify-content-center border" style="width: 40px; height: 40px;">
                                    <i class="fas fa-rocket text-primary"></i>
                                </div>
                                <h5 class="fw-bold text-dark mb-0">Ações Rápidas</h5>
                            </div>

                            <div class="row g-3">
                                <div class="col-md-4">
                                    <button class="btn btn-white bg-white border shadow-sm w-100 p-3 text-start d-flex align-items-center card-hover-effect" 
                                            onclick="instAbrirModalUsuario()">
                                        <div class="bg-primary bg-opacity-10 text-primary rounded-3 p-3 me-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                            <i class="fas fa-user-plus fa-lg"></i>
                                        </div>
                                        <div>
                                            <div class="fw-bold text-dark">Novo Usuário</div>
                                            <small class="text-muted">Cadastrar aluno ou prof.</small>
                                        </div>
                                    </button>
                                </div>

                                <div class="col-md-4">
                                    <button class="btn btn-white bg-white border shadow-sm w-100 p-3 text-start d-flex align-items-center card-hover-effect" 
                                            onclick="instAbrirModalCurso()">
                                        <div class="bg-info bg-opacity-10 text-info rounded-3 p-3 me-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                            <i class="fas fa-certificate fa-lg"></i>
                                        </div>
                                        <div>
                                            <div class="fw-bold text-dark">Novo Curso</div>
                                            <small class="text-muted">Adicionar grade curricular.</small>
                                        </div>
                                    </button>
                                </div>

                                <div class="col-md-4">
                                    <button class="btn btn-white bg-white border shadow-sm w-100 p-3 text-start d-flex align-items-center card-hover-effect" 
                                            onclick="instAbrirModalMateria()">
                                        <div class="bg-warning bg-opacity-10 text-warning rounded-3 p-3 me-3 d-flex align-items-center justify-content-center" style="width: 50px; height: 50px;">
                                            <i class="fas fa-book fa-lg"></i>
                                        </div>
                                        <div>
                                            <div class="fw-bold text-dark">Nova Matéria</div>
                                            <small class="text-muted">Criar nova disciplina.</small>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div> </div>
                </div>
            </div>`;

    } catch (e) {
        console.error("Erro ao carregar dashboard:", e);
        appContent.innerHTML = `
            <div class="alert alert-danger shadow-sm border-0 m-4 rounded-3">
                <div class="d-flex align-items-center">
                    <i class="fas fa-exclamation-triangle fa-2x me-3"></i>
                    <div>
                        <h4 class="alert-heading mb-1">Erro de Conexão</h4>
                        <p class="mb-0">Não foi possível carregar os dados do dashboard. Verifique se o servidor está rodando.</p>
                    </div>
                </div>
                <hr>
                <button class="btn btn-outline-danger btn-sm" onclick="instRenderHome()">
                    <i class="fas fa-sync-alt me-1"></i> Tentar Novamente
                </button>
            </div>`;
    }
}