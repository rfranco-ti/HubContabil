/**
 * Verificação de SSL, PgBouncer e RLS Policies
 * Executar: node scripts/verify-ssl-rls.js
 */

const prisma = require('../src/config/prisma');

async function verifySSLAndRLS() {
  console.log('🔒 Verificando SSL, PgBouncer e RLS...\n');

  try {
    await prisma.$connect();

    // 1. SSL Status
    console.log('1️⃣ Verificando SSL...');
    try {
      const ssl = await prisma.$queryRaw`
        SELECT ssl.is_enabled, ssl.version 
        FROM pg_stat_ssl ssl 
        JOIN pg_stat_activity act ON ssl.pid = act.pid 
        WHERE act.datname = current_database() 
        LIMIT 1
      `;
      console.log(`   SSL habilitado: ${ssl[0]?.is_enabled ? '✅ Sim' : '❌ Não'}`);
      if (ssl[0]?.version) {
        console.log(`   Versão SSL: ${ssl[0].version}`);
      }
    } catch (error) {
      console.log(`   ⚠️  Não foi possível verificar SSL: ${error.message}`);
    }

    // 2. PgBouncer
    console.log('\n2️⃣ Verificando PgBouncer...');
    try {
      const pgbouncer = await prisma.$queryRaw`SHOW pool_mode`;
      console.log(`   Pool mode: ${pgbouncer[0]?.pool_mode || 'N/A'}`);
      
      const poolSize = await prisma.$queryRaw`SHOW max_db_size`;
      console.log(`   Max DB size: ${poolSize[0]?.max_db_size || 'N/A'}`);
    } catch (error) {
      console.log(`   ⚠️  PgBouncer stats não disponíveis (esperado via conexão pooler)`);
    }

    // 3. RLS Policies
    console.log('\n3️⃣ Verificando RLS Policies...');
    const rlsTables = await prisma.$queryRaw`
      SELECT schemaname, tablename, policyname, cmd, roles, qual
      FROM pg_policies 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `;
    console.log(`   📋 ${rlsTables.length} RLS policies encontradas:`);
    
    const tablesWithRLS = {};
    rlsTables.forEach(p => {
      if (!tablesWithRLS[p.tablename]) tablesWithRLS[p.tablename] = [];
      tablesWithRLS[p.tablename].push(p);
    });

    Object.keys(tablesWithRLS).forEach(table => {
      console.log(`      ${table}:`);
      tablesWithRLS[table].forEach(p => {
        console.log(`        - ${p.policyname} (${p.cmd})`);
      });
    });

    // 4. RLS Enabled em tabelas
    console.log('\n4️⃣ Tabelas com RLS habilitado...');
    const rlsEnabled = await prisma.$queryRaw`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' AND rowsecurity = true
      ORDER BY tablename
    `;
    console.log(`   📋 ${rlsEnabled.length} tabelas com RLS habilitado:`);
    rlsEnabled.forEach(t => console.log(`      ✅ ${t.tablename}`));

    // 5. Verificar se service_role bypass RLS
    console.log('\n5️⃣ Verificando permissões...');
    const roles = await prisma.$queryRaw`
      SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin
      FROM pg_roles
      WHERE rolname LIKE '%service%' OR rolname LIKE '%authenticated%' OR rolname LIKE '%anon%'
    `;
    console.log(`   📋 ${roles.length} roles relevantes encontrados:`);
    roles.forEach(r => {
      console.log(`      ${r.rolname}: super=${r.rolsuper}, create_role=${r.rolcreaterole}, create_db=${r.rolcreatedb}, login=${r.rolcanlogin}`);
    });

    // 6. Verificar grants nas tabelas
    console.log('\n6️⃣ Verificando grants...');
    const grants = await prisma.$queryRaw`
      SELECT table_name, privilege_type, grantee
      FROM information_schema.table_privileges
      WHERE table_schema = 'public' AND grantee IN ('authenticated', 'anon', 'service_role')
      LIMIT 10
    `;
    console.log(`   📋 ${grants.length} grants encontrados para roles do Supabase`);

    console.log('\n✅ Verificação de SSL/RLS concluída!');

  } catch (error) {
    console.error('\n❌ Erro durante verificação:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

verifySSLAndRLS();
