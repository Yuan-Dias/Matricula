// js/views/cursos.js

let cursoIdParaExcluir = null;

// --- Renderização da Estrutura Principal ---
async function instRenderCursos() {
    atualizarMenuAtivo('Cursos');
    const target = document.getElementById('appContent');
    if (!target) return;

    // Renderiza a estrutura fixa (Cabeçalho e Filtros)
    target.innerHTML = `
        <div class="fade-in">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                <div>
                    <h3 class="fw-bold text-dark mb-1">Gestão de Cursos</h3>
                    <p class="text-muted small mb-0">Gerencie a grade curricular, vagas e coordenação.</p>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-primary d-flex align-items-center px-4 shadow-sm" onclick="instAbrirModalCurso()">
                        <i class="fas fa-plus me-2"></i> Novo Curso
                    </button>
                </div>
            </div>

            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="card-header bg-white border-bottom border-light p-3">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <div class="input-group input-group-solid">
                                <span class="input-group-text bg-light border-0 ps-3"><i class="fas fa-search text-muted"></i></span>
                                <input type="text" id="buscaCursoInput" class="form-control bg-light border-0 shadow-none" 
                                       placeholder="Buscar curso, descrição..." oninput="instFiltrarCursos()">
                            </div>
                        </div>

                        <div class="col-md-6 text-md-end">
                            <button class="btn btn-light btn-sm text-muted" onclick="instFiltrarCursos()">
                                <i class="fas fa-sync-alt me-1"></i> Atualizar
                            </button>
                        </div>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0 custom-table">
                        <thead class="bg-light text-uppercase small fw-bold text-muted">
                            <tr>
                                <th class="ps-4 py-3" style="width: 35%;">Curso</th>
                                <th class="py-3" style="width: 25%;">Vagas & Ocupação</th>
                                <th class="py-3" style="width: 25%;">Coordenador</th>
                                <th class="text-end pe-4 py-3" style="width: 15%;">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="cursosTableBody">
                            <tr><td colspan="4" class="text-center p-5 text-muted"><i class="fas fa-circle-notch fa-spin me-2"></i> Carregando cursos...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Carrega os dados iniciais
    instFiltrarCursos();
}

// --- Lógica de Busca e Preenchimento da Tabela ---
async function instFiltrarCursos() {
    const termo = document.getElementById('buscaCursoInput')?.value.toLowerCase() || "";
    const container = document.getElementById('cursosTableBody');
    if (!container) return;

    try {
        // 1. Busca Cursos e Usuários
        const [cursos, usuarios] = await Promise.all([
            fetchAPI('/cursos'),
            fetchAPI('/usuarios')
        ]);

        const professores = usuarios.filter(u => u.tipo === 'PROFESSOR');

        // 2. Processa cada curso para buscar o Nome do Professor E as Vagas Preenchidas
        const cursosDetalhados = await Promise.all(cursos.map(async (c) => {
            let nomeProf = c.nomeProfessor;
            let idProf = c.idProfessor;

            // Lógica de Correção:
            // Se a API trouxe o nome, mas não o ID, procuramos o ID na lista de usuários carregada
            if (!idProf && nomeProf) {
                const professorEncontrado = professores.find(p => p.nome === nomeProf);
                if (professorEncontrado) {
                    idProf = professorEncontrado.id;
                }
            }

            // Fallback inverso: Se tem ID mas não tem nome (caso a API mude comportamento)
            if (idProf && !nomeProf) {
                const prof = professores.find(p => p.id === idProf);
                if (prof) nomeProf = prof.nome;
            }

            // Resolver vagas preenchidas
            let ocupadas = 0;
            try {
                const matriculas = await fetchAPI(`/matriculas/curso/${c.id}`);
                const alunosUnicos = new Set(matriculas.map(m => m.idAluno));
                ocupadas = alunosUnicos.size;
            } catch (err) {
                console.warn(`Erro ao contar vagas para o curso ${c.id}`, err);
            }

            return { 
                ...c, 
                idProfessor: idProf, // Garante que o ID vai para o botão de editar
                professorNome: nomeProf,
                vagasOcupadas: ocupadas 
            };
        }));

        // 3. Filtragem local
        let cursosFiltrados = cursosDetalhados.filter(c => 
            c.nome.toLowerCase().includes(termo) || 
            (c.descricao && c.descricao.toLowerCase().includes(termo))
        );

        // Ordenação Simples
        cursosFiltrados.sort((a, b) => a.nome.localeCompare(b.nome));

        if (cursosFiltrados.length === 0) {
            container.innerHTML = `<tr><td colspan="4" class="text-center p-5 text-muted">Nenhum curso encontrado</td></tr>`;
            return;
        }

        // 4. Renderização HTML
        container.innerHTML = cursosFiltrados.map(c => {
            const avatarColor = 'bg-soft-primary text-primary';
            
            // Cálculo da barra de progresso
            const capacidade = c.capacidade || 1; 
            const ocupadas = c.vagasOcupadas || 0;
            const porcentagem = Math.min(100, Math.round((ocupadas / capacidade) * 100));
            
            // Cor da barra baseada na lotação
            let progressClass = 'bg-success';
            if(porcentagem > 70) progressClass = 'bg-warning';
            if(porcentagem >= 95) progressClass = 'bg-danger';

            // HTML do Professor
            let coordDisplay = `<span class="text-muted small fst-italic">Não atribuído</span>`;
            if (c.professorNome) {
                coordDisplay = `
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle-sm bg-light text-secondary me-2 small" style="font-size:10px;">
                            ${getIniciais(c.professorNome)}
                        </div>
                        <span class="text-dark small fw-medium">${c.professorNome}</span>
                    </div>`;
            }

            // Precisamos escapar as aspas simples para o JSON dentro do HTML
            const dadosJson = JSON.stringify(c).replace(/'/g, "&#39;");

            return `
            <tr>
                <td class="ps-4 py-3">
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle ${avatarColor} me-3 flex-shrink-0">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <div>
                            <div class="fw-bold text-dark">${c.nome}</div>
                            <div class="small text-muted text-truncate" style="max-width: 250px;">
                                ${c.descricao || 'Sem descrição'}
                            </div>
                            <div class="small text-muted mt-1">
                                <i class="far fa-clock me-1"></i> ${c.cargaHoraria}h
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="d-flex flex-column" style="max-width: 180px;">
                        <div class="d-flex justify-content-between small mb-1">
                            <span class="fw-bold text-dark">${ocupadas} <span class="text-muted fw-normal">/ ${c.capacidade}</span></span>
                            <span class="text-muted">${porcentagem}%</span>
                        </div>
                        <div class="progress" style="height: 6px;">
                            <div class="progress-bar ${progressClass}" role="progressbar" style="width: ${porcentagem}%" 
                                aria-valuenow="${ocupadas}" aria-valuemin="0" aria-valuemax="${c.capacidade}"></div>
                        </div>
                        <div class="small text-muted mt-1" style="font-size: 0.75rem;">Vagas Preenchidas</div>
                    </div>
                </td>
                <td>${coordDisplay}</td>
                <td class="text-end pe-4">
                    <div class="d-flex justify-content-end gap-2">
                        <button class="btn-action-icon btn-action-edit" title="Editar" 
                            onclick='instAbrirModalCurso(${dadosJson})'>
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="btn-action-icon btn-action-delete" title="Excluir" 
                            onclick="instPreparaExclusaoCurso(${c.id}, '${c.nome.replace(/'/g, "\\'")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `}).join('');

    } catch (e) {
        console.error(e);
        container.innerHTML = '<tr><td colspan="4" class="text-center text-danger p-4">Erro ao carregar cursos.</td></tr>';
    }
}

