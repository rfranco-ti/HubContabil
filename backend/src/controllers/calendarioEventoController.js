const prisma = require('../config/prisma');

// GET /api/calendario/eventos
const getEventosUsuario = async (req, res) => {
  try {
    console.log('=== GET /api/calendario/eventos ===');
    console.log('Headers:', req.headers.authorization ? 'Token presente' : 'Sem token');
    console.log('Usuário:', req.usuario);
    
    const userId = req.usuario?.id;
    if (!userId) {
      console.log('ERRO: usuário não autenticado');
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }

    console.log('Buscando eventos para usuário:', userId);

    const eventos = await prisma.calendarioEvento.findMany({
      where: { usuarioId: userId },
      include: { tipo: true },
      orderBy: { data: 'asc' }
    });

    console.log('Eventos encontrados:', eventos.length);

    const eventosFormatados = eventos.map(e => ({
      id: e.id,
      titulo: e.titulo,
      descricao: e.descricao,
      data: e.data.toISOString().split('T')[0],
      tipoId: e.tipoId,
      tipoNome: e.tipo?.label || e.tipo?.nome,
      tipoCor: e.tipo?.cor || e.cor,
      tipoIcone: e.tipo?.icone || '📅',
      cor: e.cor,
      lembrete: e.lembrete,
      uf: e.uf,
      municipio: e.municipio,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    }));

    console.log('Retornando eventos formatados');
    res.json({ success: true, data: eventosFormatados });
  } catch (error) {
    console.error('❌ ERRO ao buscar eventos:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ success: false, message: 'Erro ao buscar eventos', error: error.message });
  }
};

// POST /api/calendario/eventos
const criarEvento = async (req, res) => {
  try {
    console.log('\n=== POST /api/calendario/eventos - CRIAR EVENTO ===');
    
    const userId = req.usuario?.id;
    if (!userId) {
      console.log('ERRO: usuário não autenticado');
      return res.status(401).json({ success: false, message: 'Não autenticado' });
    }
    console.log('Usuário ID:', userId);

    const { titulo, descricao, data, tipoId, uf, municipio, lembrete } = req.body;
    console.log('Body recebido:', { titulo, descricao, data, tipoId, uf, municipio, lembrete });
    
    if (!titulo || !data || !tipoId) {
      console.log('ERRO: campos obrigatórios faltando');
      return res.status(400).json({ 
        success: false, 
        message: 'Título, data e tipo são obrigatórios',
        received: { titulo: !!titulo, data: !!data, tipoId: !!tipoId }
      });
    }

    // Validar tipo
    console.log('Validando tipo:', tipoId);
    const tipo = await prisma.tipoEvento.findUnique({ where: { id: tipoId } });
    if (!tipo) {
      console.log('ERRO: tipo não encontrado');
      return res.status(400).json({ success: false, message: 'Tipo de evento não encontrado' });
    }
    if (!tipo.ativo) {
      console.log('ERRO: tipo inativo');
      return res.status(400).json({ success: false, message: 'Tipo de evento inativo' });
    }
    console.log('Tipo válido:', tipo.label, '| Cor:', tipo.cor);

    const [ano, mes, dia] = data.split('-').map(Number);
    console.log('Data parseada:', { ano, mes, dia });
    
    const dataUTC = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));
    console.log('Data UTC:', dataUTC);

    console.log('Criando evento no banco...');
    const evento = await prisma.calendarioEvento.create({
      data: {
        titulo,
        descricao: descricao || null,
        data: dataUTC,
        tipoId,
        cor: tipo.cor,
        lembrete: lembrete || false,
        uf: uf || null,
        municipio: municipio || null,
        usuarioId: userId
      },
      include: { tipo: true }
    });

    console.log('✅ Evento criado com sucesso! ID:', evento.id);

    res.status(201).json({
      success: true,
      data: {
        ...evento,
        data: evento.data.toISOString().split('T')[0],
        tipoNome: evento.tipo?.label,
        tipoCor: evento.tipo?.cor,
        tipoIcone: evento.tipo?.icone
      },
      message: 'Evento criado com sucesso'
    });
  } catch (error) {
    console.error('❌ ERRO ao criar evento:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, message: 'Erro ao criar evento', error: error.message });
  }
};

// PUT /api/calendario/eventos/:id
const atualizarEvento = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const existente = await prisma.calendarioEvento.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ success: false, message: 'Não encontrado' });
    if (existente.usuarioId !== userId) return res.status(403).json({ success: false, message: 'Sem permissão' });

    const { titulo, descricao, data, tipoId, uf, municipio, lembrete } = req.body;
    const dataBase = data || existente.data.toISOString().split('T')[0];
    const [ano, mes, dia] = dataBase.split('-').map(Number);
    const dataUTC = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));

    let tipo = existente.tipoId ? await prisma.tipoEvento.findUnique({ where: { id: existente.tipoId } }) : null;
    if (tipoId && tipoId !== existente.tipoId) {
      tipo = await prisma.tipoEvento.findUnique({ where: { id: tipoId } });
      if (!tipo || !tipo.ativo) return res.status(400).json({ success: false, message: 'Tipo inválido' });
    }

    const atualizado = await prisma.calendarioEvento.update({
      where: { id },
      data: {
        titulo: titulo ?? existente.titulo,
        descricao: descricao ?? existente.descricao,
        data: dataUTC,
        tipoId: tipoId ?? existente.tipoId,
        cor: tipo?.cor ?? existente.cor,
        lembrete: lembrete ?? existente.lembrete,
        uf: uf ?? existente.uf,
        municipio: municipio ?? existente.municipio
      },
      include: { tipo: true }
    });

    res.json({
      success: true,
      data: {
        ...atualizado,
        data: atualizado.data.toISOString().split('T')[0],
        tipoNome: atualizado.tipo?.label,
        tipoCor: atualizado.tipo?.cor,
        tipoIcone: atualizado.tipo?.icone
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar evento', error: error.message });
  }
};

// DELETE /api/calendario/eventos/:id
const excluirEvento = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const existente = await prisma.calendarioEvento.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ success: false, message: 'Não encontrado' });
    if (existente.usuarioId !== userId) return res.status(403).json({ success: false, message: 'Sem permissão' });

    await prisma.calendarioEvento.delete({ where: { id } });
    res.json({ success: true, message: 'Evento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir evento', error: error.message });
  }
};

module.exports = { getEventosUsuario, criarEvento, atualizarEvento, excluirEvento };
