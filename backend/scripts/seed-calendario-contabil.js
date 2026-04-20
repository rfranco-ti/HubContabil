/**
 * Script otimizado para popular calendário contábil no banco
 * Usa insert em batch para performance
 * Executar: node scripts/seed-calendario-contabil.js
 */

const prisma = require('../src/config/prisma');
const path = require('path');
const fs = require('fs');

const mesesMap = {
  'Janeiro': 1, 'Fevereiro': 2, 'Março': 3, 'Abril': 4,
  'Maio': 5, 'Junho': 6, 'Julho': 7, 'Agosto': 8,
  'Setembro': 9, 'Outubro': 10, 'Novembro': 11, 'Dezembro': 12
};

async function seed() {
  console.log('🚀 Seed do calendário contábil...\n');
  
  try {
    // 1. Ler JSON
    const jsonPath = path.join(__dirname, '../data/calendarioContabil2026.json');
    const calendarioData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log('✅ JSON lido com sucesso');
    
    const ano = 2026;
    const obrigacoes = [];
    const feriados = [];
    
    // 2. Parsear dados
    console.log('\n📊 Parseando dados...');
    for (const [mesNome, dias] of Object.entries(calendarioData[ano])) {
      const mes = mesesMap[mesNome];
      if (!mes) continue;
      
      for (const [diaStr, eventos] of Object.entries(dias)) {
        const dia = parseInt(diaStr);
        
        for (const evento of eventos) {
          const isFeriado = evento.calendar === 'Feriados' && !evento.eventName.includes('Ponto Facultativo');
          const isPontoFacultativo = evento.eventName.includes('Ponto Facultativo');
          
          obrigacoes.push({
            ano,
            mes,
            dia,
            nomeEvento: evento.eventName,
            periodoApuracao: evento.eventPeriod || null,
            baseLegal: evento.eventBase || null,
            categoria: evento.calendar,
            isFeriado,
            isPontoFacultativo
          });
          
          if (evento.calendar === 'Feriados') {
            const data = new Date(ano, mes - 1, dia);
            const existente = feriados.find(f => f.data.getTime() === data.getTime());
            if (!existente) {
              feriados.push({
                data,
                nome: evento.eventName,
                tipo: isPontoFacultativo ? 'municipal' : 'nacional',
                ano
              });
            }
          }
        }
      }
    }
    
    console.log(`   ${obrigacoes.length} obrigações parseadas`);
    console.log(`   ${feriados.length} feriados parseados`);
    
    // 3. Verificar se já existe dados
    const countObrigacoes = await prisma.calendarioObrigacao.count({ where: { ano } });
    if (countObrigacoes > 0) {
      console.log(`\n⚠️  ${countObrigacoes} obrigações já existem para ${ano}`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise(resolve => {
        readline.question('Deseja substituir? (s/N): ', resolve);
      });
      readline.close();
      
      if (answer.trim().toLowerCase() === 's' || answer.trim().toLowerCase() === 'sim') {
        console.log('🗑️  Limpando dados existentes...');
        await prisma.calendarioObrigacao.deleteMany({ where: { ano } });
        await prisma.calendarioFeriado.deleteMany({ where: { ano } });
      } else {
        console.log('✅ Seed cancelado. Dados mantidos.');
        return;
      }
    }
    
    // 4. Insert em batch
    console.log('\n📥 Inserindo obrigações em batch...');
    const batchSize = 100;
    for (let i = 0; i < obrigacoes.length; i += batchSize) {
      const batch = obrigacoes.slice(i, i + batchSize);
      await prisma.calendarioObrigacao.createMany({ data: batch });
      console.log(`   ✅ ${(i + batch.length)}/${obrigacoes.length} obrigações`);
    }
    
    console.log('\n📥 Inserindo feriados em batch...');
    for (let i = 0; i < feriados.length; i += batchSize) {
      const batch = feriados.slice(i, i + batchSize);
      await prisma.calendarioFeriado.createMany({ data: batch });
      console.log(`   ✅ ${(i + batch.length)}/${feriados.length} feriados`);
    }
    
    // 5. Resumo
    const totalObrigacoes = await prisma.calendarioObrigacao.count({ where: { ano } });
    const totalFeriados = await prisma.calendarioFeriado.count({ where: { ano } });
    
    console.log('\n✅ Seed concluído com sucesso!');
    console.log(`   Obrigações no banco: ${totalObrigacoes}`);
    console.log(`   Feriados no banco: ${totalFeriados}`);
    
  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed();
