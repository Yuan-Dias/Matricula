async function instRenderMaterias() {
    atualizarMenuAtivo('Matérias');
    instGarantirModalMateria();

    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
    appContent.innerHTML = `
        <div class="fade-in">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h3 class="fw-bold text-dark mb-1">Grade Curricular</h3>
                    <p class="text-muted small mb-0">Gerenciamento de disciplinas, professores e critérios de avaliação.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-primary d-flex align-items-center px-4 shadow-sm" onclick="instAbrirModalMateria()">
                        <i class="fas fa-plus me-2"></i> Nova Matéria
                    </button>
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-header bg-white border-bottom border-light p-3">
                    <div class="row g-3">
                        <div class="col-md-5">
                            <div class="input-group input-group-solid">
                                <span class="input-group-text bg-light border-0 ps-3"><i class="fas fa-search text-muted"></i></span>
                                <input type="text" id="buscaInput" class="form-control bg-light border-0 shadow-none" 
                                       placeholder="Buscar disciplina, professor..." oninput="instFiltrarMaterias()">
                            </div>
                        </div>
                        <div class="col-md-7 text-md-end">
                            <button class="btn btn-light btn-sm text-muted" onclick="instFiltrarMaterias()">
                                <i class="fas fa-sync-alt me-1"></i> Atualizar
                            </button>
                        </div>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0 custom-table">
                        <thead class="bg-light text-uppercase small fw-bold text-muted">
                            <tr>
                                <th class="ps-4 py-3 cursor-pointer user-select-none" style="width: 30%;" onclick="ordenarERender('materias', 'nome')">
                                    Disciplina <i class="fas fa-sort ms-1 small text-muted"></i>
                                </th>
                                <th class="py-3 cursor-pointer user-select-none" style="width: 20%;" onclick="ordenarERender('materias', 'nomeCurso')">
                                    Curso <i class="fas fa-sort ms-1 small text-muted"></i>
                                </th>
                                <th class="py-3" style="width: 30%;">Critérios de Avaliação</th>
                                <th class="text-end pe-4 py-3">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="materiasTableBody">
                            <tr><td colspan="4" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    instFiltrarMaterias();
}

async function instFiltrarMaterias() {
    const termo = document.getElementById('buscaInput')?.value || "";
    const container = document.getElementById('materiasTableBody');
    if(!container) return;

    instLimparTooltips();

    try {
        let materias = await fetchAPI('/materias');
        
        if (typeof filtrarDados === 'function') {
            materias = filtrarDados(materias, termo, ['nome', 'nomeCurso', 'nomeProfessor']);
        }
        
        if(typeof ordenacaoAtual !== 'undefined' && ordenacaoAtual.coluna && typeof ordenarDados === 'function') {
            materias = ordenarDados(materias, ordenacaoAtual.coluna);
        }

        if (!materias || materias.length === 0) {
            container.innerHTML = `<tr><td colspan="4" class="text-center p-5 text-muted"><i class="fas fa-inbox fa-2x mb-2"></i><br>Nenhuma matéria encontrada.</td></tr>`;
            return;
        }

        container.innerHTML = materias.map(m => {
            const listaNotas = m.avaliacoes || m.notasConfig || [];
            const isEncerrada = m.encerrada || m.status === 'FINALIZADA';
            
            const regulares = listaNotas.filter(n => !utilsIsRecuperacao(n.descricaoNota || n.nome));
            const recuperacoes = listaNotas.filter(n => utilsIsRecuperacao(n.descricaoNota || n.nome));

            const recuperacaoUnica = recuperacoes.length > 0 ? [recuperacoes[0]] : [];

            const notasAtivas = [...regulares, ...recuperacaoUnica];

            const htmlNotas = typeof utilsGerarBarraPesos === 'function' 
                ? utilsGerarBarraPesos(notasAtivas) 
                : `<small class="text-muted">${notasAtivas.length} critérios (Soma: ${notasAtivas.reduce((a,b)=>a+(b.peso||0),0)})</small>`;

            return `
                <tr class="${isEncerrada ? 'bg-light opacity-75' : ''} fade-in">
                    <td class="ps-4 py-3">
                        <div class="fw-bold text-dark text-truncate" style="max-width: 250px;" title="${m.nome}">${m.nome}</div>
                        <div class="small text-muted d-flex align-items-center">
                            <i class="fas fa-chalkboard-teacher me-1 text-secondary"></i> ${m.nomeProfessor || '<span class="fst-italic">Sem professor</span>'}
                        </div>
                    </td>
                    <td class="py-3">
                        <span class="badge bg-white text-dark border shadow-sm fw-normal px-2 py-1">${m.nomeCurso}</span>
                        <div class="mt-1">
                            ${isEncerrada 
                                ? '<span class="badge bg-secondary" style="font-size:0.65rem">ENCERRADA</span>' 
                                : '<span class="badge bg-soft-green text-success border border-success-subtle" style="font-size:0.65rem">EM ANDAMENTO</span>'}
                        </div>
                    </td>
                    <td class="py-3">${htmlNotas}</td>
                    <td class="text-end pe-4 py-3">
                        <div class="btn-group shadow-sm">
                            <button class="btn btn-sm btn-light border" data-bs-toggle="tooltip" title="Diário de Classe" 
                                    onclick="instLimparTooltips(); instVerAlunos(${m.id}, '${m.nome}')">
                                <i class="fas fa-list-ol text-info"></i>
                            </button>
                            
                            <button class="btn btn-sm btn-light border" data-bs-toggle="tooltip" title="Editar" 
                                    onclick="instLimparTooltips(); instPrepararEdicaoMateria(${m.id})" ${isEncerrada ? 'disabled' : ''}>
                                <i class="fas fa-cog text-primary"></i>
                            </button>

                            <button class="btn btn-sm btn-light border" data-bs-toggle="tooltip" title="${isEncerrada ? 'Já Encerrada' : 'Encerrar'}" 
                                    onclick="instLimparTooltips(); instFinalizarMateria(${m.id}, '${m.nome}')" ${isEncerrada ? 'disabled' : ''}>
                                <i class="fas ${isEncerrada ? 'fa-check-double text-muted' : 'fa-lock text-warning'}"></i>
                            </button>

                            <button class="btn btn-sm btn-light border" data-bs-toggle="tooltip" title="Excluir" 
                                    onclick="instLimparTooltips(); instConfirmarExclusao(${m.id})"> 
                                <i class="fas fa-trash text-danger"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        }).join('');
        
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(t => new bootstrap.Tooltip(t));

    } catch(e) { 
        console.error("Erro ao filtrar:", e);
        container.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Erro de conexão.</td></tr>'; 
    }
}

