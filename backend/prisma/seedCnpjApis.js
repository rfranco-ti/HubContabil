/**
 * Seed para configuração padrão das APIs de CNPJ
 *
 * Rodar: npx prisma db seed
 * Ou manualmente: node prisma/seedCnpjApis.js
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const apis = [
  {
    nome: "opencnpj",
    label: "OpenCNPJ",
    url: "https://api.opencnpj.org",
    ativa: true,
    ordem: 1,
    consomeCredito: false,
    timeout: 5000,
    cbThreshold: 5,
  },
  {
    nome: "invertexto",
    label: "Invertexto",
    url: "https://api.invertexto.com/v1/cnpj",
    ativa: true,
    ordem: 2,
    consomeCredito: false,
    timeout: 5000,
    cbThreshold: 5,
  },
  {
    nome: "minhareceita",
    label: "Minha Receita",
    url: "https://minhareceita.org",
    ativa: true,
    ordem: 3,
    consomeCredito: false,
    timeout: 5000,
    cbThreshold: 5,
  },
  {
    nome: "cnpja",
    label: "Cnpja (API)",
    url: "https://api.cnpja.com/office",
    ativa: true,
    ordem: 4,
    consomeCredito: true,
    timeout: 8000,
    cbThreshold: 3,
  },
];

async function main() {
  console.log("🌱 Inserindo configurações de APIs CNPJ...");

  for (const api of apis) {
    const existing = await prisma.cnpjApiConfig.findUnique({
      where: { nome: api.nome },
    });

    if (!existing) {
      await prisma.cnpjApiConfig.create({ data: api });
      console.log(`  ✅ ${api.label} (ordem: ${api.ordem})`);
    } else {
      console.log(`  ⏭️  ${api.label} já existe`);
    }
  }

  console.log("✅ Seed concluído!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
