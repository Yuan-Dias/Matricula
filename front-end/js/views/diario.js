async function profVerAlunos(idMateria, nomeMateria) {
    profGarantirModalNota();

    const appContent = document.getElementById('appContent');
    appContent.innerHTML = `
        <div class="text-center py-5 fade-in">
            <div class="spinner-border text-primary"></div>
            <div class="mt-2 text-muted">Carregando diário...</div>
        </div>`;

    try {
        const [materia, avaliacoes, matriculas] = await Promise.all([
            fetchAPI(`/materias/${idMateria}`),
            fetchAPI(`/materias/${idMateria}/avaliacoes`), 
            fetchAPI('/matriculas') 
        ]);
        
        const isFinalizada = materia.status === 'FINALIZADA' || materia.encerrada;
        const alunosDaTurma = matriculas.filter(mat => mat.idMateria == idMateria);
        
        alunosDaTurma.sort((a, b) => a.nomeAluno.localeCompare(b.nomeAluno));

        const configs = avaliacoes || []; 
        
        const btnFinalizarHtml = isFinalizada 
            ? `<span class="badge bg-success border fs-6 px-3 py-2"><i class="fas fa-check me-2"></i>Matéria Finalizada</span>` 
            : `<button class="btn btn-success text-white shadow-sm" onclick="profFinalizarMateria(${idMateria}, '${nomeMateria}')">
                 <i class="fas fa-check-circle me-2"></i>Encerrar Semestre
               </button>`;

        let tableHeader = `
            <tr class="small text-muted bg-light border-bottom">
                <th class="ps-3 text-uppercase align-middle py-3">Aluno</th>
                ${configs.map(av => {
                    const isRec = utilsIsRecuperacao(av.descricaoNota || av.nome);
                    
                    return `
                    <th class="text-center align-middle" style="min-width: 110px;">
                        <div class="fw-bold ${isRec ? 'text-danger small' : 'text-dark'}">${av.descricaoNota || av.nome}</div>
                        ${isRec ? '' : `<span class="badge bg-white text-secondary border fw-normal mt-1" style="font-size: 0.7rem">Peso ${av.peso}</span>`}
                    </th>`;
                }).join('')}
                <th class="text-center bg-light border-start border-end text-primary align-middle fw-bold">Média</th>
                <th class="text-center align-middle">Situação</th>
            </tr>`;

        let tableBody = alunosDaTurma.length === 0 
            ? '<tr><td colspan="100%" class="text-center py-5 text-muted">Nenhum aluno matriculado.</td></tr>'
            : alunosDaTurma.map(a => {
                const mapaNotas = {};
                if (Array.isArray(a.notas)) {
                    a.notas.forEach(n => { mapaNotas[n.idConfiguracao] = n; });
                }
                
                // CALCULO DE MÉDIA VIA UTILS
                const media = utilsCalcularMedia(a.notas, configs);

                // LÓGICA DE PREENCHIMENTO (Para determinar status)
                const configsRegulares = configs.filter(c => !utilsIsRecuperacao(c.descricaoNota || c.nome));
                const configsRecuperacao = configs.filter(c => utilsIsRecuperacao(c.descricaoNota || c.nome));

                const qtdLancadasRegulares = configsRegulares.filter(c => {
                    const n = mapaNotas[c.id];
                    return n && n.valor !== null && n.valor !== undefined && n.valor !== "";
                }).length;

                const todasRegularesLancadas = configsRegulares.length > 0 && configsRegulares.length === qtdLancadasRegulares;
                
                const temNotaRecuperacao = configsRecuperacao.some(c => {
                    const n = mapaNotas[c.id];
                    return n && n.valor !== null && n.valor !== undefined && n.valor !== "";
                });

                // CALCULO DE STATUS VIA UTILS
                const status = utilsObterStatusAcademico(media, isFinalizada, todasRegularesLancadas, temNotaRecuperacao);
                const statusBadge = `<span class="badge ${status.classBadge}" style="font-size: 0.7rem">${status.texto}</span>`;

                return `
                    <tr class="fade-in align-middle border-bottom" style="font-size: 0.9rem;">
                        <td class="ps-3 fw-bold text-dark text-truncate py-3" style="max-width: 250px;">
                            <div class="d-flex align-items-center">
                                <div class="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold" style="width:32px; height:32px; font-size: 0.8rem">
                                    ${a.nomeAluno.charAt(0)}
                                </div>
                                ${a.nomeAluno}
                            </div>
                        </td>
                        ${configs.map(av => {
                            const notaObj = mapaNotas[av.id];
                            const valor = (notaObj && notaObj.valor !== undefined && notaObj.valor !== null) ? Number(notaObj.valor) : null;
                            
                            let displayValor = '-';
                            let corTexto = 'text-muted opacity-25';
                            
                            if (valor !== null) {
                                displayValor = valor.toFixed(1);
                                corTexto = valor < 6.0 ? 'text-danger fw-bold' : 'text-dark fw-bold';
                            }

                            const btnEdit = isFinalizada ? '' : `
                                <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center opacity-0 hover-show" 
                                     style="cursor: pointer; background-color: rgba(0,0,0,0.05);"
                                     onclick="profAbrirModalNota(${a.id}, ${av.id}, '${a.nomeAluno.replace(/'/g, "\\'")}', '${av.descricaoNota}', '${valor !== null ? valor : ''}', ${idMateria}, '${nomeMateria}')">
                                    <i class="fas fa-pen text-primary"></i>
                                </div>`;

                            return `
                                <td class="text-center position-relative p-0 hover-trigger" style="height: 50px;">
                                    <span class="${corTexto} fs-6">${displayValor}</span>
                                    ${btnEdit}
                                </td>`;
                        }).join('')}
                        <td class="text-center bg-light border-start border-end fw-bold text-primary fs-6">${media.toFixed(1)}</td>
                        <td class="text-center">${statusBadge}</td>
                    </tr>`;
            }).join('');

        appContent.innerHTML = `
            <style>
                .hover-trigger:hover .hover-show { opacity: 1 !important; }
            </style>
            <div class="d-flex justify-content-between align-items-center mb-4 bg-white p-4 rounded-4 shadow-sm border-start border-primary border-4 fade-in">
                <div>
                    <h4 class="fw-bold mb-1 text-dark">${nomeMateria}</h4>
                    <div class="text-muted small">
                        <i class="fas fa-users me-1"></i> Diário de Classe • 
                        <strong>${alunosDaTurma.length}</strong> Alunos
                    </div>
                </div>
                <div class="d-flex gap-2 align-items-center">
                     ${btnFinalizarHtml}

                     <button class="btn btn-outline-primary" onclick="profConfigurarAvaliacoes(${idMateria}, '${nomeMateria}')" ${isFinalizada ? 'disabled' : ''}>
                        <i class="fas fa-cog me-2"></i>Critérios
                    </button>
                    
                    <button class="btn btn-outline-secondary px-4" onclick="profRenderTurmas()">
                        <i class="fas fa-arrow-left me-2"></i> Voltar
                    </button>
                </div>
            </div>
            
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in">
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead>${tableHeader}</thead>
                        <tbody>${tableBody}</tbody>
                    </table>
                </div>
            </div>`;
    } catch (error) {
        console.error(error);
        mostrarToast("Erro ao carregar notas: " + error.message, "danger");
    }
}

