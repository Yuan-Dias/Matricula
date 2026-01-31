// professor-criterios.js

async function profConfigurarAvaliacoes(idMateria, nomeMateria) {
    try {
        const configs = await fetchAPI(`/materias/${idMateria}/avaliacoes`) || [];

        const regulares = configs.filter(av => !isRec(av.nome || av.descricaoNota));
        const recuperacoes = configs.filter(av => isRec(av.nome || av.descricaoNota));

        let htmlRegulares = regulares.map((av, index) => 
            gerarHtmlLinhaAvaliacao(index, av.id, av.nome || av.descricaoNota, av.peso, false)
        ).join('');

        let htmlRecuperacao = recuperacoes.map((av, index) => 
            gerarHtmlLinhaAvaliacao(`rec-${index}`, av.id, av.nome || av.descricaoNota, av.peso, true)
        ).join('');

        const modalHTML = `
        <div class="modal fade" id="modalConfigCriterios" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-dark text-white">
                        <h5 class="modal-title">Critérios: ${nomeMateria}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p class="text-muted small mb-2">
                            <i class="fas fa-grip-vertical me-1"></i> Arraste as avaliações regulares para ordenar.
                        </p>
                        
                        <div id="containerAvaliacoes" class="list-group list-group-flush">
                            ${htmlRegulares}
                        </div>

                        <div id="containerFixo" class="mt-2 pt-2 border-top">
                            <label class="small fw-bold text-muted mb-2">CRITÉRIO FIXO DE ENCERRAMENTO</label>
                            ${htmlRecuperacao}
                        </div>
                        
                        <button type="button" class="btn btn-sm btn-outline-primary mt-3 w-100 dashed-border" id="btnAddCriterio">
                            <i class="fas fa-plus me-1"></i> Adicionar Avaliação Regular
                        </button>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="profSalvarConfiguracao(${idMateria})">Salvar Configuração</button>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modalEl = document.getElementById('modalConfigCriterios');
        new bootstrap.Modal(modalEl).show();

        iniciarDragAndDrop();

        document.getElementById('btnAddCriterio').onclick = () => {
            const container = document.getElementById('containerAvaliacoes');
            const idTemp = Date.now();
            const novaLinha = gerarHtmlLinhaAvaliacao(idTemp, '', '', 1, false);
            container.insertAdjacentHTML('beforeend', novaLinha);
            iniciarDragAndDrop();
        };

        modalEl.addEventListener('hidden.bs.modal', () => modalEl.remove());

    } catch (e) {
        console.error(e);
        mostrarToast("Erro ao carregar configurações.", "danger");
    }
}

function gerarHtmlLinhaAvaliacao(index, id, nome, peso, fixo = false) {
    const pesoValue = (peso !== null && peso !== undefined) ? peso : 1;
    const isRecuperacao = fixo || isRec(nome);
    
    return `
    <div class="list-group-item d-flex align-items-center p-2 mb-1 border rounded ${fixo ? 'bg-light border-warning-subtle' : 'draggable-item bg-white'}" 
         draggable="${!fixo}" id="row-av-${index}">
        
        <div class="drag-handle ${fixo ? 'text-warning' : 'text-muted'} me-3" style="padding: 5px;">
            <i class="fas ${fixo ? 'fa-lock' : 'fa-grip-vertical'} fa-lg"></i>
        </div>

        <input type="hidden" class="av-id" value="${id || ''}">
        
        <div class="flex-grow-1 me-2">
            <input type="text" class="form-control av-nome form-control-sm ${fixo ? 'fw-bold' : ''}" 
                   ${fixo ? 'readonly' : 'oninput="revalidarExibicaoPeso(this)"'}
                   placeholder="Nome (ex: Prova 1)" value="${nome || ''}">
        </div>
        
        <div class="area-peso" style="width: 80px; visibility: ${isRecuperacao ? 'hidden' : 'visible'};">
            <input type="number" class="form-control av-peso form-control-sm text-center" 
                   value="${isRecuperacao ? 0 : pesoValue}" min="0" max="10" step="0.1">
        </div>
        
        ${!fixo ? `
        <button class="btn btn-link text-danger ms-2" type="button" onclick="this.closest('.list-group-item').remove()">
            <i class="fas fa-trash-alt"></i>
        </button>` : '<div class="ms-2" style="width: 38px"></div>'}
    </div>`;
}

function revalidarExibicaoPeso(input) {
    const nome = input.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    const areaPeso = input.closest('.draggable-item').querySelector('.area-peso');
    const inputPeso = areaPeso.querySelector('.av-peso');
    
    if (nome === "RECUPERACAO" || nome === "PROVA FINAL") {
        areaPeso.style.visibility = 'hidden';
        inputPeso.value = 0;
    } else {
        areaPeso.style.visibility = 'visible';
    }
}

function iniciarDragAndDrop() {
    const container = document.getElementById('containerAvaliacoes');
    const items = container.querySelectorAll('.draggable-item');

    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.effectAllowed = 'move';
            item.classList.add('opacity-50', 'border-primary'); 
            e.dataTransfer.setData('text/plain', item.id);
            window.draggedItem = item; 
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('opacity-50', 'border-primary');
            window.draggedItem = null;
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dragged = window.draggedItem;
            if (dragged && dragged !== item) {
                const bounding = item.getBoundingClientRect();
                const offset = bounding.y + (bounding.height / 2);
                
                if (e.clientY - offset > 0) {
                    item.after(dragged);
                } else {
                    item.before(dragged);
                }
            }
        });
    });
}

async function profSalvarConfiguracao(idMateria) {
    const containerRegulares = document.getElementById('containerAvaliacoes');
    const containerFixo = document.getElementById('containerFixo');
    
    const rowsRegulares = containerRegulares ? containerRegulares.querySelectorAll('.list-group-item') : [];
    const rowsFixas = containerFixo ? containerFixo.querySelectorAll('.list-group-item') : [];
    const allRows = [...rowsRegulares, ...rowsFixas];

    const novasAvaliacoes = [];
    let erroValidacao = null;
    let somaPesosRegulares = 0;

    allRows.forEach((row) => {
        if (erroValidacao) return;

        const idExistente = row.querySelector('.av-id')?.value;
        const nomeInput = row.querySelector('.av-nome'); 
        const pesoInput = row.querySelector('.av-peso');
        
        if (nomeInput && pesoInput) {
            let nomeOriginal = nomeInput.value.trim();
            if (nomeOriginal === "") return;

            let nomeNormalizado = nomeOriginal.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
            const isRecuperacao = (nomeNormalizado === "RECUPERACAO" || nomeNormalizado === "PROVA FINAL");

            let peso = parseFloat(pesoInput.value);
            if (isNaN(peso)) peso = 0;

            if (peso > 10 || peso < 0) {
                erroValidacao = `O peso da avaliação "${nomeOriginal}" deve estar entre 0 e 10.`;
                return;
            }

            novasAvaliacoes.push({ 
                id: idExistente ? parseInt(idExistente) : null, 
                descricaoNota: isRecuperacao ? nomeNormalizado : nomeOriginal,
                peso: peso 
            });
            
            if (!isRecuperacao) {
                somaPesosRegulares += peso;
            }
        }
    });

    if (erroValidacao) {
        mostrarToast(erroValidacao, "danger");
        return;
    }

    if (Math.abs(somaPesosRegulares - 10) > 0.01) {
        mostrarToast(`A soma dos pesos regulares deve ser 10. Atual: ${somaPesosRegulares.toFixed(1)}`, "danger");
        return;
    }

    try {
        if (typeof instLoading === 'function') instLoading(true);

        await fetchAPI(`/materias/${idMateria}/avaliacoes`, 'PUT', novasAvaliacoes);

        mostrarToast("Critérios de avaliação atualizados!", "success");
        
        const modalEl = document.getElementById('modalConfigCriterios');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        
        const tituloEl = document.querySelector('h5.modal-title');
        const nomeMat = tituloEl ? tituloEl.innerText.replace('Critérios: ', '') : 'Matéria';
        
        setTimeout(() => profVerAlunos(idMateria, nomeMat), 500);

    } catch (e) {
        console.error("Erro ao salvar configuração:", e);
        mostrarToast(e.message || "Erro ao salvar configuração.", "danger");
    } finally {
        if (typeof instLoading === 'function') instLoading(false);
    }
}