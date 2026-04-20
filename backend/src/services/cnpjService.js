/**
 * Serviço de Consulta de CNPJ com Circuit Breaker e Retry
 *
 * APIs (ordem de tentativa):
 * 1. Minha Receita (minhareceita.org) - Open source, estável
 * 2. OpenCNPJ (opencnpj.cloud) - Gratuita
 * 3. BrasilAPI (brasilapi.com.br) - Fallback
 *
 * Features:
 * - Circuit Breaker pattern (desativa API após falhas)
 * - Retry com backoff exponencial
 * - Timeout por API
 * - Cache local (banco de dados)
 */

const cnpjCache = require("./cnpjCacheService");

// Configuração das APIs
const APIS = [
  {
    nome: "minhareceita",
    url: (cnpj) => `https://minhareceita.org/${cnpj}`,
    timeout: 5000,
    circuitBreaker: {
      failures: 0,
      lastFailure: 0,
      threshold: 5,
      timeout: 60000,
    },
  },
  {
    nome: "opencnpj",
    url: (cnpj) => `https://opencnpj.cloud/v1/cnpj/${cnpj}`,
    timeout: 5000,
    circuitBreaker: {
      failures: 0,
      lastFailure: 0,
      threshold: 5,
      timeout: 60000,
    },
  },
  {
    nome: "brasilapi",
    url: (cnpj) => `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`,
    timeout: 8000,
    circuitBreaker: {
      failures: 0,
      lastFailure: 0,
      threshold: 3,
      timeout: 120000,
    },
  },
];

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Verifica se o circuit breaker está aberto
 */
function isCircuitOpen(api) {
  const { failures, lastFailure, threshold, timeout } = api.circuitBreaker;
  if (failures < threshold) return false;
  return Date.now() - lastFailure < timeout;
}

/**
 * Registra falha no circuit breaker
 */
function recordFailure(api) {
  api.circuitBreaker.failures++;
  api.circuitBreaker.lastFailure = Date.now();
}

/**
 * Reseta o circuit breaker
 */
function resetCircuit(api) {
  api.circuitBreaker.failures = 0;
  api.circuitBreaker.lastFailure = 0;
}

/**
 * Fetch com timeout
 */
async function fetchWithTimeout(url, timeout) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Fetch com retry e backoff exponencial
 */
async function fetchWithRetry(api, cnpj, retries = 3) {
  const url = api.url(cnpj);

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetchWithTimeout(url, api.timeout);

      if (response.status === 404) {
        throw new Error("CNPJ não encontrado na base de dados");
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      resetCircuit(api);
      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        console.log(`[CNPJ] ${api.nome} timeout (${api.timeout}ms)`);
      } else {
        console.log(`[CNPJ] ${api.nome} erro: ${error.message}`);
      }

      recordFailure(api);

      if (i === retries - 1) throw error;

      // Backoff exponencial: 500ms, 1s, 2s
      await sleep(Math.pow(2, i) * 500);
    }
  }
}

/**
 * Normaliza dados da Minha Receita
 */
function normMinhaReceita(d) {
  return {
    cnpj: d.cnpj || "",
    razaoSocial: d.razao_social || "",
    nomeFantasia: d.nome_fantasia || "",
    dataAbertura: d.descricao_situacao_cadastral || "",
    naturezaJuridica: d.natureza_juridica || "",
    cnaePrincipal: {
      codigo: String(d.cnae_fiscal || ""),
      descricao: d.cnae_fiscal_descricao || "",
    },
    cnaesSecundarios: (d.cnaes_secundarios || []).map((c) => ({
      codigo: String(c.codigo || ""),
      descricao: c.descricao || "",
    })),
    endereco: {
      logradouro: d.tipo_logradouro
        ? `${d.tipo_logradouro} ${d.logradouro}`
        : d.logradouro || "",
      numero: d.numero || "",
      complemento: d.complemento || "",
      bairro: d.bairro || "",
      municipio: d.municipio || "",
      uf: d.uf || "",
      cep: d.cep || "",
    },
    situacao: d.situacao_cadastral || "",
    qsa: (d.qsa || []).map((s) => ({
      nome: s.nome_socio || "",
      cpfCnpj: s.cnpj_cpf_do_socio || "",
      qualificacao: s.qualificacao_socio || "",
      participacao: null,
    })),
    capitalSocial: d.capital_social || 0,
    porte: d.descricao_porte || "",
    telefone: d.ddd_telefone_1 ? `(${d.ddd_telefone_1}) ${d.telefone_1}` : "",
    email: d.email || "",
    atualizadoEm: "",
  };
}

/**
 * Normaliza dados da OpenCNPJ
 */