function profGarantirModalNota() {
    if (document.getElementById('modalNotaProf')) return;

    const modalHTML = `
    <div class="modal fade" id="modalNotaProf" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header bg-primary text-white py-2">
                    <h6 class="modal-title fw-bold"><i class="fas fa-pen-square me-2"></i>Lançar Nota</h6>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body pt-3">
                    <form id="formNotaProf" onsubmit="event.preventDefault(); profSalvarNota()">
                        <input type="hidden" id="profNotaIdMatricula">
                        <input type="hidden" id="profNotaIdConfig">
                        <input type="hidden" id="profNotaIdMateria">
                        <input type="hidden" id="profNotaNomeMateria">
                        
                        <div class="text-center mb-3">
                            <h6 class="fw-bold text-dark mb-0" id="profNotaNomeAluno">Aluno</h6>
                            <small class="text-muted" id="profNotaNomeAvaliacao">Avaliação</small>
                        </div>

                        <div class="form-floating mb-3">
                            <input type="number" step="0.1" min="0" max="10" 
                                   class="form-control text-center fw-bold fs-3 text-primary border-primary" 
                                   id="profNotaValorInput" placeholder="Vazio apaga">
                            <label for="profNotaValorInput" class="w-100 text-center">Nota (Deixe vazio para apagar)</label>
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary shadow-sm">
                                Confirmar Lançamento
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function profAbrirModalNota(idMatricula, idConfig, nomeAluno, nomeAvaliacao, valorAtual, idMateria, nomeMateria) {
    profGarantirModalNota();
    
    // Preenche os hidden fields
    document.getElementById('profNotaIdMatricula').value = idMatricula;
    document.getElementById('profNotaIdConfig').value = idConfig;
    document.getElementById('profNotaIdMateria').value = idMateria;
    document.getElementById('profNotaNomeMateria').value = nomeMateria;
    
    // Preenche textos visuais
    document.getElementById('profNotaNomeAluno').textContent = nomeAluno;
    document.getElementById('profNotaNomeAvaliacao').textContent = nomeAvaliacao;
    
    // Configura o input de valor
    const inputValor = document.getElementById('profNotaValorInput');
    inputValor.value = valorAtual;
    inputValor.classList.remove('is-invalid');

    // Abre o modal
    const modal = new bootstrap.Modal(document.getElementById('modalNotaProf'));
    modal.show();
    
    // Foca no campo automaticamente após abrir
    setTimeout(() => inputValor.focus(), 500);
}

async function profSalvarNota() {
    const idMatricula = document.getElementById('profNotaIdMatricula').value;
    const idConfiguracao = document.getElementById('profNotaIdConfig').value;
    const idMateria = document.getElementById('profNotaIdMateria').value;
    const nomeMateria = document.getElementById('profNotaNomeMateria').value;
    
    const inputValor = document.getElementById('profNotaValorInput');
    const valorTexto = inputValor.value.trim();
    
    let valorParaEnviar = null; // Padrão é null (nota apagada)

    // Se tiver texto, tentamos converter para número
    if (valorTexto !== "") {
        valorParaEnviar = parseFloat(valorTexto);
        if (isNaN(valorParaEnviar) || valorParaEnviar < 0 || valorParaEnviar > 10) {
            inputValor.classList.add('is-invalid');
            mostrarToast("A nota deve ser um número entre 0 e 10.", "warning");
            return;
        }
    }

    const btnSubmit = document.querySelector('#formNotaProf button[type="submit"]');
    const txtOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';

    try {
        const payload = {
            idMatricula: parseInt(idMatricula),
            idConfiguracao: parseInt(idConfiguracao),
            nota: valorParaEnviar // Envia o número ou null
        };

        await fetchAPI('/matriculas/notas', 'PUT', payload);
        
        const modalEl = document.getElementById('modalNotaProf');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
        
        mostrarToast(valorParaEnviar === null ? "Nota removida com sucesso!" : "Nota salva com sucesso!", "success");
        
        profVerAlunos(idMateria, nomeMateria);

    } catch (e) {
        console.error(e);
        mostrarToast("Erro ao salvar nota: " + (e.message || "Erro desconhecido"), "danger");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = txtOriginal;
    }
}

async function profLancarNota(idMatricula, nomeAluno, dadosNotasJson, configMateriaJson, idMateria, nomeMateria) {
    const dadosNotas = typeof dadosNotasJson === 'string' ? JSON.parse(dadosNotasJson || '{}') : (dadosNotasJson || {});
    const configMateria = typeof configMateriaJson === 'string' ? JSON.parse(configMateriaJson || '[]') : (configMateriaJson || []);
    const modoComplexo = configMateria.length > 0;

    const regulares = configMateria.filter(av => !isRec(av.descricaoNota || av.nome));
    const recuperacoes = configMateria.filter(av => isRec(av.descricaoNota || av.nome));

    function isRec(nome) {
        if (!nome) return false;
        const n = nome.toUpperCase();
        return n.includes("RECUPERA") || n.includes("PROVA FINAL") || n.includes("EXAME");
    }

    const renderCard = (av, ehRec = false) => {
        const notaObj = dadosNotas[av.id];
        const notaAtual = (notaObj && notaObj.valor !== undefined && notaObj.valor !== null) ? notaObj.valor : '';
        
        return `
            <div class="col-md-6 mb-3">
                <div class="card h-100 ${ehRec ? 'border-warning bg-warning-subtle' : 'border-light bg-light shadow-sm'} transition-hover">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <label class="form-label fw-bold small text-uppercase ${ehRec ? 'text-warning-emphasis' : 'text-dark'} mb-0">
                                ${av.descricaoNota || av.nome}
                            </label>
                            ${!ehRec 
                                ? `<span class="badge bg-primary text-white" style="font-size: 0.7em;">PESO ${av.peso}</span>` 
                                : `<span class="badge bg-warning text-dark border border-warning" style="font-size: 0.7em;">RECUPERAÇÃO</span>`
                            }
                        </div>
                        <div class="input-group">
                            <input type="number" class="form-control fw-bold fs-5 text-center nota-input" 
                                data-id-config="${av.id}" 
                                value="${notaAtual}" 
                                min="0" max="10" step="0.1" 
                                placeholder="-"
                                onfocus="this.select()"> <span class="input-group-text text-muted small bg-white">/ 10</span>
                        </div>
                    </div>
                </div>
            </div>`;
    };

    let bodyInputs = '';

    if (modoComplexo) {
        if (regulares.length > 0) {
            bodyInputs += `
                <div class="mb-2"><small class="text-uppercase fw-bold text-muted ms-1">Notas Regulares</small></div>
                <div class="row mb-4">
                    ${regulares.map(av => renderCard(av, false)).join('')}
                </div>`;
        }

        if (recuperacoes.length > 0) {
            bodyInputs += `
                <div class="alert alert-warning border-0 bg-warning-subtle rounded-4 p-3">
                    <div class="d-flex align-items-center mb-3">
                        <i class="fas fa-sync-alt text-warning-emphasis me-2"></i>
                        <small class="text-uppercase fw-bold text-warning-emphasis">Área de Recuperação</small>
                    </div>
                    <div class="row">
                        ${recuperacoes.map(av => renderCard(av, true)).join('')}
                    </div>
                    <div class="mt-2 text-warning-emphasis small lh-sm">
                        <i class="fas fa-info-circle me-1"></i>
                        Nota: O lançamento nesta área poderá substituir a média regular conforme as regras da instituição.
                    </div>
                </div>`;
        }
    } else {
        const valorUnico = (!isNaN(dadosNotas) && dadosNotas !== null) ? dadosNotas : '';
        bodyInputs = `
            <div class="mb-3">
                <label class="form-label fw-bold">Nota Única</label>
                <input type="number" id="inputNotaUnica" class="form-control form-control-lg text-center fw-bold text-primary" 
                       value="${valorUnico}" min="0" max="10" step="0.1" onfocus="this.select()">
            </div>`;
    }

    const modalHTML = `
    <div class="modal fade" id="modalLancarNota" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content shadow-lg border-0 rounded-4">
                <div class="modal-header bg-primary text-white">
                    <div>
                        <h5 class="modal-title fw-bold"><i class="fas fa-user-graduate me-2"></i>Lançar Notas</h5>
                        <p class="m-0 small opacity-75">${nomeAluno}</p>
                    </div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4 bg-white scroll-y" style="max-height: 70vh; overflow-y: auto;">
                    <form id="formNotas">${bodyInputs}</form>
                </div>
                <div class="modal-footer bg-light border-top-0 rounded-bottom-4">
                    <button type="button" class="btn btn-outline-secondary border-0" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary fw-bold px-4 rounded-pill shadow-sm" id="btnPreSalvar">
                        <i class="fas fa-save me-2"></i>Salvar Notas
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    document.getElementById('modalLancarNota')?.remove();
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modalEl = document.getElementById('modalLancarNota');
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    document.getElementById('btnPreSalvar').onclick = () => {
        const confirmModalHTML = `
            <div class="modal fade" id="modalConfirmacao" tabindex="-1" style="z-index: 1060;">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content shadow border-0">
                        <div class="modal-body text-center p-4">
                            <div class="mb-3 text-warning">
                                <i class="fas fa-exclamation-circle fa-3x"></i>
                            </div>
                            <h5 class="fw-bold mb-2">Salvar alterações?</h5>
                            <p class="text-muted small mb-4">Notas de <strong>${nomeAluno}</strong> serão atualizadas.</p>
                            
                            <div class="d-grid gap-2">
                                <button type="button" class="btn btn-primary fw-bold" id="btnConfirmarFinal">
                                    Sim, Salvar
                                </button>
                                <button type="button" class="btn btn-light text-muted" data-bs-dismiss="modal">
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        document.getElementById('modalConfirmacao')?.remove();
        document.body.insertAdjacentHTML('beforeend', confirmModalHTML);
        
        const confirmModalEl = document.getElementById('modalConfirmacao');
        const bsConfirmModal = new bootstrap.Modal(confirmModalEl);
        bsConfirmModal.show();

        document.getElementById('btnConfirmarFinal').onclick = async () => {
            try {
                bsConfirmModal.hide(); 
                if (typeof instLoading === 'function') instLoading(true);

                if (modoComplexo) {
                    const inputs = modalEl.querySelectorAll('.nota-input');
                    const promessas = [];
                    
                    for (const input of inputs) {
                        const notaValorStr = input.value.trim();
                        const valorFinal = notaValorStr === '' ? null : parseFloat(notaValorStr);

                        promessas.push(fetchAPI('/matriculas/notas', 'PUT', {
                            idMatricula: parseInt(idMatricula),
                            idConfiguracao: parseInt(input.getAttribute('data-id-config')),
                            nota: valorFinal
                        }));
                    }
                    await Promise.all(promessas);
                } else {
                    const valUnicaStr = document.getElementById('inputNotaUnica').value.trim();
                    // Mesma lógica para nota única: vazio vira null
                    const valorFinalUnico = valUnicaStr === '' ? null : parseFloat(valUnicaStr);

                    await fetchAPI('/matriculas/notas', 'PUT', {
                        idMatricula: parseInt(idMatricula),
                        idConfiguracao: null, 
                        nota: valorFinalUnico
                    });
                }

                mostrarToast("Notas atualizadas com sucesso!", "success");
                bsModal.hide(); 
                setTimeout(() => profVerAlunos(idMateria, nomeMateria), 500);

            } catch (e) {
                console.error(e);
                mostrarToast("Erro ao salvar notas.", "danger");
            } finally {
                if (typeof instLoading === 'function') instLoading(false);
            }
        };
        
        confirmModalEl.addEventListener('hidden.bs.modal', () => confirmModalEl.remove());
    };
    
    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
}

function profGarantirModalConfirmacao() {
    if (!document.getElementById('modalConfirmarFinalizacao')) {
        const modalHtml = `
        <div class="modal fade" id="modalConfirmarFinalizacao" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header bg-danger-subtle text-danger border-bottom-0">
                        <h5 class="modal-title fw-bold">
                            <i class="fas fa-exclamation-triangle me-2"></i>Encerrar Semestre
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        <p class="fs-6 text-muted mb-3" id="modalConfirmBodyTexto">
                            Tem certeza que deseja finalizar?
                        </p>
                        
                        <div id="modalAlertPendencias" class="alert alert-warning d-flex align-items-start d-none" role="alert">
                            <i class="fas fa-info-circle me-2 mt-1"></i>
                            <div id="modalAlertPendenciasTexto" class="small"></div>
                        </div>

                        <div class="alert alert-light border border-danger-subtle text-danger small mb-0">
                            <strong>Atenção:</strong> Esta ação consolidará as médias finais, alterará o status da turma para "FINALIZADA" e não poderá ser desfeita facilmente.
                        </div>
                    </div>
                    <div class="modal-footer border-top-0 pt-0 pe-4 pb-4">
                        <button type="button" class="btn btn-light border px-4" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" id="btnConfirmarAcaoFinalizar" class="btn btn-danger px-4 shadow-sm">
                            <i class="fas fa-check-circle me-2"></i>Confirmar Encerramento
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

async function profFinalizarMateria(idMateria, nomeMateria) {
    profGarantirModalConfirmacao(); 

    if (typeof instLoading === 'function') instLoading(true);

    try {
        const [avaliacoes, matriculas] = await Promise.all([
            fetchAPI(`/materias/${idMateria}/avaliacoes`),
            fetchAPI('/matriculas') // Atenção: Isso traz as matrículas de TODAS as matérias do prof
        ]);

        const alunosNoSemestre = matriculas.filter(mat => mat.idMateria == idMateria);

        if (alunosNoSemestre.length === 0) {
            if (typeof instLoading === 'function') instLoading(false);
            return mostrarToast("Não há alunos ativos nesta matéria para encerrar.", "warning");
        }

        const qtdAvaliacoes = avaliacoes.length;
        
        const pendentes = alunosNoSemestre.filter(a => {
            const qtdNotasLancadas = Array.isArray(a.notas) 
                ? a.notas.filter(n => n.valor !== null && n.valor !== undefined).length 
                : 0;
            
            return qtdAvaliacoes > 0 && qtdNotasLancadas < qtdAvaliacoes;
        });

        document.getElementById('modalConfirmBodyTexto').innerHTML = 
            `Você está prestes a encerrar a matéria <strong>${nomeMateria}</strong>.<br>` +
            `<small class="text-muted">Isso calculará as médias finais e moverá os alunos para o histórico.</small>`;

        const alertDiv = document.getElementById('modalAlertPendencias');
        const alertText = document.getElementById('modalAlertPendenciasTexto');
        
        if (pendentes.length > 0) {
            alertText.innerHTML = `Atenção: <strong>${pendentes.length} aluno(s)</strong> possuem menos notas lançadas do que o total de avaliações (${qtdAvaliacoes}). <br>As notas faltantes serão consideradas <strong>0.0</strong> no cálculo.`;
            alertDiv.classList.remove('d-none');
        } else {
            alertDiv.classList.add('d-none');
        }

        const btnConfirmar = document.getElementById('btnConfirmarAcaoFinalizar');
        const novoBtn = btnConfirmar.cloneNode(true);
        btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);

        novoBtn.addEventListener('click', async () => {
            const modalEl = document.getElementById('modalConfirmarFinalizacao');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            modalInstance.hide();

            try {
                if (typeof instLoading === 'function') instLoading(true);
                
                await fetchAPI(`/matriculas/encerrar/${idMateria}`, 'PUT');
                
                mostrarToast("Semestre encerrado e médias calculadas com sucesso!", "success");
                
                setTimeout(() => profRenderTurmas(), 1500);
            } catch (error) {
                console.error(error);
                mostrarToast(error.message || "Erro ao finalizar matéria.", "danger");
                if (typeof instLoading === 'function') instLoading(false);
            }
        });

        const myModal = new bootstrap.Modal(document.getElementById('modalConfirmarFinalizacao'));
        myModal.show();

    } catch (e) {
        console.error(e);
        mostrarToast(e.message || "Erro ao preparar finalização.", "danger");
    } finally {
        if (typeof instLoading === 'function') instLoading(false);
    }
}

async function profConfigurarAvaliacoes(idMateria, nomeMateria) {
    let configsAtuais = [];
    let configsOriginais = []; // Para saber o que realmente foi deletado do banco

    try {
        if (typeof instLoading === 'function') instLoading(true);

        const dados = await fetchAPI(`/materias/${idMateria}/avaliacoes`);
        configsAtuais = dados || [];
        configsOriginais = JSON.parse(JSON.stringify(configsAtuais));

        const renderListaConfig = () => {
            const container = document.getElementById('listaConfigAvaliacoes');
            if (!container) return;

            if (configsAtuais.length === 0) {
                container.innerHTML = '<div class="text-center text-muted p-3">Nenhuma avaliação cadastrada.</div>';
                return;
            }

            container.innerHTML = configsAtuais.map((c, index) => {
                const nome = c.descricaoNota || c.nome || "";
                
                const ehRec = nome.toUpperCase().includes("RECUPERA") || 
                              nome.toUpperCase().includes("EXAME") || 
                              nome.toUpperCase().includes("PROVA FINAL");
                
                const jaSalva = c.id ? true : false;
                
                let botaoAcaoHtml = '';
                
                if (ehRec) {
                    botaoAcaoHtml = `
                        <button type="button" class="btn btn-sm btn-light text-muted border-0" 
                            title="A recuperação é obrigatória e não pode ser removida" disabled>
                            <i class="fas fa-lock"></i>
                        </button>`;
                } else {
                    botaoAcaoHtml = `
                        <button type="button" class="btn btn-sm btn-outline-danger border-0" 
                            title="Remover item"
                            onclick="removerConfigTemp(${index})">
                            <i class="fas fa-trash"></i>
                        </button>`;
                }

                return `
                <div class="d-flex align-items-center justify-content-between p-2 mb-2 border rounded bg-white shadow-sm">
                    <div class="d-flex align-items-center gap-2">
                        <div class="fw-bold text-uppercase ${ehRec ? 'text-warning-emphasis' : 'text-dark'}">
                            ${nome}
                        </div>
                        ${ehRec 
                            ? '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle" style="font-size: 0.65rem">REC</span>' 
                            : `<span class="badge bg-light text-secondary border" style="font-size: 0.65rem">PESO ${c.peso}</span>`
                        }
                        ${jaSalva ? '<i class="fas fa-database text-success small ms-1" title="Salvo no banco"></i>' : '<i class="fas fa-asterisk text-muted small ms-1" title="Novo item"></i>'}
                    </div>
                    ${botaoAcaoHtml}
                </div>`;
            }).join('');
        };

        const modalHTML = `
        <div class="modal fade" id="modalConfigAvaliacoes" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-lg rounded-4">
                    <div class="modal-header bg-white border-bottom-0 pb-0">
                        <div>
                            <h5 class="modal-title fw-bold text-primary">Critérios de Avaliação</h5>
                            <p class="small text-muted mb-0">${nomeMateria}</p>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="bg-light p-3 rounded-3 mb-3 border">
                            <h6 class="small fw-bold text-uppercase text-muted mb-2">Adicionar Nova</h6>
                            <div class="row g-2">
                                <div class="col-7">
                                    <input type="text" id="novoNomeConfig" class="form-control form-control-sm" placeholder="Ex: Prova 1, Trabalho...">
                                </div>
                                <div class="col-3">
                                    <input type="number" id="novoPesoConfig" class="form-control form-control-sm text-center" placeholder="Peso" value="1" min="0">
                                </div>
                                <div class="col-2">
                                    <button class="btn btn-sm btn-primary w-100" id="btnAddConfig">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <h6 class="small fw-bold text-uppercase text-muted mb-2 ps-1">Itens Atuais</h6>
                        <div id="listaConfigAvaliacoes" class="bg-light rounded-3 p-2" style="max-height: 200px; overflow-y: auto;"></div>
                    </div>
                    <div class="modal-footer border-top-0">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary fw-bold px-4 rounded-pill" id="btnSalvarConfigs">
                            <i class="fas fa-save me-2"></i>Salvar Critérios
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

        document.getElementById('modalConfigAvaliacoes')?.remove();
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        const modalEl = document.getElementById('modalConfigAvaliacoes');
        const bsModal = new bootstrap.Modal(modalEl);
        
        window.removerConfigTemp = (index) => {
            const item = configsAtuais[index];
            const nome = (item.descricaoNota || item.nome || "").toUpperCase();
            
            if (nome.includes("RECUPERA") || nome.includes("EXAME") || nome.includes("PROVA FINAL")) {
                return mostrarToast("Não é possível remover a Recuperação/Exame.", "warning");
            }
            configsAtuais.splice(index, 1);
            renderListaConfig();
        };

        bsModal.show();
        renderListaConfig();

        document.getElementById('btnAddConfig').onclick = () => {
            const nomeInput = document.getElementById('novoNomeConfig');
            const pesoInput = document.getElementById('novoPesoConfig');
            
            const nome = nomeInput.value.trim();
            const peso = parseFloat(pesoInput.value);

            if (!nome) return mostrarToast("Digite um nome para a avaliação.", "warning");
            
            configsAtuais.push({ 
                id: null, 
                descricaoNota: nome, 
                peso: (nome.toUpperCase().includes("RECUPERA")) ? 0 : (isNaN(peso) ? 1 : peso)
            });

            nomeInput.value = '';
            pesoInput.value = '1';
            nomeInput.focus();
            
            renderListaConfig();
        };

        document.getElementById('btnSalvarConfigs').onclick = async () => {
            try {
                if (typeof instLoading === 'function') instLoading(true);

                const idsAtuais = configsAtuais.map(c => c.id).filter(id => id != null);
                const idsParaRemover = configsOriginais
                    .filter(orig => orig.id && !idsAtuais.includes(orig.id))
                    .map(orig => orig.id);

                if (idsParaRemover.length > 0) {
                    console.log("Detectadas exclusões. IDs:", idsParaRemover);
                    mostrarToast("Removendo notas vinculadas a avaliações excluídas...", "info");

                    const todasMatriculas = await fetchAPI('/matriculas'); 
                    
                    const matriculasDaMateria = todasMatriculas.filter(m => m.idMateria == idMateria || m.nomeMateria == nomeMateria);

                    const promessasLimpeza = [];

                    matriculasDaMateria.forEach(matricula => {
                        if (!matricula.notas) return;

                        matricula.notas.forEach(nota => {
                            if (idsParaRemover.includes(nota.idConfiguracao)) {
                                const payloadLimpeza = {
                                    idMatricula: matricula.id,
                                    idConfiguracao: nota.idConfiguracao,
                                    nota: null // Tentativa de anular
                                };
                                promessasLimpeza.push(fetchAPI('/matriculas/notas', 'PUT', payloadLimpeza));
                            }
                        });
                    });

                    if (promessasLimpeza.length > 0) {
                        await Promise.all(promessasLimpeza);
                        console.log(`${promessasLimpeza.length} notas foram limpas.`);
                    }
                }

                const payload = configsAtuais.map(c => ({
                    id: c.id || null, // Se tiver ID envia, se não envia null (cria novo)
                    descricaoNota: c.descricaoNota || c.nome,
                    peso: c.peso
                }));

                await fetchAPI(`/materias/${idMateria}/avaliacoes`, 'PUT', payload);

                mostrarToast("Critérios salvos e notas atualizadas!", "success");
                bsModal.hide();
                
                if(typeof profVerAlunos === 'function') {
                    profVerAlunos(idMateria, nomeMateria);
                }

            } catch (error) {
                console.error("Erro ao salvar:", error);
                const msgErro = error.message || "";
                
                if (msgErro.includes("constraint fails") || msgErro.includes("foreign key")) {
                    mostrarToast("Erro de banco de dados: Ainda existem notas vinculadas que impedem a exclusão. Tente remover as notas manualmente ou contate o suporte.", "danger", 8000);
                } else {
                    mostrarToast("Erro ao salvar: " + msgErro, "danger");
                }
            } finally {
                if (typeof instLoading === 'function') instLoading(false);
            }
        };

        modalEl.addEventListener('hidden.bs.modal', () => {
            delete window.removerConfigTemp;
            modalEl.remove();
        });

    } catch (error) {
        console.error(error);
        if (typeof instLoading === 'function') instLoading(false);
        mostrarToast("Erro ao carregar configurações.", "danger");
    }
}