// --- Modal e Formulário ---

async function instAbrirModalCurso(dados = null) {
    const form = document.getElementById('formCurso');
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
    }

    const title = document.getElementById('modalCursoTitle');
    const idInput = document.getElementById('cursoId');
    const selectProf = document.getElementById('cursoProfessorId');

    // Título e ID
    if (dados) {
        title.innerText = "Editar Curso";
        idInput.value = dados.id;
        document.getElementById('cursoNome').value = dados.nome;
        document.getElementById('cursoDescricao').value = dados.descricao || '';
        document.getElementById('cursoCargaHoraria').value = dados.cargaHoraria; 
        document.getElementById('cursoCapacidade').value = dados.capacidade;
    } else {
        title.innerText = "Cadastrar Novo Curso";
        idInput.value = '';
    }

    // Carregar Select de Professores E selecionar o correto
    // Passamos o ID se estiver editando, ou null se for novo
    await instCarregarSelectProfessores(selectProf, dados ? dados.idProfessor : null);

    const modal = new bootstrap.Modal(document.getElementById('modalCurso'));
    modal.show();
}

async function instCarregarSelectProfessores(selectElement, valorSelecionado) {
    selectElement.innerHTML = '<option value="">Carregando...</option>';
    try {
        const usuarios = await fetchAPI('/usuarios');
        const professores = usuarios.filter(u => u.tipo === 'PROFESSOR');
        
        let html = '<option value="">Selecione um coordenador...</option>';
        professores.forEach(p => {
            html += `<option value="${p.id}">${p.nome}</option>`;
        });
        
        selectElement.innerHTML = html;

        if (valorSelecionado !== null && valorSelecionado !== undefined) {
            selectElement.value = valorSelecionado;
        }

    } catch (e) {
        selectElement.innerHTML = '<option value="">Erro ao carregar</option>';
        console.error(e);
    }
}