function instConfirmarExclusao(id) {
    mostrarModalConfirmacao(
        "Excluir Matéria?",
        "Tem certeza? Todas as notas e históricos serão perdidos.",
        () => instExecutarExclusao(id),
        "danger"
    );
}

async function instExecutarExclusao(id) {
    if (typeof instLoading === 'function') instLoading(true);
    try {
        await fetchAPI(`/materias/${id}`, 'DELETE');
        mostrarToast("Matéria removida.", "success");
    } catch(e) {
        if ((e.status === 404) || (e.message && e.message.includes('404'))) {
            mostrarToast("Item já não existia.", "warning");
        } else {
            mostrarToast("Erro ao deletar: " + (e.message || "Erro desconhecido"), "danger");
        }
    } finally {
        if (typeof instFiltrarMaterias === 'function') await instFiltrarMaterias(); 
        if (typeof instLoading === 'function') instLoading(false);
        instRenderMaterias();
    }
}

async function instPrepararEdicaoMateria(id) {
    try {
        const materias = await fetchAPI('/materias');
        const materiaAlvo = materias.find(m => m.id === id);
        if (!materiaAlvo) throw new Error("Matéria não encontrada.");

        let avaliacoes = [];
        try { 
            const respAvaliacoes = await fetchAPI(`/materias/${id}/avaliacoes`); 
            
            if (respAvaliacoes && Array.isArray(respAvaliacoes) && respAvaliacoes.length > 0) {
                avaliacoes = respAvaliacoes;
            } else {
                avaliacoes = materiaAlvo.avaliacoes || materiaAlvo.notasConfig || [];
            }
        } catch(e){
            console.warn("Falha ao buscar avaliações detalhadas, usando cache.", e);
            avaliacoes = materiaAlvo.avaliacoes || materiaAlvo.notasConfig || [];
        }

        const isRecuperacao = (desc) => {
            const d = (desc || '').toUpperCase();
            return d.includes('RECUPERA') || d.includes('PROVA FINAL');
        };

        const configRecuperacao = avaliacoes.find(av => isRecuperacao(av.descricaoNota || av.nome));
        const configsRegulares = avaliacoes.filter(av => !isRecuperacao(av.descricaoNota || av.nome));

        const dadosCompletos = {
            ...materiaAlvo,
            notasConfig: configsRegulares.map(av => ({
                id: av.id,
                descricao: av.descricaoNota || av.nome || '',
                peso: av.peso
            })),
            recuperacaoConfig: configRecuperacao ? {
                id: configRecuperacao.id,
                descricao: configRecuperacao.descricaoNota || configRecuperacao.nome,
                peso: configRecuperacao.peso
            } : null
        };

        instAbrirModalMateria(dadosCompletos);

    } catch (e) {
        mostrarToast("Erro ao carregar edição: " + e.message, "danger");
    }
}

