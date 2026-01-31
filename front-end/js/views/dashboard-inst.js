async function instRenderHome() {
    atualizarMenuAtivo('Dashboard');
    instLoading(true);

    try {
        const [usuarios, cursos, materias] = await Promise.all([
            fetchAPI('/usuarios'), 
            fetchAPI('/cursos'), 
            fetchAPI('/materias')
        ]);

        const totalAlunos = usuarios.filter(u => u.tipo === 'ALUNO').length;
        const totalProfs = usuarios.filter(u => u.tipo === 'PROFESSOR').length;

        // Configuração dos dados para gerar os cards dinamicamente
        const stats = [
            { 
                titulo: 'Total de Alunos', 
                valor: totalAlunos, 
                icon: 'fa-user-graduate', 
                color: 'success', // bootstrap color name
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

        // Gera o HTML dos Cards de KPI
        const kpiCardsHtml = stats.map(stat => `
            <div class="col-md-3">
                <div class="card border-0 shadow-sm h-100 rounded-4 overflow-hidden position-relative">
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

        const html = `
            <div class="fade-in">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                    <div class="card-body p-4 p-md-5">
                        
                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 border-bottom pb-4">
                            <div class="mb-3 mb-md-0">
                                <h2 class="fw-bold text-dark mb-1">${getSaudacao()}, Administrador</h2>
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
                                <div class="icon-square bg-white text-dark shadow-sm rounded-3 me-3 d-flex align-items-center justify-content-center border" style="width: 40px; height: 40px;">
                                    <i class="fas fa-rocket text-primary"></i>
                                </div>
                                <h5 class="fw-bold text-dark mb-0">Ações Rápidas</h5>
                            </div>

                            <div class="row g-3">
                                <div class="col-md-4">
                                    <button class="btn btn-white bg-white border shadow-sm w-100 p-3 text-start d-flex align-items-center card-hover-effect" onclick="instAbrirModalUsuario()">
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
                                    <button class="btn btn-white bg-white border shadow-sm w-100 p-3 text-start d-flex align-items-center card-hover-effect" onclick="instAbrirModalCurso()">
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
                                    <button class="btn btn-white bg-white border shadow-sm w-100 p-3 text-start d-flex align-items-center card-hover-effect" onclick="instAbrirModalMateria()">
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
                        </div>

                    </div>
                </div>
            </div>`;

        const target = document.getElementById('appContent');
        if(target) target.innerHTML = html;

    } catch (e) {
        console.error(e);
        const target = document.getElementById('appContent');
        if(target) target.innerHTML = `
            <div class="alert alert-danger shadow-sm border-0 m-4 rounded-3">
                <div class="d-flex align-items-center">
                    <i class="fas fa-exclamation-triangle fa-2x me-3"></i>
                    <div>
                        <h4 class="alert-heading mb-1">Erro de Conexão</h4>
                        <p class="mb-0">Não foi possível carregar o dashboard. Verifique sua internet.</p>
                    </div>
                </div>
                <hr>
                <button class="btn btn-outline-danger btn-sm" onclick="instRenderHome()">Tentar Novamente</button>
            </div>`;
    }
}

function renderKPICard(titulo, valor, icone, bgClass) {
    return `
    <div class="col-md-6 col-lg-3">
        <div class="card-kpi">
            <div class="kpi-icon-wrapper ${bgClass}">
                <i class="fas ${icone}"></i>
            </div>
            <div class="kpi-value">${valor}</div>
            <div class="kpi-label">${titulo}</div>
        </div>
    </div>`;
}