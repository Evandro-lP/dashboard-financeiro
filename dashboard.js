// ======================
// Estado da aplicação
// ======================

// Totais financeiros
let receitas = 0;
let despesas = 0;

// Dados
let transacoes = [];

// Estado da interface
let tipoAtual = "";
let transacaoParaEditar = null;
let transacaoParaExcluir = null;

// Gráficos
let grafico;
let graficoResumo;

// metas
let metas = [];
let metaParaEditar = null;
let tipoMetaAtual = null;

// ======================
// Configurações
// ======================

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

// Configuração global do Chart.js
Chart.register(ChartDataLabels);
Chart.defaults.font.family = "'Inter', sans-serif";

// ======================
// Seletores do DOM
// ======================

// Lista de transações
const listaTransacoes = document.querySelector(".transaction-list");

// Dashboard
const saldoEl = document.getElementById("saldo");
const receitasEl = document.getElementById("receitas");
const despesasEl = document.getElementById("despesas");

// Botões principais
const btnReceita = document.querySelector(".btn-receita");
const btnDespesa = document.querySelector(".btn-despesa");

// Modal de transação
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");

const inputNome = document.getElementById("input-nome");
const inputValor = document.getElementById("input-valor");
const inputCategoria = document.getElementById("input-categoria");

const formError = document.getElementById("form-error");

const btnSalvar = document.getElementById("btn-salvar");
const btnFechar = document.getElementById("btn-fechar");

btnSalvar.disabled = true;

// Modal de exclusão
const deleteModal = document.getElementById("delete-modal");
const btnCancelarDelete = document.getElementById("btn-cancelar-delete");
const btnConfirmarDelete = document.getElementById("btn-confirmar-delete");

// Modal Metas
const btnMetaLongo = document.querySelector(".btn-meta-longo");
const btnMetaCurto = document.querySelector(".btn-meta-curto");

const modalMeta = document.getElementById("modal-meta");
const modalMetaTitle = document.getElementById("meta-modal-title");

const inputMetaNome = document.getElementById("input-meta-nome");
const inputMetaObjetivo = document.getElementById("input-meta-objetivo");
const inputMetaAtual = document.getElementById("input-meta-atual");

const metaFormError = document.getElementById("meta-form-error");

const btnMetaSalvar = document.getElementById("btn-meta-salvar");
const btnMetaFechar = document.getElementById("btn-meta-fechar");

const metaContentLongo = document.getElementById("meta-content-longo");
const metaContentCurto = document.getElementById("meta-content-curto");

// ======================
// Funções utilitárias
// ======================

function calcularSaldo() {
  return receitas - despesas;
}

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
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

// ======================
// Dashboard
// ======================

function atualizarDashboard() {
  saldoEl.innerText = formatarMoeda(calcularSaldo());
  receitasEl.innerText = formatarMoeda(receitas);
  despesasEl.innerText = formatarMoeda(despesas);
}

function atualizarInterface() {
  recalcularTotais();
  atualizarDashboard();
  salvarNoStorage();
  renderizarTransacoes();
  renderizarMetas();

  const dadosCategorias = calcularPorCategoria();

  renderizarGrafico(dadosCategorias);
  renderizarGraficoResumo();
}

// ======================
// LocalStorage
// ======================

function salvarNoStorage() {
  localStorage.setItem("receitas", receitas);
  localStorage.setItem("despesas", despesas);
  localStorage.setItem("transacoes", JSON.stringify(transacoes));
  localStorage.setItem("metas", JSON.stringify(metas));
}

function carregarDoStorage() {
  const receitasSalvas = localStorage.getItem("receitas");
  const despesasSalvas = localStorage.getItem("despesas");
  const transacoesSalvas = localStorage.getItem("transacoes");
  const metasSalvas = localStorage.getItem("metas");
  receitas = receitasSalvas ? Number(receitasSalvas) : 0;
  despesas = despesasSalvas ? Number(despesasSalvas) : 0;

  try {
    transacoes = JSON.parse(transacoesSalvas) || [];
  } catch {
    transacoes = [];
  }

  try {
    metas = JSON.parse(metasSalvas) || [];
  } catch {
    metas = [];
  }

  // Garante que transações antigas tenham uma data de criação
  transacoes = transacoes.map(t => ({
    ...t,
    createdAt: t.createdAt || new Date().toISOString()
  }));

  atualizarInterface();
}

// ======================
// Transações
// ======================

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

  if (transacaoParaEditar) {
    transacaoParaEditar.nome = nome;
    transacaoParaEditar.valor = valor;
    transacaoParaEditar.categoria = categoria;
    transacaoParaEditar = null;
  } else {
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
  inputCategoria.selectedIndex = 0;

  fecharModal();
}

