export const TABELAS_SIMPLIES = {
  III: [
    { faixa: 1, limite: 180000, aliquota: 6, deduzir: 0 },
    { faixa: 2, limite: 360000, aliquota: 11.2, deduzir: 9360 },
    { faixa: 3, limite: 720000, aliquota: 13.5, deduzir: 17640 },
    { faixa: 4, limite: 1800000, aliquota: 16, deduzir: 35640 },
    { faixa: 5, limite: 3600000, aliquota: 21, deduzir: 125640 },
    { faixa: 6, limite: 4800000, aliquota: 33, deduzir: 648000 },
  ],
  IV: [
    { faixa: 1, limite: 180000, aliquota: 4.5, deduzir: 0 },
    { faixa: 2, limite: 360000, aliquota: 9, deduzir: 8100 },
    { faixa: 3, limite: 720000, aliquota: 10.2, deduzir: 12420 },
    { faixa: 4, limite: 1800000, aliquota: 14, deduzir: 39780 },
    { faixa: 5, limite: 3600000, aliquota: 22, deduzir: 183780 },
    { faixa: 6, limite: 4800000, aliquota: 33, deduzir: 828000 },
  ],
  V: [
    { faixa: 1, limite: 180000, aliquota: 15.5, deduzir: 0 },
    { faixa: 2, limite: 360000, aliquota: 18, deduzir: 4500 },
    { faixa: 3, limite: 720000, aliquota: 19.5, deduzir: 9900 },
    { faixa: 4, limite: 1800000, aliquota: 20.5, deduzir: 17100 },
    { faixa: 5, limite: 3600000, aliquota: 23, deduzir: 62100 },
    { faixa: 6, limite: 4800000, aliquota: 30.5, deduzir: 540000 },
  ],
};

export const LIMITE_FATOR_R = 0.28;

export const FAQ_FATOR_R = [
  {
    pergunta: "O que é o Fator R?",
    resposta:
      "O Fator R é um cálculo utilizado no Simples Nacional para determinar se empresas prestadoras de serviços serão tributadas pelo Anexo III (alíquotas menores, a partir de 6%) ou Anexo V (alíquotas maiores, a partir de 15,5%). Ele compara a folha de pagamento com a receita bruta dos últimos 12 meses.",
    tags: ["definição", "o que é", "conceito"],
  },
  {
    pergunta: "Como calcular o Fator R?",
    resposta:
      "A fórmula é: Fator R = Folha de Pagamento (12 meses) ÷ Receita Bruta (12 meses). A folha inclui: salários, pró-labore, férias, 13º, INSS patronal e FGTS. Se o resultado for ≥ 28%, a empresa pode optar pelo Anexo III. Se for < 28%, será obrigatoriamente tributada pelo Anexo V.",
    tags: ["cálculo", "fórmula", "como calcular"],
  },
  {
    pergunta: "O que entra na folha de pagamento?",
    resposta:
      "Compõem a folha de pagamento: salários de todos os funcionários, pró-labore dos sócios, férias + 1/3, 13º salário, INSS patronal (20% sobre a folha) e FGTS (8% sobre a folha). Não entram: vale-transporte, vale-alimentação, vale-refeição e benefícios indiretos.",
    tags: ["folha", "salário", "pró-labore", "encargos", "FGTS", "INSS"],
  },
  {
    pergunta: "Qual a diferença entre Anexo III e Anexo V?",
    resposta:
      "O Anexo III tem alíquotas iniciais de 6% (1ª faixa) e é destinado a prestadores de serviço com folha de pagamento significativa. O Anexo V tem alíquotas iniciais de 15,5% (1ª faixa) e é para prestadores de serviço com folha reduzida. A diferença pode chegar a 9,5% na alíquota inicial — uma economia significativa para empresas com Fator R ≥ 28%.",
    tags: ["anexo", "diferença", "alíquota", "III", "V"],
  },
  {
    pergunta: "Quais atividades estão sujeitas ao Fator R?",
    resposta:
      "Estão sujeitas ao Fator R atividades de prestação de serviços intelectuais, técnicos e profissionais, como: TI/programação, engenharia, arquitetura, consultoria, medicina, odontologia, fisioterapia, psicologia, academias, treinamento, jornalismo, publicidade, despachante, tradução, entre outras. Consulte a busca de CNAEs nesta plataforma para verificar se sua atividade possui Fator R.",
    tags: ["atividades", "sujeitas", "serviços", "CNAE"],
  },
  {
    pergunta: "O Fator R é calculado mensalmente ou anualmente?",
    resposta:
      "O Fator R deve ser calculado mensalmente, considerando sempre os últimos 12 meses (período de apuração). Isso significa que o enquadramento pode mudar a cada mês conforme a folha e a receita variam. É importante acompanhar mensalmente para não perder o direito ao Anexo III.",
    tags: ["mensal", "anual", "frequência", "quando calcular"],
  },
  {
    pergunta: "O que acontece se meu Fator R ficar abaixo de 28%?",
    resposta:
      "Se o Fator R ficar abaixo de 28% em um determinado mês, a empresa será obrigatoriamente tributada pelo Anexo V naquele mês, pagando alíquotas significativamente maiores. Não há penalidade adicional — apenas a tributação mais alta. No mês seguinte, se o Fator R voltar a ser ≥ 28%, a empresa retorna ao Anexo III.",
    tags: ["abaixo", "28%", "penalidade", "Anexo V"],
  },
  {
    pergunta: "Posso aumentar meu Fator R artificialmente?",
    resposta:
      "Não é recomendado. O pró-labore deve ser compatível com a atividade da empresa e com o mercado. Aumentar o pró-labore apenas para atingir 28% pode gerar questionamentos pela Receita Federal. O ideal é planejar a folha de pagamento de forma legítima, contratando funcionários ou ajustando pró-labore dentro da realidade do negócio.",
    tags: ["aumentar", "pró-labore", "planejamento", "artificial"],
  },
  {
    pergunta: "Como a calculadora desta página funciona?",
    resposta:
      "A calculadora considera: (1) a receita bruta acumulada nos últimos 12 meses; (2) a folha de pagamento (salários + pró-labore + encargos) dos últimos 12 meses. Com esses dados, ela calcula o Fator R, identifica o enquadramento (Anexo III ou V), determina a faixa de faturamento e calcula a alíquota efetiva e o imposto devido. O comparativo mostra quanto a empresa economizaria (ou deixaria de pagar) em cada anexo.",
    tags: ["calculadora", "como funciona", "ferramenta"],
  },
  {
    pergunta: "O que é alíquota efetiva?",
    resposta:
      "A alíquota efetiva é o percentual real de imposto que a empresa paga, considerando a dedução da tabela. Ela é calculada assim: ((Receita × Alíquota Nominal) - Valor a Deduzir) ÷ Receita. Na prática, a alíquota efetiva é sempre menor que a nominal nas faixas 2 a 6, pois o valor a deduzir reduz proporcionalmente o imposto.",
    tags: ["alíquota efetiva", "dedução", "nominal"],
  },
];

