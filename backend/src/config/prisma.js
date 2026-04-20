const { PrismaClient } = require('@prisma/client');

// Configurar Prisma Client com SSL para Supabase
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: ['error', 'warn'],
});

module.exports = prisma;
