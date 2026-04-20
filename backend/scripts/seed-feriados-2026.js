/**
 * Seed profissional de feriados 2026
 *
 * Conceito profissional de feriados:
 * - Classificação por abrangência geográfica (NACIONAL, ESTADUAL, MUNICIPAL)
 * - Classificação por setor afetado (geral, tributario, trabalhista)
 * - Feriados recorrentes (marcados para repetir todo ano)
 * - Campos de UF e Município para escopo geográfico
 */
const prisma = require('../src/config/prisma');

const feriados2026 = [
  // ===================== FERIADOS NACIONAIS =====================
  // Confraternização Universal
  {
    data: new Date('2026-01-01T00:00:00Z'),
    nome: 'Confraternização Universal',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Dia de ano novo - feriado nacional'
  },
  // Carnaval
  {
    data: new Date('2026-02-17T00:00:00Z'),
    nome: 'Carnaval',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Terça-feira de carnaval - ponto facultativo'
  },
  // Quarta-feira de Cinzas (ponto facultativo até 14h)
  {
    data: new Date('2026-02-18T00:00:00Z'),
    nome: 'Quarta-feira de Cinzas',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Quarta-feira de cinzas - ponto facultativo até 14h'
  },
  // Sexta-feira Santa
  {
    data: new Date('2026-04-03T00:00:00Z'),
    nome: 'Sexta-feira Santa',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Paixão de Cristo - feriado nacional'
  },
  // Tiradentes
  {
    data: new Date('2026-04-21T00:00:00Z'),
    nome: 'Tiradentes',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Dia de Tiradentes - herói da Inconfidência Mineira'
  },
  // Dia do Trabalho
  {
    data: new Date('2026-05-01T00:00:00Z'),
    nome: 'Dia do Trabalho',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['trabalhista', 'geral'],
    descricao: 'Dia Internacional do Trabalho'
  },
  // Corpus Christi
  {
    data: new Date('2026-06-04T00:00:00Z'),
    nome: 'Corpus Christi',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Corpus Christi - festa litúrgica'
  },
  // Independência do Brasil
  {
    data: new Date('2026-09-07T00:00:00Z'),
    nome: 'Independência do Brasil',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Dia da Independência do Brasil'
  },
  // Nossa Senhora Aparecida
  {
    data: new Date('2026-10-12T00:00:00Z'),
    nome: 'Nossa Senhora Aparecida',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Dia de Nossa Senhora Aparecida - Padroeira do Brasil'
  },
  // Finados
  {
    data: new Date('2026-11-02T00:00:00Z'),
    nome: 'Finados',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Dia de Finados'
  },
  // Proclamação da República
  {
    data: new Date('2026-11-15T00:00:00Z'),
    nome: 'Proclamação da República',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Proclamação da República do Brasil'
  },
  // Dia da Consciência Negra (feriado nacional desde 2024)
  {
    data: new Date('2026-11-20T00:00:00Z'),
    nome: 'Dia da Consciência Negra',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Dia Nacional de Zumbi e da Consciência Negra'
  },
  // Natal
  {
    data: new Date('2026-12-25T00:00:00Z'),
    nome: 'Natal',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Natal - Nascimento de Cristo'
  },
  // Véspera de Natal (ponto facultativo)
  {
    data: new Date('2026-12-24T00:00:00Z'),
    nome: 'Véspera de Natal',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Véspera de Natal - ponto facultativo a partir das 14h'
  },
  // Último dia útil do ano (ponto facultativo)
  {
    data: new Date('2026-12-31T00:00:00Z'),
    nome: 'Véspera de Ano Novo',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Último dia do ano - ponto facultativo a partir das 14h'
  },

  // ===================== FERIADOS ESTADUAIS (PRINCIPAIS) =====================
  // São Paulo - Revolução Constitucionalista de 1932
  {
    data: new Date('2026-07-09T00:00:00Z'),
    nome: 'Revolução Constitucionalista de 1932',
    abrangencia: 'ESTADUAL',
    uf: 'SP',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Revolução Constitucionalista de 1932 - feriado estadual em SP'
  },
  // Rio de Janeiro - Dia de São Jorge
  {
    data: new Date('2026-04-23T00:00:00Z'),
    nome: 'Dia de São Jorge',
    abrangencia: 'ESTADUAL',
    uf: 'RJ',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Dia de São Jorge - padroeiro do estado do RJ'
  },
  // Minas Gerais - Dia da Santíssima Conceição do Rio Preto
  // Bahia - Dia da Independência da Bahia (2 de julho)
  {
    data: new Date('2026-07-02T00:00:00Z'),
    nome: 'Independência da Bahia',
    abrangencia: 'ESTADUAL',
    uf: 'BA',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Independência da Bahia - 2 de julho de 1823'
  },
  // Rio Grande do Sul - Dia da Batalha dos Guararapes (não, é de PE)
  // RS - Dia Internacional da Mulher Gaúcha (menor importância)
  // Vamos colocar o mais relevante: Dia da Bíblia não é feriado...
  // Amazonas - Elevação do Amazonas à categoria de Capitania
  {
    data: new Date('2026-09-05T00:00:00Z'),
    nome: 'Elevação do Amazonas à Capitania',
    abrangencia: 'ESTADUAL',
    uf: 'AM',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Elevação do Amazonas à categoria de Capitania'
  },
  // Acre - Dia do Território (não é feriado)
  // Pará - Dia do Pará (15 de agosto)
  {
    data: new Date('2026-08-15T00:00:00Z'),
    nome: 'Adesão do Pará à Independência',
    abrangencia: 'ESTADUAL',
    uf: 'PA',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Adesão do Pará à Independência do Brasil'
  },
  // Piauí - Dia da Independência do Piauí (19 de outubro)
  {
    data: new Date('2026-10-19T00:00:00Z'),
    nome: 'Independência do Piauí',
    abrangencia: 'ESTADUAL',
    uf: 'PI',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Independência do Piauí'
  },
  // Alagoas - Emancipação Política (16 de setembro)
  {
    data: new Date('2026-09-16T00:00:00Z'),
    nome: 'Emancipação Política de Alagoas',
    abrangencia: 'ESTADUAL',
    uf: 'AL',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Emancipação Política do estado de Alagoas'
  },
  // Goiás - Divisão do estado (1 de julho - não é feriado)
  // Goiás - Dia da Criança Goiana (não é feriado)
  // Maranhão - Adesão do Maranhão à Independência (28 de julho)
  {
    data: new Date('2026-07-28T00:00:00Z'),
    nome: 'Adesão do Maranhão à Independência',
    abrangencia: 'ESTADUAL',
    uf: 'MA',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Adesão do Maranhão à Independência do Brasil'
  },
  // Paraíba - Princesa Isabel (não é estadual)
  // Mato Grosso do Sul - Fundação do estado (11 de outubro)
  {
    data: new Date('2026-10-11T00:00:00Z'),
    nome: 'Criação de Mato Grosso do Sul',
    abrangencia: 'ESTADUAL',
    uf: 'MS',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Criação do estado de Mato Grosso do Sul'
  },
  // Rio Grande do Norte - Mártires do RN (3 de outubro)
  {
    data: new Date('2026-10-03T00:00:00Z'),
    nome: 'Mártires do Rio Grande do Norte',
    abrangencia: 'ESTADUAL',
    uf: 'RN',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Dia dos Mártires de Cunhaú e Uruaçu'
  },
  // Santa Catarina - Dia de Santa Catarina (não é feriado)
  // Sergipe - Emancipação (8 de julho)
  {
    data: new Date('2026-07-08T00:00:00Z'),
    nome: 'Emancipação de Sergipe',
    abrangencia: 'ESTADUAL',
    uf: 'SE',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Emancipação Política de Sergipe'
  },
  // Tocantins - Criação do estado (5 de outubro)
  {
    data: new Date('2026-10-05T00:00:00Z'),
    nome: 'Criação do Tocantins',
    abrangencia: 'ESTADUAL',
    uf: 'TO',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Criação do estado do Tocantins'
  },
  // Ceará - Abolição da Escravidão no Ceará (25 de março)
  {
    data: new Date('2026-03-25T00:00:00Z'),
    nome: 'Abolição da Escravatura no Ceará',
    abrangencia: 'ESTADUAL',
    uf: 'CE',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Abolição da escravatura no Ceará (1884)'
  },
  // Pernambuco - Dia do Frevo (não é feriado)
  // Distrito Federal - Dia de Brasília (21 de abril, já é Tiradentes)
  // Espírito Santo - Nossa Senhora da Vitória (8 de setembro)
  {
    data: new Date('2026-09-08T00:00:00Z'),
    nome: 'Nossa Senhora da Vitória',
    abrangencia: 'ESTADUAL',
    uf: 'ES',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Dia de Nossa Senhora da Vitória - Padroeira do ES'
  },
  // Rondônia - Criação do estado (4 de janeiro)
  {
    data: new Date('2026-01-04T00:00:00Z'),
    nome: 'Criação de Rondônia',
    abrangencia: 'ESTADUAL',
    uf: 'RO',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Criação do estado de Rondônia'
  },
  // Roraima - Criação do estado (5 de outubro, mesmo que Tocantins)
  // Amapá - Criação do estado (5 de outubro)
  // Paraná - Dia da Emancipação (19 de dezembro)
  {
    data: new Date('2026-12-19T00:00:00Z'),
    nome: 'Emancipação do Paraná',
    abrangencia: 'ESTADUAL',
    uf: 'PR',
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: 'Emancipação Política do Paraná'
  },
  // Mato Grosso - Dia de Mato Grosso (20 de novembro, mesmo que Consciência Negra)
  // Goiás não tem feriado estadual oficial amplamente reconhecido

  // ===================== FERIADOS NACIONAIS DO SETOR CONTÁBIL =====================
  // Dia do Contador
  {
    data: new Date('2026-04-25T00:00:00Z'),
    nome: 'Dia do Contador',
    abrangencia: 'NACIONAL',
    uf: null,
    municipio: null,
    ano: 2026,
    recorrente: true,
    setorAfetado: ['tributario', 'trabalhista'],
    descricao: 'Dia do Contador - data comemorativa do setor contábil'
  },
  // Dia do Servidor Público (28 de outubro - não é feriado, mas é relevante)
  // Dia das Bruxas (não é feriado no Brasil)
  // Black Friday (não é feriado)
];

