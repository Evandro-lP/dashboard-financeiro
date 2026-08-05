// =========================
// ELEMENTOS DO DOM
// =========================

const listaTransacoes = document.querySelector(".lista-transacoes");
const inputPesquisa = document.querySelector(".pesquisa input");

const btnTodas = document.getElementById("btnTodas");
const btnReceitas = document.getElementById("btnReceitas");
const btnDespesas = document.getElementById("btnDespesas");

const btnNovaTransacao = document.querySelector(".btn-nova-transacao");

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

    const grupos = agruparTransacoesPorData();

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

function agruparTransacoesPorData() {
    const grupos = {};

    transacoes.forEach(transacao => {

        const data = new Date(transacao.createdAt);
        const dataFormatada = data.toLocaleDateString("pt-BR");

        if (!grupos[dataFormatada]) {
            grupos[dataFormatada] = [];
        }

        grupos[dataFormatada].push(transacao);

    });

    return grupos;
}

carregarTransacoes();
renderizarTransacoes();
console.log(agruparTransacoesPorData());
console.log(transacoes);

