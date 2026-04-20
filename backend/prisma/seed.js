const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Modelos básicos de recibos (estrutura simplificada)
const modelosPadrao = [
  {
    nome: 'Recibo Avulso Clássico',
    tipo: 'avulso',
    isDefault: true,
    estrutura: {
      template: 'classico',
      // Estrutura simplificada - o frontend pode customizar
      config: {
        showHeader: true,
        showFooter: true,
        showSignature: true,
      },
    },
  },
  {
    nome: 'Recibo Avulso Simples',
    tipo: 'avulso',
    isDefault: true,
    estrutura: {
      template: 'simples',
      config: {
        showHeader: false,
        showFooter: true,
        showSignature: true,
      },
    },
  },
  {
    nome: 'Recibo de Honorários',
    tipo: 'honorario',
    isDefault: true,
    estrutura: {
      template: 'honorarios',
      config: {
        showHeader: true,
        showFooter: true,
        showSignature: true,
      },
    },
  },
];

async function seed() {
  console.log('🌱 Seed: Iniciando...');

  // Verificar se já existem modelos padrão
  const existentes = await prisma.reciboModelo.count({
    where: { isDefault: true },
  });

  if (existentes > 0) {
    console.log('✅ Modelos padrão já existem. Pulando seed.');
    return;
  }

  // Criar modelos padrão
  for (const modelo of modelosPadrao) {
    await prisma.reciboModelo.create({
      data: modelo,
    });
    console.log(`✅ Criado: ${modelo.nome}`);
  }

  console.log('🎉 Seed concluída com sucesso!');
}

seed()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
