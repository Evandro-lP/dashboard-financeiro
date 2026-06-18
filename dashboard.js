// valores financeiros atuais
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
let grafico;
let graficoResumo;

const iconesCategoria = {
  delivery: "hamburger",
  transporte: "car",
  salario: "briefcase-business",
  mercado: "shopping-cart",
  outros: "package"
};

const coresCategoria = {
  mercado: "#ef4444",
  transporte: "#3b82f6",
  salario: "#006400",
  delivery: "#f97316",
  outros: "#6b7280"
};

Chart.register(ChartDataLabels);
Chart.defaults.font.family = "'Inter', sans-serif";

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
btnSalvar.disabled = true;
const btnFechar = document.getElementById("btn-fechar");
// modal de exclusão
const deleteModal = document.getElementById("delete-modal");
const btnCancelarDelete = document.getElementById("btn-cancelar-delete");
const btnConfirmarDelete = document.getElementById("btn-confirmar-delete");

const modalTitle = document.getElementById("modal-title");
const formError = document.getElementById("form-error");
const inputCategoria = document.getElementById("input-categoria");


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

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
// Atualiza os valores exibidos no painel financeiro
function atualizarDashboard() {
saldoEl.innerText = formatarMoeda(calcularSaldo());
receitasEl.innerText = formatarMoeda(receitas);
despesasEl.innerText = formatarMoeda(despesas);
}


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

  // 👉 MODO EDITAR
  if (transacaoParaEditar) {
  transacaoParaEditar.nome = nome;
  transacaoParaEditar.valor = valor;
  transacaoParaEditar.categoria = categoria;
  transacaoParaEditar = null;
}
  // 👉 MODO CRIAR
  else {
    transacoes.push({
      id: Date.now(),
      nome,
      valor,
      tipo: tipoAtual,
      categoria,
      createdAt: new Date().toISOString()
    });
  }

  recalcularTotais();
  salvarNoStorage();
  renderizarTransacoes();

  inputNome.value = "";
  inputValor.value = "";

  fecharModal();
}



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
transacoes = transacoes.map(t => ({
  ...t,
  createdAt: t.createdAt || new Date().toISOString()
}));


