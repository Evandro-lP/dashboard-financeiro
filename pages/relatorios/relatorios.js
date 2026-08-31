const transacoes = JSON.parse(localStorage.getItem("transacoes")) || [];

const filtroPeriodo = document.getElementById("periodo");


const atualizarInsight = (elemento, texto) => {
  const icone = elemento.querySelector("i");

  elemento.textContent = "";

  elemento.appendChild(icone);
  elemento.appendChild(document.createTextNode(texto));
};

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
      const mesAnterior = new Date(
        hoje.getFullYear(),
        hoje.getMonth() - 1,
        1
      );

      return (
        dataTransacao.getMonth() === mesAnterior.getMonth() &&
        dataTransacao.getFullYear() === mesAnterior.getFullYear()
      );
    }

    if (periodo === "tres-meses") {
      const tresMesesAtras = new Date(
        hoje.getFullYear(),
        hoje.getMonth() - 2,
        1
      );

      return dataTransacao >= tresMesesAtras;
    }

    if (periodo === "ano") {
      return dataTransacao.getFullYear() === hoje.getFullYear();
    }

    return true;
  });
};

const calcularReceitasPeriodoAnterior = (periodo) => {
  const hoje = new Date();

  let inicio;
  let fim;

  if (periodo === "mes-atual") {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    fim = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  }

  if (periodo === "mes-anterior") {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
    fim = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
  }

  if (periodo === "tres-meses") {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
    fim = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
  }

  if (periodo === "ano") {
    inicio = new Date(hoje.getFullYear() - 1, 0, 1);
    fim = new Date(hoje.getFullYear(), 0, 1);
  }

  const receitasAnteriores = transacoes.filter((transacao) => {
    const dataTransacao = new Date(transacao.createdAt);

    return (
      transacao.tipo === "income" &&
      dataTransacao >= inicio &&
      dataTransacao < fim
    );
  });

  return receitasAnteriores.reduce(
    (total, transacao) => total + transacao.valor,
    0
  );
};

const obterMes = (data) => {
  return new Date(data).toLocaleDateString("pt-BR", {
    month: "short",
  });
};

const hoje = new Date();

const meses = [];

for (let i = 5; i >= 0; i--) {
  const data = new Date(
    hoje.getFullYear(),
    hoje.getMonth() - i,
    1
  );

  meses.push(
    data.toLocaleDateString("pt-BR", {
      month: "short",
    })
  );
};

const contextoGrafico =
  document.getElementById("grafico-receitas-despesas");

Chart.register(ChartDataLabels);

