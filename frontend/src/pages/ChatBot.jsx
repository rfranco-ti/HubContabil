import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Loader2,
  Copy,
  Check,
  MessageSquare,
  FileText,
  Calculator,
  Scale,
  Calendar,
  Search,
  HelpCircle,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { handleCommand } from "../data/slashCommands";
import { getToken } from "../utils/auth";

const STORAGE_KEY = "chatbot_history";
const SESSION_KEY = "chatbot_session";

const SUGESTOES = [
  { icon: Search, label: "/cnae TI", cmd: "/cnae TI" },
  { icon: FileText, label: "/contrato sociedade", cmd: "/contrato sociedade" },
  { icon: Calculator, label: "/fatorR", cmd: "/fatorR" },
  { icon: Scale, label: "/mei", cmd: "/mei" },
  { icon: Calendar, label: "/obrigacoes", cmd: "/obrigacoes" },
  { icon: HelpCircle, label: "/ajuda", cmd: "/ajuda" },
];

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return null;
}

function saveHistory(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-20)));
  } catch {
    /* ignore */
  }
}

function loadSession() {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function saveSession(sessionId) {
  try {
    localStorage.setItem(SESSION_KEY, sessionId);
  } catch {
    /* ignore */
  }
}

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => loadSession());
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const saved = loadHistory();
    if (saved && saved.length > 0) {
      setMessages(saved);
    } else {
      setMessages([
        {
          role: "assistant",
          content: `Ola! Sou o assistente do HubContabil.

Posso te ajudar com:
- Dúvidas sobre Simples Nacional, Fator R e MEI
- Cálculos de INSS, IRRF e folha de pagamento
- Modelos de contrato e documentos societários
- Obrigações mensais e prazos
- Busca na web por atualizações legislativas

Experimente os comandos rápidos abaixo ou digite sua pergunta!`,
        },
      ]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) saveHistory(messages);
  }, [messages]);

  const sendMessage = async (text) => {
    const message = text || input.trim();
    if (!message || loading) return;

    const cmdResult = handleCommand(message);
    if (cmdResult !== null) {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: cmdResult },
      ]);
      setInput("");
      inputRef.current?.focus();
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "", loading: true },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ message, sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro na requisição");
      }

      if (data.sessionId) {
        setSessionId(data.sessionId);
        saveSession(data.sessionId);
      }

      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.loading);
        return [...filtered, { role: "assistant", content: data.reply }];
      });
    } catch (err) {
      setMessages((prev) => {
        const filtered = prev.filter((m) => !m.loading);
        return [
          ...filtered,
          {
            role: "assistant",
            content: `❌ Erro ao conectar: ${err.message}. Tente novamente.`,
          },
        ];
      });
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyToClipboard = async (text, idx) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    } catch {
      /* ignore */
    }
  };

  const limparConversa = () => {
    setSessionId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setMessages([
      {
        role: "assistant",
        content: `🗑️ Conversa limpa! Digite sua pergunta ou use os comandos rápidos.`,
      },
    ]);
  };

  const showWelcome = messages.length <= 1;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-slate-900">
      {/* Header do Chat */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <Bot className="text-indigo-600 dark:text-indigo-400" size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Assistente Contábil
              <Sparkles size={14} className="text-amber-500" />
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powered by IA • Baseado em documentação oficial
            </p>
          </div>
        </div>
        <button
          onClick={limparConversa}
          className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
          title="Nova conversa"
        >
          <Trash2 size={16} />
          <span className="hidden sm:inline">Limpar</span>
        </button>
      </div>

      {/* Comandos rápidos (só aparece na tela de boas-vindas) */}
      {showWelcome && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-wrap gap-2">
            {SUGESTOES.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s.cmd)}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 transition-colors"
              >
                <s.icon size={12} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                }`}
              >
                {msg.role === "user" ? (
                  <User size={16} />
                ) : msg.loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <MessageSquare size={16} />
                )}
              </div>
              <div className="relative group max-w-[80%]">
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : msg.loading
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 italic"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                  }`}
                >
                  {msg.loading ? (
                    "Pensando..."
                  ) : msg.role === "user" ? (
                    msg.content
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-code:bg-slate-200 dark:prose-code:bg-slate-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs">
                      <ReactMarkdown
                        components={{
                          a: (props) => (
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 underline"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
                {msg.role === "assistant" && !msg.loading && (
                  <button
                    onClick={() => copyToClipboard(msg.content, i)}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600"
                    title="Copiar resposta"
                  >
                    {copiedIdx === i ? (
                      <Check size={12} className="text-emerald-600" />
                    ) : (
                      <Copy
                        size={12}
                        className="text-slate-500 dark:text-slate-400"
                      />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
        <div className="max-w-3xl mx-auto flex items-end gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua pergunta ou /ajuda para comandos..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-2.5 transition-colors"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="flex items-center justify-center w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-colors flex-shrink-0"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
