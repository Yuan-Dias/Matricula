// ============================================================================
// ÁREA DO ALUNO (Meu Curso e Catálogo)
// ============================================================================

// Função auxiliar segura para pegar usuário
function getSafeUser() {
    const user = getUser();
    if (!user || !user.id) {
        console.warn("Usuário não logado ou sessão expirada.");
        mostrarToast("Sessão expirada. Faça login novamente.", "danger");
        return null;
    }
    return user;
}

async function alunoRenderCurso() {
    atualizarMenuAtivo('Meu Progresso');
    
    const user = getSafeUser();
    if (!user) return;

    instLoading(true);
    const appContent = document.getElementById('appContent');

    try {
        const [matriculasCurso, todasMaterias, todasMatriculas] = await Promise.all([
            fetchAPI(`/matriculas/curso/aluno/${user.id}`), 
            fetchAPI('/materias'),
            fetchAPI('/matriculas')
        ]);

        if (!matriculasCurso || matriculasCurso.length === 0) {
            appContent.innerHTML = `<div class="text-center py-5 fade-in"><p class="text-muted"><i class="fas fa-graduation-cap fa-3x mb-3 opacity-50"></i><br>Você não está matriculado em nenhum curso.</p></div>`;
            return;
        }

        // Filtra matrículas apenas deste aluno
        const minhasMatriculasDisciplinas = (todasMatriculas || []).filter(m => {
            const idAlu = m.idAluno || (m.aluno ? m.aluno.id : null);
            return parseInt(idAlu) === parseInt(user.id);
        });

        let htmlFinal = `<div class="fade-in"><h4 class="fw-bold mb-4">Seu Desempenho Acadêmico</h4>`;

        matriculasCurso.forEach(cursoMat => {
            // Pega a grade (matérias) deste curso específico
            const gradeDoCurso = (todasMaterias || []).filter(m => 
                m.nomeCurso && cursoMat.nomeCurso &&
                m.nomeCurso.trim().toLowerCase() === cursoMat.nomeCurso.trim().toLowerCase()
            );            

            const materiasConcluidas = [];
            const materiasPendentes = [];

            gradeDoCurso.forEach(materiaGrade => {
                // Pega todos os registros do aluno nesta matéria
                let registrosDaMateria = minhasMatriculasDisciplinas.filter(mm => {
                    const idMateriaRef = mm.idMateria || (mm.materia ? mm.materia.id : null);
                    return parseInt(idMateriaRef) === parseInt(materiaGrade.id);
                });

                // ORDENAÇÃO CRUCIAL: O ID maior (mais recente) fica no topo [0]
                registrosDaMateria.sort((a, b) => b.id - a.id);

                // IMPORTANTE: Não filtramos 'HISTORICO' aqui. Se a última ação foi REPROVADO (mesmo que antiga), tem que aparecer.
                const registrosValidos = registrosDaMateria.filter(m => m.situacao !== 'CANCELADO');
                
                // Pega o estado atual da matéria
                const registroMaisRecente = registrosValidos.length > 0 ? registrosValidos[0] : null;

                if (registroMaisRecente) {
                    if (registroMaisRecente.situacao === 'APROVADO') {
                        // Se passou, vai para concluídas
                        materiasConcluidas.push({ 
                            ...materiaGrade, 
                            nota: registroMaisRecente.mediaFinal || registroMaisRecente.notaFinal,
                            status: 'APROVADO' 
                        });
                    } else if (['CURSANDO', 'RECUPERACAO'].includes(registroMaisRecente.situacao)) {
                        // Se está fazendo agora (ou refazendo), status CURSANDO (substitui o Reprovado visualmente)
                        materiasPendentes.push({
                            ...materiaGrade,
                            status: 'CURSANDO',
                            idHistorico: registroMaisRecente.id
                        });
                    } else if (registroMaisRecente.situacao === 'REPROVADO') {
                        // Se a última tentativa foi REPROVADO, mostra isso na lista de pendentes
                        materiasPendentes.push({
                            ...materiaGrade,
                            status: 'REPROVADO',
                            nota: parseFloat(registroMaisRecente.mediaFinal || registroMaisRecente.notaFinal || 0),
                            idHistorico: registroMaisRecente.id 
                        });
                    } else {
                        // Casos raros ou status desconhecido
                        materiasPendentes.push({ ...materiaGrade, status: 'DISPONIVEL' });
                    }
                } else {
                    // Nunca cursou
                    materiasPendentes.push({ ...materiaGrade, status: 'DISPONIVEL' });
                }
            });

            const totalMaterias = gradeDoCurso.length;
            const percentual = totalMaterias > 0 ? Math.round((materiasConcluidas.length / totalMaterias) * 100) : 0;
            htmlFinal += renderizarCardCurso(cursoMat, percentual, materiasConcluidas, materiasPendentes);
        });
        
        htmlFinal += '</div>';
        appContent.innerHTML = htmlFinal;

    } catch (e) { 
        console.error("Erro render curso:", e);
        appContent.innerHTML = '<div class="alert alert-danger">Erro ao carregar dados.</div>'; 
    } finally { 
        instLoading(false); 
    }
}