// Calcula o saldo atual (receitas - despesas)
function calcularSaldo() {
  return receitas - despesas;
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
console.log(formatarMoeda(1234.56));
// Atualiza os valores exibidos no painel financeiro
function atualizarDashboard() {
saldoEl.innerText = formatarMoeda(calcularSaldo());
receitasEl.innerText = formatarMoeda(receitas);
despesasEl.innerText = formatarMoeda(despesas);
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

  // 👉 MODO EDITAR
  if (transacaoParaEditar) {
  transacaoParaEditar.nome = nome;
  transacaoParaEditar.valor = valor;
  transacaoParaEditar.categoria = categoria;
  transacaoParaEditar = null;
}
  // 👉 MODO CRIAR
  else {
    transacoes.push({
      id: Date.now(),
      nome,
      valor,
      tipo: tipoAtual,
      categoria,
      createdAt: new Date().toISOString()
    });
  }

  atualizarInterface();

  inputNome.value = "";
  inputValor.value = "";

  fecharModal();
}


inputNome.addEventListener("input", validarFormulario);
inputValor.addEventListener("input", validarFormulario);
inputCategoria.addEventListener("change", validarFormulario);
// Abre modal para adicionar receita
btnReceita.addEventListener("click", () => {
  tipoAtual = "income";

  transacaoParaEditar = null; // garante modo criação

  inputNome.value = "";
  inputValor.value = "";

  atualizarModalUI(); // muda título e botão

  modal.classList.remove("hidden");
  inputNome.focus();
  validarFormulario();
});

// Abre modal para adicionar despesa
btnDespesa.addEventListener("click", () => {
  tipoAtual = "expense";

  transacaoParaEditar = null; // garante modo criação

  inputNome.value = "";
  inputValor.value = "";

  atualizarModalUI(); // muda título e botão

  modal.classList.remove("hidden");
  validarFormulario();
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
  
  transacoes = transacoes.map(t => ({
    ...t,
    createdAt: t.createdAt || new Date().toISOString()
  }));

  // Apenas uma chamada para resolver tudo
  atualizarInterface();
}

// Renderiza todas as transações na interface
function renderizarTransacoes() {
  listaTransacoes.innerHTML = "";

  transacoes.forEach((t) => {
    
    const icone = iconesCategoria[t.categoria] || "package";
   
    const div = document.createElement("div");
    div.classList.add("transaction");
    div.dataset.id = t.id;

    div.innerHTML = `
  <div class="left-side">

  <i data-lucide="${icone}"></i>

  <span>${t.nome}</span>

</div>
  <div class="right-side">
    <span class="${t.tipo}">
      ${t.tipo === "income" ? "+" : "-"} ${formatarMoeda(t.valor)}
    </span>


    <span class="data">${formatarData(t.createdAt)}</span>

    <button class="edit-btn">
      ✏️
    </button>

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
  transacaoParaExcluir = t.id;
  deleteModal.classList.remove("hidden");
});

div.querySelector(".edit-btn").addEventListener("click", () => {
  abrirModalEdicao(t);
});



    listaTransacoes.appendChild(div);
  });

  lucide.createIcons();
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
  inputCategoria.value = t.categoria;
  inputNome.value = t.nome;
  inputValor.value = t.valor;
  tipoAtual = t.tipo;
  atualizarModalUI();
  modal.classList.remove("hidden");
  validarFormulario();
}

function mostrarErro(msg) {
  formError.innerText = msg;
  formError.classList.remove("hidden");

  setTimeout(() => {
    formError.classList.add("hidden");
  }, 2500);
}

function validarFormulario() {
  const nome = inputNome.value.trim();
  const valor = Number(inputValor.value);
  const categoria = inputCategoria.value;

  const valido =
    nome &&
    !isNaN(valor) &&
    valor > 0 &&
    categoria;

  btnSalvar.disabled = !valido;

  return valido;
}

function formatarData(dataISO) {
  if (!dataISO) return "—";

  const data = new Date(dataISO);

  if (isNaN(data.getTime())) return "—";

  return data.toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "2-digit"
});

}

function calcularPorCategoria() {
  const totais = {};

  transacoes.forEach((t) => {
    if (t.tipo === "expense") {

      if (!totais[t.categoria]) {
        totais[t.categoria] = 0;
      }

      totais[t.categoria] += t.valor;
    }
  });
  const filtrado = {};

for (let cat in totais) {
  if (totais[cat] > 0) {
    filtrado[cat] = totais[cat];
  }
}

return filtrado;
}

function renderizarGrafico(dados) {
  console.log("DADOS NO GRAFICO:", dados);
}

function renderizarGrafico(dados) {
  const ctx = document.getElementById("grafico-categorias");
  const cores = Object.keys(dados).map(cat => coresCategoria[cat] || "#999");
  const labels = Object.keys(dados);
  const valores = Object.values(dados);

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
  data: valores,
  backgroundColor: cores,
  borderWidth: 0,
  hoverOffset: 8
}]
    },
    options: {
  responsive: true,
  cutout: "55%",

  plugins: {
    legend: {
      position: "bottom"
    },

    datalabels: {
      color: "#111827",
      font: {
        weight: "bold",
        size: 24
      },

      formatter: (value, ctx) => {
        const data = ctx.chart.data.datasets[0].data;
        const total = data.reduce((a, b) => a + b, 0);
        const percent = ((value / total) * 100).toFixed(0);

        return percent + "%";
      }
    }
  }
}
  });
}

function renderizarGraficoResumo() {

  const ctx = document.getElementById("grafico-resumo");

  if (graficoResumo) {
    graficoResumo.destroy();
  }

  graficoResumo = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [{
        data: [receitas, despesas],
        backgroundColor: ["#6a994e", "#ef4444"],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
  responsive: true,
  cutout: "55%",

  plugins: {
    legend: {
      position: "bottom"
    },

    datalabels: {
      color: "#111827",
      font: {
        weight: "bold",
        size: 24
      },

      formatter: (value, ctx) => {
        const data = ctx.chart.data.datasets[0].data;
        const total = data.reduce((a, b) => a + b, 0);
        const percent = ((value / total) * 100).toFixed(0);

        return percent + "%";
      }
    }
  }
}
  });
}
console.log(transacoes);
console.log(calcularPorCategoria());
carregarDoStorage();

  atualizarDashboard();
  renderizarTransacoes();

  const dados = calcularPorCategoria();
  renderizarGrafico(dados);

  renderizarGraficoResumo();
}

// Renderiza todas as transações na interface
function renderizarTransacoes() {
  listaTransacoes.innerHTML = "";

  transacoes.forEach((t) => {
    
    const icone = iconesCategoria[t.categoria] || "package";
   
    const div = document.createElement("div");
    div.classList.add("transaction");
    div.dataset.id = t.id;

    div.innerHTML = `
  <div class="left-side">

  <i data-lucide="${icone}"></i>

  <span>${t.nome}</span>

</div>
  <div class="right-side">
    <span class="${t.tipo}">
      ${t.tipo === "income" ? "+" : "-"} ${formatarMoeda(t.valor)}
    </span>


    <span class="data">${formatarData(t.createdAt)}</span>

    <button class="edit-btn">
      ✏️
    </button>

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
  transacaoParaExcluir = t.id;
  deleteModal.classList.remove("hidden");
});

div.querySelector(".edit-btn").addEventListener("click", () => {
  abrirModalEdicao(t);
});



    listaTransacoes.appendChild(div);
  });

  lucide.createIcons();
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

function atualizarInterface() {
  recalcularTotais();
  salvarNoStorage();
  renderizarTransacoes();
  
  // Atualiza os gráficos
  const dados = calcularPorCategoria();
  renderizarGrafico(dados);
  renderizarGraficoResumo();
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
  inputCategoria.value = t.categoria;
  inputNome.value = t.nome;
  inputValor.value = t.valor;
  tipoAtual = t.tipo;
  atualizarModalUI();
  modal.classList.remove("hidden");
  validarFormulario();
}

function mostrarErro(msg) {
  formError.innerText = msg;
  formError.classList.remove("hidden");

  setTimeout(() => {
    formError.classList.add("hidden");
  }, 2500);
}

function validarFormulario() {
  const nome = inputNome.value.trim();
  const valor = Number(inputValor.value);
  const categoria = inputCategoria.value;

  const valido =
    nome &&
    !isNaN(valor) &&
    valor > 0 &&
    categoria;

  btnSalvar.disabled = !valido;

  return valido;
}

function formatarData(dataISO) {
  if (!dataISO) return "—";

  const data = new Date(dataISO);

  if (isNaN(data.getTime())) return "—";

  return data.toLocaleDateString("pt-BR", {
  day: "2-digit",
  month: "2-digit"
});

}

function calcularPorCategoria() {
  const totais = {};

  transacoes.forEach((t) => {
    if (t.tipo === "expense") {

      if (!totais[t.categoria]) {
        totais[t.categoria] = 0;
      }

      totais[t.categoria] += t.valor;
    }
  });
  const filtrado = {};

for (let cat in totais) {
  if (totais[cat] > 0) {
    filtrado[cat] = totais[cat];
  }
}

return filtrado;
}

function renderizarGrafico(dados) {
  console.log("DADOS NO GRAFICO:", dados);
}

function renderizarGrafico(dados) {
  const ctx = document.getElementById("grafico-categorias");
  const cores = Object.keys(dados).map(cat => coresCategoria[cat] || "#999");
  const labels = Object.keys(dados);
  const valores = Object.values(dados);

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
  data: valores,
  backgroundColor: cores,
  borderWidth: 0,
  hoverOffset: 8
}]
    },
    options: {
  responsive: true,
  cutout: "55%",

  plugins: {
    legend: {
      position: "bottom"
    },

    datalabels: {
      color: "#111827",
      font: {
        weight: "bold",
        size: 24
      },

      formatter: (value, ctx) => {
        const data = ctx.chart.data.datasets[0].data;
        const total = data.reduce((a, b) => a + b, 0);
        const percent = ((value / total) * 100).toFixed(0);

        return percent + "%";
      }
    }
  }
}
  });
}

