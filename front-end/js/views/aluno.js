// CONFIGURAÇÕES E INICIALIZAÇÃO DO ALUNO

function cardStat(titulo, valor, icone, cor) {
    return `
        <div class="col-md-6">
            <div class="card border-0 shadow-sm h-100 border-start border-4 border-${cor}">
                <div class="card-body d-flex align-items-center p-4">
                    <div class="rounded-circle bg-${cor} bg-opacity-10 p-3 me-3 text-${cor}">
                        <i class="fas ${icone} fa-2x"></i>
                    </div>
                    <div>
                        <h6 class="text-muted text-uppercase small fw-bold mb-1">${titulo}</h6>
                        <h2 class="fw-bold mb-0 text-dark">${valor}</h2>
                    </div>
                </div>
            </div>
        </div>`;
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

// --- MEU CURSO (VISÃO GERAL / PROGRESSO / RE-MATRÍCULA) ---
async function alunoRenderCurso() {
    atualizarMenuAtivo('Meu Progresso');
    instLoading(true);
    const user = getUser();
    const appContent = document.getElementById('appContent');
    if (!appContent) return;

    try {
        const [matriculasCurso, todasMaterias, todasMatriculas] = await Promise.all([
            fetchAPI(`/matriculas/curso/aluno/${user.id}`), 
            fetchAPI('/materias'),
            fetchAPI('/matriculas')
        ]);

        if (!matriculasCurso || matriculasCurso.length === 0) {
            appContent.innerHTML = `<div class="text-center py-5"><p class="text-muted">Você não está matriculado em nenhum curso.</p></div>`;
            return;
        }

        const minhasMatriculasDisciplinas = (todasMatriculas || []).filter(m => {
            const idAlu = m.idAluno || (m.aluno ? m.aluno.id : null);
            return parseInt(idAlu) === parseInt(user.id);
        });

        let htmlFinal = `<h4 class="fw-bold mb-4">Seu Desempenho Acadêmico</h4>`;

        matriculasCurso.forEach(cursoMat => {
            const gradeDoCurso = (todasMaterias || []).filter(m => 
                m.nomeCurso && cursoMat.nomeCurso &&
                m.nomeCurso.trim().toLowerCase() === cursoMat.nomeCurso.trim().toLowerCase()
            );            

            const materiasConcluidas = [];
            const materiasPendentes = [];

            gradeDoCurso.forEach(materiaGrade => {
                const registrosAtivos = minhasMatriculasDisciplinas.filter(mm => {
                    const idMateriaRef = mm.idMateria || (mm.materia ? mm.materia.id : null);
                    return parseInt(idMateriaRef) === parseInt(materiaGrade.id) && 
                        !['HISTORICO', 'CANCELADO'].includes(mm.status);
                });

                const aprovada = registrosAtivos.find(m => m.situacao === 'APROVADO');
                const cursando = registrosAtivos.find(m => m.situacao === 'CURSANDO' || m.situacao === 'RECUPERACAO');
                const reprovada = registrosAtivos.find(m => m.situacao === 'REPROVADO');

                if (aprovada) {
                    materiasConcluidas.push({ ...materiaGrade, nota: aprovada.mediaFinal, status: 'APROVADO' });
                } else if (cursando) {
                    materiasPendentes.push({
                        ...materiaGrade,
                        status: 'CURSANDO',
                        idHistorico: cursando.id
                    });
                } else if (reprovada) {
                    materiasPendentes.push({
                        ...materiaGrade,
                        status: 'REPROVADO',
                        nota: parseFloat(reprovada.mediaFinal || 0),
                        idHistorico: reprovada.id 
                    });
                } else {
                    materiasPendentes.push({ ...materiaGrade, status: 'DISPONIVEL' });
                }
            });

            const totalMaterias = gradeDoCurso.length;
            const percentual = totalMaterias > 0 ? Math.round((materiasConcluidas.length / totalMaterias) * 100) : 0;
            htmlFinal += renderizarCardCurso(cursoMat, percentual, materiasConcluidas, materiasPendentes);
        });

        appContent.innerHTML = htmlFinal;

    } catch (e) { 
        console.error("Erro ao renderizar curso:", e);
        appContent.innerHTML = '<div class="alert alert-danger">Erro ao carregar o progresso acadêmico.</div>'; 
    } finally { 
        instLoading(false); 
    }
}

// Função auxiliar para manter o código limpo
function renderizarCardCurso(cursoMat, percentual, concluidas, pendentes) {
    return `
        <div class="card border-0 shadow-sm mb-5 p-4 fade-in">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h5 class="fw-bold text-primary mb-0">${cursoMat.nomeCurso}</h5>
                    <small class="text-muted">${percentual === 100 ? 'Formado' : 'Em Andamento'}</small>
                </div>
                <span class="badge bg-primary fs-6">${percentual}% Concluído</span>
            </div>
            <div class="progress mb-4" style="height: 10px; border-radius: 5px;">
                <div class="progress-bar bg-success" style="width: ${percentual}%"></div>
            </div>
            <div class="row g-4">
                <div class="col-md-6">
                    <h6 class="small fw-bold text-success text-uppercase mb-3 border-bottom pb-2">Concluídas</h6>
                    <ul class="list-group list-group-flush">
                        ${concluidas.map(m => `
                            <li class="list-group-item d-flex justify-content-between align-items-center bg-success bg-opacity-10 mb-2 rounded border-0">
                                <span class="fw-bold text-dark">${m.nome}</span>
                                <span class="badge bg-success">Nota: ${parseFloat(m.nota).toFixed(1)}</span>
                            </li>`).join('') || '<li class="text-muted small">Nenhuma concluída.</li>'}
                    </ul>
                </div>
                <div class="col-md-6">
                    <h6 class="small fw-bold text-muted text-uppercase mb-3 border-bottom pb-2">Grade Pendente</h6>
                    <div class="list-group">
                        ${pendentes.map(m => {
                            let badge = '', action = '';
                            if(m.status === 'CURSANDO') {
                                badge = `<span class="badge bg-primary">Cursando</span>`;
                                action = `<button class="btn btn-sm btn-link text-decoration-none fw-bold" onclick="alunoRenderDisciplinas()">Ver Notas</button>`;
                            } else if (m.status === 'REPROVADO') {
                                badge = `<span class="badge bg-danger">Reprovado (${m.nota.toFixed(1)})</span>`;
                                action = `<button class="btn btn-sm btn-outline-danger" onclick="alunoRefazerMateria(${m.id}, ${m.idHistorico}, '${m.nome.replace(/'/g, "\\'")}')">Refazer</button>`;
                            } else {
                                badge = `<span class="badge bg-secondary text-dark">Pendente</span>`;
                                action = `<button class="btn btn-sm btn-outline-primary" onclick="confirmarMatricula(${m.id}, '${m.nome.replace(/'/g, "\\'")}')">Matricular</button>`;
                            }
                            return `
                                <div class="list-group-item d-flex justify-content-between align-items-center border-0 border-bottom">
                                    <div><span class="d-block fw-medium">${m.nome}</span>${badge}</div>
                                    <div>${action}</div>
                                </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>`;
}

