// ================================
// VARIÁVEIS
// ================================

let metas = [];
let metaEditando = null;
let filtroTipo = "todos";

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
// radio
const radiosTipoMeta = document.querySelectorAll('input[name="tipo-meta"]');
const botoesFiltro = document.querySelectorAll(".btn-filtro");

// ======================
//   Funções
// ======================

function salvarMetasStorage() {
    localStorage.setItem("metas", JSON.stringify(metas));
}

function carregarMetasStorage() {

    const metasSalvas = localStorage.getItem("metas");

    try {
        metas = JSON.parse(metasSalvas) || [];
    } catch {
        metas = [];
    }

    renderizarMetas();
}

function criarCardMeta(meta) {

    const porcentagem = Math.round((meta.atual / meta.objetivo) * 100);
    const falta = meta.objetivo - meta.atual;

    return `
        <div class="meta-card">

        <div class="meta-header">
            <h4>${meta.nome}</h4>
            <button class="btn-destaque" type="button" onclick="definirMetaPrincipal(${meta.id})">
                <i data-lucide="star" class="star ${meta.destaque ? "destaque-on" : ""}"></i>
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
            <span class="meta-falta">
            Falta: <strong>${formatarMoeda(falta)}</strong>
            </span>
            <div class="meta-acoes">
            
            <button class="btn-editar-meta" type="button" onclick="editarMeta(${meta.id})">
                <i data-lucide="pencil"></i>
            </button>

            <button class="btn-excluir-meta" type="button" onclick="excluirMeta(${meta.id})">
                <i data-lucide="trash-2"></i>
            </button>
        
            </div>

        </div>

        </div>
    `;
}

function aplicarFiltroTipo() {

    if (filtroTipo === "todos") {
        return metas;
    }

    if (filtroTipo === "longo") {
        return metas.filter((meta) => meta.tipo === "longo");
    }

    if (filtroTipo === "curto") {
        return metas.filter((meta) => meta.tipo === "curto");
    }

    return metas;
}

function renderizarMetas() {

    // Limpa os containers
    containerMetasLongo.innerHTML = "";
    containerMetasCurto.innerHTML = "";

    const metasFiltradas = aplicarFiltroTipo();

    const metasLongo = metasFiltradas.filter((meta) => meta.tipo === "longo");
    const metasCurto = metasFiltradas.filter((meta) => meta.tipo === "curto");

    // Renderiza metas de longo prazo
    metasLongo.forEach((meta) => {
        containerMetasLongo.innerHTML += criarCardMeta(meta);
    });

    // Renderiza metas de curto prazo
    metasCurto.forEach((meta) => {
        containerMetasCurto.innerHTML += criarCardMeta(meta);
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

    atualizarModalMetaUI();

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
            destaque: metas.length === 0,
            createdAt: new Date().toISOString(),
        };

        metas.push(novaMeta);
    }

    salvarMetasStorage();
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

function atualizarModalMetaUI() {

    if (metaEditando) {

        metaModalTitle.textContent = "Editar Meta";
        btnMetaSalvar.textContent = "Salvar alterações";


    } else {

        metaModalTitle.textContent = "Nova Meta";
        btnMetaSalvar.textContent = "Adicionar";


    }

}

function editarMeta(id) {
    console.log(id);
    const meta = metas.find((meta) => meta.id === id);
    metaEditando = meta;

    inputMetaNome.value = meta.nome;
    inputMetaObjetivo.value = meta.objetivo;
    inputMetaAtual.value = meta.atual;

    radiosTipoMeta.forEach((radio) => {
        radio.checked = radio.value === meta.tipo;
    });

    esconderErroMeta();

    atualizarModalMetaUI();

    modalMeta.classList.remove("hidden");

    inputMetaNome.focus();

}

function excluirMeta(id) {

    const metaExcluida = metas.find((meta) => meta.id === id);

    const eraDestaque = metaExcluida.destaque;
    const tipo = metaExcluida.tipo;

    metas = metas.filter((meta) => meta.id !== id);

    if (eraDestaque) {

        const metaMaisAntiga = metas.find((meta) => meta.tipo === tipo);

        if (metaMaisAntiga) {
            metaMaisAntiga.destaque = true;
        }

    }

    salvarMetasStorage();

    renderizarMetas();

    fecharModalMeta();

}

function definirMetaPrincipal(id) {

    const metaSelecionada = metas.find(meta => meta.id === id);
    const tipo = metaSelecionada.tipo;

    metas.forEach((meta) => {

        if (meta.tipo === tipo) {

            if (meta.id === id) {
                meta.destaque = true;
            } else {
                meta.destaque = false;
            }

        }

    });

    salvarMetasStorage();

    renderizarMetas();

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

botoesFiltro.forEach((botao) => {

    botao.addEventListener("click", () => {

        
        filtroTipo = botao.dataset.tipo;
        console.log(filtroTipo);
        renderizarMetas();

    });

});

botoesFiltro.forEach((botao) => {

    botao.addEventListener("click", () => {

        botoesFiltro.forEach((botaoAtual) => {
            botaoAtual.classList.remove("ativo");
        });

        botao.classList.add("ativo");

        filtroTipo = botao.dataset.tipo;

        renderizarMetas();

    });

});

carregarMetasStorage();