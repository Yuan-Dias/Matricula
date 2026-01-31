// Renderização da tabela principal
async function instRenderUsuarios() {
    atualizarMenuAtivo('Usuários');
    const target = document.getElementById('appContent'); // Certifique-se que o ID está correto no seu HTML
    if (!target) return;
    
    // Renderiza a estrutura
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
    `;
    
    // Chama o filtro para carregar os dados iniciais
    instFiltrarUsuarios();
}

// Lógica de busca e preenchimento da tabela
async function instFiltrarUsuarios() {
    const termo = document.getElementById('buscaInput')?.value || "";
    const tipoFiltro = document.getElementById('filtroTipoInput')?.value || ""; // Pega o valor do Select
    
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
            atualizarIconesHeaders();
        }

        if(usuariosFiltrados.length === 0) {
            container.innerHTML = `<tr><td colspan="4" class="text-center p-5 text-muted">Nenhum usuário encontrado</td></tr>`;
            return;
        }

        container.innerHTML = usuariosFiltrados.map(u => {
            let avatarColor = u.tipo === 'INSTITUICAO' ? 'bg-dark' : (u.tipo === 'ALUNO' ? 'bg-info' : 'bg-primary');
            const isRootUser = u.id === 1;
            const deleteButtonClass = isRootUser ? 'btn-action-disabled' : 'btn-action-delete';
            const deleteButtonAttr = isRootUser ? 'disabled style="cursor: not-allowed; opacity: 0.5;"' : `onclick="instDeletarUsuario(${u.id})"`;

            let cpfFormatado = '';
            if (u.cpf) {
                cpfFormatado = u.cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            }
            const cpfDisplay = cpfFormatado ? `<span class="small text-muted ms-2 border-start ps-2"><i class="far fa-id-card me-1"></i>${cpfFormatado}</span>` : '';

            return `
            <tr>
                <td class="ps-4 py-3">
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle ${avatarColor} text-white me-3 flex-shrink-0">${getIniciais(u.nome)}</div>
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
                <td><span class="badge bg-soft-green rounded-pill px-3">Ativo</span></td>
                <td class="text-end pe-4">
                    <div class="d-flex justify-content-end gap-2">
                        <button class="btn-action-icon btn-action-edit" title="Editar" onclick="instAbrirModalUsuario(${JSON.stringify(u).replace(/"/g, '&quot;')})"><i class="fas fa-pen"></i></button>
                        <button class="btn-action-icon ${deleteButtonClass}" title="Excluir" ${deleteButtonAttr}><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `}).join('');

    } catch(e) { 
        console.error(e);
        container.innerHTML = '<tr><td colspan="4" class="text-center text-danger p-4">Erro ao carregar dados.</td></tr>'; 
    }
}

// Funções de Formulário (Modal)
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
        senhaInput.placeholder = "Deixe em branco para manter a atual";
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
            if(feedback) feedback.innerText = "Este e-mail/login já está em uso.";
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
        if (tipo === 'ALUNO') {
            url = id ? `/alunos/${id}` : '/alunos';
            body.cpf = cpfInput.value.replace(/\D/g, ''); 
        } else {
            url = id ? `/usuarios/${id}` : '/usuarios';
        }

        await fetchAPI(url, id ? 'PUT' : 'POST', body);
        
        const modalEl = document.getElementById('modalUsuario');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if(modal) modal.hide();
        
        await instRenderUsuarios(); 
        mostrarToast("Usuário salvo com sucesso!");

    } catch(e) {
        console.error(e);
        mostrarToast("Erro ao salvar usuário.", 'error');
    }
}

function getStatusBadgePro(tipo) {
    const map = {
        'ADMIN': { class: 'bg-soft-dark text-dark', icon: 'fa-user-shield', label: 'Administrador' },
        'PROFESSOR': { class: 'bg-soft-blue', icon: 'fa-chalkboard-teacher', label: 'Professor' },
        'ALUNO': { class: 'bg-soft-orange', icon: 'fa-user-graduate', label: 'Aluno' }
    };
    const config = map[tipo] || { class: 'bg-light text-secondary', icon: 'fa-user', label: tipo };
    return `<span class="badge ${config.class} px-3 py-2 rounded-2 fw-normal border-0"><i class="fas ${config.icon} me-1 opacity-75"></i> ${config.label}</span>`;
}

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
        mostrarToast("Operação negada: O usuário principal do sistema não pode ser excluído.", "error");
        return;
    }

    try {
        const todosUsuarios = await fetchAPI('/usuarios');
        const usuarioAlvo = todosUsuarios.find(u => u.id === id);

        if (!usuarioAlvo) {
            mostrarToast("Usuário não encontrado.", "error");
            return;
        }

        if (usuarioAlvo.tipo === 'ADMIN') {
            const totalAdmins = todosUsuarios.filter(u => u.tipo === 'ADMIN').length;
            if (totalAdmins <= 1) {
                mostrarToast("Ação bloqueada: O sistema deve ter pelo menos um Administrador.", "warning");
                return;
            }
        }

        // --- PREPARAÇÃO DO MODAL ---
        
        usuarioIdParaExcluir = id;

        const msgElement = document.getElementById('textoConfirmacaoExclusao');
        if (msgElement) {
            msgElement.innerHTML = `Tem certeza que deseja remover o usuário <strong>${usuarioAlvo.nome}</strong>?`;
        }

        const modalEl = document.getElementById('modalConfirmarExclusao');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

    } catch(e) {
        console.error(e);
        mostrarToast("Erro ao verificar dados do usuário.", 'error');
    }
}

async function instConfirmarExclusao() {
    if (!usuarioIdParaExcluir) return;

    try {
        const modalEl = document.getElementById('modalConfirmarExclusao');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
            modalInstance.hide();
        }

        await fetchAPI(`/usuarios/${usuarioIdParaExcluir}`, 'DELETE');
        
        await instRenderUsuarios();
        
        mostrarToast("Usuário removido com sucesso!");

    } catch(e) {
        console.error(e);
        mostrarToast("Não foi possível excluir. Verifique se o usuário possui vínculos (aulas, notas, etc).", 'error');
    } finally {
        usuarioIdParaExcluir = null;
    }
}