function renderizarCardCurso(cursoMat, percentual, concluidas, pendentes) {
    const progresso = Number(percentual) || 0;
    const isConcluido = progresso === 100;
    
    const statusCurso = isConcluido 
        ? '<span class="badge bg-success rounded-pill"><i class="fas fa-check-circle me-1"></i>Concluído</span>' 
        : '<span class="badge bg-primary rounded-pill"><i class="fas fa-spinner fa-spin me-1"></i>Em Andamento</span>';

    const formatarNota = (val) => {
        if (val === null || val === undefined || val === '') return '-';
        return parseFloat(val).toFixed(1);
    };

    const getStatusMateria = (materia) => {
        const nomeSafe = materia.nome.replace(/'/g, "\\'"); 
        
        switch (materia.status) {
            case 'CURSANDO':
                return {
                    badge: `<span class="badge bg-info text-dark border border-info border-opacity-25"><i class="fas fa-pencil-alt me-1"></i>Cursando</span>`,
                    action: `<button class="btn btn-sm btn-outline-info fw-bold" onclick="alunoRenderDisciplinas()">
                                <i class="fas fa-eye me-1"></i>Ver Notas
                             </button>`
                };
            case 'REPROVADO':
                // AQUI: Mostra que reprovou e dá a opção de refazer. 
                // Ao clicar, o JS chama refazer, o Java muda pra CURSANDO, e ao recarregar cai no case 'CURSANDO' acima.
                return {
                    badge: `<span class="badge bg-danger text-white shadow-sm border border-danger"><i class="fas fa-times-circle me-1"></i>Reprovado (Nota: ${formatarNota(materia.nota)})</span>`,
                    action: `<button class="btn btn-sm btn-danger shadow-sm fw-bold" onclick="alunoRefazerMateria(${materia.id}, ${materia.idHistorico}, '${nomeSafe}')" data-bs-toggle="tooltip" title="Clique para reiniciar esta disciplina">
                                <i class="fas fa-redo me-1"></i>Refazer Matéria
                             </button>`
                };
            default: // DISPONIVEL
                return {
                    badge: `<span class="badge bg-secondary bg-opacity-50 text-dark"><i class="far fa-circle me-1"></i>Disponível</span>`,
                    action: `<button class="btn btn-sm btn-primary" onclick="confirmarMatricula(${materia.id}, '${nomeSafe}')">
                                <i class="fas fa-plus me-1"></i>Matricular
                             </button>`
                };
        }
    };

    const pendentesHtml = pendentes.length > 0 ? pendentes.map(m => {
        const ui = getStatusMateria(m);
        // Destaca visualmente a matéria reprovada
        const borderClass = m.status === 'REPROVADO' ? 'border-danger border-opacity-50 bg-danger bg-opacity-10' : 'border-light';
        
        return `
        <div class="card mb-2 hover-shadow transition-all ${borderClass}">
            <div class="card-body p-3 d-flex justify-content-between align-items-center">
                <div class="overflow-hidden me-2">
                    <div class="fw-bold text-truncate text-dark" title="${m.nome}">${m.nome}</div>
                    <div class="mt-1">${ui.badge}</div>
                </div>
                <div class="flex-shrink-0">
                    ${ui.action}
                </div>
            </div>
        </div>`;
    }).join('') : `
        <div class="alert alert-success d-flex align-items-center shadow-sm border-0 bg-success bg-opacity-10 text-success mt-3" role="alert">
            <i class="fas fa-trophy me-3 fa-2x"></i>
            <div>
                <strong class="d-block">Parabéns!</strong>
                Você completou toda a grade deste curso.
            </div>
        </div>`;

    const concluidasHtml = concluidas.length > 0 ? concluidas.map(m => `
        <div class="list-group-item px-0 py-3 border-bottom d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
                <i class="fas fa-check text-success me-3 bg-success bg-opacity-10 p-2 rounded-circle"></i>
                <div>
                    <span class="d-block fw-semibold text-dark">${m.nome}</span>
                    <small class="text-muted">Aprovado</small>
                </div>
            </div>
            <span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-2 rounded-pill">
                ${formatarNota(m.nota)}
            </span>
        </div>
    `).join('') : `<div class="text-center py-4 text-muted"><small>Nenhuma disciplina concluída.</small></div>`;

    return `
        <div class="card border-0 shadow-sm mb-5 overflow-hidden fade-in">
            <div class="card-header bg-white border-bottom p-4">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h4 class="fw-bold text-dark mb-1">${cursoMat.nomeCurso}</h4>
                        <div class="d-flex align-items-center gap-2">${statusCurso}</div>
                    </div>
                    <div class="text-end d-none d-md-block">
                        <h2 class="fw-bold text-primary mb-0">${progresso}%</h2>
                    </div>
                </div>
                <div class="progress mt-4" style="height: 6px;">
                    <div class="progress-bar bg-primary" role="progressbar" style="width: ${progresso}%"></div>
                </div>
            </div>
            <div class="card-body p-4">
                <div class="row g-5">
                    <div class="col-lg-6">
                        <h6 class="fw-bold text-uppercase text-muted mb-3"><i class="fas fa-check-double me-2"></i>Concluídas</h6>
                        <div class="list-group list-group-flush">${concluidasHtml}</div>
                    </div>
                    <div class="col-lg-6 border-start-lg">
                        <h6 class="fw-bold text-uppercase text-muted mb-3"><i class="fas fa-list-ul me-2"></i>Grade & Pendências</h6>
                        <div class="d-flex flex-column gap-2">${pendentesHtml}</div>
                    </div>
                </div>
            </div>
        </div>`;
}

async function alunoRenderCatalogoCursos() {
    atualizarMenuAtivo('Cursos Disponíveis');
    
    const user = getSafeUser();
    if (!user) return;

    const appContent = document.getElementById('appContent');
    if (!appContent) return;

    appContent.innerHTML = `
        <div class="d-flex justify-content-center align-items-center py-5 fade-in">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Carregando...</span>
            </div>
        </div>`;

    try {
        const [cursos, minhasMatriculas] = await Promise.all([
            fetchAPI('/cursos'),
            fetchAPI(`/matriculas/curso/aluno/${user.id}`)
        ]);

        if (!cursos || cursos.length === 0) {
            appContent.innerHTML = `
                <div class="text-center py-5 fade-in">
                    <div class="mb-3 text-muted opacity-50"><i class="far fa-folder-open fa-4x"></i></div>
                    <h4 class="fw-bold text-secondary">Nenhum curso disponível</h4>
                    <p class="text-muted">No momento não há cursos abertos para novas matrículas.</p>
                </div>`;
            return;
        }

        const idsMeusCursos = (minhasMatriculas || []).map(m => parseInt(m.idCurso));

        appContent.innerHTML = `
            <div class="row g-4 fade-in">
                ${cursos.map(curso => {
                    const jaInscrito = idsMeusCursos.includes(parseInt(curso.id));
                    const matriculaObj = jaInscrito ? minhasMatriculas.find(m => parseInt(m.idCurso) === parseInt(curso.id)) : null;
                    
                    const nomeSafe = curso.nome.replace(/'/g, "\\'");
                    const cardBorder = jaInscrito ? 'border-success border-2' : 'border-0';
                    const badgeStatus = jaInscrito 
                        ? '<span class="badge bg-success"><i class="fas fa-check me-1"></i>Matriculado</span>' 
                        : '<span class="badge bg-primary bg-opacity-10 text-primary">Inscrições Abertas</span>';

                    return `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-sm ${cardBorder} transition-all hover-shadow">
                            <div class="card-body d-flex flex-column p-4">
                                <div class="d-flex justify-content-between align-items-start mb-3">
                                    <div class="d-flex align-items-center">
                                        <div class="rounded-circle p-3 me-3 ${jaInscrito ? 'bg-success bg-opacity-10 text-success' : 'bg-primary bg-opacity-10 text-primary'}">
                                            <i class="fas ${jaInscrito ? 'fa-user-graduate' : 'fa-book-reader'} fa-lg"></i>
                                        </div>
                                        <div>
                                            <h5 class="fw-bold text-dark mb-0 text-truncate" style="max-width: 150px;" title="${curso.nome}">${curso.nome}</h5>
                                            <small class="text-muted">Prof. ${curso.nomeProfessor || 'A definir'}</small>
                                        </div>
                                    </div>
                                    ${badgeStatus}
                                </div>

                                <div class="mb-4 flex-grow-1">
                                    <p class="text-muted small mb-3">
                                        ${curso.descricao || 'Descrição do curso não informada pela instituição.'}
                                    </p>
                                    <div class="d-flex gap-2 flex-wrap">
                                        <span class="badge bg-light text-secondary border">
                                            <i class="far fa-clock me-1"></i> ${curso.cargaHoraria || 0}h
                                        </span>
                                        <span class="badge bg-light text-secondary border">
                                            <i class="fas fa-users me-1"></i> ${curso.capacidade || '-'} vagas
                                        </span>
                                    </div>
                                </div>

                                <div class="mt-auto pt-3 border-top">
                                    ${jaInscrito ? `
                                        <div class="d-grid gap-2 d-flex">
                                            <button class="btn btn-outline-primary flex-grow-1" onclick="alunoRenderCurso()">
                                                <i class="fas fa-chart-line me-2"></i>Acessar
                                            </button>
                                            <button class="btn btn-outline-danger" title="Cancelar Curso" 
                                                onclick="alunoCancelarCurso(${matriculaObj?.id}, '${nomeSafe}')">
                                                <i class="fas fa-sign-out-alt"></i>
                                            </button>
                                        </div>
                                    ` : `
                                        <button class="btn btn-primary w-100 shadow-sm" onclick="confirmarIngresso(${curso.id}, '${nomeSafe}')">
                                            <div class="d-flex justify-content-between align-items-center px-2">
                                                <span>Matricular-se</span>
                                                <i class="fas fa-arrow-right"></i>
                                            </div>
                                        </button>
                                    `}
                                </div>
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;

    } catch (e) { 
        console.error(e);
        appContent.innerHTML = `<div class="alert alert-danger">Erro de conexão ao carregar catálogo.</div>`; 
    }
}


async function confirmarMatricula(idMateria, nomeMateria) {
    const user = getSafeUser();
    if (!user) return;

    // Confirmação visual
    const result = await Swal.fire({
        title: 'Confirmar Matrícula?',
        html: `Deseja iniciar a disciplina:<br><strong>${nomeMateria}</strong>?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0d6efd',
        cancelButtonColor: '#dc3545',
        confirmButtonText: 'Sim, matricular',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    // Payload padrão para NOVA matrícula
    const payloadNovo = {
        idAluno: parseInt(user.id),
        idMateria: parseInt(idMateria),
        situacao: 'CURSANDO'
    };

    Swal.fire({ title: 'Processando...', didOpen: () => Swal.showLoading() });

    try {
        await fetchAPI('/matriculas', 'POST', payloadNovo);

        await Swal.fire({
            icon: 'success',
            title: 'Matrícula Realizada!',
            timer: 2000,
            showConfirmButton: false
        });
        
        alunoRenderCurso(); 

    } catch (error) {
        const msgErro = error.toString();
        
        if (msgErro.includes("já possui") || msgErro.includes("400")) {
            console.warn("Matrícula já existe. Tentando reativar registro antigo...");

            try {
                const todasMatriculas = await fetchAPI('/matriculas');
                
                const matriculaAntiga = todasMatriculas.find(m => 
                    (parseInt(m.idAluno) === parseInt(user.id) || (m.aluno && parseInt(m.aluno.id) === parseInt(user.id))) &&
                    (parseInt(m.idMateria) === parseInt(idMateria) || (m.materia && parseInt(m.materia.id) === parseInt(idMateria)))
                );

                if (matriculaAntiga) {
                    const payloadUpdate = {
                        id: matriculaAntiga.id,
                        situacao: 'CURSANDO',
                        mediaFinal: 0.0,
                        nota1: 0.0,
                        nota2: 0.0
                    };

                    await fetchAPI(`/matriculas/${matriculaAntiga.id}`, 'PUT', payloadUpdate);

                    await Swal.fire({
                        icon: 'success',
                        title: 'Reinscrição Realizada!',
                        text: 'Seu registro anterior foi reativado e as notas zeradas.',
                        timer: 2500,
                        showConfirmButton: false
                    });
                    
                    alunoRenderCurso();
                    return; // Sai da função com sucesso
                }
            } catch (errRecuperacao) {
                console.error("Erro ao tentar recuperar matrícula antiga:", errRecuperacao);
            }
        }

        Swal.fire({
            icon: 'error',
            title: 'Não foi possível matricular',
            text: 'O sistema retornou: ' + msgErro
        });
    }
}

async function alunoRefazerMateria(idMateria, idMatriculaAntiga, nomeMateria) {
    const user = getSafeUser();
    if (!user) return;

    const result = await Swal.fire({
        title: 'Refazer Matéria?',
        html: `Você foi reprovado em <strong>${nomeMateria}</strong>.<br>Deseja reiniciar esta disciplina agora?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, refazer matéria',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
        instLoading(true);

        const payload = {
            idAluno: parseInt(user.id),
            idMateria: parseInt(idMateria),
            situacao: 'CURSANDO' // Força o envio como cursando
        };

        await fetchAPI('/matriculas', 'POST', payload);
        
        Swal.fire({
            icon: 'success',
            title: 'Matrícula Reiniciada',
            text: `Você está cursando ${nomeMateria} novamente. Boa sorte!`,
            timer: 2000,
            showConfirmButton: false
        });
        
        setTimeout(() => {
            alunoRenderCurso(); 
        }, 500);

    } catch (error) {
        console.error("Erro ao refazer:", error);
        Swal.fire('Erro', 'Não foi possível refazer a matrícula.', 'error');
    } finally {
        instLoading(false);
    }
}

function confirmarIngresso(idCurso, nomeCurso) {
    document.getElementById('modalConfirmarCursoManual')?.remove();

    const modalConfirm = `
        <div class="modal fade" id="modalConfirmarCursoManual" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-body text-center p-4">
                        <div class="bg-primary bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                            <i class="fas fa-university fa-3x text-primary"></i>
                        </div>
                        <h5 class="fw-bold mb-2">Confirmar Inscrição?</h5>
                        <p class="text-muted">Você deseja ingressar no curso de <br><strong>${nomeCurso}</strong>?</p>
                        
                        <div class="d-flex gap-2 justify-content-center mt-4">
                            <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary px-4" id="btnConfirmarAction">
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    document.body.insertAdjacentHTML('beforeend', modalConfirm);
    const modalEl = document.getElementById('modalConfirmarCursoManual');
    const myModal = new bootstrap.Modal(modalEl);
    
    const btnConfirmar = document.getElementById('btnConfirmarAction');
    
    btnConfirmar.onclick = async () => {
        btnConfirmar.disabled = true;
        const textoOriginal = btnConfirmar.innerHTML;
        btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processando...';

        try {
            await executarPostIngresso(idCurso, nomeCurso);
            myModal.hide(); // Só fecha se der sucesso
        } catch (error) {
            // Se der erro, restaura o botão
            btnConfirmar.disabled = false;
            btnConfirmar.innerHTML = textoOriginal;
        }
    };

    modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());
    myModal.show();
}

async function executarPostIngresso(idCurso, nomeCurso) {
    // Validação Segura
    const user = getUser();
    if (!user || !user.id || !idCurso) {
        mostrarToast("Erro: Sessão expirada ou dados inválidos.", "danger");
        throw new Error("Dados de usuário ou curso inválidos"); // Lança erro para o modal saber
    }

    try {
        const corpoRequisicao = { 
            idAluno: parseInt(user.id), 
            idCurso: parseInt(idCurso) 
        };

        await fetchAPI('/matriculas/curso', 'POST', corpoRequisicao);
        
        mostrarToast(`Sucesso! Inscrição confirmada no curso ${nomeCurso}.`, "success");
        
        // Atualiza UI
        if (typeof carregarAluno === 'function') await carregarAluno(); 
        
        setTimeout(() => {
            if (typeof alunoRenderCurso === 'function') alunoRenderCurso();
        }, 500);
        
    } catch (e) {
        console.error("Erro no ingresso do curso:", e);
        mostrarToast("Não foi possível realizar a inscrição.", "danger");
        throw e; // Repassa o erro para o botão destravar
    }
}

async function alunoCancelarCurso(idMatriculaCurso, nome) {
    if (!confirm(`AVISO: Cancelar o curso "${nome}" removerá seu acesso à grade curricular. Confirmar?`)) return;

    try {
        await fetchAPI(`/matriculas/curso/${idMatriculaCurso}`, 'DELETE');
        mostrarToast("Curso cancelado com sucesso.");
        
        if (typeof carregarAluno === 'function') await carregarAluno();
        await alunoRenderCatalogoCursos();
        
    } catch (e) {
        mostrarToast("Erro ao cancelar matrícula do curso.", "danger");
    }
}