// ==================================================================================
// CONFIGURAÇÕES GLOBAIS E UTILITÁRIOS
// ==================================================================================
const appContent = document.getElementById("app-content");
const pageTitle = document.getElementById("page-title");
const sidebarMenu = document.getElementById("sidebar-menu");

let ordenacaoAtual = { coluna: null, ascendente: true };

// --- Notificações Toast ---
function mostrarToast(mensagem, tipo = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        // Cria o container se não existir
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const cor = tipo === 'success' ? 'bg-success' : 'bg-danger';
    const icone = tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${cor} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas ${icone} me-2"></i> ${mensagem}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>`;

    document.getElementById('toastContainer').insertAdjacentHTML('beforeend', toastHTML);
    const toastEl = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
    bsToast.show();

    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// --- Modal de Erro Global ---
function exibirErroVisual(mensagem) {
    const modalEl = document.getElementById('modalErroGlobal');
    const msgEl = document.getElementById('mensagemErroGlobal');
    
    if (modalEl && msgEl) {
        msgEl.textContent = mensagem;
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } else {
        alert("ERRO: " + mensagem);
    }
}

// --- Loading Visual ---
function instLoading(ativo = true) {
    if(ativo) {
        appContent.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 60vh;">
                <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Carregando...</span></div>
            </div>`;
    }
}

// --- Badge de Status (Auxiliar) ---
function getStatusBadge(tipo) {
    const map = {
        'INSTITUICAO': '<span class="badge bg-danger bg-opacity-75 rounded-pill px-3">INSTITUIÇÃO</span>',
        'PROFESSOR': '<span class="badge bg-warning text-dark bg-opacity-75 rounded-pill px-3">DOCENTE</span>',
        'ALUNO': '<span class="badge bg-info text-dark bg-opacity-75 rounded-pill px-3">DISCENTE</span>'
    };
    return map[tipo] || `<span class="badge bg-secondary">${tipo}</span>`;
}

// --- Atualizar Menu Ativo ---
function atualizarMenuAtivo(textoItem) {
    const itens = document.querySelectorAll('#sidebar-menu a');
    itens.forEach(i => {
        i.classList.remove('active');
        if(i.innerHTML.includes(textoItem)) i.classList.add('active');
    });
}

// FUNÇÃO DE BUSCA: Filtra a lista baseada em múltiplos campos
function filtrarDados(lista, termo, campos) {
    if (!termo) return lista;
    termo = termo.toLowerCase();
    return lista.filter(item => 
        campos.some(campo => {
            const valor = item[campo] ? String(item[campo]).toLowerCase() : '';
            return valor.includes(termo);
        })
    );
}

// FUNÇÃO DE ORDENAÇÃO: Apenas compara os valores
function ordenarDados(lista, coluna) {
    return lista.sort((a, b) => {
        let v1 = a[coluna] || '';
        let v2 = b[coluna] || '';
        
        if (typeof v1 === 'string') v1 = v1.toLowerCase();
        if (typeof v2 === 'string') v2 = v2.toLowerCase();

        if (v1 < v2) return ordenacaoAtual.ascendente ? -1 : 1;
        if (v1 > v2) return ordenacaoAtual.ascendente ? 1 : -1;
        return 0;
    });
}

// Controla o estado e dispara a atualização do conteúdo
function ordenarERender(contexto, coluna) {
    if (ordenacaoAtual.coluna === coluna) {
        ordenacaoAtual.ascendente = !ordenacaoAtual.ascendente;
    } else {
        ordenacaoAtual.coluna = coluna;
        ordenacaoAtual.ascendente = true;
    }
    
    if (contexto === 'usuarios') instFiltrarUsuarios();
    if (contexto === 'cursos') instFiltrarCursos();
    if (contexto === 'materias') instFiltrarMaterias();
}

// ==================================================================================
// SEÇÃO 1: INICIALIZAÇÃO DO PAINEL
// ==================================================================================
function carregarInstituicao() {
    if(pageTitle) pageTitle.innerHTML = '<span class="fw-bold text-primary">Painel</span> Administrativo';
    
    // Renderiza o Menu Lateral
    sidebarMenu.innerHTML = `
        <a href="#" onclick="instRenderHome()" class="list-group-item list-group-item-action active bg-transparent second-text fw-bold">
            <i class="fas fa-chart-pie me-2"></i>Dashboard
        </a>
        <a href="#" onclick="instRenderUsuarios()" class="list-group-item list-group-item-action bg-transparent second-text fw-bold">
            <i class="fas fa-users me-2"></i>Usuários
        </a>
        <a href="#" onclick="instRenderCursos()" class="list-group-item list-group-item-action bg-transparent second-text fw-bold">
            <i class="fas fa-graduation-cap me-2"></i>Cursos
        </a>
        <a href="#" onclick="instRenderMaterias()" class="list-group-item list-group-item-action bg-transparent second-text fw-bold">
            <i class="fas fa-book-open me-2"></i>Matérias
        </a>
        `;
    
    instRenderHome();
}

// ==================================================================================
// SEÇÃO 2: DASHBOARD (HOME)
// ==================================================================================
async function instRenderHome() {
    atualizarMenuAtivo('Dashboard');
    appContent.innerHTML = '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

    try {
        // Busca dados em paralelo
        const [usuarios, cursos, materias] = await Promise.all([
            fetchAPI('/usuarios'), fetchAPI('/cursos'), fetchAPI('/materias')
        ]);

        const totalAlunos = usuarios.filter(u => u.tipo === 'ALUNO').length;
        const totalProfs = usuarios.filter(u => u.tipo === 'PROFESSOR').length;

        let html = `
            <div class="d-flex justify-content-between align-items-center mb-4 fade-in">
                <div>
                    <h4 class="fw-bold text-dark mb-1">Visão Geral</h4>
                    <p class="text-muted small">Resumo estatístico da instituição</p>
                </div>
                <button class="btn btn-primary btn-sm shadow-sm" onclick="instRenderHome()">
                    <i class="fas fa-sync-alt me-1"></i> Atualizar
                </button>
            </div>

            <div class="row g-4 mb-5 fade-in">
                ${cardStat('TOTAL ALUNOS', totalAlunos, 'fa-user-graduate', 'primary')}
                ${cardStat('CORPO DOCENTE', totalProfs, 'fa-chalkboard-teacher', 'warning')}
                ${cardStat('CURSOS ATIVOS', cursos.length, 'fa-graduation-cap', 'success')}
                ${cardStat('DISCIPLINAS', materias.length, 'fa-book', 'danger')}
            </div>

            <div class="row fade-in">
                <div class="col-12">
                    <div class="card border-0 shadow-sm p-4 bg-white rounded-3">
                        <h5 class="fw-bold mb-3 border-bottom pb-2">Acesso Rápido</h5>
                        <div class="d-flex gap-3 flex-wrap">
                            <button class="btn btn-outline-primary px-4 py-2" onclick="instAbrirModalUsuario()">
                                <i class="fas fa-user-plus me-2"></i>Cadastrar Usuário
                            </button>
                            <button class="btn btn-outline-success px-4 py-2" onclick="instAbrirModalCurso()">
                                <i class="fas fa-plus-circle me-2"></i>Novo Curso
                            </button>
                             <button class="btn btn-outline-secondary px-4 py-2" onclick="instAbrirModalMateria()">
                                <i class="fas fa-list me-2"></i>Nova Matéria
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        appContent.innerHTML = html;
    } catch (e) {
        console.error(e);
        appContent.innerHTML = '<div class="alert alert-danger">Erro ao carregar dashboard.</div>';
    }
}

function cardStat(titulo, valor, icone, cor) {
    return `
    <div class="col-md-3">
        <div class="card p-3 h-100 border-start border-4 border-${cor} shadow-sm">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <span class="text-muted small text-uppercase fw-bold">${titulo}</span>
                    <h2 class="fw-bold mt-2 mb-0 text-dark">${valor}</h2>
                </div>
                <div class="stat-icon-wrapper bg-${cor} bg-opacity-10 text-${cor} p-3 rounded">
                    <i class="fas ${icone} fa-lg"></i>
                </div>
            </div>
        </div>
    </div>`;
}

// Aplica a máscara de CPF (000.000.000-00) em tempo real
document.addEventListener('input', function (e) {
    if (e.target.id === 'usuarioCpf') {
        let v = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        
        if (v.length <= 11) {
            v = v.replace(/(\={10})/, ""); // Limite de 11 dígitos
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
        } else {
            v = v.substring(0, 14); // Não deixa passar do tamanho formatado
        }
        
        e.target.value = v;
    }
});

// Utilitário para limpar a máscara antes de enviar para a API
function limparMascara(valor) {
    return valor.replace(/\D/g, '');
}

// ==================================================================================
// SEÇÃO 3: USUÁRIOS (PROFESSORES E ALUNOS)
// ==================================================================================
async function instRenderUsuarios() {
    atualizarMenuAtivo('Usuários');
    
    // Renderiza a estrutura fixa (Input e Cabeçalho) apenas se não existir
    appContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="fw-bold">Usuários</h3>
            <div class="d-flex gap-2">
                <div class="input-group" style="width: 300px;">
                    <span class="input-group-text bg-white border-end-0"><i class="fas fa-search text-muted"></i></span>
                    <input type="text" id="buscaInput" class="form-control border-start-0" 
                           placeholder="Buscar usuário..." oninput="instFiltrarUsuarios()">
                </div>
                <button class="btn btn-primary shadow-sm" onclick="instAbrirModalUsuario()">
                    <i class="fas fa-plus me-2"></i>Novo
                </button>
            </div>
        </div>

        <div class="card shadow-sm border-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th class="ps-4" style="cursor:pointer" onclick="ordenarERender('usuarios', 'nome')">
                                Nome <i class="fas fa-sort ms-1 small text-muted"></i>
                            </th>
                            <th style="cursor:pointer" onclick="ordenarERender('usuarios', 'tipo')">
                                Tipo <i class="fas fa-sort ms-1 small text-muted"></i>
                            </th>
                            <th>Status</th>
                            <th class="text-end pe-4">Ações</th>
                        </tr>
                    </thead>
                    <tbody id="usuariosTableBody">
                        </tbody>
                </table>
            </div>
        </div>
    `;
    instFiltrarUsuarios();
}

async function instFiltrarUsuarios() {
    const termo = document.getElementById('buscaInput')?.value || "";
    const container = document.getElementById('usuariosTableBody');
    if(!container) return;

    try {
        let usuarios = await fetchAPI('/usuarios');
        usuarios = filtrarDados(usuarios, termo, ['nome', 'login', 'tipo']);
        if(ordenacaoAtual.coluna) usuarios = ordenarDados(usuarios, ordenacaoAtual.coluna);

        container.innerHTML = usuarios.map(u => `
            <tr>
                <td class="ps-4">
                    <div class="fw-bold">${u.nome}</div>
                    <div class="small text-muted">${u.login}</div>
                </td>
                <td>${getStatusBadge(u.tipo)}</td>
                <td><span class="badge bg-success bg-opacity-10 text-success">Ativo</span></td>
                <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-primary border-0 me-2" onclick="instAbrirModalUsuario(${JSON.stringify(u).replace(/"/g, '&quot;')})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger border-0" onclick="instDeletarUsuario(${u.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch(e) { container.innerHTML = '<tr><td colspan="4">Erro ao filtrar.</td></tr>'; }
}

async function instCarregarSelectProfessores() {
    const select = document.getElementById('cursoProfessorId');
    if (!select) return;

    select.innerHTML = '<option value="">Carregando...</option>';

    try {
        const usuarios = await fetchAPI('/usuarios');
        console.log("Usuários recebidos:", usuarios); // Verifique o console do navegador (F12)

        // Filtra os professores
        const professores = usuarios.filter(u => u.tipo === 'PROFESSOR');

        if (professores.length === 0) {
            select.innerHTML = '<option value="">Nenhum professor cadastrado</option>';
            return;
        }

        select.innerHTML = '<option value="">Selecione um professor...</option>';
        professores.forEach(p => {
            const option = document.createElement('option');
            option.value = p.id;
            option.textContent = p.nome;
            select.appendChild(option);
        });
    } catch (e) {
        console.error("Erro ao carregar professores:", e);
        select.innerHTML = '<option value="">Erro ao carregar lista</option>';
    }
}

// --- Funções de Modal Usuário ---
function instAbrirModalUsuario(dados = null) {
    const form = document.getElementById('formUsuario');
    if(form) form.reset();
    
    const idInput = document.getElementById('usuarioId');
    const title = document.getElementById('modalUsuarioTitle');
    const senhaInput = document.getElementById('usuarioSenha');
    const tipoSelect = document.getElementById('usuarioTipo');

    if (dados) {
        // MODO EDIÇÃO
        title.innerText = "Editar Usuário";
        idInput.value = dados.id;
        document.getElementById('usuarioNome').value = dados.nome;
        document.getElementById('usuarioLogin').value = dados.login;
        tipoSelect.value = dados.tipo;
        
        // Na edição, a senha geralmente não é obrigatória (deixe em branco para não alterar)
        senhaInput.required = false;
        senhaInput.placeholder = "Deixe em branco para manter a atual";
        
        // Bloqueia o tipo na edição para evitar erros de integridade no banco
        tipoSelect.disabled = true;

        if (dados.tipo === 'ALUNO') {
            document.getElementById('divCpf').classList.remove('d-none');
            document.getElementById('usuarioCpf').value = dados.cpf || '';
        } else {
            document.getElementById('divCpf').classList.add('d-none');
        }
    } else {
        // MODO NOVO
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

function instToggleCpf() {
    const tipo = document.getElementById('usuarioTipo').value;
    const divCpf = document.getElementById('divCpf');
    const inputCpf = document.getElementById('usuarioCpf');

    if (tipo === 'ALUNO') {
        divCpf.classList.remove('d-none');
    } else {
        divCpf.classList.add('d-none');
        inputCpf.value = ''; // Limpa se mudar para outro tipo
    }
}

async function instSalvarUsuario() {
    const id = document.getElementById('usuarioId')?.value;
    const nome = document.getElementById('usuarioNome').value;
    const login = document.getElementById('usuarioLogin').value;
    const senha = document.getElementById('usuarioSenha').value;
    const tipo = document.getElementById('usuarioTipo').value;
    const cpfRaw = document.getElementById('usuarioCpf').value; 
    const cpf = cpfRaw.replace(/\D/g, '');
    
    // Validação básica (Senha só obrigatória se for novo cadastro)
    if(!nome || !login || (!id && !senha) || !tipo) {
        mostrarToast("Preencha todos os campos obrigatórios.", "error");
        return;
    }

    try {
        let url;
        let body;
        let metodo = id ? 'PUT' : 'POST';

        if (tipo === 'ALUNO') {
            if(!cpf && !id) { // CPF obrigatório no cadastro
                mostrarToast("O CPF é obrigatório para alunos.", "error");
                return;
            }
            url = id ? `/alunos/${id}` : '/alunos';
            body = { nome, email: login, cpf, senha };
            if(id) body.id = id; // Garante que o ID vá no corpo se necessário
        } else {
            url = id ? `/usuarios/${id}` : '/usuarios';
            body = { nome, login, tipo };
            if(senha) body.senha = senha; // Só envia a senha se foi preenchida
            if(id) body.id = id;
        }

        await fetchAPI(url, metodo, body);
        
        // Fecha o modal
        const modalEl = document.getElementById('modalUsuario');
        bootstrap.Modal.getInstance(modalEl)?.hide();
        
        instRenderUsuarios(); 
        mostrarToast(id ? "Cadastro atualizado com sucesso!" : "Cadastrado com sucesso!");
    } catch(e) {
        if (e.message.includes("sucesso")) {
            bootstrap.Modal.getInstance(document.getElementById('modalUsuario'))?.hide();
            instRenderUsuarios();
            mostrarToast(e.message);
        } else {
            exibirErroVisual(e.message);
        }
    }
}

async function instDeletarUsuario(id) {
    if(confirm("Tem certeza que deseja remover este usuário?")) {
        try {
            await fetchAPI(`/usuarios/${id}`, 'DELETE');
            instRenderUsuarios();
            mostrarToast("Usuário removido com sucesso!");
        } catch(e) {
            exibirErroVisual("Não foi possível excluir o usuário. Ele pode estar vinculado a um curso.");
        }
    }
}

// ==================================================================================
// SEÇÃO 4: CURSOS
// ==================================================================================
async function instRenderCursos() {
    atualizarMenuAtivo('Cursos');
    
    appContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="fw-bold">Cursos</h4>
            <div class="d-flex gap-2">
                <div class="input-group" style="width: 300px;">
                    <input type="text" id="buscaInput" class="form-control" 
                           placeholder="Filtrar cursos..." oninput="instFiltrarCursos()">
                </div>
                <button class="btn btn-success shadow-sm" onclick="instAbrirModalCurso()">
                    <i class="fas fa-plus me-2"></i> Criar Curso
                </button>
            </div>
        </div>
        <div class="row g-4 fade-in" id="cursosCardsContainer">
            </div>
    `;
    instFiltrarCursos();
}

async function instFiltrarCursos() {
    const termo = document.getElementById('buscaInput')?.value || "";
    const container = document.getElementById('cursosCardsContainer');
    if(!container) return;

    try {
        let cursos = await fetchAPI('/cursos');
        cursos = filtrarDados(cursos, termo, ['nome', 'descricao', 'nomeProfessor']);
        // Ordenação padrão por nome para cursos
        cursos.sort((a,b) => a.nome.localeCompare(b.nome));

        container.innerHTML = cursos.map(c => `
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm" style="border-radius: 12px; overflow: hidden;">
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div class="bg-primary bg-opacity-10 text-primary p-3 rounded-3">
                                <i class="fas fa-laptop-code fa-lg"></i>
                            </div>
                            <span class="badge bg-info text-dark">${c.cargaHoraria}h</span>
                        </div>
                        <h5 class="card-title fw-bold text-dark mb-1">${c.nome}</h5>
                        <p class="text-primary small mb-2"><i class="fas fa-chalkboard-teacher me-1"></i>${c.nomeProfessor}</p>
                        <p class="card-text text-muted small mb-4 flex-grow-1">${c.descricao || 'Sem descrição.'}</p>
                        <div class="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                            <span class="small text-muted">Vagas: ${c.capacidade}</span>
                            <button class="btn btn-outline-danger btn-sm border-0" onclick="instDeletarCurso(${c.id})">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (e) { container.innerHTML = 'Erro ao carregar cursos.'; }
}


async function instAbrirModalCurso() {
    const form = document.getElementById('formCurso');
    if(form) form.reset();
    document.getElementById('cursoId').value = '';
    
    await instCarregarSelectProfessores();
    
    const modalElement = document.getElementById('modalCurso');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

async function instSalvarCurso() {
    const id = document.getElementById('cursoId')?.value;
    const nome = document.getElementById('cursoNome').value;
    const descricao = document.getElementById('cursoDescricao').value;
    const cargaHoraria = document.getElementById('cursoCargaHoraria').value;
    const capacidade = document.getElementById('cursoCapacidade').value;
    const idProfessor = document.getElementById('cursoProfessorId').value;

    if (!nome || !cargaHoraria || !capacidade || !idProfessor) {
        mostrarToast("Campos obrigatórios ausentes.", "error");
        return;
    }

    try {
        const body = {
            nome, descricao,
            cargaHoraria: parseInt(cargaHoraria),
            capacidade: parseInt(capacidade),
            idProfessor: parseInt(idProfessor)
        };

        await fetchAPI(id ? `/cursos/${id}` : '/cursos', id ? 'PUT' : 'POST', body);
        
        bootstrap.Modal.getInstance(document.getElementById('modalCurso'))?.hide();
        instRenderCursos();
        mostrarToast("Curso salvo com sucesso!");
    } catch(e) {
        exibirErroVisual("Erro ao processar curso: " + e.message);
    }
}

async function instDeletarCurso(id) {
    if(confirm("Deseja excluir este curso?")) {
        try {
            await fetchAPI(`/cursos/${id}`, 'DELETE');
            instRenderCursos();
        } catch(e) {
            alert("Erro ao excluir curso.");
        }
    }
}

// ==================================================================================
// SEÇÃO 5: MATÉRIAS
// ==================================================================================
async function instRenderMaterias() {
    atualizarMenuAtivo('Matérias');
    
    appContent.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="fw-bold">Grade Curricular</h4>
            <div class="d-flex gap-2">
                <div class="input-group" style="width: 300px;">
                    <input type="text" id="buscaInput" class="form-control" 
                           placeholder="Buscar disciplina..." oninput="instFiltrarMaterias()">
                </div>
                <button class="btn btn-primary shadow-sm" onclick="instAbrirModalMateria()">
                    <i class="fas fa-plus me-2"></i> Nova Matéria
                </button>
            </div>
        </div>

        <div class="card shadow-sm border-0 fade-in">
            <table class="table table-hover mb-0 align-middle">
                <thead class="bg-light">
                    <tr>
                        <th class="ps-3" style="cursor:pointer" onclick="ordenarERender('materias', 'nome')">
                            Disciplina <i class="fas fa-sort ms-1 small text-muted"></i>
                        </th>
                        <th style="cursor:pointer" onclick="ordenarERender('materias', 'nomeCurso')">
                            Curso <i class="fas fa-sort ms-1 small text-muted"></i>
                        </th>
                        <th>Docente Responsável</th>
                        <th class="text-end pe-3">Ação</th>
                    </tr>
                </thead>
                <tbody id="materiasTableBody"></tbody>
            </table>
        </div>
    `;
    instFiltrarMaterias();
}

async function instFiltrarMaterias() {
    const termo = document.getElementById('buscaInput')?.value || "";
    const container = document.getElementById('materiasTableBody');
    if(!container) return;

    try {
        let materias = await fetchAPI('/materias');
        materias = filtrarDados(materias, termo, ['nome', 'nomeCurso', 'nomeProfessor']);
        if(ordenacaoAtual.coluna) materias = ordenarDados(materias, ordenacaoAtual.coluna);

        container.innerHTML = materias.map(m => `
            <tr>
                <td class="ps-3 fw-bold text-dark">${m.nome}</td>
                <td><span class="badge bg-light text-dark border">${m.nomeCurso}</span></td>
                <td class="text-muted">
                    <i class="fas fa-chalkboard-teacher me-1 text-warning"></i>
                    ${m.nomeProfessor}
                </td>
                <td class="text-end pe-3">
                    <button class="btn btn-sm btn-outline-danger border-0 rounded-circle" onclick="instDeletarMateria(${m.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch(e) { container.innerHTML = 'Erro ao filtrar.'; }
}   

// Abre o Modal e preenche os Selects de Curso e Professor
async function instAbrirModalMateria() {
    const form = document.getElementById('formMateria');
    if(form) form.reset();
    document.getElementById('materiaId').value = '';

    try {
        const [cursos, usuarios] = await Promise.all([
            fetchAPI('/cursos'),
            fetchAPI('/usuarios')
        ]);

        const profs = usuarios.filter(u => u.tipo === 'PROFESSOR');

        const selectCurso = document.getElementById('materiaCursoSelect');
        const selectProf = document.getElementById('materiaProfSelect');

        // Preenche Cursos usando map para melhor performance
        selectCurso.innerHTML = '<option value="" selected disabled>Selecione o curso...</option>' + 
            cursos.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');

        // Preenche Professores
        selectProf.innerHTML = '<option value="">Sem professor no momento</option>' + 
            profs.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');

        new bootstrap.Modal(document.getElementById('modalMateria')).show();
    } catch(e) {
        alert("Erro ao carregar dados do formulário.");
    }
}

async function instSalvarMateria() {
    const id = document.getElementById('materiaId')?.value;
    const nome = document.getElementById('materiaNome').value;
    const cursoId = document.getElementById('materiaCursoSelect').value;

    if(!nome || !cursoId) {
        mostrarToast("Nome e Curso são obrigatórios.", "error");
        return;
    }

    try {
        const body = {
            nome,
            descricao: document.getElementById('materiaDescricao').value,
            idCurso: parseInt(cursoId),
            idProfessor: document.getElementById('materiaProfSelect').value || null
        };

        await fetchAPI(id ? `/materias/${id}` : '/materias', id ? 'PUT' : 'POST', body);
        
        bootstrap.Modal.getInstance(document.getElementById('modalMateria'))?.hide();
        instRenderMaterias();
        mostrarToast("Matéria salva com sucesso!");
    } catch(e) {
        exibirErroVisual("Erro ao salvar matéria: " + e.message);
    }
}

async function instDeletarMateria(id) {
    if(confirm("Remover matéria?")) {
        try {
            await fetchAPI(`/materias/${id}`, 'DELETE');
            instRenderMaterias();
        } catch(e) {
            alert("Erro ao deletar matéria.");
        }
    }
}

// ==================================================================================
// SEÇÃO 6: PERFIL DO USUÁRIO (INSTITUIÇÃO)
// ==================================================================================
async function instRenderPerfil() {
    atualizarMenuAtivo('Meu Perfil');
    const me = getUser();
    
    if (!me) {
        window.location.href = 'index.html';
        return;
    }

    const inicial = me.nome ? me.nome.charAt(0).toUpperCase() : 'I';

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
                                <span class="badge bg-light text-primary border border-primary-subtle">Administrador do Sistema</span>
                            </div>
                        </div>
                        <hr class="text-muted opacity-25">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="text-muted small fw-bold text-uppercase">Identificador / Nome</label>
                                <p class="mb-0 fw-medium">${me.nome}</p>
                            </div>
                            <div class="col-md-6">
                                <label class="text-muted small fw-bold text-uppercase">Login de Acesso</label>
                                <p class="mb-0 fw-medium">${me.login || me.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm rounded-3">
                    <div class="card-header bg-white p-4 border-bottom d-flex align-items-center">
                        <i class="fas fa-user-shield text-warning me-3 fs-4"></i>
                        <h5 class="fw-bold mb-0">Segurança da Conta Administrativa</h5>
                    </div>
                    <div class="card-body p-4">
                        <form onsubmit="event.preventDefault(); instSalvarPerfil(${me.id})">
                            <p class="text-muted small mb-4">Para garantir a integridade do sistema, utilize uma senha complexa.</p>
                            
                            <div class="mb-3">
                                <label class="form-label text-muted small fw-bold">NOVA SENHA</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light border-end-0"><i class="fas fa-lock text-muted"></i></span>
                                    <input type="password" id="pSenhaNova" class="form-control border-start-0" placeholder="Digite a nova senha" required>
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
                                <i class="fas fa-sync-alt me-2"></i>Atualizar Credenciais
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;
}

async function instSalvarPerfil(idUsuario) {
    const s1 = document.getElementById('pSenhaNova').value;
    const s2 = document.getElementById('pSenhaConf').value;
    const me = getUser(); 

    if (!s1 || s1.trim() === "") {
        mostrarModalMsg("Atenção", "A senha não pode estar vazia.", "danger");
        return;
    }

    if (s1 !== s2) {
        mostrarModalMsg("Erro", "As senhas digitadas não coincidem.", "danger");
        return;
    }

    const body = {
        id: idUsuario,
        nome: me.nome,
        login: me.login,
        tipo: me.tipo,
        senha: s1 
    };

    try {
        await fetchAPI(`/usuarios/${idUsuario}`, 'PUT', body);
        
        // Usando o seu modal de mensagem padronizado da Instituição
        mostrarModalMsg("Sucesso", "Senha administrativa atualizada com sucesso!");
        
        document.getElementById('pSenhaNova').value = '';
        document.getElementById('pSenhaConf').value = '';
        
    } catch(e) {
        console.error("Erro ao atualizar perfil:", e);
        mostrarModalMsg("Erro", "Falha ao atualizar senha: " + e.message, "danger");
    }
}