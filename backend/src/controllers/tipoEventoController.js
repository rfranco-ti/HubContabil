const prisma = require("../config/prisma");

/**
 * GET /api/tipos-evento/
 * Listar tipos ativos (público - usado pelo frontend para popular selects)
 */
const listarTipos = async (req, res) => {
  try {
    const tipos = await prisma.tipoEvento.findMany({
      where: { ativo: true },
      orderBy: { ordem: "asc" },
      select: {
        id: true,
        nome: true,
        label: true,
        cor: true,
        icone: true,
        descricao: true,
        ordem: true,
        ehPadrao: true,
        _count: {
          select: {
            eventos: true,
            obrigacoes: true,
          },
        },
      },
    });

    res.json({ success: true, tipos });
  } catch (error) {
    console.error("[TipoEvento] Erro ao listar tipos:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao buscar tipos de evento",
        error: error.message,
      });
  }
};

/**
 * GET /api/tipos-evento/admin
 * Admin: listar todos (inclui inativos)
 */
const listarTiposAdmin = async (req, res) => {
  try {
    const tipos = await prisma.tipoEvento.findMany({
      orderBy: { ordem: "asc" },
      select: {
        id: true,
        nome: true,
        label: true,
        cor: true,
        icone: true,
        descricao: true,
        ativo: true,
        ordem: true,
        ehPadrao: true,
        createdAt: true,
        _count: {
          select: {
            eventos: true,
            obrigacoes: true,
          },
        },
      },
    });

    res.json({ success: true, tipos });
  } catch (error) {
    console.error("[TipoEvento] Erro ao listar tipos (admin):", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao buscar tipos de evento",
        error: error.message,
      });
  }
};

/**
 * GET /api/tipos-evento/:id
 * Admin: obter detalhes de um tipo específico
 */
const obterTipo = async (req, res) => {
  try {
    const { id } = req.params;

    const tipo = await prisma.tipoEvento.findUnique({
      where: { id },
      include: {
        eventos: { take: 10, orderBy: { data: "desc" } },
        obrigacoes: { take: 10 },
        _count: {
          select: {
            eventos: true,
            obrigacoes: true,
          },
        },
      },
    });

    if (!tipo) {
      return res
        .status(404)
        .json({ success: false, message: "Tipo de evento não encontrado" });
    }

    res.json({ success: true, tipo });
  } catch (error) {
    console.error("[TipoEvento] Erro ao obter tipo:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao buscar tipo de evento",
        error: error.message,
      });
  }
};

/**
 * POST /api/tipos-evento/admin
 * Admin: criar novo tipo de evento
 */
const criarTipo = async (req, res) => {
  try {
    const { nome, label, cor, icone, descricao, ordem } = req.body;

    // Validações
    if (!nome || !label) {
      return res.status(400).json({
        success: false,
        message: "Campos obrigatórios: nome (slug) e label",
      });
    }

    // Validar formato do slug (apenas letras minúsculas, números e underscore)
    const slugRegex = /^[a-z0-9_]+$/;
    if (!slugRegex.test(nome)) {
      return res.status(400).json({
        success: false,
        message:
          'O campo "nome" deve ser um slug válido: apenas letras minúsculas, números e underscore (ex: trabalhista, datas_comemorativas)',
      });
    }

    // Verificar duplicata
    const existente = await prisma.tipoEvento.findUnique({ where: { nome } });
    if (existente) {
      return res.status(409).json({
        success: false,
        message: "Já existe um tipo de evento com este slug",
        tipoExistente: { nome: existente.nome, label: existente.label },
      });
    }

    const tipo = await prisma.tipoEvento.create({
      data: {
        nome,
        label,
        cor: cor || "#3b82f6",
        icone: icone || null,
        descricao: descricao || null,
        ordem: ordem || 0,
        ehPadrao: false, // tipos criados pelo admin nunca são "padrão do sistema"
      },
    });

    res
      .status(201)
      .json({
        success: true,
        message: "Tipo de evento criado com sucesso",
        tipo,
      });
  } catch (error) {
    console.error("[TipoEvento] Erro ao criar tipo:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao criar tipo de evento",
        error: error.message,
      });
  }
};

/**
 * PUT /api/tipos-evento/admin/:id
 * Admin: atualizar tipo de evento
 */
