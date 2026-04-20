const prisma = require('../src/config/prisma');

async function main() {
  console.log('📊 ESTADO ATUAL DO SISTEMA DE CALENDÁRIO\n');
  console.log('=' .repeat(50));

  // 1. Tipos de evento
  const tiposTodos = await prisma.tipoEvento.findMany({ orderBy: { ordem: 'asc' } });
  console.log('\n📋 TODOS OS TIPOS DE EVENTO:');
  tiposTodos.forEach(t => {
    const status = t.ativo ? '✅' : '❌';
    const padrao = t.ehPadrao ? '[P]' : '[ ]';
    console.log(`   ${status} ${padrao} ${t.nome.padEnd(25)} | ${t.label.padEnd(22)} | ${t.cor} | ${t.icone}`);
  });

  const tiposAtivos = tiposTodos.filter(t => t.ativo);
  console.log(`\n   Total ativos: ${tiposAtivos.length}`);

  // 2. Feriados
  const feriados = await prisma.calendarioFeriado.count({ where: { ano: 2026 } });
  const feriadosNacionais = await prisma.calendarioFeriado.count({ where: { ano: 2026, abrangencia: 'NACIONAL' } });
  const feriadosEstaduais = await prisma.calendarioFeriado.count({ where: { ano: 2026, abrangencia: 'ESTADUAL' } });
  const feriadosMunicipais = await prisma.calendarioFeriado.count({ where: { ano: 2026, abrangencia: 'MUNICIPAL' } });

  console.log(`\n📅 FERIADOS 2026: ${feriados}`);
  console.log(`   🇧🇷 Nacionais: ${feriadosNacionais}`);
  console.log(`   📍 Estaduais: ${feriadosEstaduais}`);
  console.log(`   🏙️  Municipais: ${feriadosMunicipais}`);

  // 3. Obrigações
  const obrigacoes = await prisma.calendarioObrigacao.count({ where: { ano: 2026 } });
  const comTipoEvento = await prisma.calendarioObrigacao.count({ where: { ano: 2026, tipoEventoId: { not: null } } });
  console.log(`\n📝 OBRIGAÇÕES 2026: ${obrigacoes}`);
  console.log(`   Com tipoEventoId: ${comTipoEvento}`);
  console.log(`   Sem tipoEventoId: ${obrigacoes - comTipoEvento}`);

  // 4. Notificações
  const notificacoes = await prisma.notificacao.count();
  console.log(`\n🔔 NOTIFICAÇÕES: ${notificacoes}`);

  console.log('\n' + '='.repeat(50));
  console.log('✅ SPRINT 1 CONCLUÍDA - Schema pronto!\n');
}

main()
  .catch(e => console.error('❌', e.message))
  .finally(() => prisma.$disconnect());
