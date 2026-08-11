// =========================
// ELEMENTOS DO DOM
// =========================

const listaTransacoes = document.querySelector(".lista-transacoes");
const inputPesquisa = document.querySelector(".pesquisa input");

const btnTodas = document.getElementById("btnTodas");
const btnReceitas = document.getElementById("btnReceitas");
const btnDespesas = document.getElementById("btnDespesas");

const btnNovaTransacao = document.querySelector(".btn-nova-transacao");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");

const inputNome = document.getElementById("input-nome");
const inputValor = document.getElementById("input-valor");
const inputCategoria = document.getElementById("input-categoria");

const formError = document.getElementById("form-error");

const btnSalvar = document.getElementById("btn-salvar");
const btnFechar = document.getElementById("btn-fechar");

const deleteModal = document.getElementById("delete-modal");

const btnCancelarDelete = document.getElementById("btn-cancelar-delete");

const btnConfirmarDelete = document.getElementById("btn-confirmar-delete");

const btnModalReceita = document.getElementById("btn-modal-receita");
const btnModalDespesa = document.getElementById("btn-modal-despesa");

// Ícones utilizados em cada categoria
const iconesCategoria = {
  delivery: "hamburger",
  transporte: "car",
  salario: "briefcase-business",
  mercado: "shopping-cart",
  outros: "package"
};

// Cores utilizadas no gráfico por categoria
const coresCategoria = {
  mercado: "#ef4444",
  transporte: "#3b82f6",
  salario: "#006400",
  delivery: "#f97316",
  outros: "#6b7280"
};

// =========================
// DADOS
// =========================

let transacoes = [];

// =========================
// ESTADO DA INTERFACE
// =========================

let filtroAtual = "todas";
let pesquisaAtual = "";

let tipoAtual = "";
let transacaoParaEditar = null;
let transacaoParaExcluir = null;

// =========================
// FUNÇÕES
// =========================

function carregarTransacoes() {
    const transacoesSalvas = localStorage.getItem("transacoes");

    try {
        transacoes = JSON.parse(transacoesSalvas) || [];
    } catch {
        transacoes = [];
    }

    transacoes = transacoes.map(t => ({
        ...t,
        createdAt: t.createdAt || new Date().toISOString()
    }));
}

function renderizarTransacoes() {

    listaTransacoes.innerHTML = "";

    if (transacoes.length === 0) {
        listaTransacoes.innerHTML = `
            <p class="mensagem-vazia">
                Nenhuma transação cadastrada.
            </p>
        `;

        return;
    }

    const transacoesFiltradas = obterTransacoesFiltradas();

    const grupos = agruparTransacoesPorData(transacoesFiltradas);

    Object.keys(grupos).forEach(data => {

        const transacoesDoDia = grupos[data];

        // criar card do dia
        const cardDia = document.createElement("div");
        cardDia.classList.add("card-dia");

        cardDia.innerHTML = `
            <h3>${data}</h3>
        `;


        // adicionar transações dentro do dia
        transacoesDoDia.forEach(transacao => {

            console.log(transacao.tipo);

            const item = document.createElement("div");
            item.classList.add("transacao-item");

            item.innerHTML = `
                <div class="icone-transacao">
                    <i data-lucide="${iconesCategoria[transacao.categoria]}"></i>
                </div>

                <div class="transacao-info">
                    <strong>${transacao.nome}</strong>
                </div>

                <span class="${transacao.tipo}">
                    R$ ${transacao.valor.toFixed(2)}
                </span>
            `;

            cardDia.appendChild(item);

        });


        // adiciona o card completo na tela
        listaTransacoes.appendChild(cardDia);

    });

    // renderiza os ícones criados pelo JS
    lucide.createIcons();

}

function agruparTransacoesPorData(transacoesParaAgrupar) {
    const grupos = {};

    transacoesParaAgrupar.forEach(transacao => {

        const data = new Date(transacao.createdAt);
        const dataFormatada = data.toLocaleDateString("pt-BR");

        if (!grupos[dataFormatada]) {
            grupos[dataFormatada] = [];
        }

        grupos[dataFormatada].push(transacao);

    });

    return grupos;
}

