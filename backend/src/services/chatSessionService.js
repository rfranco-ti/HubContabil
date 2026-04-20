/**
 * ChatSessionService
 *
 * Gerencia histórico de conversas em memória.
 * Limpa sessões após 30min de inatividade.
 * Mantém no máximo 6 mensagens por sessão (últimas trocas).
 */

const SESSIONS = new Map();
const SESSION_TTL = 30 * 60 * 1000; // 30 minutos
const MAX_MESSAGES = 6; // Últimas 6 mensagens (3 trocas user/bot)

function getSession(sessionId) {
  if (!sessionId) sessionId = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  let session = SESSIONS.get(sessionId);
  if (!session) {
    session = { id: sessionId, messages: [], createdAt: Date.now() };
    SESSIONS.set(sessionId, session);
  } else {
    session.lastAccess = Date.now();
  }

  return session;
}

function addMessage(sessionId, role, content) {
  const session = getSession(sessionId);
  session.messages.push({ role, content, timestamp: Date.now() });

  // Manter apenas as últimas MAX_MESSAGES mensagens
  if (session.messages.length > MAX_MESSAGES) {
    session.messages = session.messages.slice(-MAX_MESSAGES);
  }

  return session;
}

function getHistory(sessionId) {
  const session = SESSIONS.get(sessionId);
  if (!session || session.messages.length === 0) return "";

  return session.messages
    .map((m) => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`)
    .join("\n\n");
}

function clearSession(sessionId) {
  SESSIONS.delete(sessionId);
}

// Auto-cleanup: remover sessões expiradas a cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of SESSIONS.entries()) {
    const lastAccess = session.lastAccess || session.createdAt;
    if (now - lastAccess > SESSION_TTL) {
      SESSIONS.delete(id);
    }
  }
}, 5 * 60 * 1000);

module.exports = { getSession, addMessage, getHistory, clearSession };
