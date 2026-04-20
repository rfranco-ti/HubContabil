const prisma = require('../config/prisma');

/**
 * GET /api/agendamentos
 * Listar todos os agendamentos do usuário
 */
const listarAgendamentos = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const agendamentos = await prisma.agendamentoRpa.findMany({
      where: { usuarioId: userId },
      include: { criadoPor: { select: { id: true, nome: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const formatados = agendamentos.map(a => ({
      ...a,
      proximaExecucao: a.proximaExecucao ? a.proximaExecucao.toISOString() : null,
      diasSemanaList: a.diasSemana ? diasSemanaParaTexto(a.diasSemana) : null
    }));

    res.json({ success: true, data: formatados });
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar agendamentos', error: error.message });
  }
};

/**
 * POST /api/agendamentos
 * Criar novo agendamento
 */
const criarAgendamento = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const { nome, tipoRobo, cnpj, recorrencia, diasSemana, horaExecucao, vezesPorDia, vezesPorSemana, ativo } = req.body;

    if (!nome || !tipoRobo || !cnpj || !recorrencia || !horaExecucao) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios: nome, tipoRobo, cnpj, recorrencia, horaExecucao'
      });
    }

    // Validar tipo de robô
    const tiposValidos = ['SIMPLES_NACIONAL', 'SEFAZ_BA'];
    if (!tiposValidos.includes(tipoRobo)) {
      return res.status(400).json({ success: false, message: 'Tipo de robô inválido' });
    }

    // Validar recorrência
    const recorrenciasValidas = ['unica', 'diaria', 'semanal', 'mensal', 'x_vezes_dia', 'x_vezes_semana'];
    if (!recorrenciasValidas.includes(recorrencia)) {
      return res.status(400).json({ success: false, message: 'Recorrência inválida' });
    }

    // Calcular próxima execução
    const proximaExecucao = calcularProximaExecucao(recorrencia, horaExecucao, diasSemana);

    const agendamento = await prisma.agendamentoRpa.create({
      data: {
        nome,
        tipoRobo,
        cnpj: cnpj.replace(/\D/g, ''),
        recorrencia,
        diasSemana: diasSemana || null,
        horaExecucao,
        vezesPorDia: vezesPorDia || 1,
        vezesPorSemana: vezesPorSemana || 0,
        proximaExecucao,
        ativo: ativo !== false,
        usuarioId: userId,
        criadoPorId: userId
      },
      include: { criadoPor: { select: { id: true, nome: true, email: true } } }
    });

    res.status(201).json({
      success: true,
      data: {
        ...agendamento,
        proximaExecucao: agendamento.proximaExecucao.toISOString(),
        diasSemanaList: agendamento.diasSemana ? diasSemanaParaTexto(agendamento.diasSemana) : null
      },
      message: 'Agendamento criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar agendamento', error: error.message });
  }
};

/**
 * PUT /api/agendamentos/:id
 * Atualizar agendamento
 */
const atualizarAgendamento = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const existente = await prisma.agendamentoRpa.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
    if (existente.usuarioId !== userId) return res.status(403).json({ success: false, message: 'Sem permissão' });

    const { nome, tipoRobo, cnpj, recorrencia, diasSemana, horaExecucao, vezesPorDia, vezesPorSemana, ativo } = req.body;

    const dadosAtualizacao = {};
    if (nome) dadosAtualizacao.nome = nome;
    if (tipoRobo) dadosAtualizacao.tipoRobo = tipoRobo;
    if (cnpj) dadosAtualizacao.cnpj = cnpj.replace(/\D/g, '');
    if (recorrencia) {
      dadosAtualizacao.recorrencia = recorrencia;
      dadosAtualizacao.proximaExecucao = calcularProximaExecucao(
        recorrencia,
        horaExecucao || existente.horaExecucao,
        diasSemana || existente.diasSemana
      );
    }
    if (diasSemana !== undefined) dadosAtualizacao.diasSemana = diasSemana;
    if (horaExecucao) dadosAtualizacao.horaExecucao = horaExecucao;
    if (vezesPorDia !== undefined) dadosAtualizacao.vezesPorDia = vezesPorDia;
    if (vezesPorSemana !== undefined) dadosAtualizacao.vezesPorSemana = vezesPorSemana;
    if (ativo !== undefined) dadosAtualizacao.ativo = ativo;

    const atualizado = await prisma.agendamentoRpa.update({
      where: { id },
      data: dadosAtualizacao,
      include: { criadoPor: { select: { id: true, nome: true, email: true } } }
    });

    res.json({
      success: true,
      data: {
        ...atualizado,
        proximaExecucao: atualizado.proximaExecucao.toISOString(),
        diasSemanaList: atualizado.diasSemana ? diasSemanaParaTexto(atualizado.diasSemana) : null
      },
      message: 'Agendamento atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar agendamento', error: error.message });
  }
};

