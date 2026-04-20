/**
 * CnpjService - Serviço principal de consulta CNPJ
 *
 * Orquestra múltiplas APIs com:
 * - Configuração dinâmica via banco de dados (CnpjApiConfig)
 * - Fallback para array hardcoded se DB indisponível
 * - Circuit Breaker pattern
 * - Retry com backoff exponencial
 * - Cache em memória e banco de dados
 *
 * Ordem padrão (se DB indisponível):
 * 1. OpenCNPJ → 2. Invertexto → 3. Minha Receita → 4. Cnpja
 */

const { PrismaClient } = require("@prisma/client");
const { CircuitBreaker } = require("./CircuitBreaker");
const { memoryCache, getDbCache, setDbCache } = require("./Cache");
const { OpenCnpjAdapter } = require("./adapters/OpenCnpjAdapter");
const { InvertextoAdapter } = require("./adapters/InvertextoAdapter");
const { MinhaReceitaAdapter } = require("./adapters/MinhaReceitaAdapter");
const { CnpjaAdapter } = require("./adapters/CnpjaAdapter");

// Mapa de adapters disponíveis
const ADAPTERS = {
  opencnpj: OpenCnpjAdapter,
  invertexto: InvertextoAdapter,
  minhareceita: MinhaReceitaAdapter,
  cnpja: CnpjaAdapter,
};

// Config padrão (fallback se DB indisponível)
const DEFAULT_CONFIG = [
  {
    nome: "opencnpj",
    url: "https://api.opencnpj.org",
    ativa: true,
    ordem: 1,
    consomeCredito: false,
    timeout: 5000,
    cbThreshold: 5,
  },
  {
    nome: "invertexto",
    url: "https://api.invertexto.com/v1/cnpj",
    ativa: true,
    ordem: 2,
    consomeCredito: false,
    timeout: 5000,
    cbThreshold: 5,
  },
  {
    nome: "minhareceita",
    url: "https://minhareceita.org",
    ativa: true,
    ordem: 3,
    consomeCredito: false,
    timeout: 5000,
    cbThreshold: 5,
  },
  {
    nome: "cnpja",
    url: "https://api.cnpja.com/office",
    ativa: true,
    ordem: 4,
    consomeCredito: true,
    timeout: 8000,
    cbThreshold: 3,
  },
];

// Prisma client singleton
let prisma;
function getPrisma() {
  if (!prisma) prisma = new PrismaClient();
  return prisma;
}

// Cache de configuração (30s TTL)
let configCache = null;
let configCacheExpiry = 0;

/**
 * Busca configuração das APIs do banco de dados
 * Com fallback para array hardcoded se DB indisponível
 */
async function getApiConfigs() {
  // Verificar cache em memória (30s)
  if (configCache && Date.now() < configCacheExpiry) {
    return configCache;
  }

  try {
    const db = getPrisma();
    const configs = await db.cnpjApiConfig.findMany({
      where: { ativa: true },
      orderBy: { ordem: "asc" },
    });

    if (configs.length > 0) {
      configCache = configs;
      configCacheExpiry = Date.now() + 30 * 1000; // 30s
      return configs;
    }
  } catch (error) {
    console.log(
      `[CNPJ] DB indisponível para config, usando fallback: ${error.message}`,
    );
  }

  // Fallback
  configCache = DEFAULT_CONFIG;
  configCacheExpiry = Date.now() + 30 * 1000;
  return DEFAULT_CONFIG;
}

/**
 * Cria instâncias de APIs dinamicamente baseado na config
 */
async function buildApiInstances() {
  const configs = await getApiConfigs();
  const apis = [];

  for (const cfg of configs) {
    const AdapterClass = ADAPTERS[cfg.nome];
    if (!AdapterClass) {
      console.log(`[CNPJ] Adapter desconhecido: ${cfg.nome}`);
      continue;
    }

    const adapter = new AdapterClass();
    // Override URL se configurada
    if (cfg.url) adapter.baseUrl = cfg.url;
    if (cfg.nome === "cnpja" && adapter.apiBaseUrl)
      adapter.apiBaseUrl = cfg.url;

    apis.push({
      nome: cfg.nome,
      adapter,
      consomeCredito: cfg.consomeCredito,
      circuitBreaker: new CircuitBreaker({
        threshold: cfg.cbThreshold || 5,
        timeout: 60000,
      }),
    });
  }

  return apis;
}