const atualizarTipo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, label, cor, icone, descricao, ativo, ordem, ehPadrao } =
      req.body;

    const existente = await prisma.tipoEvento.findUnique({ where: { id } });
    if (!existente) {
      return res
        .status(404)
        .json({ success: false, message: "Tipo de evento não encontrado" });
    }

    // Se está tentando mudar o nome, verificar duplicata
    if (nome && nome !== existente.nome) {
      const slugRegex = /^[a-z0-9_]+$/;
      if (!slugRegex.test(nome)) {
        return res.status(400).json({
          success: false,
          message: 'O campo "nome" deve ser um slug válido',
        });
      }

      const duplicata = await prisma.tipoEvento.findUnique({ where: { nome } });
      if (duplicata) {
        return res.status(409).json({
          success: false,
          message: "Já existe um tipo de evento com este slug",
        });
      }
    }

    // Proteção: não permitir mudar ehPadrao de tipos essenciais do sistema
    if (ehPadrao !== undefined && existente.ehPadrao && ehPadrao === false) {
      return res.status(403).json({
        success: false,
        message: "Não é possível alterar o status de tipo padrão do sistema",
      });
    }

    const tipo = await prisma.tipoEvento.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome }),
        ...(label !== undefined && { label }),
        ...(cor !== undefined && { cor }),
        ...(icone !== undefined && { icone }),
        ...(descricao !== undefined && { descricao }),
        ...(ativo !== undefined && { ativo }),
        ...(ordem !== undefined && { ordem }),
        ...(ehPadrao !== undefined && { ehPadrao }),
      },
    });

    res.json({ success: true, message: "Tipo de evento atualizado", tipo });
  } catch (error) {
    console.error("[TipoEvento] Erro ao atualizar tipo:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao atualizar tipo de evento",
        error: error.message,
      });
  }
};

/**
 * DELETE /api/tipos-evento/admin/:id
 * Admin: desativar tipo de evento (soft delete)
 * Impede desativação se houver eventos vinculados
 */
const desativarTipo = async (req, res) => {
  try {
    const { id } = req.params;

    const tipo = await prisma.tipoEvento.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            eventos: true,
            obrigacoes: true,
          },
        },
      },
    });

    if (!tipo) {
      return res
        .status(404)
        .json({ success: false, message: "Tipo de evento não encontrado" });
    }

    // Proteção: não permitir desativar tipos padrão do sistema
    if (tipo.ehPadrao) {
      return res.status(403).json({
        success: false,
        message: "Não é possível desativar tipos essenciais do sistema",
        tipo: { nome: tipo.nome, label: tipo.label },
      });
    }

    // Verificar se há eventos vinculados
    const totalVinculos = tipo._count.eventos + tipo._count.obrigacoes;
    if (totalVinculos > 0) {
      return res.status(400).json({
        success: false,
        message: `Não é possível desativar: existem ${totalVinculos} eventos/obrigações vinculados a este tipo`,
        detalhes: {
          eventos: tipo._count.eventos,
          obrigacoes: tipo._count.obrigacoes,
        },
      });
    }

    await prisma.tipoEvento.update({
      where: { id },
      data: { ativo: false },
    });

    res.json({
      success: true,
      message: "Tipo de evento desativado com sucesso",
    });
  } catch (error) {
    console.error("[TipoEvento] Erro ao desativar tipo:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao desativar tipo de evento",
        error: error.message,
      });
  }
};

/**
 * POST /api/tipos-evento/admin/:id/reativar
 * Admin: reativar tipo de evento desativado
 */
const reativarTipo = async (req, res) => {
  try {
    const { id } = req.params;

    const tipo = await prisma.tipoEvento.findUnique({ where: { id } });
    if (!tipo) {
      return res
        .status(404)
        .json({ success: false, message: "Tipo de evento não encontrado" });
    }

    if (tipo.ativo) {
      return res
        .status(400)
        .json({ success: false, message: "Este tipo já está ativo" });
    }

    await prisma.tipoEvento.update({
      where: { id },
      data: { ativo: true },
    });

    res.json({
      success: true,
      message: "Tipo de evento reativado com sucesso",
    });
  } catch (error) {
    console.error("[TipoEvento] Erro ao reativar tipo:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao reativar tipo de evento",
        error: error.message,
      });
  }
};

/**
 * GET /api/tipos-evento/admin/resumo
 * Admin: resumo estatístico dos tipos de evento
 */
const resumoTipos = async (req, res) => {
  try {
    const todos = await prisma.tipoEvento.findMany({
      include: {
        _count: {
          select: {
            eventos: true,
            obrigacoes: true,
          },
        },
      },
    });

    const resumo = todos.map((tipo) => ({
      id: tipo.id,
      nome: tipo.nome,
      label: tipo.label,
      cor: tipo.cor,
      icone: tipo.icone,
      ativo: tipo.ativo,
      ehPadrao: tipo.ehPadrao,
      totalVinculos: tipo._count.eventos + tipo._count.obrigacoes,
      eventos: tipo._count.eventos,
      obrigacoes: tipo._count.obrigacoes,
    }));

    const totalAtivos = todos.filter((t) => t.ativo).length;
    const totalInativos = todos.filter((t) => !t.ativo).length;

    res.json({
      success: true,
      resumo,
      estatisticas: {
        totalTipos: todos.length,
        ativos: totalAtivos,
        inativos: totalInativos,
        tiposPadrao: todos.filter((t) => t.ehPadrao).length,
      },
    });
  } catch (error) {
    console.error("[TipoEvento] Erro ao gerar resumo:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Erro ao gerar resumo dos tipos",
        error: error.message,
      });
  }
};

module.exports = {
  listarTipos,
  listarTiposAdmin,
  obterTipo,
  criarTipo,
  atualizarTipo,
  desativarTipo,
  reativarTipo,
  resumoTipos,
};
