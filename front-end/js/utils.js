// --- Variáveis de Controle de Ordenação ---
let ordenacaoAtual = { coluna: null, ascendente: true };

// --- Notificações Toast ---
function mostrarToast(mensagem, tipo = 'success') {
    const containerId = 'toastContainer';
    let container = document.getElementById(containerId);
    
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const cor = tipo === 'success' ? 'bg-success text-white' : 'bg-danger text-white';
    const icone = tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center ${cor} border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body fw-bold">
                    <i class="fas ${icone} me-2"></i> ${mensagem}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>`;

    container.insertAdjacentHTML('beforeend', toastHTML);
    const toastEl = document.getElementById(toastId);
    const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
    bsToast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// --- Helpers de UI e Formatação ---
function instLoading(ativo = true) {
    const target = document.getElementById('appContent'); 
    if (!target) return;

    if(ativo) {
        target.innerHTML = `
            <div class="d-flex justify-content-center align-items-center" style="height: 60vh;">
                <div class="text-center">
                    <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status"></div>
                    <p class="mt-3 text-muted fw-bold">Carregando dados...</p>
                </div>
            </div>`;
    }
}

function getSaudacao() {
    const hora = new Date().getHours();
    if (hora < 12) return 'Bom dia';
    if (hora < 18) return 'Boa tarde';
    return 'Boa noite';
}

function getIniciais(nome) {
    if (!nome) return '??';
    const partes = nome.split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function getStatusBadge(tipo) {
    if (tipo === 'ADMIN') return '<span class="badge bg-dark">Admin</span>';
    if (tipo === 'PROFESSOR') return '<span class="badge bg-primary">Professor</span>';
    if (tipo === 'ALUNO') return '<span class="badge bg-info text-dark">Aluno</span>';
    return '<span class="badge bg-secondary">' + tipo + '</span>';
}

function filtrarDados(dados, termo, campos) {
    if (!termo) return dados;
    const termoLower = termo.toLowerCase();
    return dados.filter(item => {
        return campos.some(campo => {
            const val = item[campo];
            return val && val.toString().toLowerCase().includes(termoLower);
        });
    });
}

function ordenarDados(dados, coluna, ascendente) {
    return dados.sort((a, b) => {
        const valA = a[coluna] || "";
        const valB = b[coluna] || "";
        if (valA < valB) return ascendente ? -1 : 1;
        if (valA > valB) return ascendente ? 1 : -1;
        return 0;
    });
}

function ordenarERender(contexto, coluna) {
    if (ordenacaoAtual.coluna === coluna) {
        ordenacaoAtual.ascendente = !ordenacaoAtual.ascendente;
    } else {
        ordenacaoAtual.coluna = coluna;
        ordenacaoAtual.ascendente = true;
    }
    
    // Roteador simples de re-renderização
    if (contexto === 'usuarios') instFiltrarUsuarios();
}

function instMascaraCPF(i) {
    let v = i.value;
    if(isNaN(v[v.length-1])){ 
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
        .split(' ')
        .map((palavra, index) => {
            if (index === 0 || !preposicoes.includes(palavra)) {
                return palavra.charAt(0).toUpperCase() + palavra.slice(1);
            }
            return palavra;
        })
        .join(' ');
}

function getIconeOrdenacao(coluna) {
    if (ordenacaoAtual.coluna !== coluna) return '<i class="fas fa-sort text-muted opacity-25 ms-1"></i>';
    
    if (ordenacaoAtual.ascendente) {
        return '<i class="fas fa-sort-up text-primary ms-1"></i>';
    } else {
        return '<i class="fas fa-sort-down text-primary ms-1"></i>';
    }
}

function atualizarIconesHeaders() {
    const thNome = document.querySelector('th[onclick*="nome"]');
    const thTipo = document.querySelector('th[onclick*="tipo"]');
    
    if(thNome) thNome.innerHTML = `Usuário ${getIconeOrdenacao('nome')}`;
    if(thTipo) thTipo.innerHTML = `Perfil ${getIconeOrdenacao('tipo')}`;
}

/**
 * Configura um container para ordenar itens via Drag and Drop.
 * @param {HTMLElement} container - O elemento pai (ex: tbody ou div lista)
 * @param {String} itemSelector - A classe dos itens arrastáveis (ex: '.nota-row')
 */
function utilsConfigurarDragDrop(container, itemSelector) {
    // Evita adicionar múltiplos listeners no mesmo container
    if (container.hasAttribute('data-drag-init')) return;
    container.setAttribute('data-drag-init', 'true');

    container.addEventListener('dragover', e => {
        e.preventDefault(); // Permite o drop
        
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

/**
 * Função matemática auxiliar para descobrir a posição de inserção.
 */
function utilsGetDragAfterElement(container, y, itemSelector) {
    // Seleciona apenas os itens do tipo correto que NÃO estão sendo arrastados
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

/**
 * Retorna o objeto de status baseado na média e frequência (opcional)
 */
function utilsObterStatusAcademico(media, isFinalizada = false) {
    const valorMedia = parseFloat(media || 0);
    
    // Configurações Globais da Instituição
    const MEDIA_APROVACAO = 7.0;
    const MEDIA_RECUPERACAO = 5.0;

    if (!isFinalizada) {
        return { texto: 'Cursando', classBadge: 'bg-secondary', corTexto: 'text-secondary' };
    }

    if (valorMedia >= MEDIA_APROVACAO) {
        return { texto: 'Aprovado', classBadge: 'bg-success', corTexto: 'text-success' };
    } else if (valorMedia >= MEDIA_RECUPERACAO) {
        return { texto: 'Recuperação', classBadge: 'bg-warning text-dark', corTexto: 'text-warning' };
    } else {
        return { texto: 'Reprovado', classBadge: 'bg-danger', corTexto: 'text-danger' };
    }
}

// EM js/utils.js

function utilsGerarBarraPesos(listaNotas) {
    if (!listaNotas || listaNotas.length === 0) {
        return `<small class="text-muted fst-italic"><i class="fas fa-exclamation-circle text-warning me-1"></i> Pesos não configurados</small>`;
    }

    const cores = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    const barras = listaNotas.map((nota, index) => {
        const desc = nota.descricaoNota || nota.descricao || 'Nota';
        const peso = parseFloat(nota.peso || 0);
        // Evita quebra se peso for 0 ou NaN
        const largura = peso > 0 ? (peso * 10) : 0; 
        const cor = cores[index % cores.length];
        
        return `<div class="d-flex flex-column" style="width: ${largura}%; background-color: ${cor}; border-right: 1px solid #fff;" 
                     data-bs-toggle="tooltip" title="${desc}: Peso ${peso}"></div>`;
    }).join('');

    const legendas = listaNotas.map((nota, index) => {
        const desc = nota.descricaoNota || nota.descricao || 'Nota';
        const peso = parseFloat(nota.peso || 0);
        const cor = cores[index % cores.length];
        
        return `
            <div class="d-flex align-items-center me-3 mb-1" style="font-size: 0.7rem;">
                <span style="width: 6px; height: 6px; background-color: ${cor}; border-radius: 50%; display: inline-block; margin-right: 4px;"></span>
                <span class="text-muted text-truncate" style="max-width: 80px;" title="${desc}">${desc}</span>
                <strong class="ms-1 text-dark">(${peso})</strong>
            </div>`;
    }).join('');

    return `
        <div class="d-flex flex-column" style="width: 100%; max-width: 350px;">
            <div class="d-flex rounded-pill overflow-hidden shadow-sm border mb-1" style="height: 6px; background: #e2e8f0;">
                ${barras}
            </div>
            <div class="d-flex flex-wrap">${legendas}</div>
        </div>`;
}