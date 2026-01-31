// ============================================================================
// FUNÇÕES AUXILIARES GLOBAIS
// ============================================================================

function getIconePorTipo(tipo) {
    switch (tipo) {
        case 'ALUNO': return 'fa-user-graduate';
        case 'PROFESSOR': return 'fa-chalkboard-teacher';
        case 'ADMIN': return 'fa-university';
        default: return 'fa-user';
    }
}

// ============================================================================
// PERFIL INSTITUCIONAL / GERAL (Base)
// ============================================================================

async function instRenderPerfil() {
    atualizarMenuAtivo('Perfil');
    const target = document.getElementById('appContent');
    if (!target) return;

    const usuarioLogadoStr = localStorage.getItem('usuarioLogado');
    const usuarioLogado = usuarioLogadoStr ? JSON.parse(usuarioLogadoStr) : { id: 0, nome: 'Usuário', tipo: 'GUEST' };

    // Configuração visual baseada no tipo
    const iconeClass = getIconePorTipo(usuarioLogado.tipo);
    const bgClass = usuarioLogado.tipo === 'ADMIN' ? 'bg-primary' : (usuarioLogado.tipo === 'PROFESSOR' ? 'bg-info' : 'bg-success');
    
    // Badge do tipo
    const badgeHtml = typeof getStatusBadgePro === 'function' 
        ? getStatusBadgePro(usuarioLogado.tipo) 
        : `<span class="badge bg-secondary rounded-pill px-3">${usuarioLogado.tipo}</span>`;

    target.innerHTML = `
        <div class="fade-in mw-800 mx-auto" style="max-width: 800px;">
            
            <div class="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h3 class="fw-bold text-dark mb-1">Meu Perfil</h3>
                    <p class="text-muted small mb-0">Gerencie suas credenciais e dados pessoais.</p>
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-body p-0">
                    <div class="bg-light border-bottom p-4">
                        <div class="d-flex align-items-center">
                            <div class="d-inline-flex align-items-center justify-content-center rounded-circle text-white shadow-sm me-4 ${bgClass}" 
                                 style="width: 80px; height: 80px; font-size: 2.5rem; flex-shrink: 0;">
                                <i class="fas ${iconeClass}"></i>
                            </div>

                            <div>
                                <h4 class="fw-bold text-dark mb-1" id="perfilNomeDisplay">${usuarioLogado.nome}</h4>
                                <div class="mb-0" id="perfilBadgeDisplay">${badgeHtml}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-body p-4">
                    <form id="formPerfil" novalidate onsubmit="event.preventDefault(); instSalvarPerfil(${usuarioLogado.id});">
                        
                        <div class="row g-3">
                            <div class="col-12">
                                <h6 class="text-uppercase text-primary fw-bold small mb-3 border-bottom pb-2">
                                    <i class="far fa-address-card me-2"></i>Dados Pessoais
                                </h6>
                            </div>

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

                            <div class="col-md-6 d-none" id="divPerfilCpfWrapper">
                                <label class="form-label small fw-bold text-secondary">CPF</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-soft-secondary border-end-0 border-0"><i class="far fa-id-card text-muted"></i></span>
                                    <input type="text" class="form-control border-0 bg-soft-secondary text-muted" id="perfilCpf" disabled value="---">
                                    <span class="input-group-text bg-soft-secondary border-0"><i class="fas fa-lock text-muted opacity-50 small"></i></span>
                                </div>
                            </div>

                            <div class="col-12 mt-4">
                                <h6 class="text-uppercase text-primary fw-bold small mb-3 border-bottom pb-2">
                                    <i class="fas fa-shield-alt me-2"></i>Segurança
                                </h6>
                                <div class="alert alert-light border border-light d-flex align-items-center mb-3 py-2" role="alert">
                                    <i class="fas fa-info-circle text-muted me-2"></i>
                                    <div class="small text-muted">Preencha apenas se desejar alterar sua senha atual.</div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Nova Senha</label>
                                <div class="input-group input-group-solid-focus">
                                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-key text-muted"></i></span>
                                    <input type="password" class="form-control border-start-0 border-end-0 ps-0 bg-light" id="perfilSenha" placeholder="••••••" autocomplete="new-password">
                                    <button class="btn btn-light border border-start-0" type="button" onclick="toggleInputSenha('perfilSenha', 'iconPerfilSenha')">
                                        <i class="far fa-eye text-muted" id="iconPerfilSenha"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Confirmar Senha</label>
                                <div class="input-group input-group-solid-focus">
                                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-check-double text-muted"></i></span>
                                    <input type="password" class="form-control border-start-0 border-end-0 ps-0 bg-light" id="perfilConfirmarSenha" placeholder="••••••">
                                    <button class="btn btn-light border border-start-0" type="button" onclick="toggleInputSenha('perfilConfirmarSenha', 'iconPerfilConfirmarSenha')">
                                        <i class="far fa-eye text-muted" id="iconPerfilConfirmarSenha"></i>
                                    </button>
                                </div>
                                <div class="invalid-feedback">As senhas não conferem.</div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                            <button type="button" class="btn btn-light text-muted border px-4" onclick="instCarregarDadosPerfil(${usuarioLogado.id})">
                                Desfazer
                            </button>
                            
                            <button type="submit" id="btnSalvarPerfil" class="btn btn-primary px-4 shadow-sm btn-hover-lift">
                                <span class="normal-state"><i class="fas fa-save me-2"></i> Salvar</span>
                                <span class="loading-state d-none"><span class="spinner-border spinner-border-sm me-2"></span>Salvando...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    instCarregarDadosPerfil(usuarioLogado.id);
}

async function instCarregarDadosPerfil(id) {
    const inputNome = document.getElementById('perfilNome');
    const inputLogin = document.getElementById('perfilLogin');
    const inputCpf = document.getElementById('perfilCpf');
    const divCpfWrapper = document.getElementById('divPerfilCpfWrapper');
    const displayNome = document.getElementById('perfilNomeDisplay');

    try {
        if(inputNome) inputNome.value = "...";
        
        // Busca dados frescos da API
        const [listaUsuarios, listaAlunos] = await Promise.all([
            fetchAPI('/usuarios'), 
            fetchAPI('/alunos').catch(() => []) // Evita erro se não for aluno
        ]);
        
        const usuario = listaUsuarios.find(u => u.id == id);
        if (!usuario) throw new Error("Usuário não encontrado");

        // Atualiza UI
        if(displayNome) displayNome.innerText = usuario.nome;
        if(inputNome) inputNome.value = usuario.nome;
        if(inputLogin) inputLogin.value = usuario.login;

        // Lógica CPF (apenas Aluno)
        if (usuario.tipo === 'ALUNO') {
            const aluno = listaAlunos.find(a => a.id == usuario.id);
            if (aluno && inputCpf) inputCpf.value = typeof utilsFormatarCPF === 'function' ? utilsFormatarCPF(aluno.cpf) : aluno.cpf;
            if (divCpfWrapper) divCpfWrapper.classList.remove('d-none');
        } else {
            if (divCpfWrapper) divCpfWrapper.classList.add('d-none');
        }

    } catch (e) {
        console.error("Erro perfil:", e);
        mostrarToast("Erro ao carregar dados.", "error");
    }
}

async function instSalvarPerfil(id) {
    // Mesma lógica do seu código original
    const form = document.getElementById('formPerfil');
    const btnSalvar = document.getElementById('btnSalvarPerfil');
    
    // Inputs
    const nomeInput = document.getElementById('perfilNome');
    const loginInput = document.getElementById('perfilLogin');
    const senhaInput = document.getElementById('perfilSenha');
    const confirmarInput = document.getElementById('perfilConfirmarSenha');

    form.classList.remove('was-validated');
    senhaInput.classList.remove('is-invalid');
    confirmarInput.classList.remove('is-invalid');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return mostrarToast("Verifique os campos obrigatórios.", "warning");
    }

    if (senhaInput.value) {
        if (senhaInput.value.length < 4) {
            return mostrarToast("Senha muito curta.", "warning");
        }
        if (senhaInput.value !== confirmarInput.value) {
            confirmarInput.classList.add('is-invalid');
            return mostrarToast("As senhas não coincidem.", "error");
        }
    }

    try {
        utilsBtnLoading(btnSalvar, true);

        // Busca usuário original para manter o tipo
        const todosUsuarios = await fetchAPI('/usuarios');
        const usuarioOriginal = todosUsuarios.find(u => u.id == id);
        
        // Verifica duplicidade de login
        const loginEmUso = todosUsuarios.find(u => u.login === loginInput.value.trim() && u.id != id);
        if (loginEmUso) throw new Error("Login já está em uso.");

        const body = {
            id: id,
            nome: nomeInput.value.trim(),
            login: loginInput.value.trim(),
            tipo: usuarioOriginal.tipo,
            senha: senhaInput.value ? senhaInput.value : usuarioOriginal.senha
        };

        await fetchAPI(`/usuarios/${id}`, 'PUT', body);
        
        // Atualiza sessão
        const sessao = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (sessao.id == id) {
            sessao.nome = body.nome;
            sessao.login = body.login;
            localStorage.setItem('usuarioLogado', JSON.stringify(sessao));
            const navDisplay = document.getElementById('user-name-display');
            if(navDisplay) navDisplay.innerText = body.nome;
        }

        mostrarToast("Perfil atualizado com sucesso!");
        senhaInput.value = '';
        confirmarInput.value = '';
        instCarregarDadosPerfil(id);

    } catch (e) {
        mostrarToast(e.message || "Erro ao salvar.", "error");
    } finally {
        utilsBtnLoading(btnSalvar, false);
    }
}

// ============================================================================
// PERFIL DO PROFESSOR (Padronizado)
// ============================================================================

async function profRenderPerfil() {
    atualizarMenuAtivo('Meu Perfil');
    const appContent = document.getElementById('appContent');
    if (!appContent) return;

    // Recupera dados do getUser() que já é usado no módulo do professor
    const me = getUser(); 
    
    // Configuração Visual (Igual ao Inst)
    const iconeClass = getIconePorTipo('PROFESSOR');
    const bgClass = 'bg-info'; // Cor específica para professor

    appContent.innerHTML = `
        <div class="fade-in mw-800 mx-auto" style="max-width: 800px;">
            
            <div class="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h3 class="fw-bold text-dark mb-1">Meu Perfil</h3>
                    <p class="text-muted small mb-0">Portal do Docente</p>
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-body p-0">
                    <div class="bg-light border-bottom p-4">
                        <div class="d-flex align-items-center">
                            <div class="d-inline-flex align-items-center justify-content-center rounded-circle text-white shadow-sm me-4 ${bgClass}" 
                                 style="width: 80px; height: 80px; font-size: 2.5rem; flex-shrink: 0;">
                                <i class="fas ${iconeClass}"></i>
                            </div>

                            <div>
                                <h4 class="fw-bold text-dark mb-1">${me.nome}</h4>
                                <div class="mb-0">
                                    <span class="badge bg-info text-white rounded-pill px-3">
                                        <i class="fas fa-chalkboard-teacher me-1"></i>Professor
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-body p-4">
                    <form id="formProfPerfil" novalidate onsubmit="event.preventDefault(); profSalvarPerfilCompleto(${me.id});">
                        
                        <div class="row g-3">
                            <div class="col-12">
                                <h6 class="text-uppercase text-primary fw-bold small mb-3 border-bottom pb-2">
                                    <i class="far fa-address-card me-2"></i>Dados Cadastrais
                                </h6>
                            </div>

                            <div class="col-md-12">
                                <label class="form-label small fw-bold text-secondary">Nome de Exibição</label>
                                <div class="input-group input-group-solid-focus">
                                    <span class="input-group-text bg-light border-end-0"><i class="far fa-user text-muted"></i></span>
                                    <input type="text" class="form-control border-start-0 ps-0 bg-light" id="profNome" value="${me.nome}" required minlength="3">
                                </div>
                            </div>
                            
                            <div class="col-md-12">
                                <label class="form-label small fw-bold text-secondary">Login / Usuário</label>
                                <div class="input-group input-group-solid-focus">
                                    <span class="input-group-text bg-light border-end-0"><i class="far fa-envelope text-muted"></i></span>
                                    <input type="text" class="form-control border-start-0 ps-0 bg-light" id="profLogin" value="${me.login}" required>
                                </div>
                            </div>

                            <div class="col-12 mt-4">
                                <h6 class="text-uppercase text-primary fw-bold small mb-3 border-bottom pb-2">
                                    <i class="fas fa-shield-alt me-2"></i>Segurança
                                </h6>
                                <div class="alert alert-light border border-light d-flex align-items-center mb-3 py-2" role="alert">
                                    <i class="fas fa-info-circle text-muted me-2"></i>
                                    <div class="small text-muted">Preencha apenas se desejar alterar sua senha.</div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Nova Senha</label>
                                <div class="input-group input-group-solid-focus">
                                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-key text-muted"></i></span>
                                    <input type="password" class="form-control border-start-0 border-end-0 ps-0 bg-light" id="profSenhaNova" placeholder="••••••" autocomplete="new-password">
                                    <button class="btn btn-light border border-start-0" type="button" onclick="toggleInputSenha('profSenhaNova', 'iconProfSenha')">
                                        <i class="far fa-eye text-muted" id="iconProfSenha"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Confirmar Senha</label>
                                <div class="input-group input-group-solid-focus">
                                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-check-double text-muted"></i></span>
                                    <input type="password" class="form-control border-start-0 border-end-0 ps-0 bg-light" id="profSenhaConf" placeholder="••••••">
                                    <button class="btn btn-light border border-start-0" type="button" onclick="toggleInputSenha('profSenhaConf', 'iconProfConf')">
                                        <i class="far fa-eye text-muted" id="iconProfConf"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                            <button type="button" class="btn btn-light text-muted border px-4" onclick="profRenderPerfil()">
                                Desfazer
                            </button>
                            
                            <button type="submit" id="btnSalvarProf" class="btn btn-primary px-4 shadow-sm btn-hover-lift">
                                <span class="normal-state"><i class="fas fa-save me-2"></i> Salvar Alterações</span>
                                <span class="loading-state d-none"><span class="spinner-border spinner-border-sm me-2"></span>Salvando...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>`;
}

/**
 * Função de salvar atualizada para suportar o novo formulário do Professor
 */
async function profSalvarPerfilCompleto(id) {
    const btn = document.getElementById('btnSalvarProf');
    const nomeVal = document.getElementById('profNome').value.trim();
    const loginVal = document.getElementById('profLogin').value.trim();
    const s1 = document.getElementById('profSenhaNova').value;
    const s2 = document.getElementById('profSenhaConf').value;
    
    // Validações Básicas
    if (!nomeVal || !loginVal) {
        return mostrarToast("Nome e Login são obrigatórios.", "warning");
    }

    if (s1) {
        if (s1.length < 4) return mostrarToast("A senha deve ter pelo menos 4 caracteres.", "warning");
        if (s1 !== s2) return mostrarToast("As senhas digitadas não coincidem.", "error");
    }

    try {
        utilsBtnLoading(btn, true);

        // Busca dados atuais para pegar a senha antiga caso a nova esteja vazia
        // Assumindo que getUser() retorna os dados da sessão, mas para segurança do PUT, ideal seria ter a senha antiga
        // Como o endpoint /usuarios geralmente retorna a senha (em sistemas simples), vamos buscar
        const todos = await fetchAPI('/usuarios');
        const eu = todos.find(u => u.id == id);

        if (!eu) throw new Error("Usuário não encontrado.");

        const payload = {
            id: id,
            nome: nomeVal,
            login: loginVal,
            tipo: 'PROFESSOR',
            senha: s1 ? s1 : eu.senha // Mantém senha antiga se vazia
        };

        await fetchAPI(`/usuarios/${id}`, 'PUT', payload);
        
        // Atualiza Sessão Local
        const sessao = getUser();
        sessao.nome = nomeVal;
        sessao.login = loginVal;
        localStorage.setItem('usuarioLogado', JSON.stringify(sessao));

        mostrarToast("Perfil atualizado com sucesso!");
        
        // Limpa campos de senha
        document.getElementById('profSenhaNova').value = "";
        document.getElementById('profSenhaConf').value = "";

    } catch(e) { 
        mostrarToast("Erro ao atualizar perfil.", "danger");
        console.error(e);
    } finally {
        utilsBtnLoading(btn, false);
    }
}