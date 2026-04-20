import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  DollarSign,
  Shield,
  FileText,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  ArrowUpRight,
  AlertCircle,
  UserPlus,
  FileCheck,
  StickyNote,
  Activity,
  Calculator,
  Star,
} from "lucide-react";

import feriadosJSON from "../data/feriados_2026.json";
import obrigacoesJSON from "../data/obrigacoes_2026.json";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const fmt = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v || 0,
  );
const fmtNum = (v) => new Intl.NumberFormat("pt-BR").format(v || 0);

const fetchAPI = async (endpoint) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
};

// Cores por categoria (mesmas do calendario)
const CORES_CATEGORIA = {
  "Tributário Federal": {
    bg: "#3B82F6",
    border: "#3B82F6",
    text: "#2563EB",
    icon: "🏛️",
  },
  "Trabalhista e Previdenciário": {
    bg: "#10B981",
    border: "#10B981",
    text: "#059669",
    icon: "👷",
  },
  Feriados: { bg: "#EF4444", border: "#EF4444", text: "#DC2626", icon: "🎌" },
  "RH - Recursos Humanos": {
    bg: "#EC4899",
    border: "#EC4899",
    text: "#DB2777",
    icon: "🎉",
  },
};

function getCorCategoria(cat) {
  return (
    CORES_CATEGORIA[cat] || {
      bg: "#6B7280",
      border: "#6B7280",
      text: "#4B5563",
      icon: "📅",
    }
  );
}

// Lista de calculadoras disponiveis
const CALCULADORAS = [
  {
    id: "horas-extras",
    nome: "Horas Extras",
    path: "/calculos/horas-extras",
    icon: "⏱️",
  },
  {
    id: "salario-liquido",
    nome: "Salário Líquido",
    path: "/calculos/salario-liquido",
    icon: "💰",
  },
  { id: "ferias", nome: "Férias", path: "/calculos/ferias", icon: "🏖️" },
  {
    id: "decimo-terceiro",
    nome: "13º Salário",
    path: "/calculos/decimo-terceiro",
    icon: "📅",
  },
  { id: "rescisao", nome: "Rescisão", path: "/calculos/rescisao", icon: "📋" },
  {
    id: "insalubridade",
    nome: "Insalubridade",
    path: "/calculos/insalubridade-periculosidade",
    icon: "⚠️",
  },
  { id: "irpf", nome: "IRPF", path: "/calculos/irpf", icon: "🏛️" },
  {
    id: "simples-nacional",
    nome: "Simples Nacional",
    path: "/calculos/simples-nacional",
    icon: "📊",
  },
  {
    id: "pis-cofins",
    nome: "PIS/COFINS",
    path: "/calculos/pis-cofins",
    icon: "💵",
  },
  { id: "iss", nome: "ISS", path: "/calculos/iss-retencao", icon: "🏢" },
  { id: "icms", nome: "ICMS Bahia", path: "/calculos/icms-bahia", icon: "📍" },
  {
    id: "lucro-real",
    nome: "Lucro Real",
    path: "/calculos/lucro-real",
    icon: "📈",
  },
  {
    id: "lucro-presumido",
    nome: "Lucro Presumido",
    path: "/calculos/lucro-presumido",
    icon: "📉",
  },
  {
    id: "depreciacao",
    nome: "Depreciação",
    path: "/calculos/depreciacao",
    icon: "🏭",
  },
  {
    id: "aposentadoria",
    nome: "Aposentadoria",
    path: "/calculos/aposentadoria",
    icon: "👴",
  },
];

function getFavoritos() {
  try {
    const saved = localStorage.getItem("calc-favoritos");
    if (saved) return JSON.parse(saved);
  } catch {
    return ["horas-extras", "salario-liquido", "ferias", "decimo-terceiro"];
  }
  return ["horas-extras", "salario-liquido", "ferias", "decimo-terceiro"];
}

function setFavoritos(ids) {
  try {
    localStorage.setItem("calc-favoritos", JSON.stringify(ids));
  } catch {
    return;
  }
}

