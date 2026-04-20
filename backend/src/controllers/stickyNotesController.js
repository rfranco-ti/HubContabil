const prisma = require('../config/prisma');
const notificacaoService = require('../services/notificacaoService');

// GET /api/notas - Listar notas do usuário
async function listarNotas(req, res) {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const notas = await prisma.stickyNote.findMany({
      where: { usuarioId },
      orderBy: { ordem: 'asc' },
    });

    return res.json({ success: true, data: notas });
  } catch (error) {
    console.error('Erro ao listar notas:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
}

// POST /api/notas - Criar nota
async function criarNota(req, res) {
  try {
    const usuarioId = req.usuario?.id;
    const { titulo, conteudo, cor, lembrete, dataLembrete, fixada, dataFixacao, pastaId } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    // Validação
    if (!titulo || titulo.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Título é obrigatório' });
    }

    // Obter maior ordem para posicionar no final
    const ultimaNota = await prisma.stickyNote.findFirst({
      where: { usuarioId },
      orderBy: { ordem: 'desc' },
      select: { ordem: true },
    });

    const novaOrdem = ultimaNota ? ultimaNota.ordem + 1 : 0;

    const nota = await prisma.stickyNote.create({
      data: {
        usuarioId,
        titulo: titulo.trim(),
        conteudo: conteudo?.trim() || null,
        cor: cor || 'yellow',
        ordem: novaOrdem,
        lembrete: lembrete || false,
        dataLembrete: dataLembrete || null,
        fixada: fixada || false,
        dataFixacao: dataFixacao || null,
        pastaId: pastaId || null,
      },
    });

    return res.status(201).json({ success: true, data: nota });
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
}

// PUT /api/notas/:id - Atualizar nota
async function atualizarNota(req, res) {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;
    const { titulo, conteudo, cor, ordem, lembrete, dataLembrete, fixada, dataFixacao, pastaId } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    // Verificar se a nota existe e pertence ao usuário
    const notaExistente = await prisma.stickyNote.findFirst({
      where: { id, usuarioId },
    });

    if (!notaExistente) {
      return res.status(404).json({ success: false, error: 'Nota não encontrada' });
    }

    // Validação
    if (titulo && titulo.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Título não pode ser vazio' });
    }

    const nota = await prisma.stickyNote.update({
      where: { id },
      data: {
        ...(titulo && { titulo: titulo.trim() }),
        ...(conteudo !== undefined && { conteudo: conteudo.trim() || null }),
        ...(cor && { cor }),
        ...(ordem !== undefined && { ordem }),
        ...(lembrete !== undefined && { lembrete }),
        ...(dataLembrete !== undefined && { dataLembrete }),
        ...(fixada !== undefined && { fixada }),
        ...(dataFixacao !== undefined && { dataFixacao }),
        ...(pastaId !== undefined && { pastaId }),
      },
    });

    // Se lembrete foi ativado, criar notificação
    if (lembrete === true && notaExistente.lembrete === false) {
      try {
        await notificacaoService.criarNotificacaoLembrete(
          usuarioId,
          nota.id,
          nota.titulo,
          nota.conteudo
        );
      } catch (notifError) {
        console.error('Erro ao criar notificação de lembrete:', notifError);
        // Não falhar a operação se notificação falhar
      }
    }

    // Se lembrete foi desativado, remover notificação
    if (lembrete === false && notaExistente.lembrete === true) {
      try {
        await notificacaoService.removerNotificacaoLembrete(usuarioId, nota.id);
      } catch (notifError) {
        console.error('Erro ao remover notificação de lembrete:', notifError);
      }
    }

    return res.json({ success: true, data: nota });
  } catch (error) {
    console.error('Erro ao atualizar nota:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
}

// DELETE /api/notas/:id - Excluir nota
async function excluirNota(req, res) {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    // Verificar se a nota existe e pertence ao usuário
    const notaExistente = await prisma.stickyNote.findFirst({
      where: { id, usuarioId },
    });

    if (!notaExistente) {
      return res.status(404).json({ success: false, error: 'Nota não encontrada' });
    }

    await prisma.stickyNote.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'Nota excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir nota:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
}

// PATCH /api/notas/reordenar - Reordenar notas
async function reordenarNotas(req, res) {
  try {
    const usuarioId = req.usuario?.id;
    const { notas } = req.body; // Array de { id, ordem }

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    if (!Array.isArray(notas)) {
      return res.status(400).json({ success: false, error: 'Formato inválido' });
    }

    // Executar atualizações em transação
    await prisma.$transaction(
      notas.map((nota) =>
        prisma.stickyNote.updateMany({
          where: { id: nota.id, usuarioId },
          data: { ordem: nota.ordem },
        })
      )
    );

    return res.json({ success: true, message: 'Notas reordenadas com sucesso' });
  } catch (error) {
    console.error('Erro ao reordenar notas:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
}

module.exports = {
  listarNotas,
  criarNota,
  atualizarNota,
  excluirNota,
  reordenarNotas,
};
