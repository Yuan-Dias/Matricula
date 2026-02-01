// --- MATRÍCULA ONLINE ---

// Variáveis globais para cache local (evita flood na API)
let catalogoGlobal = [];
let usuarioLogado = null;

async function alunoRenderMatricula() {
    atualizarMenuAtivo('Matrícula Online');
    const appContent = document.getElementById('appContent');
    
    if (!appContent) return; 

    // Estrutura HTML
    appContent.innerHTML = `
        <div class="fade-in">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h4 class="fw-bold mb-1">Catálogo de Disciplinas</h4>
                    <p class="text-muted small mb-0">Inscreva-se nas matérias disponíveis para o seu curso.</p>
                </div>
                <div class="input-group" style="width: 100%; max-width: 300px;">
                    <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
                    <input type="text" id="buscaInput" class="form-control border-start-0 ps-0" 
                           placeholder="Buscar disciplina..." oninput="alunoFiltrarMatriculaLocal()">
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light text-uppercase small fw-bold text-muted">
                            <tr>
                                <th class="ps-4 py-3">Curso</th>
                                <th class="py-3">Disciplina</th>
                                <th class="text-end pe-4 py-3">Ação</th>
                            </tr>
                        </thead>
                        <tbody id="matriculaTableBody">
                            <tr><td colspan="3" class="text-center py-5 text-muted"><i class="fas fa-circle-notch fa-spin me-2"></i>Carregando catálogo...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="mt-3 alert alert-info d-flex align-items-center small">
                <i class="fas fa-info-circle me-2 fs-5"></i>
                <div>
                    <strong>Nota:</strong> Disciplinas que você já foi aprovado ou está cursando atualmente não aparecem nesta lista.
                    Para ver suas matérias atuais, acesse "Meu Progresso".
                </div>
            </div>
        </div>`;
    
    // Inicia o carregamento dos dados
    await alunoCarregarCatalogo();
}

/**
 * js/aluno/matriculas.js
 * Gerencia a inscrição e cancelamento de disciplinas.
 */