async function alunoRefazerMateria(idMateria, idMatriculaAntiga, nomeMateria) {
    if (!confirm(`Deseja mover a reprovação de "${nomeMateria}" para o histórico e tentar novamente?`)) return;

    try {
        instLoading(true);
        const user = getUser();

        // 1. Move a antiga para Histórico
        await fetchAPI(`/matriculas/${idMatriculaAntiga}`, 'PUT', {
            situacao: 'HISTORICO'
        });

        // 2. Cria a nova como CURSANDO
        const payload = { 
            idAluno: parseInt(user.id), 
            idMateria: parseInt(idMateria),
            situacao: 'CURSANDO', // Força o status correto
            nota1: 0,
            nota2: 0,
            mediaFinal: 0
        };

        const response = await fetchAPI('/matriculas', 'POST', payload);
        
        if(response) {
            mostrarToast(`Sucesso! Nova matrícula em ${nomeMateria} iniciada.`, "success");
            // Pequeno delay para o banco processar antes do refresh
            setTimeout(() => {
                alunoRenderCurso(); 
            }, 800);
        }

    } catch (error) {
        console.error("Erro ao refazer matéria:", error);
        mostrarToast("Erro ao processar re-matrícula.", "danger");
    } finally {
        instLoading(false);
    }
}

