const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seed: Iniciando...');

  // 1. Criar Usuário de Teste
  const testUserEmail = 'admin@hubcontabil.com';
  let user = await prisma.user.findUnique({ where: { email: testUserEmail } });

  if (!user) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    user = await prisma.user.create({
      data: {
        nome: 'Administrador Hub',
        email: testUserEmail,
        senha: hashedPassword,
        cargo: 'Sócio-Diretor'
      }
    });
    console.log('✅ Usuário de teste criado: admin@hubcontabil.com / admin123');
  }

  // 2. Criar Configurações de APIs CNPJ (se não existirem)
  const apis = [
    { nome: "opencnpj", label: "OpenCNPJ", url: "https://api.opencnpj.org", ativa: true, ordem: 1, consomeCredito: false, timeout: 5000, cbThreshold: 5 },
    { nome: "invertexto", label: "Invertexto", url: "https://api.invertexto.com/v1/cnpj", ativa: true, ordem: 2, consomeCredito: false, timeout: 5000, cbThreshold: 5 },
    { nome: "minhareceita", label: "Minha Receita", url: "https://minhareceita.org", ativa: true, ordem: 3, consomeCredito: false, timeout: 5000, cbThreshold: 5 },
    { nome: "cnpja", label: "Cnpja (API)", url: "https://api.cnpja.com/office", ativa: true, ordem: 4, consomeCredito: true, timeout: 8000, cbThreshold: 3 }
  ];

  for (const api of apis) {
    const existing = await prisma.cnpjApiConfig.findUnique({ where: { nome: api.nome } });
    if (!existing) {
      await prisma.cnpjApiConfig.create({ data: api });
      console.log(`  ✅ API Configurada: ${api.label}`);
    }
  }

  // 3. Criar Modelos de Recibos (se não existirem)
  const modelosExistentes = await prisma.reciboModelo.count({ where: { isDefault: true } });
  if (modelosExistentes === 0) {
    const modelosPadrao = [
      { nome: 'Recibo Avulso Clássico', tipo: 'avulso', isDefault: true, estrutura: { template: 'classico' } },
      { nome: 'Recibo de Honorários', tipo: 'honorario', isDefault: true, estrutura: { template: 'honorarios' } },
    ];
    for (const m of modelosPadrao) {
      await prisma.reciboModelo.create({ data: m });
    }
    console.log('✅ Modelos de recibo criados.');
  }

  // 4. Criar Clientes Diversos
  const clientesData = [
    {
      cnpj: '00000000000191',
      razaoSocial: 'BANCO DO BRASIL SA',
      nomeFantasia: 'BANCO DO BRASIL',
      regimeTributario: 'Lucro Real',
      isMei: false,
      status: 'Ativo',
      enderecoCidade: 'BRASILIA',
      enderecoUf: 'DF',
      honorariosValor: 0,
      temContabil: true,
      temFiscal: true,
      temDp: true,
      servicosPrestados: 'Serviços bancários e administrativos.',
    },
    {
      cnpj: '00360305000104',
      razaoSocial: 'CAIXA ECONOMICA FEDERAL',
      nomeFantasia: 'CAIXA',
      regimeTributario: 'Lucro Real',
      isMei: false,
      status: 'Ativo',
      enderecoCidade: 'BRASILIA',
      enderecoUf: 'DF',
      honorariosValor: 0,
      temContabil: true,
      temFiscal: true,
      temDp: true,
      servicosPrestados: 'Serviços bancários e sociais.',
    },
    {
      cnpj: '33000167000101',
      razaoSocial: 'PETROLEO BRASILEIRO S.A. PETROBRAS',
      nomeFantasia: 'PETROBRAS',
      regimeTributario: 'Lucro Real',
      isMei: false,
      status: 'Ativo',
      enderecoCidade: 'RIO DE JANEIRO',
      enderecoUf: 'RJ',
      honorariosValor: 0,
      temContabil: true,
      temFiscal: true,
      temDp: true,
      servicosPrestados: 'Exploração e produção de petróleo.',
    },
    {
      cnpj: '34028316000103',
      razaoSocial: 'EMPRESA BRASILEIRA DE CORREIOS E TELEGRAFOS',
      nomeFantasia: 'CORREIOS',
      regimeTributario: 'Lucro Real',
      isMei: false,
      status: 'Ativo',
      enderecoCidade: 'BRASILIA',
      enderecoUf: 'DF',
      honorariosValor: 0,
      temContabil: true,
      temFiscal: true,
      temDp: true,
      servicosPrestados: 'Serviços postais e logística.',
    },
    {
      cnpj: '33657248000189',
      razaoSocial: 'BANCO NACIONAL DE DESENVOLVIMENTO ECONOMICO E SOCIAL',
      nomeFantasia: 'BNDES',
      regimeTributario: 'Lucro Real',
      isMei: false,
      status: 'Ativo',
      enderecoCidade: 'RIO DE JANEIRO',
      enderecoUf: 'RJ',
      honorariosValor: 0,
      temContabil: true,
      temFiscal: true,
      temDp: true,
      servicosPrestados: 'Fomento econômico e social.',
    },
    {
      cnpj: '00348003000110',
      razaoSocial: 'EMPRESA BRASILEIRA DE PESQUISA AGROPECUARIA',
      nomeFantasia: 'EMBRAPA',
      regimeTributario: 'Lucro Real',
      isMei: false,
      status: 'Ativo',
      enderecoCidade: 'BRASILIA',
      enderecoUf: 'DF',
      honorariosValor: 0,
      temContabil: true,
      temFiscal: true,
      temDp: true,
      servicosPrestados: 'Pesquisa e desenvolvimento agropecuário.',
    },
    {
      cnpj: '33683111000107',
      razaoSocial: 'SERVICO FEDERAL DE PROCESSAMENTO DE DADOS (SERPRO)',
      nomeFantasia: 'SERPRO',
      regimeTributario: 'Lucro Real',
      isMei: false,
      status: 'Ativo',
      enderecoCidade: 'BRASILIA',
      enderecoUf: 'DF',
      honorariosValor: 0,
      temContabil: true,
      temFiscal: true,
      temDp: true,
      servicosPrestados: 'Processamento de dados governamentais.',
    },
    {
      cnpj: '42422253000101',
      razaoSocial: 'EMPRESA DE TECNOLOGIA E INFORMACOES DA PREVIDENCIA - DATAPREV',
      nomeFantasia: 'DATAPREV',
      regimeTributario: 'Lucro Real',
      isMei: false,
      status: 'Ativo',
      enderecoCidade: 'BRASILIA',
      enderecoUf: 'DF',
      honorariosValor: 0,
      temContabil: true,
      temFiscal: true,
      temDp: true,
      servicosPrestados: 'Tecnologia da informação previdenciária.',
    },
    {
      cnpj: '26461699000180',
      razaoSocial: 'COMPANHIA NACIONAL DE ABASTECIMENTO',
      nomeFantasia: 'CONAB',
      regimeTributario: 'Lucro Real',
      isMei: false,
      status: 'Ativo',
      enderecoCidade: 'BRASILIA',
      enderecoUf: 'DF',
      honorariosValor: 0,
      temContabil: true,
      temFiscal: true,
      temDp: true,
      servicosPrestados: 'Abastecimento e política agrícola.',
    },
    {
      cnpj: '00001180000126',
      razaoSocial: 'CENTRAIS ELETRICAS BRASILEIRAS SA',
      nomeFantasia: 'ELETROBRAS',
      regimeTributario: 'Lucro Real',
      isMei: false,
      status: 'Ativo',
      enderecoCidade: 'RIO DE JANEIRO',
      enderecoUf: 'RJ',
      honorariosValor: 0,
      temContabil: true,
      temFiscal: true,
      temDp: true,
      servicosPrestados: 'Geração e transmissão de energia elétrica.',
    }
  ];

  for (const clientData of clientesData) {
    const exists = await prisma.client.findUnique({ where: { cnpj: clientData.cnpj } });
    if (!exists) {
      await prisma.client.create({ data: clientData });
      console.log(`✅ Cliente criado: ${clientData.razaoSocial}`);
    }
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
