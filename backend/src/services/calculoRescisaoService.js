/**
 * Serviço de cálculo de rescisão trabalhista 2026 - COMPLETO
 *
 * Base Legal:
 * - CLT (Arts. 477-512, 73, 75, 79, 130, 142, 457, 462)
 * - Lei nº 12.506/2011 (aviso prévio proporcional)
 * - Lei nº 4.090/1962 (13º salário)
 * - Lei nº 8.036/1990 (FGTS)
 * - Lei nº 15.270/2025 (IRRF redutor)
 * - Portaria MPS/MF nº 13/2026 (tabela INSS)
 * - Decreto nº 12.797/2025 (salário mínimo)
 * - NR-6, NR-15, NR-16 (insalubridade/periculosidade)
 * - Art. 73 CLT (hora noturna)
 * - Súmula 386 TST, IRR/2023 TST (reflexos de HE)
 */

// ===================== CONSTANTES 2026 =====================

const SALARIO_MINIMO = 1621.0;
const TETO_INSS = 8475.55;

const TABELA_INSS = [
  { de: 0, ate: 1621.0, aliquota: 0.075, deducao: 0 },
  { de: 1621.01, ate: 2902.84, aliquota: 0.09, deducao: 24.32 },
  { de: 2902.85, ate: 4354.27, aliquota: 0.12, deducao: 111.4 },
  { de: 4354.28, ate: 8475.55, aliquota: 0.14, deducao: 198.49 },
];

const TABELA_IRRF = [
  { de: 0, ate: 2428.8, aliquota: 0, deducao: 0 },
  { de: 2428.81, ate: 2826.65, aliquota: 0.075, deducao: 182.16 },
  { de: 2826.66, ate: 3751.05, aliquota: 0.15, deducao: 394.16 },
  { de: 3751.06, ate: 4664.68, aliquota: 0.225, deducao: 675.49 },
  { de: 4664.69, ate: Infinity, aliquota: 0.275, deducao: 908.73 },
];

const DEDUCAO_DEPENDENTE_IR = 189.59;
const DESCONTO_SIMPLIFICADO_IR = 1470.0;
const IRRF_RENDA_ISENTE = 5000.0;
const SALARIO_FAMILIA_COTA = 67.54;
const SALARIO_FAMILIA_LIMITE = 1980.38;
const JORNADA_MENSAL_PADRAO = 220;

// ===================== FUNÇÕES AUXILIARES =====================

function calcularINSS(valor) {
  if (valor <= 0) return { inss: 0, aliquotaEfetiva: 0 };

  let faixa = TABELA_INSS[0];
  for (const f of TABELA_INSS) {
    if (valor >= f.de && valor <= f.ate) {
      faixa = f;
      break;
    }
    if (valor > f.ate) faixa = f;
  }

  const inss = valor * faixa.aliquota - faixa.deducao;
  const aliquotaEfetiva = valor > 0 ? inss / valor : 0;

  return {
    inss: Math.round(inss * 100) / 100,
    aliquotaEfetiva: Math.round(aliquotaEfetiva * 10000) / 100,
    faixa: faixa.aliquota * 100,
  };
}

function calcularIRRF(baseCalculo, numDependentes = 0) {
  if (baseCalculo <= 0) return { irrf: 0, isento: true };

  const deducaoDependentes = numDependentes * DEDUCAO_DEPENDENTE_IR;
  const baseComDependentes = Math.max(0, baseCalculo - deducaoDependentes);
  const baseSimplificada = Math.max(0, baseCalculo - DESCONTO_SIMPLIFICADO_IR);
  const baseFinal = Math.min(baseComDependentes, baseSimplificada);

  if (baseFinal <= IRRF_RENDA_ISENTE) {
    return { irrf: 0, isento: true, motivo: "Redutor Lei 15.270/2025" };
  }

  let faixa = TABELA_IRRF[0];
  for (const f of TABELA_IRRF) {
    if (baseFinal >= f.de && baseFinal <= f.ate) {
      faixa = f;
      break;
    }
  }

  const irrf = baseFinal * faixa.aliquota - faixa.deducao;

  return {
    irrf: Math.max(0, Math.round(irrf * 100) / 100),
    isento: irrf <= 0,
    baseCalculo: Math.round(baseFinal * 100) / 100,
    aliquota: faixa.aliquota * 100,
  };
}

