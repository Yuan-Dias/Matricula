// ==================================================================================
// CONFIGURAÇÕES GLOBAIS E UTILITÁRIOS
// ==================================================================================
const appContent = document.getElementById("app-content");
const pageTitle = document.getElementById("page-title");
const sidebarMenu = document.getElementById("sidebar-menu");

let ordenacaoAtual = { coluna: null, ascendente: true };

const API_BASE_URL = "http://localhost:8080";
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem("sga_token");

    if (!token) {
        console.error("[FetchAPI] ERRO CRÍTICO: Token não encontrado (sga_token)!");
        instLogout(); 
        throw new Error("Usuário não autenticado (Token ausente).");
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (response.status === 401 || response.status === 403) {
            console.warn(`[FetchAPI] Acesso negado (${response.status}).`);
            if (response.status === 401) instLogout();
            throw new Error(`Acesso Negado (${response.status})`);
        }

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || `Erro ${response.status}`);
        }

        const text = await response.text();
        
        if (!text) return null;

        try {
            return JSON.parse(text);
        } catch (e) {
            return { message: text };
        }
        
    } catch (error) {
        console.error("Erro na requisição:", error);
        throw error;
    }
}

function instLogout() {
    console.log("Realizando Logout...");
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "index.html"; 
}

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

    const appContent = document.getElementById('appContent');
    if (!appContent) return;

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
        'PROFESSOR': '<span class="badge bg-warning text-dark bg-opacity-75 rounded-pill px-3">PROFESSOR</span>',
        'ALUNO': '<span class="badge bg-info text-dark bg-opacity-75 rounded-pill px-3">ALUNO</span>',
        'APROVADO': '<span class="badge bg-success rounded-pill px-3">APROVADO</span>',
        'REPROVADO': '<span class="badge bg-danger rounded-pill px-3">REPROVADO</span>',
        'RECUPERACAO': '<span class="badge bg-warning text-dark rounded-pill px-3">RECUPERAÇÃO</span>',
        'CURSANDO': '<span class="badge bg-primary rounded-pill px-3">CURSANDO</span>'
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

    const appContent = document.getElementById('appContent');
    if (!appContent) return;


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