async function instAbrirModalMateria(materia = null) {
    instGarantirModalMateria();

    const form = document.getElementById('formMateria');
    form.reset();
    form.classList.remove('was-validated');

    const containerNotas = document.getElementById('containerNotas');
    if(containerNotas) containerNotas.innerHTML = '';

    utilsConfigurarDragDrop(containerNotas, '.nota-item');

    const btnSalvar = document.querySelector('#modalMateria .btn-primary');
    const selCurso = document.getElementById('materiaCursoSelect');
    const selProf = document.getElementById('materiaProfSelect');

    let listaCursos = [];
    let listaProfessores = [];

    try {
        const [cursos, professores] = await Promise.all([
            fetchAPI('/cursos'),
            fetchAPI('/usuarios/tipo/PROFESSOR')
        ]);
        
        listaCursos = cursos;
        listaProfessores = professores;

        selCurso.innerHTML = '<option value="">Selecione...</option>' + 
            cursos.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');

        selProf.innerHTML = '<option value="">Sem professor</option>' + 
            professores.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
            
    } catch (e) {
        mostrarToast("Erro ao carregar listas.", "warning");
        console.error(e);
    }

    if (materia) {
        document.getElementById('modalMateriaTitle').textContent = 'Editar Matéria';
        btnSalvar.textContent = 'Atualizar';

        document.getElementById('materiaId').value = materia.id;
        document.getElementById('materiaNome').value = materia.nome || '';
        document.getElementById('materiaDescricao').value = materia.descricao || '';
        
        let cursoId = materia.curso?.id || materia.idCurso;
        let profId = materia.professor?.id || materia.idProfessor;

        if (!cursoId && materia.nomeCurso) {
            const encontrado = listaCursos.find(c => c.nome === materia.nomeCurso);
            if (encontrado) cursoId = encontrado.id;
        }

        if (!profId && materia.nomeProfessor) {
            const encontrado = listaProfessores.find(p => p.nome === materia.nomeProfessor);
            if (encontrado) profId = encontrado.id;
        }

        if (selCurso) selCurso.value = cursoId ? String(cursoId) : "";
        if (selProf) selProf.value = profId ? String(profId) : "";
        
        let notas = materia.notasConfig || [];
        
        if (notas.length === 0 && materia.avaliacoes && materia.avaliacoes.length > 0) {
            const isRec = (n) => (n.descricaoNota || n.nome || '').toUpperCase().includes('RECUPERA');
            notas = materia.avaliacoes
                .filter(n => !isRec(n))
                .map(n => ({
                    id: n.id,
                    descricao: n.descricaoNota || n.nome,
                    peso: n.peso
                }));
        }
        
        if (notas.length > 0) {
            notas.forEach(nota => {
                instAdicionarLinhaNota(nota.descricao, nota.peso, nota.id);
            });
        } else {
            instAdicionarLinhaNota(); 
        }

        const recId = materia.recuperacaoConfig ? materia.recuperacaoConfig.id : null;
        if(typeof instRenderizarRecuperacaoFixa === 'function') {
            instRenderizarRecuperacaoFixa(recId);
        }

    } else {
        document.getElementById('modalMateriaTitle').textContent = 'Nova Matéria';
        btnSalvar.textContent = 'Salvar';
        document.getElementById('materiaId').value = '';
        instAdicionarLinhaNota();
        
        if(typeof instRenderizarRecuperacaoFixa === 'function') {
            instRenderizarRecuperacaoFixa(null);
        }
    }
    
    if(typeof instCalcularTotalPesos === 'function') {
        instCalcularTotalPesos();
    }

    const modal = new bootstrap.Modal(document.getElementById('modalMateria'));
    modal.show();
}

