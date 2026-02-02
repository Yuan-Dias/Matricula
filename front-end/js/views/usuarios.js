
// RENDERIZAÇÃO E LISTAGEM
async function instRenderUsuarios() {
    atualizarMenuAtivo('Usuários');
    const target = document.getElementById('appContent');
    if (!target) return;
    
    target.innerHTML = `
        <div class="fade-in">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h3 class="fw-bold text-dark mb-1">Gestão de Usuários</h3>
                    <p class="text-muted small mb-0">Administre professores, alunos e administradores do sistema.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-primary d-flex align-items-center px-4 shadow-sm" onclick="instAbrirModalUsuario()">
                        <i class="fas fa-plus me-2"></i> Novo Usuário
                    </button>
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-header bg-white border-bottom border-light p-3">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="input-group input-group-solid">
                                <span class="input-group-text bg-light border-0 ps-3"><i class="fas fa-search text-muted"></i></span>
                                <input type="text" id="buscaInput" class="form-control bg-light border-0 shadow-none" 
                                       placeholder="Buscar nome, login..." oninput="instFiltrarUsuarios()">
                            </div>
                        </div>

                        <div class="col-md-3">
                            <select id="filtroTipoInput" class="form-select bg-light border-0 shadow-none text-muted fw-bold" onchange="instFiltrarUsuarios()">
                                <option value="">Todos os Perfis</option>
                                <option value="ALUNO">Alunos</option>
                                <option value="PROFESSOR">Professores</option>
                                <option value="INSTITUICAO">Administradores</option>
                            </select>
                        </div>

                        <div class="col-md-5 text-md-end">
                            <button class="btn btn-light btn-sm text-muted" onclick="instRenderUsuarios()">
                                <i class="fas fa-sync-alt me-1"></i> Atualizar
                            </button>
                        </div>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0 custom-table">
                        <thead class="bg-light text-uppercase small fw-bold text-muted">
                            <tr>
                                <th class="ps-4 py-3 cursor-pointer user-select-none" style="width: 40%; cursor: pointer;" onclick="ordenarERender('usuarios', 'nome')">
                                    Usuário ${getIconeOrdenacao('nome')}
                                </th>
                                <th class="py-3 cursor-pointer user-select-none" style="width: 20%; cursor: pointer;" onclick="ordenarERender('usuarios', 'tipo')">
                                    Perfil ${getIconeOrdenacao('tipo')}
                                </th>
                                <th class="py-3" style="width: 20%;">Status</th>
                                <th class="text-end pe-4 py-3" style="width: 20%;">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="usuariosTableBody">
                            <tr><td colspan="4" class="text-center p-5 text-muted"><i class="fas fa-circle-notch fa-spin me-2"></i> Carregando registros...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="modal fade" id="modalUsuario" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-white border-bottom-0 pb-0">
                        <h5 class="modal-title fw-bold text-primary" id="modalUsuarioTitle">Novo Usuário</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <form id="formUsuario" class="needs-validation" novalidate>
                            <input type="hidden" id="usuarioId">
                            
                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Nome Completo</label>
                                <input type="text" class="form-control" id="usuarioNome" required>
                            </div>

                            <div class="row g-3 mb-3">
                                <div class="col-md-6">
                                    <label class="form-label small fw-bold text-muted">Perfil</label>
                                    <select class="form-select" id="usuarioTipo" required onchange="instToggleCpf()">
                                        <option value="" selected disabled>Selecione...</option>
                                        <option value="ALUNO">Aluno</option>
                                        <option value="PROFESSOR">Professor</option>
                                        <option value="INSTITUICAO">Administrador</option>
                                    </select>
                                </div>
                                <div class="col-md-6 d-none" id="divCpf">
                                    <label class="form-label small fw-bold text-muted">CPF</label>
                                    <input type="text" class="form-control" id="usuarioCpf" placeholder="000.000.000-00" oninput="instMascaraCPF(this)">
                                    <div class="invalid-feedback">CPF inválido ou já cadastrado.</div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Login / Email</label>
                                <input type="text" class="form-control" id="usuarioLogin" required>
                                <div class="invalid-feedback">Login já existe.</div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label small fw-bold text-muted">Senha</label>
                                <div class="input-group">
                                    <input type="password" class="form-control" id="usuarioSenha">
                                    <button class="btn btn-outline-secondary" type="button" onclick="instToggleSenha()">
                                        <i class="fas fa-eye" id="iconSenha"></i>
                                    </button>
                                </div>
                                <div class="form-text text-muted small mt-1">
                                    <span id="helpSenha">Mínimo 6 caracteres.</span>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer border-top-0 pt-0 px-4 pb-4">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary px-4" onclick="instSalvarUsuario()">
                            <i class="fas fa-save me-2"></i> Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    instFiltrarUsuarios();
}

async function instFiltrarUsuarios() {
    const termo = document.getElementById('buscaInput')?.value || "";
    const tipoFiltro = document.getElementById('filtroTipoInput')?.value || ""; 
    
    const container = document.getElementById('usuariosTableBody');
    if(!container) return;

    try {
        const [listaUsuarios, listaAlunos] = await Promise.all([
            fetchAPI('/usuarios'),
            fetchAPI('/alunos')
        ]);
        
        let usuariosCompleto = listaUsuarios.map(usuario => {
            const alunoEncontrado = listaAlunos.find(a => a.id === usuario.id);
            return {
                ...usuario,
                cpf: alunoEncontrado ? alunoEncontrado.cpf : '' 
            };
        });

        if (tipoFiltro) {
            usuariosCompleto = usuariosCompleto.filter(u => u.tipo === tipoFiltro);
        }

        let usuariosFiltrados = filtrarDados(usuariosCompleto, termo, ['nome', 'login', 'cpf']);

        if(typeof ordenacaoAtual !== 'undefined' && ordenacaoAtual.coluna) {
            usuariosFiltrados = ordenarDados(usuariosFiltrados, ordenacaoAtual.coluna, ordenacaoAtual.ascendente);
        }

        if(usuariosFiltrados.length === 0) {
            container.innerHTML = `<tr><td colspan="4" class="text-center p-5 text-muted">Nenhum usuário encontrado</td></tr>`;
            return;
        }

        container.innerHTML = usuariosFiltrados.map(u => {
            let avatarColor = u.tipo === 'INSTITUICAO' ? 'bg-dark' : (u.tipo === 'ALUNO' ? 'bg-info' : 'bg-primary');
            const isRootUser = u.id === 1;
            
            const deleteButtonClass = isRootUser ? 'text-muted opacity-50 cursor-not-allowed' : 'text-danger hover-scale';
            const deleteButtonAction = isRootUser ? '' : `onclick="instDeletarUsuario(${u.id})"`;
            const deleteTitle = isRootUser ? 'Usuário Root não pode ser excluído' : 'Excluir';

            let cpfFormatado = '';
            if (u.cpf) {
                cpfFormatado = u.cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            }
            const cpfDisplay = cpfFormatado ? `<span class="small text-muted ms-2 border-start ps-2"><i class="far fa-id-card me-1"></i>${cpfFormatado}</span>` : '';

            return `
            <tr>
                <td class="ps-4 py-3">
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle ${avatarColor} text-white me-3 flex-shrink-0 d-flex justify-content-center align-items-center rounded-circle" style="width:40px; height:40px;">
                            ${getIniciais(u.nome)}
                        </div>
                        <div>
                            <div class="fw-bold text-dark">${u.nome}</div>
                            <div class="small text-muted d-flex align-items-center">
                                <span><i class="far fa-envelope me-1"></i> ${u.login}</span>
                                ${cpfDisplay} 
                            </div>
                        </div>
                    </div>
                </td>
                <td>${getStatusBadge(u.tipo)}</td>
                <td><span class="badge bg-success-subtle text-success rounded-pill px-3 border border-success-subtle">Ativo</span></td>
                <td class="text-end pe-4">
                    <div class="d-flex justify-content-end gap-3">
                        <button class="btn btn-sm btn-link text-decoration-none text-muted hover-scale p-0" title="Editar" 
                                onclick="instAbrirModalUsuario(${JSON.stringify(u).replace(/"/g, '&quot;')})">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="btn btn-sm btn-link text-decoration-none p-0 ${deleteButtonClass}" 
                                title="${deleteTitle}" ${deleteButtonAction}>
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `}).join('');

    } catch(e) { 
        console.error(e);
        container.innerHTML = '<tr><td colspan="4" class="text-center text-danger p-4">Erro ao carregar dados da API.</td></tr>'; 
    }
}

// FUNÇÕES DE FORMULÁRIO (MODAL)

function instAbrirModalUsuario(dados = null) {
    const form = document.getElementById('formUsuario');
    if(form) {
        form.reset();
        form.classList.remove('was-validated');
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    }
    
    const idInput = document.getElementById('usuarioId');
    const title = document.getElementById('modalUsuarioTitle');
    const senhaInput = document.getElementById('usuarioSenha');
    const iconSenha = document.getElementById('iconSenha'); 
    const tipoSelect = document.getElementById('usuarioTipo');
    const helpSenha = document.getElementById('helpSenha');

    tipoSelect.onchange = instToggleCpf;

    if(senhaInput) senhaInput.type = 'password';
    if(iconSenha) {
        iconSenha.classList.remove('fa-eye-slash');
        iconSenha.classList.add('fa-eye');
    }

    if (dados) {
        title.innerText = "Editar Usuário";
        idInput.value = dados.id;
        document.getElementById('usuarioNome').value = dados.nome;
        document.getElementById('usuarioLogin').value = dados.login;
        tipoSelect.value = dados.tipo;
        
        senhaInput.required = false;
        senhaInput.placeholder = "Preencha apenas para alterar";
        if(helpSenha) helpSenha.innerText = "Deixe em branco para manter a senha atual.";
        
        tipoSelect.disabled = true;

        if (dados.tipo === 'ALUNO') {
            document.getElementById('divCpf').classList.remove('d-none');
            const cpfInput = document.getElementById('usuarioCpf');
            if(cpfInput) {
                cpfInput.value = dados.cpf || '';
                instMascaraCPF(cpfInput); 
            }
        } else {
            document.getElementById('divCpf').classList.add('d-none');
        }
    } else {
        title.innerText = "Cadastrar Novo Usuário";
        idInput.value = '';
        tipoSelect.disabled = false;
        senhaInput.required = true;
        senhaInput.placeholder = "";
        if(helpSenha) helpSenha.innerText = "Mínimo 6 caracteres.";
        instToggleCpf();
    }

    const modalElement = document.getElementById('modalUsuario');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

async function instSalvarUsuario() {
    const form = document.getElementById('formUsuario');
    const idField = document.getElementById('usuarioId');
    const id = idField?.value ? parseInt(idField.value) : null;
    const tipo = document.getElementById('usuarioTipo').value;
    const senhaInput = document.getElementById('usuarioSenha');
    const cpfInput = document.getElementById('usuarioCpf');
    const loginInput = document.getElementById('usuarioLogin');
    const nomeInput = document.getElementById('usuarioNome');

    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.classList.remove('was-validated');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const loginValue = loginInput.value.trim();

    try {
        const todosUsuarios = await fetchAPI('/usuarios');
        const loginDuplicado = todosUsuarios.find(u => u.login === loginValue && u.id !== id);

        if (loginDuplicado) {
            loginInput.classList.add('is-invalid');
            const feedback = loginInput.parentElement.querySelector('.invalid-feedback') || loginInput.nextElementSibling;
            if(feedback) feedback.innerText = "Este login já está em uso.";
            return;
        }

        if (tipo === 'ALUNO') {
            const cpfLimpo = cpfInput.value.replace(/\D/g, '');
            if (cpfLimpo.length !== 11) {
                cpfInput.classList.add('is-invalid');
                return;
            }
            const todosAlunos = await fetchAPI('/alunos');
            const cpfDuplicado = todosAlunos.find(a => a.cpf === cpfLimpo && a.id !== id);
            if (cpfDuplicado) {
                cpfInput.classList.add('is-invalid');
                const feedback = cpfInput.parentElement.querySelector('.invalid-feedback');
                if(feedback) feedback.innerText = `CPF já cadastrado para: ${cpfDuplicado.nome}`;
                return;
            }
        }

        const nomeFormatado = formatarNomeProprio(nomeInput.value);
        const body = { nome: nomeFormatado, login: loginValue, email: loginValue, tipo: tipo };

        if (id) body.id = id;
        if (senhaInput.value) body.senha = senhaInput.value;

        let url;
        let method = id ? 'PUT' : 'POST';

        if (tipo === 'ALUNO') {
            url = id ? `/alunos/${id}` : '/alunos';
            body.cpf = cpfInput.value.replace(/\D/g, ''); 
        } else {
            url = id ? `/usuarios/${id}` : '/usuarios';
        }

        await fetchAPI(url, method, body);
        
        const modalEl = document.getElementById('modalUsuario');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if(modal) modal.hide();
        
        await instRenderUsuarios(); 
        mostrarToast("Usuário salvo com sucesso!");

    } catch(e) {
        console.error(e);
        mostrarToast("Erro ao salvar usuário. Tente novamente.", 'danger');
    }
}

// AUXILIARES E ACTIONS

function instToggleCpf() {
    const tipo = document.getElementById('usuarioTipo').value;
    const divCpf = document.getElementById('divCpf');
    const cpfInput = document.getElementById('usuarioCpf');
    if (tipo === 'ALUNO') {
        divCpf.classList.remove('d-none');
        if(cpfInput) cpfInput.required = true;
    } else {
        divCpf.classList.add('d-none');
        if(cpfInput) { cpfInput.required = false; cpfInput.value = ''; }
    }
}

function instToggleSenha() {
    const senhaInput = document.getElementById('usuarioSenha');
    const iconSenha = document.getElementById('iconSenha');
    if (senhaInput.type === 'password') {
        senhaInput.type = 'text';
        iconSenha.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        senhaInput.type = 'password';
        iconSenha.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

async function instDeletarUsuario(id) {
    if (id === 1) {
        mostrarToast("Operação negada: O usuário principal (Root) não pode ser excluído.", "danger");
        return;
    }

    try {
        const todosUsuarios = await fetchAPI('/usuarios');
        const usuarioAlvo = todosUsuarios.find(u => u.id === id);

        if (!usuarioAlvo) {
            mostrarToast("Usuário não encontrado.", "danger");
            return;
        }

        if (usuarioAlvo.tipo === 'ADMIN' || usuarioAlvo.tipo === 'INSTITUICAO') {
            const totalAdmins = todosUsuarios.filter(u => u.tipo === 'ADMIN' || u.tipo === 'INSTITUICAO').length;
            if (totalAdmins <= 1) {
                mostrarToast("Ação bloqueada: O sistema deve ter pelo menos um Administrador.", "warning");
                return;
            }
        }

        mostrarModalConfirmacao(
            'Excluir Usuário', 
            `Tem certeza que deseja remover o usuário <strong>${usuarioAlvo.nome}</strong>? <br><small class="text-danger">Esta ação não pode ser desfeita.</small>`,
            async () => {
                try {
                    await fetchAPI(`/usuarios/${id}`, 'DELETE');
                    await instRenderUsuarios();
                    mostrarToast("Usuário removido com sucesso!");
                } catch(e) {
                    console.error(e);
                    mostrarToast("Não foi possível excluir. Verifique se o usuário possui vínculos (aulas, notas, etc).", 'danger');
                }
            },
            'danger'
        );

    } catch(e) {
        console.error(e);
        mostrarToast("Erro ao verificar dados do usuário.", 'danger');
    }
}