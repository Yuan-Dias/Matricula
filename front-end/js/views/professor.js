// professor.js

// --- PERFIL DO PROFESSOR (SEGURANÇA E DADOS) ---
async function profRenderPerfil() {
    atualizarMenuAtivo('Meu Perfil');
    const me = getUser();
    const inicial = me.nome ? me.nome.charAt(0).toUpperCase() : 'P';

    const appContent = document.getElementById('appContent');
    if (!appContent) return;

    appContent.innerHTML = `
        <div class="row justify-content-center fade-in">
            <div class="col-md-8">
                <div class="card border-0 shadow-sm rounded-3 mb-4">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center mb-3">
                            <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                                 style="width: 65px; height: 65px; font-size: 1.6rem; font-weight: 700;">
                                ${inicial}
                            </div>
                            <div class="ms-3">
                                <h4 class="fw-bold mb-0">${me.nome}</h4>
                                <span class="badge bg-light text-primary border border-primary-subtle">Corpo Docente</span>
                            </div>
                        </div>
                        <hr class="text-muted opacity-25">
                        <div class="row g-3">
                            <div class="col-sm-12">
                                <label class="text-muted small fw-bold text-uppercase">Usuário / Email</label>
                                <p class="mb-0 fw-medium">${me.login}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm rounded-3">
                    <div class="card-header bg-white p-4 border-bottom d-flex align-items-center">
                        <i class="fas fa-shield-alt text-warning me-3 fs-4"></i>
                        <h5 class="fw-bold mb-0">Segurança da Conta</h5>
                    </div>
                    <div class="card-body p-4">
                        <form onsubmit="event.preventDefault(); profSalvarSenha(${me.id})">
                            <p class="text-muted small mb-4">Mantenha sua conta segura atualizando sua senha periodicamente.</p>
                            
                            <div class="mb-3">
                                <label class="form-label text-muted small fw-bold">NOVA SENHA</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-lock text-muted"></i></span>
                                    <input type="password" id="pSenhaNova" class="form-control border-start-0" placeholder="Mínimo 4 caracteres" required>
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
                                <i class="fas fa-save me-2"></i>Salvar Nova Senha
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;
}

// Lógica de atualização de senha para o Professor
async function profSalvarSenha(idUsuario) {
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
            tipo: 'PROFESSOR', 
            senha: s1
            // CPF não enviado para evitar sobrescrever com vazio se o backend não esperar
        });
        
        mostrarToast("Sua senha foi alterada com sucesso!");
        
        // Limpa os campos
        document.getElementById('pSenhaNova').value = "";
        document.getElementById('pSenhaConf').value = "";
        
        setTimeout(() => profRenderHome(), 2000);

    } catch(e) { 
        mostrarToast("Erro ao atualizar senha. Tente novamente.", "danger");
    }
}

// Funções Utilitárias de Notificação
function mostrarToast(mensagem, tipo = 'success') {
    const container = document.getElementById('toastContainer');
    const id = 'toast-' + Date.now();
    const icone = tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const cor = tipo === 'success' ? 'bg-success' : 'bg-danger';

    const toastHTML = `
        <div id="${id}" class="toast align-items-center text-white ${cor} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas ${icone} me-2"></i> ${mensagem}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>`;
    
    container.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(id);
    const bsToast = new bootstrap.Toast(toastElement, { delay: 3000 });
    bsToast.show();

    // Remove do DOM após sumir
    toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
}

function carregarProfessor() {
    if (window.pageTitle) window.pageTitle.innerText = "Área do Professor";
    
    const elMenu = document.getElementById("sidebar-menu");
    if (elMenu) {
        elMenu.innerHTML = `
            <a href="#" onclick="profRenderHome()" class="list-group-item list-group-item-action active">
                <i class="fas fa-home me-2"></i>Início
            </a>
            <a href="#" onclick="profRenderTurmas()" class="list-group-item list-group-item-action">
                <i class="fas fa-chalkboard-teacher me-2"></i>Minhas Turmas
            </a>
        `;
    }
    profRenderHome();
}

async function profRenderHome() {

    const appContent = document.getElementById('appContent');
    if (!appContent) return;

    const user = getUser();
    const materias = await fetchAPI('/materias');
    const minhas = materias.filter(m => m.nomeProfessor === user.nome);

    let html = `
        <div class="p-5 mb-4 bg-white rounded-3 shadow-sm border border-light">
            <div class="container-fluid py-3">
                <h1 class="display-5 fw-bold text-primary">Olá, Prof. ${user.nome.split(' ')[0]}!</h1>
                <p class="col-md-8 fs-4 text-muted">Bem-vindo ao Portal SGA. Você possui <strong>${minhas.length}</strong> matérias sob sua responsabilidade.</p>
                <button class="btn btn-primary btn-lg mt-3 shadow-sm" type="button" onclick="profRenderTurmas()">
                    <i class="fas fa-list me-2"></i>Acessar Diário de Classe
                </button>
            </div>
        </div>
    `;
    appContent.innerHTML = html;
    atualizarMenuAtivo("Início");
}

async function profRenderTurmas() {
    const user = getUser();
    const todasMaterias = await fetchAPI('/materias');
    const minhasMaterias = todasMaterias.filter(m => m.nomeProfessor === user.nome);

    const appContent = document.getElementById('appContent');
    if (!appContent) return;

    if (minhasMaterias.length === 0) {
        appContent.innerHTML = `
            <div class="alert alert-info border-0 shadow-sm d-flex align-items-center">
                <i class="fas fa-info-circle fs-4 me-3"></i>
                Você não está vinculado a nenhuma matéria no momento.
            </div>`;
        return;
    }

    let html = `<h3 class="mb-4 fw-bold"><i class="fas fa-chalkboard me-2 text-primary"></i>Minhas Matérias</h3><div class="row">`;
    minhasMaterias.forEach(m => {
        html += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card card-stats h-100 border-0 shadow-sm">
                    <div class="card-header bg-primary text-white fw-bold py-3">${m.nomeCurso || 'Curso'}</div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold text-dark">${m.nome}</h5>
                        <p class="card-text text-muted flex-grow-1 small">${m.descricao || 'Sem descrição.'}</p>
                        <button class="btn btn-outline-primary w-100 mt-3 fw-bold" onclick="profVerAlunos(${m.id}, '${m.nome}')">
                            <i class="fas fa-user-graduate me-2"></i>Diário de Classe
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    html += `</div>`;
    appContent.innerHTML = html;
    atualizarMenuAtivo("Minhas Turmas");
}

async function profVerAlunos(idMateria, nomeMateria) {
    try {
        const [materia, avaliacoes, matriculas] = await Promise.all([
            fetchAPI(`/materias/${idMateria}`),
            fetchAPI(`/materias/${idMateria}/avaliacoes`), 
            fetchAPI('/matriculas')
        ]);
        
        const isFinalizada = materia.encerrada === true;
        const alunosDaTurma = matriculas.filter(mat => mat.idMateria == idMateria);
        const appContent = document.getElementById('appContent');
        if (!appContent) return;

        const configs = avaliacoes || []; 
        let tableHeader = `
            <tr>
                <th class="ps-4">Aluno</th>
                ${configs.map(av => `<th class="text-center small">${av.descricaoNota || av.nome}<br>(P${av.peso})</th>`).join('') || '<th class="text-center">Nota Única</th>'}
                <th class="text-center bg-light border-start">Média</th>
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
                
                // Contagem de notas preenchidas
                const notasPreenchidas = configs.filter(av => mapaNotas[av.id] !== undefined && mapaNotas[av.id] !== null).length;
                const temTodasAsNotas = configs.length > 0 ? notasPreenchidas === configs.length : (a.mediaFinal !== undefined);

                let colunasNotas = configs.length > 0 
                    ? configs.map(av => {
                        const valor = mapaNotas[av.id];
                        return `<td class="text-center text-dark">${(valor !== undefined && valor !== null) ? Number(valor).toFixed(1) : '-'}</td>`;
                    }).join('')
                    : `<td class="text-center text-dark">${(a.mediaFinal || 0).toFixed(1)}</td>`;

                let statusBadge = '';
                const media = a.mediaFinal || 0;

                // --- REGRA: STATUS CURSANDO SE FALTAR NOTA ---
                if (!temTodasAsNotas) {
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
                                onclick='profLancarNota(${a.id}, "${a.nomeAluno}", decodeURIComponent("${notasStr}"), decodeURIComponent("${avStr}"))'>
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
                        ${isFinalizada ? 'ENCERRADA (NOTAS TRAVADAS)' : 'EM ANDAMENTO'}
                    </span>
                </div>
                <div>
                    ${!isFinalizada ? `
                        <button class="btn btn-sm btn-outline-primary me-2 fw-bold" onclick="profConfigurarAvaliacoes(${idMateria}, '${nomeMateria}')">Configurar Critérios</button>
                        <button class="btn btn-sm btn-danger me-2 fw-bold" onclick="profFinalizarMateria(${idMateria}, '${nomeMateria}')">
                            <i class="fas fa-check-double me-1"></i> Finalizar Matéria
                        </button>
                    ` : `
                        <span class="text-muted small me-3"><i class="fas fa-info-circle"></i> Esta matéria foi concluída.</span>
                    `}
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
        mostrarToast("Erro ao carregar diário.", "danger");
    }
}