async function instSalvarMateria() {
    const form = document.getElementById('formMateria');
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        mostrarToast("Preencha os campos obrigatórios.", "warning");
        return;
    }

    const inputId = document.getElementById('materiaId')?.value;
    const idExistente = (inputId && inputId !== "0" && inputId !== "null") ? parseInt(inputId) : null;
    
    const nome = document.getElementById('materiaNome').value;
    const descricao = document.getElementById('materiaDescricao').value;
    const idCurso = document.getElementById('materiaCursoSelect').value ? parseInt(document.getElementById('materiaCursoSelect').value) : null;
    const elProf = document.getElementById('materiaProfSelect');
    const idProfessor = (elProf.value && elProf.value !== "0") ? parseInt(elProf.value) : null;

    if (!idCurso) {
        mostrarToast("Selecione um curso válido.", "warning");
        return;
    }

    const listaAvaliacoes = [];
    let pesoTotal = 0;
    
    document.querySelectorAll('.nota-row').forEach(row => {
        const inputIdNota = row.querySelector('.input-id-nota');
        const desc = row.querySelector('.input-desc-nota').value.trim();
        const peso = parseFloat(row.querySelector('.input-peso-nota').value) || 0;
        
        let idAvaliacao = null;
        if (inputIdNota && inputIdNota.value && inputIdNota.value !== "null") {
            idAvaliacao = parseInt(inputIdNota.value);
        }

        if(desc) {
            listaAvaliacoes.push({ 
                id: idAvaliacao,
                nome: desc, 
                descricaoNota: desc, 
                peso: peso 
            });
            pesoTotal += peso;
        }
    });

    const recIdInput = document.getElementById('recuperacaoId');
    const recId = (recIdInput && recIdInput.value) ? parseInt(recIdInput.value) : null;

    listaAvaliacoes.push({
        id: recId,
        nome: 'Recuperação',
        descricaoNota: 'Recuperação',
        peso: 0,
        ativo: true
    });

    if (pesoTotal > 10.0) {
        mostrarToast(`A soma dos pesos (${pesoTotal}) excede 10. Ajuste antes de salvar.`, "danger");
        return; 
    }
    if (Math.abs(pesoTotal - 10) > 0.1 && pesoTotal !== 0) {
         if(!confirm(`A soma dos pesos está em ${pesoTotal} (o ideal é 10.0). Deseja salvar assim mesmo?`)) return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const txtOriginal = btn.innerHTML; 
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';

    try {
        const bodyMateria = {
            id: idExistente,
            nome, 
            descricao, 
            idCurso, 
            idProfessor,
            avaliacoes: listaAvaliacoes 
        };

        const url = idExistente ? `/materias/${idExistente}` : '/materias';
        const method = idExistente ? 'PUT' : 'POST';

        await fetchAPI(url, method, bodyMateria);

        const modalEl = document.getElementById('modalMateria');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
        
        if (typeof instRenderMaterias === 'function') instRenderMaterias();
        mostrarToast("Matéria salva com sucesso!", "success");

    } catch(e) {
        console.error(e);
        mostrarToast("Erro ao salvar: " + (e.message || "Erro desconhecido"), "danger");
    } finally {
        btn.disabled = false;
        btn.innerHTML = txtOriginal;
    }
}

