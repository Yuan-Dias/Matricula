/**
 * utils.js
 * Utilitários gerais para a aplicação (UI, Formatação, Lógica de Negócio).
 * Compatível com Bootstrap 5.
 */

// ============================================================================
// 1. VARIÁVEIS DE ESTADO GLOBAL
// ============================================================================

let ordenacaoAtual = { coluna: null, ascendente: true };

// ============================================================================
// 2. UI - NOTIFICAÇÕES E FEEDBACK (Toasts, Loaders, Modals)
// ============================================================================

function mostrarToast(mensagem, tipo = 'success') {
    const containerId = 'toastContainer';
    let container = document.getElementById(containerId);
    
    // Cria o container se não existir
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '1090'; 
        document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    // Adiciona cores para Info e Warning também
    let corClass = 'bg-success text-white';
    let iconClass = 'fa-check-circle';

    if (tipo === 'danger') { corClass = 'bg-danger text-white'; iconClass = 'fa-times-circle'; }
    if (tipo === 'warning') { corClass = 'bg-warning text-dark'; iconClass = 'fa-exclamation-triangle'; }
    if (tipo === 'info') { corClass = 'bg-info text-dark'; iconClass = 'fa-info-circle'; }

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center ${corClass} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body fw-bold">
                    <i class="fas ${iconClass} me-2"></i> ${mensagem}
                </div>
                <button type="button" class="btn-close ${tipo === 'warning' || tipo === 'info' ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>`;

    container.insertAdjacentHTML('beforeend', toastHTML);
    const toastEl = document.getElementById(toastId);
    
    if (toastEl && window.bootstrap) {
        const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
        bsToast.show();
        // Remove do DOM após desaparecer para não poluir
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    }
}

/**
 * Exibe um spinner de carregamento.
 * @param {boolean} ativo - Se deve mostrar ou esconder.
 * @param {string} elementId - ID do elemento onde o loader aparecerá (default: appContent).
 */
function instLoading(ativo = true, elementId = 'appContent') {
    const target = document.getElementById(elementId); 
    if (!target) return;

    if(ativo) {
        // Salva o conteúdo original se necessário, ou apenas sobrescreve
        target.dataset.originalContent = target.innerHTML;
        target.innerHTML = `
            <div class="d-flex flex-column justify-content-center align-items-center fade-in" style="min-height: 300px; height: 100%;">
                <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status"></div>
                <p class="mt-3 text-muted fw-bold animate-pulse">Processando...</p>
            </div>`;
    } 
    // Nota: Para restaurar, a lógica da página geralmente chama a função de renderização novamente.
}

