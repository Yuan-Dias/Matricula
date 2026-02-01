// ARQUIVO: js/materias.js

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
                                <th class="ps-4 py-3 cursor-pointer user-select-none" style="width: 30%; cursor: pointer;" onclick="ordenarERender('materias', 'nome')">
                                    Disciplina <i class="fas fa-sort ms-1 small text-muted"></i>
                                </th>
                                <th class="py-3 cursor-pointer user-select-none" style="width: 20%; cursor: pointer;" onclick="ordenarERender('materias', 'nomeCurso')">
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

// LÓGICA DE FILTRAGEM E CONTEÚDO

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
            
            const htmlNotas = typeof utilsGerarBarraPesos === 'function' ? utilsGerarBarraPesos(listaNotas) : `<small class="text-muted">${listaNotas.length} critérios</small>`;

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
                            
                            <button class="btn btn-sm btn-light border" 
                                    data-bs-toggle="tooltip" title="Diário de Classe / Notas" 
                                    onclick="instLimparTooltips(); instVerAlunos(${m.id}, '${m.nome}')">
                                <i class="fas fa-list-ol text-info"></i>
                            </button>
                            
                            <button class="btn btn-sm btn-light border" 
                                    data-bs-toggle="tooltip" title="Editar Configurações" 
                                    onclick="instLimparTooltips(); instPrepararEdicaoMateria(${m.id})" ${isEncerrada ? 'disabled' : ''}>
                                <i class="fas fa-cog text-primary"></i>
                            </button>

                            <button class="btn btn-sm btn-light border" 
                                    data-bs-toggle="tooltip" title="${isEncerrada ? 'Matéria Já Encerrada' : 'Encerrar Semestre'}" 
                                    onclick="instLimparTooltips(); instFinalizarMateria(${m.id}, '${m.nome}')" ${isEncerrada ? 'disabled' : ''}>
                                <i class="fas ${isEncerrada ? 'fa-check-double text-muted' : 'fa-lock text-warning'}"></i>
                            </button>

                            <button class="btn btn-sm btn-light border" 
                                    data-bs-toggle="tooltip" title="Excluir Disciplina" 
                                    onclick="instLimparTooltips(); instDeletarMateria(${m.id})">
                                <i class="fas fa-trash text-danger"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
        }).join('');
        
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
          return new bootstrap.Tooltip(tooltipTriggerEl);
        });

    } catch(e) { 
        console.error("Erro ao filtrar matérias:", e);
        container.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-4">Erro de conexão ao carregar dados.</td></tr>'; 
    }
}

