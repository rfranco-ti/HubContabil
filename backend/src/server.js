require("dotenv").config();
const { createApp, connectDatabase } = require("./app");
const prisma = require("./config/prisma");
const cron = require("node-cron");
const {
  processarNotificacoesCalendario,
} = require("./services/notificacaoService");
const {
  processarVencimentoCertificados,
} = require("./services/cronCertificados");

const PORT = process.env.PORT || 3000;

/**
 * Iniciar servidor
 */
async function startServer() {
  // Conectar ao banco de dados
  await connectDatabase();

  // Iniciar Fila de background (pg-boss)
  const { startQueue, boss } = require('./services/queueService');
  const { startWorkers } = require('./workers/documentOptimizationWorker');
  try {
    await startQueue();
    await startWorkers();
  } catch(e) {
    console.error("[Queue] Erro ao iniciar fila:", e.message);
  }

  // Criar aplicação
  const app = createApp();

  // Iniciar servidor
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}`);
    console.log(`📚 Documentação: http://localhost:${PORT}/api-docs\n`);
    console.log("⏳ Pressione Ctrl+C para parar o servidor\n");
  });

  // ===================== CRON JOBS =====================
  // Processar notificações do calendário a cada hora
  cron.schedule(
    "0 * * * *",
    async () => {
      console.log("[Cron] Processando notificações do calendário...");
      try {
        const resultado = await processarNotificacoesCalendario();
        if (resultado) {
          console.log(
            `[Cron] ${resultado.criadas} notificações criadas, ${resultado.expiradas} removidas`,
          );
        }
      } catch (error) {
        console.error("[Cron] Erro ao processar notificações:", error);
      }
    },
    {
      timezone: "America/Sao_Paulo",
    },
  );

  // Processar vencimentos de certificados a cada hora
  cron.schedule(
    "0 * * * *",
    async () => {
      console.log("[Cron] Verificando vencimentos de certificados...");
      try {
        const resultado = await processarVencimentoCertificados();
        if (resultado && resultado.criadas > 0) {
          console.log(`[Cron] ${resultado.criadas} notificações de certificados criadas.`);
        }
      } catch (error) {
        console.error("[Cron] Erro ao processar certificados:", error);
      }
    },
    {
      timezone: "America/Sao_Paulo",
    },
  );

  // Executar uma vez ao iniciar para testar
  console.log("[Cron] Executando processamento inicial de notificações...");
  processarNotificacoesCalendario()
    .then((resultado) => {
      if (resultado) {
        console.log(
          `[Cron] Inicial: ${resultado.criadas} notificações criadas, ${resultado.expiradas} removidas`,
        );
      }
    })
    .catch((err) =>
      console.error("[Cron] Erro no processamento inicial:", err.message),
    );

  console.log("[Cron] Executando verificação inicial de certificados...");
  processarVencimentoCertificados()
    .then((resultado) => {
      if (resultado && resultado.criadas > 0) {
        console.log(`[Cron] Inicial: ${resultado.criadas} notificações de certificados criadas.`);
      }
    })
    .catch((err) =>
      console.error("[Cron] Erro na verificação inicial de certificados:", err.message),
    );

  // Graceful shutdown - apenas sinais explícitos
  const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} recebido. Iniciando shutdown...`);

    // Fechar servidor HTTP
    server.close(async () => {
      console.log("✅ Servidor HTTP fechado");

      // Desconectar fila
      const { boss } = require('./services/queueService');
      if (boss) await boss.stop().catch(() => {});
      console.log("✅ Fila (pg-boss) parada");

      // Desconectar do banco
      await prisma.$disconnect();
      console.log("✅ Conexão com banco fechada");

      process.exit(0);
    });

    // Forçar shutdown após 10s
    setTimeout(() => {
      console.error("⚠️  Forçando shutdown...");
      process.exit(1);
    }, 10000);
  };

  // Capturar sinais de término (apenas estes)
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Remover beforeExit para evitar fechamento prematuro
  // process.on('beforeExit', ...); // REMOVIDO

  // Manter processo ativo - handle de erros não capturados
  process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    gracefulShutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown("unhandledRejection");
  });

  console.log(`✅ Server process PID: ${process.pid}`);

  return server;
}

// Iniciar se não estiver em teste
if (require.main === module) {
  console.log("\n📦 Iniciando servidor backend...");
  startServer().catch((err) => {
    console.error("❌ Erro ao iniciar servidor:", err);
    process.exit(1);
  });
}

module.exports = { startServer };