// ==================================================================================
// SEÇÃO 3: USUÁRIOS (PROFESSORES E ALUNOS)
// ==================================================================================
async function instRenderUsuarios() {
    atualizarMenuAtivo('Usuários');

    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
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
        if(ordenacaoAtual.coluna) usuarios = ordenarDados(usuarios, ordenacaoAtual.coluna, ordenacaoAtual.direcao);

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

async function instSalvarUsuario() {
    const form = document.getElementById('formUsuario');
    const id = document.getElementById('usuarioId')?.value;
    const tipo = document.getElementById('usuarioTipo').value;
    const senhaInput = document.getElementById('usuarioSenha');
    const cpfInput = document.getElementById('usuarioCpf');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const body = {
        nome: document.getElementById('usuarioNome').value,
        login: document.getElementById('usuarioLogin').value,
        tipo: tipo
    };

    if (id) body.id = parseInt(id);
    if (senhaInput.value) body.senha = senhaInput.value;

    try {
        let url;
        if (tipo === 'ALUNO') {
            url = id ? `/alunos/${id}` : '/alunos';
            body.cpf = cpfInput.value.replace(/\D/g, ''); 
            
            if (body.cpf.length !== 11) {
                throw new Error("CPF deve conter 11 dígitos.");
            }
        } else {
            url = id ? `/usuarios/${id}` : '/usuarios';
        }

        await fetchAPI(url, id ? 'PUT' : 'POST', body);
        
        bootstrap.Modal.getInstance(document.getElementById('modalUsuario'))?.hide();
        instRenderUsuarios(); 
        mostrarToast("Usuário salvo com sucesso!");
    } catch(e) {
        exibirErroVisual(e.message);
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

async function instVerDesempenhoMateria(idMateria) {
    try {
        const todasMatriculas = await fetchAPI('/matriculas');
        const matriculasDaMateria = todasMatriculas.filter(m => m.idMateria === idMateria);

        let html = `
            <table class="table table-sm align-middle">
                <thead>
                    <tr>
                        <th>Aluno</th>
                        <th class="text-center">Média</th>
                        <th class="text-center">Situação</th>
                    </tr>
                </thead>
                <tbody>
                    ${matriculasDaMateria.map(m => {
                        let badgeClass = 'bg-secondary';
                        if (m.situacao === 'APROVADO') badgeClass = 'bg-success';
                        else if (m.situacao === 'RECUPERACAO') badgeClass = 'bg-warning text-dark';
                        else if (m.situacao === 'REPROVADO') badgeClass = 'bg-danger';
                        else if (m.situacao === 'CURSANDO') badgeClass = 'bg-primary';

                        return `
                        <tr>
                            <td>${m.nomeAluno}</td>
                            <td class="text-center fw-bold">${m.mediaFinal.toFixed(1)}</td>
                            <td class="text-center">
                                <span class="badge ${badgeClass}">${m.situacao}</span>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>`;
        
        document.getElementById('modalGenericoCorpo').innerHTML = html;
        document.getElementById('modalGenericoTitulo').innerText = "Desempenho da Turma";
        new bootstrap.Modal(document.getElementById('modalGenerico')).show();

    } catch (e) {
        mostrarToast("Erro ao carregar notas", "error");
    }
}

// ==================================================================================
// SEÇÃO 4: CURSOS
// ==================================================================================

async function instRenderCursos() {
    atualizarMenuAtivo('Cursos');

    const appContent = document.getElementById('appContent');
    if (!appContent) return;

    
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
        
        // Filtra pelo termo digitado
        cursos = filtrarDados(cursos, termo, ['nome', 'descricao', 'nomeProfessor']);
        
        // Ordenação alfabética
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
                        <p class="text-primary small mb-2"><i class="fas fa-chalkboard-teacher me-1"></i>${c.nomeProfessor || 'Sem professor'}</p>
                        <p class="card-text text-muted small mb-4 flex-grow-1">${c.descricao || 'Sem descrição.'}</p>
                        
                        <div class="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                            <span class="small text-muted">Vagas: ${c.capacidade}</span>
                            
                            <div>
                                <button class="btn btn-outline-primary btn-sm border-0 me-1" 
                                        onclick="instEditarCurso(${c.id})" 
                                        title="Editar Curso">
                                    <i class="fas fa-pen"></i>
                                </button>
                                
                                <button class="btn btn-outline-danger btn-sm border-0" 
                                        onclick="instDeletarCurso(${c.id})"
                                        title="Excluir Curso">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        if (cursos.length === 0) {
            container.innerHTML = '<div class="col-12 text-center text-muted py-5">Nenhum curso encontrado.</div>';
        }

    } catch (e) { 
        console.error(e);
        container.innerHTML = '<div class="alert alert-danger">Erro ao carregar cursos.</div>'; 
    }
}

// --- FUNÇÃO DE ABRIR MODAL VAZIO (CRIAR) ---
async function instAbrirModalCurso() {
    const form = document.getElementById('formCurso');
    if(form) {
        form.reset();
        form.classList.remove('was-validated');
    }
    
    document.getElementById('cursoId').value = '';
    document.getElementById('modalCursoTitle').innerText = 'Criar Novo Curso';
    
    await instCarregarSelectProfessores();
    
    const modalElement = document.getElementById('modalCurso');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}

// --- FUNÇÃO DE ABRIR MODAL PREENCHIDO (EDITAR) ---
async function instEditarCurso(id) {
    try {
        const cursos = await fetchAPI('/cursos');
        const curso = cursos.find(c => c.id === id);

        if (!curso) {
            mostrarToast("Curso não encontrado.", "error");
            return;
        }

        document.getElementById('cursoId').value = curso.id;
        document.getElementById('cursoNome').value = curso.nome;
        document.getElementById('cursoDescricao').value = curso.descricao || '';
        document.getElementById('cursoCargaHoraria').value = curso.cargaHoraria;
        document.getElementById('cursoCapacidade').value = curso.capacidade;
        
        document.getElementById('modalCursoTitle').innerText = 'Editar Curso';

        await instCarregarSelectProfessores();
        
        if (curso.idProfessor) {
            document.getElementById('cursoProfessorId').value = curso.idProfessor;
        }

        const form = document.getElementById('formCurso');
        form.classList.remove('was-validated');

        const modal = new bootstrap.Modal(document.getElementById('modalCurso'));
        modal.show();

    } catch (error) {
        console.error("Erro ao carregar edição:", error);
        alert("Erro ao carregar dados do curso.");
    }
}

// --- FUNÇÃO DE SALVAR (SERVE PARA POST E PUT) ---
async function instSalvarCurso() {
    const form = document.getElementById('formCurso');
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        if (typeof mostrarToast === 'function') {
            mostrarToast("Preencha todos os campos obrigatórios.", "danger");
        } else {
            alert("Preencha todos os campos obrigatórios.");
        }
        return;
    }

    const id = document.getElementById('cursoId').value;
    const nome = document.getElementById('cursoNome').value;
    const descricao = document.getElementById('cursoDescricao').value;
    const cargaHoraria = document.getElementById('cursoCargaHoraria').value;
    const capacidade = document.getElementById('cursoCapacidade').value;
    const idProfessor = document.getElementById('cursoProfessorId').value;

    try {
        const body = {
            nome: nome,
            descricao: descricao,
            cargaHoraria: parseInt(cargaHoraria),
            capacidade: parseInt(capacidade),
            idProfessor: parseInt(idProfessor)
        };

        let url = '/cursos';
        let method = 'POST';

        if (id) {
            url = `/cursos/${id}`;
            method = 'PUT';
            body.id = parseInt(id);
        }

        await fetchAPI(url, method, body);
        
        const modalElement = document.getElementById('modalCurso');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();

        if (typeof mostrarToast === 'function') {
            mostrarToast("Curso salvo com sucesso!", "success");
        }
        instRenderCursos();

    } catch(e) {
        console.error(e);
        if (typeof exibirErroVisual === 'function') {
            exibirErroVisual("Erro ao processar curso: " + e.message);
        } else {
            alert("Erro: " + e.message);
        }
    }
}

async function instDeletarCurso(id) {
    if(confirm("Tem certeza que deseja excluir este curso?")) {
        try {
            await fetchAPI(`/cursos/${id}`, 'DELETE');
            instRenderCursos();
            if (typeof mostrarToast === 'function') mostrarToast("Curso removido!", "success");
        } catch(e) {
            alert("Erro ao excluir curso: " + (e.message || "Erro desconhecido"));
        }
    }
}

// ==================================================================================
// SEÇÃO 5: MATÉRIAS
// ==================================================================================

function instAdicionarLinhaNota(descricao = '', peso = '') {
    const container = document.getElementById('containerNotasConfig');
    const idUnico = Date.now() + Math.random();

    const div = document.createElement('div');
    div.className = 'd-flex gap-2 align-items-center nota-row';
    div.id = `nota-${idUnico}`;
    
    div.innerHTML = `
        <input type="text" class="form-control form-control-sm input-desc-nota" 
               placeholder="Ex: Prova 1" value="${descricao}" required>
        
        <input type="number" step="0.1" class="form-control form-control-sm input-peso-nota" 
               placeholder="Peso (ex: 3.5)" style="width: 120px;" value="${peso}" required>
        
        <button type="button" class="btn btn-sm btn-outline-danger border-0" 
                onclick="document.getElementById('nota-${idUnico}').remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(div);
}

async function instRenderMaterias() {
    atualizarMenuAtivo('Matérias');

    const appContent = document.getElementById('appContent');
    if (!appContent) return;
    
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
                        <th>Configuração</th>
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
        
        if(typeof ordenacaoAtual !== 'undefined' && ordenacaoAtual.coluna) {
            materias = ordenarDados(materias, ordenacaoAtual.coluna);
        }

        container.innerHTML = materias.map(m => {
            const listaNotas = m.avaliacoes || m.notasConfig || [];
            const isEncerrada = m.encerrada || m.status === 'FINALIZADA';

            let htmlNotas;
            if (listaNotas.length > 0) {
                const cores = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                const barras = listaNotas.map((nota, index) => {
                    const desc = nota.descricaoNota || nota.descricao || 'Nota';
                    const peso = parseFloat(nota.peso);
                    const largura = (peso * 10); 
                    const cor = cores[index % cores.length];
                    return `<div class="d-flex flex-column" style="width: ${largura}%; background-color: ${cor}; border-right: 1px solid #fff;" title="${desc}: Peso ${peso}"></div>`;
                }).join('');

                const legendas = listaNotas.map((nota, index) => {
                    const desc = nota.descricaoNota || nota.descricao || 'Nota';
                    const peso = parseFloat(nota.peso);
                    const cor = cores[index % cores.length];
                    return `
                        <div class="d-flex align-items-center me-3 mb-1" style="font-size: 0.75rem;">
                            <span style="width: 8px; height: 8px; background-color: ${cor}; border-radius: 50%; display: inline-block; margin-right: 5px;"></span>
                            <span class="text-muted text-truncate" style="max-width: 80px;" title="${desc}">${desc}</span>
                            <strong class="ms-1 text-dark">(${peso})</strong>
                        </div>`;
                }).join('');

                htmlNotas = `
                    <div class="d-flex flex-column" style="width: 100%; max-width: 250px;">
                        <div class="d-flex rounded-3 overflow-hidden shadow-sm border mb-2" style="height: 10px; background: #e2e8f0;">
                            ${barras}
                        </div>
                        <div class="d-flex flex-wrap">${legendas}</div>
                    </div>`;
            } else {
                htmlNotas = `<small class="text-muted fst-italic">Padrão (N1/N2)</small>`;
            }

            return `
                <tr class="${isEncerrada ? 'opacity-75' : ''}">
                    <td class="ps-3">
                        <div class="fw-bold text-dark">${m.nome}</div>
                        <div class="small text-muted">
                            <i class="fas fa-chalkboard-teacher me-1"></i> ${m.nomeProfessor || 'Sem prof.'}
                        </div>
                    </td>
                    <td>
                        <span class="badge bg-light text-dark border">${m.nomeCurso}</span>
                        <br>
                        ${isEncerrada 
                            ? '<span class="badge bg-danger-subtle text-danger mt-1" style="font-size:0.65rem">ENCERRADA</span>' 
                            : '<span class="badge bg-success-subtle text-success mt-1" style="font-size:0.65rem">ATIVA</span>'}
                    </td>
                    <td>${htmlNotas}</td>
                    <td class="text-end pe-3">
                        <button class="btn btn-sm btn-outline-info border-0 me-1" 
                                title="Ver Notas/Desempenho" onclick="instVerAlunos(${m.id}, '${m.nome}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm ${isEncerrada ? 'btn-success' : 'btn-outline-warning'} border-0 me-1" 
                                title="${isEncerrada ? 'Matéria Encerrada' : 'Encerrar Matéria'}" 
                                onclick="instFinalizarMateria(${m.id}, '${m.nome}')" ${isEncerrada ? 'disabled' : ''}>
                            <i class="fas ${isEncerrada ? 'fa-check-double' : 'fa-lock'}"></i>
                        </button>
                        <hr class="my-1 opacity-25"> 
                        <button class="btn btn-sm btn-outline-primary border-0 me-1" 
                                title="Editar" onclick="instPrepararEdicaoMateria(${m.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger border-0" 
                                title="Excluir" onclick="instDeletarMateria(${m.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        }).join('');
    } catch(e) { 
        console.error(e);
        container.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Erro ao carregar dados.</td></tr>'; 
    }
}

async function instPrepararEdicaoMateria(id) {
    try {
        const materias = await fetchAPI('/materias');
        const materiaAlvo = materias.find(m => m.id === id);
        if (!materiaAlvo) return;

        let avaliacoes = [];
        try {
            avaliacoes = await fetchAPI(`/materias/${id}/avaliacoes`);
        } catch (err) {
            console.log("Sem avaliações específicas ou erro ao buscar notas.");
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
        alert("Erro ao carregar dados da matéria: " + e.message);
    }
}

async function instAbrirModalMateria(dados = null, modoProfessor = false) {
    const form = document.getElementById('formMateria');
    const containerNotas = document.getElementById('containerNotasConfig');
    
    if(form) {
        form.reset();
        form.classList.remove('was-validated');
    }
    if(containerNotas) containerNotas.innerHTML = '';

    const modalTitle = document.getElementById('modalMateriaTitle');
    
    const elId = document.getElementById('materiaId');
    const elNome = document.getElementById('materiaNome');
    const elDesc = document.getElementById('materiaDescricao');
    const elCursoSelect = document.getElementById('materiaCursoSelect');
    const elProfSelect = document.getElementById('materiaProfSelect');
    
    const divProfContainer = elProfSelect.closest('.mb-3') || elProfSelect.parentElement;

    try {        
        if (!modoProfessor) {
            const [cursos, usuarios] = await Promise.all([
                fetchAPI('/cursos'),
                fetchAPI('/usuarios')
            ]);
            const profs = usuarios.filter(u => u.tipo === 'PROFESSOR' || u.role === 'PROFESSOR');

            elCursoSelect.innerHTML = '<option value="" selected disabled>Selecione...</option>' + 
                cursos.map(c => `<option value="${c.id}">${c.nome}</option>`).join('');
            
            elProfSelect.innerHTML = '<option value="">Sem professor</option>' + 
                profs.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');

            elNome.readOnly = false;
            elDesc.readOnly = false;
            elCursoSelect.disabled = false;
            if(divProfContainer) divProfContainer.style.display = 'block';

        } else {
            
            elNome.readOnly = true;
            elDesc.readOnly = true;
            elCursoSelect.disabled = true; 
            
            if(divProfContainer) divProfContainer.style.display = 'none';
        }

        if (dados) {
            if(modalTitle) {
                modalTitle.innerText = modoProfessor ? "Configurar Pesos e Notas" : "Editar Matéria";
            }

            elId.value = dados.id;
            elNome.value = dados.nome;
            elDesc.value = dados.descricao || '';

            if (!modoProfessor) {
                if (dados.idCurso) elCursoSelect.value = dados.idCurso;
                else if (dados.nomeCurso) {
                    Array.from(elCursoSelect.options).forEach(opt => {
                        if(opt.text === dados.nomeCurso) elCursoSelect.value = opt.value;
                    });
                }

                if (dados.idProfessor) elProfSelect.value = dados.idProfessor;
            } else {
                elCursoSelect.innerHTML = `<option value="${dados.idCurso}" selected>${dados.nomeCurso || 'Curso Atual'}</option>`;
                elProfSelect.innerHTML = `<option value="${dados.idProfessor}" selected>Eu</option>`;
            }

            if (dados.notasConfig && dados.notasConfig.length > 0) {
                dados.notasConfig.forEach(nota => {
                    const desc = nota.descricaoNota || nota.descricao || nota.nome || '';
                    instAdicionarLinhaNota(desc, nota.peso);
                });
            } else {
                instAdicionarLinhaNota('', '');
            }

        } else {
            if(modalTitle) modalTitle.innerText = "Nova Matéria";
            elId.value = '';
            instAdicionarLinhaNota(); 
        }

        const modalEl = document.getElementById('modalMateria');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();

    } catch(e) {
        console.error("Erro ao abrir modal:", e);
        alert("Erro ao carregar formulário: " + e.message);
    }
}

async function instSalvarMateria() {
    const form = document.getElementById('formMateria');

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        mostrarToast("Preencha os campos obrigatórios.", "error");
        return;
    }

    const inputId = document.getElementById('materiaId')?.value;
    const idExistente = inputId ? parseInt(inputId) : null;
    
    const nome = document.getElementById('materiaNome').value;
    const cursoId = document.getElementById('materiaCursoSelect').value;
    const descricao = document.getElementById('materiaDescricao').value;
    const idProfessor = document.getElementById('materiaProfSelect').value;

    const notasRows = document.querySelectorAll('.nota-row');
    const notasConfig = [];
    let pesoTotal = 0;

    notasRows.forEach(row => {
        const desc = row.querySelector('.input-desc-nota').value;
        const peso = parseFloat(row.querySelector('.input-peso-nota').value);
        if(desc && !isNaN(peso)) {
            notasConfig.push({ descricaoNota: desc, peso: peso });
            pesoTotal += peso;
        }
    });

    if (notasConfig.length > 0 && Math.abs(pesoTotal - 10) > 0.01) {
         if(!confirm(`Atenção: A soma dos pesos é ${pesoTotal.toFixed(1)}. Deseja salvar mesmo assim?`)) return;
    }

    try {
        const bodyMateria = {
            nome,
            descricao,
            idCurso: parseInt(cursoId),
            idProfessor: idProfessor ? parseInt(idProfessor) : null
        };

        if (idExistente) bodyMateria.id = idExistente;

        const responseMateria = await fetchAPI(
            idExistente ? `/materias/${idExistente}` : '/materias', 
            idExistente ? 'PUT' : 'POST', 
            bodyMateria
        );
        
        let finalId = idExistente;
        
        if (!finalId && responseMateria) {
            if (typeof responseMateria === 'object') {
                finalId = responseMateria.id || responseMateria.ID;
            } else if (!isNaN(responseMateria)) {
                finalId = responseMateria;
            }
        }

        if (!finalId && !idExistente) {
            console.log("Backend não retornou ID. Buscando última matéria criada...");
            const todasMaterias = await fetchAPI('/materias');
            const achada = todasMaterias.find(m => m.nome === nome && m.idCurso == cursoId);
            if (achada) finalId = achada.id;
        }

        if (finalId) {
            await fetchAPI(`/materias/${finalId}/avaliacoes`, 'PUT', notasConfig);
        } else {
            throw new Error("Matéria salva, mas não conseguimos identificar o ID para salvar os pesos.");
        }

        const modalEl = document.getElementById('modalMateria');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();
        
        instRenderMaterias();
        mostrarToast("Matéria e critérios de avaliação salvos!", "success");

    } catch(e) {
        console.error("Erro no processo:", e);
        mostrarToast(e.message, "danger");
    }
}

async function instDeletarMateria(id) {
    if(confirm("Remover matéria e suas configurações?")) {
        try {
            await fetchAPI(`/materias/${id}`, 'DELETE');
            instRenderMaterias();
            mostrarToast("Matéria removida.");
        } catch(e) {
            alert("Erro ao deletar matéria.");
        }
    }
}

async function instFinalizarMateria(idMateria, nomeMateria) {
    const nomeExibicao = nomeMateria || "esta matéria";

    try {
        const [avaliacoes, matriculas] = await Promise.all([
            fetchAPI(`/materias/${idMateria}/avaliacoes`),
            fetchAPI('/matriculas')
        ]);

        const alunosDaTurma = matriculas.filter(mat => mat.idMateria == idMateria);
        
        if (alunosDaTurma.length === 0) {
            return mostrarToast("Não há alunos matriculados para finalizar esta matéria.", "warning");
        }

        const totalCriterios = avaliacoes.length;

        const pendentes = alunosDaTurma.filter(a => {
            const notasLancadas = Array.isArray(a.notas) 
                ? a.notas.filter(n => n.valor !== null && n.valor !== undefined).length 
                : 0;
            return notasLancadas < totalCriterios;
        });

        if (pendentes.length > 0) {
            return mostrarToast(`Impossível finalizar: ${pendentes.length} aluno(s) ainda não possuem todas as notas lançadas.`, "danger");
        }

        if (!confirm(`Confirma o fechamento de "${nomeExibicao}"?\n\nAs médias serão calculadas e a matéria será bloqueada para novas notas.`)) return;

        const resultado = await fetchAPI(`/matriculas/encerrar/${idMateria}`, 'PUT', {});
        
        mostrarToast("Matéria encerrada e médias processadas com sucesso!", "success");
        
        if (typeof instRenderMaterias === 'function') {
            instRenderMaterias();
        } else {
            location.reload();
        }

    } catch (e) {
        console.error("Erro detalhado:", e);
        const msgFriendly = e.message.includes("rollback") 
            ? "Erro no servidor ao processar médias. Verifique se todos os pesos das notas somam 10." 
            : e.message;
            
        mostrarToast(msgFriendly || "Erro interno ao finalizar matéria.", "danger");
    }
}

async function instVerAlunos(idMateria, nomeMateria) {
    try {
        const [materia, avaliacoes, matriculas] = await Promise.all([
            fetchAPI(`/materias/${idMateria}`),
            fetchAPI(`/materias/${idMateria}/avaliacoes`), 
            fetchAPI('/matriculas')
        ]);
        
        const isFinalizada = materia.status === 'FINALIZADA' || materia.encerrada;
        const alunosDaTurma = matriculas.filter(mat => mat.idMateria == idMateria);
        const appContent = document.getElementById('appContent');

        const configs = avaliacoes || []; 
        let tableHeader = `
            <tr>
                <th class="ps-4">Aluno</th>
                ${configs.map(av => `<th class="text-center small">${av.descricaoNota || av.nome}<br>(P${av.peso})</th>`).join('')}
                <th class="text-center bg-light border-start">Média</th>
                <th class="text-center">Status</th>
            </tr>`;

        let tableBody = alunosDaTurma.length === 0 
            ? '<tr><td colspan="10" class="text-center py-5 text-muted">Nenhum aluno matriculado nesta disciplina.</td></tr>'
            : alunosDaTurma.map(a => {
                const mapaNotas = {};
                if (Array.isArray(a.notas)) {
                    a.notas.forEach(n => { mapaNotas[n.idConfiguracao] = n.valor; });
                }
                
                const notasPreenchidas = configs.filter(av => mapaNotas[av.id] !== undefined && mapaNotas[av.id] !== null).length;
                const temTodasAsNotas = configs.length > 0 ? notasPreenchidas === configs.length : (a.mediaFinal !== undefined);
                
                const media = (a.mediaFinal !== undefined && a.mediaFinal !== null) ? parseFloat(a.mediaFinal) : 0;

                let statusBadge = '';
                if (!temTodasAsNotas && !isFinalizada) {
                    statusBadge = '<span class="badge bg-info-subtle text-info border border-info">CURSANDO</span>';
                } else {
                    if (media >= 7.0) {
                        statusBadge = '<span class="badge bg-success-subtle text-success border border-success">APROVADO</span>';
                    } else if (media >= 5.0) {
                        statusBadge = '<span class="badge bg-warning-subtle text-warning border border-warning">RECUPERAÇÃO</span>';
                    } else {
                        statusBadge = '<span class="badge bg-danger-subtle text-danger border border-danger">REPROVADO</span>';
                    }
                }

                return `
                    <tr class="${isFinalizada ? 'table-light' : ''}">
                        <td class="align-middle ps-4 fw-bold text-dark">${a.nomeAluno}</td>
                        ${configs.map(av => {
                            const valor = mapaNotas[av.id];
                            return `<td class="text-center">${(valor !== undefined && valor !== null) ? Number(valor).toFixed(1) : '-'}</td>`;
                        }).join('')}
                        <td class="text-center align-middle bg-light border-start fw-bold">${media.toFixed(1)}</td>
                        <td class="text-center align-middle">${statusBadge}</td>
                    </tr>`;
            }).join('');

        appContent.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-4 bg-white p-3 rounded shadow-sm border-start border-primary border-4">
                <div>
                    <h4 class="m-0 fw-bold">Matéria: <span class="text-primary">${nomeMateria}</span></h4>
                    <span class="badge ${isFinalizada ? 'bg-danger' : 'bg-success'}">${isFinalizada ? 'CONCLUÍDA' : 'EM ANDAMENTO'}</span>
                </div>
                <div>
                    ${!isFinalizada ? `
                        <button class="btn btn-sm btn-danger me-2 fw-bold" onclick="instFinalizarMateria(${idMateria}, '${nomeMateria}')">
                            <i class="fas fa-check-double me-1"></i> Finalizar Matéria
                        </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-secondary px-3" onclick="instRenderMaterias()">Voltar</button>
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
        console.error(error);
        mostrarToast("Erro ao carregar diário de classe.", "danger");
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

    const appContent = document.getElementById('appContent');
    if (!appContent) return;

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
        
        mostrarModalMsg("Sucesso", "Senha administrativa atualizada com sucesso!");
        
        document.getElementById('pSenhaNova').value = '';
        document.getElementById('pSenhaConf').value = '';
        
    } catch(e) {
        console.error("Erro ao atualizar perfil:", e);
        mostrarModalMsg("Erro", "Falha ao atualizar senha: " + e.message, "danger");
    }
}