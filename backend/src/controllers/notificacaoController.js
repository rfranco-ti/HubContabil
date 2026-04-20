const prisma = require('../config/prisma');

/**
 * GET /api/notificacoes/count
 * Contar notificações não lidas do usuário
 */
const contarNaoLidas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const count = await prisma.notificacao.count({
      where: {
        usuarioId,
        lida: false
      }
    });

    res.json({ success: true, count });
  } catch (error) {
    console.error('[Notificações] Erro ao contar não lidas:', error);
    res.status(500).json({ success: false, message: 'Erro ao contar notificações', error: error.message });
  }
};

/**
 * GET /api/notificacoes
 * Listar notificações não lidas (mais recentes primeiro)
 */
const listarNaoLidas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const notificacoes = await prisma.notificacao.findMany({
      where: {
        usuarioId,
        lida: false
      },
      orderBy: { dataEnvio: 'desc' },
      take: 50,
      include: {
        tipoEvento: {
          select: { nome: true, label: true, cor: true, icone: true }
        }
      }
    });

    res.json({ success: true, notificacoes, total: notificacoes.length });
  } catch (error) {
    console.error('[Notificações] Erro ao listar não lidas:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar notificações', error: error.message });
  }
};

/**
 * GET /api/notificacoes/todas
 * Listar todas as notificações com paginação
 * Query: page (default 1), limit (default 20)
 */
const listarTodas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notificacoes, total] = await Promise.all([
      prisma.notificacao.findMany({
        where: { usuarioId },
        orderBy: { dataEnvio: 'desc' },
        skip,
        take: limit,
        include: {
          tipoEvento: {
            select: { nome: true, label: true, cor: true, icone: true }
          }
        }
      }),
      prisma.notificacao.count({ where: { usuarioId } })
    ]);

    res.json({
      success: true,
      notificacoes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + notificacoes.length < total
      }
    });
  } catch (error) {
    console.error('[Notificações] Erro ao listar todas:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar notificações', error: error.message });
  }
};

/**
 * PUT /api/notificacoes/:id/lida
 * Marcar notificação como lida
 */
const marcarComoLida = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const notificacao = await prisma.notificacao.findFirst({
      where: { id, usuarioId }
    });

    if (!notificacao) {
      return res.status(404).json({ success: false, message: 'Notificação não encontrada' });
    }

    await prisma.notificacao.update({
      where: { id },
      data: { lida: true }
    });

    res.json({ success: true, message: 'Notificação marcada como lida' });
  } catch (error) {
    console.error('[Notificações] Erro ao marcar como lida:', error);
    res.status(500).json({ success: false, message: 'Erro ao marcar notificação', error: error.message });
  }
};

/**
 * PUT /api/notificacoes/lidar-todas
 * Marcar todas as notificações como lidas
 */
const marcarTodasComoLidas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    await prisma.notificacao.updateMany({
      where: { usuarioId, lida: false },
      data: { lida: true }
    });

    res.json({ success: true, message: 'Todas as notificações marcadas como lidas' });
  } catch (error) {
    console.error('[Notificações] Erro ao marcar todas como lidas:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar notificações', error: error.message });
  }
};

/**
 * DELETE /api/notificacoes/:id
 * Deletar notificação
 */
const deletarNotificacao = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;

    const notificacao = await prisma.notificacao.findFirst({
      where: { id, usuarioId }
    });

    if (!notificacao) {
      return res.status(404).json({ success: false, message: 'Notificação não encontrada' });
    }

    await prisma.notificacao.delete({ where: { id } });

    res.json({ success: true, message: 'Notificação removida' });
  } catch (error) {
    console.error('[Notificações] Erro ao deletar notificação:', error);
    res.status(500).json({ success: false, message: 'Erro ao remover notificação', error: error.message });
  }
};

/**
 * GET /api/notificacoes/resumo
 * Resumo: contagem por tipo de alerta
 */
const resumo = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const [total, naoLidas, umDiaAnte, noDia] = await Promise.all([
      prisma.notificacao.count({ where: { usuarioId } }),
      prisma.notificacao.count({ where: { usuarioId, lida: false } }),
      prisma.notificacao.count({ where: { usuarioId, lida: false, tipoAlerta: 'UM_DIA_ANTE' } }),
      prisma.notificacao.count({ where: { usuarioId, lida: false, tipoAlerta: 'NO_DIA' } })
    ]);

    res.json({
      success: true,
      resumo: { total, naoLidas, umDiaAnte, noDia }
    });
  } catch (error) {
    console.error('[Notificações] Erro ao gerar resumo:', error);
    res.status(500).json({ success: false, message: 'Erro ao gerar resumo', error: error.message });
  }
};

module.exports = {
  contarNaoLidas,
  listarNaoLidas,
  listarTodas,
  marcarComoLida,
  marcarTodasComoLidas,
  deletarNotificacao,
  resumo
};