async function profFinalizarMateria(idMateria, nomeMateria) {
    try {
        const [avaliacoes, matriculas] = await Promise.all([
            fetchAPI(`/materias/${idMateria}/avaliacoes`),
            fetchAPI('/matriculas')
        ]);

        const alunosDaTurma = matriculas.filter(mat => mat.idMateria == idMateria);
        
        const totalCriterios = (avaliacoes && avaliacoes.length > 0) ? avaliacoes.length : 1;

        const pendentes = alunosDaTurma.filter(a => {
            const notasLancadas = Array.isArray(a.notas) 
                ? a.notas.filter(n => n.valor !== null && n.valor !== undefined).length 
                : (a.mediaFinal !== null && a.mediaFinal !== undefined ? 1 : 0);
            
            return notasLancadas < totalCriterios;
        });

        if (pendentes.length > 0) {
            return mostrarToast(`Não é possível finalizar: ${pendentes.length} aluno(s) com notas pendentes.`, "danger");
        }

        if (!confirm(`Deseja realmente FINALIZAR a matéria "${nomeMateria}"?\n\nAs notas serão travadas e o status final será gerado para os alunos.`)) return;

        await fetchAPI(`/materias/${idMateria}/encerrar`, 'PUT');

        mostrarToast("Matéria finalizada com sucesso!", "success");
        
        profVerAlunos(idMateria, nomeMateria);

    } catch (e) {
        console.error(e);
        mostrarToast(e.message || "Erro ao finalizar matéria.", "danger");
    }
}

