const {
  buildSystemPrompt,
  selectModel,
} = require("../services/chatContextService");
const {
  getSession,
  addMessage,
  getHistory,
} = require("../services/chatSessionService");
const { search, shouldSearchWeb } = require("../services/webSearchService");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Modelos disponíveis
const MODEL_FAST = "llama-3.1-8b-instant"; // Sem limite de uso, respostas rápidas
const MODEL_SMART = "llama-3.3-70b-versatile"; // ~30 RPM, melhor qualidade

async function chat(req, res) {
  try {
    const { message, sessionId } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Mensagem obrigatória" });
    }

    if (!GROQ_API_KEY) {
      return res
        .status(500)
        .json({ error: "GROQ_API_KEY não configurada no servidor" });
    }

    // Gerenciar sessão
    const session = getSession(sessionId);
    addMessage(session.id, "user", message);
    const history = getHistory(session.id);

    // Modelo 8b-instant: sem limite de uso, respostas rapidas
    const model = "llama-3.1-8b-instant";

    // Montar system prompt com contexto inteligente (top 2 arquivos)
    let fullSystemPrompt = buildSystemPrompt(message);

    // Busca na web se necessário
    if (shouldSearchWeb(message)) {
      const webResults = await search(message, 6);
      if (webResults) {
        fullSystemPrompt += `\n\n🌐 DADOS DA WEB (fontes oficiais — use estes dados):\n${webResults}`;
      }
    }

    if (history) {
      fullSystemPrompt += `\n\n💬 HISTÓRICO DA CONVERSA:\n${history}`;
    }

    fullSystemPrompt += `\n\n⚠️ LEMBRE: Se não tiver certeza, diga claramente. Não invente informações contábeis, alíquotas ou leis. Ao usar dados da web, cite a fonte entre colchetes.`;

    // Chamar Groq API (sempre 70b para qualidade)
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: message.trim() },
        ],
        temperature: 0.15,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Groq API error:", errorData);
      return res.status(response.status).json({
        error: errorData.error?.message || "Erro ao comunicar com a IA",
      });
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content || "Não consegui gerar uma resposta.";

    addMessage(session.id, "assistant", reply);

    res.json({ reply, sessionId: session.id, model });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Erro interno ao processar a requisição." });
  }
}

module.exports = { chat };
