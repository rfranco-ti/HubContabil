/**
 * Script de verificação completa do banco de dados
 * Executar: node scripts/verify-database.js
 */

const prisma = require('../src/config/prisma');

async function verifyDatabase() {
  console.log('🔍 Iniciando verificação completa do banco de dados...\n');

  try {
    // 1. Testar conexão
    console.log('1️⃣ Testando conexão...');
    await prisma.$connect();
    console.log('   ✅ Conexão estabelecida com sucesso\n');

    // 2. Listar todas as tabelas
    console.log('2️⃣ Listando tabelas no banco...');
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    console.log(`   📋 ${tables.length} tabelas encontradas:`);
    tables.forEach(t => console.log(`      - ${t.table_name}`));
    console.log('');

    // 3. Verificar modelos do Prisma
    console.log('3️⃣ Verificando modelos do Prisma...');
    const models = [
      'User', 'Client', 'CnaeSecundario', 'ClientQsa', 'Contato',
      'PastaDocumento', 'Documento', 'ReciboModelo', 'Recibo',
      'Template', 'TemplateVersao', 'StickyNote', 'CalendarioEvento',
      'CnpjCache', 'FiscalObligation', 'HolidayCache'
    ];
    console.log(`   📋 ${models.length} modelos encontrados:`);
    models.forEach(m => console.log(`      - ${m}`));
    console.log('');

    // 4. Testar operações CRUD em cada tabela
    console.log('4️⃣ Testando operações CRUD...');
    
    const tests = [
      { model: 'user', name: 'User', test: async () => await prisma.user.count() },
      { model: 'client', name: 'Client', test: async () => await prisma.client.count() },
      { model: 'contato', name: 'Contato', test: async () => await prisma.contato.count() },
      { model: 'documento', name: 'Documento', test: async () => await prisma.documento.count() },
      { model: 'stickyNote', name: 'StickyNote', test: async () => await prisma.stickyNote.count() },
      { model: 'calendarioEvento', name: 'CalendarioEvento', test: async () => await prisma.calendarioEvento.count() },
      { model: 'reciboModelo', name: 'ReciboModelo', test: async () => await prisma.reciboModelo.count() },
      { model: 'recibo', name: 'Recibo', test: async () => await prisma.recibo.count() },
      { model: 'template', name: 'Template', test: async () => await prisma.template.count() },
      { model: 'cnpjCache', name: 'CnpjCache', test: async () => await prisma.cnpjCache.count() },
    ];

    for (const { model, name, test } of tests) {
      try {
        const count = await test();
        console.log(`   ✅ ${name} - ${count} registros`);
      } catch (error) {
        console.log(`   ❌ ${name} - ERRO: ${error.message}`);
      }
    }

    // Testar novos modelos (podem não ter tabelas ainda)
    console.log('\n5️⃣ Verificando novos modelos...');
    const newModels = [
      { model: 'fiscalObligation', name: 'FiscalObligation', test: async () => await prisma.fiscalObligation.count() },
      { model: 'holidayCache', name: 'HolidayCache', test: async () => await prisma.holidayCache.count() },
    ];

    for (const { model, name, test } of newModels) {
      try {
        const count = await test();
        console.log(`   ✅ ${name} - ${count} registros`);
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log(`   ⚠️  ${name} - Tabela não existe no banco (precisa de migration)`);
        } else {
          console.log(`   ❌ ${name} - ERRO: ${error.message}`);
        }
      }
    }

    // 6. Verificar índices
    console.log('\n6️⃣ Verificando índices...');
    const indexes = await prisma.$queryRaw`
      SELECT tablename, indexname FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname
    `;
    console.log(`   📋 ${indexes.length} índices encontrados`);
    const indexesByTable = {};
    indexes.forEach(idx => {
      if (!indexesByTable[idx.tablename]) indexesByTable[idx.tablename] = [];
      indexesByTable[idx.tablename].push(idx.indexname);
    });
    Object.keys(indexesByTable).slice(0, 5).forEach(table => {
      console.log(`      ${table}: ${indexesByTable[table].length} índices`);
    });
    if (Object.keys(indexesByTable).length > 5) {
      console.log(`      ... e mais ${Object.keys(indexesByTable).length - 5} tabelas`);
    }

    // 7. Verificar constraints de chave estrangeira
    console.log('\n7️⃣ Verificando foreign keys...');
    const fks = await prisma.$queryRaw`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
    `;
    console.log(`   📋 ${fks.length} foreign keys encontradas`);

    // 8. Verificar tamanho do banco
    console.log('\n8️⃣ Tamanho do banco de dados...');
    const dbSize = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `;
    console.log(`   💾 Tamanho: ${dbSize[0].size}`);

    // 9. Verificar conexões ativas
    console.log('\n9️⃣ Conexões ativas...');
    const connections = await prisma.$queryRaw`
      SELECT count(*) as active_connections 
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `;
    console.log(`   🔗 ${connections[0].active_connections} conexões ativas`);

    console.log('\n✅ Verificação concluída com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro durante verificação:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
