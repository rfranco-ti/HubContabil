const prisma = require('../config/prisma');

/**
 * Serviço de processamento de notificações do calendário
 *
 * Lógica:
 * 1. Busca eventos para "amanhã" com lembrete=true → Cria notificação "UM_DIA_ANTE"
 * 2. Busca eventos para "hoje" → Cria notificação "NO_DIA"
 * 3. Notifica todos os usuários do sistema
 * 4. Limpa notificações expiradas
 */

/**
 * Processar notificações para eventos do calendário
 * Deve ser rodado a cada hora via cron job
 */
async function processarNotificacoesCalendario() {
  try {
    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    // Buscar todos os usuários ativos
    const usuarios = await prisma.user.findMany({
      select: { id: true, nome: true, email: true }
    });

    if (usuarios.length === 0) return;

    let notificacoesCriadas = 0;

    // ===================== NOTIFICAÇÕES "UM_DIA_ANTE" =====================
    // Eventos do usuário para amanhã
    const eventosAmanha = await prisma.calendarioEvento.findMany({
      where: {
        data: {
          gte: amanha,
          lt: new Date(amanha.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      include: { tipo: true }
    });

    for (const usuario of usuarios) {
      for (const evento of eventosAmanha) {
        // Criar notificação apenas se o evento é do próprio usuário ou é genérico
        if (evento.usuarioId !== usuario.id && evento.usuarioId !== null) continue;

        // Verificar se já existe notificação para este evento+tipo
        const existente = await prisma.notificacao.findFirst({
          where: {
            usuarioId: usuario.id,
            eventoId: evento.id,
            tipoAlerta: 'UM_DIA_ANTE'
          }
        });

        if (existente) continue;

        const tipoLabel = evento.tipo?.label || 'Evento';
        const tipoIcon = evento.tipo?.icone || '📅';

        await prisma.notificacao.create({
          data: {
            usuarioId: usuario.id,
            titulo: `${tipoIcon} ${evento.titulo}`,
            mensagem: `Lembrete: "${evento.titulo}" (${tipoLabel}) acontece amanhã`,
            eventoId: evento.id,
            tipoEventoId: evento.tipoId || null,
            tipoAlerta: 'UM_DIA_ANTE',
            dataExpiracao: new Date(agora.getTime() + 48 * 60 * 60 * 1000) // expira em 48h
          }
        });
        notificacoesCriadas++;
      }
    }

    // ===================== NOTIFICAÇÕES "NO_DIA" =====================
    // Eventos do usuário para hoje
    const eventosHoje = await prisma.calendarioEvento.findMany({
      where: {
        data: {
          gte: hoje,
          lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      include: { tipo: true }
    });

    for (const usuario of usuarios) {
      for (const evento of eventosHoje) {
        if (evento.usuarioId !== usuario.id && evento.usuarioId !== null) continue;

        const existente = await prisma.notificacao.findFirst({
          where: {
            usuarioId: usuario.id,
            eventoId: evento.id,
            tipoAlerta: 'NO_DIA'
          }
        });

        if (existente) continue;

        const tipoLabel = evento.tipo?.label || 'Evento';
        const tipoIcon = evento.tipo?.icone || '📅';
        const dataFormatada = evento.data.toLocaleDateString('pt-BR');

        await prisma.notificacao.create({
          data: {
            usuarioId: usuario.id,
            titulo: `${tipoIcon} HOJE: ${evento.titulo}`,
            mensagem: `"${evento.titulo}" (${tipoLabel}) - ${dataFormatada}${evento.descricao ? ': ' + evento.descricao : ''}`,
            eventoId: evento.id,
            tipoEventoId: evento.tipoId || null,
            tipoAlerta: 'NO_DIA',
            dataExpiracao: new Date(agora.getTime() + 24 * 60 * 60 * 1000) // expira em 24h
          }
        });
        notificacoesCriadas++;
      }
    }

    // ===================== NOTIFICAÇÕES DE FERIADOS =====================
    // Feriados para amanhã
    const feriadosAmanha = await prisma.calendarioFeriado.findMany({
      where: {
        data: {
          gte: amanha,
          lt: new Date(amanha.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    for (const usuario of usuarios) {
      for (const feriado of feriadosAmanha) {
        const existente = await prisma.notificacao.findFirst({
          where: {
            usuarioId: usuario.id,
            eventoId: feriado.id,
            tipoAlerta: 'UM_DIA_ANTE'
          }
        });

        if (existente) continue;

        const abrLabel = feriado.abrangencia === 'NACIONAL' ? '' :
                         feriado.abrangencia === 'ESTADUAL' ? ` (${feriado.uf})` :
                         ` (${feriado.municipio}/${feriado.uf})`;

        await prisma.notificacao.create({
          data: {
            usuarioId: usuario.id,
            titulo: `🇧🇷 Feriado amanhã: ${feriado.nome}`,
            mensagem: `${feriado.nome}${abrLabel} - Amanhã é feriado`,
            eventoId: feriado.id,
            tipoEventoId: null, // vinculado ao tipo "feriado" se necessário
            tipoAlerta: 'UM_DIA_ANTE',
            metadata: { tipo: 'feriado', abrangencia: feriado.abrangencia },
            dataExpiracao: new Date(agora.getTime() + 48 * 60 * 60 * 1000)
          }
        });
        notificacoesCriadas++;
      }
    }

    // Feriados para hoje
    const feriadosHoje = await prisma.calendarioFeriado.findMany({
      where: {
        data: {
          gte: hoje,
          lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    for (const usuario of usuarios) {
      for (const feriado of feriadosHoje) {
        const existente = await prisma.notificacao.findFirst({
          where: {
            usuarioId: usuario.id,
            eventoId: feriado.id,
            tipoAlerta: 'NO_DIA'
          }
        });

        if (existente) continue;

        const abrLabel = feriado.abrangencia === 'NACIONAL' ? '' :
                         feriado.abrangencia === 'ESTADUAL' ? ` (${feriado.uf})` :
                         ` (${feriado.municipio}/${feriado.uf})`;

        await prisma.notificacao.create({
          data: {
            usuarioId: usuario.id,
            titulo: `🎉 FERIADO HOJE: ${feriado.nome}`,
            mensagem: `${feriado.nome}${abrLabel} - Hoje é feriado!`,
            eventoId: feriado.id,
            tipoEventoId: null,
            tipoAlerta: 'NO_DIA',
            metadata: { tipo: 'feriado', abrangencia: feriado.abrangencia },
            dataExpiracao: new Date(agora.getTime() + 24 * 60 * 60 * 1000)
          }
        });
        notificacoesCriadas++;
      }
    }

    // ===================== LIMPEZA DE NOTIFICAÇÕES EXPIRADAS =====================
    const { count } = await prisma.notificacao.deleteMany({
      where: {
        OR: [
          { dataExpiracao: { lt: agora } },
          { lida: true, createdAt: { lt: new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000) } } // lidas há mais de 7 dias
        ]
      }
    });

    if (notificacoesCriadas > 0 || count > 0) {
      console.log(`[Notificações] ${notificacoesCriadas} criadas, ${count} expiradas removidas`);
    }

    return { criadas: notificacoesCriadas, expiradas: count };

  } catch (error) {
    console.error('[Notificações] Erro ao processar notificações:', error);
    throw error;
  }
}

/**
 * Criar notificação para lembrete de nota (sticky note)
 * Chamado quando usuário marca uma nota como lembrete
 */
async function criarNotificacaoLembrete(usuarioId, notaId, tituloNota, conteudoNota) {
  try {
    // Verificar se já existe notificação para esta nota
    const existente = await prisma.notificacao.findFirst({
      where: {
        usuarioId,
        eventoId: notaId,
        tipoAlerta: 'NO_DIA'
      }
    });

    // Se já existe, não criar outra
    if (existente) {
      return existente;
    }

    // Criar notificação de lembrete
    const notificacao = await prisma.notificacao.create({
      data: {
        usuarioId,
        titulo: `📝 Lembrete: ${tituloNota}`,
        mensagem: conteudoNota || 'Nota sem conteúdo adicional',
        eventoId: notaId,
        tipoAlerta: 'NO_DIA',
        metadata: { 
          tipo: 'sticky_note',
          conteudo: conteudoNota 
        },
        dataExpiracao: new Date(Date.now() + 24 * 60 * 60 * 1000) // expira em 24h
      }
    });

    console.log(`[Notificações] Lembrete criado para nota: ${tituloNota}`);
    return notificacao;

  } catch (error) {
    console.error('[Notificações] Erro ao criar notificação de lembrete:', error);
    throw error;
  }
}

/**
 * Remover notificação de lembrete quando nota é desmarcada
 */
async function removerNotificacaoLembrete(usuarioId, notaId) {
  try {
    await prisma.notificacao.deleteMany({
      where: {
        usuarioId,
        eventoId: notaId,
        tipoAlerta: 'NO_DIA'
      }
    });

    console.log(`[Notificações] Lembrete removido para nota ID: ${notaId}`);
  } catch (error) {
    console.error('[Notificações] Erro ao remover notificação de lembrete:', error);
    throw error;
  }
}

module.exports = { 
  processarNotificacoesCalendario,
  criarNotificacaoLembrete,
  removerNotificacaoLembrete
};
