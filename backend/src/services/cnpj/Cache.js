/**
 * Cache em Memória com TTL
 *
 * Cache LRU simples para evitar requisições repetidas à mesma API
 * em curtos períodos de tempo.
 */

class MemoryCache {
  constructor(defaultTTL = 300000) {
    // 5 minutos padrão
    this.store = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Busca valor do cache
   * @param {string} key - Chave do cache
   * @returns {any|null} Valor cache ou null se expirado/inexistente
   */
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;

    // Verificar se expirou
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Salva valor no cache
   * @param {string} key - Chave do cache
   * @param {any} data - Dados a cache
   * @param {number} ttl - TTL em ms (opcional, usa default)
   */
  set(key, data, ttl = this.defaultTTL) {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });

    // Limite de 1000 itens no cache
    if (this.store.size > 1000) {
      const firstKey = this.store.keys().next().value;
      this.store.delete(firstKey);
    }
  }

  /**
   * Verifica se chave existe no cache (e não expirou)
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Remove chave do cache
   */
  delete(key) {
    this.store.delete(key);
  }

  /**
   * Limpa cache completamente
   */
  clear() {
    this.store.clear();
  }

  /**
   * Retorna estatísticas
   */
  getStats() {
    return {
      size: this.store.size,
      maxSize: 1000,
    };
  }
}

// Singleton para cache em memória (5 minutos)
const memoryCache = new MemoryCache(5 * 60 * 1000);

// Cache em banco de dados (24 horas)
const DB_CACHE_TTL = 24 * 60 * 60 * 1000;

async function getDbCache(cnpj) {
  try {
    const prisma = require("../../../config/prisma");
    const cached = await prisma.cnpjCache.findFirst({
      where: {
        cnpj,
        validoAte: { gt: new Date() },
      },
    });

    if (cached) {
      console.log(`[CNPJ] DB Cache hit: ${cnpj}`);
      return typeof cached.dados === "string"
        ? JSON.parse(cached.dados)
        : cached.dados;
    }
  } catch (e) {
    console.log(`[CNPJ] DB Cache error: ${e.message}`);
  }
  return null;
}

async function setDbCache(cnpj, data) {
  try {
    const prisma = require("../../../config/prisma");
    const validoAte = new Date(Date.now() + DB_CACHE_TTL);

    await prisma.cnpjCache.upsert({
      where: { cnpj },
      update: {
        dados: typeof data === "string" ? data : JSON.stringify(data),
        validoAte,
        updatedAt: new Date(),
      },
      create: {
        cnpj,
        dados: typeof data === "string" ? data : JSON.stringify(data),
        validoAte,
        fonte: "api_externa",
      },
    });
    console.log(`[CNPJ] DB Cache saved: ${cnpj}`);
  } catch (e) {
    console.log(`[CNPJ] DB Cache save error: ${e.message}`);
  }
}

module.exports = {
  MemoryCache,
  memoryCache,
  cache: memoryCache,
  getDbCache,
  setDbCache,
  DB_CACHE_TTL,
};
