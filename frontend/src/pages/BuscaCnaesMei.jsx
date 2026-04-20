import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ListFilter,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Info,
} from "lucide-react";
import { useMeiFilters } from "../hooks/useMeiFilters";
import atividadesMei from "../data/atividadesMei.json";

export default function BuscaCnaesMei() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    filters,
    pagina,
    porPagina,
    paginaAtual,
    total,
    totalPaginas,
    ITEMS_PER_PAGE,
    updateFilter,
    limparFiltros,
    setPagina,
    setPorPagina,
  } = useMeiFilters(atividadesMei, searchParams, setSearchParams);

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [buscaInput, setBuscaInput] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateFilter("busca", buscaInput);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [buscaInput, updateFilter]);

  const temFiltrosAtivos =
    filters.busca || filters.iss !== "Todos" || filters.icms !== "Todos";

  return (
    <div className="p-4 md:p-6 xl:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
            <ListFilter
              className="text-blue-600 dark:text-blue-400"
              size={28}
            />
          </div>
          Busca CNAEs MEI
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 ml-14">
          Pesquise {atividadesMei.length} atividades permitidas para MEI
        </p>
      </div>

      {/* Busca Global */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={20}
          />
          <input
            type="text"
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
            placeholder="Buscar por código, ocupação ou descrição..."
            className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>
      </div>

      {/* Botão Filtros (mobile) + Contador */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {total} de {atividadesMei.length} atividades
          </span>
          {temFiltrosAtivos && (
            <button
              onClick={limparFiltros}
              className="flex items-center gap-1 min-h-[44px] text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
              aria-label="Limpar todos os filtros"
            >
              <X size={12} /> Limpar filtros
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Exportar */}
          <button
            onClick={() => {
              const csv = ["Código,Ocupação,Descrição,ISS,ICMS\n"]
                .concat(
                  paginaAtual.map(
                    (a) =>
                      `"${a.cnae}","${a.ocupacao}","${a.descricao}","${a.iss ? "Sim" : "Não"}","${a.icms ? "Sim" : "Não"}"`,
                  ),
                )
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "atividades-mei.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="flex items-center gap-1.5 min-h-[44px] px-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            aria-label="Exportar página atual como CSV"
            title="Exportar página atual"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          {/* Toggle Filtros (mobile) */}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="lg:hidden flex items-center gap-1.5 min-h-[44px] px-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Mostrar ou ocultar filtros"
          >
            <Filter size={16} />
            <span className="sm:hidden">Filtros</span>
          </button>
        </div>
      </div>

      {/* Filtros Avançados */}
      <div
        className={`${mostrarFiltros ? "block" : "hidden"} lg:block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* ISS */}
          <SelectFilter
            label="ISS"
            options={["Todos", "Sim", "Não"]}
            value={filters.iss}
            onChange={(v) => updateFilter("iss", v)}
          />
          {/* ICMS */}
          <SelectFilter
            label="ICMS"
            options={["Todos", "Sim", "Não"]}
            value={filters.icms}
            onChange={(v) => updateFilter("icms", v)}
          />
        </div>
      </div>

      {/* Tabela Desktop */}
      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-600">
                <th className="px-4 py-3 font-bold">Código</th>
                <th className="px-4 py-3 font-bold">Ocupação</th>
                <th className="px-4 py-3 font-bold">Descrição</th>
                <th className="px-4 py-3 font-bold text-center">ISS</th>
                <th className="px-4 py-3 font-bold text-center">ICMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {paginaAtual.map((a) => (
                <MeiRowDesktop key={a.cnae} atividade={a} />
              ))}
            </tbody>
          </table>
        </div>
        {paginaAtual.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Nenhuma atividade encontrada</p>
            <p className="text-sm mt-1">Tente ajustar os filtros</p>
          </div>
        )}
      </div>

      {/* Lista Mobile */}
      <div className="md:hidden space-y-2">
        {paginaAtual.map((a) => (
          <MeiCardMobile key={a.cnae} atividade={a} />
        ))}
        {paginaAtual.length === 0 && (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Nenhuma atividade encontrada</p>
          </div>
        )}
      </div>

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <span>Por página:</span>
            <select
              value={porPagina}
              onChange={(e) => {
                setPorPagina(Number(e.target.value));
                setPagina(1);
              }}
              className="border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              {ITEMS_PER_PAGE.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina === 1}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Anterior
            </button>
            <span className="px-3 py-1.5 text-sm font-semibold text-slate-900 dark:text-white">
              {pagina} / {totalPaginas}
            </span>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina === totalPaginas}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Sub-componentes ===== */

function MeiRowDesktop({ atividade: a }) {
  return (
    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
      <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
        {a.cnae}
      </td>
      <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-200 max-w-xs truncate">
        {a.ocupacao}
      </td>
      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 max-w-sm truncate">
        {a.descricao}
      </td>
      <td className="px-4 py-3 text-center">
        {a.iss ? (
          <span className="inline-flex text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
            Sim
          </span>
        ) : (
          <span className="text-xs text-slate-400">Não</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        {a.icms ? (
          <span className="inline-flex text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
            Sim
          </span>
        ) : (
          <span className="text-xs text-slate-400">Não</span>
        )}
      </td>
    </tr>
  );
}

function MeiCardMobile({ atividade: a }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full text-left p-4 flex items-start gap-3 min-h-[44px]"
        aria-label={`Ver detalhes do CNAE ${a.cnae}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              {a.cnae}
            </span>
            {a.iss && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
                ISS
              </span>
            )}
            {a.icms && (
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full">
                ICMS
              </span>
            )}
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200 truncate">
            {a.ocupacao}
          </p>
        </div>
        {expandido ? (
          <ChevronUp
            size={18}
            className="text-slate-400 flex-shrink-0 mt-1 min-h-[44px]"
          />
        ) : (
          <ChevronDown
            size={18}
            className="text-slate-400 flex-shrink-0 mt-1 min-h-[44px]"
          />
        )}
      </button>
      {expandido && (
        <div className="px-4 pb-4 space-y-2 text-sm border-t border-slate-100 dark:border-slate-700 pt-3">
          <InfoRowMobile label="Descrição" value={a.descricao} />
          <InfoRowMobile label="ISS" value={a.iss ? "Sim" : "Não"} />
          <InfoRowMobile label="ICMS" value={a.icms ? "Sim" : "Não"} />
        </div>
      )}
    </div>
  );
}

function InfoRowMobile({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-400 uppercase">
        {label}
      </span>
      <span className="text-sm text-slate-700 dark:text-slate-300">
        {value}
      </span>
    </div>
  );
}

function SelectFilter({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-[44px] px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
