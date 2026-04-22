const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando atualização de honorários...');
  
  const clients = await prisma.client.findMany();
  console.log(`Encontrados ${clients.length} clientes.`);

  for (const client of clients) {
    // Gerar um valor aleatório entre 500 e 5000
    const valor = Math.floor(Math.random() * (5000 - 500 + 1)) + 500;
    
    await prisma.client.update({
      where: { id: client.id },
      data: {
        honorariosValor: valor,
        status: 'Ativo' // Garantir que estão ativos para aparecerem no KPI
      }
    });
    console.log(`✅ Atualizado: ${client.razaoSocial} -> R$ ${valor}`);
  }

  console.log('✨ Atualização concluída!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
