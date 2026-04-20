const prisma = require("../config/prisma");

/**
 * GET /api/dashboard/kpis
 * KPIs rápidos para os 6 cards Small do topo
 */
const getKPIs = async (req, res) => {
  try {
    const agora = new Date();
    const anoAtual = agora.getFullYear();
    const mesAtual = agora.getMonth() + 1;
    const hoje = new Date(
      agora.getFullYear(),
      agora.getMonth(),
      agora.getDate(),
    );
    const daqui30dias = new Date(hoje);
    daqui30dias.setDate(daqui30dias.getDate() + 30);

    // Clientes
    const [totalClientes, clientesAtivos, honorariosTotal] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { status: "Ativo" } }),
      prisma.client.aggregate({
        _sum: { honorariosValor: true },
        where: { status: "Ativo" },
      }),
    ]);

    // Certificados
    const [certificadosValidos, certificadosExpirando] = await Promise.all([
      prisma.client.count({
        where: {
          certificadoPossui: true,
          OR: [
            { certificadoVencimento: { gte: hoje } },
            { certificadoVencimento: null },
          ],
        },
      }),
      prisma.client.findMany({
        where: {
          certificadoPossui: true,
          certificadoVencimento: { gte: hoje, lte: daqui30dias },
        },
        select: {
          id: true,
          razaoSocial: true,
          certificadoVencimento: true,
        },
        orderBy: { certificadoVencimento: "asc" },
      }),
    ]);

    // Documentos (contagem aproximada - documentos criados este mês)
    const inicioMes = new Date(anoAtual, mesAtual - 1, 1);
    const documentosMes = await prisma.documento.count({
      where: { createdAt: { gte: inicioMes } },
    });

    // Obrigações do mês
    const [obrigacoesMes, obrigacoesPassadas] = await Promise.all([
      prisma.calendarioObrigacao.count({
        where: { mes: mesAtual, ano: anoAtual },
      }),
      prisma.calendarioObrigacao.count({
        where: {
          mes: mesAtual,
          ano: anoAtual,
          dia: { lt: agora.getDate() },
        },
      }),
    ]);

    // Notificações não lidas (se autenticado)
    let notificacoesNaoLidas = 0;
    if (req.usuario) {
      notificacoesNaoLidas = await prisma.notificacao.count({
        where: { usuarioId: req.usuario.id, lida: false },
      });
    }

    res.json({
      success: true,
      kpis: {
        clientes: {
          total: totalClientes,
          ativos: clientesAtivos,
          inativos: totalClientes - clientesAtivos,
        },
        honorarios: {
          total: honorariosTotal._sum.honorariosValor
            ? Number(honorariosTotal._sum.honorariosValor)
            : 0,
        },
        certificados: {
          validos: certificadosValidos,
          expirando: certificadosExpirando.map((c) => ({
            id: c.id,
            nome: c.razaoSocial,
            vencimento: c.certificadoVencimento,
            diasRestantes: c.certificadoVencimento
              ? Math.ceil(
                  (c.certificadoVencimento - hoje) / (1000 * 60 * 60 * 24),
                )
              : null,
          })),
        },
        documentos: {
          mes: documentosMes,
        },
        obrigacoes: {
          mes: obrigacoesMes,
          pendentes: obrigacoesMes - obrigacoesPassadas,
          passadas: obrigacoesPassadas,
        },
        notificacoes: {
          naoLidas: notificacoesNaoLidas,
        },
      },
    });
  } catch (error) {
    console.error("[Dashboard] Erro ao buscar KPIs:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar KPIs",
      error: error.message,
    });
  }
};

/**
 * GET /api/dashboard/semana
 * Visão da semana - obrigações agrupadas por dia
 */
