const { mapCnpjDataToForm, mapCnpjDataToEditableFields } = require('./frontend/src/utils/cnpjMapper.js');

// Mock formatters since we can't easily import from masks.js in node without babel/esm
global.formatCnpj = (v) => v;
global.formatPhoneDisplay = (v) => v;
global.formatCep = (v) => v;
global.formatCpf = (v) => v;

const mockData = {
  cnpj: '34509314000136',
  razaoSocial: 'HUB CONTABIL LTDA',
  nomeFantasia: 'HUB CONTABIL',
  dataAbertura: '01/01/2020',
  naturezaJuridica: 'Sociedade Empresária Limitada',
  situacao: { descricao: 'ATIVA' },
  email: 'contato@hubcontabil.com.br',
  telefones: [{ ddd: '71', numero: '982886218' }],
  endereco: {
    cep: '40000000',
    logradouro: 'Rua Principal',
    numero: '123',
    bairro: 'Centro',
    cidade: 'Salvador',
    uf: 'BA'
  },
  cnaePrincipal: { codigo: '6920601', descricao: 'Atividades de contabilidade' },
  socios: [{ nome: 'RICARDO FRANCO', qualificacao: 'Sócio-Administrador' }]
};

const prevData = {
  contatos: [],
  contato_principal: { nome: '', email: '', telefone: '' },
  cnae_principal: { codigo: '', descricao: '' },
  endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' }
};

try {
  const mapped = mapCnpjDataToForm(mockData, prevData);
  console.log('✅ Mapped Form Data:', JSON.stringify(mapped, null, 2));

  const editable = mapCnpjDataToEditableFields(mockData, {});
  console.log('✅ Editable Fields:', JSON.stringify(editable, null, 2));
} catch (e) {
  console.error('❌ Error testing mapper:', e.message);
}