async function instFinalizarMateria(idMateria, nomeMateria) {
    try {
        if (typeof instLoading === 'function') instLoading(true);

        const [avaliacoes, matriculas] = await Promise.all([
            fetchAPI(`/materias/${idMateria}/avaliacoes`),
            fetchAPI('/matriculas')
        ]);

        const alunosDaTurma = matriculas.filter(mat => 
            mat.idMateria == idMateria && mat.situacao !== 'CANCELADO' && mat.situacao !== 'TRANCADO'
        );
        
        if (alunosDaTurma.length === 0) {
            return mostrarToast("Não há alunos matriculados para finalizar esta matéria.", "warning");
        }

        const isRec = (nome) => {
            const n = (nome || "").toUpperCase();
            return n.includes("RECUPERA") || n.includes("PROVA FINAL") || n.includes("EXAME") || n.includes("SUBSTITUTIVA");
        };

        const configRecuperacao = avaliacoes.find(c => isRec(c.descricaoNota || c.nome));
        const configsRegulares = avaliacoes.filter(c => !isRec(c.descricaoNota || c.nome));

        const pendencias = [];

        alunosDaTurma.forEach(aluno => {
            const notas = aluno.notas || [];
            const nomeAluno = aluno.aluno?.nome || aluno.nomeAluno || 'Desconhecido';
            
            const notasRegularesLancadas = configsRegulares.every(conf => {
                const n = notas.find(nt => nt.idConfiguracao === conf.id);
                return n && n.valor !== null && n.valor !== undefined && String(n.valor).trim() !== "";
            });

            if (!notasRegularesLancadas) {
                pendencias.push(`- ${nomeAluno}: Possui notas regulares (provas/trabalhos) pendentes.`);
                return;
            }

            let soma = 0;
            let totalPesos = 0;
            
            configsRegulares.forEach(conf => {
                const nObj = notas.find(nt => nt.idConfiguracao === conf.id);
                let valor = parseFloat(String(nObj.valor).replace(',', '.'));
                let peso = parseFloat(conf.peso) || 0;
                
                soma += valor * peso;
                totalPesos += peso;
            });

            const mediaCalculada = totalPesos > 0 ? (soma / totalPesos) : 0;
            const mediaParcial = parseFloat(mediaCalculada.toFixed(2));

            if (mediaParcial < 7.0) {
                
                if (!configRecuperacao) {
                    pendencias.push(`- ${nomeAluno}: Média ${mediaParcial} (Reprovado), mas não há avaliação de Recuperação configurada na matéria.`);
                } else {
                    const notaRec = notas.find(nt => nt.idConfiguracao === configRecuperacao.id);
                    const temNotaRec = notaRec && notaRec.valor !== null && notaRec.valor !== undefined && String(notaRec.valor).trim() !== "";
                    
                    if (!temNotaRec) {
                        pendencias.push(`- ${nomeAluno}: Média parcial ${mediaParcial}. Necessário lançar a nota de Recuperação.`);
                    }
                }
            }
        });

        if (pendencias.length > 0) {
            const qtd = pendencias.length;
            const msgList = pendencias.slice(0, 5).join('\n'); // Mostra os 5 primeiros
            const msgFinal = pendencias.length > 5 ? `${msgList}\n... e mais ${qtd - 5} pendências.` : msgList;
            
            alert(`NÃO É POSSÍVEL FINALIZAR A MATÉRIA.\nVerifique as pendências abaixo:\n\n${msgFinal}`);
            return;
        }

        if (!confirm(`CONFIRMAÇÃO DE ENCERRAMENTO\n\nMatéria: ${nomeMateria}\n\n- O sistema calculará a Situação Final de todos os alunos.\n- Alunos com média >= 7.0 serão Aprovados.\n- Alunos em recuperação terão a nota final calculada.\n- A matéria será travada.\n\nDeseja realmente finalizar?`)) return;

        await fetchAPI(`/matriculas/encerrar/${idMateria}`, 'PUT', {});
        
        mostrarToast("Matéria encerrada e médias calculadas com sucesso!", "success");
        
        if (typeof instRenderMaterias === 'function') instRenderMaterias();

    } catch (e) {
        console.error(e);
        mostrarToast("Erro ao finalizar matéria: " + (e.message || "Erro desconhecido"), "danger");
    } finally {
        if (typeof instLoading === 'function') instLoading(false);
    }
}