// --- MINHAS DISCIPLINAS (FILTRO POR NOTA) ---
async function alunoRenderDisciplinas() {
    const appContent = document.getElementById('appContent');
    if (!appContent) return;

    atualizarMenuAtivo('Minhas Disciplinas');
    appContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border-start border-primary border-4">
            <div>
                <h4 class="m-0 fw-bold">Minhas Notas</h4>
                <p class="text-muted small mb-0">Acompanhe seu desempenho acadêmico em tempo real.</p>
            </div>
            <div class="input-group" style="width: 300px;">
                <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
                <input type="text" id="buscaInput" class="form-control border-start-0" placeholder="Filtrar disciplina..." oninput="alunoFiltrarDisciplinas()">
            </div>
        </div>
        <div class="row g-3" id="disciplinasContainer"></div>`;
    alunoFiltrarDisciplinas();
}

async function alunoFiltrarDisciplinas() {
    const buscaInput = document.getElementById('buscaInput');
    const termo = buscaInput ? buscaInput.value.toLowerCase() : "";
    const container = document.getElementById('disciplinasContainer');
    const user = getUser();

    if (!container) return;

    try {
        const todasMatriculas = await fetchAPI('/matriculas');
        
        let minhas = (todasMatriculas || []).filter(m => {
            const idAlu = m.idAluno || (m.aluno ? m.aluno.id : null);
            const isMeuId = parseInt(idAlu) === parseInt(user.id);
            const situacao = (m.situacao || "").toUpperCase();
            return isMeuId && !['HISTORICO', 'CANCELADO'].includes(situacao);
        });
        
        if (termo) {
            minhas = minhas.filter(m => 
                (m.nomeMateria && m.nomeMateria.toLowerCase().includes(termo))
            );
        }

        if(minhas.length === 0) {
            container.innerHTML = '<div class="col-12 text-center p-5 text-muted">Nenhuma disciplina ativa encontrada.</div>';
            return;
        }

        container.innerHTML = minhas.map(m => {
            const media = parseFloat(m.mediaFinal || 0);
            const idMateria = m.idMateria || (m.materia ? m.materia.id : 0);

            const configStatus = {
                'APROVADO':    { classe: 'success',           texto: 'Aprovado',    icone: 'fa-check-circle' },
                'REPROVADO':   { classe: 'danger',            texto: 'Reprovado',   icone: 'fa-times-circle' },
                'CURSANDO':    { classe: 'info text-white',   texto: 'Em Curso',    icone: 'fa-pencil-alt' },
                'RECUPERACAO': { classe: 'warning text-dark', texto: 'Recuperação', icone: 'fa-life-ring' }
            };

            const statusLayout = configStatus[m.situacao] || configStatus['CURSANDO'];
            const corNota = (m.situacao === 'RECUPERACAO') ? 'text-warning' : (media >= 7 ? 'text-success' : 'text-danger');

            return `
            <div class="col-md-6 col-lg-4 fade-in">
                <div class="card h-100 border-0 shadow-sm border-top border-4 border-${statusLayout.classe.split(' ')[0]}">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-3" style="min-height: 60px;">
                            <div style="flex: 1; margin-right: 10px;">
                                <small class="text-muted fw-bold small text-uppercase" style="font-size: 0.65rem;">${m.nomeCurso || 'Curso'}</small>
                                <h5 class="fw-bold text-dark mt-1 mb-0" style="font-size: 1rem; line-height: 1.2;">${m.nomeMateria}</h5>
                            </div>
                            <span class="badge bg-${statusLayout.classe} rounded-pill shadow-sm d-flex align-items-center justify-content-center" 
                                  style="font-size: 0.65rem; padding: 6px 10px; white-space: nowrap; flex-shrink: 0;">
                                <i class="fas ${statusLayout.icone} me-1"></i>${statusLayout.texto.toUpperCase()}
                            </span>
                        </div>
                        
                        <div class="bg-light rounded p-3 d-flex justify-content-between align-items-center mb-3 mt-auto">
                            <span class="small text-muted fw-bold">MÉDIA ${m.situacao === 'APROVADO' ? 'FINAL' : 'ATUAL'}</span>
                            <span class="h4 mb-0 fw-bold ${corNota}">${media.toFixed(1)}</span>
                        </div>

                        <button class="btn btn-sm btn-outline-primary w-100 rounded-pill fw-bold" 
                                onclick="alunoVerDetalhesNotas(${idMateria}, '${m.nomeMateria.replace(/'/g, "\\'")}')">
                            <i class="fas fa-search me-1"></i> Detalhes das Notas
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
            
    } catch (e) { 
        console.error(e);
        if (container) container.innerHTML = '<div class="alert alert-danger col-12">Erro ao carregar notas.</div>'; 
    }
}

