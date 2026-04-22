import { formatCpf, formatPhoneDisplay } from './masks';

export const formatDateToInput = (dateStr) => {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const [d, m, y] = parts;
      const year = y.length === 2 ? `20${y}` : y;
      return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
  }
  
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {}

  return dateStr;
};

export const mapCnpjDataToForm = (data, prevData) => {
  return {
    ...prevData,
    cnpj: data.cnpj || prevData.cnpj,
    razao_social: data.razaoSocial || prevData.razao_social,
    nome_fantasia: data.nomeFantasia || prevData.nome_fantasia,
    data_abertura: formatDateToInput(data.dataAbertura) || prevData.data_abertura,
    natureza_juridica: data.naturezaJuridica || data.natureza_juridica || prevData.natureza_juridica,
    inscricao_estadual: data.inscricaoEstadual || prevData.inscricao_estadual,
    inscricao_municipal: data.inscricaoMunicipal || prevData.inscricao_municipal,
    status: data.situacao?.descricao || prevData.status,
    situacao_sefaz_estadual: data.situacao_sefaz || data.situacao?.descricao || prevData.situacao_sefaz_estadual,
    situacao_sefaz_municipal: data.situacao_sefaz_municipal || prevData.situacao_sefaz_municipal,
    is_mei: data.opcaoMei || false,
    cnae_principal: {
      codigo: data.cnaePrincipal?.codigo || prevData.cnae_principal.codigo,
      descricao: data.cnaePrincipal?.descricao || prevData.cnae_principal.descricao
    },
    cnaes_secundarios: (data.cnaesSecundarios || []).map(a => ({
      codigo: a.codigo || '',
      descricao: a.descricao || ''
    })),
    qsa: (data.socios || []).map(m => ({
      nome: m.nome || '',
      cpf_cnpj: formatCpf(m.cpfCnpj || ''),
      qualificacao: m.qualificacao || '',
      data_entrada: formatDateToInput(m.dataEntrada) || '',
      pais: m.pais || '',
      representante_legal: m.representanteLegal || '',
      participacao: 0
    })),
    contatos: (data.telefones || []).map((tel, idx) => ({
      nome: '',
      email: idx === 0 ? (data.email || '') : '',
      telefone: `${tel.ddd}${tel.numero}`
    })),
    endereco: {
      cep: data.endereco?.cep || prevData.endereco.cep,
      logradouro: data.endereco?.logradouro || prevData.endereco.logradouro,
      numero: data.endereco?.numero || prevData.endereco.numero,
      complemento: data.endereco?.complemento || prevData.endereco.complemento,
      bairro: data.endereco?.bairro || prevData.endereco.bairro,
      cidade: data.endereco?.cidade || prevData.endereco.cidade,
      uf: data.endereco?.uf || prevData.endereco.uf
    },
    contato_principal: {
      nome: data.razaoSocial || prevData.contato_principal.nome,
      email: data.email || prevData.contato_principal.email,
      telefone: data.telefones?.[0] ? 
        `${data.telefones[0].ddd}${data.telefones[0].numero}` : 
        prevData.contato_principal.telefone
    },
    regime_tributario: (data.regimeTributario && data.regimeTributario !== 'Nao Informado') ? data.regimeTributario : 'Não Enquadrado',
    capital_social: data.capitalSocial ? Number(data.capitalSocial) * 100 : prevData.capital_social,
    porte: data.porte?.descricao || data.porte || prevData.porte,
    situacao_data: data.situacao?.data || prevData.situacao_data,
    situacao_motivo: data.situacao?.motivo || prevData.situacao_motivo,
    opcao_simples: data.opcaoSimples || false,
    data_opcao_simples: formatDateToInput(data.dataOpcaoSimples) || prevData.data_opcao_simples,
    data_exclusao_simples: formatDateToInput(data.dataExclusaoSimples) || prevData.data_exclusao_simples,
    motivo_exclusao_simples: data.motivoExclusaoSimples || prevData.motivo_exclusao_simples,
    data_opcao_mei: formatDateToInput(data.dataOpcaoMei) || prevData.data_opcao_mei,
    data_exclusao_mei: formatDateToInput(data.dataExclusaoMei) || prevData.data_exclusao_mei,
  };
};

export const mapCnpjDataToEditableFields = (data, currentEditableFields) => {
  const newEditableFields = { ...currentEditableFields };
  
  if (!data.razaoSocial) newEditableFields.razao_social = true;
  if (!data.nomeFantasia) newEditableFields.nome_fantasia = true;
  if (!data.dataAbertura) newEditableFields.data_abertura = true;
  if (!data.naturezaJuridica) newEditableFields.natureza_juridica = true;
  if (!data.endereco?.cep) newEditableFields.cep = true;
  if (!data.endereco?.logradouro) newEditableFields.logradouro = true;
  if (!data.endereco?.numero) newEditableFields.numero = true;
  if (!data.endereco?.complemento) newEditableFields.complemento = true;
  if (!data.endereco?.bairro) newEditableFields.bairro = true;
  if (!data.endereco?.cidade) newEditableFields.cidade = true;
  if (!data.endereco?.uf) newEditableFields.uf = true;
  if (!data.email) newEditableFields.email = true;
  if (!data.telefones?.[0]) newEditableFields.telefone = true;
  if (!data.cnaePrincipal?.codigo) newEditableFields.cnae_codigo = true;
  if (!data.cnaePrincipal?.descricao) newEditableFields.cnae_descricao = true;

  return newEditableFields;
};
