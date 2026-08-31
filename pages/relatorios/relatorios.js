const transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];

const filtroPeriodo = document.getElementById("periodo");

const formatarMoeda = (valor) => {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const filtrarPorPeriodo = (transacoes, periodo) => {
  const hoje = new Date();

  return transacoes.filter((transacao) => {
    const dataTransacao = new Date(transacao.createdAt);

    if (periodo === "mes-atual") {
      return (
        dataTransacao.getMonth() === hoje.getMonth() &&
        dataTransacao.getFullYear() === hoje.getFullYear()
      );
    }

    if (periodo === "mes-anterior") {
      const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);

      return (
        dataTransacao.getMonth() === mesAnterior.getMonth() &&
        dataTransacao.getFullYear() === mesAnterior.getFullYear()
      );
    }

    if (periodo === "tres-meses") {
      const tresMesesAtras = new Date(
        hoje.getFullYear(),
        hoje.getMonth() - 2,
        1,
      );

      return dataTransacao >= tresMesesAtras;
    }

    if (periodo === "ano") {
      return dataTransacao.getFullYear() === hoje.getFullYear();
    }

    return true;
  });
};

const atualizarRelatorio = () => {
  const transacoesFiltradas = filtrarPorPeriodo(
    transacoes,
    filtroPeriodo.value,
  );

  const receitas = transacoesFiltradas.filter(
    (transacao) => transacao.tipo === "income",
  );

  const despesas = transacoesFiltradas.filter(
    (transacao) => transacao.tipo === "expense",
  );

  const totalReceitas = receitas.reduce(
    (total, transacao) => total + transacao.valor,
    0,
  );

  const totalDespesas = despesas.reduce(
    (total, transacao) => total + transacao.valor,
    0,
  );

  const saldo = totalReceitas - totalDespesas;

  const maiorGasto = despesas.reduce((maior, transacao) => {
    return transacao.valor > maior.valor ? transacao : maior;
  }, despesas[0]);

  const elementoTotalReceitas = document.getElementById("total-receitas");
  const elementoTotalDespesas = document.getElementById("total-despesas");
  const elementoSaldo = document.getElementById("saldo");
  const elementoMaiorGasto = document.getElementById("maior-gasto");

  elementoTotalReceitas.textContent = formatarMoeda(totalReceitas);
  elementoTotalDespesas.textContent = formatarMoeda(totalDespesas);
  elementoSaldo.textContent = formatarMoeda(saldo);

  if (maiorGasto) {
    elementoMaiorGasto.textContent = formatarMoeda(maiorGasto.valor);
  } else {
    elementoMaiorGasto.textContent = formatarMoeda(0);
  }

  graficoReceitasDespesas.data.datasets[0].data = [
    totalReceitas,
    totalDespesas,
  ];

  graficoReceitasDespesas.update();

  const receitasPorMes = meses.map((mes) => {
    return receitas
      .filter((transacao) => obterMes(transacao.createdAt) === mes)
      .reduce((total, transacao) => total + transacao.valor, 0);
  });

  const despesasPorMes = meses.map((mes) => {
    return despesas
      .filter((transacao) => obterMes(transacao.createdAt) === mes)
      .reduce((total, transacao) => total + transacao.valor, 0);
  });

  graficoEvolucao.data.datasets[0].data = receitasPorMes;
  graficoEvolucao.data.datasets[1].data = despesasPorMes;

  graficoEvolucao.update();

  console.log("Período:", filtroPeriodo.value);
  console.log("Transações filtradas:", transacoesFiltradas.length);
  console.log("Receitas:", totalReceitas);
  console.log("Despesas:", totalDespesas);
  console.log("Saldo:", saldo);
  console.log("Maior gasto:", maiorGasto);
};

const obterMes = (data) => {
  return new Date(data).toLocaleDateString("pt-BR", {
    month: "short",
  });
};

const hoje = new Date();

const meses = [];

for (let i = 5; i >= 0; i--) {
  const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);

  meses.push(
    data.toLocaleDateString("pt-BR", {
      month: "short",
    }),
  );
}

const transacoesDoPeriodo = filtrarPorPeriodo(transacoes, filtroPeriodo.value);

const receitas = transacoesDoPeriodo.filter(
  (transacao) => transacao.tipo === "income",
);

const despesas = transacoesDoPeriodo.filter(
  (transacao) => transacao.tipo === "expense",
);

const contextoGrafico = document.getElementById("grafico-receitas-despesas");
Chart.register(ChartDataLabels);
const graficoReceitasDespesas = new Chart(contextoGrafico, {
  type: "bar",

  data: {
    labels: ["Receitas", "Despesas"],

    datasets: [
      {
        label: "Valor",
        data: [
          receitas.reduce((total, transacao) => total + transacao.valor, 0),
          despesas.reduce((total, transacao) => total + transacao.valor, 0),
        ],
        backgroundColor: ["#6a994e", "#ef4444"],
        borderRadius: 8,
        barThickness: 60
      },
    ],
  },

  options: {
    responsive: true,
    maintainAspectRatio: false,

    scales: {
        x: {
            ticks: {
                color: "#333333"
            }
        },

        y: {
            ticks: {
                color: "#333333"
            }
        }
    },

    plugins: {
        legend: {
            labels: {
                color: "#333333"
            }
        },

        datalabels: {
            anchor: "end",
            align: "top",
            color: "#333333",
            formatter: (valor) => formatarMoeda(valor)
        }
    }
},
});

const contextoGraficoEvolucao = document.getElementById("grafico-evolucao");

const graficoEvolucao = new Chart(contextoGraficoEvolucao, {
  type: "line",

  data: {
    labels: meses,

    datasets: [
      {
    label: "Receitas",
    data: [],
    borderColor: "#6a994e",
    borderWidth: 3,
    pointRadius: 5,
    pointHoverRadius: 10,
    hitRadius: 15,
    tension: 0.3
},
      {
    label: "Despesas",
    data: [],
    borderColor: "#ef4444",
    borderWidth: 3,
    pointRadius: 5,
    pointHoverRadius: 10,
    hitRadius: 15,
    tension: 0.3
},
    ],
  },

 options: {
    responsive: true,
    maintainAspectRatio: false,

    scales: {
        x: {
            ticks: {
                color: "#333333"
            }
        },

        y: {
            ticks: {
                color: "#333333"
            }
        }
    },

    plugins: {
    legend: {
        labels: {
            color: "#333333"
        }
    },

    datalabels: {
        display: false
    },

    tooltip: {
        position: "nearest"
    }
},

    interaction: {
        mode: "index",
        intersect: false
    }
},
});

atualizarRelatorio();

filtroPeriodo.addEventListener("change", atualizarRelatorio);