async function instSalvarCurso() {
    const form = document.getElementById('formCurso');
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const id = document.getElementById('cursoId').value;
    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `/cursos/${id}` : '/cursos';

    const professorIdValue = document.getElementById('cursoProfessorId').value;

    const payload = {
        nome: document.getElementById('cursoNome').value,
        descricao: document.getElementById('cursoDescricao').value,
        cargaHoraria: parseInt(document.getElementById('cursoCargaHoraria').value),
        capacidade: parseInt(document.getElementById('cursoCapacidade').value),
        idProfessor: professorIdValue ? parseInt(professorIdValue) : null 
    };

    const btnSalvar = document.querySelector('#modalCurso .btn-primary');
    const txtOriginal = btnSalvar.innerHTML;
    btnSalvar.disabled = true;
    // O CSS deve garantir que o botão disabled continue verde
    btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';

    try {
        await fetchAPI(url, metodo, payload);
        
        const modalEl = document.getElementById('modalCurso');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if(modal) modal.hide();

        mostrarToast(id ? "Curso atualizado com sucesso!" : "Curso criado com sucesso!");
        await instFiltrarCursos(); 

    } catch (error) {
        console.error("Erro no payload:", payload); 
        console.error(error);
        
        let msgErro = "Erro ao salvar curso.";
        if (Array.isArray(error)) {
            msgErro = error.map(e => `${e.campo}: ${e.mensagem}`).join('<br>');
        }
        
        mostrarToast(msgErro, "error");
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = txtOriginal;
    }
}

// --- Exclusão ---

function instPreparaExclusaoCurso(id, nomeCurso) {
    cursoIdParaExcluir = id;
    
    const msgElement = document.getElementById('textoConfirmacaoExclusao');
    if (msgElement) {
        msgElement.innerHTML = `
            Tem certeza que deseja remover o curso <strong>${nomeCurso}</strong>?<br>
            <small class="text-danger mt-2 d-block">Isso pode afetar alunos e matérias vinculadas.</small>
        `;
    }

    const btnSim = document.querySelector('#modalConfirmarExclusao .btn-danger');
    if(btnSim) {
        btnSim.onclick = instConfirmarExclusaoCurso;
    }

    const modalEl = document.getElementById('modalConfirmarExclusao');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function instConfirmarExclusaoCurso() {
    if (!cursoIdParaExcluir) return;

    try {
        const modalEl = document.getElementById('modalConfirmarExclusao');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        await fetchAPI(`/cursos/${cursoIdParaExcluir}`, 'DELETE');
        
        mostrarToast("Curso removido com sucesso!");
        await instFiltrarCursos();

    } catch (error) {
        console.error(error);
        mostrarToast("Não foi possível excluir. Verifique se existem matérias vinculadas.", "error");
    } finally {
        cursoIdParaExcluir = null;
    }
}

function getIniciais(nome) {
    if(!nome) return '--';
    const partes = nome.split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}