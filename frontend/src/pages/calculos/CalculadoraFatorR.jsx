import { useState, useMemo, useRef, useEffect } from "react";
import {
  Calculator,
  Search,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  BarChart3,
  FileText,
  HelpCircle,
  ArrowRightLeft,
  Target,
  Info,
  Sparkles,
  User,
  Briefcase,
} from "lucide-react";
import { useFatorR, FAQ_FATOR_R } from "../../hooks/useFatorR";
import cnaesData from "../../data/cnaes.json";

const { cnaes } = cnaesData;
const cnaesComFatorR = cnaes.filter((c) => c.fatorR === "Sim");

const fmt = (v) => {
  if (v === null || v === undefined || isNaN(v)) return "—";
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};
const parseMoeda = (v) => parseFloat(v.replace(/\D/g, "")) / 100 || 0;
const formatMoedaInput = (v) => {
  const n = parseFloat(v.replace(/\D/g, ""));
  if (isNaN(n)) return "";
  return (n / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
};

// Calcula encargos automáticos a partir da base salarial
function calcularEncargos(baseSalarial) {
  if (!baseSalarial || baseSalarial <= 0)
    return { inss: 0, fgts: 0, ferias13: 0, total: 0 };
  const inss = baseSalarial * 0.2;
  const fgts = baseSalarial * 0.08;
  const ferias13 = baseSalarial * (1 / 12 + 1 / 12); // férias + 1/3 ≈ 16.67%
  return { inss, fgts, ferias13, total: inss + fgts + ferias13 };
}

function calcularFolhaMinima(receitaMensal, meses = 12) {
  if (!receitaMensal || receitaMensal <= 0 || meses < 1) return null;
  const receitaAcumulada = receitaMensal * meses;
  const folhaMinimaTotal = receitaAcumulada * 0.28;
  const folhaMinimaMensal = folhaMinimaTotal / meses;
  const base = folhaMinimaTotal;
  const inss = (base * 0.2) / 1.2;
  const fgts = ((base - inss) * 0.08) / 1.08;
  const ferias13 = ((base - inss - fgts) * 0.1667) / 1.1667;
  const salariosProLabore = base - inss - fgts - ferias13;
  return {
    receitaAcumulada,
    folhaMinimaTotal,
    folhaMinimaMensal,
    breakdown: {
      salariosProLabore,
      proLabore: salariosProLabore * 0.3,
      salariosFunc: salariosProLabore * 0.7,
      inssPatronal: inss,
      fgts,
      ferias13,
    },
  };
}

export default function CalculadoraFatorR() {
  const { calcularCenario, LIMITE_FATOR_R } = useFatorR();
  const [modo, setModo] = useState("direto");

  // Modo Direto
  const [cnaeSelecionado, setCnaeSelecionado] = useState("");
  const [buscaCnae, setBuscaCnae] = useState("");
  const [mostrarDropdownCnae, setMostrarDropdownCnae] = useState(false);
  const [receita12m, setReceita12m] = useState("");

  // Funcionários
  const [temFuncionarios, setTemFuncionarios] = useState(false);
  const [numFuncionarios, setNumFuncionarios] = useState(1);
  const [salarioMedioFunc, setSalarioMedioFunc] = useState("");
  const [proLaboreMensal, setProLaboreMensal] = useState("");
  const [mesesAtividade, setMesesAtividade] = useState(1);

  // Modo Reverso
  const [receitaMensalRev, setReceitaMensalRev] = useState("");

  // FAQ
  const [buscaFaq, setBuscaFaq] = useState("");
  const [faqAberto, setFaqAberto] = useState({});
  const cnaeRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (cnaeRef.current && !cnaeRef.current.contains(e.target))
        setMostrarDropdownCnae(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cnaesFiltrados = useMemo(() => {
    if (!buscaCnae) return cnaesComFatorR.slice(0, 50);
    const b = buscaCnae.toLowerCase();
    return cnaesComFatorR
      .filter(
        (c) =>
          c.codigo.toLowerCase().includes(b) ||
          c.descricao.toLowerCase().includes(b),
      )
      .slice(0, 50);
  }, [buscaCnae]);

  // Cálculos automáticos de encargos
  const salariosFunc12m =
    parseMoeda(salarioMedioFunc) * numFuncionarios * mesesAtividade;
  const proLabore12m = parseMoeda(proLaboreMensal) * mesesAtividade;
  const baseFolhaMensal = temFuncionarios
    ? parseMoeda(salarioMedioFunc) * numFuncionarios +
      parseMoeda(proLaboreMensal)
    : parseMoeda(proLaboreMensal);
  const encargosMensal = calcularEncargos(baseFolhaMensal);
  const encargos12m = encargosMensal.total * mesesAtividade;
  const totalFolha12m = salariosFunc12m + proLabore12m + encargos12m;

  // Resultado modo direto
  const resultadoDireto = useMemo(() => {
    const receita = parseMoeda(receita12m);
    if (!receita || !totalFolha12m) return null;
    return calcularCenario({ receita12m: receita, folha12m: totalFolha12m });
  }, [receita12m, totalFolha12m, mesesAtividade, calcularCenario]);

  // Resultado modo reverso
  const resultadoReverso = useMemo(() => {
    const rev = parseMoeda(receitaMensalRev);
    if (!rev) return null;
    return calcularFolhaMinima(rev, mesesAtividade);
  }, [receitaMensalRev, mesesAtividade]);

  // FAQ
  const faqFiltrado = useMemo(() => {
    if (!buscaFaq.trim()) return FAQ_FATOR_R;
    const b = buscaFaq.toLowerCase();
    return FAQ_FATOR_R.filter(
      (i) =>
        i.pergunta.toLowerCase().includes(b) ||
        i.resposta.toLowerCase().includes(b) ||
        i.tags.some((t) => t.toLowerCase().includes(b)),
    );
  }, [buscaFaq]);

  const toggleFaq = (i) => setFaqAberto((p) => ({ ...p, [i]: !p[i] }));

  const [mostrarInfoFolha, setMostrarInfoFolha] = useState(false);
  const infoFolhaRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (infoFolhaRef.current && !infoFolhaRef.current.contains(e.target))
        setMostrarInfoFolha(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const itensFolha = [
    {
      item: "Salários dos funcionários",
      desc: "Remuneração base mensal × nº de funcionários",
      icone: "💵",
    },
    {
      item: "Pró-labore dos sócios",
      desc: "Remuneração dos sócios/administradores",
      icone: "👤",
    },
    {
      item: "Férias + 1/3 constitucional",
      desc: "Férias anuais proporcionais acrescidas de 1/3",
      icone: "🏖️",
    },
    {
      item: "13º salário",
      desc: "Gratificação natalina proporcional",
      icone: "🎄",
    },
    {
      item: "INSS Patronal (CPP)",
      desc: "20% sobre a base salarial (contribuição previdenciária da empresa)",
      icone: "🏛️",
    },
    {
      item: "FGTS",
      desc: "8% sobre a base salarial (Fundo de Garantia por Tempo de Serviço)",
      icone: "🏦",
    },
    {
      item: "Salário-família",
      desc: "Benefício para empregados com salário baixo (se aplicável)",
      icone: "👶",
    },
    {
      item: "Adicional noturno / horas extras",
      desc: "Se houver, integram a base de cálculo",
      icone: "🌙",
    },
  ];

  const naoEntram = [
    "Vale-transporte",
    "Vale-alimentação / Vale-refeição",
    "Assistência médica / Odontológica",
    "Seguro de vida",
    "Participação nos lucros e resultados (PLR)",
    "Auxílio-creche",
    "Indenizações (aviso prévio, dano moral)",
  ];

  return (
    <div className="p-4 md:p-6 xl:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
            <Calculator
              className="text-indigo-600 dark:text-indigo-400"
              size={28}
            />
          </div>
          Calculadora Fator R
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 ml-14">
          Descubra se sua empresa se enquadra no Anexo III ou V do Simples
          Nacional
        </p>
      </div>

      {/* Toggle de Modo */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 flex items-center gap-1 max-w-md">
        <button
          onClick={() => setModo("direto")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            modo === "direto"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          <ArrowRightLeft size={16} /> Calcular Fator R
        </button>
        <button
          onClick={() => setModo("reverso")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            modo === "reverso"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          <Target size={16} /> Folha Necessária
        </button>
      </div>

      {/* ===== MODO DIRETO ===== */}
      {modo === "direto" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="space-y-5">
            {/* CNAE */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText
                  size={18}
                  className="text-blue-600 dark:text-blue-400"
                />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Atividade (CNAE)
                </h2>
              </div>
              <div className="relative" ref={cnaeRef}>
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  value={buscaCnae}
                  onChange={(e) => {
                    setBuscaCnae(e.target.value);
                    setMostrarDropdownCnae(true);
                    if (!e.target.value) setCnaeSelecionado("");
                  }}
                  onFocus={() => setMostrarDropdownCnae(true)}
                  placeholder="Buscar por código ou descrição..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {mostrarDropdownCnae && cnaesFiltrados.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                    {cnaesFiltrados.map((c) => (
                      <button
                        key={c.codigo}
                        onClick={() => {
                          setCnaeSelecionado(c.codigo);
                          setBuscaCnae(`${c.codigo} — ${c.descricao}`);
                          setMostrarDropdownCnae(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-600 ${cnaeSelecionado === c.codigo ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                      >
                        <span className="font-mono text-xs font-bold text-blue-600">
                          {c.codigo}
                        </span>
                        <span className="ml-2 text-slate-700 dark:text-slate-300">
                          {c.descricao}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Receita */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3
                  size={18}
                  className="text-emerald-600 dark:text-emerald-400"
                />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Receita Bruta
                </h2>
              </div>
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                  R$
                </span>
                <input
                  type="text"
                  value={receita12m}
                  onChange={(e) =>
                    setReceita12m(formatMoedaInput(e.target.value))
                  }
                  placeholder="0,00"
                  className="w-full pl-10 pr-4 py-2.5 text-lg font-mono border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                  Meses de atividade
                </label>
                <select
                  value={mesesAtividade}
                  onChange={(e) => setMesesAtividade(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m} {m === 1 ? "mês" : "meses"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tem funcionários? */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users
                  size={18}
                  className="text-violet-600 dark:text-violet-400"
                />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Folha de Pagamento
                </h2>
                <div className="relative ml-auto" ref={infoFolhaRef}>
                  <button
                    onClick={() => setMostrarInfoFolha(!mostrarInfoFolha)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  >
                    <Info size={12} /> O que entra?
                  </button>
                  {mostrarInfoFolha && (
                    <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">
                      <div className="p-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <CheckCircle size={14} className="text-emerald-600" />{" "}
                          Itens que COMPÕEM a folha
                        </h3>
                        <div className="space-y-2">
                          {itensFolha.map((it, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg"
                            >
                              <span className="text-base flex-shrink-0">
                                {it.icone}
                              </span>
                              <div>
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                  {it.item}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {it.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <XCircle size={14} className="text-red-600" /> Itens
                          que NÃO entram
                        </h3>
                        <div className="space-y-1">
                          {naoEntram.map((item, idx) => (
                            <p
                              key={idx}
                              className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
                            >
                              <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
                              {item}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 p-3">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          <strong>Base legal:</strong> Art. 28 da Lei 8.212/91 e
                          IN RFB 2.110/2022. Em caso de dúvida, consulte seu
                          contador.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Toggle funcionários */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  A empresa possui funcionários?
                </span>
                <div className="flex ml-auto gap-1">
                  <button
                    onClick={() => setTemFuncionarios(true)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      temFuncionarios
                        ? "bg-violet-600 text-white"
                        : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setTemFuncionarios(false)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                      !temFuncionarios
                        ? "bg-violet-600 text-white"
                        : "bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>

              {temFuncionarios ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                        <Users size={12} /> Qtd. Funcionários
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={numFuncionarios}
                        onChange={(e) =>
                          setNumFuncionarios(
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className="w-full px-3 py-2.5 text-sm font-mono border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                        Salário médio
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                          R$
                        </span>
                        <input
                          type="text"
                          value={salarioMedioFunc}
                          onChange={(e) =>
                            setSalarioMedioFunc(
                              formatMoedaInput(e.target.value),
                            )
                          }
                          placeholder="0,00"
                          className="w-full pl-10 pr-4 py-2.5 text-sm font-mono border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                      <User size={12} /> Pró-labore mensal (sócio)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                        R$
                      </span>
                      <input
                        type="text"
                        value={proLaboreMensal}
                        onChange={(e) =>
                          setProLaboreMensal(formatMoedaInput(e.target.value))
                        }
                        placeholder="0,00"
                        className="w-full pl-10 pr-4 py-2.5 text-sm font-mono border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                  {/* Resumo automático */}
                  {salariosFunc12m > 0 && (
                    <div className="space-y-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Salários ({numFuncionarios} func. × {mesesAtividade}m)
                        </span>
                        <span className="font-bold">
                          {fmt(salariosFunc12m)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Pró-labore ({mesesAtividade}m)
                        </span>
                        <span className="font-bold">{fmt(proLabore12m)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          INSS Patronal (20%)
                        </span>
                        <span className="font-bold">
                          {fmt(encargosMensal.inss * mesesAtividade)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          FGTS (8%)
                        </span>
                        <span className="font-bold">
                          {fmt(encargosMensal.fgts * mesesAtividade)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Férias + 13º
                        </span>
                        <span className="font-bold">
                          {fmt(encargosMensal.ferias13 * mesesAtividade)}
                        </span>
                      </div>
                      <div className="border-t border-violet-200 dark:border-violet-700 pt-1.5 flex justify-between">
                        <span className="font-bold text-violet-700 dark:text-violet-300 uppercase text-xs">
                          Total da Folha
                        </span>
                        <span className="font-black text-violet-700 dark:text-violet-300">
                          {fmt(totalFolha12m)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-2">
                    <Briefcase
                      size={16}
                      className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                    />
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Sem funcionários. O cálculo será baseado apenas no{" "}
                      <strong>pró-labore do sócio</strong> + encargos.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5 flex items-center gap-1">
                      <User size={12} /> Pró-labore mensal
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                        R$
                      </span>
                      <input
                        type="text"
                        value={proLaboreMensal}
                        onChange={(e) =>
                          setProLaboreMensal(formatMoedaInput(e.target.value))
                        }
                        placeholder="0,00"
                        className="w-full pl-10 pr-4 py-2.5 text-sm font-mono border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                  {/* Resumo automático */}
                  {proLabore12m > 0 && (
                    <div className="space-y-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Pró-labore ({mesesAtividade}m)
                        </span>
                        <span className="font-bold">{fmt(proLabore12m)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          INSS Patronal (20%)
                        </span>
                        <span className="font-bold">
                          {fmt(encargosMensal.inss * mesesAtividade)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          FGTS (8%)
                        </span>
                        <span className="font-bold">
                          {fmt(encargosMensal.fgts * mesesAtividade)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          Férias + 13º
                        </span>
                        <span className="font-bold">
                          {fmt(encargosMensal.ferias13 * mesesAtividade)}
                        </span>
                      </div>
                      <div className="border-t border-violet-200 dark:border-violet-700 pt-1.5 flex justify-between">
                        <span className="font-bold text-violet-700 dark:text-violet-300 uppercase text-xs">
                          Total da Folha
                        </span>
                        <span className="font-black text-violet-700 dark:text-violet-300">
                          {fmt(totalFolha12m)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Resultado Direto */}
          <div className="space-y-5">
            {resultadoDireto ? (
              <>
                <div
                  className={`rounded-2xl border-2 p-5 ${resultadoDireto.fatorR >= LIMITE_FATOR_R ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700" : "bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-700"}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp
                      size={20}
                      className={
                        resultadoDireto.fatorR >= LIMITE_FATOR_R
                          ? "text-emerald-600"
                          : "text-red-600"
                      }
                    />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Fator R
                    </h2>
                  </div>
                  <div className="text-4xl font-black mb-2">
                    <span
                      className={
                        resultadoDireto.fatorR >= LIMITE_FATOR_R
                          ? "text-emerald-600"
                          : "text-red-600"
                      }
                    >
                      {(resultadoDireto.fatorR * 100).toFixed(2)}%
                    </span>
                    <span className="text-lg font-semibold text-slate-400 ml-2">
                      {resultadoDireto.fatorR >= LIMITE_FATOR_R ? "≥" : "<"} 28%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-1 relative">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${resultadoDireto.fatorR >= LIMITE_FATOR_R ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{
                        width: `${Math.min(resultadoDireto.fatorR * 100, 50)}%`,
                      }}
                    />
                    <div
                      className="absolute top-0 w-0.5 h-3 bg-red-500"
                      style={{ left: "28%" }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0%</span>
                    <span className="text-red-500 font-semibold flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Limite 28%
                    </span>
                    <span>50%</span>
                  </div>
                  <div
                    className={`mt-4 flex items-center gap-2 p-3 rounded-xl ${resultadoDireto.fatorR >= LIMITE_FATOR_R ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                  >
                    {resultadoDireto.fatorR >= LIMITE_FATOR_R ? (
                      <CheckCircle size={20} className="text-emerald-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                    <div>
                      <p
                        className={`font-bold ${resultadoDireto.fatorR >= LIMITE_FATOR_R ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}
                      >
                        Enquadrado no {resultadoDireto.anexoLabel}
                      </p>
                      <p className="text-xs opacity-80">
                        Faixa {resultadoDireto.faixa}ª
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign
                      size={18}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    Tributação ({resultadoDireto.anexoLabel})
                  </h2>
                  <div className="space-y-2">
                    {[
                      [
                        "Alíquota nominal",
                        `${resultadoDireto.aliquotaNominal}%`,
                      ],
                      [
                        "Alíquota efetiva",
                        `${resultadoDireto.aliquotaEfetiva.toFixed(2)}%`,
                      ],
                      ["Imposto mensal", fmt(resultadoDireto.impostoMensal)],
                      ["Imposto anual", fmt(resultadoDireto.impostoAnual)],
                    ].map(([l, v]) => (
                      <div
                        key={l}
                        className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
                      >
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {l}
                        </span>
                        <span
                          className={`text-sm font-bold ${l.includes("efetiva") ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-white"}`}
                        >
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sparkles
                      size={18}
                      className="text-amber-600 dark:text-amber-400"
                    />
                    Comparativo
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">
                            Item
                          </th>
                          <th className="text-right py-2 text-xs font-semibold text-blue-600 uppercase">
                            {resultadoDireto.anexoLabel}
                          </th>
                          <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase">
                            {resultadoDireto.comparativo.anexoLabel}
                          </th>
                          <th className="text-right py-2 text-xs font-semibold text-emerald-600 uppercase">
                            Dif.
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        <tr>
                          <td className="py-2 text-slate-600 dark:text-slate-400">
                            Alíq. nominal
                          </td>
                          <td className="py-2 text-right font-bold">
                            {resultadoDireto.aliquotaNominal}%
                          </td>
                          <td className="py-2 text-right font-bold">
                            {resultadoDireto.comparativo.aliquotaNominal}%
                          </td>
                          <td className="py-2 text-right font-bold text-emerald-600">
                            {(
                              resultadoDireto.comparativo.aliquotaNominal -
                              resultadoDireto.aliquotaNominal
                            ).toFixed(1)}
                            %
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-slate-600 dark:text-slate-400">
                            Imposto/mês
                          </td>
                          <td className="py-2 text-right font-bold">
                            {fmt(resultadoDireto.impostoMensal)}
                          </td>
                          <td className="py-2 text-right font-bold">
                            {fmt(resultadoDireto.comparativo.impostoMensal)}
                          </td>
                          <td className="py-2 text-right font-bold text-emerald-600">
                            {fmt(
                              Math.abs(
                                resultadoDireto.comparativo.impostoMensal -
                                  resultadoDireto.impostoMensal,
                              ),
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 text-slate-600 dark:text-slate-400">
                            Imposto/ano
                          </td>
                          <td className="py-2 text-right font-bold">
                            {fmt(resultadoDireto.impostoAnual)}
                          </td>
                          <td className="py-2 text-right font-bold">
                            {fmt(resultadoDireto.comparativo.impostoAnual)}
                          </td>
                          <td className="py-2 text-right font-bold text-emerald-600">
                            {fmt(
                              Math.abs(
                                resultadoDireto.comparativo.impostoAnual -
                                  resultadoDireto.impostoAnual,
                              ),
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {resultadoDireto.fatorR < LIMITE_FATOR_R && (
                    <div className="mt-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-2">
                      <AlertTriangle
                        size={18}
                        className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                      />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Para se enquadrar no <strong>Anexo III</strong>,
                        precisaria de uma folha de{" "}
                        <strong>
                          {fmt(parseMoeda(receita12m) * LIMITE_FATOR_R)}
                        </strong>{" "}
                        em {mesesAtividade} meses.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                <Calculator
                  size={48}
                  className="mx-auto mb-4 text-slate-300 dark:text-slate-600"
                />
                <p className="text-lg font-bold text-slate-600 dark:text-slate-400">
                  Preencha os dados ao lado
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  Informe a receita bruta e a folha de pagamento
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== MODO REVERSO ===== */}
      {modo === "reverso" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target
                  size={18}
                  className="text-emerald-600 dark:text-emerald-400"
                />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Calculadora Reversa
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Com base na sua receita, descubra quanto precisa investir em
                folha para atingir Fator R ≥ 28%.
              </p>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                  Receita Bruta Mensal
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    R$
                  </span>
                  <input
                    type="text"
                    value={receitaMensalRev}
                    onChange={(e) =>
                      setReceitaMensalRev(formatMoedaInput(e.target.value))
                    }
                    placeholder="0,00"
                    className="w-full pl-10 pr-4 py-2.5 text-lg font-mono border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                  Meses de atividade
                </label>
                <select
                  value={mesesAtividade}
                  onChange={(e) => setMesesAtividade(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m} {m === 1 ? "mês" : "meses"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 flex items-start gap-2">
                <Info
                  size={16}
                  className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Para cada <strong>R$ 1.000,00</strong> de receita mensal, você
                  precisa de <strong>~R$ 280,00</strong> em folha.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {resultadoReverso ? (
              <>
                <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle
                      size={20}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Meta do Fator R: ≥ 28%
                    </h2>
                  </div>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                    {fmt(resultadoReverso.folhaMinimaTotal)}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Folha mínima necessária em {mesesAtividade}{" "}
                    {mesesAtividade === 1 ? "mês" : "meses"}
                  </p>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-1">
                    <div
                      className="h-3 rounded-full bg-emerald-500"
                      style={{ width: "28%" }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>0%</span>
                    <span className="text-emerald-600 font-bold">
                      28% ← Sua meta
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign
                      size={18}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    Média Mensal Necessária
                  </h2>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-4">
                    {fmt(resultadoReverso.folhaMinimaMensal)}
                    <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">
                      /mês
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">
                    Composição estimada
                  </h3>
                  <div className="space-y-2">
                    {[
                      [
                        "Salários de funcionários",
                        resultadoReverso.breakdown.salariosFunc,
                      ],
                      [
                        "Pró-labore dos sócios",
                        resultadoReverso.breakdown.proLabore,
                      ],
                      [
                        "INSS Patronal (20%)",
                        resultadoReverso.breakdown.inssPatronal,
                      ],
                      ["FGTS (8%)", resultadoReverso.breakdown.fgts],
                      [
                        "Férias + 13º proporcionais",
                        resultadoReverso.breakdown.ferias13,
                      ],
                    ].map(([label, valor]) => (
                      <div
                        key={label}
                        className="flex justify-between items-center py-1.5 px-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {label}
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-white">
                          {fmt(valor)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <TrendingUp
                      size={18}
                      className="text-amber-600 dark:text-amber-400"
                    />
                    Cenários Possíveis
                  </h2>
                  <div className="space-y-2">
                    {[0.2, 0.28, 0.4].map((fator) => {
                      const folhaCenario =
                        parseMoeda(receitaMensalRev) * mesesAtividade * fator;
                      const isMeta = Math.abs(fator - 0.28) < 0.01;
                      return (
                        <div
                          key={fator}
                          className={`flex items-center justify-between p-3 rounded-xl ${isMeta ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800" : "bg-slate-50 dark:bg-slate-700/50"}`}
                        >
                          <div className="flex items-center gap-2">
                            {isMeta ? (
                              <CheckCircle
                                size={16}
                                className="text-emerald-600"
                              />
                            ) : fator < 0.28 ? (
                              <XCircle size={16} className="text-red-500" />
                            ) : (
                              <CheckCircle
                                size={16}
                                className="text-emerald-600"
                              />
                            )}
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              Fator R = {(fator * 100).toFixed(0)}%
                            </span>
                          </div>
                          <span
                            className={`text-sm font-bold ${isMeta ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"}`}
                          >
                            {fator < 0.28 ? "Anexo V ❌" : "Anexo III ✅"}
                          </span>
                          <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                            {fmt(folhaCenario)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                <Target
                  size={48}
                  className="mx-auto mb-4 text-slate-300 dark:text-slate-600"
                />
                <p className="text-lg font-bold text-slate-600 dark:text-slate-400">
                  Informe sua receita mensal
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  Descubra quanto precisa investir em folha
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== FAQ ===== */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle
            size={20}
            className="text-indigo-600 dark:text-indigo-400"
          />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Perguntas Frequentes sobre Fator R
          </h2>
        </div>
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            value={buscaFaq}
            onChange={(e) => setBuscaFaq(e.target.value)}
            placeholder="Pesquisar dúvidas (ex: o que entra na folha, anexo III, 28%)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-2">
          {faqFiltrado.length > 0 ? (
            faqFiltrado.map((item, i) => (
              <div
                key={i}
                className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 pr-4">
                    {item.pergunta}
                  </span>
                  {faqAberto[i] ? (
                    <ChevronUp
                      size={18}
                      className="text-slate-400 flex-shrink-0"
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      className="text-slate-400 flex-shrink-0"
                    />
                  )}
                </button>
                {faqAberto[i] && (
                  <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-3">
                    {item.resposta}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Search size={32} className="mx-auto mb-2 opacity-40" />
              <p className="font-semibold">Nenhuma dúvida encontrada</p>
              <p className="text-sm mt-1">Tente buscar com outros termos</p>
            </div>
          )}
        </div>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Referência:</strong> Lei Complementar nº 123/2006, alterada
            pela LC 155/2016. Consulte sempre um contador para decisões
            tributárias.
          </p>
        </div>
      </div>
    </div>
  );
}