const getVisaoSemana = async (req, res) => {
  try {
    const agora = new Date();
    const diaSemana = agora.getDay(); // 0=Dom, 1=Seg...
    const inicioSemana = new Date(agora);
    inicioSemana.setDate(agora.getDate() - diaSemana); // Domingo (início da semana)
    inicioSemana.setHours(0, 0, 0, 0);

    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6); // Sábado
    fimSemana.setHours(23, 59, 59, 999);

    const diasNomes = [
      "Domingo",
      "Segunda",
      "Terça",
      "Quarta",
      "Quinta",
      "Sexta",
      "Sábado",
    ];

    // Buscar obrigações da semana
    const obrigatoroes = await prisma.calendarioObrigacao.findMany({
      where: {
        mes: agora.getMonth() + 1,
        ano: agora.getFullYear(),
        dia: {
          gte: inicioSemana.getDate(),
          lte: fimSemana.getDate(),
        },
      },
      orderBy: [{ dia: "asc" }],
    });

    // Buscar feriados da semana
    const feriados = await prisma.calendarioFeriado.findMany({
      where: {
        data: { gte: inicioSemana, lte: fimSemana },
      },
    });

    // Agrupar por dia
    const dias = {};
    for (let i = 0; i < 7; i++) {
      const dia = new Date(inicioSemana);
      dia.setDate(inicioSemana.getDate() + i);
      const key = dia.toISOString().split("T")[0];
      dias[key] = {
        data: key,
        diaSemana: diasNomes[dia.getDay()],
        diaNumero: dia.getDate(),
        mes: dia.getMonth() + 1,
        eHoje: dia.toDateString() === agora.toDateString(),
        obrigatoroes: [],
        feriados: [],
      };
    }

    obrigatoroes.forEach((o) => {
      const key = `${o.ano}-${String(o.mes).padStart(2, "0")}-${String(o.dia).padStart(2, "0")}`;
      if (dias[key]) {
        dias[key].obrigatoroes.push({
          nome: o.nomeEvento,
          categoria: o.categoria,
          periodoApuracao: o.periodoApuracao,
        });
      }
    });

    feriados.forEach((f) => {
      const key = f.data.toISOString().split("T")[0];
      if (dias[key]) {
        dias[key].feriados.push({
          nome: f.nome,
          abrangencia: f.abrangencia,
          uf: f.uf,
          municipio: f.municipio,
        });
      }
    });

    const semana = Object.values(dias);
    const totalSemana = semana.reduce(
      (acc, d) => acc + d.obrigatoroes.length + d.feriados.length,
      0,
    );

    res.json({
      success: true,
      semana,
      totalObrigatoroes: totalSemana,
      inicio: inicioSemana.toISOString(),
      fim: fimSemana.toISOString(),
    });
  } catch (error) {
    console.error("[Dashboard] Erro ao buscar visão da semana:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar visão da semana",
      error: error.message,
    });
  }
};

/**
 * GET /api/dashboard/atividades
 * Atividades recentes no sistema
 */
const getAtividadesRecentes = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Buscar tudo em paralelo para performance
    const [novosClientes, novosDocs, notasRecentes] = await Promise.all([
      prisma.client.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { id: true, razaoSocial: true, createdAt: true, status: true },
      }),
      prisma.documento.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          nomeOriginal: true,
          tipo: true,
          createdAt: true,
          client: { select: { razaoSocial: true } },
        },
      }),
      prisma.stickyNote.findMany({
        take: 2,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          titulo: true,
          cor: true,
          updatedAt: true,
          usuario: { select: { nome: true } },
        },
      }),
    ]);

    const atividades = [];

    novosClientes.forEach((c) => {
      atividades.push({
        tipo: "cliente_novo",
        titulo: `Cliente "${c.razaoSocial}" cadastrado`,
        descricao: `Status: ${c.status}`,
        data: c.createdAt,
        icon: "user-plus",
        cor: "blue",
      });
    });

    novosDocs.forEach((d) => {
      atividades.push({
        tipo: "documento_upload",
        titulo: `Documento "${d.nomeOriginal}" enviado`,
        descricao: `Tipo: ${d.tipo} • ${d.client?.razaoSocial || "N/A"}`,
        data: d.createdAt,
        icon: "file-upload",
        cor: "green",
      });
    });

    notasRecentes.forEach((n) => {
      atividades.push({
        tipo: "nota_criada",
        titulo: `Nota "${n.titulo}" ${n.updatedAt > new Date(Date.now() - 3600000) ? "atualizada" : "criada"}`,
        descricao: `Por: ${n.usuario?.nome || "Usuário"}`,
        data: n.updatedAt,
        icon: "sticky-note",
        cor: n.cor || "yellow",
      });
    });

    // Logs recentes (opcional)
    try {
      const logsRecentes = await prisma.$queryRaw`
        SELECT * FROM "logs" ORDER BY created_at DESC LIMIT 2
      `;
      if (logsRecentes && logsRecentes.length > 0) {
        logsRecentes.forEach((l) => {
          atividades.push({
            tipo: "log",
            titulo: l.acao || "Ação registrada",
            descricao: l.detalhes || "",
            data: l.created_at || new Date(),
            icon: "activity",
            cor: "gray",
          });
        });
      }
    } catch {
      // Logs podem não existir
    }

    const atividadesOrdenadas = atividades
      .sort((a, b) => b.data - a.data)
      .slice(0, limit)
      .map((a) => ({
        ...a,
        tempoRelativo: getTempoRelativo(a.data),
      }));

    res.json({
      success: true,
      atividades: atividadesOrdenadas,
      total: atividades.length,
    });
  } catch (error) {
    console.error("[Dashboard] Erro ao buscar atividades recentes:", error);
    res.status(500).json({
      success: false,
      message: "Erro ao buscar atividades recentes",
      error: error.message,
    });
  }
};