async function profConfigurarAvaliacoes(idMateria, nomeMateria) {
    try {
        const configs = await fetchAPI(`/materias/${idMateria}/avaliacoes`) || [];

        let inputsHtml = configs.map((av, index) => 
            gerarHtmlLinhaAvaliacao(index, av.id, av.nome || av.descricaoNota, av.peso)
        ).join('');

        const modalHTML = `
        <div class="modal fade" id="modalConfigCriterios" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-dark text-white">
                        <h5 class="modal-title">Critérios: ${nomeMateria}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="text-muted small">
                            <i class="fas fa-info-circle me-1"></i> Arraste os itens pela barrinha lateral para reordenar.<br>
                            O peso máximo permitido por avaliação é <strong>10</strong>.
                        </p>
                        
                        <div id="containerAvaliacoes" class="list-group list-group-flush">
                            ${inputsHtml}
                        </div>
                        
                        <button type="button" class="btn btn-sm btn-outline-primary mt-3 w-100 dashed-border" id="btnAddCriterio">
                            <i class="fas fa-plus me-1"></i> Adicionar Avaliação
                        </button>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="profSalvarConfiguracao(${idMateria})">Salvar Configuração</button>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modalEl = document.getElementById('modalConfigCriterios');
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();

        iniciarDragAndDrop();

        document.getElementById('btnAddCriterio').onclick = () => {
            const container = document.getElementById('containerAvaliacoes');
            const idTemp = Date.now();
            const novaLinha = gerarHtmlLinhaAvaliacao(idTemp, '', '', 1); // Peso padrão 1
            container.insertAdjacentHTML('beforeend', novaLinha);
            
            iniciarDragAndDrop();
        };

        modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());

    } catch (e) {
        console.error(e);
        mostrarToast("Erro ao carregar configurações.", "danger");
    }
}

function gerarHtmlLinhaAvaliacao(index, id, nome, peso) {
    const pesoValue = (peso !== null && peso !== undefined) ? peso : 1;
    
    return `
    <div class="list-group-item d-flex align-items-center p-2 mb-1 border rounded draggable-item bg-white" 
         draggable="true" id="row-av-${index}">
        
        <div class="drag-handle text-muted me-3" style="cursor: grab; padding: 5px;">
             
            <i class="fas fa-grip-vertical fa-lg"></i>
        </div>

        <input type="hidden" class="av-id" value="${id || ''}">
        
        <div class="flex-grow-1 me-2">
            <input type="text" class="form-control av-nome form-control-sm" 
                   placeholder="Nome (ex: Prova 1)" value="${nome || ''}">
        </div>
        
        <div style="width: 80px;">
            <input type="number" class="form-control av-peso form-control-sm text-center" 
                   placeholder="Peso" value="${pesoValue}" min="0" max="10" step="0.1">
        </div>
        
        <button class="btn btn-link text-danger ms-2" type="button" 
                onclick="this.closest('.draggable-item').remove()">
            <i class="fas fa-trash-alt"></i>
        </button>
    </div>`;
}

function iniciarDragAndDrop() {
    const container = document.getElementById('containerAvaliacoes');
    const items = container.querySelectorAll('.draggable-item');

    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            item.classList.add('opacity-50', 'border-primary'); 
            e.dataTransfer.setData('text/plain', item.id);
            window.draggedItem = item; 
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('opacity-50', 'border-primary');
            window.draggedItem = null;
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dragged = window.draggedItem;
            if (dragged && dragged !== item) {
                const bounding = item.getBoundingClientRect();
                const offset = bounding.y + (bounding.height / 2);
                
                if (e.clientY - offset > 0) {
                    item.after(dragged);
                } else {
                    item.before(dragged);
                }
            }
        });
    });
}

async function profSalvarConfiguracao(idMateria) {
    const container = document.getElementById('containerAvaliacoes');
    const rows = container.querySelectorAll('.draggable-item'); 
    const novasAvaliacoes = [];
    let erroValidacao = null;
    let somaPesos = 0;

    rows.forEach((row) => {
        if (erroValidacao) return;

        const idExistente = row.querySelector('.av-id').value;
        const nomeInput = row.querySelector('.av-nome'); 
        const pesoInput = row.querySelector('.av-peso');
        
        if (nomeInput && pesoInput) {
            const nome = nomeInput.value.trim();
            let peso = parseFloat(pesoInput.value);

            if (isNaN(peso)) peso = 0;

            if (peso > 10) {
                erroValidacao = `O peso da avaliação "${nome || 'Sem nome'}" não pode ser maior que 10.`;
                return;
            }

            if (peso < 0) {
                erroValidacao = `O peso não pode ser negativo.`;
                return;
            }

            if (nome !== "") {
                novasAvaliacoes.push({ 
                    id: idExistente ? parseInt(idExistente) : null, 
                    descricaoNota: nome,
                    peso: peso 
                });
                
                somaPesos += peso;
            }
        }
    });

    if (erroValidacao) {
        mostrarToast(erroValidacao, "danger");
        return;
    }

    if (Math.abs(somaPesos - 10) > 0.01) {
        mostrarToast(`A soma dos pesos deve ser exatamente 10. Soma atual: ${somaPesos.toFixed(1)}`, "danger");
        return;
    }

    try {
        await fetchAPI(`/materias/${idMateria}/avaliacoes`, 'PUT', novasAvaliacoes);

        mostrarToast("Critérios de avaliação atualizados!", "success");
        
        const modalEl = document.getElementById('modalConfigCriterios');
        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        
        const tituloEl = document.querySelector('h5.modal-title');
        const nomeMat = tituloEl ? tituloEl.innerText.replace('Critérios: ', '') : 'Matéria';
        
        setTimeout(() => profVerAlunos(idMateria, nomeMat), 500);

    } catch (e) {
        mostrarToast("Erro ao salvar configuração.", "danger");
        console.error(e);
    }
}

async function profLancarNota(idMatricula, nomeAluno, dadosNotasJson, configMateriaJson) {
    const dadosNotas = typeof dadosNotasJson === 'string' ? JSON.parse(dadosNotasJson || '{}') : (dadosNotasJson || {});
    const configMateria = typeof configMateriaJson === 'string' ? JSON.parse(configMateriaJson || '[]') : (configMateriaJson || []);
    const modoComplexo = configMateria.length > 0;

    let bodyInputs = modoComplexo ? configMateria.map(av => {
        const notaAtual = dadosNotas[av.id] ?? '';
        return `
            <div class="mb-3">
                <label class="form-label fw-bold small text-uppercase text-muted">
                    ${av.descricaoNota || av.nome} <span class="text-primary">(Peso ${av.peso})</span>
                </label>
                <input type="number" class="form-control nota-input" 
                       data-id-config="${av.id}" value="${notaAtual}" 
                       min="0" max="10" step="0.1" placeholder="0.0 a 10.0">
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
                <div class="modal-body p-4"><form id="formNotas">${bodyInputs}</form></div>
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
            if (modoComplexo) {
                const inputs = modalEl.querySelectorAll('.nota-input');
                for (const input of inputs) {
                    if (input.value === '') continue;
                    const notaNumerica = parseFloat(input.value);
                    const idConfig = input.getAttribute('data-id-config');

                    await fetchAPI('/matriculas/notas', 'PUT', {
                        idMatricula: parseInt(idMatricula),
                        idConfiguracao: parseInt(idConfig), // Conforme Schema DadosLancamentoNota
                        nota: notaNumerica 
                    });
                }
            } else {
                const valUnica = parseFloat(document.getElementById('inputNotaUnica').value);
                await fetchAPI('/matriculas/notas', 'PUT', {
                    idMatricula: parseInt(idMatricula),
                    nota: valUnica 
                });
            }

            bsModal.hide();
            mostrarToast("Notas atualizadas!", "success");
            
            const matId = document.querySelector('button[onclick^="profConfigurarAvaliacoes"]')?.getAttribute('onclick').match(/\d+/)[0];
            const matNome = document.querySelector('h4 span.text-primary')?.innerText || "";
            if(matId) setTimeout(() => profVerAlunos(matId, matNome), 300);

        } catch (error) {
            mostrarToast(error.message || "Erro ao salvar.", "danger");
        }
    };
}