let receitas = 0;
let despesas = 0;
let transacoes = [];

const listaTransacoes = document.querySelector(".transaction-list");

const saldoEl = document.getElementById("saldo");
const receitasEl = document.getElementById("receitas");
const despesasEl = document.getElementById("despesas");

const btnReceita = document.querySelector(".btn-receita");
const btnDespesa = document.querySelector(".btn-despesa");

const modal = document.getElementById("modal");
const inputNome = document.getElementById("input-nome");
const inputValor = document.getElementById("input-valor");

const btnSalvar = document.getElementById("btn-salvar");
const btnFechar = document.getElementById("btn-fechar");

let tipoAtual = "";

function calcularSaldo() {
  return receitas - despesas;
}

function atualizarDashboard() {
  saldoEl.innerText = `R$ ${calcularSaldo()}`;
  receitasEl.innerText = `R$ ${receitas}`;
  despesasEl.innerText = `R$ ${despesas}`;
}


atualizarDashboard();

function fecharModal() {
  modal.classList.add("closing");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("closing");
  }, 250);
}

function salvarTransacao() {
  const nome = inputNome.value;
  const valor = Number(inputValor.value);

  if (!nome || isNaN(valor)) return;

  transacoes.push({
    id: Date.now(),
    nome,
    valor,
    tipo: tipoAtual
  });

  recalcularTotais();
  salvarNoStorage();
  renderizarTransacoes();

  inputNome.value = "";
  inputValor.value = "";

  fecharModal();
}

btnReceita.addEventListener("click", () => {
  tipoAtual = "income";
  modal.classList.remove("hidden");
  inputNome.focus();
});

btnDespesa.addEventListener("click", () => {
  tipoAtual = "expense";
  modal.classList.remove("hidden");
});

btnFechar.addEventListener("click", fecharModal);

btnSalvar.addEventListener("click", salvarTransacao);

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !modal.classList.contains("hidden")) {
    salvarTransacao();
  }
});

function salvarNoStorage() {
  localStorage.setItem("receitas", receitas);
  localStorage.setItem("despesas", despesas);
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
}

function carregarDoStorage() {
  const receitasSalvas = localStorage.getItem("receitas");
  const despesasSalvas = localStorage.getItem("despesas");
  const transacoesSalvas = localStorage.getItem("transacoes");

  receitas = receitasSalvas ? Number(receitasSalvas) : 0;
  despesas = despesasSalvas ? Number(despesasSalvas) : 0;
  try {
    transacoes = JSON.parse(transacoesSalvas) || [];
  } catch {
    transacoes = [];
  }

  atualizarDashboard();
  renderizarTransacoes();
}

function renderizarTransacoes() {
  listaTransacoes.innerHTML = "";

  transacoes.forEach((t) => {
    const div = document.createElement("div");
    div.classList.add("transaction");
    div.dataset.id = t.id;

    div.innerHTML = `
  <span>${t.nome}</span>

  <div class="right-side">
    <span class="${t.tipo}">
      ${t.tipo === "income" ? "+" : "-"}R$ ${t.valor}
    </span>

    <button class="delete-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
        viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"></path>
        <path d="M8 6V4h8v2"></path>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
      </svg>
    </button>
  </div>
`;

    div.querySelector(".delete-btn").addEventListener("click", () => {
      deletarTransacao(t.id);
    });

    listaTransacoes.appendChild(div);
  });
}

function deletarTransacao(id) {
  transacoes = transacoes.filter(t => t.id !== id);

  recalcularTotais();
  salvarNoStorage();
  renderizarTransacoes();
}

function recalcularTotais() {
  receitas = 0;
  despesas = 0;

  transacoes.forEach(t => {
    if (t.tipo === "income") {
      receitas += t.valor;
    } else {
      despesas += t.valor;
    }
  });

  atualizarDashboard();
}

carregarDoStorage();
