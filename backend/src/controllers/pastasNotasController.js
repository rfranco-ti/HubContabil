const prisma = require('../config/prisma');

// GET /api/notas/pastas - Listar pastas do usuário
async function listarPastas(req, res) {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const pastas = await prisma.pastaNota.findMany({
      where: { usuarioId },
      orderBy: { ordem: 'asc' },
    });

    return res.json({ success: true, data: pastas });
  } catch (error) {
    console.error('Erro ao listar pastas:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
}

// POST /api/notas/pastas - Criar pasta
async function criarPasta(req, res) {
  try {
    const usuarioId = req.usuario?.id;
    const { nome, cor } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    if (!nome || nome.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Nome é obrigatório' });
    }

    // Obter maior ordem
    const ultimaPasta = await prisma.pastaNota.findFirst({
      where: { usuarioId },
      orderBy: { ordem: 'desc' },
      select: { ordem: true },
    });

    const novaOrdem = ultimaPasta ? ultimaPasta.ordem + 1 : 0;

    const pasta = await prisma.pastaNota.create({
      data: {
        usuarioId,
        nome: nome.trim(),
        cor: cor || 'blue',
        ordem: novaOrdem,
      },
    });

    return res.status(201).json({ success: true, data: pasta });
  } catch (error) {
    console.error('Erro ao criar pasta:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
}

// PUT /api/notas/pastas/:id - Atualizar pasta
async function atualizarPasta(req, res) {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;
    const { nome, cor, ordem } = req.body;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const pastaExistente = await prisma.pastaNota.findFirst({
      where: { id, usuarioId },
    });

    if (!pastaExistente) {
      return res.status(404).json({ success: false, error: 'Pasta não encontrada' });
    }

    const pasta = await prisma.pastaNota.update({
      where: { id },
      data: {
        ...(nome && { nome: nome.trim() }),
        ...(cor && { cor }),
        ...(ordem !== undefined && { ordem }),
      },
    });

    return res.json({ success: true, data: pasta });
  } catch (error) {
    console.error('Erro ao atualizar pasta:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
}

// DELETE /api/notas/pastas/:id - Excluir pasta
async function excluirPasta(req, res) {
  try {
    const usuarioId = req.usuario?.id;
    const { id } = req.params;

    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    const pastaExistente = await prisma.pastaNota.findFirst({
      where: { id, usuarioId },
    });

    if (!pastaExistente) {
      return res.status(404).json({ success: false, error: 'Pasta não encontrada' });
    }

    await prisma.pastaNota.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'Pasta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir pasta:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
}

module.exports = {
  listarPastas,
  criarPasta,
  atualizarPasta,
  excluirPasta,
};
