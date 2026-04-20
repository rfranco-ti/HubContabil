const prisma = require("../config/prisma");

/**
 * Controller para calendário contábil
 * Usa banco de dados (tabela CalendarioObrigacao) ao invés de arquivo JSON
 */

/**
 * GET /api/calendario/contabil
 * Obter calendário contábil com obrigações e feriados
 * Query params opcionais: ano, mes
 */
const getCalendarioContabil = async (req, res) => {
  try {
    const { ano, mes } = req.query;

    // Filtros
    const filtros = {};
    if (ano) filtros.ano = parseInt(ano);
    if (mes) filtros.mes = parseInt(mes);

    // Buscar obrigações
    const obrigacoes = await prisma.calendarioObrigacao.findMany({
      where: filtros,
      orderBy: [{ mes: "asc" }, { dia: "asc" }],
    });

    // Buscar feriados
    const filtrosFeriado = {};
    if (ano) filtrosFeriado.ano = parseInt(ano);

    const feriados = await prisma.calendarioFeriado.findMany({
      where: filtrosFeriado,
      orderBy: { data: "asc" },
    });

    // Organizar por ano > mes > dia (formato compatível com frontend)
    const calendarioFormatado = {};

    const mesesNomes = {
      1: "Janeiro",
      2: "Fevereiro",
      3: "Março",
      4: "Abril",
      5: "Maio",
      6: "Junho",
      7: "Julho",
      8: "Agosto",
      9: "Setembro",
      10: "Outubro",
      11: "Novembro",
      12: "Dezembro",
    };

    // Agrupar obrigações
    obrigacoes.forEach((obrigacao) => {
      const anoKey = obrigacao.ano.toString();
      const mesNome = mesesNomes[obrigacao.mes];
      const diaKey = obrigacao.dia.toString().padStart(2, "0");

      if (!calendarioFormatado[anoKey]) calendarioFormatado[anoKey] = {};
      if (!calendarioFormatado[anoKey][mesNome])
        calendarioFormatado[anoKey][mesNome] = {};
      if (!calendarioFormatado[anoKey][mesNome][diaKey])
        calendarioFormatado[anoKey][mesNome][diaKey] = [];

      calendarioFormatado[anoKey][mesNome][diaKey].push({
        eventName: obrigacao.nomeEvento,
        eventPeriod: obrigacao.periodoApuracao || "",
        eventBase: obrigacao.baseLegal || "",
        calendar: obrigacao.categoria,
      });
    });

    res.json({
      ...calendarioFormatado,
      _meta: {
        totalObrigacoes: obrigacoes.length,
        totalFeriados: feriados.length,
        anos: [...new Set(obrigacoes.map((o) => o.ano))],
        categorias: [...new Set(obrigacoes.map((o) => o.categoria))],
      },
    });
  } catch (error) {
    console.error("Erro ao buscar calendário contábil:", error);
    res.status(500).json({
      message: "Erro ao carregar calendário contábil",
      error: error.message,
    });
  }
};

/**
 * POST /api/calendario/contabil
 * Criar nova obrigação no calendário
 * (Rota protegida - requer autenticação)
 */
const criarObrigacao = async (req, res) => {
  try {
    const {
      ano,
      mes,
      dia,
      nomeEvento,
      periodoApuracao,
      baseLegal,
      categoria,
      isFeriado,
      isPontoFacultativo,
    } = req.body;

    if (!ano || !mes || !dia || !nomeEvento || !categoria) {
      return res.status(400).json({
        message: "Campos obrigatórios: ano, mes, dia, nomeEvento, categoria",
      });
    }

    const obrigacao = await prisma.calendarioObrigacao.create({
      data: {
        ano,
        mes,
        dia,
        nomeEvento,
        periodoApuracao,
        baseLegal,
        categoria,
        isFeriado: isFeriado || false,
        isPontoFacultativo: isPontoFacultativo || false,
      },
    });

    res.status(201).json({
      message: "Obrigação criada com sucesso",
      data: obrigacao,
    });
  } catch (error) {
    console.error("Erro ao criar obrigação:", error);
    res.status(500).json({
      message: "Erro ao criar obrigação",
      error: error.message,
    });
  }
};

/**
 * PUT /api/calendario/contabil/:id
 * Atualizar obrigação
 */
