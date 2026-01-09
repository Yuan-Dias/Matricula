// CONFIGURAÇÕES E INICIALIZAÇÃO DO ALUNO
async function carregarAluno() {
    if(typeof pageTitle !== 'undefined' && pageTitle) {
        pageTitle.innerHTML = '<span class="fw-bold text-primary">Portal</span> do Aluno';
    }
    
    const user = getUser();
    const userNameDisplay = document.getElementById("user-name-display"); 
    if (userNameDisplay && user.nome) {
        userNameDisplay.innerText = user.nome;
    }

    const matriculasCurso = await fetchAPI(`/matriculas/curso/aluno/${user.id}`);
    const temCurso = matriculasCurso && matriculasCurso.length > 0;

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

    alunoRenderHome();
}

// --- UTILITÁRIO: MODAL DE MENSAGEM ---
function mostrarModalMsg(titulo, mensagem, tipo = 'success') {
    const modalHtml = `
        <div class="modal fade" id="modalMsgGerada" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-${tipo} text-white border-0">
                        <h5 class="modal-title fw-bold">${titulo}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4 text-center">
                        <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} fa-3x text-${tipo} mb-3"></i>
                        <p class="fs-5 mb-0">${mensagem}</p>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-${tipo} w-100" data-bs-dismiss="modal">Entendido</button>
                    </div>
                </div>
            </div>
        </div>`;
    
    document.getElementById('modalMsgGerada')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    new bootstrap.Modal(document.getElementById('modalMsgGerada')).show();
}

