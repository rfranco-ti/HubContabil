/**
 * Serviço centralizado de consulta de CNPJ
 *
 * Gerencia consultas a APIs externas com fallback automático:
 * 1. Backend (que usa open.cnpja.com com retry + invertexto.com como fallback)
 * 2. Cache do backend (banco de dados)
 *
 * Todas as consultas passam pelo backend para:
 * - Evitar exposição de tokens no frontend
 * - Usar fallback automático (open.cnpja → invertexto)
 * - Cache centralizado no banco de dados
 * - Rate limiting gerenciado pelo servidor
 */

import api from "./api";

const API_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Normalizar dados de CNPJ para formato padrão do sistema
 * Unifica campos de diferentes APIs (open.cnpja, invertexto, etc.)
 */
function normalizarDadosCnpj(data, apiUsed) {
  if (!data) return null;

  const base = {
    apiUsed: apiUsed || "desconhecida",
    // CNPJ
    cnpj: data.taxId || data.cnpj || data.numero_cnpj || "",
    // Razão Social
    razaoSocial:
      data.company?.name || data.razao_social || data.nome_empresarial || "",
    // Nome Fantasia
    nomeFantasia:
      data.company?.tradeName || data.nome_fantasia || data.nome_fantasia || "",
    // Data Abertura
    dataAbertura:
      data.company?.founded || data.data_abertura || data.abertura || "",
    // Natureza Jurídica
    naturezaJuridica:
      data.company?.nature?.text || data.natureza_juridica || "",
    // CNAE Principal
    cnaePrincipal: {
      codigo: data.company?.mainActivity?.code || data.cnae_fiscal || "",
      descricao:
        data.company?.mainActivity?.text || data.cnae_fiscal_descricao || "",
    },
    // CNAEs Secundários
    cnaesSecundarios: (
      data.company?.sideActivities ||
      data.cnaes_secundarios ||
      []
    ).map((c) => ({
      codigo: c.code || c.codigo || "",
      descricao: c.text || c.descricao || "",
    })),
    // Endereço
    endereco: {
      logradouro: data.company?.address?.street || data.logradouro || "",
      numero: data.company?.address?.number || data.numero || "",
      complemento: data.company?.address?.details || data.complemento || "",
      bairro: data.company?.address?.district || data.bairro || "",
      municipio: data.company?.address?.city || data.municipio || "",
      uf: data.company?.address?.state || data.uf || "",
      cep: data.company?.address?.zip || data.cep || "",
    },
    // Situação
    situacao: data.company?.status?.text || data.situacao_cadastral || "",
    // QSA (Sócios)
    qsa: (data.company?.partners || data.qsa || []).map((s) => ({
      nome: s.name || s.nome || s.socio || "",
      cpfCnpj: s.taxId || s.cpf_cnpj || "",
      qualificacao: s.role?.text || s.qualificacao || "",
      participacao: s.stake || s.percentual_capital || null,
    })),
    // Capital Social
    capitalSocial: data.company?.capital || data.capital_social || 0,
    // Porte
    porte: data.company?.size?.text || data.porte || "",
    // Telefone
    telefone:
      (data.company?.phones && data.company.phones[0]) ||
      data.ddd_telefone_1 ||
      "",
    // Email
    email: (data.company?.emails && data.company.emails[0]) || data.email || "",
    // Efrenica (última atualização)
    atualizadoEm: data.company?.updated || data.data_situacao_cadastral || "",
  };

  return base;
}

/**
 * Consultar CNPJ via backend (com fallback automático)
 *
 * O backend gerencia:
 * - Cache em banco de dados
 * - open.cnpja.com (primária, com retry em 429)
 * - api.invertexto.com (fallback)
 * - Normalização de dados
 *
 * @param {string} cnpj - CNPJ com 14 dígitos
 * @returns {Promise<Object>} Dados normalizados da empresa
 */
async function consultarCnpj(cnpj) {
  const cleanCnpj = cnpj.replace(/\D/g, "");

  if (cleanCnpj.length !== 14) {
    throw new Error("CNPJ inválido. Deve conter 14 dígitos.");
  }

  const response = await api.get(`/clientes/consulta/${cleanCnpj}`);
  const result = response.data;
  const normalized = normalizarDadosCnpj(result.data, result.apiUsed);

  if (!normalized || !normalized.cnpj) {
    throw new Error(
      "CNPJ não encontrado ou dados inválidos retornados pela API.",
    );
  }

  return normalized;
}

/**
 * Consultar CNPJ para cadastro rápido (formato simplificado)
 * Retorna apenas dados essenciais para pré-preenchimento
 *
 * @param {string} cnpj - CNPJ com 14 dígitos
 * @returns {Promise<Object>} Dados simplificados
 */
async function consultarCnpjSimples(cnpj) {
  const dados = await consultarCnpj(cnpj);
  return {
    cnpj: dados.cnpj,
    razaoSocial: dados.razaoSocial,
    nomeFantasia: dados.nomeFantasia,
    dataAbertura: dados.dataAbertura,
    naturezaJuridica: dados.naturezaJuridica,
    cnaePrincipal: dados.cnaePrincipal,
    endereco: dados.endereco,
    situacao: dados.situacao,
    apiUsed: dados.apiUsed,
  };
}

/**
 * Buscar empresas por nome/razão social via backend
 * Usa bff.cnpja.com (sem necessidade de token)
 *
 * @param {string} query - Termo de busca
 * @returns {Promise<Array>} Lista de empresas encontradas
 */
async function buscarEmpresas(query) {
  if (!query || query.length < 3) {
    throw new Error("Digite pelo menos 3 caracteres para pesquisar.");
  }

  const response = await api.get(`/clientes/pesquisa`, {
    params: { query }
  });

  const result = response.data;
  return result.empresas || result.data || [];
}

/**
 * Verificar se um CNPJ existe (validação rápida)
 * Não retorna dados, apenas confirma existência
 *
 * @param {string} cnpj - CNPJ com 14 dígitos
 * @returns {Promise<boolean>} True se CNPJ existe
 */
async function validarCnpj(cnpj) {
  try {
    const dados = await consultarCnpj(cnpj);
    return !!dados.cnpj;
  } catch {
    return false;
  }
}

export const cnpjAPI = {
  consultar: consultarCnpj,
  consultarSimples: consultarCnpjSimples,
  buscarEmpresas: buscarEmpresas,
  validarCnpj: validarCnpj,
  normalizarDados: normalizarDadosCnpj,
};
