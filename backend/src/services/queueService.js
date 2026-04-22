const PgBoss = require('pg-boss');

const boss = new PgBoss({
  connectionString: process.env.DATABASE_URL,
  application_name: 'hubcontabil-pgboss'
});

boss.on('error', error => console.error('[PgBoss] Erro:', error));

async function startQueue() {
  await boss.start();
  console.log('[PgBoss] Fila de processamento iniciada.');
}

async function enqueueDocumentOptimization(documentoId) {
  const jobId = await boss.send('optimize-document', { documentoId }, {
    retryLimit: 3,
    retryDelay: 60 // 1 minute
  });
  console.log(`[PgBoss] Job criado para documento ${documentoId}: ${jobId}`);
  return jobId;
}

module.exports = {
  boss,
  startQueue,
  enqueueDocumentOptimization
};
