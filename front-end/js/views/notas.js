// --- MINHAS DISCIPLINAS (NOTAS) ---

let minhasDisciplinasGlobal = [];

async function alunoRenderDisciplinas() {
    const appContent = document.getElementById('appContent');
    if (!appContent) return;

    atualizarMenuAtivo('Minhas Disciplinas');
    
    appContent.innerHTML = `
        <div class="fade-in">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h4 class="fw-bold mb-1">Minhas Notas</h4>
                    <p class="text-muted small mb-0">Acompanhe seu desempenho acadêmico e faltas.</p>
                </div>
                <div class="input-group" style="width: 100%; max-width: 300px;">
                    <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
                    <input type="text" id="buscaNotasInput" class="form-control border-start-0 ps-0" 
                           placeholder="Filtrar disciplina..." oninput="alunoFiltrarDisciplinasLocal()">
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-3 overflow-hidden">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light text-uppercase small fw-bold text-muted">
                            <tr>
                                <th class="ps-4 py-3">Disciplina / Curso</th>
                                <th class="py-3 text-center">Situação</th>
                                <th class="py-3 text-center">Média Atual</th>
                                <th class="text-end pe-4 py-3">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody id="disciplinasTableBody">
                            <tr><td colspan="4" class="text-center py-5 text-muted"><i class="fas fa-circle-notch fa-spin me-2"></i>Carregando notas...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="mt-3 text-end">
                <small class="text-muted"><i class="fas fa-info-circle me-1"></i> A média para aprovação é 7.0</small>
            </div>
        </div>`;

    await alunoCarregarDisciplinas();
}

async function alunoCarregarDisciplinas() {
    const container = document.getElementById('disciplinasTableBody');
    const user = getUser();

    try {
        const todasMatriculas = await fetchAPI('/matriculas');
        
        // Filtra apenas as do aluno e remove canceladas
        minhasDisciplinasGlobal = (todasMatriculas || []).filter(m => {
            const idAlu = m.idAluno || (m.aluno ? m.aluno.id : null);
            const isMeuId = parseInt(idAlu) === parseInt(user.id);
            const situacao = (m.situacao || "").toUpperCase();
            return isMeuId && !['HISTORICO', 'CANCELADO'].includes(situacao);
        });

        alunoFiltrarDisciplinasLocal();

    } catch (e) { 
        console.error(e);
        if (container) container.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Erro ao carregar notas.</td></tr>'; 
    }
}

function alunoFiltrarDisciplinasLocal() {
    const container = document.getElementById('disciplinasTableBody');
    if(!container) return;

    const termo = document.getElementById('buscaNotasInput')?.value.toLowerCase() || "";
    
    const filtradas = minhasDisciplinasGlobal.filter(m => 
        (m.nomeMateria && m.nomeMateria.toLowerCase().includes(termo)) ||
        (m.nomeCurso && m.nomeCurso.toLowerCase().includes(termo))
    );

    if(filtradas.length === 0) {
        container.innerHTML = '<tr><td colspan="4" class="text-center py-5 text-muted">Nenhuma disciplina encontrada.</td></tr>';
        return;
    }

    container.innerHTML = filtradas.map(m => {
        const media = parseFloat(m.mediaFinal || 0);
        const idMateria = m.idMateria || (m.materia ? m.materia.id : 0);

        // REATORAÇÃO: Usa função do utils.js para pegar o HTML da badge
        // Ex: obterBadgeSituacao('APROVADO') -> retorna o HTML completo do span
        const badgeSituacao = (typeof obterBadgeSituacao === 'function') 
            ? obterBadgeSituacao(m.situacao) 
            : `<span class="badge bg-secondary">${m.situacao}</span>`; 

        const corNota = (m.situacao === 'RECUPERACAO') ? 'text-warning' : (media >= 7 ? 'text-success' : (media > 0 ? 'text-danger' : 'text-muted'));

        return `
        <tr>
            <td class="ps-4">
                <div class="d-flex flex-column">
                    <span class="fw-bold text-dark">${m.nomeMateria}</span>
                    <span class="small text-muted text-uppercase" style="font-size: 0.75rem;">${m.nomeCurso || 'Curso Geral'}</span>
                </div>
            </td>
            <td class="text-center">
                ${badgeSituacao}
            </td>
            <td class="text-center">
                <span class="fw-bold fs-5 ${corNota}">${media.toFixed(1)}</span>
            </td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-primary rounded-pill px-3 transition-hover" 
                        onclick="alunoVerDetalhesNotas(${idMateria}, '${m.nomeMateria.replace(/'/g, "\\'")}')">
                    <i class="fas fa-search me-1"></i> Detalhes
                </button>
            </td>
        </tr>`;
    }).join('');
}