/**
 * Hook para cálculo do Fator R
 */
export function useFatorR() {
  function getFaixa(receita12m, anexo = "III") {
    const tabela = TABELAS_SIMPLIES[anexo];
    if (!tabela) return null;
    for (const f of tabela) {
      if (receita12m <= f.limite) return f;
    }
    return null;
  }

  function calcularFatorR(folha12m, receita12m) {
    if (!receita12m || receita12m <= 0) return null;
    return folha12m / receita12m;
  }

  function calcularAlíquotaEfetiva(receita12m, faixa) {
    if (!faixa || !receita12m || receita12m <= 0) return 0;
    return ((receita12m * (faixa.aliquota / 100)) - faixa.deduzir) / receita12m * 100;
  }

  function calcularImposto(receitaMensal, aliquotaEfetiva) {
    return receitaMensal * (aliquotaEfetiva / 100);
  }

  function calcularCenario({ receita12m, folha12m }) {
    const fatorR = calcularFatorR(folha12m, receita12m);
    const anexo = fatorR !== null && fatorR >= LIMITE_FATOR_R ? "III" : "V";
    const faixa = getFaixa(receita12m, anexo);
    const aliquotaEfetiva = calcularAlíquotaEfetiva(receita12m, faixa);
    const receitaMensal = receita12m / 12;
    const impostoMensal = calcularImposto(receitaMensal, aliquotaEfetiva);

    // Calcula também o cenário oposto para comparativo
    const anexoOposto = anexo === "III" ? "V" : "III";
    const faixaOposta = getFaixa(receita12m, anexoOposto);
    const aliquotaOposta = calcularAlíquotaEfetiva(receita12m, faixaOposta);
    const impostoOpostoMensal = calcularImposto(receitaMensal, aliquotaOposta);

    return {
      fatorR,
      anexo,
      anexoLabel: anexo === "III" ? "Anexo III" : "Anexo V",
      faixa: faixa?.faixa || null,
      aliquotaNominal: faixa?.aliquota || 0,
      aliquotaEfetiva,
      impostoMensal,
      impostoAnual: impostoMensal * 12,
      // Comparativo
      comparativo: {
        anexo: anexoOposto,
        anexoLabel: anexoOposto === "III" ? "Anexo III" : "Anexo V",
        faixa: faixaOposta?.faixa || null,
        aliquotaNominal: faixaOposta?.aliquota || 0,
        aliquotaEfetiva: aliquotaOposta,
        impostoMensal: impostoOpostoMensal,
        impostoAnual: impostoOpostoMensal * 12,
      },
    };
  }

  function formatMoeda(v) {
    if (v === null || v === undefined || isNaN(v)) return "—";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  return {
    calcularFatorR,
    calcularCenario,
    getFaixa,
    calcularAlíquotaEfetiva,
    calcularImposto,
    formatMoeda,
    LIMITE_FATOR_R,
    TABELAS_SIMPLIES,
  };
}