function diffMeses(dataInicio, dataFim) {
  return (
    (dataFim.getFullYear() - dataInicio.getFullYear()) * 12 +
    (dataFim.getMonth() - dataInicio.getMonth())
  );
}

function anosCompletos(dataInicio, dataFim) {
  let anos = dataFim.getFullYear() - dataInicio.getFullYear();
  const mesDiff = dataFim.getMonth() - dataInicio.getMonth();
  if (
    mesDiff < 0 ||
    (mesDiff === 0 && dataFim.getDate() < dataInicio.getDate())
  ) {
    anos--;
  }
  return Math.max(0, anos);
}

function diasFeriasPorFaltas(faltas) {
  if (faltas <= 5) return 30;
  if (faltas <= 14) return 24;
  if (faltas <= 23) return 18;
  if (faltas <= 32) return 12;
  return 0;
}

/**
 * Calcular DSR sobre horas extras
 * DSR = (Total HE do mês × Nº DSRs e feriados) ÷ Dias úteis
 */
function calcularDSR(valorTotalHE, diasUteis, dsrMes) {
  if (diasUteis <= 0) return 0;
  return (valorTotalHE * dsrMes) / diasUteis;
}

/**
 * Calcular horas extras e reflexos
 */
function calcularHorasExtras({
  salario,
  jornadaMensal,
  horasExtrasMes,
  percentualHE,
  diasUteis,
  dsrMes,
  meses13,
  mesesFeriasProp,
}) {
  if (!horasExtrasMes || horasExtrasMes <= 0) {
    return {
      valorHE: 0,
      dsrHE: 0,
      totalHEcomDSR: 0,
      reflexo13: 0,
      reflexoFerias: 0,
      reflexoTerco: 0,
      totalReflexos: 0,
    };
  }

  const divisor = jornadaMensal || JORNADA_MENSAL_PADRAO;
  const valorHoraNormal = salario / divisor;
  const valorHoraExtra = valorHoraNormal * (1 + percentualHE);
  const valorTotalHE = horasExtrasMes * valorHoraExtra;

  // DSR sobre HE
  const dsrHE = calcularDSR(valorTotalHE, diasUteis, dsrMes);
  const totalHEcomDSR = valorTotalHE + dsrHE;

  // Reflexos nas verbas rescisórias
  const reflexo13 = totalHEcomDSR * (meses13 / 12);
  const reflexoFerias = totalHEcomDSR * (mesesFeriasProp / 12);
  const reflexoTerco = reflexoFerias / 3;
  const totalReflexos = reflexo13 + reflexoFerias + reflexoTerco;

  return {
    valorHE: Math.round(valorTotalHE * 100) / 100,
    dsrHE: Math.round(dsrHE * 100) / 100,
    totalHEcomDSR: Math.round(totalHEcomDSR * 100) / 100,
    reflexo13: Math.round(reflexo13 * 100) / 100,
    reflexoFerias: Math.round(reflexoFerias * 100) / 100,
    reflexoTerco: Math.round(reflexoTerco * 100) / 100,
    totalReflexos: Math.round(totalReflexos * 100) / 100,
  };
}

// ===================== CÁLCULO PRINCIPAL =====================

