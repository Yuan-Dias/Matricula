var listaCursosGlobal = [];
var listaProfessoresGlobal = [];

async function instRenderCursos() {
    atualizarMenuAtivo('Cursos');
    const target = document.getElementById('appContent');
    if (!target) return;

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
                                       placeholder="Buscar curso, descrição..." oninput="instFiltrarCursosLocal()">
                            </div>
                        </div>

                        <div class="col-md-6 text-md-end">
                            <button class="btn btn-light btn-sm text-muted" onclick="instCarregarDadosCursos()">
                                <i class="fas fa-sync-alt me-1"></i> Atualizar Dados
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
        
        <div class="modal fade" id="modalCurso" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-white border-bottom-0">
                        <h5 class="modal-title fw-bold" id="modalCursoTitle">Novo Curso</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        <form id="formCurso" class="needs-validation" novalidate onsubmit="return false;">
                            <input type="hidden" id="cursoId">
                            
                            <div class="mb-3">
                                <label for="cursoNome" class="form-label small fw-bold text-muted text-uppercase">Nome do Curso</label>
                                <input type="text" class="form-control" id="cursoNome" required placeholder="Ex: Engenharia de Software">
                                <div class="invalid-feedback">O nome é obrigatório.</div>
                            </div>

                            <div class="mb-3">
                                <label for="cursoDescricao" class="form-label small fw-bold text-muted text-uppercase">Descrição</label>
                                <textarea class="form-control" id="cursoDescricao" rows="2" placeholder="Breve resumo do curso..."></textarea>
                            </div>

                            <div class="row g-3 mb-3">
                                <div class="col-6">
                                    <label for="cursoCargaHoraria" class="form-label small fw-bold text-muted text-uppercase">Carga (h)</label>
                                    <input type="number" class="form-control" id="cursoCargaHoraria" required placeholder="Ex: 3600">
                                </div>
                                <div class="col-6">
                                    <label for="cursoCapacidade" class="form-label small fw-bold text-muted text-uppercase">Vagas Totais</label>
                                    <input type="number" class="form-control" id="cursoCapacidade" required placeholder="Ex: 40">
                                </div>
                            </div>

                            <div class="mb-4">
                                <label for="cursoProfessorId" class="form-label small fw-bold text-muted text-uppercase">Coordenador (Professor)</label>
                                <select class="form-select" id="cursoProfessorId">
                                    <option value="">Carregando professores...</option>
                                </select>
                            </div>

                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary" onclick="instSalvarCurso()">
                                    <i class="fas fa-save me-2"></i> Salvar Curso
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    await instCarregarDadosCursos();
}

async function instCarregarDadosCursos() {
    const container = document.getElementById('cursosTableBody');
    if(container) container.innerHTML = '<tr><td colspan="4" class="text-center p-5 text-muted"><i class="fas fa-circle-notch fa-spin me-2"></i> Atualizando...</td></tr>';

    try {
        const [cursos, usuarios, todasMatriculas] = await Promise.all([
            fetchAPI('/cursos'),
            fetchAPI('/usuarios'),
            fetchAPI('/matriculas') 
        ]);

        listaProfessoresGlobal = usuarios.filter(u => u.tipo === 'PROFESSOR');

        listaCursosGlobal = cursos.map(c => {
            let nomeProf = c.nomeProfessor;
            let idProf = c.idProfessor;

            if (!idProf && nomeProf) {
                const professorEncontrado = listaProfessoresGlobal.find(p => p.nome === nomeProf);
                if (professorEncontrado) idProf = professorEncontrado.id;
            }
            if (idProf && !nomeProf) {
                const prof = listaProfessoresGlobal.find(p => p.id === idProf);
                if (prof) nomeProf = prof.nome;
            }

            const matriculasDoCurso = todasMatriculas ? todasMatriculas.filter(m => m.idCurso === c.id || (m.curso && m.curso.id === c.id)) : [];
            const alunosUnicos = new Set(matriculasDoCurso.map(m => m.idAluno || (m.aluno ? m.aluno.id : null)));
            
            return { 
                ...c, 
                idProfessor: idProf, 
                professorNome: nomeProf,
                vagasOcupadas: alunosUnicos.size 
            };
        });

        listaCursosGlobal.sort((a, b) => a.nome.localeCompare(b.nome));

        instRenderizarTabela(listaCursosGlobal);

    } catch (error) {
        console.error("Erro ao carregar cursos:", error);
        if(container) container.innerHTML = '<tr><td colspan="4" class="text-center text-danger p-4">Erro ao carregar dados. Tente atualizar.</td></tr>';
    }
}

function instFiltrarCursosLocal() {
    const termo = document.getElementById('buscaCursoInput')?.value.toLowerCase() || "";
    
    const cursosFiltrados = listaCursosGlobal.filter(c => 
        c.nome.toLowerCase().includes(termo) || 
        (c.descricao && c.descricao.toLowerCase().includes(termo))
    );

    instRenderizarTabela(cursosFiltrados);
}

