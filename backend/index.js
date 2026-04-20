/**
 * Ponto de entrada principal da API
 * Este arquivo apenas delega para a nova estrutura em src/
 */

// Carregar variáveis de ambiente PRIMEIRO
require('dotenv').config();

const { startServer } = require('./src/server');

// Capturar erros não tratados
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', promise);
  console.error('Reason:', reason);
  if (reason instanceof Error) {
    console.error('Stack:', reason.stack);
  }
});

console.log('\n📦 Backend Hub Contábil - Iniciando...');
console.log('📝 Node.js version:', process.version);
console.log('📝 Platform:', process.platform);
console.log('📝 PID:', process.pid);
console.log('');

// Iniciar servidor
startServer().catch(err => {
  console.error('\n❌ Erro fatal ao iniciar servidor:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
});