// Função auxiliar simples para cor da nota na tabela
function getNotaColor(valor) {
    if (valor === undefined || valor === null || valor === '-') return 'text-muted';
    const n = parseFloat(valor);
    if (n >= 7) return 'text-success';
    if (n >= 5) return 'text-warning';
    return 'text-danger';
}

async function alunoVerDetalhesNotas(idMateria, nomeMateria) {
    instLoading(true);
    try {
        const user = getUser();
        const [avaliacoes, matriculas] = await Promise.all([
            fetchAPI(`/materias/${idMateria}/avaliacoes`),
            fetchAPI('/matriculas')
        ]);
        
        const detalhes = matriculas.find(m => {
            const idAlu = m.idAluno || (m.aluno ? m.aluno.id : null);
            const idMat = m.idMateria || (m.materia ? m.materia.id : null);
            return parseInt(idAlu) === parseInt(user.id) && parseInt(idMat) === parseInt(idMateria);
        });

        if (!detalhes) return mostrarToast("Detalhes não encontrados.", "warning");

        const mapaNotas = {};
        if (Array.isArray(detalhes.notas)) {
            detalhes.notas.forEach(n => { mapaNotas[n.idConfiguracao] = n.valor; });
        }

        // Ordenar avaliações: Regulares primeiro, Recuperação por último
        const avOrdenadas = [...avaliacoes].sort((a, b) => {
            const isARec = isRecuperacaoNome(a.descricaoNota || a.nome);
            const isBRec = isRecuperacaoNome(b.descricaoNota || b.nome);
            return isARec - isBRec;
        });

        const modalHtml = `
            <div class="modal fade" id="modalDetalhesNotas" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow-lg">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title fw-bold"><i class="fas fa-graduation-cap me-2"></i>${nomeMateria}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th class="ps-4">Avaliação</th>
                                            <th class="text-center">Peso</th>
                                            <th class="text-center pe-4">Nota</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${avOrdenadas.map(av => {
                                            const nomeOriginal = av.descricaoNota || av.nome || "";
                                            const isRec = isRecuperacaoNome(nomeOriginal);
                                            const nota = mapaNotas[av.id];
                                            const notaFormatada = nota !== undefined ? Number(nota).toFixed(1) : '-';
                                            
                                            return `
                                            <tr class="${isRec ? 'table-warning-subtle' : ''}">
                                                <td class="ps-4 align-middle">
                                                    <span class="${isRec ? 'fw-bold text-dark' : ''}">
                                                        ${isRec ? '<i class="fas fa-redo me-2 text-warning"></i>' : ''}
                                                        ${nomeOriginal}
                                                    </span>
                                                </td>
                                                <td class="text-center align-middle text-muted small">
                                                    ${isRec ? '<span class="badge bg-warning text-dark">Substitutiva</span>' : av.peso}
                                                </td>
                                                <td class="text-center align-middle fw-bold ${getNotaColor(nota)} pe-4" style="font-size: 1.1rem;">
                                                    ${notaFormatada}
                                                </td>
                                            </tr>`;
                                        }).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr class="table-dark text-white">
                                            <td colspan="2" class="ps-4 fw-bold text-uppercase">Média Final</td>
                                            <td class="text-center fw-bold pe-4" style="font-size: 1.2rem;">
                                                ${parseFloat(detalhes.mediaFinal || 0).toFixed(1)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div class="p-3 bg-light border-top">
                                <small class="text-muted">
                                    <i class="fas fa-info-circle me-1"></i> 
                                    A média para aprovação direta é <strong>7.0</strong>. Entre 5.0 e 6.9 o aluno está em recuperação.
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        document.getElementById('modalDetalhesNotas')?.remove();
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        new bootstrap.Modal(document.getElementById('modalDetalhesNotas')).show();
    } catch (e) {
        console.error(e);
        mostrarToast("Erro ao carregar detalhes.", "danger");
    } finally {
        instLoading(false);
    }
}

// Função auxiliar para evitar repetição de lógica
function isRecuperacaoNome(nome) {
    const n = (nome || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    return n.includes("RECUPERACAO") || n.includes("PROVA FINAL");
}

// --- MATRÍCULA ONLINE (RESTRITO AO CURSO) ---
async function alunoRenderMatricula() {
    atualizarMenuAtivo('Matrícula Online');
    const appContent = document.getElementById('appContent');
    
    if (!appContent) return; 

    appContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="fw-bold">Catálogo de Disciplinas</h4>
            <div class="input-group" style="width: 300px;">
                <input type="text" id="buscaInput" class="form-control" placeholder="Buscar no catálogo..." oninput="alunoFiltrarMatricula()">
            </div>
        </div>
        <div class="card border-0 shadow-sm">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th class="ps-4">Curso</th>
                            <th>Disciplina</th>
                            <th class="text-end pe-4">Ação</th>
                        </tr>
                    </thead>
                    <tbody id="matriculaTableBody"></tbody>
                </table>
            </div>
        </div>`;
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
    if (!container) return;

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
            container.innerHTML = '<tr><td colspan="3" class="text-center py-4 text-muted"><i class="fas fa-info-circle me-2"></i>Você precisa escolher um curso no menu "Cursos Disponíveis" primeiro.</td></tr>';
            return;
        }

        const idsBloqueados = (todasMatriculas || [])
            .filter(m => {
                const idAlu = m.idAluno || (m.aluno ? m.aluno.id : null);
                const isMeu = parseInt(idAlu) === parseInt(user.id);
                const statusBloqueado = ['APROVADO', 'CURSANDO', 'RECUPERACAO'].includes(m.situacao);
                return isMeu && statusBloqueado;
            })
            .map(m => parseInt(m.idMateria || (m.materia ? m.materia.id : 0)));

        matriculasCurso.forEach(curso => {
            const materiasDisponiveis = (todasMaterias || []).filter(m => {
                const nomeMateria = (m.nome || "").toLowerCase();
                const nomeCursoMateria = (m.nomeCurso || "").trim().toLowerCase();
                const nomeCursoAluno = (curso.nomeCurso || "").trim().toLowerCase();

                return nomeCursoMateria === nomeCursoAluno && 
                       !idsBloqueados.includes(parseInt(m.id)) && 
                       nomeMateria.includes(termoBusca);
            });

            if (materiasDisponiveis.length > 0) {
                htmlRows += `<tr class="table-light"><td colspan="3" class="fw-bold text-primary ps-4 small"><i class="fas fa-graduation-cap me-2"></i>CURSO: ${curso.nomeCurso}</td></tr>`;
                materiasDisponiveis.forEach(m => {
                    htmlRows += `
                        <tr>
                            <td class="ps-5 text-muted small">Disciplina da Grade</td>
                            <td class="fw-bold">${m.nome}</td>
                            <td class="text-end pe-4">
                                <button class="btn btn-sm btn-primary rounded-pill px-3" onclick="confirmarMatricula(${m.id}, '${m.nome.replace(/'/g, "\\'")}')">
                                    <i class="fas fa-plus me-1"></i>Matricular
                                </button>
                            </td>
                        </tr>`;
                });
            }
        });

        container.innerHTML = htmlRows || `<tr><td colspan="3" class="text-center py-4 text-muted">Nenhuma disciplina disponível para matrícula no momento.</td></tr>`;
    } catch (e) { 
        console.error(e);
        container.innerHTML = '<tr><td colspan="3" class="text-center text-danger py-4">Erro ao carregar catálogo. Tente atualizar a página.</td></tr>'; 
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
        
        mostrarToast("Inscrição confirmada com sucesso!", "success");

        setTimeout(() => {
            if (typeof alunoRenderCurso === 'function') alunoRenderCurso();
        }, 600);
        
    } catch (e) { 
        console.error("Erro na Matrícula:", e);
        mostrarToast("Erro: Você já possui uma matrícula ativa nesta disciplina.", "danger"); 
    }
}