/**
 * DELETE /api/agendamentos/:id
 * Excluir agendamento
 */
const excluirAgendamento = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const existente = await prisma.agendamentoRpa.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
    if (existente.usuarioId !== userId) return res.status(403).json({ success: false, message: 'Sem permissão' });

    await prisma.agendamentoRpa.delete({ where: { id } });
    res.json({ success: true, message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir agendamento', error: error.message });
  }
};

/**
 * POST /api/agendamentos/:id/executar
 * Executar agendamento manualmente
 */
const executarAgendamento = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const existente = await prisma.agendamentoRpa.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ success: false, message: 'Agendamento não encontrado' });
    if (existente.usuarioId !== userId) return res.status(403).json({ success: false, message: 'Sem permissão' });

    // Aqui no futuro integraremos com o serviço de RPA
    // Por enquanto, apenas simulamos a execução
    await prisma.agendamentoRpa.update({
      where: { id },
      data: {
        totalExecucoes: existente.totalExecucoes + 1,
        ultimoResultado: { status: 'simulado', mensagem: 'Execução simulada - integração futura', data: new Date().toISOString() }
      }
    });

    res.json({ success: true, message: 'Agendamento executado (simulado)' });
  } catch (error) {
    console.error('Erro ao executar agendamento:', error);
    res.status(500).json({ success: false, message: 'Erro ao executar agendamento', error: error.message });
  }
};

// ==================== Helpers ====================

function diasSemanaParaTexto(dias) {
  const diasMap = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  if (typeof dias === 'number') {
    // Single day as bit flag
    return diasMap[dias] || '';
  }
  if (Array.isArray(dias)) {
    return dias.map(d => diasMap[d]).join(', ');
  }
  // Bitmask
  const diasList = [];
  for (let i = 0; i < 7; i++) {
    if (dias & (1 << i)) {
      diasList.push(diasMap[i]);
    }
  }
  return diasList.join(', ');
}

function calcularProximaExecucao(recorrencia, horaExecucao, diasSemana) {
  if (!horaExecucao) return null;

  const [hora, minuto] = horaExecucao.split(':').map(Number);
  const agora = new Date();
  const proxima = new Date(agora);
  proxima.setHours(hora, minuto, 0, 0);

  // Se já passou hoje, avançar para amanhã
  if (proxima <= agora) {
    proxima.setDate(proxima.getDate() + 1);
  }

  // Para semanal, verificar dias da semana
  if (recorrencia === 'semanal' && diasSemana) {
    const diasArray = Array.isArray(diasSemana) ? diasSemana : [diasSemana];
    // Encontrar próximo dia válido
    for (let i = 0; i < 7; i++) {
      const diaTeste = new Date(proxima);
      diaTeste.setDate(proxima.getDate() + i);
      if (diasArray.includes(diaTeste.getDay())) {
        return diaTeste;
      }
    }
  }

  return proxima;
}

module.exports = {
  listarAgendamentos,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento,
  executarAgendamento
};
