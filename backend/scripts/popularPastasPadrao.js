const prisma = require("../src/config/prisma");

const PASTAS_PADRAO = [
  "Certificado Digital",
  "Junta Comercial",
  "Departamento Pessoal",
  "Departamento Fiscal",
  "Diversos",
];

async function popularPastasPadrao() {
  console.log("Iniciando a criação de pastas padrão para clientes existentes...\n");

  try {
    const clientes = await prisma.client.findMany({
      select: {
        id: true,
        razaoSocial: true,
        pastas: {
          select: {
            nome: true
          }
        }
      }
    });

    console.log(`Encontrados ${clientes.length} clientes. Verificando pastas...\n`);

    let totalPastasCriadas = 0;
    let clientesAfetados = 0;

    for (const cliente of clientes) {
      const nomesPastasAtuais = cliente.pastas.map(p => p.nome);
      const pastasParaCriar = PASTAS_PADRAO.filter(p => !nomesPastasAtuais.includes(p));

      if (pastasParaCriar.length > 0) {
        console.log(`-> Cliente: ${cliente.razaoSocial} | Faltam: ${pastasParaCriar.join(", ")}`);
        
        await prisma.pastaDocumento.createMany({
          data: pastasParaCriar.map(nome => ({
            clientId: cliente.id,
            nome: nome,
          }))
        });

        totalPastasCriadas += pastasParaCriar.length;
        clientesAfetados++;
      }
    }

    console.log("\n=======================================");
    console.log("          RESUMO DA OPERAÇÃO           ");
    console.log("=======================================");
    console.log(`Clientes verificados: ${clientes.length}`);
    console.log(`Clientes atualizados: ${clientesAfetados}`);
    console.log(`Total de pastas criadas: ${totalPastasCriadas}`);
    console.log("=======================================\n");

  } catch (error) {
    console.error("❌ Erro ao popular pastas:", error);
  } finally {
    await prisma.$disconnect();
  }
}

popularPastasPadrao();