// 1. Carrega dados da API e prepara a lista global
async function alunoCarregarCatalogo() {
    const container = document.getElementById('matriculaTableBody');
    usuarioLogado = getUser();

    try {
        const [matriculasCurso, todasMaterias, todasMatriculas] = await Promise.all([
            fetchAPI(`/matriculas/curso/aluno/${usuarioLogado.id}`), // Cursos que o aluno faz
            fetchAPI('/materias'), // Grade total da faculdade
            fetchAPI('/matriculas') // Histórico de matrículas (para saber o que bloquear)
        ]);

        if (!matriculasCurso || matriculasCurso.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center py-5">
                        <div class="text-muted mb-3"><i class="fas fa-exclamation-circle fa-2x"></i></div>
                        <h6 class="fw-bold">Nenhum curso selecionado</h6>
                        <p class="small text-muted">Você precisa escolher um curso no menu "Cursos Disponíveis" antes de se matricular em matérias.</p>
                        <button class="btn btn-primary btn-sm" onclick="alunoRenderCatalogoCursos()">Ver Cursos</button>
                    </td>
                </tr>`;
            return;
        }

        // Identifica matérias que o aluno JÁ TEM (Bloqueadas)
        // Bloqueia se: Está CURSANDO, RECUPERACAO ou APROVADO.
        // Libera se: REPROVADO, CANCELADO ou HISTORICO (pode refazer).
        const idsBloqueados = (todasMatriculas || [])
            .filter(m => {
                const idAlu = m.idAluno || (m.aluno ? m.aluno.id : null);
                const isMeu = parseInt(idAlu) === parseInt(usuarioLogado.id);
                // Status que impedem nova matrícula
                const statusBloqueado = ['APROVADO', 'CURSANDO', 'RECUPERACAO'].includes(m.situacao);
                return isMeu && statusBloqueado;
            })
            .map(m => parseInt(m.idMateria || (m.materia ? m.materia.id : 0)));

        // Monta a lista limpa de matérias disponíveis para este aluno
        catalogoGlobal = [];

        matriculasCurso.forEach(curso => {
            const materiasDoCurso = (todasMaterias || []).filter(m => {
                // Compara nome do curso da matéria com o curso do aluno (Normalização de strings)
                const nomeCursoMateria = (m.nomeCurso || "").trim().toLowerCase();
                const nomeCursoAluno = (curso.nomeCurso || "").trim().toLowerCase();

                // Verifica pertinência ao curso e se não está bloqueada
                return nomeCursoMateria === nomeCursoAluno && !idsBloqueados.includes(parseInt(m.id));
            });

            // Adiciona ao catálogo global com metadados do curso para exibição
            materiasDoCurso.forEach(m => {
                catalogoGlobal.push({
                    ...m,
                    nomeCursoExibicao: curso.nomeCurso
                });
            });
        });

        // Renderiza a tabela inicial
        alunoFiltrarMatriculaLocal();

    } catch (e) {
        console.error(e);
        if(container) container.innerHTML = '<tr><td colspan="3" class="text-center text-danger py-4">Erro ao carregar catálogo. Tente atualizar a página.</td></tr>';
    }
}

// 2. Filtra localmente (Instantâneo)
function alunoFiltrarMatriculaLocal() {
    const container = document.getElementById('matriculaTableBody');
    if (!container) return;

    const termoBusca = document.getElementById('buscaInput')?.value.toLowerCase() || "";
    
    // Filtra array em memória
    const listaFiltrada = catalogoGlobal.filter(m => 
        m.nome.toLowerCase().includes(termoBusca)
    );

    if (listaFiltrada.length === 0) {
        if (catalogoGlobal.length === 0) {
            container.innerHTML = '<tr><td colspan="3" class="text-center py-5 text-muted">Parabéns! Nenhuma disciplina pendente para matrícula no momento.</td></tr>';
        } else {
            container.innerHTML = '<tr><td colspan="3" class="text-center py-5 text-muted">Nenhuma disciplina encontrada com esse termo.</td></tr>';
        }
        return;
    }

    // Gera HTML
    // Agrupa visualmente se houver mais de um curso, ou apenas lista
    container.innerHTML = listaFiltrada.map(m => `
        <tr>
            <td class="ps-4">
                <span class="badge bg-light text-secondary border">${m.nomeCursoExibicao}</span>
            </td>
            <td>
                <div class="fw-bold text-dark">${m.nome}</div>
                <div class="small text-muted">Carga Horária: ${m.cargaHoraria || '--'}h</div>
            </td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3 transition-hover" 
                    onclick="confirmarMatricula(${m.id}, '${m.nome.replace(/'/g, "\\'")}')">
                    <i class="fas fa-plus me-1"></i> Matricular
                </button>
            </td>
        </tr>
    `).join('');
}

// --- Ações de Matrícula ---

function confirmarMatricula(id, nome) {
    const modalConfirm = `
        <div class="modal fade" id="modalConfirmMatricula" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-body text-center p-4">
                        <div class="mb-3 text-primary bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                             <i class="fas fa-book-open fa-2x"></i>
                        </div>
                        <h5 class="fw-bold mb-2">Confirmar Matrícula?</h5>
                        <p class="text-muted mb-4">Você será inscrito na disciplina:<br><strong>${nome}</strong></p>
                        
                        <div class="d-flex gap-2 justify-content-center">
                            <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary px-4" onclick="alunoMatricular(${id})">Confirmar</button>
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
    const modalEl = document.getElementById('modalConfirmMatricula');
    if (modalEl) {
        const bModal = bootstrap.Modal.getInstance(modalEl);
        if (bModal) bModal.hide();
        
        setTimeout(() => {
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            modalEl.remove();
        }, 150);
    }

    if (!usuarioLogado) {
        usuarioLogado = getUser();
    }

    if (!usuarioLogado || !usuarioLogado.id) {
        mostrarToast("Erro de sessão: Usuário não identificado. Faça login novamente.", "danger");
        return;
    }

    instLoading(true);

    try {
        const payload = { 
            idAluno: parseInt(usuarioLogado.id), 
            idMateria: parseInt(idMateria),
            situacao: 'CURSANDO', 
            nota1: 0,
            nota2: 0,
            mediaFinal: 0
        };
        
        await fetchAPI('/matriculas', 'POST', payload);
        
        mostrarToast("Inscrição realizada com sucesso!", "success");

        await alunoCarregarCatalogo();
        
    } catch (e) { 
        console.error("Erro na Matrícula:", e);
        mostrarToast("Não foi possível realizar a matrícula. Tente novamente.", "danger"); 
    } finally {
        instLoading(false);
    }
}

// Mantido para compatibilidade caso seja chamado de outras telas (ex: Meu Curso)
async function alunoCancelarMateria(idMatricula, nome) {
    const msg = `ATENÇÃO: Deseja cancelar a disciplina "${nome}"?\n\n` +
                `• O status será alterado para CANCELADO.\n` +
                `• Você perderá as notas lançadas neste semestre.`;
    
    if (!confirm(msg)) return;

    try {
        instLoading(true);
        // Atualiza para o status CANCELADO no backend
        await fetchAPI(`/matriculas/${idMatricula}`, 'PUT', {
            situacao: 'CANCELADO'
        });

        mostrarToast(`Matrícula em ${nome} cancelada.`, "info");
        
        // Atualiza as visualizações se estiverem disponíveis
        if (typeof alunoRenderCurso === 'function') await alunoRenderCurso();
        // Se estiver na tela de catálogo, recarrega para que a matéria volte a ficar disponível
        if (document.getElementById('matriculaTableBody')) await alunoCarregarCatalogo();
        
    } catch (e) {
        console.error(e);
        mostrarToast("Erro ao cancelar disciplina.", "danger");
    } finally {
        instLoading(false);
    }
}