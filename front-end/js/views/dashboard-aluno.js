// --- DASHBOARD (HOME) ---

async function alunoRenderHome() {
    atualizarMenuAtivo('Início');
    const appContent = document.getElementById('appContent');
    if (!appContent) return;

    instLoading(true);
    const user = getUser();

    try {
        const matriculas = await fetchAPI('/matriculas');
        
        const minhas = matriculas ? matriculas.filter(m => {
            const idAlu = m.idAluno || (m.aluno ? m.aluno.id : null);
            return parseInt(idAlu) === parseInt(user.id) && !['HISTORICO', 'CANCELADO'].includes(m.situacao);
        }) : [];

        const totalMateriasAtivas = minhas.filter(m => m.situacao === 'CURSANDO' || m.situacao === 'RECUPERACAO').length;
        
        let somaNotas = 0;
        let materiasParaMedia = 0;
        
        minhas.forEach(m => {
            if (m.situacao === 'APROVADO' || m.situacao === 'REPROVADO') {
                const mf = parseFloat(m.mediaFinal);
                if (!isNaN(mf)) {
                    somaNotas += mf;
                    materiasParaMedia++;
                }
            }
        });
        
        const cr = materiasParaMedia > 0 ? (somaNotas / materiasParaMedia).toFixed(1) : "0.0";

        appContent.innerHTML = `
            <div class="row mb-4 fade-in">
                <div class="col-md-12">
                    <div class="card bg-primary text-white shadow-sm border-0" style="border-radius: 15px;">
                        <div class="card-body p-4">
                            <h2 class="fw-bold mb-1">Olá, ${user.nome}!</h2>
                            <p class="mb-0 opacity-75">Seu progresso acadêmico consolidado.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row g-4 mb-4 fade-in">
                ${cardStat('ÍNDICE DE RENDIMENTO (CR)', cr, 'fa-chart-line', 'success')}
                ${cardStat('DISCIPLINAS ATIVAS', totalMateriasAtivas, 'fa-book', 'warning')}
            </div>
            <div class="card border-0 shadow-sm p-4 bg-white rounded-3 fade-in text-center">
                <h5 class="fw-bold mb-3 border-bottom pb-2">Acesso Rápido</h5>
                <div class="d-flex gap-3 justify-content-center flex-wrap">
                    <button class="btn btn-outline-primary px-4" onclick="alunoRenderMatricula()">
                        <i class="fas fa-plus-circle me-2"></i>Nova Matrícula
                    </button>
                    <button class="btn btn-outline-secondary px-4" onclick="alunoRenderCurso()">
                        <i class="fas fa-graduation-cap me-2"></i>Ver Meu Progresso
                    </button>
                </div>
            </div>`;
    } catch (e) {
        console.error(e);
        exibirErroVisual("Erro ao carregar os dados do seu dashboard.");
    } finally {
        instLoading(false);
    }
}

// --- INICIALIZAÇÃO DO ALUNO ---

async function carregarAluno() {
    if (typeof pageTitle !== 'undefined' && pageTitle) {
        pageTitle.innerHTML = '<span class="fw-bold text-primary">Portal</span> do Aluno';
    }

    const user = getUser();
    const userNameDisplay = document.getElementById("user-name-display");
    if (userNameDisplay && user.nome) {
        userNameDisplay.innerText = user.nome;
    }

    let matriculasCurso = [];
    try {
        matriculasCurso = await fetchAPI(`/matriculas/curso/aluno/${user.id}`);
    } catch (e) {
        console.warn("Não foi possível carregar matrículas de curso na inicialização.");
    }
    
    const temCurso = Array.isArray(matriculasCurso) && matriculasCurso.length > 0;

    const sidebarMenu = document.getElementById("sidebar-menu");
    if (sidebarMenu) {
        sidebarMenu.innerHTML = `
            <a href="#" onclick="alunoRenderHome()" class="list-group-item list-group-item-action bg-transparent second-text fw-bold">
                <i class="fas fa-home me-2"></i>Início
            </a>
            <a href="#" onclick="alunoRenderCatalogoCursos()" class="list-group-item list-group-item-action bg-transparent second-text fw-bold">
                <i class="fas fa-graduation-cap me-2"></i>Cursos Disponíveis
            </a>
            ${temCurso ? `
                <a href="#" onclick="alunoRenderCurso()" class="list-group-item list-group-item-action bg-transparent second-text fw-bold">
                    <i class="fas fa-tasks me-2"></i>Meu Progresso
                </a>
                <a href="#" onclick="alunoRenderDisciplinas()" class="list-group-item list-group-item-action bg-transparent second-text fw-bold">
                    <i class="fas fa-book-open me-2"></i>Minhas Notas
                </a>
                <a href="#" onclick="alunoRenderMatricula()" class="list-group-item list-group-item-action bg-transparent second-text fw-bold">
                    <i class="fas fa-plus-circle me-2"></i>Matrícula em Disciplinas
                </a>
            ` : `
                <div class="list-group-item list-group-item-action bg-transparent text-muted small fw-bold opacity-50">
                    <i class="fas fa-lock me-2"></i>Funcionalidades Bloqueadas
                </div>
            `}
        `;
    }

    // Carrega a home por padrão
    alunoRenderHome();
}