// Widget S com icone ajustavel
function WidgetS({
  titulo,
  valor,
  subtitulo,
  icone: Icone,
  cor,
  onClick,
  iconSize = 16,
}) {
  const cores = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };
  return (
    <button
      onClick={onClick}
      className="h-28 bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between hover:shadow-md hover:border-gray-300 transition-all text-left group"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-gray-500 truncate">{titulo}</p>
        <div
          className={"p-1.5 rounded-lg border " + (cores[cor] || cores.blue)}
        >
          <Icone size={iconSize} />
        </div>
      </div>
      <div>
        <p className="text-xl font-bold text-gray-900">{valor}</p>
        {subtitulo && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitulo}</p>
        )}
      </div>
    </button>
  );
}

function WidgetM({ titulo, icone: Icone, badge, acao, children }) {
  return (
    <div className="h-72 bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          {Icone && <Icone size={16} className="text-gray-500" />}
          <h3 className="font-semibold text-gray-900 text-sm">{titulo}</h3>
          {badge && (
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
              {badge}
            </span>
          )}
        </div>
        {acao}
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

// Tooltip do calendario - mostra TODOS eventos do dia
function TooltipEvento({ eventos, onClose }) {
  if (!eventos || eventos.length === 0) return null;
  return (
    <div
      className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden pointer-events-auto"
      onMouseEnter={function (e) {
        e.stopPropagation();
      }}
      onMouseLeave={onClose}
    >
      <div className="px-3 py-2 bg-slate-800 border-b border-slate-700">
        <p className="text-sm font-semibold">
          {eventos.length} evento{eventos.length > 1 ? "s" : ""}
        </p>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {eventos.map(function (evento, idx) {
          const cor = getCorCategoria(evento.categoria);
          return (
            <div
              key={idx}
              className="px-3 py-2 border-b border-slate-800 last:border-b-0"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{cor.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">
                    {evento.nome}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {evento.categoria}
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-400">Data</span>
                <span className="text-slate-300 font-medium">
                  {evento.dataFormatada}
                </span>
              </div>
              {evento.periodoApuracao && (
                <div className="flex justify-between text-[10px] mt-0.5">
                  <span className="text-slate-400">Período</span>
                  <span className="text-slate-300 font-medium text-right max-w-[140px] truncate">
                    {evento.periodoApuracao}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Widget de Próximos Eventos (unificado - obrigações + feriados)
function WidgetProximosEventos({ dados }) {
  const eventos = dados?.proximosEventos || [];
  const navigate = useNavigate();
  const mesesNomes = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  // Cores alinhadas com o Calendário Definitivo
  const categoriaCores = {
    "Tributário Federal": {
      bg: "bg-blue-100 dark:bg-blue-900/20",
      text: "text-blue-800 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      icon: "🏛️",
    },
    "Trabalhista e Previdenciário": {
      bg: "bg-green-100 dark:bg-green-900/20",
      text: "text-green-800 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
      icon: "👷",
    },
    Feriados: {
      bg: "bg-red-100 dark:bg-red-900/20",
      text: "text-red-800 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      icon: "🎌",
    },
  };
  return (
    <WidgetM
      titulo="Próximos Eventos"
      icone={Calendar}
      badge={eventos.length}
      acao={
        <Link
          to="/calendario"
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
        >
          Ver calendário <ArrowUpRight size={12} />
        </Link>
      }
    >
      {eventos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-slate-500">
          <Calendar size={32} className="mb-2 opacity-50" />
          <p className="text-sm">Nenhum evento próximo</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-700/50 -mx-3">
          {eventos.map((ev, i) => {
            const catStyle = categoriaCores[ev.categoria] || {
              bg: "bg-gray-100 dark:bg-gray-900/20",
              text: "text-gray-800 dark:text-gray-400",
              border: "border-gray-200 dark:border-gray-800",
              icon: "📋",
            };
            const isHoje = ev.diffDias === 0;
            const isAmanha = ev.diffDias === 1;
            const bgCor = isHoje
              ? "bg-blue-50/70 dark:bg-blue-900/10 border-l-2 border-blue-400"
              : isAmanha
                ? "bg-amber-50/50 dark:bg-amber-900/10 border-l-2 border-amber-400"
                : "";
            return (
              <div
                key={i}
                className={
                  "px-3 py-2.5 cursor-pointer " +
                  bgCor +
                  " hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                }
                onClick={function () {
                  navigate("/calendario");
                }}
              >
                <div className="flex items-start gap-3">
                  {/* Data */}
                  <div className="flex-shrink-0 w-12 text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">
                      {String(ev.dia).padStart(2, "0")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {mesesNomes[ev.mes - 1]}
                    </p>
                  </div>
                  {/* Divider */}
                  <div className="w-px h-12 bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base flex-shrink-0">
                        {catStyle.icon}
                      </span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {ev.nome}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={
                          "text-[10px] px-1.5 py-0.5 rounded border " +
                          catStyle.bg +
                          " " +
                          catStyle.text +
                          " " +
                          catStyle.border
                        }
                      >
                        {ev.categoria?.split(" ")[0]}
                      </span>
                      {ev.periodoApuracao && (
                        <span className="text-[10px] text-gray-500 dark:text-slate-400 truncate">
                          {ev.periodoApuracao}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Quando */}
                  <span
                    className={
                      "text-xs flex-shrink-0 font-medium " +
                      (isHoje
                        ? "text-blue-600 dark:text-blue-400"
                        : isAmanha
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-gray-500 dark:text-slate-400")
                    }
                  >
                    {ev.quando}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetM>
  );
}

function WidgetAtividadesRecentes({ dados }) {
  const iconesMap = {
    "user-plus": UserPlus,
    "file-upload": FileCheck,
    "sticky-note": StickyNote,
    activity: Activity,
  };
  const coresMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    gray: "bg-gray-100 text-gray-600",
  };
  const atividades = dados?.atividades || [];
  return (
    <WidgetM titulo="Atividades Recentes" icone={Activity}>
      {atividades.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <Activity size={32} className="mb-2 opacity-50" />
          <p className="text-sm">Nenhuma atividade recente</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {atividades.map((at, i) => {
            const Icone = iconesMap[at.icon] || Activity;
            return (
              <div key={i} className="px-4 py-2.5 flex items-start gap-3">
                <div
                  className={
                    "p-1.5 rounded-lg " +
                    (coresMap[at.cor] || "bg-gray-100 text-gray-600") +
                    " flex-shrink-0"
                  }
                >
                  <Icone size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {at.titulo}
                  </p>
                  {at.descricao && (
                    <p className="text-xs text-gray-400 truncate">
                      {at.descricao}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {at.tempoRelativo}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </WidgetM>
  );
}

// Widget de calculadoras favoritas
function WidgetCalculadoras() {
  const navigate = useNavigate();
  const [favoritos, setFavoritosState] = useState(getFavoritos);
  const [editando, setEditando] = useState(false);
  const calculadorasFavoritas = favoritos
    .map((id) => CALCULADORAS.find((c) => c.id === id))
    .filter(Boolean);

  function toggleFavorito(id) {
    let novos;
    if (favoritos.includes(id)) {
      novos = favoritos.filter((f) => f !== id);
    } else if (favoritos.length < 4) {
      novos = [...favoritos, id];
    } else {
      return;
    }
    setFavoritosState(novos);
    setFavoritos(novos);
  }

  return (
    <WidgetM
      titulo="Calculadoras"
      icone={Calculator}
      acao={
        <button
          onClick={() => setEditando(!editando)}
          className={
            "text-xs px-2 py-1 rounded-lg transition-colors " +
            (editando
              ? "bg-blue-100 text-blue-700 font-medium"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100")
          }
        >
          {editando ? "✓ Pronto" : "✏ Editar"}
        </button>
      }
    >
      {editando ? (
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-2">
            Selecione até 4 calculadoras favoritas:
          </p>
          <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto">
            {CALCULADORAS.map((calc) => {
              const isFav = favoritos.includes(calc.id);
              const podeAdicionar = isFav || favoritos.length < 4;
              return (
                <button
                  key={calc.id}
                  onClick={() => podeAdicionar && toggleFavorito(calc.id)}
                  disabled={!isFav && !podeAdicionar}
                  className={
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all " +
                    (isFav
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : podeAdicionar
                        ? "bg-gray-50 text-gray-600 hover:bg-gray-100"
                        : "bg-gray-50 text-gray-300 cursor-not-allowed")
                  }
                >
                  <span className="text-sm">{calc.icon}</span>
                  <span className="truncate">{calc.nome}</span>
                  {isFav && (
                    <Star size={10} className="text-blue-500 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-3">
          {calculadorasFavoritas.map((calc) => (
            <button
              key={calc.id}
              onClick={() => navigate(calc.path)}
              className="flex flex-col items-center gap-2 p-3 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all group"
            >
              <span className="text-2xl">{calc.icon}</span>
              <span className="text-xs font-medium text-center">
                {calc.nome}
              </span>
              <ArrowUpRight
                size={12}
                className="text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all"
              />
            </button>
          ))}
        </div>
      )}
    </WidgetM>
  );
}

// Calendario mensal do dashboard - usa JSON local
function WidgetCalendarioMensal({ dados }) {
  const [mesOffset, setMesOffset] = useState(0);
  const [eventoHover, setEventoHover] = useState(null);
  const hoverTimer = useRef(null);
  const navigate = useNavigate();
  const agora = new Date();
  const mesAlvo = useMemo(
    () => new Date(agora.getFullYear(), agora.getMonth() + mesOffset, 1),
    [agora.getFullYear(), agora.getMonth(), mesOffset],
  );
  const ano = mesAlvo.getFullYear();
  const mes = mesAlvo.getMonth();
  const hoje = useMemo(
    () => new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()),
    [agora.getFullYear(), agora.getMonth(), agora.getDate()],
  );
  const mesesNomes = useMemo(
    () => [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ],
    [],
  );
  const diasNomes = useMemo(
    () => ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
    [],
  );
  const primeiroDia = useMemo(() => new Date(ano, mes, 1).getDay(), [ano, mes]);
  const diasNoMes = useMemo(
    () => new Date(ano, mes + 1, 0).getDate(),
    [ano, mes],
  );

  // Processar eventos do calendario - usa JSON local
  const eventosPorDia = useMemo(() => {
    const eventos = {};
    const mesNome = mesesNomes[mes];
    const obrigacoesMesData = dados?.obrigacoes?.[mesNome];

    // Converter para array se for objeto
    const obrigacoesMes = Array.isArray(obrigacoesMesData)
      ? obrigacoesMesData
      : obrigacoesMesData
        ? Object.entries(obrigacoesMesData).map(([dia, items]) => ({
            dia,
            items,
          }))
        : [];

    // Processar obrigacoes
    obrigacoesMes.forEach(function (diaObj) {
      // Suporta tanto formato { dia: [...] } quanto array direto
      if (diaObj.dia && diaObj.items) {
        // Formato novo: { dia: "15", items: [...] }
        const dia = diaObj.dia;
        if (!eventos[dia]) eventos[dia] = [];
        diaObj.items.forEach(function (ob) {
          eventos[dia].push({
            nome: ob.eventName || ob.nome || "Obrigação",
            categoria: ob.eventBase || ob.categoria || "Obrigação",
            periodoApuracao: ob.eventPeriod || ob.periodo,
            dia: parseInt(dia),
            mes: mes + 1,
            dataFormatada:
              String(dia).padStart(2, "0") +
              "/" +
              String(mes + 1).padStart(2, "0") +
              "/" +
              ano,
            tipo: "obrigacao",
          });
        });
      } else {
        // Formato antigo: { "15": [{...}] }
        Object.entries(diaObj).forEach(function ([dia, ob]) {
          if (!eventos[dia]) eventos[dia] = [];
          eventos[dia].push({
            nome: ob.eventName || ob.nome || "Obrigação",
            categoria: ob.eventBase || ob.categoria || "Obrigação",
            periodoApuracao: ob.eventPeriod || ob.periodo,
            dia: parseInt(dia),
            mes: mes + 1,
            dataFormatada:
              String(dia).padStart(2, "0") +
              "/" +
              String(mes + 1).padStart(2, "0") +
              "/" +
              ano,
            tipo: "obrigacao",
          });
        });
      }
    });

    // Processar feriados
    const feriados = dados?.feriados || [];
    feriados.forEach(function (f) {
      if (!f.data) return;
      const partes = f.data.split("/");
      if (partes.length !== 3) return;
      const diaF = parseInt(partes[0]);
      const mesF = parseInt(partes[1]) - 1;
      const anoF = parseInt(partes[2]);
      if (anoF === ano && mesF === mes) {
        const key = diaF + "-" + (mesF + 1);
        if (!eventos[key]) eventos[key] = [];
        eventos[key].push({
          nome: f.nome,
          categoria:
            f.tipo === "nacional"
              ? "Feriado Nacional"
              : f.tipo === "estadual"
                ? "Feriado Estadual"
                : f.tipo === "municipal"
                  ? "Feriado Municipal"
                  : "Ponto Facultativo",
          periodoApuracao: null,
          dia: diaF,
          mes: mesF + 1,
          dataFormatada: f.data,
          tipo: "feriado",
        });
      }
    });

    return eventos;
  }, [dados?.obrigacoes, dados?.feriados, ano, mes, mesesNomes]);

  // Construir array de dias - memoizado
  const dias = useMemo(() => {
    const d = [];
    for (var i = 0; i < primeiroDia; i++) d.push(null);
    for (var day = 1; day <= diasNoMes; day++) d.push(day);
    return d;
  }, [primeiroDia, diasNoMes]);

  function handleDiaClick(dia) {
    var dataStr =
      ano +
      "-" +
      String(mes + 1).padStart(2, "0") +
      "-" +
      String(dia).padStart(2, "0");
    navigate("/calendario?data=" + dataStr);
  }

  // Cleanup timer
  useEffect(function () {
    return function () {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <h3 className="font-semibold text-gray-900">
            {mesesNomes[mes]} {ano}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={function () {
              setMesOffset(function (p) {
                return p - 1;
              });
            }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={function () {
              setMesOffset(function (p) {
                return p + 1;
              });
            }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <ChevronRight size={16} />
          </button>
          <Link
            to="/calendario"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-2 flex items-center gap-1"
          >
            Completo <ArrowUpRight size={12} />
          </Link>
        </div>
      </div>

      {/* Grid do calendario */}
      <div className="p-4 relative">
        {/* Cabecalhos (Dom → Sab) */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {diasNomes.map(function (d) {
            return (
              <div
                key={d}
                className="text-center text-xs font-semibold text-gray-500 py-1"
              >
                {d}
              </div>
            );
          })}
        </div>

        {/* Dias do mes */}
        <div className="grid grid-cols-7 gap-1">
          {dias.map(function (dia, idx) {
            if (!dia) return <div key={"e-" + idx} />;
            var key = dia + "-" + (mes + 1);
            var evtsDoDia = eventosPorDia[key] || [];
            var eHoje =
              new Date(ano, mes, dia).toDateString() === hoje.toDateString();

            // Determinar cores baseado nas categorias dos eventos
            var corPrincipal = null;
            if (evtsDoDia.length > 0) {
              var cat = evtsDoDia[0].categoria;
              corPrincipal = getCorCategoria(cat);
            }

            var cls = "text-gray-700 hover:bg-gray-100 cursor-pointer";
            if (eHoje)
              cls =
                "bg-blue-600 text-white font-bold cursor-pointer hover:bg-blue-700";
            else if (corPrincipal)
              cls =
                "text-gray-800 font-medium cursor-pointer hover:bg-gray-200";

            return (
              <div
                key={dia}
                className={
                  "relative h-10 rounded-lg flex flex-col items-center justify-center text-xs transition-all " +
                  cls
                }
                onClick={function () {
                  handleDiaClick(dia);
                }}
                onMouseEnter={function () {
                  if (hoverTimer.current) clearTimeout(hoverTimer.current);
                  if (evtsDoDia.length > 0)
                    setEventoHover({ dia: dia, eventos: evtsDoDia });
                }}
                onMouseLeave={function () {
                  hoverTimer.current = setTimeout(function () {
                    setEventoHover(null);
                  }, 200);
                }}
              >
                <span>{dia}</span>
                {/* Indicador visual - bolinha colorida por categoria */}
                {evtsDoDia.length > 0 && !eHoje && (
                  <div className="flex gap-0.5 mt-0.5">
                    {evtsDoDia.slice(0, 3).map(function (ev, i) {
                      var c = getCorCategoria(ev.categoria);
                      return (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: c.border }}
                        />
                      );
                    })}
                  </div>
                )}
                {/* Tooltip com nome do evento + detalhes */}
                {eventoHover &&
                  eventoHover.dia === dia &&
                  evtsDoDia.length > 0 &&
                  !eHoje && (
                    <TooltipEvento
                      eventos={evtsDoDia}
                      onClose={function () {
                        hoverTimer.current = setTimeout(function () {
                          setEventoHover(null);
                        }, 200);
                      }}
                    />
                  )}
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
            Hoje
          </div>
          {Object.keys(CORES_CATEGORIA).map(function (cat) {
            var c = CORES_CATEGORIA[cat];
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: c.border }}
                />
                <span>{cat.split(" ")[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [atividades, setAtividades] = useState(null);
  const [calendario, setCalendario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  // Calcular próximos eventos a partir de obrigações + feriados
  const calcularProximosEventos = useCallback(function () {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const eventos = [];
    const mesesNomes = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    // Processar obrigações dos próximos 30 dias
    const obrigacoesData = obrigacoesJSON["2026"] || {};
    Object.entries(obrigacoesData).forEach(function ([mesNome, diasObj]) {
      const mesIdx = mesesNomes.indexOf(mesNome);
      if (mesIdx < 0) return;

      Object.entries(diasObj).forEach(function ([diaStr, eventosArr]) {
        const dia = parseInt(diaStr);
        const dataEvento = new Date(2026, mesIdx, dia);
        dataEvento.setHours(0, 0, 0, 0);
        const diffDias = Math.ceil((dataEvento - hoje) / (1000 * 60 * 60 * 24));

        // Incluir eventos de hoje até os próximos 30 dias
        if (diffDias >= 0 && diffDias <= 30) {
          eventosArr.forEach(function (ev) {
            eventos.push({
              nome: ev.eventName,
              categoria: ev.calendar || ev.eventBase || "Obrigação",
              periodoApuracao: ev.eventPeriod,
              baseLegal: ev.eventBase,
              dia: dia,
              mes: mesIdx + 1,
              ano: 2026,
              data: dataEvento,
              diffDias: diffDias,
              quando:
                diffDias === 0
                  ? "Hoje"
                  : diffDias === 1
                    ? "Amanhã"
                    : diffDias <= 7
                      ? `${diffDias} dias`
                      : `${Math.ceil(diffDias / 7)} sem`,
              tipo: "obrigacao",
            });
          });
        }
      });
    });

    // Processar feriados
    const feriados = feriadosJSON.feriados_consolidados_2026 || [];
    feriados.forEach(function (f) {
      if (!f.data) return;
      const partes = f.data.split("/");
      if (partes.length !== 3) return;
      const diaF = parseInt(partes[0]);
      const mesF = parseInt(partes[1]);
      const anoF = parseInt(partes[2]);
      const dataFeriado = new Date(anoF, mesF - 1, diaF);
      dataFeriado.setHours(0, 0, 0, 0);
      const diffDias = Math.ceil((dataFeriado - hoje) / (1000 * 60 * 60 * 24));

      if (diffDias >= 0 && diffDias <= 30) {
        eventos.push({
          nome: f.nome,
          categoria:
            f.tipo === "nacional"
              ? "Feriados"
              : f.tipo === "estadual"
                ? "Feriados"
                : "Feriados",
          periodoApuracao: null,
          baseLegal: f.tipo,
          dia: diaF,
          mes: mesF,
          ano: anoF,
          data: dataFeriado,
          diffDias: diffDias,
          quando:
            diffDias === 0
              ? "Hoje"
              : diffDias === 1
                ? "Amanhã"
                : `${diffDias} dias`,
          tipo: "feriado",
        });
      }
    });

    // Ordenar por data (mais próximo primeiro) e limitar a 8
    eventos.sort(function (a, b) {
      return a.diffDias - b.diffDias;
    });

    return eventos.slice(0, 8);
  }, []);

  const carregarDados = useCallback(
    function () {
      setLoading(true);
      setErro(null);
      Promise.allSettled([
        fetchAPI("/dashboard/kpis"),
        fetchAPI("/dashboard/atividades"),
      ])
        .then(function (results) {
          if (results[0].status === "fulfilled" && results[0].value.success)
            setKpis(results[0].value.kpis);
          if (results[1].status === "fulfilled" && results[1].value.success)
            setAtividades(results[1].value);

          // Calendario vem dos JSON locais
          const feriados = feriadosJSON.feriados_consolidados_2026;
          const obrigacoes = obrigacoesJSON["2026"];
          const proximosEventos = calcularProximosEventos();

          setCalendario({
            feriados: feriados,
            obrigacoes: obrigacoes,
            proximosEventos: proximosEventos,
          });

          if (
            results.every(function (r) {
              return r.status === "rejected";
            })
          )
            setErro("Não foi possível carregar os dados do dashboard");
        })
        .catch(function (err) {
          setErro(err.message);
        })
        .finally(function () {
          setLoading(false);
        });
    },
    [calcularProximosEventos],
  );

  useEffect(
    function () {
      carregarDados();
    },
    [carregarDados],
  );

  if (loading) {
    return (
      <div className="p-4 md:p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-3 text-gray-500 font-medium">
            Carregando dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Visão geral do escritório contábil
          </p>
        </div>
        <button
          onClick={carregarDados}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {erro && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{erro}</p>
          <button
            onClick={carregarDados}
            className="text-sm text-red-600 underline ml-auto"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* 6 KPIs SMALL */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <WidgetS
          titulo="Clientes Ativos"
          valor={fmtNum(kpis?.clientes?.ativos)}
          subtitulo={(kpis?.clientes?.total || 0) + " total"}
          icone={Users}
          cor="blue"
          iconSize={20}
          onClick={function () {
            window.location.href = "/clientes";
          }}
        />
        <WidgetS
          titulo="Honorários Mensais"
          valor={fmt(kpis?.honorarios?.total)}
          subtitulo="Receita recorrente"
          icone={DollarSign}
          cor="green"
          onClick={function () {
            window.location.href = "/clientes";
          }}
        />
        <WidgetS
          titulo="Certificados Válidos"
          valor={fmtNum(kpis?.certificados?.validos)}
          subtitulo={
            (kpis?.certificados?.expirando?.length || 0) + " expirando"
          }
          icone={Shield}
          cor="amber"
          iconSize={20}
          onClick={function () {
            window.location.href = "/certificados";
          }}
        />
        <WidgetS
          titulo="Documentos do Mês"
          valor={fmtNum(kpis?.documentos?.mes)}
          subtitulo="Uploads realizados"
          icone={FileCheck}
          cor="cyan"
          onClick={function () {
            window.location.href = "/documentos";
          }}
        />
        <WidgetS
          titulo="Notificações"
          valor={fmtNum(kpis?.notificacoes?.naoLidas)}
          subtitulo="Não lidas"
          icone={Bell}
          cor="red"
          onClick={function () {
            window.location.href = "/notificacoes";
          }}
        />
      </div>

      {/* Calendario L */}
      <div className="mb-6">
        <WidgetCalendarioMensal dados={calendario} />
      </div>

      {/* Proximos Eventos */}
      <div className="mb-6">
        <WidgetProximosEventos dados={calendario} />
      </div>

      {/* Atividades + Calculadoras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <WidgetAtividadesRecentes dados={atividades} />
        <WidgetCalculadoras />
      </div>

      {/* Certificados Expirando */}
      {kpis?.certificados?.expirando?.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WidgetM titulo="Certificados Expirando" icone={AlertTriangle}>
            <div className="divide-y divide-gray-50">
              {kpis.certificados.expirando.slice(0, 5).map(function (c, i) {
                var urgente = c.diasRestantes <= 7;
                return (
                  <div
                    key={i}
                    className={
                      "px-4 py-2.5 flex items-center justify-between " +
                      (urgente ? "bg-red-50/50" : "")
                    }
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[250px]">
                        {c.nome}
                      </p>
                      <p className="text-xs text-gray-400">
                        Vence em {c.diasRestantes} dias
                      </p>
                    </div>
                    <span
                      className={
                        "text-xs px-2 py-0.5 rounded-full font-medium " +
                        (urgente
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700")
                      }
                    >
                      {c.diasRestantes}d
                    </span>
                  </div>
                );
              })}
            </div>
          </WidgetM>
        </div>
      )}
    </div>
  );
}