function renderizarTransacoes() {
  listaTransacoes.innerHTML = "";
 
  const ultimasTransacoes = [...transacoes]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

    ultimasTransacoes.forEach((t) => {
    const icone = iconesCategoria[t.categoria] || "package";

    const transacaoEl = document.createElement("div");
    transacaoEl.classList.add("transaction");
    transacaoEl.dataset.id = t.id;

    transacaoEl.innerHTML = `
      <div class="left-side">
        <i data-lucide="${icone}"></i>
        <span>${t.nome}</span>
      </div>

      <div class="right-side">
        <span class="${t.tipo}">
          ${t.tipo === "income" ? "+" : "-"} ${formatarMoeda(t.valor)}
        </span>
        <span class="data">${formatarData(t.createdAt)}</span>
        <button class="edit-btn">✏️</button>

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

    transacaoEl.querySelector(".delete-btn").addEventListener("click", () => {
      transacaoParaExcluir = t.id;
      deleteModal.classList.remove("hidden");
    });

    transacaoEl.querySelector(".edit-btn").addEventListener("click", () => {
      abrirModalEdicao(t);
    });

    listaTransacoes.appendChild(transacaoEl);
  });

  lucide.createIcons();
}

function deletarTransacao(id) {
  transacoes = transacoes.filter(t => t.id !== id);
  atualizarInterface();
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
}

// ======================
// Modal
// ======================

// Atualiza o título e o botão do modal conforme o modo (criação ou edição)
function atualizarModalUI() {
  if (transacaoParaEditar) {
    modalTitle.innerText = "Editar transação";
    btnSalvar.innerText = "Atualizar";
  } else {
    modalTitle.innerText = "Adicionar transação";
    btnSalvar.innerText = "Salvar";
  }
}

function fecharModal() {
  modal.classList.add("closing");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("closing");

    transacaoParaEditar = null;
    atualizarModalUI();
  }, 250);
}

function fecharDeleteModal() {
  deleteModal.classList.add("closing");

  setTimeout(() => {
    deleteModal.classList.add("hidden");
    deleteModal.classList.remove("closing");
    transacaoParaExcluir = null;
  }, 250);
}

function abrirModalEdicao(transacao) {
  transacaoParaEditar = transacao;
  inputCategoria.value = transacao.categoria;
  inputNome.value = transacao.nome;
  inputValor.value = transacao.valor;
  tipoAtual = transacao.tipo;

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
  nome !== "" &&
  !isNaN(valor) &&
  valor > 0 &&
  categoria !== "";

  btnSalvar.disabled = !valido;

  return valido;
}

function abrirModalMeta() {
    inputMetaNome.value = "";
    inputMetaObjetivo.value = "";
    inputMetaAtual.value = "";

    metaFormError.classList.add("hidden");

    modalMeta.classList.remove("hidden");

    inputMetaAtual.focus();
}

function fecharModalMeta() {
  modalMeta.classList.add("hidden");
}

function validarFormularioMeta() {
  const nome = inputMetaNome.value.trim();
  const objetivo = Number(inputMetaObjetivo.value);
  const atual = Number(inputMetaAtual.value);

  const valido =
    nome !== "" &&
    objetivo > 0 &&
    atual <= objetivo;

  return valido;
}

function salvarMeta() {
  const valido = validarFormularioMeta();

  if (!valido) {
    mostrarErroMeta();
    return;
  }

  const nome = inputMetaNome.value.trim();
  const objetivo = Number(inputMetaObjetivo.value);
  const atual = Number(inputMetaAtual.value);

  const novaMeta = {
    id: Date.now(),
    nome,
    objetivo,
    atual,
    tipo: tipoMetaAtual,
    createdAt: new Date().toISOString(),
  };
    metas.push(novaMeta);
  atualizarInterface();

  fecharModalMeta();
}

function renderizarMetas() {
  const metasLongo = metas.filter((meta) => meta.tipo === "longo");
  const metasCurto = metas.filter((meta) => meta.tipo === "curto");

  if (metasLongo.length === 0 && metasCurto.length === 0) {
    return;
  }

  if (metasLongo.length > 0) {
    
    const metaLongo = metasLongo[0];

    const porcentagem = Math.round(
        (metaLongo.atual / metaLongo.objetivo) * 100
    );

    metaContentLongo.innerHTML = `
  <div class="meta-info">
    <h3>${metaLongo.nome}</h3>
    <p>${formatarMoeda(metaLongo.atual)} / ${formatarMoeda(metaLongo.objetivo)}</p>

    <div class="meta-progress">
        <div id="meta-longo-fill" class="meta-progress-fill"></div>
    </div>

    <span class="meta-percentual">${porcentagem}%</span>
</div>

`;

const barraLongo = document.getElementById("meta-longo-fill");

barraLongo.style.width = `${porcentagem}%`;

  }

  if (metasCurto.length > 0) {
    
    const metaCurto = metasCurto[0];

    const porcentagem = Math.round(
        (metaCurto.atual / metaCurto.objetivo) * 100
    );

    metaContentCurto.innerHTML = `
  <div class="meta-info">
    <h3>${metaCurto.nome}</h3>
    <p>${formatarMoeda(metaCurto.atual)} / ${formatarMoeda(metaCurto.objetivo)}</p>

    <div class="meta-progress">
        <div id="meta-curto-fill" class="meta-progress-fill"></div>
    </div>

    <span class="meta-percentual">${porcentagem}%</span>
</div>


`;

const barraCurto = document.getElementById("meta-curto-fill");

barraCurto.style.width = `${porcentagem}%`;
  }
}

// ======================
// Gráficos
// ======================

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
  const ctx = document.getElementById("grafico-categorias");
  const labels = Object.keys(dados);
  const valores = Object.values(dados);
  const cores = labels.map(cat => coresCategoria[cat] || "#999");

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: valores,
          backgroundColor: cores,
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "55%",

      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#111827",
            padding: 20,
            font: {
              family: "'Inter', sans-serif",
              size: 14,
              weight: "bold",
            },
          },
        },

        datalabels: {
          color: "#111827",
          font: {
            weight: "bold",
            size: 24,
          },

          formatter: (value, ctx) => {
            const data = ctx.chart.data.datasets[0].data;
            const total = data.reduce((a, b) => a + b, 0);
            const percent = ((value / total) * 100).toFixed(0);

            return percent + "%";
          },
        },
      },
    },
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
      labels: ["Entradas", "Saídas"],
      datasets: [
        {
          data: [receitas, despesas],
          backgroundColor: ["#6a994e", "#ef4444"],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "55%",

      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#111827",
            padding: 20,
            font: {
              family: "'Inter', sans-serif",
              size: 14,
              weight: "bold",
            },
          },
        },

        datalabels: {
          color: "#111827",
          font: {
            weight: "bold",
            size: 24,
          },

          formatter: (value, ctx) => {
            const data = ctx.chart.data.datasets[0].data;
            const total = data.reduce((a, b) => a + b, 0);
            const percent = ((value / total) * 100).toFixed(0);

            return percent + "%";
          },
        },
      },
    },
  });
}
// ======================
// Eventos
// ======================

// Validação do formulário
inputNome.addEventListener("input", validarFormulario);
inputValor.addEventListener("input", validarFormulario);
inputCategoria.addEventListener("change", validarFormulario);

// Modal de transação
btnReceita.addEventListener("click", () => {
  tipoAtual = "income";
  transacaoParaEditar = null;

  inputNome.value = "";
  inputValor.value = "";
  inputCategoria.selectedIndex = 0;

  atualizarModalUI();

  modal.classList.remove("hidden");
  inputNome.focus();

  validarFormulario();
});

btnDespesa.addEventListener("click", () => {
  tipoAtual = "expense";
  transacaoParaEditar = null;

  inputNome.value = "";
  inputValor.value = "";
  inputCategoria.selectedIndex = 0;

  atualizarModalUI();

  modal.classList.remove("hidden");
  inputNome.focus();

  validarFormulario();
});

btnFechar.addEventListener("click", fecharModal);
btnSalvar.addEventListener("click", salvarTransacao);

// Atalho de teclado
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !modal.classList.contains("hidden")) {
    salvarTransacao();
  }
});

// Modal de exclusão
btnCancelarDelete.addEventListener("click", fecharDeleteModal);
btnConfirmarDelete.addEventListener("click", () => {
  if (transacaoParaExcluir === null) return;

  transacoes = transacoes.filter(
    transacao => transacao.id !== transacaoParaExcluir
  );

  atualizarInterface();

  fecharDeleteModal();
});

// Modal de meta
btnMetaLongo.addEventListener("click", () => {
  tipoMetaAtual = "longo";
  abrirModalMeta();
});

btnMetaCurto.addEventListener("click", () => {
  tipoMetaAtual = "curto";
  abrirModalMeta();
});

btnMetaFechar.addEventListener("click", () => {
  fecharModalMeta();
});

btnMetaSalvar.addEventListener("click", () => {
  salvarMeta();
});
// ======================
// Inicialização
// ======================

carregarDoStorage();