function instAdicionarLinhaNota(descricao = '', peso = '') {
    const container = document.getElementById('containerNotas');
    if (!container) {
        console.error("ERRO: Elemento 'containerNotas' não encontrado no DOM.");
        return;
    }

    const div = document.createElement('div');
    div.className = 'row g-2 mb-2 nota-row align-items-center';
    
    div.innerHTML = `
        <div class="col-7">
            <input type="text" class="form-control input-desc-nota" 
                   placeholder="Ex: Prova 1" value="${descricao || ''}" required>
        </div>
        <div class="col-3">
            <input type="number" step="0.1" min="0" max="10" class="form-control input-peso-nota" 
                   placeholder="Peso" value="${peso !== '' ? peso : ''}" required oninput="instCalcularTotalPesos()">
        </div>
        <div class="col-2 text-end">
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="instRemoverLinhaNota(this)">
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

function instRenderizarRecuperacaoFixa() {
    const container = document.getElementById('containerRecuperacaoFixa');
    if (!container) return;

    // Removemos a exibição do texto "Peso: N/A" e mantemos limpo
    container.innerHTML = `
        <div class="d-flex align-items-center gap-2 p-2 bg-light rounded border border-light text-muted">
            <div style="width: 24px;" class="text-center"><i class="fas fa-lock fa-xs"></i></div>
            <div class="flex-grow-1 fw-bold small text-uppercase">Recuperação / Exame Final</div>
            <div style="width: 100px;" class="text-center small"></div> <div style="width: 32px;"></div> </div>
    `;
}

function instCalcularTotalPesos() {
    const inputs = document.querySelectorAll('.input-peso-nota');
    let total = 0;
    inputs.forEach(inp => {
        const val = parseFloat(inp.value);
        if(!isNaN(val)) total += val;
    });
    
    const display = document.getElementById('displayTotalPesos');
    if(display) {
        display.innerText = total.toFixed(1);
        if(Math.abs(total - 10) < 0.1) {
            display.className = "fw-bold text-success";
        } else {
            display.className = "fw-bold text-danger";
        }
    }
}

async function instPrepararEdicaoMateria(id) {
    try {
        const materias = await fetchAPI('/materias');
        const materiaAlvo = materias.find(m => m.id === id);
        if (!materiaAlvo) throw new Error("Matéria não encontrada na lista.");

        let avaliacoes = [];
        try {
            avaliacoes = await fetchAPI(`/materias/${id}/avaliacoes`);
        } catch (err) {
            console.warn("Sem avaliações específicas ou erro (pode ser nova matéria sem notas).");
        }

        const dadosCompletos = {
            ...materiaAlvo,
            notasConfig: avaliacoes.map(av => ({
                descricao: av.descricaoNota || av.descricao || av.nome || '',
                peso: av.peso
            }))
        };

        instAbrirModalMateria(dadosCompletos);

    } catch (e) {
        mostrarToast("Erro ao carregar dados da matéria: " + e.message, "danger");
    }
}

async function instAbrirModalMateria(materia = null) {
    instGarantirModalMateria();

    const form = document.getElementById('formMateria');
    form.reset();
    form.classList.remove('was-validated');

    const containerNotas = document.getElementById('containerNotas');
    if(containerNotas) containerNotas.innerHTML = '';

    const modalTitle = document.getElementById('modalMateriaLabel'); 
    const btnSalvar = document.querySelector('#modalMateria .btn-primary');

    try {
        const [cursos, professores] = await Promise.all([
            fetchAPI('/cursos'),
            fetchAPI('/usuarios/tipo/PROFESSOR')
        ]);

        const selCurso = document.getElementById('materiaCursoSelect');
        const selProf = document.getElementById('materiaProfSelect');

        selCurso.innerHTML = '<option value="">Selecione...</option>' + 
            cursos.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');

        selProf.innerHTML = '<option value="">Sem professor</option>' + 
            professores.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
            
    } catch (e) {
        console.error("Erro ao carregar listas:", e);
        mostrarToast("Erro ao carregar cursos/professores.", "warning");
    }

    if (materia) {
        document.getElementById('modalMateriaTitle').textContent = 'Editar Matéria';
        btnSalvar.textContent = 'Atualizar';

        document.getElementById('materiaId').value = materia.id;
        document.getElementById('materiaNome').value = materia.nome || '';
        document.getElementById('materiaDescricao').value = materia.descricao || '';
        
        const cursoId = materia.curso ? materia.curso.id : (materia.idCurso || '');
        const profId = materia.professor ? materia.professor.id : (materia.idProfessor || '');
        
        document.getElementById('materiaCursoSelect').value = cursoId;
        document.getElementById('materiaProfSelect').value = profId;

        const avaliacoes = materia.avaliacoes || materia.notasConfig || [];
        const notasRegulares = avaliacoes.filter(n => {
            const desc = (n.descricaoNota || n.descricao || '').toString().toLowerCase();
            return desc !== 'recuperação' && desc !== 'recuperacao';
        });

        if (notasRegulares.length > 0) {
            notasRegulares.forEach(nota => {
                instAdicionarLinhaNota(nota.descricaoNota || nota.descricao, nota.peso);
            });
        } else {
            instAdicionarLinhaNota(); 
        }

    } else {
        document.getElementById('modalMateriaTitle').textContent = 'Nova Matéria';
        btnSalvar.textContent = 'Salvar';
        document.getElementById('materiaId').value = '';
        instAdicionarLinhaNota();
    }
    
    instRenderizarRecuperacaoFixa();
    instCalcularTotalPesos();

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
    const idExistente = inputId ? parseInt(inputId) : null;
    
    const nome = document.getElementById('materiaNome').value;
    const descricao = document.getElementById('materiaDescricao').value;
    
    const cursoSelectVal = document.getElementById('materiaCursoSelect').value;
    const profSelectVal = document.getElementById('materiaProfSelect').value;

    const idCurso = cursoSelectVal ? parseInt(cursoSelectVal) : null;
    const idProfessor = profSelectVal ? parseInt(profSelectVal) : null;

    if (!idCurso || isNaN(idCurso)) {
        mostrarToast("Por favor, selecione um Curso válido.", "warning");
        return;
    }

    const notasRows = document.querySelectorAll('.nota-row');
    const listaAvaliacoes = [];
    let pesoTotal = 0;
    
    notasRows.forEach(row => {
        const desc = row.querySelector('.input-desc-nota').value.trim();
        const pesoVal = row.querySelector('.input-peso-nota').value;
        const peso = parseFloat(pesoVal);
        
        if(desc) {
            const pesoFinal = isNaN(peso) ? 0 : peso;
            listaAvaliacoes.push({ 
                descricaoNota: desc, 
                peso: pesoFinal 
            });
            pesoTotal += pesoFinal;
        }
    });

    listaAvaliacoes.push({ descricaoNota: 'Recuperação', peso: 0 });

    const somaValida = Math.abs(pesoTotal - 10) < 0.1;
    if (!somaValida && pesoTotal !== 0) {
         // REMOVIDO O EMOJI AQUI
         if(!confirm(`Atenção: A soma dos pesos é ${pesoTotal.toFixed(1)}. O ideal é 10.0.\nDeseja salvar mesmo assim?`)) return;
    }

    try {
        const bodyMateria = {
            nome: nome,
            descricao: descricao,
            idCurso: idCurso, 
            idProfessor: idProfessor,
            avaliacoes: listaAvaliacoes 
        };

        if (idExistente) {
            bodyMateria.id = idExistente; 
        }

        console.log("Enviando JSON:", JSON.stringify(bodyMateria));

        const response = await fetchAPI(
            idExistente ? `/materias/${idExistente}` : '/materias', 
            idExistente ? 'PUT' : 'POST', 
            bodyMateria
        );

        const modalEl = document.getElementById('modalMateria');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
        
        if(typeof instRenderMaterias === 'function') instRenderMaterias();
        mostrarToast("Matéria salva com sucesso!", "success");

    } catch(e) {
        console.error("Erro ao salvar:", e);
        
        let msgErro = "Erro desconhecido";
        
        if (Array.isArray(e)) {
            msgErro = e.map(err => {
                const campo = err.campo || err.field; 
                const msg = err.mensagem || err.message || err.erro || JSON.stringify(err);
                return campo ? `<b>${campo}</b>: ${msg}` : msg;
            }).join('<br>');
        } 
        else if (e.message) msgErro = e.message;
        else if (typeof e === 'string') msgErro = e;

        mostrarToast("Não foi possível salvar:<br>" + msgErro, "danger");
    }
}

async function instDeletarMateria(id) {
    if(confirm("Tem certeza absoluta?\n\nAo excluir esta matéria, todas as notas lançadas e histórico acadêmico vinculado a ela serão perdidos permanentemente.")) {
        try {
            await fetchAPI(`/materias/${id}`, 'DELETE');
            instRenderMaterias();
            mostrarToast("Matéria removida com sucesso.", "success");
        } catch(e) {
            mostrarToast("Erro ao deletar: " + e.message, "danger");
        }
    }
}

// Validar se podemos fechar a matéria
async function instFinalizarMateria(idMateria, nomeMateria) {
    try {
        if (typeof instLoading === 'function') instLoading(true);

        const [avaliacoes, matriculas] = await Promise.all([
            fetchAPI(`/materias/${idMateria}/avaliacoes`),
            fetchAPI('/matriculas')
        ]);

        // Filtrar apenas alunos desta matéria e ativos
        const alunosDaTurma = matriculas.filter(mat => 
            mat.idMateria == idMateria && mat.situacao !== 'CANCELADO' && mat.situacao !== 'TRANCADO'
        );
        
        if (alunosDaTurma.length === 0) {
            return mostrarToast("Não há alunos matriculados para finalizar esta matéria.", "warning");
        }

        // Identificar Configurações
        const isRec = (nome) => {
            const n = (nome || "").toUpperCase();
            return n.includes("RECUPERA") || n.includes("PROVA FINAL") || n.includes("EXAME");
        };

        const configRecuperacao = avaliacoes.find(c => isRec(c.descricaoNota || c.nome));
        const configsRegulares = avaliacoes.filter(c => !isRec(c.descricaoNota || c.nome));

        const pendencias = [];

        // Verifica cada aluno
        alunosDaTurma.forEach(aluno => {
            const notas = aluno.notas || [];
            
            // 1. Verificar se todas as notas REGULARES foram lançadas
            const notasRegularesLancadas = configsRegulares.every(conf => {
                const n = notas.find(nt => nt.idConfiguracao === conf.id);
                return n && n.valor !== null && n.valor !== undefined && n.valor !== "";
            });

            if (!notasRegularesLancadas) {
                pendencias.push(`Aluno(a) ${aluno.aluno?.nome || 'Desconhecido'} possui notas regulares pendentes.`);
                return;
            }

            // 2. Calcular média parcial para saber se exige recuperação
            // (Reaproveita a lógica do diario.js ou calcula simples aqui para validação)
            let soma = 0;
            let pesos = 0;
            
            configsRegulares.forEach(conf => {
                const nObj = notas.find(nt => nt.idConfiguracao === conf.id);
                let valor = parseFloat(String(nObj.valor).replace(',', '.'));
                let peso = parseFloat(conf.peso) || 1;
                soma += valor * peso;
                pesos += peso;
            });

            const mediaParcial = pesos > 0 ? (soma / pesos) : 0;

            // 3. Se média < 7 e tem configuração de REC, a nota de REC é obrigatória
            if (mediaParcial < 7.0 && configRecuperacao) {
                const notaRec = notas.find(nt => nt.idConfiguracao === configRecuperacao.id);
                const temRec = notaRec && notaRec.valor !== null && notaRec.valor !== undefined && notaRec.valor !== "";
                
                if (!temRec) {
                    pendencias.push(`Aluno(a) ${aluno.aluno?.nome} está com média ${(mediaParcial).toFixed(1)} e precisa da nota de Recuperação.`);
                }
            }
        });

        if (pendencias.length > 0) {
            // Mostra os 3 primeiros erros para não poluir a tela
            const msg = pendencias.slice(0, 3).join('\n') + (pendencias.length > 3 ? `\n... e mais ${pendencias.length - 3}.` : "");
            alert("Não é possível finalizar a matéria:\n\n" + msg);
            return;
        }

        if (!confirm(`CONFIRMAÇÃO DE ENCERRAMENTO\n\nMatéria: ${nomeMateria}\n\n- O sistema calculará a Situação Final (Aprovado/Reprovado) de todos os alunos.\n- A matéria ficará como FINALIZADA.\n- Notas não poderão ser alteradas depois.\n\nDeseja continuar?`)) return;

        await fetchAPI(`/matriculas/encerrar/${idMateria}`, 'PUT', {});
        
        mostrarToast("Matéria encerrada e médias calculadas com sucesso!", "success");
        instRenderMaterias(); // Volta para a lista principal

    } catch (e) {
        console.error(e);
        mostrarToast("Erro ao finalizar matéria: " + e.message, "danger");
    } finally {
        if (typeof instLoading === 'function') instLoading(false);
    }
}

async function instVerAlunos(idMateria, nomeMateria) {
    instGarantirModalNota(); // Garante que o HTML do modal existe

    const appContent = document.getElementById('appContent');
    // Limpa a tela imediatamente
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
        
        // Filtrar e Ordenar Alunos
        const alunosDaTurma = matriculas
            .filter(mat => mat.idMateria == idMateria && mat.situacao !== 'CANCELADO')
            .sort((a, b) => a.nomeAluno.localeCompare(b.nomeAluno));

        // Separar configurações (usa utilsIsRecuperacao do utils.js)
        const configs = avaliacoes || [];
        const configsRegulares = configs.filter(c => !utilsIsRecuperacao(c.descricaoNota || c.nome));
        const temRecuperacao = configs.some(c => utilsIsRecuperacao(c.descricaoNota || c.nome));
        
        // --- Cabeçalho da Tabela ---
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

        // --- Corpo da Tabela ---
        let tableBody = alunosDaTurma.length === 0 
            ? '<tr><td colspan="100%" class="text-center py-5 text-muted">Nenhum aluno matriculado nesta matéria.</td></tr>'
            : alunosDaTurma.map(a => {
                const mapaNotas = {};
                if (Array.isArray(a.notas)) {
                    a.notas.forEach(n => { mapaNotas[n.idConfiguracao] = n; });
                }
                
                // 1. Calcular Média
                let mediaDisplay = 0;
                
                if (isFinalizada && a.mediaFinal != null) {
                    mediaDisplay = parseFloat(a.mediaFinal);
                } else {
                    // Calculo Local em Tempo Real
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

                // 2. Determinar Status Visual (Função movida para utils.js)
                // Espera-se que instCalcularStatusVisual retorne o HTML/Badge
                const resultadoStatus = utilsObterStatusAcademico(
                    mediaDisplay,
                    a.situacao,
                    true,
                    temRecuperacao
                );
                
                // Transforma o objeto retornado pelo utils em HTML para a tabela da instituição
                const statusObj = `<span class="badge ${resultadoStatus.classBadge}" style="font-size: 0.8rem">${resultadoStatus.texto}</span>`;

                // 3. Renderizar Colunas de Notas
                const colunasNotas = configs.map(av => {
                    const notaObj = mapaNotas[av.id];
                    const valor = (notaObj && notaObj.valor !== undefined && notaObj.valor !== null) ? Number(notaObj.valor) : null;
                    
                    let displayValor = '-';
                    let corTexto = 'text-muted opacity-25';
                    
                    if (valor !== null) {
                        displayValor = valor.toFixed(1);
                        // Usa função global de cor se disponível, ou lógica simples
                        corTexto = (typeof getNotaColor === 'function') 
                            ? getNotaColor(valor).replace('text-', 'text-') // apenas garantindo classe
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

        // --- Renderização Final ---
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
    }
    else if (modalExistente) {
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
                            <div id="containerNotas">
                            </div>
                        </div>

                        <div id="containerRecuperacaoFixa"></div>

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

async function instSalvarNota() {
    const idMatricula = document.getElementById('notaIdMatricula').value;
    const idConfiguracao = document.getElementById('notaIdConfig').value;
    const inputValor = document.getElementById('notaValorInput');
    const valor = parseFloat(inputValor.value);

    // Validação
    if (isNaN(valor) || valor < 0 || valor > 10) {
        inputValor.classList.add('is-invalid');
        mostrarToast("A nota deve ser um número entre 0 e 10.", "warning");
        return;
    }

    const btnSubmit = document.querySelector('#formNota button[type="submit"]');
    const txtOriginal = btnSubmit.innerHTML;
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';

    try {
        const payload = {
            idMatricula: parseInt(idMatricula),
            idConfiguracao: parseInt(idConfiguracao),
            nota: valor
        };

        await fetchAPI('/matriculas/notas', 'PUT', payload);
        
        const modalEl = document.getElementById('modalNota');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
        
        mostrarToast("Nota lançada com sucesso!", "success");
        
        const tituloMateria = document.querySelector('#appContent h4')?.innerText || 'Matéria';
        
        const matriculaObj = await fetchAPI(`/matriculas/${idMatricula}`);

        if(matriculaObj && matriculaObj.idMateria) {
            instVerAlunos(matriculaObj.idMateria, tituloMateria);
        } else {
             // Fallback caso não consiga pegar o ID da matéria: recarrega a página ou tenta pegar do DOM
             // instVerAlunos(variavelGlobalIdMateria, tituloMateria);
        }

    } catch (e) {
        console.error(e);
        mostrarToast("Erro ao salvar nota: " + (e.message || "Erro desconhecido"), "danger");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = txtOriginal;
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