// --- DASHBOARD (HOME) ---
async function alunoRenderHome() {
    atualizarMenuAtivo('Início');
    instLoading(true);
    const user = getUser();

    try {
        const matriculas = await fetchAPI('/matriculas');
        const minhas = matriculas.filter(m => {
            const idDoc = m.idAluno || (m.aluno ? m.aluno.id : null);
            return parseInt(idDoc) === parseInt(user.id);
        });
        
        const totalMaterias = minhas.length;
        let somaNotas = 0;
        minhas.forEach(m => somaNotas += (m.nota || 0));
        const cr = totalMaterias > 0 ? (somaNotas / totalMaterias).toFixed(1) : "0.0";

        appContent.innerHTML = `
            <div class="row mb-4 fade-in">
                <div class="col-md-12">
                    <div class="card bg-primary text-white shadow-sm border-0" style="border-radius: 15px;">
                        <div class="card-body p-4">
                            <h2 class="fw-bold mb-1">Olá, ${user.nome}!</h2>
                            <p class="mb-0 opacity-75">Bem-vindo ao seu painel acadêmico.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row g-4 mb-4 fade-in">
                ${cardStat('MÉDIA GERAL (CR)', cr, 'fa-chart-line', 'success')}
                ${cardStat('DISCIPLINAS ATIVAS', totalMaterias, 'fa-book', 'warning')}
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
        exibirErroVisual("Erro ao carregar os dados do seu dashboard.");
    }
}

// --- MEU CURSO (VISÃO GERAL / PROGRESSO) ---
async function alunoRenderCurso() {
    atualizarMenuAtivo('Meu Progresso');
    instLoading(true);
    const user = getUser();

    try {
        const [matriculasCurso, todasMaterias, todasMatriculas] = await Promise.all([
            fetchAPI(`/matriculas/curso/aluno/${user.id}`),
            fetchAPI('/materias'),
            fetchAPI('/matriculas')
        ]);

        if (!matriculasCurso || matriculasCurso.length === 0) {
            appContent.innerHTML = `
                <div class="text-center py-5 fade-in">
                    <i class="fas fa-graduation-cap fa-3x text-muted mb-3"></i>
                    <p class="fs-5">Você ainda não está vinculado a nenhum curso.</p>
                    <button class="btn btn-primary" onclick="alunoRenderCatalogoCursos()">Ver Catálogo</button>
                </div>`;
            return;
        }

        const minhasMatriculasMaterias = todasMatriculas.filter(m => {
            const idAlu = m.idAluno || (m.aluno ? m.aluno.id : null);
            return parseInt(idAlu) === parseInt(user.id);
        });

        let htmlFinal = `<h4 class="fw-bold mb-4">Seu Desempenho por Curso</h4>`;

        matriculasCurso.forEach(cursoMat => {
            const gradeDoCurso = todasMaterias.filter(m => 
                m.nomeCurso?.trim().toLowerCase() === cursoMat.nomeCurso?.trim().toLowerCase()
            );            

            const cursadas = [];
            const faltantes = [];

            gradeDoCurso.forEach(materiaGrade => {
                const matriculaExistente = minhasMatriculasMaterias.find(mm => {
                    const idMateriaRef = mm.idMateria || mm.idMatriculaMateria || (mm.materia ? mm.materia.id : null);
                    return parseInt(idMateriaRef) === parseInt(materiaGrade.id);
                });

                if (matriculaExistente) {
                    cursadas.push({ 
                        ...materiaGrade, 
                        idMatricula: matriculaExistente.id
                    });
                } else {
                    faltantes.push(materiaGrade);
                }
            });

            const percentual = gradeDoCurso.length > 0 ? Math.round((cursadas.length / gradeDoCurso.length) * 100) : 0;

            htmlFinal += `
                <div class="card border-0 shadow-sm mb-5 p-4 fade-in">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h5 class="fw-bold text-primary mb-0">${cursoMat.nomeCurso}</h5>
                            <small class="text-muted">ID da Matrícula: ${cursoMat.id}</small>
                        </div>
                        <span class="badge bg-primary">${percentual}% concluído</span>
                    </div>
                    <div class="progress mb-4" style="height: 10px; border-radius: 5px;">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" style="width: ${percentual}%"></div>
                    </div>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <h6 class="small fw-bold text-success text-uppercase mb-3"><i class="fas fa-check-circle me-1"></i>Disciplinas Matriculadas</h6>
                            <ul class="list-group list-group-flush border rounded">
                                ${cursadas.map(m => `
                                    <li class="list-group-item d-flex justify-content-between align-items-center">
                                        <span class="small">${m.nome}</span>
                                        <button class="btn btn-link text-danger btn-sm p-0 text-decoration-none" 
                                            onclick="alunoCancelarMateria(${m.idMatricula}, '${m.nome}')">Trancar</button>
                                    </li>`).join('') || '<li class="list-group-item small text-muted">Nenhuma matéria iniciada.</li>'}
                            </ul>
                        </div>
                        <div class="col-md-6">
                            <h6 class="small fw-bold text-muted text-uppercase mb-3"><i class="fas fa-clock me-1"></i>Restantes da Grade</h6>
                            <ul class="list-group list-group-flush border rounded">
                                ${faltantes.map(m => `
                                    <li class="list-group-item d-flex justify-content-between align-items-center bg-light">
                                        <span class="small text-muted">${m.nome}</span>
                                        <button class="btn btn-sm btn-outline-primary py-0" style="font-size: 10px" onclick="alunoRenderMatricula()">Matricular</button>
                                    </li>`).join('') || '<li class="list-group-item small text-success fw-bold">Parabéns! Grade completa.</li>'}
                            </ul>
                        </div>
                    </div>
                </div>`;
        });

        appContent.innerHTML = htmlFinal;
    } catch (e) { 
        console.error(e);
        appContent.innerHTML = '<div class="alert alert-danger">Erro ao carregar o progresso do curso.</div>'; 
    } finally { 
        instLoading(false); 
    }
}

// --- MINHAS DISCIPLINAS (FILTRO POR NOTA) ---
async function alunoRenderDisciplinas() {
    atualizarMenuAtivo('Minhas Disciplinas');
    appContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="fw-bold">Minhas Notas</h4>
            <div class="input-group" style="width: 300px;">
                <input type="text" id="buscaInput" class="form-control" placeholder="Filtrar por nome..." oninput="alunoFiltrarDisciplinas()">
            </div>
        </div>
        <div class="row g-3" id="disciplinasContainer"></div>`;
    alunoFiltrarDisciplinas();
}

async function alunoFiltrarDisciplinas() {
    const termo = document.getElementById('buscaInput')?.value || "";
    const container = document.getElementById('disciplinasContainer');
    const user = getUser();

    try {
        const matriculas = await fetchAPI('/matriculas');
        
        let minhas = filtrarMinhasMatriculas(matriculas, user);
        
        minhas = filtrarDados(minhas, termo, ['nomeMateria']);

        if(minhas.length === 0) {
            container.innerHTML = '<div class="text-center p-5 text-muted">Nenhuma disciplina vinculada.</div>';
            return;
        }

        container.innerHTML = minhas.map(m => `
            <div class="col-md-6 fade-in">
                <div class="card h-100 border-0 shadow-sm border-start border-4 border-${(m.nota || 0) >= 6 ? 'success' : 'primary'}">
                    <div class="card-body">
                        <small class="text-muted uppercase fw-bold small">${m.nomeCurso || 'Curso'}</small>
                        <h5 class="fw-bold mb-3">${m.nomeMateria}</h5>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="h2 mb-0 fw-bold ${(m.nota || 0) >= 6 ? 'text-success' : ''}">${(m.nota || 0).toFixed(1)}</span>
                            <span class="badge ${(m.nota || 0) >= 6 ? 'bg-success' : 'bg-warning text-dark'}">
                                ${(m.nota || 0) >= 6 ? 'Aprovado' : 'Em Curso'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>`).join('');
            
    } catch (e) { 
        container.innerHTML = '<div class="alert alert-danger">Erro ao carregar notas.</div>'; 
    }
}

// --- MATRÍCULA ONLINE (RESTRITO AO CURSO) ---
async function alunoRenderMatricula() {
    atualizarMenuAtivo('Matrícula Online');
    appContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="fw-bold">Catálogo de Disciplinas</h4>
            <div class="input-group" style="width: 300px;">
                <input type="text" id="buscaInput" class="form-control" placeholder="Buscar no catálogo..." oninput="alunoFiltrarMatricula()">
            </div>
        </div>
        <div class="card border-0 shadow-sm"><div class="table-responsive"><table class="table table-hover align-middle mb-0">
            <thead class="bg-light"><tr><th class="ps-4">Curso</th><th>Disciplina</th><th class="text-end pe-4">Ação</th></tr></thead>
            <tbody id="matriculaTableBody"></tbody>
        </table></div></div>`;
    alunoFiltrarMatricula();
}

function filtrarMinhasMatriculas(matriculas, user) {
    if (!matriculas || !Array.isArray(matriculas)) return [];
    return matriculas.filter(m => {
        const idAluMatricula = m.idAluno || 
                              (m.aluno ? m.aluno.id : null) || 
                              (m.usuario ? m.usuario.id : null);
        return parseInt(idAluMatricula) === parseInt(user.id);
    });
}

async function alunoFiltrarMatricula() {
    const container = document.getElementById('matriculaTableBody');
    const termoBusca = document.getElementById('buscaInput')?.value.toLowerCase() || "";
    const user = getUser();

    let htmlRows = "";

    try {
        const [matriculasCurso, todasMaterias, todasMatriculas] = await Promise.all([
            fetchAPI(`/matriculas/curso/aluno/${user.id}`),
            fetchAPI('/materias'),
            fetchAPI('/matriculas')
        ]);

        if (!matriculasCurso || matriculasCurso.length === 0) {
            container.innerHTML = '<tr><td colspan="3" class="text-center py-4">Se matricule em um curso primeiro.</td></tr>';
            return;
        }

        const minhasAtivas = filtrarMinhasMatriculas(todasMatriculas, user);
        const idsJaInscritos = minhasAtivas.map(m => {
            const idMat = m.idMateria || (m.materia ? m.materia.id : 0);
            return parseInt(idMat);
        });

        matriculasCurso.forEach(curso => {
            const materiasDisponiveis = todasMaterias.filter(m => {
                const pertenceAoCurso = m.nomeCurso?.trim().toLowerCase() === curso.nomeCurso?.trim().toLowerCase();
                const naoInscrito = !idsJaInscritos.includes(parseInt(m.id));
                const atendeBusca = m.nome.toLowerCase().includes(termoBusca);
                
                return pertenceAoCurso && naoInscrito && atendeBusca;
            });

            if (materiasDisponiveis.length > 0) {
                htmlRows += `<tr class="bg-light"><td colspan="3" class="fw-bold text-primary ps-4 small">${curso.nomeCurso}</td></tr>`;
                
                materiasDisponiveis.forEach(m => {
                    htmlRows += `
                        <tr>
                            <td class="ps-5 text-muted small">Disciplina da Grade</td>
                            <td class="fw-bold">${m.nome}</td>
                            <td class="text-end pe-4">
                                <button class="btn btn-sm btn-primary" onclick="confirmarMatricula(${m.id}, '${m.nome}')">
                                    <i class="fas fa-plus me-1"></i>Matricular
                                </button>
                            </td>
                        </tr>`;
                });
            }
        });

        container.innerHTML = htmlRows || `<tr><td colspan="3" class="text-center py-4 text-muted">Nenhuma nova disciplina disponível para os seus cursos.</td></tr>`;

    } catch (e) { 
        console.error(e);
        container.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Erro ao carregar catálogo.</td></tr>'; 
    }
}

function confirmarMatricula(id, nome) {
    const modalConfirm = `
        <div class="modal fade" id="modalConfirmMatricula" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-body text-center p-4">
                        <i class="fas fa-question-circle fa-3x text-primary mb-3"></i>
                        <h5>Confirmar Matrícula?</h5>
                        <p class="text-muted">Você será inscrito em: <b>${nome}</b></p>
                        <div class="d-flex gap-2 justify-content-center mt-4">
                            <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary px-4" onclick="alunoMatricular(${id})">Sim, Matricular</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    document.getElementById('modalConfirmMatricula')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalConfirm);
    new bootstrap.Modal(document.getElementById('modalConfirmMatricula')).show();
}

async function alunoMatricular(idMateria) {
    const user = getUser();
    const modalEl = document.getElementById('modalConfirmMatricula');
    const bModal = bootstrap.Modal.getInstance(modalEl);
    if(bModal) bModal.hide();

    try {
        const payload = { 
            idAluno: parseInt(user.id), 
            idMateria: parseInt(idMateria)
        };
        
        await fetchAPI('/matriculas', 'POST', payload);
        
        mostrarToast("Inscrição confirmada com sucesso!");

        setTimeout(() => {
            alunoRenderCurso();
        }, 500);
        
    } catch (e) { 
        console.error("Detalhes do Erro na Matrícula:", e);
        exibirErroVisual("Você já possui matrícula nesta disciplina ou houve um erro no servidor."); 
    }
}

// --- FUNÇÃO DE INGRESSO ---
async function processarIngressoCurso(nomeCurso) {
    const user = getUser();
    try {
        const materias = await fetchAPI('/materias');
        const materia = materias.find(m => m.nomeCurso === nomeCurso);
        
        if (!materia || !materia.idCurso) {
            throw new Error("Grade curricular não encontrada para este curso.");
        }

        await fetchAPI('/matriculas/curso', 'POST', {
            idAluno: parseInt(user.id),
            idCurso: parseInt(materia.idCurso)
        });
        
        bootstrap.Modal.getInstance(document.getElementById('modalConfirmCurso'))?.hide();
        
        mostrarToast(`Matrícula no curso de ${nomeCurso} realizada!`);
        
        await carregarAluno(); 
        
    } catch (e) {
        exibirErroVisual("Falha ao ingressar no curso: " + e.message);
    }
}

async function alunoCancelarMateria(idMatricula, nome) {
    if (!confirm(`Deseja realmente cancelar sua matrícula na disciplina: ${nome}?`)) return;

    try {
        await fetchAPI(`/matriculas/${idMatricula}`, 'DELETE');
        mostrarToast("Matrícula em disciplina cancelada.");
        alunoRenderCurso();
    } catch (e) {
        exibirErroVisual("Erro ao cancelar disciplina.");
    }
}

async function alunoCancelarCurso(idMatriculaCurso, nome) {
    if (!confirm(`AVISO: Cancelar o curso "${nome}" removerá seu acesso à grade curricular. Confirmar?`)) return;

    try {
        await fetchAPI(`/matriculas/curso/${idMatriculaCurso}`, 'DELETE');
        mostrarToast("Curso cancelado com sucesso.");
        await carregarAluno();
    } catch (e) {
        exibirErroVisual("Erro ao cancelar matrícula do curso.");
    }
}

// --- PERFIL (REDEFINIÇÃO DE SENHA E DADOS) ---
async function alunoRenderPerfil() {
    atualizarMenuAtivo('Meu Perfil');
    const me = getUser();
    
    const inicial = me.nome ? me.nome.charAt(0).toUpperCase() : 'U';

    appContent.innerHTML = `
        <div class="row justify-content-center fade-in">
            <div class="col-md-8">
                <div class="card border-0 shadow-sm rounded-3 mb-4">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center mb-3">
                            <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                                 style="width: 60px; height: 60px; font-size: 1.5rem; font-weight: 700;">
                                ${inicial}
                            </div>
                            <div class="ms-3">
                                <h4 class="fw-bold mb-0">${me.nome}</h4>
                                <span class="badge bg-light text-primary border border-primary-subtle">Matrícula Ativa</span>
                            </div>
                        </div>
                        <hr class="text-muted opacity-25">
                        <div class="row g-3">
                            <div class="col-sm-12">
                                <label class="text-muted small fw-bold text-uppercase">Login / Email</label>
                                <p class="mb-0 fw-medium">${me.login}</p>
                            </div>
                            </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm rounded-3">
                    <div class="card-header bg-white p-4 border-bottom d-flex align-items-center">
                        <i class="fas fa-key text-warning me-3 fs-4"></i>
                        <h5 class="fw-bold mb-0">Segurança da Conta</h5>
                    </div>
                    <div class="card-body p-4">
                        <form onsubmit="event.preventDefault(); alunoSalvarSenha(${me.id})">
                            <p class="text-muted small mb-4">Para sua segurança, escolha uma senha forte com letras e números.</p>
                            
                            <div class="mb-3">
                                <label class="form-label text-muted small fw-bold">NOVA SENHA</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-lock text-muted"></i></span>
                                    <input type="password" id="pSenhaNova" class="form-control border-start-0" placeholder="Mínimo 6 caracteres" required>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label class="form-label text-muted small fw-bold">CONFIRMAR NOVA SENHA</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-check-double text-muted"></i></span>
                                    <input type="password" id="pSenhaConf" class="form-control border-start-0" placeholder="Repita a nova senha" required>
                                </div>
                            </div>

                            <button type="submit" class="btn btn-primary btn-lg w-100 shadow-sm fw-bold">
                                <i class="fas fa-save me-2"></i>Atualizar Credenciais
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;
}

async function alunoSalvarSenha(idUsuario) {
    const s1 = document.getElementById('pSenhaNova').value;
    const s2 = document.getElementById('pSenhaConf').value;
    const me = getUser(); 
    
    if (s1.length < 4) {
        return mostrarToast("A senha deve ter pelo menos 4 caracteres.", "danger");
    }

    if (s1 !== s2) {
        return mostrarToast("As senhas digitadas não coincidem.", "danger");
    }

    try {
        await fetchAPI(`/usuarios/${idUsuario}`, 'PUT', { 
            nome: me.nome, 
            login: me.login, 
            tipo: 'ALUNO', 
            senha: s1,
            cpf: me.cpf 
        });
        
        mostrarToast("Sua senha foi alterada com sucesso!");
        
        document.getElementById('pSenhaNova').value = "";
        document.getElementById('pSenhaConf').value = "";
        
        setTimeout(() => alunoRenderHome(), 2000);

    } catch(e) { 
        mostrarToast("Erro ao atualizar senha. Tente novamente.", "danger");
    }
}

async function alunoRenderCatalogoCursos() {
    atualizarMenuAtivo('Cursos Disponíveis');
    const user = getUser();

    try {
        const [cursos, minhasMatriculas] = await Promise.all([
            fetchAPI('/cursos'),
            fetchAPI(`/matriculas/curso/aluno/${user.id}`)
        ]);

        const idsMeusCursos = minhasMatriculas.map(m => parseInt(m.idCurso));

        appContent.innerHTML = `
            <div class="row g-4 fade-in">
                ${cursos.map(curso => {
                    const jaInscrito = idsMeusCursos.includes(parseInt(curso.id));
                    const matriculaId = jaInscrito ? minhasMatriculas.find(m => parseInt(m.idCurso) === parseInt(curso.id)).id : null;

                    return `
                    <div class="col-md-4">
                        <div class="card h-100 shadow-sm border-0">
                            <div class="card-body d-flex flex-column">
                                <h5 class="fw-bold">${curso.nome}</h5>
                                <p class="text-muted small flex-grow-1">${curso.descricao || 'Graduação disponível.'}</p>
                                ${jaInscrito ? `
                                    <div class="d-grid gap-2">
                                        <button class="btn btn-success disabled"><i class="fas fa-check me-2"></i>Inscrito</button>
                                        <button class="btn btn-outline-danger btn-sm" onclick="alunoCancelarCurso(${matriculaId}, '${curso.nome}')">Cancelar Curso</button>
                                    </div>
                                ` : `
                                    <button class="btn btn-primary w-100" onclick="confirmarIngresso(${curso.id}, '${curso.nome}')">Escolher Curso</button>
                                `}
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
    } catch (e) { appContent.innerHTML = "Erro ao carregar catálogo."; }
}

// --- FUNÇÃO DE INGRESSO ---
function confirmarIngresso(idCurso, nomeCurso) {
    const modalConfirm = `
        <div class="modal fade" id="modalConfirmarCursoManual" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-body text-center p-4">
                        <i class="fas fa-university fa-3x text-primary mb-3"></i>
                        <h5 class="fw-bold">Confirmar Escolha?</h5>
                        <p class="text-muted">Você deseja ingressar no curso de <b>${nomeCurso}</b>?</p>
                        <div class="d-flex gap-2 justify-content-center mt-4">
                            <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary px-4" id="btnConfirmarAction">Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    document.getElementById('modalConfirmarCursoManual')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalConfirm);
    
    const myModal = new bootstrap.Modal(document.getElementById('modalConfirmarCursoManual'));
    
    document.getElementById('btnConfirmarAction').onclick = async () => {
        myModal.hide();
        await executarPostIngresso(idCurso, nomeCurso);
    };

    myModal.show();
}

async function executarPostIngresso(idCurso, nomeCurso) {
    const user = getUser();
    
    if (!user || !user.id || !idCurso) {
        exibirErroVisual("Erro: Dados do aluno ou curso não encontrados.");
        return;
    }

    try {
        const corpoRequisicao = { 
            idAluno: parseInt(user.id), 
            idCurso: parseInt(idCurso) 
        };

        console.log("Enviando para o Java:", corpoRequisicao); 

        await fetchAPI('/matriculas/curso', 'POST', corpoRequisicao);
        
        mostrarToast(`Sucesso! Você agora faz parte do curso de ${nomeCurso}.`);
        
        await carregarAluno(); 
        
    } catch (e) {
        exibirErroVisual("Erro ao processar matrícula: " + e.message);
    }
}