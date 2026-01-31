// ==================================================================================
// ARQUIVO: js/views/turmas.js
// DESCRIÇÃO: Gestão completa de turmas, notas, configurações de avaliação e encerramento.
// ==================================================================================

// ==================================================================================
// 1. LISTAGEM DE TURMAS (DASHBOARD DO PROFESSOR)
// ==================================================================================

async function profRenderTurmas() {
    const appContent = document.getElementById('appContent');
    if (!appContent) return;

    // Loading State
    appContent.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="height: 60vh;">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="ms-3 mt-2 fw-bold text-muted">Carregando suas turmas...</p>
        </div>
    `;

    // Atualiza navegação
    if (typeof atualizarMenuAtivo === 'function') atualizarMenuAtivo('menu-prof-turmas');

    try {
        const user = getUser(); // Função global que pega o usuário do localStorage
        const todasMaterias = await fetchAPI('/materias');

        // Filtra matérias onde o professor logado é o responsável
        const minhasMaterias = todasMaterias.filter(m => {
            // Verifica compatibilidade com diferentes formatos de resposta da API
            const idProfessorMateria = m.professorId || (m.professor ? m.professor.id : null) || m.idProfessor;
            
            if (idProfessorMateria && user.id && idProfessorMateria == user.id) return true;
            
            // Fallback por nome (caso o ID não venha corretamente)
            if (m.nomeProfessor && user.nome) {
                return m.nomeProfessor.trim().toLowerCase() === user.nome.trim().toLowerCase();
            }
            return false;
        });

        if (minhasMaterias.length === 0) {
            appContent.innerHTML = `
                <div class="container mt-4 fade-in">
                    <div class="alert alert-warning border-0 shadow-sm d-flex align-items-center">
                        <i class="fas fa-exclamation-triangle fs-4 me-3"></i>
                        <div>
                            <h5 class="alert-heading fw-bold mb-1">Nenhuma turma encontrada</h5>
                            <p class="mb-0">Você não possui matérias vinculadas neste semestre.</p>
                        </div>
                    </div>
                </div>`;
            return;
        }

        // Renderiza os Cards
        let html = `
            <div class="container-fluid fade-in">
                <h3 class="mb-4 fw-bold text-secondary">
                    <i class="fas fa-chalkboard-teacher me-2 text-primary"></i>Minhas Turmas
                </h3>
                <div class="row g-4">`;

        minhasMaterias.forEach(m => {
            const statusBadge = m.encerrada 
                ? `<span class="badge bg-danger ms-2"><i class="fas fa-lock me-1"></i>Encerrada</span>` 
                : `<span class="badge bg-success ms-2"><i class="fas fa-lock-open me-1"></i>Aberta</span>`;

            html += `
                <div class="col-md-6 col-lg-4 col-xl-3">
                    <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-card">
                        <div class="card-header bg-white border-bottom-0 pt-4 px-4">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">
                                    ${m.nomeCurso || 'Disciplina'}
                                </span>
                                ${statusBadge}
                            </div>
                            <h5 class="card-title fw-bold text-dark mb-1 text-truncate" title="${m.nome}">
                                ${m.nome}
                            </h5>
                        </div>
                        <div class="card-body px-4 pt-2">
                            <p class="card-text text-muted small clamp-text-3">
                                ${m.descricao || 'Sem descrição.'}
                            </p>
                        </div>
                        <div class="card-footer bg-white border-0 px-4 pb-4 pt-0">
                            <button class="btn btn-primary w-100 rounded-3 py-2 fw-medium shadow-sm" 
                                    onclick="profVerAlunos(${m.id}, '${m.nome}')">
                                <i class="fas fa-users me-2"></i>Gerenciar Turma
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
        appContent.innerHTML = html;

    } catch (erro) {
        console.error("Erro ao carregar turmas:", erro);
        appContent.innerHTML = `
            <div class="alert alert-danger m-4">
                <i class="fas fa-bug me-2"></i>Erro ao carregar turmas: ${erro.message}
            </div>`;
    }
}

// ==================================================================================
// 2. DIÁRIO DE CLASSE (Visualização, Notas e Configurações)
// ==================================================================================