function normOpenCnpj(d) {
  return {
    cnpj: d.cnpj || "",
    razaoSocial: d.company?.name || "",
    nomeFantasia: d.company?.tradeName || "",
    dataAbertura: d.company?.founded || "",
    naturezaJuridica: d.company?.nature?.text || "",
    cnaePrincipal: {
      codigo: String(d.company?.mainActivity?.code || ""),
      descricao: d.company?.mainActivity?.text || "",
    },
    cnaesSecundarios: (d.company?.sideActivities || []).map((c) => ({
      codigo: String(c.code || ""),
      descricao: c.text || "",
    })),
    endereco: {
      logradouro: d.company?.address?.street || "",
      numero: d.company?.address?.number || "",
      complemento: d.company?.address?.details || "",
      bairro: d.company?.address?.district || "",
      municipio: d.company?.address?.city || "",
      uf: d.company?.address?.state || "",
      cep: d.company?.address?.zip || "",
    },
    situacao: d.company?.status?.text || "",
    qsa: (d.company?.partners || []).map((s) => ({
      nome: s.name || "",
      cpfCnpj: s.taxId || "",
      qualificacao: s.role?.text || "",
      participacao: s.stake || null,
    })),
    capitalSocial: d.company?.equity || 0,
    porte: d.company?.size?.text || "",
    telefone: (d.company?.phones && d.company.phones[0]) || "",
    email: (d.company?.emails && d.company.emails[0]) || "",
    atualizadoEm: d.company?.updated || "",
  };
}

/**
 * Normaliza dados da BrasilAPI
 */
function normBrasilApi(d) {
  return {
    cnpj: d.cnpj || "",
    razaoSocial: d.razao_social || "",
    nomeFantasia: d.nome_fantasia || "",
    dataAbertura: d.data_inicio_atividade || "",
    naturezaJuridica: d.natureza_juridica || "",
    cnaePrincipal: {
      codigo: String(d.cnae_fiscal || ""),
      descricao: d.cnae_fiscal_descricao || "",
    },
    cnaesSecundarios: (d.cnaes_secundarios || []).map((c) => ({
      codigo: String(c.codigo || ""),
      descricao: c.descricao || "",
    })),
    endereco: {
      logradouro: d.logradouro || "",
      numero: d.numero || "",
      complemento: d.complemento || "",
      bairro: d.bairro || "",
      municipio: d.municipio || "",
      uf: d.uf || "",
      cep: d.cep || "",
    },
    situacao: d.descricao_situacao_cadastral || "",
    qsa: (d.qsa || []).map((s) => ({
      nome: s.nome_socio || "",
      cpfCnpj: s.cnpj_cpf_do_socio || "",
      qualificacao: s.qualificacao_socio || "",
      participacao: null,
    })),
    capitalSocial: d.capital_social || 0,
    porte: d.descricao_porte || "",
    telefone: d.ddd_telefone_1 || "",
    email: d.email || "",
    atualizadoEm: d.data_situacao_cadastral || "",
  };
}

/**
 * Classe principal do serviço
 */
class CnpjService {
  async consultar(cnpj) {
    const clean = cnpj.replace(/\D/g, "");
    if (clean.length !== 14) throw new Error("CNPJ inválido.");

    // 1. Verificar cache local
    try {
      const cached = await cnpjCache.get(clean);
      if (cached) return { ...cached, apiUsed: "cache", fromCache: true };
    } catch (e) {
      console.log(`[CNPJ] Cache erro: ${e.message}`);
    }

    // 2. Tentar APIs em ordem
    let lastError = "";
    for (const api of APIS) {
      // Verificar circuit breaker
      if (isCircuitOpen(api)) {
        console.log(`[CNPJ] ${api.nome} circuit aberto, pulando`);
        continue;
      }

      try {
        console.log(`[CNPJ] Tentando ${api.nome}...`);
        let raw;

        if (api.nome === "minhareceita") {
          raw = await fetchWithRetry(api, clean);
        } else if (api.nome === "opencnpj") {
          raw = await fetchWithRetry(api, clean);
        } else if (api.nome === "brasilapi") {
          raw = await fetchWithRetry(api, clean);
        }

        if (!raw) continue;

        // Normalizar dados
        let data;
        if (api.nome === "minhareceita") {
          data = normMinhaReceita(raw);
        } else if (api.nome === "opencnpj") {
          data = normOpenCnpj(raw);
        } else {
          data = normBrasilApi(raw);
        }

        if (!data?.cnpj) continue;

        // Salvar em cache (ignora erros)
        try {
          await cnpjCache.set(clean, data);
        } catch (e) {}

        console.log(`[CNPJ] ✅ ${api.nome} sucesso`);
        return { ...data, apiUsed: api.nome, fromCache: false };
      } catch (error) {
        lastError = error.message;
        console.log(`[CNPJ] ${api.nome} falhou: ${error.message}`);
      }
    }

    throw new Error(
      `Erro ao consultar CNPJ: ${lastError || "APIs indisponíveis"}`,
    );
  }
}

module.exports = new CnpjService();
