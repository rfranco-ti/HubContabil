/**
 * Seed dos 6 tipos essenciais de evento (gerenciados pelo admin)
 *
 * Tipos fixos do sistema:
 * - trabalhista: Obrigações trabalhistas e previdenciárias
 * - tributario: Obrigações tributárias federais, estaduais e municipais
 * - feriado: Feriados (com abrangência nacional/estadual/municipal)
 * - datas_comemorativas: Datas comemorativas do setor contábil (ex: Dia do Contador)
 * - lembrete: Lembretes e anotações do usuário
 * - tarefa: Tarefas pendentes do usuário
 */
const prisma = require("../src/config/prisma");

const tiposEssenciais = [
  {
    nome: "trabalhista",
    label: "Trabalhista",
    cor: "#10b981",
    icone: "👷",
    descricao:
      "Obrigações trabalhistas e previdenciárias (FGTS, INSS, eSocial, etc.)",
    ordem: 1,
    ehPadrao: true,
  },
  {
    nome: "tributario",
    label: "Tributário",
    cor: "#3b82f6",
    icone: "🏛️",
    descricao:
      "Obrigações tributárias federais, estaduais e municipais (DAS, IRPJ, CSLL, ICMS, ISS, etc.)",
    ordem: 2,
    ehPadrao: true,
  },
  {
    nome: "feriado",
    label: "Feriado",
    cor: "#ef4444",
    icone: "🇧🇷",
    descricao:
      "Feriados nacionais, estaduais e municipais com abrangência configurável",
    ordem: 3,
    ehPadrao: true,
  },
  {
    nome: "datas_comemorativas",
    label: "Datas Comemorativas",
    cor: "#ec4899",
    icone: "🎉",
    descricao:
      "Datas comemorativas do setor contábil e empresarial (Dia do Contador, etc.)",
    ordem: 4,
    ehPadrao: true,
  },
  {
    nome: "lembrete",
    label: "Lembrete",
    cor: "#f97316",
    icone: "🔔",
    descricao:
      "Lembretes e anotações pessoais do usuário com opção de notificação",
    ordem: 5,
    ehPadrao: true,
  },
  {
    nome: "tarefa",
    label: "Tarefa",
    cor: "#22c55e",
    icone: "✅",
    descricao: "Tarefas pendentes e afazeres relacionados ao calendário",
    ordem: 6,
    ehPadrao: true,
  },
];

async function seed() {
  console.log("🌱 Seed dos tipos essenciais de evento...\n");

  try {
    for (const tipo of tiposEssenciais) {
      const existente = await prisma.tipoEvento.findUnique({
        where: { nome: tipo.nome },
      });

      if (existente) {
        // Atualizar tipo existente com os novos campos
        await prisma.tipoEvento.update({
          where: { nome: tipo.nome },
          data: {
            label: tipo.label,
            cor: tipo.cor,
            icone: tipo.icone,
            descricao: tipo.descricao,
            ordem: tipo.ordem,
            ehPadrao: tipo.ehPadrao,
          },
        });
        console.log(`  🔄 ${tipo.label} atualizado`);
      } else {
        await prisma.tipoEvento.create({ data: tipo });
        console.log(`  ✅ ${tipo.label} criado`);
      }
    }

    // Desativar tipos antigos que não fazem mais parte dos 6 essenciais
    const nomesEssenciais = tiposEssenciais.map((t) => t.nome);
    const tiposParaDesativar = await prisma.tipoEvento.findMany({
      where: {
        nome: { notIn: nomesEssenciais },
      },
    });

    if (tiposParaDesativar.length > 0) {
      console.log("\n  ⚠️  Desativando tipos antigos não essenciais:");
      for (const tipo of tiposParaDesativar) {
        await prisma.tipoEvento.update({
          where: { id: tipo.id },
          data: { ativo: false },
        });
        console.log(`  ❌ ${tipo.label} desativado`);
      }
    }

    const total = await prisma.tipoEvento.count({ where: { ativo: true } });
    console.log(`\n✅ ${total} tipos de evento essenciais configurados`);
  } catch (error) {
    console.error("❌ Erro:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