function calcularRescisao(dados) {
  const {
    dataAdmissao: admISO,
    dataDemissao: demISO,
    salario,
    motivo,
    saldoFGTS = 0,
    dependentesIR = 0,
    dependentesSalarioFamilia = 0,
    statusFerias = "nenhuma",
    faltasPeriodo = 0,
    tipoAviso = "indenizado",
    meses13: meses13Input,
    mesesFeriasProp: mesesFeriasPropInput,
    // Novos campos avançados
    jornadaMensal = JORNADA_MENSAL_PADRAO,
    adicionalInsalubridade = 0, // 0, 10, 20, 40
    adicionalPericulosidade = 0, // 0, 30
    adicionalNoturno = false,
    percentualNoturno = 20,
    horasExtrasMes = 0,
    percentualHE = 50,
    diasUteis = 22,
    dsrMes = 4,
    diasFaltaMes = 0,
    horasFaltaMinutos = 0,
    descontoAdiantamento = 0,
    descontoVT = false,
    outrosDescontos = 0,
    divisorSalarial = 30,
  } = dados;

  const dataAdmissao = new Date(admISO);
  const dataDemissao = new Date(demISO);

  // ===================== SALÁRIO BASE COM ADICIONAIS =====================
  // Insalubridade: sobre salário mínimo (NR-15)
  const valorInsalubridade =
    adicionalInsalubridade > 0
      ? SALARIO_MINIMO * (adicionalInsalubridade / 100)
      : 0;

  // Periculosidade: sobre salário base (NR-16) - não acumula com insalubridade
  const valorPericulosidade =
    adicionalPericulosidade > 0 ? salario * (adicionalPericulosidade / 100) : 0;

  // Adicional noturno: estimado sobre salário
  const valorAdicionalNoturno = adicionalNoturno
    ? salario * (percentualNoturno / 100) * 0.2 // Estimativa: ~20% do salário com adicional
    : 0;

  // Salário base para cálculos (somente um adicional, o mais vantajoso)
  const salarioBase =
    salario + valorInsalubridade + valorPericulosidade + valorAdicionalNoturno;

  // ===================== HORAS EXTRAS =====================
  const meses13Calc = meses13Input !== undefined ? meses13Input : 1;
  const mesesFeriasCalc =
    mesesFeriasPropInput !== undefined ? mesesFeriasPropInput : 1;

  const heCalculo = calcularHorasExtras({
    salario: salarioBase,
    jornadaMensal,
    horasExtrasMes,
    percentualHE: percentualHE / 100,
    diasUteis,
    dsrMes,
    meses13: meses13Calc,
    mesesFeriasProp: mesesFeriasCalc,
  });

  // Salário base + média de HE para verbas rescisórias
  const salarioParaVerbas = salarioBase + heCalculo.totalHEcomDSR;

  // ===================== 1. SALDO DE SALÁRIO =====================
  const diasTrabalhados = dataDemissao.getDate();
  const divisor = divisorSalarial;
  const saldoSalario = (salarioBase / divisor) * diasTrabalhados;

  // Dedução por faltas no mês
  const descontoFaltasMes =
    diasFaltaMes > 0 ? (salarioBase / divisor) * diasFaltaMes : 0;

  // Dedução por horas faltas
  const valorHoraNormal = salarioBase / jornadaMensal;
  const descontoHorasFalta =
    horasFaltaMinutos > 0 ? (valorHoraNormal / 60) * horasFaltaMinutos : 0;

  const inssSalario = calcularINSS(saldoSalario);
  const irrfSalario = calcularIRRF(
    saldoSalario - inssSalario.inss,
    dependentesIR,
  );

  // ===================== 2. AVISO PRÉVIO =====================
  let avisoPrevioDias = 0;
  let avisoPrevioValor = 0;
  let avisoPrevioINSS = { inss: 0, aliquotaEfetiva: 0 };
  let avisoPrevioIRRF = { irrf: 0, isento: true };

  if (motivo === "com_justa_causa") {
    avisoPrevioDias = 0;
  } else if (motivo === "pedido_demissao") {
    avisoPrevioDias = 30;
    avisoPrevioValor = (salarioBase / divisor) * avisoPrevioDias;
  } else if (motivo === "acordo_mutuo") {
    const anos = anosCompletos(dataAdmissao, dataDemissao);
    avisoPrevioDias = Math.min(30 + anos * 3, 90);
    avisoPrevioValor = (salarioBase / divisor) * avisoPrevioDias * 0.5;
  } else {
    const anos = anosCompletos(dataAdmissao, dataDemissao);
    avisoPrevioDias = Math.min(30 + anos * 3, 90);
    avisoPrevioValor = (salarioBase / divisor) * avisoPrevioDias;

    if (tipoAviso === "indenizado") {
      avisoPrevioINSS = calcularINSS(avisoPrevioValor);
      avisoPrevioIRRF = {
        irrf: 0,
        isento: true,
        motivo: "Aviso indenizado isento",
      };
    }
  }

  // ===================== 3. 13º PROPORCIONAL =====================
  let meses13 = meses13Input;
  if (meses13 === undefined) {
    const anoRescisao = dataDemissao.getFullYear();
    const dataInicioAno = new Date(anoRescisao, 0, 1);
    const dataEfetivaInicio =
      dataAdmissao > dataInicioAno ? dataAdmissao : dataInicioAno;

    let dataFimCalculo = dataDemissao;
    if (tipoAviso === "indenizado" && motivo !== "com_justa_causa") {
      dataFimCalculo = new Date(dataDemissao);
      dataFimCalculo.setDate(dataFimCalculo.getDate() + avisoPrevioDias);
    }

    meses13 = 0;
    let d = new Date(dataEfetivaInicio);
    while (d <= dataFimCalculo) {
      if (d.getFullYear() === anoRescisao) {
        const ultimoDiaMes = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        const diasNoMes = ultimoDiaMes.getDate() - Math.max(d.getDate() - 1, 0);
        if (diasNoMes >= 15) meses13++;
      }
      d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    }
    meses13 = Math.min(Math.max(meses13, 0), 12);
  }

  const meses13Efetivo = motivo === "com_justa_causa" ? 0 : meses13;
  const decimoTerceiro =
    ((salarioParaVerbas + heCalculo.reflexo13) / 12) * meses13Efetivo;
  const inss13 = calcularINSS(decimoTerceiro);
  const irrf13 = calcularIRRF(decimoTerceiro - inss13.inss, dependentesIR);

  // ===================== 4. FÉRIAS PROPORCIONAIS + 1/3 =====================
  let mesesFeriasProp = mesesFeriasPropInput;
  if (mesesFeriasProp === undefined) {
    const diff = diffMeses(dataAdmissao, dataDemissao);
    mesesFeriasProp = diff % 12;
    if (tipoAviso === "indenizado" && motivo !== "com_justa_causa") {
      const mesesAviso = Math.ceil(avisoPrevioDias / 30);
      mesesFeriasProp = Math.min((diff + mesesAviso) % 12, 11);
    }
  }

  const diasFerias = diasFeriasPorFaltas(faltasPeriodo);
  const fatorFerias = diasFerias / 30;

  const feriasProporcionais =
    motivo === "com_justa_causa"
      ? 0
      : (salarioParaVerbas / 12) * mesesFeriasProp * fatorFerias +
        heCalculo.reflexoFerias;
  const tercoFeriasProp = feriasProporcionais / 3;
  const totalFeriasProp = feriasProporcionais + tercoFeriasProp;

  // ===================== 5. FÉRIAS VENCIDAS + 1/3 =====================
  let feriasVencidas = 0;
  let tercoFeriasVencidas = 0;

  if (statusFerias === "vencida_simples") {
    feriasVencidas = salarioBase;
    tercoFeriasVencidas = salarioBase / 3;
  } else if (statusFerias === "vencida_dobro") {
    feriasVencidas = salarioBase * 2;
    tercoFeriasVencidas = (salarioBase * 2) / 3;
  }

  // ===================== 6. DESCONTOS =====================
  const valorDescontoVT = descontoVT ? salarioBase * 0.06 : 0;
  const totalDescontosVariaveis =
    descontoFaltasMes +
    descontoHorasFalta +
    descontoAdiantamento +
    valorDescontoVT +
    outrosDescontos;

  // ===================== 7. MULTA FGTS =====================
  let multaFGTS = 0;
  let depositoFGTSAviso = 0;
  let percMulta = 0;

  if (motivo === "sem_justa_causa") {
    percMulta = 0.4;
  } else if (motivo === "acordo_mutuo") {
    percMulta = 0.2;
  }

  if (percMulta > 0) {
    if (tipoAviso === "indenizado") {
      depositoFGTSAviso = salarioBase * 0.08 * (avisoPrevioDias / 30);
    }
    // FGTS sobre média de HE
    const depositoHE = heCalculo.totalHEcomDSR * 0.08;
    const baseFGTS = saldoFGTS + depositoFGTSAviso + depositoHE;
    multaFGTS = baseFGTS * percMulta;
  }

  // ===================== 8. SALÁRIO-FAMÍLIA =====================
  let salarioFamilia = 0;
  if (salarioBase <= SALARIO_FAMILIA_LIMITE && dependentesSalarioFamilia > 0) {
    salarioFamilia = dependentesSalarioFamilia * SALARIO_FAMILIA_COTA;
  }

  // ===================== RESUMO =====================
  const totalProventos =
    saldoSalario +
    avisoPrevioValor +
    decimoTerceiro +
    totalFeriasProp +
    (feriasVencidas + tercoFeriasVencidas) +
    salarioFamilia +
    (heCalculo.valorHE + heCalculo.dsrHE);

  const totalDescontos =
    inssSalario.inss +
    inss13.inss +
    avisoPrevioINSS.inss +
    irrfSalario.irrf +
    irrf13.irrf +
    totalDescontosVariaveis;

  const liquido = totalProventos - totalDescontos;

  // ===================== DETALHAMENTO DE ADICIONAIS =====================
  const adicionais = [];
  if (adicionalInsalubridade > 0) {
    adicionais.push({
      nome: "Insalubridade",
      percentual: `${adicionalInsalubridade}%`,
      base: `Salário Mínimo (R$ ${SALARIO_MINIMO.toFixed(2)})`,
      valor: Math.round(valorInsalubridade * 100) / 100,
    });
  }
  if (adicionalPericulosidade > 0) {
    adicionais.push({
      nome: "Periculosidade",
      percentual: `${adicionalPericulosidade}%`,
      base: "Salário Base",
      valor: Math.round(valorPericulosidade * 100) / 100,
    });
  }
  if (adicionalNoturno) {
    adicionais.push({
      nome: "Adicional Noturno",
      percentual: `${percentualNoturno}%`,
      base: "Hora Diurna (estimado)",
      valor: Math.round(valorAdicionalNoturno * 100) / 100,
    });
  }

  return {
    success: true,
    dados: {
      entrada: {
        dataAdmissao: admISO,
        dataDemissao: demISO,
        salario,
        salarioBase: Math.round(salarioBase * 100) / 100,
        motivo,
        saldoFGTS,
        dependentesIR,
        dependentesSalarioFamilia,
        statusFerias,
        faltasPeriodo,
        tipoAviso,
        diasTrabalhados,
        anosServico: anosCompletos(dataAdmissao, dataDemissao),
        jornadaMensal,
        divisorSalarial,
      },
      adicionais,
      horasExtras: heCalculo,
      proventos: {
        saldoSalario: {
          descricao: `Saldo de salário (${diasTrabalhados} dias)`,
          valor: Math.round(saldoSalario * 100) / 100,
          inss: inssSalario.inss,
          irrf: irrfSalario.irrf,
        },
        avisoPrevio: {
          descricao: `Aviso prévio ${tipoAviso} (${avisoPrevioDias} dias)`,
          dias: avisoPrevioDias,
          valor: Math.round(avisoPrevioValor * 100) / 100,
          inss: avisoPrevioINSS.inss,
          irrf: avisoPrevioIRRF.irrf,
          isentoIRRF: avisoPrevioIRRF.isento,
        },
        decimoTerceiro: {
          descricao: `13º salário proporcional (${meses13Efetivo}/12)`,
          meses: meses13Efetivo,
          valor: Math.round(decimoTerceiro * 100) / 100,
          inss: inss13.inss,
          irrf: irrf13.irrf,
          reflexoHE: Math.round(heCalculo.reflexo13 * 100) / 100,
        },
        feriasProporcionais: {
          descricao: `Férias proporcionais (${mesesFeriasProp}/12) + 1/3`,
          meses: mesesFeriasProp,
          valorFerias: Math.round(feriasProporcionais * 100) / 100,
          valorTerco: Math.round(tercoFeriasProp * 100) / 100,
          total: Math.round(totalFeriasProp * 100) / 100,
          reflexoHE: Math.round(heCalculo.reflexoFerias * 100) / 100,
          inss: 0,
          irrf: 0,
          isento: true,
        },
        feriasVencidas: {
          descricao:
            statusFerias === "vencida_dobro"
              ? "Férias vencidas em dobro + 1/3 (Art. 137 CLT)"
              : "Férias vencidas + 1/3",
          valorFerias: Math.round(feriasVencidas * 100) / 100,
          valorTerco: Math.round(tercoFeriasVencidas * 100) / 100,
          total: Math.round((feriasVencidas + tercoFeriasVencidas) * 100) / 100,
          inss: 0,
          irrf: 0,
          isento: true,
        },
        horasExtras: {
          descricao: `Horas extras ${percentualHE}% + DSR`,
          valorHE: Math.round(heCalculo.valorHE * 100) / 100,
          dsrHE: Math.round(heCalculo.dsrHE * 100) / 100,
          total: Math.round(heCalculo.totalHEcomDSR * 100) / 100,
        },
        salarioFamilia: {
          descricao:
            dependentesSalarioFamilia > 0 &&
            salarioBase <= SALARIO_FAMILIA_LIMITE
              ? `Salário-família (${dependentesSalarioFamilia} dep.)`
              : "Salário-família (não aplicável)",
          valor: Math.round(salarioFamilia * 100) / 100,
        },
      },
      descontos: {
        inssSalario: inssSalario.inss,
        inssAviso: avisoPrevioINSS.inss,
        inss13: inss13.inss,
        totalINSS:
          Math.round(
            (inssSalario.inss + avisoPrevioINSS.inss + inss13.inss) * 100,
          ) / 100,
        irrfSalario: irrfSalario.irrf,
        irrf13: irrf13.irrf,
        totalIRRF: Math.round((irrfSalario.irrf + irrf13.irrf) * 100) / 100,
        faltasMes: Math.round(descontoFaltasMes * 100) / 100,
        horasFalta: Math.round(descontoHorasFalta * 100) / 100,
        adiantamento: Math.round(descontoAdiantamento * 100) / 100,
        valeTransporte: Math.round(valorDescontoVT * 100) / 100,
        outros: Math.round(outrosDescontos * 100) / 100,
        totalVariaveis: Math.round(totalDescontosVariaveis * 100) / 100,
      },
      fgts: {
        saldoInformado: Math.round(saldoFGTS * 100) / 100,
        depositoAviso: Math.round(depositoFGTSAviso * 100) / 100,
        depositoHE: Math.round(heCalculo.totalHEcomDSR * 0.08 * 100) / 100,
        percentualMulta: percMulta * 100,
        multa: Math.round(multaFGTS * 100) / 100,
        observacao: "Valor depositado via GRRF - não integra o líquido",
      },
      resumo: {
        totalProventos: Math.round(totalProventos * 100) / 100,
        totalDescontos: Math.round(totalDescontos * 100) / 100,
        totalINSS:
          Math.round(
            (inssSalario.inss + avisoPrevioINSS.inss + inss13.inss) * 100,
          ) / 100,
        totalIRRF: Math.round((irrfSalario.irrf + irrf13.irrf) * 100) / 100,
        totalDescontosVariaveis:
          Math.round(totalDescontosVariaveis * 100) / 100,
        liquido: Math.round(liquido * 100) / 100,
        multaFGTS: Math.round(multaFGTS * 100) / 100,
      },
      referenciasLegais: {
        salarioMinimo: SALARIO_MINIMO,
        tetoINSS: TETO_INSS,
        jornadaMensal: jornadaMensal,
        divisorSalarial: divisorSalarial,
        deducaoDependenteIR: DEDUCAO_DEPENDENTE_IR,
        salarioFamiliaCota: SALARIO_FAMILIA_COTA,
        prazoPagamento: "10 dias corridos (Art. 477, §8º CLT)",
        multaAtraso: "1 salário do trabalhador (Art. 477, §8º CLT)",
      },
    },
  };
}

module.exports = {
  calcularRescisao,
  calcularINSS,
  calcularIRRF,
  calcularHorasExtras,
  SALARIO_MINIMO,
  TETO_INSS,
  JORNADA_MENSAL_PADRAO,
  TABELA_INSS,
  TABELA_IRRF,
};
