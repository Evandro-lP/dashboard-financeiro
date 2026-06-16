// valores financeiros atuais
let receitas = 0;
let despesas = 0;
// lista de transações
let transacoes = [];
// controle de transação que será excluida
let transacaoParaExcluir = null;
// tipo de transação sendo criada (income / expense)
let tipoAtual = "";
// editar transação
let transacaoParaEditar = null;

const listaTransacoes = document.querySelector(".transaction-list");
// painel principal
const saldoEl = document.getElementById("saldo");
const receitasEl = document.getElementById("receitas");
const despesasEl = document.getElementById("despesas");
// botões de adicionar receitas e despesas
const btnReceita = document.querySelector(".btn-receita");
const btnDespesa = document.querySelector(".btn-despesa");
// modal de criação
const modal = document.getElementById("modal");
const inputNome = document.getElementById("input-nome");
const inputValor = document.getElementById("input-valor");
const btnSalvar = document.getElementById("btn-salvar");
const btnFechar = document.getElementById("btn-fechar");
// modal de exclusão
const deleteModal = document.getElementById("delete-modal");
const btnCancelarDelete = document.getElementById("btn-cancelar-delete");
const btnConfirmarDelete = document.getElementById("btn-confirmar-delete");

const modalTitle = document.getElementById("modal-title");

function atualizarModalUI() {
  if (transacaoParaEditar) {
    modalTitle.innerText = "Editar transação";
    btnSalvar.innerText = "Atualizar";
  } else {
    modalTitle.innerText = "Adicionar transação";
    btnSalvar.innerText = "Salvar";
  }
}

// Calcula o saldo atual (receitas - despesas)
function calcularSaldo() {
  return receitas - despesas;
}

// Atualiza os valores exibidos no painel financeiro
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

    transacaoParaEditar = null;
    atualizarModalUI(); // 👈 volta ao padrão
  }, 250);
}

function salvarTransacao() {
  const nome = inputNome.value;
  const valor = Number(inputValor.value);

  if (!nome || isNaN(valor)) return;

  // 👉 MODO EDITAR
  if (transacaoParaEditar) {
    transacaoParaEditar.nome = nome;
    transacaoParaEditar.valor = valor;
    transacaoParaEditar = null;
  } 
  // 👉 MODO CRIAR
  else {
    transacoes.push({
      id: Date.now(),
      nome,
      valor,
      tipo: tipoAtual
    });
  }

  recalcularTotais();
  salvarNoStorage();
  renderizarTransacoes();

  inputNome.value = "";
  inputValor.value = "";

  fecharModal();
}

// Abre modal para adicionar receita
btnReceita.addEventListener("click", () => {
  tipoAtual = "income";

  transacaoParaEditar = null; // garante modo criação

  inputNome.value = "";
  inputValor.value = "";

  atualizarModalUI(); // muda título e botão

  modal.classList.remove("hidden");
  inputNome.focus();
});

// Abre modal para adicionar despesa
btnDespesa.addEventListener("click", () => {
  tipoAtual = "expense";

  transacaoParaEditar = null; // garante modo criação

  inputNome.value = "";
  inputValor.value = "";

  atualizarModalUI(); // muda título e botão

  modal.classList.remove("hidden");
});

// Fecha modal
btnFechar.addEventListener("click", fecharModal);
// Salva nova transação
btnSalvar.addEventListener("click", salvarTransacao);
// Atalho: Enter para salvar
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !modal.classList.contains("hidden")) {
    salvarTransacao();
  }
});

// fechar modal delete
btnCancelarDelete.addEventListener("click", fecharDeleteModal);

// confirmar delete
btnConfirmarDelete.addEventListener("click", () => {
  if (transacaoParaExcluir === null) return;

  transacoes = transacoes.filter(
    t => t.id !== transacaoParaExcluir
  );

  recalcularTotais();
  salvarNoStorage();
  renderizarTransacoes();

  fecharDeleteModal();
});

// Salva estado atual no localStorage
function salvarNoStorage() {
  localStorage.setItem("receitas", receitas);
  localStorage.setItem("despesas", despesas);
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
}

// Carrega dados salvos do localStorage
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

// Renderiza todas as transações na interface
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

div.innerHTML = `
  <span>${t.nome}</span>

  <div class="right-side">
    <span class="${t.tipo}">
      ${t.tipo === "income" ? "+" : "-"}R$ ${t.valor}
    </span>

    <button class="edit-btn">✏️</button>
    <button class="delete-btn">🗑</button>
  </div>
`;

    div.querySelector(".delete-btn").addEventListener("click", () => {
  transacaoParaExcluir = t.id;
  deleteModal.classList.remove("hidden");
});

div.querySelector(".edit-btn").addEventListener("click", () => {
  abrirModalEdicao(t);
});

div.querySelector(".edit-btn").addEventListener("click", () => {
  transacaoParaEditar = t;

  inputNome.value = t.nome;
  inputValor.value = t.valor;
  tipoAtual = t.tipo;

  atualizarModalUI();

  modal.classList.remove("hidden");
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

// Recalcula receitas e despesas com base na lista de transações
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

function fecharDeleteModal() {
  deleteModal.classList.add("closing");

  setTimeout(() => {
    deleteModal.classList.add("hidden");
    deleteModal.classList.remove("closing");
    transacaoParaExcluir = null;
  }, 250);
}

function abrirModalEdicao(t) {
  transacaoParaEditar = t;

  inputNome.value = t.nome;
  inputValor.value = t.valor;
  tipoAtual = t.tipo;

  modal.classList.remove("hidden");
}

carregarDoStorage();
