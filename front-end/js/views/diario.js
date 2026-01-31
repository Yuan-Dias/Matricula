// professor-diario.js

async function profVerAlunos(idMateria, nomeMateria) {
    try {
        const [materia, avaliacoes, matriculas] = await Promise.all([
            fetchAPI(`/materias/${idMateria}`),
            fetchAPI(`/materias/${idMateria}/avaliacoes`), 
            fetchAPI('/matriculas')
        ]);
        
        const isFinalizada = materia.encerrada === true;
        const alunosDaTurma = matriculas.filter(mat => mat.idMateria == idMateria && mat.isAtiva);
        const appContent = document.getElementById('appContent');
        if (!appContent) return;

        const configs = avaliacoes || []; 
        
        // Cabeçalho da tabela dinâmico baseado nos critérios
        let tableHeader = `
            <tr>
                <th class="ps-4">Aluno</th>
                ${configs.map(av => {
                    const nUpper = (av.descricaoNota || "").toUpperCase();
                    const isRecuperacao = nUpper.includes("RECUPERACAO") || nUpper.includes("PROVA FINAL");
                    return `<th class="text-center small">${av.descricaoNota || av.nome}${isRecuperacao ? '' : `<br>(P${av.peso})`}</th>`;
                }).join('') || '<th class="text-center">Nota Única</th>'}
                <th class="text-center bg-light border-start">Média Final</th>
                <th class="text-center">Status</th>
                <th class="text-end pe-4">Ação</th>
            </tr>`;

        let tableBody = '';
        if (alunosDaTurma.length === 0) {
            tableBody = '<tr><td colspan="10" class="text-center py-5 text-muted">Nenhum aluno matriculado.</td></tr>';
        } else {
            tableBody = alunosDaTurma.map(a => {
                const mapaNotas = {};
                if (Array.isArray(a.notas)) {
                    a.notas.forEach(n => { mapaNotas[n.idConfiguracao] = n.valor; });
                }
                
                // Lógica de Status
                const avaliacoesRegulares = configs.filter(av => !isRec(av.descricaoNota || av.nome));
                const notasRegularesPreenchidas = avaliacoesRegulares.filter(av => 
                    mapaNotas[av.id] !== undefined && mapaNotas[av.id] !== null
                ).length;

                const temNotasObrigatorias = avaliacoesRegulares.length > 0 
                    ? notasRegularesPreenchidas === avaliacoesRegulares.length 
                    : (a.mediaFinal !== undefined);

                let colunasNotas = configs.map(av => {
                    const valor = mapaNotas[av.id];
                    return `<td class="text-center text-dark">${(valor !== undefined && valor !== null) ? Number(valor).toFixed(1) : '-'}</td>`;
                }).join('');

                let statusBadge = '';
                const media = a.mediaFinal || 0;

                if (!temNotasObrigatorias) { 
                    statusBadge = '<span class="badge bg-info-subtle text-info border border-info">CURSANDO</span>';
                } else if (media >= 7) {
                    statusBadge = '<span class="badge bg-success-subtle text-success border border-success">APROVADO</span>';
                } else if (media >= 5) {
                    statusBadge = '<span class="badge bg-warning-subtle text-dark border border-warning">RECUPERAÇÃO</span>';
                } else {
                    statusBadge = '<span class="badge bg-danger-subtle text-danger border border-danger">REPROVADO</span>';
                }

                const avStr = encodeURIComponent(JSON.stringify(configs));
                const notasStr = encodeURIComponent(JSON.stringify(mapaNotas));

                return `
                    <tr class="${isFinalizada ? 'table-light' : ''}">
                        <td class="align-middle ps-4 fw-bold text-dark">${a.nomeAluno}</td>
                        ${colunasNotas}
                        <td class="text-center align-middle bg-light border-start fw-bold">${media.toFixed(1)}</td>
                        <td class="text-center align-middle">${statusBadge}</td>
                        <td class="text-end pe-4">
                            <button class="btn btn-sm btn-primary rounded-pill px-3 shadow-sm" 
                                ${isFinalizada ? 'disabled' : ''}
                                onclick='profLancarNota(${a.id}, "${a.nomeAluno}", decodeURIComponent("${notasStr}"), decodeURIComponent("${avStr}"), ${idMateria}, "${nomeMateria}")'>
                                <i class="fas ${isFinalizada ? 'fa-lock' : 'fa-edit'} me-1"></i> Notas
                            </button>
                        </td>
                    </tr>`;
            }).join('');
        }

        appContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border-start border-primary border-4">
                <div>
                    <h4 class="m-0 fw-bold">Matéria: <span class="text-primary">${nomeMateria}</span></h4>
                    <span class="badge ${isFinalizada ? 'bg-secondary' : 'bg-success'}">
                        <i class="fas ${isFinalizada ? 'fa-lock' : 'fa-clock'} me-1"></i>
                        ${isFinalizada ? 'ENCERRADA' : 'EM ANDAMENTO'}
                    </span>
                </div>
                <div>
                    ${!isFinalizada ? `
                        <button class="btn btn-sm btn-outline-primary me-2 fw-bold" onclick="profConfigurarAvaliacoes(${idMateria}, '${nomeMateria}')">
                            <i class="fas fa-cog me-1"></i> Critérios
                        </button>
                        <button class="btn btn-sm btn-danger me-2 fw-bold" onclick="profFinalizarMateria(${idMateria}, '${nomeMateria}')">
                            <i class="fas fa-check-double me-1"></i> Finalizar
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-secondary px-3" onclick="profRenderTurmas()">Voltar</button>
                </div>
            </div>
            <div class="card border-0 shadow-sm">
                <div class="table-responsive rounded">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="table-light text-uppercase small fw-bold">${tableHeader}</thead>
                        <tbody>${tableBody}</tbody>
                    </table>
                </div>
            </div>`;
    } catch (error) {
        console.error(error);
        mostrarToast("Erro ao carregar diário.", "danger");
    }
}

async function profLancarNota(idMatricula, nomeAluno, dadosNotasJson, configMateriaJson, idMateria, nomeMateria) {
    const dadosNotas = typeof dadosNotasJson === 'string' ? JSON.parse(dadosNotasJson || '{}') : (dadosNotasJson || {});
    const configMateria = typeof configMateriaJson === 'string' ? JSON.parse(configMateriaJson || '[]') : (configMateriaJson || []);
    const modoComplexo = configMateria.length > 0;

    let bodyInputs = modoComplexo ? configMateria.map(av => {
        const notaAtual = dadosNotas[av.id] ?? '';
        const nomeUpper = (av.descricaoNota || "").toUpperCase();
        const isRecuperacao = nomeUpper.includes("RECUPERACAO") || nomeUpper.includes("PROVA FINAL");
        
        return `
            <div class="mb-3 p-2 ${isRecuperacao ? 'bg-warning-subtle rounded border border-warning-subtle' : ''}">
                <label class="form-label fw-bold small text-uppercase text-muted d-flex justify-content-between">
                    <span>${av.descricaoNota || av.nome}</span>
                    <span class="text-primary">${isRecuperacao ? 'SUBSTITUTIVA/FINAL' : '(Peso ' + av.peso + ')'}</span>
                </label>
                <input type="number" class="form-control nota-input ${isRecuperacao ? 'border-warning' : ''}" 
                    data-id-config="${av.id}" value="${notaAtual}" 
                    min="0" max="10" step="0.1" placeholder="0.0 a 10.0">
                ${isRecuperacao ? '<div class="form-text mt-1" style="font-size: 0.7rem;">Esta nota só será considerada se a média parcial for menor que 7.0</div>' : ''}
            </div>`;
    }).join('') : `
        <div class="mb-3">
            <label class="form-label fw-bold">Nota Única</label>
            <input type="number" id="inputNotaUnica" class="form-control form-control-lg" 
                   value="${!isNaN(dadosNotas) ? dadosNotas : 0}" min="0" max="10" step="0.1">
        </div>`;

    const modalHTML = `
    <div class="modal fade" id="modalLancarNota" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content shadow border-0">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title"><i class="fas fa-user-edit me-2"></i>Notas: ${nomeAluno}</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <form id="formNotas">${bodyInputs}</form>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary fw-bold px-4" id="btnSalvarNotaReal">
                        <i class="fas fa-save me-2"></i>Salvar Alterações
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

    document.getElementById('btnSalvarNotaReal').onclick = async () => {
        try {
            if (typeof instLoading === 'function') instLoading(true);

            if (modoComplexo) {
                const inputs = modalEl.querySelectorAll('.nota-input');
                for (const input of inputs) {
                    const notaValor = input.value;
                    if (notaValor === '') continue;

                    await fetchAPI('/matriculas/notas', 'PUT', {
                        idMatricula: parseInt(idMatricula),
                        idConfiguracao: parseInt(input.getAttribute('data-id-config')),
                        nota: parseFloat(notaValor)
                    });
                }
            } else {
                const valUnica = document.getElementById('inputNotaUnica').value;
                await fetchAPI('/matriculas/notas', 'PUT', {
                    idMatricula: parseInt(idMatricula),
                    nota: parseFloat(valUnica)
                });
            }

            mostrarToast("Notas salvas com sucesso!");
            bsModal.hide();
            setTimeout(() => profVerAlunos(idMateria, nomeMateria), 500);

        } catch (e) {
            console.error(e);
            mostrarToast("Erro ao salvar notas.", "danger");
        } finally {
            if (typeof instLoading === 'function') instLoading(false);
        }
    };
    
    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
}

async function profFinalizarMateria(idMateria, nomeMateria) {
    try {
        const [avaliacoes, matriculas] = await Promise.all([
            fetchAPI(`/materias/${idMateria}/avaliacoes`),
            fetchAPI('/matriculas')
        ]);

        const alunosNoSemestre = matriculas.filter(mat => mat.idMateria == idMateria);

        if (alunosNoSemestre.length === 0) {
            return mostrarToast("Não há alunos vinculados a esta matéria no semestre atual.", "warning");
        }

        const totalCriterios = (avaliacoes && avaliacoes.length > 0) ? avaliacoes.length : 1;

        const pendentes = alunosNoSemestre.filter(a => {
            const notasLancadas = Array.isArray(a.notas) 
                ? a.notas.filter(n => n.valor !== null && n.valor !== undefined).length 
                : 0;
            return notasLancadas < totalCriterios;
        });

        if (pendentes.length > 0) {
            return mostrarToast(`Erro: ${pendentes.length} aluno(s) ainda não possuem todas as notas lançadas.`, "danger");
        }

        const msgConfirma = `Finalizar semestre de "${nomeMateria}"?\n\n` +
                           `Isso consolidará as notas de ${alunosNoSemestre.length} alunos e ` +
                           `limpará a lista para o próximo período.`;
        
        if (!confirm(msgConfirma)) return;

        if (typeof instLoading === 'function') instLoading(true);
        await fetchAPI(`/matriculas/encerrar/${idMateria}`, 'PUT');
        mostrarToast("Semestre finalizado com sucesso!", "success");
        setTimeout(() => profRenderTurmas(), 1000);

    } catch (e) {
        console.error(e);
        mostrarToast(e.message || "Erro ao finalizar semestre.", "danger");
    } finally {
        if (typeof instLoading === 'function') instLoading(false);
    }
}