function mostrarModalMsg(titulo, mensagem, tipo = 'success') {
    const modalId = 'modalMsgGerada';
    let icon = tipo === 'success' ? 'fa-check-circle' : (tipo === 'danger' ? 'fa-times-circle' : 'fa-info-circle');
    
    const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-${tipo} text-white border-0">
                        <h5 class="modal-title fw-bold">${titulo}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4 text-center">
                        <i class="fas ${icon} fa-3x text-${tipo} mb-3"></i>
                        <p class="fs-5 mb-0 text-secondary">${mensagem}</p>
                    </div>
                    <div class="modal-footer border-0 justify-content-center">
                        <button type="button" class="btn btn-${tipo} px-5 rounded-pill" data-bs-dismiss="modal">OK</button>
                    </div>
                </div>
            </div>
        </div>`;
    
    // Remove anterior se existir
    document.getElementById(modalId)?.remove();
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    if(window.bootstrap) {
        new bootstrap.Modal(document.getElementById(modalId)).show();
    }
}

function cardStat(titulo, valor, icone, cor) {
    return `
        <div class="col-md-6 col-lg-3 mb-3">
            <div class="card border-0 shadow-sm h-100 border-start border-4 border-${cor} hover-lift">
                <div class="card-body d-flex align-items-center p-3">
                    <div class="rounded-circle bg-${cor} bg-opacity-10 p-3 me-3 text-${cor}">
                        <i class="fas ${icone} fa-lg"></i>
                    </div>
                    <div>
                        <h6 class="text-muted text-uppercase small fw-bold mb-1">${titulo}</h6>
                        <h3 class="fw-bold mb-0 text-dark">${valor}</h3>
                    </div>
                </div>
            </div>
        </div>`;
}

// ============================================================================
// 3. FORMATAÇÃO E INPUTS (Texto, Data, CPF)
// ============================================================================

function getSaudacao() {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return 'Bom dia';
    if (hora >= 12 && hora < 18) return 'Boa tarde';
    return 'Boa noite';
}

function getIniciais(nome) {
    if (!nome) return '--';
    const partes = nome.trim().split(/\s+/);
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

// Formata Data (YYYY-MM-DD -> DD/MM/YYYY)
function formatarData(dataString) {
    if (!dataString) return '-';
    // Se vier ISO com hora, pega só a data
    const datePart = dataString.split('T')[0]; 
    const [ano, mes, dia] = datePart.split('-');
    if(!ano || !mes || !dia) return dataString;
    return `${dia}/${mes}/${ano}`;
}

// Formata Data e Hora
function formatarDataHora(dataString) {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
}

// Formata Moeda (BRL)
function formatarMoeda(valor) {
    if (valor === undefined || valor === null) return 'R$ 0,00';
    return parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function instMascaraCPF(i) {
    if (!i) return;
    let v = i.value;
    if(v.length > 0 && isNaN(v[v.length-1])){ 
       i.value = v.substring(0, v.length-1);
       return;
    }
    i.setAttribute("maxlength", "14");
    v = v.replace(/\D/g, ""); 
    v = v.replace(/(\d{3})(\d)/, "$1.$2"); 
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    i.value = v;
}

function formatarNomeProprio(nome) {
    if (!nome) return "";
    const preposicoes = ['de', 'da', 'do', 'dos', 'das', 'e'];
    return nome.toLowerCase()
        .trim()
        .split(/\s+/)
        .map((palavra, index) => {
            if (index === 0 || !preposicoes.includes(palavra)) {
                return palavra.charAt(0).toUpperCase() + palavra.slice(1);
            }
            return palavra;
        })
        .join(' ');
}

// ============================================================================
// 4. MANIPULAÇÃO DE DADOS (Filtragem, Ordenação)
// ============================================================================

function filtrarDados(dados, termo, campos) {
    if (!termo) return dados;
    const termoLower = termo.toLowerCase();
    return dados.filter(item => {
        return campos.some(campo => {
            // Suporta propriedade aninhada ex: 'aluno.nome'
            const val = campo.split('.').reduce((o, i) => (o ? o[i] : null), item);
            return val && val.toString().toLowerCase().includes(termoLower);
        });
    });
}

function ordenarDados(dados, coluna, ascendente) {
    return dados.sort((a, b) => {
        // Suporta propriedade aninhada ex: 'curso.nome'
        const valA = coluna.split('.').reduce((o, i) => (o ? o[i] : null), a) || "";
        const valB = coluna.split('.').reduce((o, i) => (o ? o[i] : null), b) || "";
        
        if (typeof valA === 'string') {
            return ascendente ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        
        if (valA < valB) return ascendente ? -1 : 1;
        if (valA > valB) return ascendente ? 1 : -1;
        return 0;
    });
}

function ordenarERender(contexto, coluna) {
    // Alterna a direção
    if (ordenacaoAtual.coluna === coluna) {
        ordenacaoAtual.ascendente = !ordenacaoAtual.ascendente;
    } else {
        ordenacaoAtual.coluna = coluna;
        ordenacaoAtual.ascendente = true;
    }
    
    // Dispara a função de renderização correta
    switch(contexto) {
        case 'usuarios':
            if (typeof instFiltrarUsuarios === 'function') instFiltrarUsuarios();
            break;
        case 'materias':
            if (typeof instFiltrarMaterias === 'function') instFiltrarMaterias();
            break;
        default:
            console.warn(`Contexto de ordenação desconhecido: ${contexto}`);
    }
}

function getIconeOrdenacao(coluna) {
    if (ordenacaoAtual.coluna !== coluna) return '<i class="fas fa-sort text-muted opacity-25 ms-1 small"></i>';
    return ordenacaoAtual.ascendente 
        ? '<i class="fas fa-sort-up text-primary ms-1"></i>' 
        : '<i class="fas fa-sort-down text-primary ms-1"></i>';
}

function filtrarMinhasMatriculas(matriculas, user) {
    if (!matriculas || !Array.isArray(matriculas)) return [];
    if (!user || !user.id) return [];

    return matriculas.filter(m => {
        // Verifica todas as possibilidades de estrutura do objeto
        const idAluMatricula = m.idAluno || (m.aluno?.id) || (m.usuario?.id);
        return parseInt(idAluMatricula) === parseInt(user.id);
    });
}

// ============================================================================
// 5. DOM INTERACTION (Menu, Drag & Drop)
// ============================================================================

/**
 * Atualiza o estado visual do menu lateral.
 * CORRIGIDO: Agora mantém o texto branco em itens inativos (para fundos escuros).
 */
function atualizarMenuAtivo(textoMenu) {
    const sidebar = document.getElementById('sidebar-menu');
    if (!sidebar) return;

    // 1. Reseta todos os itens para o estado INATIVO
    sidebar.querySelectorAll('.list-group-item').forEach(item => {
        // Remove classes de ativo
        item.classList.remove('active', 'bg-primary');
        
        // Garante aparência correta para fundo escuro (texto branco, fundo transparente)
        item.classList.add('bg-transparent', 'text-white');
        
        // Remove text-dark para não ficar preto
        item.classList.remove('text-dark');
    });

    // 2. Encontra o item clicado e aplica o estado ATIVO
    const links = Array.from(sidebar.querySelectorAll('.list-group-item'));
    const linkAtivo = links.find(l => l.innerText.includes(textoMenu));

    if (linkAtivo) {
        // Remove classes de inativo
        linkAtivo.classList.remove('bg-transparent'); // Remove transparência (opcional, dependendo do design)
        
        // Adiciona classe 'active' (que geralmente aplica fundo azul e texto branco)
        linkAtivo.classList.add('active');
        
        // Reforça que não deve ser preto
        linkAtivo.classList.remove('text-dark');
    }
}

function utilsConfigurarDragDrop(container, itemSelector) {
    if (!container) return;
    if (container.hasAttribute('data-drag-init')) return;
    container.setAttribute('data-drag-init', 'true');

    container.addEventListener('dragover', e => {
        e.preventDefault(); 
        const afterElement = utilsGetDragAfterElement(container, e.clientY, itemSelector);
        const draggable = document.querySelector('.dragging');
        if (!draggable) return;

        if (afterElement == null) {
            container.appendChild(draggable);
        } else {
            container.insertBefore(draggable, afterElement);
        }
    });
}

function utilsGetDragAfterElement(container, y, itemSelector) {
    const draggableElements = [...container.querySelectorAll(`${itemSelector}:not(.dragging)`)];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ============================================================================
// 6. LÓGICA ACADÊMICA & DOMÍNIO
// ============================================================================

function getStatusBadge(tipo) {
    const map = {
        'ADMIN': '<span class="badge bg-dark rounded-pill">Admin</span>',
        'PROFESSOR': '<span class="badge bg-primary rounded-pill">Professor</span>',
        'ALUNO': '<span class="badge bg-info text-dark rounded-pill">Aluno</span>',
        'COORDENADOR': '<span class="badge bg-purple text-white rounded-pill" style="background-color: #6f42c1;">Coord.</span>'
    };
    return map[tipo] || `<span class="badge bg-secondary rounded-pill">${tipo}</span>`;
}

// --- utils.js ---

function gerarFeedbackStatusAluno(mediaAtual, notaRecuperacao, existeConfigRecuperacao, todasRegularesLancadas, mediaFinal) {
    const corte = 7.0; 

    if (!todasRegularesLancadas) {
        return `
            <div class="alert alert-info m-0 rounded-0 border-0 border-bottom d-flex align-items-center">
                <i class="fas fa-hourglass-half fs-1 me-3"></i>
                <div>
                    <h5 class="fw-bold mb-0">Em Andamento</h5>
                    <div class="small">Aguardando o lançamento de todas as notas regulares para cálculo final. (Média atual considerando zeros: ${mediaFinal})</div>
                </div>
            </div>`;
    }
    
    if (mediaFinal >= corte) {
        return `
            <div class="alert alert-success m-0 rounded-0 border-0 border-bottom d-flex align-items-center">
                <i class="fas fa-check-circle fs-1 me-3"></i>
                <div>
                    <h5 class="fw-bold mb-0">Aprovado!</h5>
                    <div class="small">Parabéns, você atingiu a média necessária (7.0).</div>
                </div>
            </div>`;
    }

    if (existeConfigRecuperacao && (notaRecuperacao === null || notaRecuperacao === undefined)) {
         return `
            <div class="alert alert-warning m-0 rounded-0 border-0 border-bottom d-flex align-items-center">
                <i class="fas fa-exclamation-triangle fs-1 me-3"></i>
                <div>
                    <h5 class="fw-bold mb-0">Em Recuperação</h5>
                    <div class="small">Sua média regular (${mediaAtual.toFixed(1)}) ficou abaixo de 7.0. Necessário realizar a recuperação.</div>
                </div>
            </div>`;
    }

    return `
        <div class="alert alert-danger m-0 rounded-0 border-0 border-bottom d-flex align-items-center">
            <i class="fas fa-times-circle fs-1 me-3"></i>
            <div>
                <h5 class="fw-bold mb-0">Reprovado</h5>
                <div class="small">A média final não atingiu o critério mínimo de 7.0.</div>
            </div>
        </div>`;
}

function getNotaColor(valor) {
    if (valor === null || valor === undefined) return 'text-muted';
    const v = parseFloat(valor);
    if (v >= 7.0) return 'text-success';
    if (v >= 5.0) return 'text-warning-emphasis'; // Amarelo escuro para nota "na trave"
    return 'text-danger';
}

function utilsIsRecuperacao(nome) {
    const n = (nome || "").toUpperCase();
    return n.includes("RECUPERA") || 
           n.includes("PROVA FINAL") || 
           n.includes("EXAME") || 
           n.includes("SUBSTITUTIVA");
}

function utilsCalcularMedia(notasAluno, configuracoes) {
    if (!configuracoes || configuracoes.length === 0) return 0.0;

    const configsUnicas = configuracoes.filter((conf, index, self) =>
        index === self.findIndex((c) => c.id === conf.id)
    );

    const mapaNotas = {};
    if (notasAluno) {
        notasAluno.forEach(n => {
            if (n.valor !== null && n.valor !== undefined && n.valor !== "") {
                mapaNotas[n.idConfiguracao] = parseFloat(String(n.valor).replace(',', '.'));
            }
        });
    }

    let somaPonderada = 0;
    let somaPesos = 0;
    let valorRec = null;
    let todasRegularesLancadas = true; 

    configsUnicas.forEach(conf => {
        const nome = conf.descricaoNota || conf.nome || "";
        
        if (utilsIsRecuperacao(nome)) {
            if (mapaNotas[conf.id] !== undefined) {
                valorRec = mapaNotas[conf.id];
            }
        } else {
            let peso = parseFloat(conf.peso);
            if(isNaN(peso)) peso = 1;
            
            somaPesos += peso;
            
            const nota = mapaNotas[conf.id];
            
            if (nota !== undefined) {
                somaPonderada += nota * peso;
            } else {
                todasRegularesLancadas = false;
            }
        }
    });

    if (somaPesos === 0) return 0.0;

    let media = Math.round((somaPonderada / somaPesos) * 10) / 10;

    if (todasRegularesLancadas && media < 7.0 && valorRec !== null && valorRec > media) {
        media = Math.round(((media + valorRec) / 2) * 10) / 10;
    }
    
    return media;
}

function utilsObterStatusAcademico(media, statusOuIsFinalizada, todasRegularesLancadas = false, temNotaRecuperacao = false) {
    const valorMedia = parseFloat(media || 0);

    if (statusOuIsFinalizada === 'CANCELADO') {
        return { texto: 'Cancelado', classBadge: 'bg-secondary', corTexto: 'text-muted' };
    }

    const isFinalizada = statusOuIsFinalizada === true || 
                         ['APROVADO', 'REPROVADO', 'RECUPERACAO', 'FINALIZADA'].includes(statusOuIsFinalizada);

    // =================================================================================
    // CENÁRIO 1: O ALUNO TEM NOTA DE RECUPERAÇÃO OU O STATUS JÁ É FINAL
    // =================================================================================
    if (isFinalizada || temNotaRecuperacao) {
        // Se o status no banco já for explícito, respeita ele
        if (statusOuIsFinalizada === 'APROVADO') return { texto: 'Aprovado', classBadge: 'bg-success', corTexto: 'text-success' };
        if (statusOuIsFinalizada === 'REPROVADO') return { texto: 'Reprovado', classBadge: 'bg-danger', corTexto: 'text-danger' };

        const notaCorte = 7.0;
        return valorMedia >= notaCorte 
            ? { texto: 'Aprovado', classBadge: 'bg-success', corTexto: 'text-success' }
            : { texto: 'Reprovado', classBadge: 'bg-danger', corTexto: 'text-danger' };
    }

    if (todasRegularesLancadas) {
        if (valorMedia >= 7.0) {
            return { texto: 'Aprovado', classBadge: 'bg-success', corTexto: 'text-success' };
        }
        
        if (valorMedia < 4.0) {
            return { texto: 'Reprovando', classBadge: 'bg-danger', corTexto: 'text-danger' };
        }

        return { texto: 'De Recuperação', classBadge: 'bg-warning text-dark border border-dark', corTexto: 'text-dark fw-bold' };
    }

    if (valorMedia === 0) return { texto: 'Cursando', classBadge: 'bg-light text-muted border', corTexto: 'text-muted' };
    if (valorMedia >= 7.0) return { texto: 'Na Média', classBadge: 'bg-success-subtle text-success border border-success', corTexto: 'text-success' };
    if (valorMedia >= 4.0) return { texto: 'Em Risco', classBadge: 'bg-warning-subtle text-warning-emphasis border border-warning', corTexto: 'text-warning' };
    
    return { texto: 'Abaixo da Média', classBadge: 'bg-danger-subtle text-danger border border-danger', corTexto: 'text-danger' };
}

function utilsGerarBarraPesos(listaNotas) {
    if (!listaNotas || listaNotas.length === 0) {
        return `<small class="text-muted fst-italic"><i class="fas fa-ban me-1"></i> Sem notas configuradas</small>`;
    }

    const notasUnicas = listaNotas.filter((conf, index, self) =>
        index === self.findIndex((c) => c.id === conf.id)
    );

    const cores = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    const barras = notasUnicas.map((nota, index) => {
        const desc = nota.descricaoNota || nota.descricao || 'Nota';
        const peso = parseFloat(nota.peso || 0);
        const largura = peso > 0 ? (peso * 10) : 0; 
        const cor = cores[index % cores.length];
        
        return `<div class="d-flex" style="width: ${largura}%; background-color: ${cor}; border-right: 1px solid white;" 
                    data-bs-toggle="tooltip" title="${desc}: Peso ${peso}"></div>`;
    }).join('');

    const legendas = notasUnicas.map((nota, index) => {
        const desc = nota.descricaoNota || nota.descricao || 'Nota';
        const peso = parseFloat(nota.peso || 0);
        const cor = cores[index % cores.length];
        
        return `
            <div class="d-flex align-items-center me-2 mb-1" style="font-size: 0.75rem;">
                <span class="rounded-circle me-1" style="width: 8px; height: 8px; background-color: ${cor};"></span>
                <span class="text-muted text-truncate" style="max-width: 100px;">${desc}</span>
                <strong class="ms-1 text-dark">(${peso})</strong>
            </div>`;
    }).join('');

    return `
        <div class="w-100" style="max-width: 400px;">
            <div class="progress mb-2 shadow-sm" style="height: 8px; background-color: #e9ecef;">
                ${barras}
            </div>
            <div class="d-flex flex-wrap">${legendas}</div>
        </div>`;
}