function renderizarGraficoResumo() {

  const ctx = document.getElementById("grafico-resumo");

  if (graficoResumo) {
    graficoResumo.destroy();
  }

  graficoResumo = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Receitas", "Despesas"],
      datasets: [{
        data: [receitas, despesas],
        backgroundColor: ["#6a994e", "#ef4444"],
        borderWidth: 0,
        hoverOffset: 8
      }]
    },
    options: {
  responsive: true,
  cutout: "55%",

  plugins: {
    legend: {
      position: "bottom"
    },

    datalabels: {
      color: "#111827",
      font: {
        weight: "bold",
        size: 24
      },

      formatter: (value, ctx) => {
        const data = ctx.chart.data.datasets[0].data;
        const total = data.reduce((a, b) => a + b, 0);
        const percent = ((value / total) * 100).toFixed(0);

        return percent + "%";
      }
    }
  }
}
  });
}

// eventos
inputNome.addEventListener("input", validarFormulario);
inputValor.addEventListener("input", validarFormulario);
inputCategoria.addEventListener("change", validarFormulario);
// Abre modal para adicionar receita
btnReceita.addEventListener("click", () => {
  tipoAtual = "income";

  transacaoParaEditar = null; // garante modo criação

  inputNome.value = "";
  inputValor.value = "";

  atualizarModalUI(); // muda título e botão

  modal.classList.remove("hidden");
  inputNome.focus();
  validarFormulario();
});

// Abre modal para adicionar despesa
btnDespesa.addEventListener("click", () => {
  tipoAtual = "expense";

  transacaoParaEditar = null; // garante modo criação

  inputNome.value = "";
  inputValor.value = "";

  atualizarModalUI(); // muda título e botão

  modal.classList.remove("hidden");
  validarFormulario();
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

  // Agora chamamos a função que atualiza TUDO, inclusive gráficos
  atualizarInterface();

  fecharDeleteModal();
});

// A única chamada solta deve ser esta, para iniciar o dashboard
carregarDoStorage();
