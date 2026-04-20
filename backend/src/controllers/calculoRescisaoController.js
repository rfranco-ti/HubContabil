const { calcularRescisao } = require("../services/calculoRescisaoService");

/**
 * POST /api/calculos/rescisao
 * Calcular rescisão trabalhista completa
 */
const calcularRescisaoController = async (req, res) => {
  try {
    const {
      dataAdmissao,
      dataDemissao,
      salario,
      motivo,
      saldoFGTS,
      dependentesIR,
      dependentesSalarioFamilia,
      statusFerias,
      faltasPeriodo,
      tipoAviso,
      meses13,
      mesesFeriasProp,
      jornadaMensal,
      adicionalInsalubridade,
      adicionalPericulosidade,
      adicionalNoturno,
      percentualNoturno,
      horasExtrasMes,
      percentualHE,
      diasUteis,
      dsrMes,
      diasFaltaMes,
      horasFaltaMinutos,
      descontoAdiantamento,
      descontoVT,
      outrosDescontos,
      divisorSalarial,
    } = req.body;

    // Validações
    if (!dataAdmissao || !dataDemissao || !salario || !motivo) {
      return res.status(400).json({
        success: false,
        message:
          "Campos obrigatórios: dataAdmissao, dataDemissao, salario, motivo",
      });
    }

    const motivoValidos = [
      "sem_justa_causa",
      "com_justa_causa",
      "pedido_demissao",
      "acordo_mutuo",
    ];
    if (!motivoValidos.includes(motivo)) {
      return res.status(400).json({
        success: false,
        message: `Motivo inválido. Use: ${motivoValidos.join(", ")}`,
      });
    }

    const dataAdm = new Date(dataAdmissao);
    const dataDem = new Date(dataDemissao);

    if (isNaN(dataAdm.getTime()) || isNaN(dataDem.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Datas inválidas. Use formato ISO (YYYY-MM-DD)",
      });
    }

    if (dataDem < dataAdm) {
      return res.status(400).json({
        success: false,
        message: "Data de demissão deve ser posterior à data de admissão",
      });
    }

    if (salario <= 0) {
      return res.status(400).json({
        success: false,
        message: "Salário deve ser maior que zero",
      });
    }

    const resultado = calcularRescisao({
      dataAdmissao: dataAdmissao,
      dataDemissao: dataDemissao,
      salario: parseFloat(salario),
      motivo,
      saldoFGTS: parseFloat(saldoFGTS) || 0,
      dependentesIR: parseInt(dependentesIR) || 0,
      dependentesSalarioFamilia: parseInt(dependentesSalarioFamilia) || 0,
      statusFerias: statusFerias || "nenhuma",
      faltasPeriodo: parseInt(faltasPeriodo) || 0,
      tipoAviso: tipoAviso || "indenizado",
      meses13: meses13 !== undefined ? parseInt(meses13) : undefined,
      mesesFeriasProp:
        mesesFeriasProp !== undefined ? parseInt(mesesFeriasProp) : undefined,
      jornadaMensal: parseInt(jornadaMensal) || 220,
      adicionalInsalubridade: parseInt(adicionalInsalubridade) || 0,
      adicionalPericulosidade: parseInt(adicionalPericulosidade) || 0,
      adicionalNoturno: adicionalNoturno === true,
      percentualNoturno: parseInt(percentualNoturno) || 20,
      horasExtrasMes: parseFloat(horasExtrasMes) || 0,
      percentualHE: parseFloat(percentualHE) || 50,
      diasUteis: parseInt(diasUteis) || 22,
      dsrMes: parseInt(dsrMes) || 4,
      diasFaltaMes: parseInt(diasFaltaMes) || 0,
      horasFaltaMinutos: parseInt(horasFaltaMinutos) || 0,
      descontoAdiantamento: parseFloat(descontoAdiantamento) || 0,
      descontoVT: descontoVT === true,
      outrosDescontos: parseFloat(outrosDescontos) || 0,
      divisorSalarial: parseInt(divisorSalarial) || 30,
    });

    res.json(resultado);
  } catch (error) {
    console.error("[Rescisão] Erro ao calcular:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao calcular rescisão",
      error: error.message,
    });
  }
};

/**
 * GET /api/calculos/rescisao/tabelas
 * Retornar tabelas tributárias vigentes
 */
const getTabelas = async (req, res) => {
  try {
    const {
      SALARIO_MINIMO,
      TETO_INSS,
      TABELA_INSS,
      TABELA_IRRF,
    } = require("../services/calculoRescisaoService");

    res.json({
      success: true,
      tabelas: {
        ano: 2026,
        salarioMinimo: SALARIO_MINIMO,
        tetoINSS: TETO_INSS,
        inss: TABELA_INSS,
        irrf: TABELA_IRRF,
        deducaoDependenteIR: 189.59,
        salarioFamilia: {
          cota: 67.54,
          limiteRenda: 1980.38,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar tabelas",
      error: error.message,
    });
  }
};

module.exports = { calcularRescisaoController, getTabelas };