/**
 * Invalida cache de configuração (chamado após updates)
 */
function invalidateConfigCache() {
  configCache = null;
  configCacheExpiry = 0;
}

/**
 * Tenta consultar uma API específica
 */
async function tryApi(apiConfig, cnpj) {
  if (apiConfig.circuitBreaker.isOpen()) {
    console.log(`[CNPJ] ${apiConfig.nome} circuit aberto, pulando`);
    throw new Error("Circuit aberto");
  }

  try {
    console.log(`[CNPJ] Tentando ${apiConfig.nome}...`);
    const data = await apiConfig.adapter.fetchAndNormalize(cnpj);
    apiConfig.circuitBreaker.recordSuccess();
    return data;
  } catch (error) {
    apiConfig.circuitBreaker.recordFailure();
    throw error;
  }
}

/**
 * Classe principal do serviço
 */
class CnpjService {
  /**
   * Consulta CNPJ com fallback automático entre APIs
   * Usa cache primeiro (5min memory + 24h DB)
   */
  async consultar(cnpj) {
    const clean = cnpj.replace(/\D/g, "");
    if (clean.length !== 14)
      throw new Error("CNPJ inválido. Deve conter 14 dígitos.");

    // 1. Verificar cache em memória
    const memCache = memoryCache.get(clean);
    if (memCache) return { ...memCache, apiUsed: "cache", fromCache: true };

    // 2. Verificar cache em banco
    const dbCache = await getDbCache(clean);
    if (dbCache) {
      memoryCache.set(clean, dbCache, 5 * 60 * 1000);
      return { ...dbCache, apiUsed: "cache", fromCache: true };
    }

    // 3. Tentar APIs em ordem
    return this._fetchFromApis(clean);
  }

  /**
   * Consulta CNPJ SEMPRE das APIs externas (ignora TODOS os caches)
   * Usado na página de detalhes onde dados frescos são obrigatórios
   */
  async consultarFresh(cnpj) {
    const clean = cnpj.replace(/\D/g, "");
    if (clean.length !== 14)
      throw new Error("CNPJ inválido. Deve conter 14 dígitos.");

    return this._fetchFromApis(clean);
  }

  /**
   * Busca dados das APIs externas com fallback dinâmico
   */
  async _fetchFromApis(clean) {
    let lastError = "";
    let apis;

    try {
      apis = await buildApiInstances();
    } catch (error) {
      throw new Error(
        `Erro ao carregar configuração das APIs: ${error.message}`,
      );
    }

    if (apis.length === 0) {
      throw new Error("Nenhuma API de CNPJ configurada");
    }

    for (const api of apis) {
      try {
        const data = await tryApi(api, clean);

        // Salvar em cache (para consultas futuras via consultar())
        memoryCache.set(clean, data, 5 * 60 * 1000);
        await setDbCache(clean, data);

        console.log(
          `[CNPJ] ✅ ${api.nome} sucesso${api.consomeCredito ? " (consome crédito)" : ""}`,
        );
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

  /**
   * Retorna estatísticas dos circuit breakers
   */
  async getStats() {
    const apis = await buildApiInstances();
    const stats = {};
    for (const api of apis) {
      stats[api.nome] = api.circuitBreaker.getStats();
    }
    stats.cache = memoryCache.getStats();
    return stats;
  }

  /**
   * Reseta manualmente um circuit breaker
   */
  async resetCircuit(apiName) {
    const apis = await buildApiInstances();
    const api = apis.find((a) => a.nome === apiName);
    if (api) {
      api.circuitBreaker.reset();
      console.log(`[CNPJ] Circuit ${apiName} resetado`);
    }
  }

  /**
   * Invalida cache de config (para uso pelo controller)
   */
  invalidateConfig() {
    invalidateConfigCache();
  }
}

// Singleton
module.exports = new CnpjService();