async function profVerAlunos(idMateria, nomeMateria) {
    const appContent = document.getElementById('appContent');
    
    appContent.innerHTML = `
        <div class="d-flex flex-column justify-content-center align-items-center" style="height: 60vh;">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-3 text-muted fw-bold">Carregando diário de classe...</p>
        </div>`;

    try {
        // Carrega dados da Matéria e Matrículas em paralelo
        const [materia, todasMatriculas] = await Promise.all([
            fetchAPI(`/materias/${idMateria}`),
            fetchAPI('/matriculas') 
        ]);

        // Filtra alunos apenas desta matéria
        const alunosTurma = todasMatriculas.filter(m => m.idMateria === idMateria);

        // Verifica se existem avaliações configuradas
        const avaliacoes = materia.avaliacoes || [];
        const temAvaliacoes = avaliacoes.length > 0;
        const estaEncerrada = materia.encerrada;

        // BOTÕES DE AÇÃO NO HEADER
        let botoesAcao = '';
        if (!estaEncerrada) {
            botoesAcao = `
                <button class="btn btn-outline-primary btn-sm me-2" onclick="profAbrirModalConfiguracao(${idMateria})">
                    <i class="fas fa-cogs me-2"></i>Configurar Avaliações
                </button>
                <button class="btn btn-outline-danger btn-sm" onclick="profEncerrarTurma(${idMateria})">
                    <i class="fas fa-lock me-2"></i>Encerrar Turma
                </button>
            `;
        } else {
            botoesAcao = `<span class="badge bg-danger fs-6 px-3 py-2"><i class="fas fa-lock me-2"></i>Turma Encerrada</span>`;
        }

        // SE NÃO HOUVER AVALIAÇÕES CONFIGURADAS
        if (!temAvaliacoes) {
            appContent.innerHTML = `
                <div class="container mt-4 fade-in">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <button class="btn btn-secondary btn-sm" onclick="profRenderTurmas()">
                            <i class="fas fa-arrow-left me-2"></i>Voltar
                        </button>
                        <h3 class="fw-bold text-primary mb-0">${materia.nome}</h3>
                    </div>
                    
                    <div class="card border-0 shadow-sm text-center py-5">
                        <div class="card-body">
                            <i class="fas fa-clipboard-list text-muted mb-3" style="font-size: 3rem;"></i>
                            <h4 class="fw-bold">Nenhuma avaliação configurada</h4>
                            <p class="text-muted">Para lançar notas, você precisa primeiro definir quais avaliações (P1, P2, Trabalho, etc.) esta turma terá.</p>
                            ${!estaEncerrada ? `
                                <button class="btn btn-primary btn-lg mt-3" onclick="profAbrirModalConfiguracao(${idMateria})">
                                    <i class="fas fa-plus-circle me-2"></i>Criar Configuração de Notas
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div id="modalContainer"></div>
                </div>`;
            return;
        }

        // CONSTRUÇÃO DA TABELA (Header Dinâmico)
        const headersAvaliacoes = avaliacoes.map(av => 
            `<th class="text-center" style="width: 120px;">
                <div class="small fw-bold text-white">${av.descricaoNota}</div>
                <div class="badge bg-light text-dark bg-opacity-75 border-0" style="font-size: 0.7rem;">Peso ${av.peso}</div>
            </th>`
        ).join('');

        // CONSTRUÇÃO DAS LINHAS (Input de Notas)
        const linhasTabela = alunosTurma.map(matricula => {
            const colunasNotas = avaliacoes.map(config => {
                const notaLancada = matricula.notas.find(n => n.idConfiguracao === config.id);
                const valorNota = notaLancada ? notaLancada.valor : '';
                
                // Se encerrada, input desabilitado
                const disabled = estaEncerrada ? 'disabled' : '';

                return `
                    <td class="text-center align-middle">
                        <input type="number" 
                               class="form-control form-control-sm text-center fw-bold border-secondary input-nota" 
                               min="0" max="10" step="0.1"
                               value="${valorNota}"
                               ${disabled}
                               onchange="profSalvarNota(${matricula.id}, ${config.id}, this)"
                               style="min-width: 70px;">
                    </td>
                `;
            }).join('');

            // Status e Média
            const status = utilsObterStatusAcademico(matricula.mediaFinal, materia.encerrada);

            return `
                <tr>
                    <td class="align-middle ps-4">
                        <div class="fw-bold text-dark">${matricula.nomeAluno}</div>
                        <small class="text-muted">ID: ${matricula.id}</small>
                    </td>
                    ${colunasNotas}
                    <td class="text-center align-middle fw-bold fs-5 text-dark bg-light border-start">
                        ${matricula.mediaFinal !== null && matricula.mediaFinal !== undefined ? matricula.mediaFinal.toFixed(1) : '-'}
                    </td>
                    <td class="text-center align-middle">
                        <span class="badge ${status.classBadge}">${status.texto}</span>
                    </td>
                </tr>
            `;
        }).join('');

        // RENDERIZAÇÃO FINAL
        appContent.innerHTML = `
            <div class="container-fluid fade-in pb-5">
                <div class="d-flex justify-content-between align-items-center mb-4 mt-2">
                    <div>
                        <button class="btn btn-outline-secondary btn-sm mb-2" onclick="profRenderTurmas()">
                            <i class="fas fa-arrow-left me-2"></i>Voltar
                        </button>
                        <h3 class="fw-bold text-primary mb-0">${materia.nome}</h3>
                        <span class="text-muted">${materia.nomeCurso}</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        ${botoesAcao}
                        <div class="vr mx-2"></div>
                        <div class="text-end">
                            <small class="d-block text-muted fw-bold">Alunos</small>
                            <span class="fs-5 fw-bold text-dark">${alunosTurma.length}</span>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm overflow-hidden">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0 align-middle">
                            <thead class="bg-primary text-white">
                                <tr>
                                    <th class="py-3 ps-4">Aluno</th>
                                    ${headersAvaliacoes}
                                    <th class="text-center py-3 bg-secondary border-start" style="width: 100px;">Média</th>
                                    <th class="text-center py-3" style="width: 120px;">Situação</th>
                                </tr>
                            </thead>
                            <tbody class="border-top-0">
                                ${alunosTurma.length > 0 ? linhasTabela : '<tr><td colspan="15" class="text-center py-5 text-muted">Nenhum aluno matriculado nesta disciplina.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div id="modalContainer"></div>
        `;

    } catch (error) {
        console.error('Erro ao carregar diário:', error);
        mostrarToast('Erro ao carregar dados da turma.', 'error');
        appContent.innerHTML = `<div class="alert alert-danger m-4">Erro de conexão: ${error.message}</div>`;
    }
}

// ==================================================================================
// 3. FUNCIONALIDADE: SALVAR NOTA
// ==================================================================================

async function profSalvarNota(idMatricula, idConfiguracao, inputElement) {
    const novaNota = inputElement.value;

    // Validação
    if (novaNota === '') return; // Ignora campo vazio se não foi alterado explicitamente para 0
    if (novaNota < 0 || novaNota > 10) {
        mostrarToast('A nota deve ser entre 0 e 10', 'error');
        inputElement.classList.add('is-invalid');
        return;
    }
    inputElement.classList.remove('is-invalid');

    // UI Feedback
    const oldBorder = inputElement.style.borderColor;
    inputElement.disabled = true;
    inputElement.style.borderColor = "#ffc107"; // Amarelo (Salvando)

    try {
        const payload = {
            idMatricula: parseInt(idMatricula),
            idConfiguracao: parseInt(idConfiguracao),
            nota: parseFloat(novaNota)
        };

        // PUT /matriculas/notas
        await fetchAPI('/matriculas/notas', 'PUT', payload);
        
        mostrarToast('Nota salva com sucesso!', 'success');
        inputElement.style.borderColor = "#198754"; // Verde (Sucesso)

    } catch (error) {
        console.error(error);
        mostrarToast('Erro ao salvar nota.', 'error');
        inputElement.style.borderColor = "#dc3545"; // Vermelho (Erro)
    } finally {
        inputElement.disabled = false;
        setTimeout(() => {
            inputElement.style.borderColor = oldBorder;
        }, 2000);
    }
}

// ==================================================================================
// 4. FUNCIONALIDADE: CONFIGURAR AVALIAÇÕES (MODAL COM DRAG & DROP E SOMA 10)
// ==================================================================================

async function profAbrirModalConfiguracao(idMateria) {
    // Busca dados atuais da matéria para preencher o modal
    let materia;
    try {
        materia = await fetchAPI(`/materias/${idMateria}`);
    } catch (e) {
        console.error(e);
        materia = { avaliacoes: [] };
    }

    // Separa avaliações normais da Recuperação (se já existir)
    // Assumimos que a recuperação é identificada pelo nome ou é a última se não tiver nome específico
    // Aqui, vamos tratar "Recuperação" como um campo fixo visualmente.
    let avaliacoesNormais = materia.avaliacoes ? materia.avaliacoes.filter(a => a.descricaoNota !== 'Recuperação') : [];
    let recupExistente = materia.avaliacoes ? materia.avaliacoes.find(a => a.descricaoNota === 'Recuperação') : null;

    const modalHtml = `
    <div class="modal fade" id="modalConfigAvaliacao" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title"><i class="fas fa-cogs me-2"></i>Configurar Avaliações</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body bg-light">
                    
                    <div class="alert alert-warning small d-flex align-items-center justify-content-between" id="alertPeso">
                        <span><i class="fas fa-exclamation-circle me-1"></i> A soma dos pesos deve ser <strong>10</strong>.</span>
                        <span class="badge bg-dark" id="badgeSomaAtual">Atual: 0</span>
                    </div>

                    <h6 class="text-muted text-uppercase small fw-bold mb-2 ps-1">Avaliações Regulares (Arraste para ordenar)</h6>
                    <div id="listaAvaliacoesContainer" class="list-group mb-3 shadow-sm">
                        </div>

                    <button type="button" class="btn btn-sm btn-outline-primary w-100 dashed-border mb-4" onclick="profAdicionarLinhaAvaliacao()">
                        <i class="fas fa-plus me-1"></i> Adicionar Nova Avaliação
                    </button>

                    <hr>

                    <h6 class="text-muted text-uppercase small fw-bold mb-2 ps-1">Avaliação Final</h6>
                    <div class="card border-warning border-opacity-50 shadow-sm">
                        <div class="card-body py-2 px-3 bg-white rounded">
                            <div class="d-flex align-items-center">
                                <span class="text-warning me-3"><i class="fas fa-lock"></i></span>
                                <div class="flex-grow-1">
                                    <label class="small text-muted fw-bold">Descrição</label>
                                    <input type="text" class="form-control form-control-sm fw-bold text-muted" value="Recuperação" disabled readonly>
                                </div>
                                <div class="ms-2" style="width: 80px;">
                                    <label class="small text-muted fw-bold">Peso</label>
                                    <input type="text" class="form-control form-control-sm text-center" value="-" disabled title="Substitui a média">
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="profSalvarConfiguracao(${idMateria})">
                        <i class="fas fa-save me-1"></i> Salvar Configuração
                    </button>
                </div>
            </div>
        </div>
    </div>`;

    document.getElementById('modalContainer').innerHTML = modalHtml;
    
    const container = document.getElementById('listaAvaliacoesContainer');
    container.innerHTML = '';

    // Popula as avaliações existentes ou cria padrão
    if (avaliacoesNormais.length > 0) {
        avaliacoesNormais.forEach(av => profAdicionarLinhaAvaliacao(av.descricaoNota, av.peso));
    } else {
        profAdicionarLinhaAvaliacao('P1', 5);
        profAdicionarLinhaAvaliacao('P2', 5);
    }

    // Atualiza a soma inicial
    profAtualizarSomaPesos();

    // Inicializa o Drag and Drop do Utils
    utilsConfigurarDragDrop(container, '.linha-avaliacao');

    const modal = new bootstrap.Modal(document.getElementById('modalConfigAvaliacao'));
    modal.show();
}

function profAdicionarLinhaAvaliacao(nome = '', peso = '') {
    const container = document.getElementById('listaAvaliacoesContainer');
    const div = document.createElement('div');
    
    // Classes para Drag and Drop e Estilização
    div.className = 'list-group-item list-group-item-action d-flex align-items-center p-2 linha-avaliacao draggable-item';
    div.setAttribute('draggable', 'true');
    
    div.innerHTML = `
        <div class="cursor-grab text-muted me-3 handle" style="cursor: grab;">
            <i class="fas fa-grip-vertical"></i>
        </div>
        <div class="flex-grow-1 me-2">
            <input type="text" class="form-control form-control-sm fw-bold border-0 bg-transparent nome-av" 
                   placeholder="Nome (Ex: P1)" value="${nome}">
        </div>
        <div style="width: 80px;">
            <input type="number" class="form-control form-control-sm text-center peso-av" 
                   placeholder="Peso" value="${peso}" step="0.1" min="0" max="10" oninput="profAtualizarSomaPesos()">
        </div>
        <button class="btn btn-link text-danger btn-sm ms-2" type="button" onclick="this.parentElement.remove(); profAtualizarSomaPesos();">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Eventos de Drag Específicos para o Elemento (Visual)
    div.addEventListener('dragstart', () => div.classList.add('dragging', 'opacity-50'));
    div.addEventListener('dragend', () => div.classList.remove('dragging', 'opacity-50'));

    container.appendChild(div);
    profAtualizarSomaPesos();
}

function profAtualizarSomaPesos() {
    const inputs = document.querySelectorAll('.peso-av');
    let soma = 0;
    inputs.forEach(inp => {
        soma += parseFloat(inp.value) || 0;
    });

    // Arredonda para evitar erros de ponto flutuante (ex: 9.99999)
    soma = Math.round(soma * 100) / 100;

    const badge = document.getElementById('badgeSomaAtual');
    const alertBox = document.getElementById('alertPeso');

    if (badge) {
        badge.innerText = `Total: ${soma}`;
        if (soma === 10) {
            badge.className = 'badge bg-success';
            alertBox.classList.remove('alert-warning', 'alert-danger');
            alertBox.classList.add('alert-success');
            alertBox.innerHTML = `<span><i class="fas fa-check-circle me-1"></i> Soma correta.</span> ${badge.outerHTML}`;
        } else {
            badge.className = 'badge bg-danger';
            alertBox.classList.remove('alert-success', 'alert-warning');
            alertBox.classList.add('alert-danger');
            alertBox.innerHTML = `<span><i class="fas fa-exclamation-triangle me-1"></i> A soma deve ser <strong>10</strong>.</span> ${badge.outerHTML}`;
        }
    }
    return soma;
}

async function profSalvarConfiguracao(idMateria) {
    const soma = profAtualizarSomaPesos();

    // 1. Validação de Soma
    if (soma !== 10) {
        mostrarToast(`A soma dos pesos deve ser exatamente 10. Atual: ${soma}`, 'error');
        // Efeito visual de erro
        const alertBox = document.getElementById('alertPeso');
        alertBox.classList.add('animate__animated', 'animate__shakeX'); // Requer animate.css ou use JS simples
        setTimeout(() => alertBox.classList.remove('animate__animated', 'animate__shakeX'), 1000);
        return;
    }

    const linhas = document.querySelectorAll('.linha-avaliacao');
    const avaliacoes = [];
    let erroCampos = false;

    // 2. Coleta dados da lista reordenável
    linhas.forEach((linha, index) => {
        const nome = linha.querySelector('.nome-av').value.trim();
        const peso = parseFloat(linha.querySelector('.peso-av').value);

        if (!nome || isNaN(peso)) {
            erroCampos = true;
        }
        avaliacoes.push({
            descricaoNota: nome,
            peso: peso,
            ordem: index // Salva a ordem visual
        });
    });

    if (erroCampos) {
        mostrarToast('Preencha os nomes e pesos corretamente.', 'error');
        return;
    }

    // 3. Adiciona a Recuperação Fixa (Sempre por último)
    // A recuperação geralmente não entra na soma de 10, ela substitui. Peso 0 ou null.
    avaliacoes.push({
        descricaoNota: 'Recuperação',
        peso: 0, // Ou null, dependendo do backend
        ordem: 999
    });

    try {
        await fetchAPI(`/materias/${idMateria}/avaliacoes`, 'PUT', avaliacoes);
        
        mostrarToast('Configurações salvas com sucesso!', 'success');
        
        const modalEl = document.getElementById('modalConfigAvaliacao');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        
        profVerAlunos(idMateria, '...'); 

    } catch (e) {
        console.error(e);
        mostrarToast('Erro ao salvar: ' + e.message, 'error');
    }
}

// ==================================================================================
// 5. FUNCIONALIDADE: ENCERRAR TURMA
// ==================================================================================

async function profEncerrarTurma(idMateria) {
    if (!confirm('ATENÇÃO: Deseja realmente encerrar esta turma?\n\nIsso calculará a média final de todos os alunos e definirá a situação (Aprovado/Reprovado). As notas não poderão ser alteradas depois.')) {
        return;
    }

    try {
        // PUT /matriculas/encerrar/{idMateria}
        await fetchAPI(`/matriculas/encerrar/${idMateria}`, 'PUT');
        
        mostrarToast('Turma encerrada com sucesso!', 'success');
        profVerAlunos(idMateria, '...'); // Recarrega tela

    } catch (e) {
        console.error(e);
        mostrarToast('Erro ao encerrar turma.', 'error');
    }
}

window.profRenderTurmas = profRenderTurmas;
window.profVerAlunos = profVerAlunos; // Essa é a função principal do Diário
window.profSalvarNota = profSalvarNota; // Caso precise ser acessado via onchange no HTML
window.profAbrirModalConfiguracao = profAbrirModalConfiguracao; // Se você tiver essa função
window.profEncerrarTurma = profEncerrarTurma;