const atualizarObrigacao = async (req, res) => {
  try {
    const { id } = req.params;
    const dados = req.body;

    const obrigacaoExistente = await prisma.calendarioObrigacao.findUnique({
      where: { id },
    });
    if (!obrigacaoExistente) {
      return res.status(404).json({ message: "Obrigação não encontrada" });
    }

    const obrigacaoAtualizada = await prisma.calendarioObrigacao.update({
      where: { id },
      data: dados,
    });

    res.json({
      message: "Obrigação atualizada com sucesso",
      data: obrigacaoAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar obrigação:", error);
    res.status(500).json({
      message: "Erro ao atualizar obrigação",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/calendario/contabil/:id
 * Deletar obrigação
 */
const deletarObrigacao = async (req, res) => {
  try {
    const { id } = req.params;

    const obrigacaoExistente = await prisma.calendarioObrigacao.findUnique({
      where: { id },
    });
    if (!obrigacaoExistente) {
      return res.status(404).json({ message: "Obrigação não encontrada" });
    }

    await prisma.calendarioObrigacao.delete({ where: { id } });

    res.json({ message: "Obrigação excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir obrigação:", error);
    res.status(500).json({
      message: "Erro ao excluir obrigação",
      error: error.message,
    });
  }
};

/**
 * GET /api/calendario/contabil/estatisticas
 * Obter estatísticas do calendário
 */
const getEstatisticas = async (req, res) => {
  try {
    const { ano } = req.query;
    const filtros = ano ? { ano: parseInt(ano) } : {};

    const totalObrigacoes = await prisma.calendarioObrigacao.count({
      where: filtros,
    });
    const totalFeriados = await prisma.calendarioFeriado.count({
      where: ano ? { ano: parseInt(ano) } : {},
    });

    const porCategoria = await prisma.calendarioObrigacao.groupBy({
      by: ["categoria"],
      where: filtros,
      _count: true,
    });

    const porMes = await prisma.calendarioObrigacao.groupBy({
      by: ["mes"],
      where: filtros,
      _count: true,
      orderBy: { mes: "asc" },
    });

    res.json({
      totalObrigacoes,
      totalFeriados,
      porCategoria,
      porMes,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res.status(500).json({
      message: "Erro ao buscar estatísticas",
      error: error.message,
    });
  }
};

/**
 * GET /api/calendario/dashboard
 * Dados agregados para o dashboard frontend
 */
const getDashboard = async (req, res) => {
  try {
    const agora = new Date();
    const anoAtual = agora.getFullYear();
    const mesAtual = agora.getMonth() + 1;
    const hoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
    );
    const proximos7dias = new Date(hoje);
    proximos7dias.setDate(proximos7dias.getDate() + 7);
    const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);

    // Buscar tudo em paralelo com Promise.all para performance
    const [
      proximasObrigacoes,
      feriadosProximos,
      eventosObrigacoes,
      eventosFeriados,
      totalObrigacoesMes,
      obrigacoesPassadasCount,
      porCategoriaResult,
      obrigacoesMes,
      feriadosMes,
    ] = await Promise.all([
      // 1. Próximas obrigações (próximos 7 dias)
      prisma.calendarioObrigacao.findMany({
        where: {
          OR: [
            { mes: mesAtual, ano: anoAtual, dia: { gte: agora.getDate() } },
            {
              mes: mesAtual === 12 ? 1 : mesAtual + 1,
              ano: mesAtual === 12 ? anoAtual + 1 : anoAtual,
              dia: { lte: 7 },
            },
          ],
        },
        orderBy: [{ mes: "asc" }, { dia: "asc" }],
        take: 10,
      }),
      // 2. Feriados próximos
      prisma.calendarioFeriado.findMany({
        where: { data: { gte: hoje } },
        orderBy: { data: "asc" },
        take: 5,
      }),
      // 3. Próximos eventos - obrigações
      prisma.calendarioObrigacao.findMany({
        where: {
          OR: [
            { mes: mesAtual, ano: anoAtual, dia: { gte: agora.getDate() } },
            {
              mes: mesAtual === 12 ? 1 : mesAtual + 1,
              ano: mesAtual === 12 ? anoAtual + 1 : anoAtual,
              dia: { lte: 15 },
            },
          ],
        },
        orderBy: [{ mes: "asc" }, { dia: "asc" }],
        take: 15,
      }),
      // 4. Feriados dos próximos 15 dias
      prisma.calendarioFeriado.findMany({
        where: { data: { gte: hoje, lte: proximos15dias } },
        orderBy: { data: "asc" },
        take: 5,
      }),
      // 5. Resumo do mês - contagem total
      prisma.calendarioObrigacao.count({
        where: { mes: mesAtual, ano: anoAtual },
      }),
      // 6. Obrigações passadas (contagem via query otimizada)
      prisma.calendarioObrigacao.count({
        where: {
          mes: mesAtual,
          ano: anoAtual,
          dia: { lt: agora.getDate() },
        },
      }),
      // 7. Por categoria (via aggregate para performance)
      prisma.calendarioObrigacao.groupBy({
        by: ["categoria"],
        where: { mes: mesAtual, ano: anoAtual },
        _count: true,
      }),
      // 8. Todas obrigacoes do mes (para mini calendario)
      prisma.calendarioObrigacao.findMany({
        where: { mes: mesAtual, ano: anoAtual },
        select: { dia: true, mes: true, ano: true, categoria: true },
      }),
      // 9. Feriados do mes (para mini calendario)
      prisma.calendarioFeriado.findMany({
        where: {
          data: {
            gte: new Date(anoAtual, mesAtual - 1, 1),
            lt: new Date(anoAtual, mesAtual, 1),
          },
        },
        select: { data: true },
      }),
    ]);

    // Formatar para frontend
    const proximasFormatadas = proximasObrigacoes
      .map((o) => {
        const data = new Date(o.ano, o.mes - 1, o.dia);
        const dataStr = `${o.ano}-${String(o.mes).padStart(2, "0")}-${String(o.dia).padStart(2, "0")}`;
        const diffDias = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
        let quando = "";
        if (diffDias === 0) quando = "Hoje";
        else if (diffDias === 1) quando = "Amanhã";
        else quando = `Em ${diffDias} dias`;

        return {
          id: o.id,
          data: dataStr,
          titulo: o.nomeEvento,
          nome: o.nomeEvento,
          categoria: o.categoria,
          periodoApuracao: o.periodoApuracao,
          quando,
          diffDias,
          dia: o.dia,
          mes: o.mes,
          ano: o.ano,
        };
      })
      .slice(0, 5);

    const feriadosFormatados = feriadosProximos
      .map((f) => {
        const data = new Date(f.data);
        const diffDias = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
        let quando = "";
        if (diffDias === 0) quando = "Hoje";
        else if (diffDias === 1) quando = "Amanhã";
        else quando = `Em ${diffDias} dias`;

        return {
          id: f.id,
          data: f.data,
          nome: f.nome,
          abrangencia: f.abrangencia,
          uf: f.uf,
          municipio: f.municipio,
          quando,
          diffDias,
        };
      })
      .slice(0, 3);

    // Combinar e ordenar por data
    const todosEventos = [
      ...eventosObrigacoes.map((o) => {
        const data = new Date(o.ano, o.mes - 1, o.dia);
        const dataStr = `${o.ano}-${String(o.mes).padStart(2, "0")}-${String(o.dia).padStart(2, "0")}`;
        const diffDias = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
        let quando = "";
        if (diffDias === 0) quando = "Hoje";
        else if (diffDias === 1) quando = "Amanhã";
        else quando = `Em ${diffDias} dias`;
        return {
          tipo: "obrigacao",
          data: dataStr,
          dataObj: data,
          diffDias,
          quando,
          nome: o.nomeEvento,
          categoria: o.categoria,
          periodoApuracao: o.periodoApuracao,
          dia: o.dia,
          mes: o.mes,
        };
      }),
      ...eventosFeriados.map((f) => {
        const data = new Date(f.data);
        const dataStr = data.toISOString().split("T")[0];
        const diffDias = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24));
        let quando = "";
        if (diffDias === 0) quando = "Hoje";
        else if (diffDias === 1) quando = "Amanhã";
        else quando = `Em ${diffDias} dias`;
        return {
          tipo: "feriado",
          data: dataStr,
          dataObj: data,
          diffDias,
          quando,
          nome: f.nome,
          categoria: "Feriados",
          abrangencia: f.abrangencia,
          uf: f.uf,
          municipio: f.municipio,
          dia: data.getDate(),
          mes: data.getMonth() + 1,
        };
      }),
    ]
      .sort((a, b) => a.dataObj - b.dataObj)
      .slice(0, 10);

    // Resumo do mês (já veio das queries paralelas)
    const totalMes = totalObrigacoesMes;
    const passadas = obrigacoesPassadasCount;
    const pendentes = totalMes - passadas;

    const porCategoria = {};
    porCategoriaResult.forEach((r) => {
      porCategoria[r.categoria] = r._count;
    });

    // Dias com eventos para mini calendario (ja veio das queries paralelas)
    const diasComEventos = obrigacoesMes.map((o) => ({
      dia: o.dia,
      mes: mesAtual,
      ano: anoAtual,
      categoria: o.categoria,
    }));

    // Adicionar feriados do mes
    feriadosMes.forEach((f) => {
      const data = new Date(f.data);
      diasComEventos.push({
        dia: data.getDate(),
        mes: mesAtual,
        ano: anoAtual,
        categoria: "Feriado",
      });
    });

    res.json({
      success: true,
      dashboard: {
        proximas: proximasFormatadas,
        proximasObrigacoes: proximasFormatadas,
        feriadosProximos: feriadosFormatados,
        proximosEventos: todosEventos.map(function (ev) {
          // Remover dataObj (não serializável)
          var evCopy = {};
          for (var key in ev) {
            if (key !== "dataObj") evCopy[key] = ev[key];
          }
          return evCopy;
        }),
        resumoMes: {
          mes: mesAtual,
          ano: anoAtual,
          total: totalMes,
          passadas,
          pendentes,
          porCategoria,
        },
        diasComEventos: diasComEventos,
      },
    });
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar dados do dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getCalendarioContabil,
  criarObrigacao,
  atualizarObrigacao,
  deletarObrigacao,
  getEstatisticas,
  getDashboard,
};