async function alunoVerDetalhesNotas(idMateria, nomeMateria) {
    if (typeof instLoading === 'function') instLoading(true);

    const modalAntigo = document.getElementById('modalDetalhesNotas');
    if (modalAntigo) modalAntigo.remove();
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

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

        let somaPonderada = 0.0;
        let somaPesos = 0.0;
        let notaRecuperacao = null;
        let existeConfigRecuperacao = false;
        let todasNotasRegularesLancadas = true;

        // Ordenar avaliações (Regulares primeiro, REC depois)
        // REATORAÇÃO: Usa utilsIsRecuperacao do utils.js
        const avOrdenadas = [...avaliacoes].sort((a, b) => {
            const isARec = utilsIsRecuperacao(a.descricaoNota || a.nome);
            const isBRec = utilsIsRecuperacao(b.descricaoNota || b.nome);
            return isARec - isBRec;
        });

        avOrdenadas.forEach(av => {
            const isRec = utilsIsRecuperacao(av.descricaoNota || av.nome);
            const valorNota = mapaNotas[av.id];

            if (isRec) {
                existeConfigRecuperacao = true;
                if (valorNota !== undefined && valorNota !== null) {
                    notaRecuperacao = parseFloat(valorNota);
                }
            } else {
                // É nota regular
                if (valorNota !== undefined && valorNota !== null) {
                    let peso = parseFloat(av.peso);
                    if (isNaN(peso) || peso <= 0) peso = 1;
                    somaPonderada += parseFloat(valorNota) * peso;
                    somaPesos += peso;
                } else {
                    todasNotasRegularesLancadas = false;
                }
            }
        });

        let mediaAtual = (somaPesos > 0) ? (somaPonderada / somaPesos) : 0.0;
        mediaAtual = Math.round(mediaAtual * 10) / 10;

        // Cálculo da média final considerando REC (caso precise exibir no footer)
        let mediaFinalCalculada = mediaAtual;
        let usouRecuperacao = false;

        if (mediaAtual < 7.0 && notaRecuperacao !== null && notaRecuperacao > mediaAtual) {
            mediaFinalCalculada = (mediaAtual + notaRecuperacao) / 2;
            mediaFinalCalculada = Math.round(mediaFinalCalculada * 10) / 10;
            usouRecuperacao = true;
        }

        // --- LÓGICA MOVIDA PARA UTILS ---
        // A lógica de qual alerta exibir (Aprovado, Reprovado, Em Recuperação) 
        // agora é delegada para gerarFeedbackStatusAluno no utils.js
        let statusHtml = '';
        if (typeof gerarFeedbackStatusAluno === 'function') {
            statusHtml = gerarFeedbackStatusAluno(mediaAtual, notaRecuperacao, existeConfigRecuperacao, todasNotasRegularesLancadas, mediaFinalCalculada);
        } else {
            statusHtml = '<div class="alert alert-secondary m-0 rounded-0">Status indisponível (Função utils ausente)</div>';
        }

        const modalHtml = `
            <div class="modal fade" id="modalDetalhesNotas" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-0 shadow-lg overflow-hidden">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title fw-bold"><i class="fas fa-graduation-cap me-2"></i>${nomeMateria}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        
                        ${statusHtml}

                        <div class="modal-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead class="bg-light text-muted small text-uppercase">
                                        <tr>
                                            <th class="ps-4 py-2">Avaliação</th>
                                            <th class="text-center py-2">Peso</th>
                                            <th class="text-center pe-4 py-2">Nota</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${avOrdenadas.map(av => {
                                            const nomeOriginal = av.descricaoNota || av.nome || "";
                                            const isRec = utilsIsRecuperacao(nomeOriginal);
                                            const nota = mapaNotas[av.id];
                                            const notaFormatada = (nota !== undefined && nota !== null) ? Number(nota).toFixed(1) : '-';
                                            
                                            // REATORAÇÃO: Usa getNotaColor do utils.js
                                            const classeCor = (typeof getNotaColor === 'function') ? getNotaColor(nota) : '';

                                            return `
                                            <tr class="${isRec ? 'table-warning-subtle' : ''}">
                                                <td class="ps-4 align-middle">
                                                    <span class="${isRec ? 'fw-bold text-dark' : 'text-secondary'}">
                                                        ${isRec ? '<i class="fas fa-redo me-2 text-warning"></i>' : ''}
                                                        ${nomeOriginal}
                                                    </span>
                                                </td>
                                                <td class="text-center align-middle text-muted small">
                                                    ${isRec ? '<span class="badge bg-warning text-dark">Subst.</span>' : av.peso}
                                                </td>
                                                <td class="text-center align-middle fw-bold ${classeCor} pe-4">
                                                    ${notaFormatada}
                                                </td>
                                            </tr>`;
                                        }).join('')}
                                    </tbody>
                                    <tfoot>
                                        <tr class="table-light border-top border-2">
                                            <td colspan="2" class="ps-4 fw-bold text-uppercase text-dark align-middle">
                                                Média Final Calculada
                                                ${usouRecuperacao ? '<span class="badge bg-info text-dark ms-2" style="font-size:0.6rem">PÓS-REC</span>' : ''}
                                            </td>
                                            <td class="text-center fw-bold pe-4 py-3" style="font-size: 1.3rem;">
                                                <span class="${(typeof getNotaColor === 'function') ? getNotaColor(mediaFinalCalculada) : ''}">${mediaFinalCalculada.toFixed(1)}</span>
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        const modalElement = document.getElementById('modalDetalhesNotas');
        const modalInstance = new bootstrap.Modal(modalElement);

        modalElement.addEventListener('hidden.bs.modal', function () {
            this.remove();
        });

        modalInstance.show();

    } catch (e) {
        console.error(e);
        mostrarToast("Erro ao carregar detalhes.", "danger");
    } finally {
        if (typeof instLoading === 'function') instLoading(false);
    }
}