/**
 * Script para criar tabela de cache de CNPJ usando Prisma
 * 
 * Uso: node scripts/createCnpjCacheTablePrisma.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createCacheTable() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📦 Criando tabela cnpj_cache no Supabase\n');

  try {
    // Criar tabela usando SQL raw
    console.log('📋 Criando tabela cnpj_cache...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS cnpj_cache (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cnpj VARCHAR(14) UNIQUE NOT NULL,
        dados JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);
    console.log('✅ Tabela criada\n');

    // Criar índices
    console.log('📋 Criando índices...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_cnpj_cache_cnpj ON cnpj_cache(cnpj)
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_cnpj_cache_expires ON cnpj_cache(expires_at)
    `);
    console.log('✅ Índices criados\n');

    // Criar função de limpeza
    console.log('📋 Criando função de limpeza de cache expirado...');
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION limpar_cache_expirado()
      RETURNS INTEGER AS $$
      DECLARE
        deleted_count INTEGER;
      BEGIN
        DELETE FROM cnpj_cache
        WHERE expires_at < NOW();
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RETURN deleted_count;
      END;
      $$ LANGUAGE plpgsql
    `);
    console.log('✅ Função criada\n');

    // Verificar se tabela existe
    console.log('📋 Verificando tabela...');
    const result = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as total
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'cnpj_cache'
    `);

    if (result[0].total > 0) {
      console.log('✅ Tabela cnpj_cache existe e está pronta!\n');
    } else {
      console.log('❌ Tabela não foi encontrada\n');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Cache de CNPJ configurado com sucesso!\n');
    console.log('📊 Configuração:');
    console.log('   - TTL: 24 horas');
    console.log('   - Tabela: cnpj_cache');
    console.log('   - Índices: cnpj, expires_at');
    console.log('   - Função: limpar_cache_expirado()');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Detalhes:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createCacheTable();
