/**
 * ChatContextService v7 - Com Chunking Otimizado e Arquivos Ampliados
 *
 * Cada arquivo .md e dividido em chunks de ~800 chars com sobreposicao de 100 chars
 * Query time: score todos os chunks, seleciona top 5 mais relevantes
 * Arquivos de contexto ampliados com mais detalhes, exemplos e modelos
 */
const fs = require("fs");
const path = require("path");

const CONTEXT_FILES = [
  "01-clt-direito-trabalhista-2026.md",
  "02-ferias-13o-folha-pagamento.md",
  "03-previdencia-aposentadoria-consignado.md",
  "04-departamento-pessoal-sindicatos.md",
  "05-tributario-icms-iss-reforma.md",
  "06-irrf-irpf-tabelas-2026.md",
  "07-cnae-simples-nacional-fator-r.md",
  "08-obrigacoes-acessorias-2026.md",
  "09-mei-completo-2026.md",
  "10-doclegalbot-system-prompt.md",
  "11-base-legal-civil-trabalhista.md",
  "12-modelos-contratos-prestacao.md",
  "13-modelos-societarios.md",
  "14-modelos-alteracao-societaria.md",
  "15-guia-pratico-documentos.md",
];

const SYSTEM_PROMPT_FILE = "00-prompt-padrao-sistema.md";

// Configuracoes de chunking - ampliados para mais contexto
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 100;
const TOP_CHUNKS = 5;

let systemPrompt = "";
let allChunks = [];
let lastLoadTime = 0;
const CACHE_TTL = 10 * 60 * 1000;

function getProjectRoot() {
  return path.resolve(__dirname, "../../..");
}

/**
 * Divide texto em chunks com sobreposicao
 */
function splitIntoChunks(text, fileName) {
  const chunks = [];

  // Split por secoes (## ou ###) primeiro para preservar contexto
  const sections = text.split(/(?=^## )/gm).filter((s) => s.trim().length > 50);

  for (const section of sections) {
    if (section.length <= CHUNK_SIZE) {
      chunks.push({ file: fileName, content: section.trim(), score: 0 });
    } else {
      // Chunk grande: dividir com sobreposicao
      for (let i = 0; i < section.length; i += CHUNK_SIZE - CHUNK_OVERLAP) {
        const chunk = section.substring(i, i + CHUNK_SIZE).trim();
        if (chunk.length > 150) {
          chunks.push({ file: fileName, content: chunk, score: 0 });
        }
      }
    }
  }

  return chunks;
}

function loadAll() {
  const now = Date.now();
  if (now - lastLoadTime < CACHE_TTL && allChunks.length > 0) {
    return { systemPrompt, allChunks };
  }

  const root = getProjectRoot();
  const ctxDir = path.join(root, "ai_context");

  try {
    const p = path.join(ctxDir, SYSTEM_PROMPT_FILE);
    if (fs.existsSync(p)) systemPrompt = fs.readFileSync(p, "utf8");
  } catch (e) {
    systemPrompt = "";
  }

  allChunks = [];
  for (const file of CONTEXT_FILES) {
    const fp = path.join(ctxDir, file);
    try {
      if (fs.existsSync(fp)) {
        const content = fs.readFileSync(fp, "utf8");
        const chunks = splitIntoChunks(content, file);
        allChunks = allChunks.concat(chunks);
      }
    } catch (e) {}
  }

  lastLoadTime = now;
  return { systemPrompt, allChunks };
}

/**
 * Score de um chunk contra a query
 * Keywords mais longas valem mais, matching exato vale dobro
 */
function scoreChunk(chunk, query) {
  const q = query.toLowerCase();
  const c = chunk.content.toLowerCase();
  let score = 0;

  // Palavra por palavra da query
  const words = q.split(/\s+/).filter((w) => w.length > 2);
  for (const word of words) {
    if (c.includes(word)) {
      score += word.length * 2;
      // Bonus se aparece no inicio do chunk
      if (c.indexOf(word) < 150) score += word.length;
    }
  }

  // Bonus para termos compostos
  const phrases = [
    "fator r",
    "simples nacional",
    "anexo iii",
    "anexo v",
    "inss patronal",
    "aliquota efetiva",
    "base de calculo",
    "aviso previo",
    "hora extra",
    "ferias proporcionais",
    "contrato social",
    "ltida unipessoal",
    "cnae",
    "saida de socio",
    "entrada de socio",
    "alteracao contratual",
    "clausula de foro",
    "desimpedimento",
    "cessao de quotas",
  ];
  for (const phrase of phrases) {
    if (q.includes(phrase) && c.includes(phrase)) {
      score += phrase.length * 5;
    }
  }

  chunk.score = score;
  return score;
}

function buildSystemPrompt(query) {
  const { systemPrompt: sp, allChunks } = loadAll();

  // Score todos os chunks
  const scored = allChunks
    .map((c) => ({ ...c, score: scoreChunk(c, query) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_CHUNKS);

  let prompt =
    sp ||
    "Voce e assistente contabil brasileiro 2026. Responda em pt-BR. Seja direto. Nao invente dados.";

  if (scored.length > 0) {
    prompt += "\n\nCONTEXTO:\n";
    for (const s of scored) {
      prompt += "\n## [" + s.file + "]\n" + s.content + "\n";
    }
  }

  return prompt;
}

module.exports = { buildSystemPrompt, loadAll };