const graficoReceitasDespesas = new Chart(
  contextoGrafico,
  {
    type: "bar",

    data: {
      labels: ["Receitas", "Despesas"],

      datasets: [
        {
          label: "Valor",
          data: [0, 0],
          backgroundColor: ["#6a994e", "#ef4444"],
          borderRadius: 8,
          barThickness: 60,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      scales: {
        x: {
          ticks: {
            color: "#333333",
          },
        },

        y: {
          ticks: {
            color: "#333333",
          },
        },
      },

      plugins: {
        legend: {
          labels: {
            color: "#333333",
          },
        },

        datalabels: {
          anchor: "end",
          align: "top",
          color: "#333333",
          formatter: (valor) => formatarMoeda(valor),
        },
      },
    },
  }
);

const contextoGraficoEvolucao =
  document.getElementById("grafico-evolucao");

const graficoEvolucao = new Chart(
  contextoGraficoEvolucao,
  {
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
          tension: 0.3,
        },

        {
          label: "Despesas",
          data: [],
          borderColor: "#ef4444",
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 10,
          hitRadius: 15,
          tension: 0.3,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      scales: {
        x: {
          ticks: {
            color: "#333333",
          },
        },

        y: {
          ticks: {
            color: "#333333",
          },
        },
      },

      plugins: {
        legend: {
          labels: {
            color: "#333333",
          },
        },

        datalabels: {
          display: false,
        },

        tooltip: {
          position: "nearest",
        },
      },

      interaction: {
        mode: "index",
        intersect: false,
      },
    },
  }
);

const atualizarRelatorio = () => {
  const transacoesFiltradas = filtrarPorPeriodo(
    transacoes,
    filtroPeriodo.value
  );

  const receitas = transacoesFiltradas.filter(
    (transacao) => transacao.tipo === "income"
  );

  const despesas = transacoesFiltradas.filter(
    (transacao) => transacao.tipo === "expense"
  );

  const totalReceitas = receitas.reduce(
    (total, transacao) => total + transacao.valor,
    0
  );

  const totalDespesas = despesas.reduce(
    (total, transacao) => total + transacao.valor,
    0
  );

  const saldo = totalReceitas - totalDespesas;

  const maiorGasto = despesas.reduce(
    (maior, transacao) => {
      return transacao.valor > maior.valor
        ? transacao
        : maior;
    },
    despesas[0]
  );

  const insight1 = document.getElementById("insight-1");
  const insight2 = document.getElementById("insight-2");
  const insight3 = document.getElementById("insight-3");
  const insight4 = document.getElementById("insight-4");
  const insight5 = document.getElementById("insight-5");
  const insightFinal = document.getElementById("insight-final");

  // INSIGHT 1
  const receitasPeriodoAnterior =
    calcularReceitasPeriodoAnterior(
      filtroPeriodo.value
    );

  if (receitasPeriodoAnterior > 0) {
  const variacao =
    ((totalReceitas - receitasPeriodoAnterior) /
      receitasPeriodoAnterior) *
    100;

  if (variacao > 0) {
    atualizarInsight(
      insight1,
      ` Suas receitas aumentaram ${variacao.toFixed(0)}% em relação ao período anterior.`
    );
  } else if (variacao < 0) {
    atualizarInsight(
      insight1,
      ` Suas receitas diminuíram ${Math.abs(variacao).toFixed(0)}% em relação ao período anterior.`
    );
  } else {
    atualizarInsight(
      insight1,
      " Suas receitas permaneceram estáveis em relação ao período anterior."
    );
  }
} else if (totalReceitas > 0) {
  atualizarInsight(
    insight1,
    " Ainda não há dados do período anterior para comparar suas receitas."
  );
} else {
  atualizarInsight(
    insight1,
    " Não há receitas registradas no período para realizar a comparação."
  );
}

  // INSIGHT 2
  if (totalReceitas > 0) {
  const percentualDespesas =
    (totalDespesas / totalReceitas) * 100;

  atualizarInsight(
    insight2,
    ` Seus gastos representam ${percentualDespesas.toFixed(0)}% das suas receitas, mantendo uma boa margem financeira.`
  );
} else {
  atualizarInsight(
    insight2,
    " Não há receitas registradas no período para calcular o percentual de despesas."
  );
}

  // INSIGHT 3
  if (saldo > 0) {
  atualizarInsight(
    insight3,
    ` Seu saldo ficou positivo em ${formatarMoeda(saldo)}, indicando que você gastou menos do que recebeu.`
  );
} else if (saldo < 0) {
  atualizarInsight(
    insight3,
    ` Seu saldo ficou negativo em ${formatarMoeda(Math.abs(saldo))}, indicando que suas despesas superaram suas receitas.`
  );
} else {
  atualizarInsight(
    insight3,
    " Seu saldo ficou zerado no período."
  );
}

  // INSIGHT 4
  if (maiorGasto) {
  const nomeGasto =
    maiorGasto.nome.charAt(0).toUpperCase() +
    maiorGasto.nome.slice(1);

  atualizarInsight(
    insight4,
    `"${nomeGasto}"  foi seu maior gasto individual, no valor de ${formatarMoeda(maiorGasto.valor)}.`
  );
} else {
  atualizarInsight(
    insight4,
    " Não há despesas registradas no período."
  );
}

  // INSIGHT 5
  if (despesas.length > 0) {
    const gastosPorCategoria = despesas.reduce(
      (acumulado, transacao) => {
        if (!acumulado[transacao.categoria]) {
          acumulado[transacao.categoria] = 0;
        }

        acumulado[transacao.categoria] +=
          transacao.valor;

        return acumulado;
      },
      {}
    );

    const categoriaMaiorGasto = Object.entries(
      gastosPorCategoria
    ).sort((a, b) => b[1] - a[1])[0];

    const percentualCategoria =
      (categoriaMaiorGasto[1] / totalDespesas) * 100;

    const nomesCategorias = {
      delivery: "Delivery",
      transporte: "Transporte",
      salario: "Salário",
      mercado: "Mercado",
      outros: "Outros",
    };

    const nomeCategoria =
    nomesCategorias[categoriaMaiorGasto[0]] ||
    categoriaMaiorGasto[0];

  atualizarInsight(
    insight5,
    ` ${nomeCategoria}  concentrou ${percentualCategoria.toFixed(0)}% das suas despesas.`
  );
} else {
  atualizarInsight(
    insight5,
    " Não há despesas registradas no período para analisar as categorias."
  );
}

  if (totalReceitas > 0) {
  const percentualDespesas = (totalDespesas / totalReceitas) * 100;

  if (saldo < 0) {
    atualizarInsight(
      insightFinal,
      " Atenção: suas despesas superaram suas receitas. Revise seus gastos para recuperar o equilíbrio financeiro."
    );
  } else if (percentualDespesas > 80) {
    atualizarInsight(
      insightFinal,
      " Atenção: seus gastos estão próximos das suas receitas. Vale a pena revisar suas despesas."
    );
  } else if (percentualDespesas > 60) {
    atualizarInsight(
      insightFinal,
      " Suas finanças estão equilibradas, mas ainda há espaço para melhorar o controle dos gastos."
    );
  } else {
    atualizarInsight(
      insightFinal,
      " Sua situação financeira está saudável. Seus gastos estão bem abaixo das suas receitas."
    );
  }
} else {
  atualizarInsight(
    insightFinal,
    " Registre suas receitas e despesas para receber uma análise financeira."
  );
}

  // CARDS DE RESUMO
  const elementoTotalReceitas =
    document.getElementById("total-receitas");

  const elementoTotalDespesas =
    document.getElementById("total-despesas");

  const elementoSaldo =
    document.getElementById("saldo");

  const elementoMaiorGasto =
    document.getElementById("maior-gasto");

  elementoTotalReceitas.textContent =
    formatarMoeda(totalReceitas);

  elementoTotalDespesas.textContent =
    formatarMoeda(totalDespesas);

  elementoSaldo.textContent =
    formatarMoeda(saldo);

  if (maiorGasto) {
    elementoMaiorGasto.textContent =
      formatarMoeda(maiorGasto.valor);
  } else {
    elementoMaiorGasto.textContent =
      formatarMoeda(0);
  }

  // GRÁFICO RECEITAS X DESPESAS
  graficoReceitasDespesas.data.datasets[0].data = [
    totalReceitas,
    totalDespesas,
  ];

  graficoReceitasDespesas.update();

  // GRÁFICO DE EVOLUÇÃO
  const receitasPorMes = meses.map((mes) => {
    return receitas
      .filter(
        (transacao) =>
          obterMes(transacao.createdAt) === mes
      )
      .reduce(
        (total, transacao) =>
          total + transacao.valor,
        0
      );
  });

  const despesasPorMes = meses.map((mes) => {
    return despesas
      .filter(
        (transacao) =>
          obterMes(transacao.createdAt) === mes
      )
      .reduce(
        (total, transacao) =>
          total + transacao.valor,
        0
      );
  });

  graficoEvolucao.data.datasets[0].data =
    receitasPorMes;

  graficoEvolucao.data.datasets[1].data =
    despesasPorMes;

  graficoEvolucao.update();

  console.log("Período:", filtroPeriodo.value);
  console.log(
    "Transações filtradas:",
    transacoesFiltradas.length
  );
  console.log("Receitas:", totalReceitas);
  console.log("Despesas:", totalDespesas);
  console.log("Saldo:", saldo);
  console.log("Maior gasto:", maiorGasto);
};

atualizarRelatorio();

filtroPeriodo.addEventListener(
  "change",
  atualizarRelatorio
);

lucide.createIcons();