/**
 * GET /api/dashboard
 * Dados agregados completos do dashboard
 */
const getDashboardCompleto = async (req, res) => {
  try {
    // Executar tudo em paralelo
    const [kpisRes, semanaRes, atividadesRes] = await Promise.allSettled([
      getKPIsData(),
      getVisaoSemanaData(),
      getAtividadesData(req),
    ]);

    const kpis = kpisRes.status === "fulfilled" ? kpisRes.value : null;
    const semana = semanaRes.status === "fulfilled" ? semanaRes.value : null;
    const atividades =
      atividadesRes.status === "fulfilled" ? atividadesRes.value : null;

    res.json({
      success: true,
      dashboard: { kpis, semana, atividades },
      parcial: {
        kpis: kpisRes.status === "rejected",
        semana: semanaRes.status === "rejected",
        atividades: atividadesRes.status === "rejected",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erro ao buscar dados do dashboard",
      error: error.message,
    });
  }
};

// ===================== HELPERS =====================

async function getKPIsData() {
  const agora = new Date();
  const mesAtual = agora.getMonth() + 1;
  const anoAtual = agora.getFullYear();
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

  const [totalClientes, clientesAtivos, honorariosTotal] = await Promise.all([
    prisma.client.count(),
    prisma.client.count({ where: { status: "Ativo" } }),
    prisma.client.aggregate({
      _sum: { honorariosValor: true },
      where: { status: "Ativo" },
    }),
  ]);

  const inicioMes = new Date(anoAtual, mesAtual - 1, 1);
  const documentosMes = await prisma.documento.count({
    where: { createdAt: { gte: inicioMes } },
  });

  const [obrigacoesMes, obrigacoesPassadas] = await Promise.all([
    prisma.calendarioObrigacao.count({
      where: { mes: mesAtual, ano: anoAtual },
    }),
    prisma.calendarioObrigacao.count({
      where: { mes: mesAtual, ano: anoAtual, dia: { lt: hoje.getDate() } },
    }),
  ]);

  return {
    clientes: {
      total: totalClientes,
      ativos: clientesAtivos,
      inativos: totalClientes - clientesAtivos,
    },
    honorarios: { total: Number(honorariosTotal._sum.honorariosValor || 0) },
    documentos: { mes: documentosMes },
    obrigacoes: {
      mes: obrigacoesMes,
      pendentes: obrigacoesMes - obrigacoesPassadas,
      passadas: obrigacoesPassadas,
    },
  };
}

async function getVisaoSemanaData() {
  const agora = new Date();
  const diaSemana = agora.getDay();
  const inicioSemana = new Date(agora);
  inicioSemana.setDate(agora.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
  inicioSemana.setHours(0, 0, 0, 0);

  const obrigatoroes = await prisma.calendarioObrigacao.findMany({
    where: {
      mes: agora.getMonth() + 1,
      ano: agora.getFullYear(),
      dia: { gte: inicioSemana.getDate(), lte: inicioSemana.getDate() + 6 },
    },
    orderBy: [{ dia: "asc" }],
  });

  return obrigatoroes.map((o) => ({
    dia: o.dia,
    mes: o.mes,
    nome: o.nomeEvento,
    categoria: o.categoria,
  }));
}

async function getAtividadesData(req) {
  const novosClientes = await prisma.client.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    select: { id: true, razaoSocial: true, createdAt: true, status: true },
  });

  const novosDocs = await prisma.documento.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      nomeOriginal: true,
      tipo: true,
      createdAt: true,
      client: { select: { razaoSocial: true } },
    },
  });

  return { novosClientes, novosDocs };
}

function getTempoRelativo(data) {
  const agora = new Date();
  const diff = agora - data;
  const min = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);

  if (min < 1) return "Agora mesmo";
  if (min < 60) return `há ${min}min`;
  if (horas < 24) return `há ${horas}h`;
  if (dias < 7) return `há ${dias}d`;
  return data.toLocaleDateString("pt-BR");
}

module.exports = {
  getKPIs,
  getVisaoSemana,
  getAtividadesRecentes,
  getDashboardCompleto,
};
