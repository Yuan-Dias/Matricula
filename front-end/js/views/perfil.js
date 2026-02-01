// =================================================================
// 0. FUNÇÕES UTILITÁRIAS E GLOBAIS
// =================================================================

function getUsuarioLogadoSafe() {
    try {
        const sessaoStr = localStorage.getItem('usuarioLogado');
        if (!sessaoStr) return null;
        return JSON.parse(sessaoStr);
    } catch (e) {
        console.error("Erro ao ler sessão:", e);
        // Se deu erro ao ler, o token está corrompido. Vamos limpar para evitar loops.
        localStorage.removeItem('usuarioLogado');
        return null;
    }
}

function getIconePorTipo(tipo) {
    switch (tipo) {
        case 'ALUNO': return 'fa-user-graduate';
        case 'PROFESSOR': return 'fa-chalkboard-teacher';
        case 'ADMIN': return 'fa-university';
        default: return 'fa-user';
    }
}

function toggleInputSenha(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input && icon) {
        if (input.type === "password") {
            input.type = "text";
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    }
}

// =================================================================
// 1. PERFIL INSTITUCIONAL / ADMIN
// =================================================================

async function instRenderPerfil() {
    if (typeof atualizarMenuAtivo === 'function') atualizarMenuAtivo('Perfil');
    
    const target = document.getElementById('appContent');
    if (!target) return;

    // Tenta pegar de uma função global ou do storage
    const usuarioLogado = (typeof getUser === 'function') ? getUser() : getUsuarioLogadoSafe();

    // --- CORREÇÃO DO LOOP AQUI ---
    if (!usuarioLogado) {
        // Se chegamos aqui, a sessão é inválida. 
        // Removemos o item para que a tela de login não te mande de volta pra Home.
        localStorage.removeItem('usuarioLogado'); 
        
        if (typeof mostrarToast === 'function') {
            mostrarToast("Sessão expirada. Faça login novamente.", "error");
        } else {
            alert("Sessão expirada.");
        }
        
        setTimeout(() => window.location.href = 'index.html', 1500);
        return;
    }
    // -----------------------------

    const iconeClass = getIconePorTipo(usuarioLogado.tipo);
    const bgClass = usuarioLogado.tipo === 'ADMIN' ? 'bg-primary' : (usuarioLogado.tipo === 'PROFESSOR' ? 'bg-info' : 'bg-success');
    
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
                                <h4 class="fw-bold text-dark mb-1" id="instDisplayNome">${usuarioLogado.nome}</h4>
                                <div class="mb-0">${badgeHtml}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-body p-4">
                    <form id="formInstPerfil" novalidate onsubmit="event.preventDefault(); instSalvarPerfil(${usuarioLogado.id});">
                        <div class="row g-3">
                            <div class="col-12">
                                <h6 class="text-uppercase text-primary fw-bold small mb-3 border-bottom pb-2">
                                    <i class="far fa-address-card me-2"></i>Dados Pessoais
                                </h6>
                            </div>

                            <div class="col-md-12">
                                <label class="form-label small fw-bold text-secondary">Nome Completo</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="far fa-user text-muted"></i></span>
                                    <input type="text" class="form-control border-start-0 ps-0 bg-light" id="instNome" required minlength="3">
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Login / E-mail</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="far fa-envelope text-muted"></i></span>
                                    <input type="text" class="form-control border-start-0 ps-0 bg-light" id="instLogin" required>
                                </div>
                            </div>

                            <div class="col-md-6 d-none" id="instDivCpfWrapper">
                                <label class="form-label small fw-bold text-secondary">CPF</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-soft-secondary border-end-0 border-0"><i class="far fa-id-card text-muted"></i></span>
                                    <input type="text" class="form-control border-0 bg-soft-secondary text-muted" id="instCpf" disabled value="---">
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
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-key text-muted"></i></span>
                                    <input type="password" class="form-control border-start-0 border-end-0 ps-0 bg-light" id="instSenha" placeholder="••••••" autocomplete="new-password">
                                    <button class="btn btn-light border border-start-0" type="button" onclick="toggleInputSenha('instSenha', 'iconInstSenha')">
                                        <i class="far fa-eye text-muted" id="iconInstSenha"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Confirmar Senha</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-check-double text-muted"></i></span>
                                    <input type="password" class="form-control border-start-0 border-end-0 ps-0 bg-light" id="instConfSenha" placeholder="••••••">
                                    <button class="btn btn-light border border-start-0" type="button" onclick="toggleInputSenha('instConfSenha', 'iconInstConf')">
                                        <i class="far fa-eye text-muted" id="iconInstConf"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                            <button type="button" class="btn btn-light text-muted border px-4" onclick="instCarregarDadosPerfil(${usuarioLogado.id})">
                                Desfazer
                            </button>
                            <button type="submit" id="btnSalvarInst" class="btn btn-primary px-4 shadow-sm btn-hover-lift">
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
    const inputNome = document.getElementById('instNome');
    const inputLogin = document.getElementById('instLogin');
    const inputCpf = document.getElementById('instCpf');
    const divCpfWrapper = document.getElementById('instDivCpfWrapper');
    const displayNome = document.getElementById('instDisplayNome');

    try {
        if(inputNome) inputNome.value = "Carregando...";
        
        const [listaUsuarios, listaAlunos] = await Promise.all([
            fetchAPI('/usuarios'), 
            fetchAPI('/alunos').catch(() => [])
        ]);
        
        const usuario = listaUsuarios.find(u => String(u.id) === String(id));
        
        if (!usuario) {
            const fallbackUser = getUsuarioLogadoSafe();
            if(fallbackUser && String(fallbackUser.id) === String(id)) {
                console.warn("Usuário não encontrado na lista da API. Usando dados da sessão local.");
                if(displayNome) displayNome.innerText = fallbackUser.nome;
                if(inputNome) inputNome.value = fallbackUser.nome;
                if(inputLogin) inputLogin.value = fallbackUser.login;
                mostrarToast("Atenção: Dados carregados do cache local.", "warning");
                return;
            }
            
            throw new Error("Usuário não encontrado na base de dados.");
        }

        if(displayNome) displayNome.innerText = usuario.nome;
        if(inputNome) inputNome.value = usuario.nome;
        if(inputLogin) inputLogin.value = usuario.login;

        if (usuario.tipo === 'ALUNO') {
            const aluno = listaAlunos.find(a => String(a.id) === String(usuario.id));
            if (aluno && inputCpf) {
                inputCpf.value = typeof utilsFormatarCPF === 'function' ? utilsFormatarCPF(aluno.cpf) : aluno.cpf;
            }
            if (divCpfWrapper) divCpfWrapper.classList.remove('d-none');
        } else {
            if (divCpfWrapper) divCpfWrapper.classList.add('d-none');
        }

    } catch (e) {
        console.error("Erro perfil:", e);
        mostrarToast(e.message || "Erro ao carregar dados do perfil.", "error");
    }
}