function instRenderizarTabela(cursos) {
    const container = document.getElementById('cursosTableBody');
    if (!container) return;

    if (!cursos || cursos.length === 0) {
        container.innerHTML = `<tr><td colspan="4" class="text-center p-5 text-muted">Nenhum curso encontrado</td></tr>`;
        return;
    }

    container.innerHTML = cursos.map(c => {
        const avatarColor = 'bg-primary bg-opacity-10 text-primary';
        
        const capacidade = c.capacidade || 1; 
        const ocupadas = c.vagasOcupadas || 0;
        const porcentagem = Math.min(100, Math.round((ocupadas / capacidade) * 100));
        
        let progressClass = 'bg-success';
        if(porcentagem > 70) progressClass = 'bg-warning';
        if(porcentagem >= 95) progressClass = 'bg-danger';

        let coordDisplay = `<span class="text-muted small fst-italic">Não atribuído</span>`;
        if (c.professorNome) {
            coordDisplay = `
                <div class="d-flex align-items-center">
                    <div class="rounded-circle bg-light text-secondary me-2 small d-flex align-items-center justify-content-center border" style="width:24px; height:24px; font-size:10px;">
                        ${getIniciais(c.professorNome)}
                    </div>
                    <span class="text-dark small fw-medium">${c.professorNome}</span>
                </div>`;
        }

        return `
        <tr>
            <td class="ps-4 py-3">
                <div class="d-flex align-items-center">
                    <div class="rounded-circle ${avatarColor} me-3 flex-shrink-0 d-flex align-items-center justify-content-center" style="width:40px; height:40px;">
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
                    <button class="btn btn-sm btn-outline-primary" title="Editar" 
                        onclick="instAbrirModalCurso(${c.id})">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Excluir" 
                        onclick="instPreparaExclusaoCurso(${c.id}, '${c.nome.replace(/'/g, "\\'")}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `}).join('');
}

async function instAbrirModalCurso(idCurso = null) {
    const form = document.getElementById('formCurso');
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
    }

    const title = document.getElementById('modalCursoTitle');
    const idInput = document.getElementById('cursoId');
    const selectProf = document.getElementById('cursoProfessorId');

    let dados = null;

    if (idCurso) {
        dados = listaCursosGlobal.find(c => c.id === idCurso);
    }

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

    if (listaProfessoresGlobal.length === 0) {
        try {
            const usuarios = await fetchAPI('/usuarios');
            listaProfessoresGlobal = usuarios.filter(u => u.tipo === 'PROFESSOR');
        } catch(e) { console.error(e); }
    }
    
    instPreencherSelectProfessores(selectProf, dados ? dados.idProfessor : null);

    const modal = new bootstrap.Modal(document.getElementById('modalCurso'));
    modal.show();
}

function instPreencherSelectProfessores(selectElement, valorSelecionado) {
    let html = '<option value="">Selecione um coordenador...</option>';
    
    listaProfessoresGlobal.forEach(p => {
        const selected = (valorSelecionado && p.id == valorSelecionado) ? 'selected' : '';
        html += `<option value="${p.id}" ${selected}>${p.nome}</option>`;
    });
    
    selectElement.innerHTML = html;
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
    btnSalvar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Salvando...';

    try {
        await fetchAPI(url, metodo, payload);
        
        const modalEl = document.getElementById('modalCurso');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if(modal) modal.hide();

        mostrarToast(id ? "Curso atualizado com sucesso!" : "Curso criado com sucesso!");
        await instCarregarDadosCursos(); // Recarrega a tabela

    } catch (error) {
        console.error("Erro no payload:", payload); 
        console.error(error);
        
        let msgErro = "Erro ao salvar curso.";
        if (Array.isArray(error)) {
            msgErro = error.map(e => `${e.campo}: ${e.mensagem}`).join('<br>');
        }
        
        mostrarToast(msgErro, "danger");
    } finally {
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = txtOriginal;
    }
}

// FUNÇÕES DE EXCLUSÃO

function instPreparaExclusaoCurso(id, nomeCurso) {
    mostrarModalConfirmacao(
        "Excluir Curso?", 
        `Tem certeza que deseja remover o curso <strong>${nomeCurso}</strong>?<br>
        <small class="text-danger">Isso pode afetar alunos e matérias vinculadas.</small>`,
        () => instExecutarExclusaoCurso(id),
        "danger"
    );
}

async function instExecutarExclusaoCurso(id) {
    try {
        await fetchAPI(`/cursos/${id}`, 'DELETE');
        mostrarToast("Curso removido com sucesso!");
        await instCarregarDadosCursos();
    } catch (error) {
        console.error(error);
        mostrarToast("Não foi possível excluir. Verifique se existem matérias vinculadas.", "danger");
    }
}

function getIniciais(nome) {
    if(!nome) return '--';
    const partes = nome.split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}