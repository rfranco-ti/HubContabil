/**
 * Serviço de Cache de CNPJ
 *
 * Cache de consultas de CNPJ para reduzir chamadas às APIs externas
 * TTL: 24 horas
 */

const prisma = require("../config/prisma");

// TTL do cache em milissegundos (24 horas)
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Buscar dados do cache
 * @param {string} cnpj - CNPJ da empresa (14 dígitos)
 * @returns {Promise<Object|null>} Dados da empresa ou null
 */
async function get(cnpj) {
  try {
    const cached = await prisma.cnpjCache.findFirst({
      where: {
        cnpj,
        validoAte: { gt: new Date() },
      },
    });

    if (cached) {
      console.log(`[CACHE] Hit: ${cnpj}`);
      return typeof cached.dados === "string"
        ? JSON.parse(cached.dados)
        : cached.dados;
    }

    return null;
  } catch (e) {
    console.error(`[CACHE] Erro ao buscar cache: ${e.message}`);
    return null;
  }
}

/**
 * Salvar dados no cache
 * @param {string} cnpj - CNPJ da empresa (14 dígitos)
 * @param {Object} dados - Dados da empresa
 */
async function set(cnpj, dados) {
  try {
    const validoAte = new Date(Date.now() + CACHE_TTL_MS);
    await prisma.cnpjCache.upsert({
      where: { cnpj },
      update: {
        dados: typeof dados === "string" ? dados : JSON.stringify(dados),
        validoAte,
        updatedAt: new Date(),
      },
      create: {
        cnpj,
        dados: typeof dados === "string" ? dados : JSON.stringify(dados),
        validoAte,
        fonte: "api_externa",
      },
    });
    console.log(`[CACHE] Saved: ${cnpj}`);
  } catch (e) {
    console.error(`[CACHE] Erro ao salvar cache: ${e.message}`);
  }
}

module.exports = { get, set };
