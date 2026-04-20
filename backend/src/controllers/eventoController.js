const prisma = require('../config/prisma');

/**
 * Controller para gestão de eventos do usuário
 * Usa o modelo CalendarioEvento (único modelo de eventos no sistema)
 */

/**
 * GET /api/eventos
 * Listar eventos do usuário
 */
const listarEventos = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const filtros = { usuarioId };

    if (dataInicio && dataFim) {
      filtros.data = {
        gte: new Date(dataInicio),
        lte: new Date(dataFim)
      };
    }

    const eventos = await prisma.calendarioEvento.findMany({
      where: filtros,
      orderBy: { data: 'asc' }
    });

    return res.json({
      success: true,
      data: eventos
    });
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao listar eventos'
    });
  }
};

/**
 * POST /api/eventos
 * Criar novo evento
 */
const criarEvento = async (req, res) => {
  try {
    const { titulo, descricao, data, horaInicio, horaFim, cor, tipo, isDiaInteiro, recorrencia } = req.body;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    if (!titulo || !data) {
      return res.status(400).json({
        success: false,
        error: 'Título e data são obrigatórios'
      });
    }

    const evento = await prisma.calendarioEvento.create({
      data: {
        titulo,
        descricao: descricao || null,
        data: new Date(data),
        horaInicio: horaInicio ? new Date(horaInicio) : null,
        horaFim: horaFim ? new Date(horaFim) : null,
        isDiaInteiro: isDiaInteiro || false,
        cor: cor || '#3b82f6',
        tipo: tipo || 'pessoal',
        recorrencia: recorrencia || null,
        usuarioId
      }
    });

    return res.status(201).json({
      success: true,
      data: evento
    });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao criar evento'
    });
  }
};

/**
 * PUT /api/eventos/:id
 * Atualizar evento
 */
const atualizarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, data, horaInicio, horaFim, cor, tipo, isDiaInteiro, recorrencia } = req.body;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    // Verificar se evento pertence ao usuário
    const eventoExistente = await prisma.calendarioEvento.findUnique({
      where: { id }
    });

    if (!eventoExistente) {
      return res.status(404).json({
        success: false,
        error: 'Evento não encontrado'
      });
    }

    if (eventoExistente.usuarioId !== usuarioId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão para editar este evento'
      });
    }

    const evento = await prisma.calendarioEvento.update({
      where: { id },
      data: {
        titulo: titulo !== undefined ? titulo : eventoExistente.titulo,
        descricao: descricao !== undefined ? descricao : eventoExistente.descricao,
        data: data ? new Date(data) : eventoExistente.data,
        horaInicio: horaInicio !== undefined ? (horaInicio ? new Date(horaInicio) : null) : eventoExistente.horaInicio,
        horaFim: horaFim !== undefined ? (horaFim ? new Date(horaFim) : null) : eventoExistente.horaFim,
        isDiaInteiro: isDiaInteiro !== undefined ? isDiaInteiro : eventoExistente.isDiaInteiro,
        cor: cor !== undefined ? cor : eventoExistente.cor,
        tipo: tipo !== undefined ? tipo : eventoExistente.tipo,
        recorrencia: recorrencia !== undefined ? recorrencia : eventoExistente.recorrencia
      }
    });

    return res.json({
      success: true,
      data: evento
    });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao atualizar evento'
    });
  }
};

/**
 * DELETE /api/eventos/:id
 * Excluir evento
 */
const excluirEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    // Verificar se evento pertence ao usuário
    const eventoExistente = await prisma.calendarioEvento.findUnique({
      where: { id }
    });

    if (!eventoExistente) {
      return res.status(404).json({
        success: false,
        error: 'Evento não encontrado'
      });
    }

    if (eventoExistente.usuarioId !== usuarioId) {
      return res.status(403).json({
        success: false,
        error: 'Sem permissão para excluir este evento'
      });
    }

    await prisma.calendarioEvento.delete({
      where: { id }
    });

    return res.json({
      success: true,
      message: 'Evento excluído com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao excluir evento'
    });
  }
};

module.exports = {
  listarEventos,
  criarEvento,
  atualizarEvento,
  excluirEvento
};
