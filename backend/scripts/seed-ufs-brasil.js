/**
 * Seed das 27 UFs do Brasil (26 estados + Distrito Federal)
 */
const prisma = require('../src/config/prisma');

const ufsBrasil = [
  { sigla: 'AC', nome: 'Acre', ordem: 1 },
  { sigla: 'AL', nome: 'Alagoas', ordem: 2 },
  { sigla: 'AP', nome: 'Amapá', ordem: 3 },
  { sigla: 'AM', nome: 'Amazonas', ordem: 4 },
  { sigla: 'BA', nome: 'Bahia', ordem: 5 },
  { sigla: 'CE', nome: 'Ceará', ordem: 6 },
  { sigla: 'DF', nome: 'Distrito Federal', ordem: 7 },
  { sigla: 'ES', nome: 'Espírito Santo', ordem: 8 },
  { sigla: 'GO', nome: 'Goiás', ordem: 9 },
  { sigla: 'MA', nome: 'Maranhão', ordem: 10 },
  { sigla: 'MT', nome: 'Mato Grosso', ordem: 11 },
  { sigla: 'MS', nome: 'Mato Grosso do Sul', ordem: 12 },
  { sigla: 'MG', nome: 'Minas Gerais', ordem: 13 },
  { sigla: 'PA', nome: 'Pará', ordem: 14 },
  { sigla: 'PB', nome: 'Paraíba', ordem: 15 },
  { sigla: 'PR', nome: 'Paraná', ordem: 16 },
  { sigla: 'PE', nome: 'Pernambuco', ordem: 17 },
  { sigla: 'PI', nome: 'Piauí', ordem: 18 },
  { sigla: 'RJ', nome: 'Rio de Janeiro', ordem: 19 },
  { sigla: 'RN', nome: 'Rio Grande do Norte', ordem: 20 },
  { sigla: 'RS', nome: 'Rio Grande do Sul', ordem: 21 },
  { sigla: 'RO', nome: 'Rondônia', ordem: 22 },
  { sigla: 'RR', nome: 'Roraima', ordem: 23 },
  { sigla: 'SC', nome: 'Santa Catarina', ordem: 24 },
  { sigla: 'SP', nome: 'São Paulo', ordem: 25 },
  { sigla: 'SE', nome: 'Sergipe', ordem: 26 },
  { sigla: 'TO', nome: 'Tocantins', ordem: 27 }
];

async function seed() {
  console.log('🌱 Seed das UFs do Brasil...');
  
  try {
    for (const uf of ufsBrasil) {
      const existente = await prisma.uF.findUnique({ where: { sigla: uf.sigla } });
      if (existente) {
        console.log(`  ⏭️  ${uf.sigla} - ${uf.nome} já existe`);
      } else {
        await prisma.uF.create({ data: uf });
        console.log(`  ✅ ${uf.sigla} - ${uf.nome} criado`);
      }
    }
    
    const total = await prisma.uF.count();
    console.log(`\n✅ ${total} UFs configuradas`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