async function seed() {
  console.log('🌱 Seed profissional de feriados 2026...\n');

  try {
    const ano = 2026;

    // Verificar se já existem feriados para 2026
    const countExistente = await prisma.calendarioFeriado.count({ where: { ano } });

    if (countExistente > 0) {
      console.log(`⚠️  ${countExistente} feriados já existem para ${ano}`);
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const resposta = await new Promise(resolve => {
        readline.question('Deseja substituir? (s/N): ', resolve);
      });
      readline.close();

      if (resposta.trim().toLowerCase() === 's' || resposta.trim().toLowerCase() === 'sim') {
        console.log('🗑️  Limpando feriados existentes...');
        await prisma.calendarioFeriado.deleteMany({ where: { ano } });
      } else {
        console.log('✅ Seed cancelado. Feriados mantidos.');
        return;
      }
    }

    // Inserir em batch
    console.log(`\n📥 Inserindo ${feriados2026.length} feriados...`);

    // Agrupar por abrangência para contagem
    const contagem = { NACIONAL: 0, ESTADUAL: 0, MUNICIPAL: 0 };
    for (const feriado of feriados2026) {
      contagem[feriado.abrangencia]++;
    }

    console.log('   Resumo por abrangência:');
    console.log(`   🇧🇷 Nacionais: ${contagem.NACIONAL}`);
    console.log(`   📍 Estaduais: ${contagem.ESTADUAL}`);
    console.log(`   🏙️  Municipais: ${contagem.MUNICIPAL}`);

    // Inserir
    await prisma.calendarioFeriado.createMany({ data: feriados2026 });

    const total = await prisma.calendarioFeriado.count({ where: { ano } });
    console.log(`\n✅ ${total} feriados configurados para ${ano}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