async function instSalvarPerfil(id) {
    const form = document.getElementById('formInstPerfil');
    const btnSalvar = document.getElementById('btnSalvarInst');
    
    const nomeInput = document.getElementById('instNome');
    const loginInput = document.getElementById('instLogin');
    const senhaInput = document.getElementById('instSenha');
    const confirmarInput = document.getElementById('instConfSenha');

    form.classList.remove('was-validated');
    senhaInput.classList.remove('is-invalid');
    confirmarInput.classList.remove('is-invalid');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return mostrarToast("Verifique os campos obrigatórios.", "warning");
    }

    if (senhaInput.value) {
        if (senhaInput.value.length < 4) return mostrarToast("Senha muito curta.", "warning");
        if (senhaInput.value !== confirmarInput.value) {
            confirmarInput.classList.add('is-invalid');
            return mostrarToast("As senhas não coincidem.", "error");
        }
    }

    try {
        if(typeof utilsBtnLoading === 'function') utilsBtnLoading(btnSalvar, true);
        
        const todosUsuarios = await fetchAPI('/usuarios');
        const usuarioOriginal = todosUsuarios.find(u => String(u.id) === String(id));
        
        if(!usuarioOriginal) throw new Error("Usuário original não encontrado para atualização.");

        const loginEmUso = todosUsuarios.find(u => u.login === loginInput.value.trim() && String(u.id) !== String(id));
        if (loginEmUso) throw new Error("Login já está em uso.");

        const body = {
            id: id,
            nome: nomeInput.value.trim(),
            login: loginInput.value.trim(),
            tipo: usuarioOriginal.tipo,
            senha: senhaInput.value ? senhaInput.value : usuarioOriginal.senha
        };

        await fetchAPI(`/usuarios/${id}`, 'PUT', body);
        
        const sessao = getUsuarioLogadoSafe();
        if (sessao && String(sessao.id) === String(id)) {
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
        if(typeof utilsBtnLoading === 'function') utilsBtnLoading(btnSalvar, false);
    }
}

