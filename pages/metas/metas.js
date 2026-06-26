// ================================
// VARIÁVEIS
// ================================

let metas = [];
let metaEditando = null;

// ======================
// Seletores do DOM
// ======================

// Container
const containerMetasLongo = document.getElementById("metas-longo");
const containerMetasCurto = document.getElementById("metas-curto");

// Modal meta
const modalMeta = document.getElementById("modal-meta");
const metaModalTitle = document.getElementById("meta-modal-title");
const metaFormError = document.getElementById("meta-form-error");
// input
const inputMetaNome = document.getElementById("input-meta-nome");
const inputMetaObjetivo = document.getElementById("input-meta-objetivo");
const inputMetaAtual = document.getElementById("input-meta-atual");
// botões
const btnNovaMeta = document.getElementById("btn-add-meta");
const btnMetaSalvar = document.getElementById("btn-meta-salvar");
const btnMetaFechar = document.getElementById("btn-meta-fechar");
const btnDeleteMeta = document.getElementById("btn-delete-meta");
// radio
const radiosTipoMeta = document.querySelectorAll('input[name="tipo-meta"]');

// ======================
//   Funções
// ======================

function renderizarMetas() {

    // Limpa os containers
    containerMetasLongo.innerHTML = "";
    containerMetasCurto.innerHTML = "";

    const metasLongo = metas.filter((meta) => meta.tipo === "longo");

    const metasCurto = metas.filter((meta) => meta.tipo === "curto");

    // Renderiza metas de longo prazo
    metasLongo.forEach((meta) => {

    
      const porcentagem = Math.round((meta.atual / meta.objetivo) * 100);
      const falta = meta.objetivo - meta.atual;
      containerMetasLongo.innerHTML += `
        <div class="meta-card">

        <div class="meta-header">
            <h4>${meta.nome}</h4>
            <button class="btn-destaque" type="button">
                <i data-lucide="star"></i>
            </button>
        </div>

        <div class="meta-valores">
            <p>${formatarMoeda(meta.atual)} / ${formatarMoeda(meta.objetivo)}</p>
        </div>

        <div class="meta-progresso">
            <div class="barra-progresso">
                <div class="barra-preenchimento" style="width: ${porcentagem}%"></div>
            </div>

            <span>${porcentagem}%</span>
        </div>

        <div class="meta-footer">
            <span>Falta: ${formatarMoeda(falta)}</span>
            <div class="meta-acoes">
            
            <button class="btn-editar-meta" type="button">
                <i data-lucide="pencil"></i>
            </button>

            <button class="btn-excluir-meta" type="button">
                <i data-lucide="trash-2"></i>
            </button>
        
            </div>

        </div>

        </div>
    `;
       

    });

    // Renderiza metas de curto prazo
    metasCurto.forEach((meta) => {

    
      const porcentagem = Math.round((meta.atual / meta.objetivo) * 100);
      const falta = meta.objetivo - meta.atual;
      containerMetasCurto.innerHTML += `
        <div class="meta-card">

        <div class="meta-header">
            <h4>${meta.nome}</h4>
            <button class="btn-destaque" type="button">
                <i data-lucide="star"></i>
            </button>
        </div>

        <div class="meta-valores">
            <p>${formatarMoeda(meta.atual)} / ${formatarMoeda(meta.objetivo)}</p>
        </div>

        <div class="meta-progresso">
            <div class="barra-progresso">
                <div class="barra-preenchimento" style="width: ${porcentagem}%"></div>
            </div>

            <span>${porcentagem}%</span>
        </div>

        <div class="meta-footer">
            <span>Falta: ${formatarMoeda(falta)}</span>
            <div class="meta-acoes">
            
            <button class="btn-editar-meta" type="button">
                <i data-lucide="pencil"></i>
            </button>

            <button class="btn-excluir-meta" type="button">
                <i data-lucide="trash-2"></i>
            </button>
        
            </div>

        </div>

        </div>
    `;

    });

     lucide.createIcons();
}

function abrirModalMeta() {

    inputMetaNome.value = "";
    inputMetaObjetivo.value = "";
    inputMetaAtual.value = "";

    radiosTipoMeta.forEach((radio) => {
        radio.checked = false;
    });

    metaEditando = null;

    // atualizarModalMetaUI();

    metaFormError.classList.add("hidden");

    modalMeta.classList.remove("hidden");

    inputMetaNome.focus();
}

function fecharModalMeta() {
  modalMeta.classList.add("hidden");
}

function validarFormularioMeta() {
    const nome = inputMetaNome.value.trim();
    const objetivo = Number(inputMetaObjetivo.value);
    const atual = Number(inputMetaAtual.value);

    if (!nome) {
        mostrarErroMeta("Informe um nome para a meta.");
        return false;
    }

    if (isNaN(objetivo) || objetivo <= 0) {
        mostrarErroMeta("Informe um objetivo maior que zero.");
        return false;
    }

    if (isNaN(atual) || atual < 0) {
        mostrarErroMeta("Informe um valor atual válido.");
        return false;
    }

    if (atual > objetivo) {
        mostrarErroMeta("O valor atual não pode ser maior que o objetivo.");
        return false;
    }

    let tipoSelecionado = false;

    radiosTipoMeta.forEach((radio) => {
        if (radio.checked) {
            tipoSelecionado = true;
        }
    });

    if (!tipoSelecionado) {
        mostrarErroMeta("Selecione o tipo da meta.");
        return false;
    }

    esconderErroMeta();
    return true;
}

function salvarMeta() {
    const valido = validarFormularioMeta();

    if (!valido) {
        return;
    }

    const nome = inputMetaNome.value.trim();
    const objetivo = Number(inputMetaObjetivo.value);
    const atual = Number(inputMetaAtual.value);

    let tipo = "";

    radiosTipoMeta.forEach((radio) => {
        if (radio.checked) {
            tipo = radio.value;
        }
    });

    if (metaEditando) {

        metaEditando.nome = nome;
        metaEditando.objetivo = objetivo;
        metaEditando.atual = atual;
        metaEditando.tipo = tipo;

    } else {

        const novaMeta = {
            id: Date.now(),
            nome,
            objetivo,
            atual,
            tipo,
            createdAt: new Date().toISOString(),
        };

        metas.push(novaMeta);
    }

    renderizarMetas();

    fecharModalMeta();
}

function mostrarErroMeta(mensagem) {
  metaFormError.textContent = mensagem;
  metaFormError.classList.remove("hidden");
}

function esconderErroMeta() {
  metaFormError.textContent = "";
  metaFormError.classList.add("hidden");
}



// ======================
// Funções utilitárias
// ======================

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

// Eventos

btnNovaMeta.addEventListener("click", abrirModalMeta);

btnMetaFechar.addEventListener("click", fecharModalMeta);

btnMetaSalvar.addEventListener("click", salvarMeta);

lucide.createIcons();