async function alunoCancelarMateria(idMatricula, nome) {
    const msg = `Deseja realmente CANCELAR sua matrícula em: ${nome}?\n\n` +
                `• O registro ficará no seu histórico como CANCELADO.\n` +
                `• Se você estiver em Recuperação, perderá o direito de realizar a prova final desta disciplina.`;
    
    if (!confirm(msg)) return;

    try {
        instLoading(true);
        // Atualiza para o status CANCELADO no backend
        await fetchAPI(`/matriculas/${idMatricula}`, 'PUT', {
            situacao: 'CANCELADO'
        });

        mostrarToast(`Matrícula em ${nome} cancelada.`, "info");
        
        if (typeof alunoFiltrarDisciplinas === 'function') await alunoFiltrarDisciplinas();
        if (typeof alunoRenderCurso === 'function') await alunoRenderCurso();
        
    } catch (e) {
        console.error(e);
        mostrarToast("Não foi possível cancelar esta disciplina no momento.", "danger");
    } finally {
        instLoading(false);
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

async function alunoRenderCatalogoCursos() {
    atualizarMenuAtivo('Cursos Disponíveis');
    const user = getUser();

    const appContent = document.getElementById('appContent');
    if (!appContent) return;


    try {
        const [cursos, minhasMatriculas] = await Promise.all([
            fetchAPI('/cursos'),
            fetchAPI(`/matriculas/curso/aluno/${user.id}`)
        ]);

        const idsMeusCursos = (minhasMatriculas || []).map(m => parseInt(m.idCurso));

        appContent.innerHTML = `
            <div class="row g-4 fade-in">
                ${cursos.map(curso => {
                    const jaInscrito = idsMeusCursos.includes(parseInt(curso.id));
                    const matriculaObj = jaInscrito ? minhasMatriculas.find(m => parseInt(m.idCurso) === parseInt(curso.id)) : null;

                    return `
                    <div class="col-md-4">
                        <div class="card h-100 shadow-sm border-0">
                            <div class="card-body d-flex flex-column">
                                <h5 class="fw-bold">${curso.nome}</h5>
                                <p class="text-muted small flex-grow-1">${curso.descricao || 'Graduação disponível.'}</p>
                                ${jaInscrito ? `
                                    <div class="d-grid gap-2">
                                        <button class="btn btn-success disabled"><i class="fas fa-check me-2"></i>Inscrito</button>
                                        <button class="btn btn-outline-danger btn-sm" onclick="alunoCancelarCurso(${matriculaObj?.id}, '${curso.nome}')">Cancelar Curso</button>
                                    </div>
                                ` : `
                                    <button class="btn btn-primary w-100" onclick="confirmarIngresso(${curso.id}, '${curso.nome}')">Escolher Curso</button>
                                `}
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;
    } catch (e) { 
        console.error(e);
        appContent.innerHTML = '<div class="alert alert-danger">Erro ao carregar catálogo de cursos.</div>'; 
    }
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
        mostrarToast("Erro: Dados do aluno ou curso não encontrados.", "danger");
        return;
    }

    try {
        const corpoRequisicao = { 
            idAluno: parseInt(user.id), 
            idCurso: parseInt(idCurso) 
        };

        await fetchAPI('/matriculas/curso', 'POST', corpoRequisicao);
        
        mostrarToast(`Sucesso! Você agora faz parte do curso de ${nomeCurso}.`, "success");
        
        if (typeof carregarAluno === 'function') await carregarAluno(); 
        
        setTimeout(() => {
            if (typeof alunoRenderCurso === 'function') alunoRenderCurso();
        }, 500);
        
    } catch (e) {
        console.error("Erro no ingresso do curso:", e);
        mostrarToast("Erro ao processar matrícula no curso.", "danger");
    }
}

// --- PERFIL (REDEFINIÇÃO DE SENHA E DADOS) ---
async function alunoRenderPerfil() {
    atualizarMenuAtivo('Meu Perfil');
    const me = getUser();

    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
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
    
    if (s1.length < 6) {
        return mostrarToast("A nova senha deve ter pelo menos 6 caracteres.", "warning");
    }

    if (s1 !== s2) {
        return mostrarToast("As senhas não coincidem.", "danger");
    }

    try {
        instLoading(true);
        await fetchAPI(`/usuarios/${idUsuario}`, 'PUT', { 
            nome: me.nome, 
            login: me.login, 
            tipo: me.tipo || 'ALUNO', 
            senha: s1,
            cpf: me.cpf 
        });
        
        mostrarToast("Senha atualizada com sucesso! Redirecionando...");
        
        document.getElementById('pSenhaNova').value = "";
        document.getElementById('pSenhaConf').value = "";
        
        setTimeout(() => alunoRenderHome(), 1500);

    } catch(e) { 
        mostrarToast("Erro ao atualizar senha. Verifique sua conexão.", "danger");
    } finally {
        instLoading(false);
    }
}