function abrirModalTransacao() {
    transacaoParaEditar = null;

    inputNome.value = "";
    inputValor.value = "";
    inputCategoria.selectedIndex = 0;

    modalTitle.innerText = "Adicionar transação";
    btnSalvar.innerText = "Salvar";

    formError.classList.add("hidden");

    modal.classList.remove("hidden");

    inputNome.focus();
}
function fecharModal() {
    modal.classList.add("closing");

    setTimeout(() => {
        modal.classList.add("hidden");
        modal.classList.remove("closing");

        transacaoParaEditar = null;
    }, 250);
}

function salvarTransacao() {
    const nome = inputNome.value.trim();
    const valor = Number(inputValor.value);
    const categoria = inputCategoria.value;

    if (!nome) {
        mostrarErro("Informe uma descrição válida");
        return;
    }

    if (isNaN(valor) || valor <= 0) {
        mostrarErro("Informe um valor maior que zero");
        return;
    }

    if (!categoria) {
        mostrarErro("Selecione uma categoria");
        return;
    }

    if (!tipoAtual) {
        mostrarErro("Selecione receita ou despesa");
        return;
    }

    transacoes.push({
        id: Date.now(),
        nome,
        valor,
        tipo: tipoAtual,
        categoria,
        createdAt: new Date().toISOString()
    });

    salvarNoStorage();
    renderizarTransacoes();
    fecharModal();
}

function mostrarErro(msg) {
    formError.innerText = msg;
    formError.classList.remove("hidden");

    setTimeout(() => {
        formError.classList.add("hidden");
    }, 2500);
}

function salvarNoStorage() {
    localStorage.setItem("transacoes", JSON.stringify(transacoes));
}

function obterTransacoesFiltradas() {
    let resultado = transacoes;

    if (filtroAtual === "receitas") {
        resultado = resultado.filter(
            transacao => transacao.tipo === "income"
        );
    }

    if (filtroAtual === "despesas") {
        resultado = resultado.filter(
            transacao => transacao.tipo === "expense"
        );
    }

    if (pesquisaAtual !== "") {
        resultado = resultado.filter(transacao =>
            transacao.nome.toLowerCase().includes(pesquisaAtual)
        );
    }

    return resultado;
}

function atualizarFiltroVisual() {
    btnTodas.classList.remove("filtro-ativo");
    btnReceitas.classList.remove("filtro-ativo");
    btnDespesas.classList.remove("filtro-ativo");

    if (filtroAtual === "todas") {
        btnTodas.classList.add("filtro-ativo");
    }

    if (filtroAtual === "receitas") {
        btnReceitas.classList.add("filtro-ativo");
    }

    if (filtroAtual === "despesas") {
        btnDespesas.classList.add("filtro-ativo");
    }
}

btnSalvar.addEventListener("click", salvarTransacao);
btnNovaTransacao.addEventListener("click", abrirModalTransacao);
btnModalReceita.addEventListener("click", () => {
    tipoAtual = "income";
});

btnModalDespesa.addEventListener("click", () => {
    tipoAtual = "expense";
});

btnFechar.addEventListener("click", fecharModal);

btnReceitas.addEventListener("click", () => {
    filtroAtual = "receitas";

    const resultado = obterTransacoesFiltradas();

    renderizarTransacoes();
    atualizarFiltroVisual();
});

btnDespesas.addEventListener("click", () => {
    filtroAtual = "despesas";
    renderizarTransacoes();
    atualizarFiltroVisual();
});

btnTodas.addEventListener("click", () => {
    filtroAtual = "todas";
    renderizarTransacoes();
    atualizarFiltroVisual();
});

inputPesquisa.addEventListener("input", () => {
    pesquisaAtual = inputPesquisa.value.toLowerCase();

    renderizarTransacoes();
});

carregarTransacoes();
renderizarTransacoes();


