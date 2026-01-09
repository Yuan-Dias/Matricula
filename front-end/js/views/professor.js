// professor.js

// --- PERFIL DO PROFESSOR (SEGURANÇA E DADOS) ---
async function profRenderPerfil() {
    atualizarMenuAtivo('Meu Perfil'); // Certifique-se que este nome coincide com o link se adicionar ao menu
    const me = getUser();
    const inicial = me.nome ? me.nome.charAt(0).toUpperCase() : 'P';

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
    window.appContent.innerHTML = html;
    atualizarMenuAtivo("Início");
}

async function profRenderTurmas() {
    const user = getUser();
    const todasMaterias = await fetchAPI('/materias');
    const minhasMaterias = todasMaterias.filter(m => m.nomeProfessor === user.nome);

    if (minhasMaterias.length === 0) {
        window.appContent.innerHTML = `
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
    window.appContent.innerHTML = html;
    atualizarMenuAtivo("Minhas Turmas");
}

async function profVerAlunos(idMateria, nomeMateria) {
    const matriculas = await fetchAPI('/matriculas');
    const alunosDaTurma = matriculas.filter(mat => mat.nomeMateria === nomeMateria);

    let html = `
        <div class="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border-start border-primary border-4">
            <h4 class="m-0 fw-bold text-dark">Matéria: <span class="text-primary">${nomeMateria}</span></h4>
            <button class="btn btn-sm btn-outline-secondary px-3" onclick="profRenderTurmas()">
                <i class="fas fa-arrow-left me-1"></i> Voltar
            </button>
        </div>
        <div class="table-container shadow-sm border-0">
            <table class="table table-hover mb-0">
                <thead class="table-light">
                    <tr>
                        <th class="ps-4">Nome do Aluno</th>
                        <th class="text-center">Nota</th>
                        <th class="text-end pe-4">Ação</th>
                    </tr>
                </thead>
                <tbody>
                    ${alunosDaTurma.length ? alunosDaTurma.map(a => `
                        <tr>
                            <td class="align-middle ps-4 fw-medium">${a.nomeAluno}</td>
                            <td class="text-center align-middle">
                                <span class="badge ${a.nota >= 6 ? 'bg-success' : 'bg-danger'} rounded-pill px-3">
                                    ${a.nota.toFixed(1)}
                                </span>
                            </td>
                            <td class="text-end pe-4">
                                <button class="btn btn-sm btn-info text-white rounded-pill px-3 shadow-sm" onclick="profLancarNota(${a.id}, '${a.nomeAluno}', ${a.nota})">
                                    <i class="fas fa-edit me-1"></i> Alterar
                                </button>
                            </td>
                        </tr>
                    `).join('') : '<tr><td colspan="3" class="text-center py-5 text-muted">Nenhum aluno matriculado.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
    window.appContent.innerHTML = html;
}

// Lógica de Notas substituindo prompt/alert por Modal e Toasts
async function profLancarNota(idMatricula, nomeAluno, notaAtual) {
    // Criamos um modal dinâmico para entrada de nota
    const modalHTML = `
    <div class="modal fade" id="modalLancarNota" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title fw-bold">Lançar Nota - ${nomeAluno}</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body p-4">
                    <label class="form-label fw-bold">Nova Nota (0 a 10)</label>
                    <input type="number" id="novaNotaInput" class="form-control form-control-lg" 
                           step="0.1" min="0" max="10" value="${notaAtual}">
                    <div class="form-text mt-2 text-muted small">Use ponto para decimais (ex: 7.5).</div>
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary px-4" id="btnSalvarNota">Salvar Alteração</button>
                </div>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modalEl = document.getElementById('modalLancarNota');
    const bsModal = new bootstrap.Modal(modalEl);
    bsModal.show();

    document.getElementById('btnSalvarNota').onclick = async () => {
        const novaNota = parseFloat(document.getElementById('novaNotaInput').value);

        if (isNaN(novaNota) || novaNota < 0 || novaNota > 10) {
            mostrarToast("Por favor, digite uma nota válida entre 0 e 10.", "danger");
            return;
        }

        try {
            await fetchAPI('/matriculas/notas', 'PUT', {
                idMatricula: idMatricula,
                nota: novaNota
            });
            
            bsModal.hide();
            mostrarToast(`Nota de ${nomeAluno} atualizada com sucesso!`, "success");
            
            // Recarrega a listagem atual sem refresh de página
            const materiaNomeAtiva = document.querySelector('h4 span.text-primary').innerText;
            profVerAlunos(null, materiaNomeAtiva); 

        } catch (error) {
            mostrarToast("Erro ao salvar nota: " + error.message, "danger");
        }
    };

    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
}