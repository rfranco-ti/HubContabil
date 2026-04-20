/**
 * WebSearchService
 *
 * Usa Tavily SDK oficial para busca na web e extração de conteúdo.
 * Free tier: 1.000 requests/mês.
 */

const { tavily } = require("@tavily/core");

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

let client = null;

function getClient() {
  if (!TAVILY_API_KEY) return null;
  if (!client) {
    client = tavily({ apiKey: TAVILY_API_KEY });
  }
  return client;
}

/**
 * Busca na web com Tavily search
 * Retorna resultados formatados para o prompt da IA
 */
async function search(query, maxResults = 6) {
  try {
    const tvly = getClient();
    if (!tvly) return null;

    const response = await tvly.search(query, {
      maxResults,
      searchDepth: "advanced",
      includeAnswer: true,
      includeDomains: [
        "gov.br",
        "receita.economia.gov.br",
        "planalto.gov.br",
        "in.gov.br",
        "www.lexml.gov.br",
      ],
    });

    const parts = [];

    if (response.answer) {
      parts.push(`[Resumo Tavily] ${response.answer}`);
    }

    if (response.results?.length) {
      for (const r of response.results) {
        if (r.content) {
          parts.push(
            `\n[Fonte: ${r.title || r.url}]\n${r.content.substring(0, 1500)}`,
          );
        }
      }
    }

    return parts.length > 0 ? parts.join("\n\n") : null;
  } catch (e) {
    console.error("[Tavily search error]", e.message);
    return null;
  }
}

/**
 * Extrai conteúdo de uma URL específica
 * Útil quando a busca retorna um link relevante mas sem conteúdo completo
 */
async function extract(url) {
  try {
    const tvly = getClient();
    if (!tvly) return null;

    const response = await tvly.extract(url);

    if (response.rawContent) {
      return response.rawContent.substring(0, 3000);
    }
    if (response.content) {
      return response.content.substring(0, 3000);
    }
    return null;
  } catch (e) {
    console.error("[Tavily extract error]", e.message);
    return null;
  }
}

/**
 * Decide se deve buscar na web e executa
 *
 * Busca na web quando:
 * - Pergunta sobre DOU, notícias, atualizações recentes
 * - Pergunta sobre legislação nova/mudança recente
 * - Contexto local não encontrou arquivos relevantes
 */
function shouldSearchWeb(query) {
  const q = query.toLowerCase();
  const triggers = [
    "dou",
    "diário oficial",
    "diario oficial",
    "hoje",
    "ontem",
    "essa semana",
    "este mês",
    "este ano",
    "nova lei",
    "novo decreto",
    "nova portaria",
    "atualização",
    "atualizado",
    "mudança",
    "recente",
    "publicado",
    "publicação",
    "alíquota 2026",
    "alíquota 2027",
    "tabela 2026",
    "tabela 2027",
    "salário mínimo 2026",
    "salário mínimo 2027",
    "reforma tributária",
    "ibs",
    "cbs",
    "inss 2026",
    "irrf 2026",
    "iss 2026",
    "icms 2026",
    "pesquisar",
    "busca",
    "encontre",
    "consulte",
  ];

  return triggers.some((t) => q.includes(t));
}

module.exports = { search, extract, shouldSearchWeb };