async function instVerAlunos(idMateria, nomeMateria) {
    instGarantirModalNota();

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
        
        const alunosDaTurma = matriculas
            .filter(mat => mat.idMateria == idMateria && mat.situacao !== 'CANCELADO')
            .sort((a, b) => a.nomeAluno.localeCompare(b.nomeAluno));

        const listaBruta = avaliacoes || [];

        const regulares = listaBruta.filter(c => !utilsIsRecuperacao(c.descricaoNota || c.nome));
        const recuperacoes = listaBruta.filter(c => utilsIsRecuperacao(c.descricaoNota || c.nome));

        const configs = [...regulares, ...recuperacoes];

        const configsRegulares = regulares; 
        const temRecuperacao = recuperacoes.length > 0;

        let tableHeader = `
            <tr class="small text-muted bg-light border-bottom">
                <th class="ps-3 text-uppercase align-middle py-3">Aluno</th>
                ${configs.map(av => {
                    const isRec = utilsIsRecuperacao(av.descricaoNota || av.nome);
                    return `
                    <th class="text-center align-middle" style="min-width: 100px;">
                        <div class="fw-bold ${isRec ? 'text-danger small' : 'text-dark'}">${av.descricaoNota || av.nome}</div>
                        ${isRec ? '' : `<span class="badge bg-white text-secondary border fw-normal mt-1" style="font-size:0.65rem">Peso ${av.peso}</span>`}
                    </th>`;
                }).join('')}
                <th class="text-center bg-light border-start border-end text-primary align-middle fw-bold">Média</th>
                <th class="text-center align-middle">Situação</th>
            </tr>`;

        let tableBody = alunosDaTurma.length === 0 
            ? '<tr><td colspan="100%" class="text-center py-5 text-muted">Nenhum aluno matriculado nesta matéria.</td></tr>'
            : alunosDaTurma.map(a => {
                const mapaNotas = {};
                if (Array.isArray(a.notas)) {
                    a.notas.forEach(n => { mapaNotas[n.idConfiguracao] = n; });
                }
                
                let mediaDisplay = 0;
                
                if (isFinalizada && a.mediaFinal != null) {
                    mediaDisplay = parseFloat(a.mediaFinal);
                } else {
                    let somaPonderada = 0;
                    let somaPesos = 0;
                    
                    configsRegulares.forEach(conf => {
                        const n = mapaNotas[conf.id];
                        if (n && n.valor != null && n.valor !== "") {
                            somaPonderada += parseFloat(n.valor) * parseFloat(conf.peso);
                            somaPesos += parseFloat(conf.peso);
                        } else {
                            somaPesos += parseFloat(conf.peso); 
                        }
                    });
                    
                    mediaDisplay = somaPesos > 0 ? (somaPonderada / somaPesos) : 0;
                }

                const resultadoStatus = utilsObterStatusAcademico(
                    mediaDisplay,
                    a.situacao,
                    true,
                    temRecuperacao
                );
                
                const statusObj = `<span class="badge ${resultadoStatus.classBadge}" style="font-size: 0.8rem">${resultadoStatus.texto}</span>`;

                const colunasNotas = configs.map(av => {
                    const notaObj = mapaNotas[av.id];
                    const valor = (notaObj && notaObj.valor !== undefined && notaObj.valor !== null) ? Number(notaObj.valor) : null;
                    
                    let displayValor = '-';
                    let corTexto = 'text-muted opacity-25';
                    
                    if (valor !== null) {
                        displayValor = valor.toFixed(1);
                        corTexto = (typeof getNotaColor === 'function') 
                            ? getNotaColor(valor).replace('text-', 'text-') 
                            : (valor < 6.0 ? 'text-danger fw-bold' : 'text-dark fw-bold');
                    }

                    const btnEdit = isFinalizada ? '' : `
                        <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center opacity-0 hover-show" 
                             style="cursor: pointer; background-color: rgba(0,0,0,0.05);"
                             onclick="instAbrirModalNota(${a.id}, ${av.id}, '${a.nomeAluno.replace(/'/g, "\\'")}', '${av.descricaoNota || av.nome}', '${valor !== null ? valor : ''}')">
                            <i class="fas fa-pen text-primary"></i>
                        </div>
                    `;

                    return `
                        <td class="text-center position-relative p-0 hover-trigger" style="height: 50px; vertical-align: middle;">
                            <span class="${corTexto} fs-6">${displayValor}</span>
                            ${btnEdit}
                        </td>`;
                }).join('');

                return `
                    <tr class="fade-in border-bottom" style="font-size: 0.9rem;">
                        <td class="ps-3 py-3 fw-bold text-dark text-truncate" style="max-width: 250px;">
                            <div class="d-flex align-items-center">
                                <div class="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center me-2 fw-bold" style="width:32px; height:32px; font-size: 0.8rem">
                                    ${a.nomeAluno.charAt(0)}
                                </div>
                                ${a.nomeAluno}
                            </div>
                        </td>
                        ${colunasNotas}
                        <td class="text-center bg-light border-start border-end text-primary fw-bold fs-6 align-middle">
                            ${mediaDisplay.toFixed(1)}
                        </td>
                        <td class="text-center align-middle">
                            ${statusObj}
                        </td>
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
                        <div class="d-flex gap-3 align-items-center">
                            <span><i class="fas fa-users me-1"></i> ${alunosDaTurma.length} Alunos</span>
                            <span class="badge ${isFinalizada ? 'bg-success' : 'bg-warning text-dark'}">
                                ${isFinalizada ? 'FINALIZADA' : 'EM ANDAMENTO'}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary px-3" onclick="instRenderMaterias()">
                        <i class="fas fa-arrow-left me-2"></i> Voltar
                    </button>
                    ${!isFinalizada ? `
                    <button class="btn btn-primary px-3" onclick="instFinalizarMateria(${idMateria}, '${nomeMateria}')">
                        <i class="fas fa-check-double me-2"></i> Finalizar
                    </button>` : ''}
                </div>
            </div>
            
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden fade-in">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead>${tableHeader}</thead>
                        <tbody>${tableBody}</tbody>
                    </table>
                </div>
            </div>`;

    } catch (error) {
        console.error(error);
        appContent.innerHTML = `<div class="alert alert-danger m-4 shadow-sm">Erro ao carregar notas: ${error.message}</div>`;
    }
}

function instGarantirModalMateria() {
    const modalExistente = document.getElementById('modalMateria');
    const containerNotas = document.getElementById('containerNotas');

    if (modalExistente && !containerNotas) {
        modalExistente.remove();
    } else if (modalExistente) {
        return;
    }

    const modalHTML = `
    <div class="modal fade" id="modalMateria" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header bg-primary text-white py-2">
                    <h6 class="modal-title fw-bold" id="modalMateriaTitle">Nova Matéria</h6>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-3 bg-light-subtle">
                    <form id="formMateria" novalidate onsubmit="event.preventDefault(); instSalvarMateria()">
                        <input type="hidden" id="materiaId">
                        
                        <div class="row g-2 mb-2">
                            <div class="col-md-8">
                                <label class="form-label fw-bold small mb-1">Nome da Disciplina</label>
                                <input type="text" class="form-control form-control-sm" id="materiaNome" required placeholder="Ex: Matemática">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-bold small mb-1">Curso</label>
                                <select class="form-select form-select-sm" id="materiaCursoSelect" required>
                                    <option value="">Carregando...</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-2">
                            <label class="form-label fw-bold small mb-1">Professor</label>
                            <select class="form-select form-select-sm" id="materiaProfSelect">
                                <option value="">Sem professor</option>
                            </select>
                        </div>

                        <div class="mb-3">
                            <label class="form-label small mb-1">Descrição</label>
                            <textarea class="form-control form-control-sm" id="materiaDescricao" rows="2"></textarea>
                        </div>

                        <hr class="text-muted my-2">
                        
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <label class="form-label fw-bold m-0 small text-primary">
                                <i class="fas fa-calculator me-1"></i> Avaliações
                            </label>
                            <button type="button" class="btn btn-sm btn-outline-primary py-0" style="font-size: 0.8rem;" onclick="instAdicionarLinhaNota()">
                                <i class="fas fa-plus"></i> Adicionar
                            </button>
                        </div>
                        
                        <div class="bg-white p-2 rounded border mb-3 shadow-sm">
                            <div class="d-flex justify-content-between mb-2 border-bottom pb-1">
                                <small class="text-muted" style="font-size: 0.75rem">Configure os pesos.</small>
                                <small style="font-size: 0.75rem">Soma: <span id="displayTotalPesos" class="fw-bold">0.0</span>/10</small>
                            </div>
                            <div id="containerNotas"></div>
                        </div>

                        <div id="containerRecuperacao"></div>

                        <div class="text-end pt-2 border-top mt-2">
                            <button type="button" class="btn btn-sm btn-light me-1 border" data-bs-dismiss="modal">Cancelar</button>
                            <button type="submit" class="btn btn-sm btn-primary px-3 shadow-sm">
                                <i class="fas fa-save me-1"></i> Salvar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    instRenderizarRecuperacaoFixa();
}

function instGarantirModalNota() {
    if (document.getElementById('modalNota')) return;

    const modalHTML = `
    <div class="modal fade" id="modalNota" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-sm">
            <div class="modal-content border-0 shadow-lg rounded-4">
                <div class="modal-header bg-primary text-white py-2">
                    <h6 class="modal-title fw-bold"><i class="fas fa-pen-square me-2"></i>Lançar Nota</h6>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body pt-3">
                    <form id="formNota" onsubmit="event.preventDefault(); instSalvarNota()">
                        <input type="hidden" id="notaIdMatricula">
                        <input type="hidden" id="notaIdConfig">
                        
                        <div class="text-center mb-3">
                            <h6 class="fw-bold text-dark mb-0" id="notaNomeAluno">Aluno</h6>
                            <small class="text-muted" id="notaNomeAvaliacao">Avaliação</small>
                        </div>

                        <div class="form-floating mb-3">
                            <input type="number" step="0.1" min="0" max="10" 
                                   class="form-control text-center fw-bold fs-3 text-primary border-primary" 
                                   id="notaValorInput" placeholder="0.0" required>
                            <label for="notaValorInput" class="w-100 text-center">Nota (0 a 10)</label>
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary shadow-sm">
                                Confirmar Alteração
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function instAbrirModalNota(idMatricula, idConfig, nomeAluno, nomeAvaliacao, valorAtual) {
    instGarantirModalNota();
    
    document.getElementById('notaIdMatricula').value = idMatricula;
    document.getElementById('notaIdConfig').value = idConfig;
    document.getElementById('notaNomeAluno').textContent = nomeAluno;
    document.getElementById('notaNomeAvaliacao').textContent = nomeAvaliacao;
    
    const inputValor = document.getElementById('notaValorInput');
    inputValor.value = valorAtual;
    inputValor.classList.remove('is-invalid');

    const modal = new bootstrap.Modal(document.getElementById('modalNota'));
    modal.show();
    
    setTimeout(() => inputValor.focus(), 500);
}

function instAdicionarLinhaNota(descricao = '', peso = '', id = null) {
    const container = document.getElementById('containerNotas');
    
    const div = document.createElement('div');
    div.className = 'nota-row nota-item row g-2 align-items-center mb-2 bg-white p-2 border rounded shadow-sm';
    
    div.setAttribute('draggable', 'true');
    div.addEventListener('dragstart', () => div.classList.add('dragging'));
    div.addEventListener('dragend', () => div.classList.remove('dragging'));

    div.innerHTML = `
        <div class="col-auto cursor-grab">
            <i class="fas fa-grip-vertical text-muted drag-handle" style="cursor: grab;"></i>
        </div>
        <div class="col">
            <input type="text" class="form-control form-control-sm input-desc-nota" 
                   name="descricaoNota[]" 
                   placeholder="Nome da Avaliação (Ex: Prova 1)" 
                   value="${descricao}" required>
        </div>
        <div class="col-3">
            <input type="number" class="form-control form-control-sm text-center input-peso-nota" 
                   name="pesoNota[]" 
                   placeholder="Peso" 
                   value="${peso}" 
                   min="0" max="10" step="0.1" 
                   oninput="instCalcularTotalPesos()" 
                   onchange="instCalcularTotalPesos()">
        </div>
        <div class="col-auto">
            <input type="hidden" class="input-id-nota" name="idNota[]" value="${id || ''}">
            <button type="button" class="btn btn-sm btn-outline-danger border-0" 
                    onclick="this.closest('.nota-row').remove(); instCalcularTotalPesos()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;

    container.appendChild(div);
    
    instCalcularTotalPesos();
}

function instRemoverLinhaNota(btn) {
    if(confirm("Tem certeza que deseja remover esta avaliação?")) {
        const row = btn.closest('.nota-row');
        row.remove();
        instCalcularTotalPesos();
    }
}

function instRenderizarRecuperacaoFixa(id = null) {
    const container = document.getElementById('containerRecuperacao');
    if (!container) return;

    container.innerHTML = `
        <div class="row g-2 align-items-center p-2 border border-warning bg-warning-subtle rounded mt-3">
            <div class="col-auto">
                <i class="fas fa-exclamation-circle text-warning-emphasis"></i>
            </div>
            <div class="col">
                <span class="fw-bold text-warning-emphasis small">Recuperação / Prova Final</span>
                <div class="text-muted" style="font-size: 0.75rem">Nota substitutiva automática</div>
            </div>
            <div class="col-3 text-end">
                <span class="badge bg-warning text-dark border border-warning-subtle">Auto</span>
            </div>
            <input type="hidden" id="recuperacaoId" value="${id || ''}">
        </div>
    `;
}

function instCalcularTotalPesos() {
    let total = 0;
    const inputs = document.querySelectorAll('.input-peso-nota');
    
    inputs.forEach(input => {
        const val = parseFloat(input.value);
        if (!isNaN(val)) {
            total += val;
        }
    });

    const display = document.getElementById('displayTotalPesos');
    if (display) {
        display.textContent = total.toFixed(1);
        
        if (total > 10) {
            display.className = "fw-bold text-danger";
        } else if (total === 10) {
            display.className = "fw-bold text-success";
        } else {
            display.className = "fw-bold text-warning";
        }
    }
}

function instLimparTooltips() {
    document.querySelectorAll('.tooltip').forEach(el => el.remove());
    
    const triggers = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    triggers.forEach(trigger => {
        const instance = bootstrap.Tooltip.getInstance(trigger);
        if (instance) instance.dispose();
    });
}