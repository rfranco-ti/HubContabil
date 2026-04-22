const prisma = require("../config/prisma");

const ALERTA_RANGES = [
  { minHours: 71, maxHours: 72, tipo: "TRES_DIAS_ANTES", label: "72 horas" },
  { minHours: 47, maxHours: 48, tipo: "DOIS_DIAS_ANTES", label: "48 horas" },
  { minHours: 23, maxHours: 24, tipo: "UM_DIA_ANTE", label: "24 horas" },
  { minHours: 11, maxHours: 12, tipo: "DOZE_HORAS_ANTES", label: "12 horas" },
];

async function processarVencimentoCertificados() {
  console.log("[Cron Certificados] Verificando vencimentos de certificados...");
  let criadas = 0;

  try {
    const agora = new Date();
    
    // Buscar clientes ativos com vencimento de certificado preenchido
    const clientes = await prisma.client.findMany({
      where: {
        status: "Ativo",
        certificadoVencimento: { not: null },
      },
      include: {
        usuarioResponsavel: true,
      },
    });

    // Se não tiver responsável, buscar administrador padrão (o primeiro encontrado)
    let adminPadrao = null;

    for (const cliente of clientes) {
      const diffMs = cliente.certificadoVencimento.getTime() - agora.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // Se o certificado já venceu, podemos ignorar ou gerar um alerta "NO_DIA", 
      // mas vamos focar nas horas anteriores como pedido.

      for (const range of ALERTA_RANGES) {
        if (diffHours > range.minHours && diffHours <= range.maxHours) {
          // Verificar se já geramos essa notificação para evitar duplicação (em caso de reinício do servidor, etc)
          const jaNotificou = await prisma.notificacao.findFirst({
            where: {
              titulo: { startsWith: `[Certificado Digital]` },
              tipoAlerta: range.tipo,
              metadata: {
                path: ['clientId'],
                equals: cliente.id
              }
            }
          });

          if (!jaNotificou) {
            let usuarioId = cliente.usuarioResponsavelId;

            // Tentar obter um administrador caso o cliente não tenha responsável
            if (!usuarioId) {
              if (!adminPadrao) {
                adminPadrao = await prisma.user.findFirst({ where: { cargo: "Administrador" } });
              }
              usuarioId = adminPadrao?.id;
            }

            if (usuarioId) {
              await prisma.notificacao.create({
                data: {
                  usuarioId,
                  titulo: `[Certificado Digital] Vencendo em ${range.label}`,
                  mensagem: `O certificado digital do cliente ${cliente.razaoSocial} (CNPJ: ${cliente.cnpj}) irá vencer em aproximadamente ${range.label}. Data oficial: ${cliente.certificadoVencimento.toLocaleDateString('pt-BR')}`,
                  tipoAlerta: range.tipo,
                  metadata: {
                    clientId: cliente.id,
                    cnpj: cliente.cnpj,
                    tipoNotificacao: "vencimento_certificado"
                  }
                }
              });
              criadas++;
              console.log(`[Cron Certificados] Notificação de ${range.label} gerada para o cliente ${cliente.razaoSocial}`);
            }
          }
        }
      }
    }

    return { criadas };
  } catch (error) {
    console.error("[Cron Certificados] Erro ao processar certificados:", error);
    throw error;
  }
}

module.exports = {
  processarVencimentoCertificados
};
