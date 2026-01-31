// ==========================================
// RENDERIZAÇÃO DA PÁGINA DE PERFIL (REVAMPED)
// ==========================================

async function instRenderPerfil() {
    atualizarMenuAtivo('Perfil');
    const target = document.getElementById('appContent');
    if (!target) return;

    // Recupera usuário do LocalStorage
    const usuarioLogadoStr = localStorage.getItem('usuarioLogado');
    const usuarioLogado = usuarioLogadoStr ? JSON.parse(usuarioLogadoStr) : { id: 1, nome: 'Usuário', tipo: 'GUEST' };

    target.innerHTML = `
        <div class="fade-in mw-1000 mx-auto" style="max-width: 1100px;">
            
            <div class="d-flex align-items-center justify-content-between mb-4">
                <div>
                    <h3 class="fw-bold text-dark mb-1">Minha Conta</h3>
                    <p class="text-muted small mb-0">Gerencie seus dados pessoais e preferências de segurança.</p>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-lg-4">
                    <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                        <div class="profile-cover-bg h-100px"></div>
                        
                        <div class="card-body text-center mt-n5 position-relative">
                            <div class="avatar-wrapper-xl mx-auto mb-3 border border-4 border-white rounded-circle shadow-sm">
                                <div id="perfilAvatarDisplay" class="avatar-circle-xl bg-primary text-white w-100 h-100 fs-1">
                                    ${getIniciais(usuarioLogado.nome)}
                                </div>
                            </div>
                            
                            <h5 class="fw-bold text-dark mb-1" id="perfilNomeDisplay">${usuarioLogado.nome}</h5>
                            <div class="mb-3" id="perfilBadgeDisplay">
                                ${getStatusBadgePro(usuarioLogado.tipo)}
                            </div>

                            <div class="d-flex justify-content-center gap-2 mb-4">
                                <div class="px-3 py-2 bg-soft-secondary rounded-3">
                                    <small class="d-block text-muted text-uppercase fw-bold" style="font-size: 0.65rem;">ID Usuário</small>
                                    <span class="fw-bold text-dark">#${String(usuarioLogado.id).padStart(4, '0')}</span>
                                </div>
                                <div class="px-3 py-2 bg-soft-success rounded-3">
                                    <small class="d-block text-muted text-uppercase fw-bold" style="font-size: 0.65rem;">Status</small>
                                    <span class="fw-bold text-success">Ativo</span>
                                </div>
                            </div>

                            <hr class="border-light">

                            <div class="text-start px-2">
                                <label class="small fw-bold text-muted text-uppercase mb-2">Detalhes de Acesso</label>
                                <div class="d-flex align-items-center mb-2 text-muted small">
                                    <i class="fas fa-calendar-alt me-3 text-primary opacity-50" style="width:16px"></i>
                                    <span>Cadastrado no sistema</span>
                                </div>
                                <div class="d-flex align-items-center mb-2 text-muted small">
                                    <i class="fas fa-shield-alt me-3 text-primary opacity-50" style="width:16px"></i>
                                    <span>Acesso: ${usuarioLogado.tipo}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-lg-8">
                    <div class="card border-0 shadow-sm rounded-4">
                        <div class="card-header bg-white border-bottom border-light p-4 d-flex justify-content-between align-items-center">
                            <h6 class="fw-bold m-0 text-primary"><i class="far fa-edit me-2"></i>Editar Informações</h6>
                        </div>
                        
                        <div class="card-body p-4">
                            <form id="formPerfil" novalidate onsubmit="event.preventDefault(); instSalvarPerfil(${usuarioLogado.id});">
                                
                                <h6 class="text-uppercase text-muted fw-bold small mb-3 letter-spacing-1">Dados Básicos</h6>
                                <div class="row g-4 mb-4">
                                    <div class="col-md-12">
                                        <label class="form-label small fw-bold text-secondary">Nome Completo</label>
                                        <div class="input-group input-group-solid-focus">
                                            <span class="input-group-text bg-light border-end-0"><i class="far fa-user text-muted"></i></span>
                                            <input type="text" class="form-control border-start-0 ps-0 bg-light" id="perfilNome" required minlength="3">
                                        </div>
                                    </div>
                                    
                                    <div class="col-md-6">
                                        <label class="form-label small fw-bold text-secondary">Login / E-mail</label>
                                        <div class="input-group input-group-solid-focus">
                                            <span class="input-group-text bg-light border-end-0"><i class="far fa-envelope text-muted"></i></span>
                                            <input type="text" class="form-control border-start-0 ps-0 bg-light" id="perfilLogin" required>
                                        </div>
                                    </div>

                                    <div class="col-md-6" id="divPerfilCpfWrapper">
                                        <label class="form-label small fw-bold text-secondary">CPF</label>
                                        <div class="input-group">
                                            <span class="input-group-text bg-soft-secondary border-end-0 border-0"><i class="far fa-id-card text-muted"></i></span>
                                            <input type="text" class="form-control border-0 bg-soft-secondary text-muted" id="perfilCpf" disabled value="---">
                                            <span class="input-group-text bg-soft-secondary border-0"><i class="fas fa-lock text-muted opacity-50 small"></i></span>
                                        </div>
                                    </div>
                                </div>

                                <hr class="border-light my-4">

                                <div class="d-flex align-items-center mb-3">
                                    <h6 class="text-uppercase text-muted fw-bold small mb-0 letter-spacing-1">Segurança</h6>
                                    <span class="badge bg-soft-warning text-warning ms-2 fw-normal">Opcional</span>
                                </div>

                                <div class="row g-4 mb-2">
                                    <div class="col-md-6">
                                        <label class="form-label small fw-bold text-secondary">Nova Senha</label>
                                        <div class="input-group input-group-solid-focus">
                                            <span class="input-group-text bg-light border-end-0"><i class="fas fa-key text-muted"></i></span>
                                            <input type="password" class="form-control border-start-0 border-end-0 ps-0 bg-light" id="perfilSenha" placeholder="••••••" autocomplete="new-password">
                                            <button class="btn btn-light border border-start-0" type="button" onclick="instToggleSenhaPerfil('perfilSenha', 'iconPerfilSenha')">
                                                <i class="far fa-eye text-muted" id="iconPerfilSenha"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label small fw-bold text-secondary">Confirmar Senha</label>
                                        <div class="input-group input-group-solid-focus">
                                            <span class="input-group-text bg-light border-end-0"><i class="fas fa-check-double text-muted"></i></span>
                                            <input type="password" class="form-control border-start-0 ps-0 bg-light" id="perfilConfirmarSenha" placeholder="••••••">
                                        </div>
                                        <div class="invalid-feedback">As senhas não conferem.</div>
                                    </div>
                                </div>
                                <div class="form-text text-muted mb-4 small">
                                    <i class="fas fa-info-circle me-1"></i> Deixe em branco se não desejar alterar sua senha atual.
                                </div>

                                <div class="d-flex justify-content-end gap-3 pt-3 border-top border-light">
                                    <button type="button" class="btn btn-white text-muted border px-4" onclick="instCarregarDadosPerfil(${usuarioLogado.id})">
                                        Cancelar
                                    </button>
                                    <button type="submit" id="btnSalvarPerfil" class="btn btn-primary px-4 shadow-sm btn-hover-lift">
                                        <span class="normal-state"><i class="fas fa-save me-2"></i> Salvar Alterações</span>
                                        <span class="loading-state d-none"><span class="spinner-border spinner-border-sm me-2"></span>Salvando...</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Carrega dados
    instCarregarDadosPerfil(usuarioLogado.id);
}

// ==========================================
// LÓGICA DE DADOS (CARREGAMENTO ROBUSTO)
// ==========================================

async function instCarregarDadosPerfil(id) {
    // Referências aos inputs
    const inputNome = document.getElementById('perfilNome');
    const inputLogin = document.getElementById('perfilLogin');
    const inputCpf = document.getElementById('perfilCpf');
    const divCpfWrapper = document.getElementById('divPerfilCpfWrapper');
    
    // Displays visuais
    const displayNome = document.getElementById('perfilNomeDisplay');
    const displayAvatar = document.getElementById('perfilAvatarDisplay');
    const displayBadge = document.getElementById('perfilBadgeDisplay');

    try {
        // Estado de "Carregando..." nos inputs
        if(inputNome) inputNome.value = "...";
        if(inputLogin) inputLogin.value = "...";

        // Busca TODOS os usuários e ALUNOS para cruzar dados
        const [listaUsuarios, listaAlunos] = await Promise.all([
            fetchAPI('/usuarios'), 
            fetchAPI('/alunos')
        ]);
        
        // Filtra localmente o usuário correto
        // Nota: `==` permite comparar string "1" com number 1
        const usuario = listaUsuarios.find(u => u.id == id);
        
        if (!usuario) {
            mostrarToast("Erro crítico: Perfil não encontrado.", "error");
            return;
        }

        // --- PREENCHE DADOS ---

        // 1. Identidade Visual
        if(displayNome) displayNome.innerText = usuario.nome;
        if(displayAvatar) displayAvatar.innerText = getIniciais(usuario.nome);
        if(displayBadge) displayBadge.innerHTML = getStatusBadgePro(usuario.tipo);

        // 2. Formulário
        if(inputNome) inputNome.value = usuario.nome;
        if(inputLogin) inputLogin.value = usuario.login;

        // 3. Lógica Condicional de CPF (Apenas para Alunos)
        if (usuario.tipo === 'ALUNO') {
            const alunoDados = listaAlunos.find(a => a.id == usuario.id);
            if (alunoDados && inputCpf) {
                // Formata CPF: 12345678900 -> 123.456.789-00
                const cpfFmt = alunoDados.cpf ? alunoDados.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : 'Não cadastrado';
                inputCpf.value = cpfFmt;
            }
            if(divCpfWrapper) divCpfWrapper.classList.remove('d-none');
        } else {
            // Se for Instituição/Admin, esconde o campo CPF para limpar o layout
            if(divCpfWrapper) divCpfWrapper.classList.add('d-none');
        }

    } catch (e) {
        console.error("Erro ao carregar perfil:", e);
        mostrarToast("Falha ao carregar dados do perfil.", "error");
    }
}

// ==========================================
// LÓGICA DE SALVAMENTO (COM LOADING STATE)
// ==========================================

async function instSalvarPerfil(id) {
    const form = document.getElementById('formPerfil');
    const btnSalvar = document.getElementById('btnSalvarPerfil');
    const btnNormal = btnSalvar.querySelector('.normal-state');
    const btnLoading = btnSalvar.querySelector('.loading-state');
    
    const nomeInput = document.getElementById('perfilNome');
    const loginInput = document.getElementById('perfilLogin');
    const senhaInput = document.getElementById('perfilSenha');
    const confirmarInput = document.getElementById('perfilConfirmarSenha');

    // 1. Reset de Validação
    form.classList.remove('was-validated');
    confirmarInput.classList.remove('is-invalid');
    senhaInput.classList.remove('is-invalid');
    loginInput.classList.remove('is-invalid');

    // 2. Validação HTML (Requireds)
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        mostrarToast("Preencha os campos obrigatórios.", "warning");
        return;
    }

    // 3. Validação de Senha
    if (senhaInput.value) {
        if (senhaInput.value.length < 4) {
            mostrarToast("A senha é muito curta (mín. 4 caracteres).", "warning");
            senhaInput.classList.add('is-invalid');
            return;
        }
        if (senhaInput.value !== confirmarInput.value) {
            confirmarInput.classList.add('is-invalid');
            mostrarToast("As senhas não coincidem.", "error");
            return;
        }
    }

    // 4. Início do Processo de Salvamento
    try {
        // UI Loading
        btnSalvar.disabled = true;
        btnNormal.classList.add('d-none');
        btnLoading.classList.remove('d-none');

        const loginNovo = loginInput.value.trim();

        // 5. Verifica Duplicidade de Login
        const todosUsuarios = await fetchAPI('/usuarios');
        const loginEmUso = todosUsuarios.find(u => u.login === loginNovo && u.id != id); // != permite string vs int
        
        if (loginEmUso) {
            loginInput.classList.add('is-invalid');
            mostrarToast("Este login já está em uso.", "warning");
            throw new Error("Login duplicado"); // Interrompe fluxo para ir pro catch/finally
        }

        // 6. Prepara Objeto
        // Importante: Pegamos o tipo original do usuário carregado da lista, 
        // para evitar que um atacante mude o input hidden/disabled via HTML Inspector.
        const usuarioOriginal = todosUsuarios.find(u => u.id == id);
        if(!usuarioOriginal) throw new Error("Usuário original não encontrado para merge.");

        const body = {
            id: id, // Mantém ID numérico ou string conforme original
            nome: formatarNomeProprio(nomeInput.value),
            login: loginNovo,
            tipo: usuarioOriginal.tipo // Garante que o tipo não muda
        };
        
        if (senhaInput.value) {
            body.senha = senhaInput.value;
        } else {
            // Mantém senha antiga se a API for JSON Server simples (PUT substitui tudo)
            // Se a API for PATCH, não precisa disso. Assumindo PUT:
            body.senha = usuarioOriginal.senha;
        }

        // 7. Envia PUT
        await fetchAPI(`/usuarios/${id}`, 'PUT', body);

        // 8. Atualiza Sessão Local (LocalStorage)
        const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (usuarioLogado && usuarioLogado.id == id) {
            usuarioLogado.nome = body.nome;
            usuarioLogado.login = body.login;
            localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        }

        // Sucesso
        mostrarToast("Perfil atualizado com sucesso!");
        
        // Limpa senhas e recarrega dados visuais
        senhaInput.value = '';
        confirmarInput.value = '';
        instCarregarDadosPerfil(id); 

    } catch (e) {
        if(e.message !== "Login duplicado") {
            console.error(e);
            mostrarToast("Erro ao salvar alterações.", "error");
        }
    } finally {
        // Restaura botão
        btnSalvar.disabled = false;
        btnNormal.classList.remove('d-none');
        btnLoading.classList.add('d-none');
    }
}

// Utilitário Toggle Senha
function instToggleSenhaPerfil(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!input || !icon) return;

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}