// =================================================================
// 2. PERFIL DO PROFESSOR
// =================================================================

async function profRenderPerfil() {
    if (typeof atualizarMenuAtivo === 'function') atualizarMenuAtivo('Meu Perfil');
    
    const target = document.getElementById('appContent');
    if (!target) return;

    const me = (typeof getUser === 'function') ? getUser() : getUsuarioLogadoSafe();
    
    // --- CORREÇÃO DO LOOP AQUI ---
    if(!me) {
        localStorage.removeItem('usuarioLogado'); // Limpa o token estragado
        mostrarToast("Sessão inválida. Por favor entre novamente.", "warning");
        setTimeout(() => window.location.href = 'index.html', 1500);
        return;
    }
    // -----------------------------

    const iconeClass = getIconePorTipo('PROFESSOR');
    
    target.innerHTML = `
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
                            <div class="d-inline-flex align-items-center justify-content-center rounded-circle text-white shadow-sm me-4 bg-info" 
                                 style="width: 80px; height: 80px; font-size: 2.5rem; flex-shrink: 0;">
                                <i class="fas ${iconeClass}"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-1">${me.nome}</h4>
                                <div class="mb-0">
                                    <span class="badge bg-info text-white rounded-pill px-3"><i class="fas fa-chalkboard-teacher me-1"></i>Professor</span>
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
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="far fa-user text-muted"></i></span>
                                    <input type="text" class="form-control border-start-0 ps-0 bg-light" id="profNome" value="${me.nome}" required minlength="3">
                                </div>
                            </div>
                            
                            <div class="col-md-12">
                                <label class="form-label small fw-bold text-secondary">Login / Usuário</label>
                                <div class="input-group">
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
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-key text-muted"></i></span>
                                    <input type="password" class="form-control border-start-0 border-end-0 ps-0 bg-light" id="profSenhaNova" placeholder="••••••" autocomplete="new-password">
                                    <button class="btn btn-light border border-start-0" type="button" onclick="toggleInputSenha('profSenhaNova', 'iconProfSenha')">
                                        <i class="far fa-eye text-muted" id="iconProfSenha"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Confirmar Senha</label>
                                <div class="input-group">
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

async function profSalvarPerfilCompleto(id) {
    const btn = document.getElementById('btnSalvarProf');
    const nomeVal = document.getElementById('profNome').value.trim();
    const loginVal = document.getElementById('profLogin').value.trim();
    const s1 = document.getElementById('profSenhaNova').value;
    const s2 = document.getElementById('profSenhaConf').value;
    
    if (!nomeVal || !loginVal) return mostrarToast("Nome e Login são obrigatórios.", "warning");

    if (s1) {
        if (s1.length < 4) return mostrarToast("A senha deve ter pelo menos 4 caracteres.", "warning");
        if (s1 !== s2) return mostrarToast("As senhas digitadas não coincidem.", "error");
    }

    try {
        if(typeof utilsBtnLoading === 'function') utilsBtnLoading(btn, true);
        
        const todos = await fetchAPI('/usuarios');
        const eu = todos.find(u => String(u.id) === String(id));
        if (!eu) throw new Error("Usuário não encontrado.");

        const payload = {
            id: id,
            nome: nomeVal,
            login: loginVal,
            tipo: 'PROFESSOR',
            senha: s1 ? s1 : eu.senha
        };

        await fetchAPI(`/usuarios/${id}`, 'PUT', payload);
        
        const sessao = getUsuarioLogadoSafe();
        if(sessao) {
            sessao.nome = nomeVal;
            sessao.login = loginVal;
            localStorage.setItem('usuarioLogado', JSON.stringify(sessao));
        }

        mostrarToast("Perfil atualizado com sucesso!");
        document.getElementById('profSenhaNova').value = "";
        document.getElementById('profSenhaConf').value = "";

    } catch(e) { 
        mostrarToast("Erro ao atualizar perfil.", "danger");
    } finally {
        if(typeof utilsBtnLoading === 'function') utilsBtnLoading(btn, false);
    }
}

// =================================================================
// 3. PERFIL DO ALUNO
// =================================================================

async function alunoRenderPerfil() {
    if (typeof atualizarMenuAtivo === 'function') atualizarMenuAtivo('Meu Perfil');
    
    const target = document.getElementById('appContent');
    if (!target) return;
    
    const me = (typeof getUser === 'function') ? getUser() : getUsuarioLogadoSafe();
    
    // --- CORREÇÃO DO LOOP AQUI ---
    if (!me) {
        localStorage.removeItem('usuarioLogado'); // Garante que o usuário está deslogado
        mostrarToast("Sessão finalizada. Entre novamente.", "info");
        setTimeout(() => window.location.href = 'index.html', 1500);
        return;
    }
    // -----------------------------
    
    const iconeClass = getIconePorTipo('ALUNO');
    
    target.innerHTML = `
        <div class="fade-in mw-800 mx-auto" style="max-width: 800px;">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <h3 class="fw-bold text-dark mb-1">Meu Perfil</h3>
                    <p class="text-muted small mb-0">Área do Estudante</p>
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-body p-0">
                    <div class="bg-light border-bottom p-4">
                        <div class="d-flex align-items-center">
                            <div class="d-inline-flex align-items-center justify-content-center rounded-circle text-white shadow-sm me-4 bg-success" 
                                 style="width: 80px; height: 80px; font-size: 2.5rem; flex-shrink: 0;">
                                <i class="fas ${iconeClass}"></i>
                            </div>
                            <div>
                                <h4 class="fw-bold text-dark mb-1">${me.nome}</h4>
                                <div class="mb-0">
                                    <span class="badge bg-success text-white rounded-pill px-3"><i class="fas fa-user-graduate me-1"></i>Estudante</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card-body p-4">
                    <form id="formAlunoPerfil" novalidate onsubmit="event.preventDefault(); alunoSalvarSenha(${me.id});">
                        <div class="row g-3">
                            <div class="col-12">
                                <h6 class="text-uppercase text-primary fw-bold small mb-3 border-bottom pb-2">
                                    <i class="far fa-address-card me-2"></i>Meus Dados
                                </h6>
                            </div>

                            <div class="col-md-12">
                                <label class="form-label small fw-bold text-secondary">Nome Completo</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-soft-secondary border-end-0 border-0"><i class="far fa-user text-muted"></i></span>
                                    <input type="text" class="form-control border-0 bg-soft-secondary text-muted" id="alunoNome" value="${me.nome}" disabled>
                                    <span class="input-group-text bg-soft-secondary border-0"><i class="fas fa-lock text-muted opacity-50 small"></i></span>
                                </div>
                                <div class="form-text small">Para alterar o nome, contate a secretaria.</div>
                            </div>
                            
                            <div class="col-md-12">
                                <label class="form-label small fw-bold text-secondary">Login / E-mail</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-soft-secondary border-end-0 border-0"><i class="far fa-envelope text-muted"></i></span>
                                    <input type="text" class="form-control border-0 bg-soft-secondary text-muted" id="alunoLogin" value="${me.login}" disabled>
                                    <span class="input-group-text bg-soft-secondary border-0"><i class="fas fa-lock text-muted opacity-50 small"></i></span>
                                </div>
                            </div>

                            <div class="col-12 mt-4">
                                <h6 class="text-uppercase text-primary fw-bold small mb-3 border-bottom pb-2">
                                    <i class="fas fa-shield-alt me-2"></i>Segurança da Conta
                                </h6>
                                <div class="alert alert-light border border-light d-flex align-items-center mb-3 py-2" role="alert">
                                    <i class="fas fa-info-circle text-muted me-2"></i>
                                    <div class="small text-muted">Preencha abaixo para definir uma nova senha.</div>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Nova Senha</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-key text-muted"></i></span>
                                    <input type="password" class="form-control border-start-0 border-end-0 ps-0 bg-light" id="alunoSenhaNova" placeholder="Mínimo 6 caracteres" required>
                                    <button class="btn btn-light border border-start-0" type="button" onclick="toggleInputSenha('alunoSenhaNova', 'iconAlunoSenha')">
                                        <i class="far fa-eye text-muted" id="iconAlunoSenha"></i>
                                    </button>
                                </div>
                            </div>

                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-secondary">Confirmar Nova Senha</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-check-double text-muted"></i></span>
                                    <input type="password" class="form-control border-start-0 border-end-0 ps-0 bg-light" id="alunoSenhaConf" placeholder="Repita a senha" required>
                                    <button class="btn btn-light border border-start-0" type="button" onclick="toggleInputSenha('alunoSenhaConf', 'iconAlunoConf')">
                                        <i class="far fa-eye text-muted" id="iconAlunoConf"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                            <button type="submit" id="btnSalvarAluno" class="btn btn-success px-4 shadow-sm btn-hover-lift">
                                <span class="normal-state"><i class="fas fa-save me-2"></i> Atualizar Senha</span>
                                <span class="loading-state d-none"><span class="spinner-border spinner-border-sm me-2"></span>Salvando...</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>`;
}

async function alunoSalvarSenha(idUsuario) {
    const s1 = document.getElementById('alunoSenhaNova').value;
    const s2 = document.getElementById('alunoSenhaConf').value;
    const btn = document.getElementById('btnSalvarAluno');
    const me = (typeof getUser === 'function') ? getUser() : getUsuarioLogadoSafe();
    
    if (!s1 || s1.length < 6) {
        return mostrarToast("A nova senha deve ter pelo menos 6 caracteres.", "warning");
    }

    if (s1 !== s2) {
        return mostrarToast("As senhas não coincidem.", "danger");
    }

    try {
        if(typeof utilsBtnLoading === 'function') utilsBtnLoading(btn, true);
        
        await fetchAPI(`/usuarios/${idUsuario}`, 'PUT', { 
            nome: me.nome, 
            login: me.login, 
            tipo: me.tipo || 'ALUNO', 
            senha: s1,
            cpf: me.cpf 
        });
        
        mostrarToast("Senha atualizada com sucesso! Recarregando...");
        
        document.getElementById('alunoSenhaNova').value = "";
        document.getElementById('alunoSenhaConf').value = "";
        
        setTimeout(() => {
            if (typeof alunoRenderHome === 'function') alunoRenderHome();
        }, 1500);

    } catch(e) { 
        mostrarToast("Erro ao atualizar senha. Verifique sua conexão.", "danger");
    } finally {
        if(typeof utilsBtnLoading === 'function') utilsBtnLoading(btn, false);
    }
}