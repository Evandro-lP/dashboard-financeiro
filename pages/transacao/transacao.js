// =========================
// ELEMENTOS DO DOM
// =========================

const listaTransacoes = document.querySelector(".lista-transacoes");
const inputPesquisa = document.querySelector(".pesquisa input");
const paginacao = document.getElementById("paginacao");

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
  outros: "package",
};

// Cores utilizadas no gráfico por categoria
const coresCategoria = {
  mercado: "#ef4444",
  transporte: "#3b82f6",
  salario: "#006400",
  delivery: "#f97316",
  outros: "#6b7280",
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

let paginaAtual = 1;
let transacoesPorPagina = 10;

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

  transacoes = transacoes.map((t) => ({
    ...t,
    createdAt: t.createdAt || new Date().toISOString(),
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

  const totalPaginas = Math.ceil(
    transacoesFiltradas.length / transacoesPorPagina,
  );

  if (paginaAtual > totalPaginas) {
    paginaAtual = totalPaginas;
  }

  const transacoesDaPagina = obterTransacoesDaPagina(transacoesFiltradas);

  const grupos = agruparTransacoesPorData(transacoesDaPagina);

  Object.keys(grupos).forEach((data) => {
    const transacoesDoDia = grupos[data];

    // criar card do dia
    const cardDia = document.createElement("div");
    cardDia.classList.add("card-dia");

    cardDia.innerHTML = `
            <h3>${data}</h3>
        `;

    // adicionar transações dentro do dia
    transacoesDoDia.forEach((transacao) => {
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

    <div class="transacao-acoes">

        <button class="btn-editar" title="Editar">
            <i data-lucide="pencil"></i>
        </button>

        <button class="btn-excluir" title="Excluir">
            <i data-lucide="trash-2"></i>
        </button>

    </div>

    <span class="${transacao.tipo}">
        R$ ${transacao.valor.toFixed(2)}
    </span>
`;

      const btnExcluir = item.querySelector(".btn-excluir");

      btnExcluir.addEventListener("click", () => {
        transacaoParaExcluir = transacao;
        deleteModal.classList.remove("hidden");
      });

      const btnEditar = item.querySelector(".btn-editar");

      btnEditar.addEventListener("click", () => {
        abrirModalEdicao(transacao);
      });

      cardDia.appendChild(item);
    });

    // adiciona o card completo na tela
    listaTransacoes.appendChild(cardDia);
  });

  // renderiza os ícones criados pelo JS
  lucide.createIcons();

  renderizarPaginacao(transacoesFiltradas);
}

function fecharDeleteModal() {
  deleteModal.classList.add("hidden");
  transacaoParaExcluir = null;
}

function abrirModalEdicao(transacao) {
  transacaoParaEditar = transacao;

  inputNome.value = transacao.nome;
  inputValor.value = transacao.valor;
  inputCategoria.value = transacao.categoria;

  tipoAtual = transacao.tipo;

  modalTitle.innerText = "Editar transação";
  btnSalvar.innerText = "Salvar alterações";

  formError.classList.add("hidden");

  modal.classList.remove("hidden");

  inputNome.focus();
}

function agruparTransacoesPorData(transacoesParaAgrupar) {
  const grupos = {};

  transacoesParaAgrupar.forEach((transacao) => {
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
  tipoAtual = "";
  atualizarTipoVisual();

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

  if (transacaoParaEditar) {
    transacaoParaEditar.nome = nome;
    transacaoParaEditar.valor = valor;
    transacaoParaEditar.tipo = tipoAtual;
    transacaoParaEditar.categoria = categoria;

    transacaoParaEditar = null;
  } else {
    transacoes.push({
      id: Date.now(),
      nome,
      valor,
      tipo: tipoAtual,
      categoria,
      createdAt: new Date().toISOString(),
    });
  }

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
  let resultado = [...transacoes];

  resultado.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (filtroAtual === "receitas") {
    resultado = resultado.filter((transacao) => transacao.tipo === "income");
  }

  if (filtroAtual === "despesas") {
    resultado = resultado.filter((transacao) => transacao.tipo === "expense");
  }

  if (pesquisaAtual !== "") {
    resultado = resultado.filter((transacao) =>
      transacao.nome.toLowerCase().includes(pesquisaAtual),
    );
  }

  return resultado;
}

function obterTransacoesDaPagina(transacoesFiltradas) {
  const inicio = (paginaAtual - 1) * transacoesPorPagina;
  const fim = inicio + transacoesPorPagina;

  return transacoesFiltradas.slice(inicio, fim);
}

function renderizarPaginacao(transacoesFiltradas) {
  const totalPaginas = Math.ceil(
    transacoesFiltradas.length / transacoesPorPagina,
  );

  paginacao.innerHTML = "";

  if (totalPaginas <= 1) {
    return;
  }

  if (paginaAtual > totalPaginas) {
    paginaAtual = totalPaginas;
  }

  const btnAnterior = document.createElement("button");
  btnAnterior.innerText = "← Anterior";
  btnAnterior.disabled = paginaAtual === 1;
  btnAnterior.addEventListener("click", () => {
    paginaAtual--;
    renderizarTransacoes();
  });

  paginacao.appendChild(btnAnterior);

  for (let i = 1; i <= totalPaginas; i++) {
    const btnPagina = document.createElement("button");
    btnPagina.innerText = i;
    if (i === paginaAtual) {
      btnPagina.classList.add("pagina-ativa");
    }
    btnPagina.addEventListener("click", () => {
      paginaAtual = i;
      renderizarTransacoes();
    });
    paginacao.appendChild(btnPagina);
  }

  const btnProxima = document.createElement("button");
  btnProxima.innerText = "Próximo →";
  btnProxima.disabled = paginaAtual === totalPaginas;

  btnProxima.addEventListener("click", () => {
    paginaAtual++;
    renderizarTransacoes();
  });

  paginacao.appendChild(btnProxima);
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

function atualizarTipoVisual() {
    btnModalReceita.classList.remove("tipo-ativo");
    btnModalDespesa.classList.remove("tipo-ativo");

    if (tipoAtual === "income") {
        btnModalReceita.classList.add("tipo-ativo");
    }

    if (tipoAtual === "expense") {
        btnModalDespesa.classList.add("tipo-ativo");
    }
}
btnConfirmarDelete.addEventListener("click", () => {
  if (!transacaoParaExcluir) return;

  transacoes = transacoes.filter(
    (transacao) => transacao.id !== transacaoParaExcluir.id,
  );

  salvarNoStorage();
  renderizarTransacoes();

  fecharDeleteModal();
});

btnCancelarDelete.addEventListener("click", fecharDeleteModal);
btnSalvar.addEventListener("click", salvarTransacao);
btnNovaTransacao.addEventListener("click", abrirModalTransacao);
btnModalReceita.addEventListener("click", () => {
    tipoAtual = "income";
    atualizarTipoVisual();
    inputNome.focus();
});

btnModalDespesa.addEventListener("click", () => {
    tipoAtual = "expense";
    atualizarTipoVisual();
    inputNome.focus();
});

btnFechar.addEventListener("click", fecharModal);

inputNome.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        inputValor.focus();
    }
});

inputValor.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        inputCategoria.focus();
    }
});

inputCategoria.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        btnSalvar.focus();
    }
});

btnReceitas.addEventListener("click", () => {
  filtroAtual = "receitas";
  paginaAtual = 1;

  renderizarTransacoes();
  atualizarFiltroVisual();
});

btnDespesas.addEventListener("click", () => {
  filtroAtual = "despesas";
  paginaAtual = 1;

  renderizarTransacoes();
  atualizarFiltroVisual();
});

btnTodas.addEventListener("click", () => {
  filtroAtual = "todas";
  paginaAtual = 1;
  renderizarTransacoes();
  atualizarFiltroVisual();
});

inputPesquisa.addEventListener("input", () => {
  pesquisaAtual = inputPesquisa.value.toLowerCase();
  paginaAtual = 1;

  renderizarTransacoes();
});

carregarTransacoes();
renderizarTransacoes();
