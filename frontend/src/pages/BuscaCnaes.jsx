import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  ListFilter,
  X,
  Download,
  Filter,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useCnaeFilters } from "../hooks/useCnaeFilters";
import { ResponsiveTable, InfoRow } from "../components/ui/ResponsiveTable";
import cnaesData from "../data/cnaes.json";

const { cnaes, filtros } = cnaesData;

export default function BuscaCnaes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    filters,
    pagina,
    porPagina,
    paginaAtual,
    total,
    totalPaginas,
    ITEMS_PER_PAGE,
    aliquotasDisponiveis,
    aliquotaIncompativel,
    updateFilter,
    limparFiltros,
    toggleMulti,
    setPagina,
    setPorPagina,
  } = useCnaeFilters(cnaes, searchParams, setSearchParams);

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [buscaInput, setBuscaInput] = useState("");
  const debounceRef = useRef(null);

  // Debounce na busca
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateFilter("busca", buscaInput);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [buscaInput, updateFilter]);

  const temFiltrosAtivos =
    filters.busca ||
    filters.tipo.length > 0 ||
    filters.simples !== "Todos" ||
    filters.anexo.length > 0 ||
    filters.aliquota !== "Todas" ||
    filters.precisaIE !== "Todos" ||
    filters.soComObs ||
    filters.obsBusca;

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
          Busca por CNAEs
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 ml-14">
          Pesquise {cnaes.length} CNAEs por código, descrição ou atividade
          econômica
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
            placeholder="Buscar por código ou descrição (ex: 4721, padaria, cultivo)..."
            className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
        </div>
      </div>

      {/* Botão Filtros (mobile) + Contador */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {total} de {cnaes.length} CNAEs
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
              const csv = [
                "Código,Descrição,Tipo,Simples,Anexo,Alíquota,Precisa IE,Observação\n",
              ]
                .concat(
                  paginaAtual.map(
                    (c) =>
                      `"${c.codigo}","${c.descricao}","${c.tipo}","${c.simples}","${c.anexo}","${c.aliquota}","${c.precisaIE}","${c.observacaoIE}"`,
                  ),
                )
                .join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "cnaes.csv";
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
        {/* Aviso: alíquota incompatível com anexo */}
        {aliquotaIncompativel && (
          <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-start gap-3">
            <AlertTriangle
              className="text-amber-500 flex-shrink-0 mt-0.5"
              size={18}
            />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Alíquota indisponível para o(s) anexo(s) selecionado(s)
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                A alíquota <strong>{filters.aliquota}</strong> não existe para
                os anexos selecionados. Mostrando resultados sem filtro de
                alíquota.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Tipo */}
          <MultiSelectFilter
            label="Tipo de Atividade"
            options={filtros.tipos}
            selected={filters.tipo}
            onToggle={(v) => toggleMulti("tipo", v)}
          />
          {/* Simples Nacional */}
          <SelectFilter
            label="Simples Nacional"
            options={["Todos", "Sim", "Não"]}
            value={filters.simples}
            onChange={(v) => updateFilter("simples", v)}
          />
          {/* Anexo */}
          <MultiSelectFilter
            label="Anexo Simples"
            options={filtros.anexos}
            selected={filters.anexo}
            onToggle={(v) => toggleMulti("anexo", v)}
          />
          {/* Alíquota (dinâmica, baseada nos anexos selecionados) */}
          <SelectFilter
            label="Alíquota"
            options={["Todas", ...aliquotasDisponiveis]}
            value={filters.aliquota}
            onChange={(v) => updateFilter("aliquota", v)}
          />
          {/* Fator R */}
          <SelectFilter
            label="Fator R"
            options={["Todos", "Sim", "Não"]}
            value={filters.fatorR}
            onChange={(v) => updateFilter("fatorR", v)}
          />
          {/* Precisa IE */}
          <SelectFilter
            label="Precisa Inscrição Estadual"
            options={["Todos", "Sim", "Não"]}
            value={filters.precisaIE}
            onChange={(v) => updateFilter("precisaIE", v)}
          />
          {/* Observação */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Observação IE
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 mb-2">
              <input
                type="checkbox"
                checked={filters.soComObs}
                onChange={(e) => updateFilter("soComObs", e.target.checked)}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
              />
              Apenas com observação
            </label>
            {filters.soComObs && (
              <input
                type="text"
                value={filters.obsBusca}
                onChange={(e) => updateFilter("obsBusca", e.target.value)}
                placeholder="Buscar na observação..."
                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>
      </div>

      {/* Tabela Responsiva (Mobile Cards + Desktop Table) */}
      <ResponsiveTable
        columns={[
          { key: "codigo", label: "Código", className: "font-mono text-xs" },
          { key: "descricao", label: "Descrição" },
          { key: "tipo", label: "Tipo" },
          { key: "simples", label: "Simples" },
          { key: "anexo", label: "Anexo" },
          { key: "aliquota", label: "Alíquota" },
          { key: "fatorR", label: "Fator R", className: "text-center" },
          { key: "precisaIE", label: "IE" },
        ]}
        data={paginaAtual}
        mobileFields={[{ key: "codigo", badge: true }, { key: "descricao" }]}
        renderCard={(c) => (
          <>
            <InfoRow label="Tipo" value={c.tipo || "—"} />
            <InfoRow
              label="Simples Nacional"
              value={
                c.simples === "Sim" ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Sim
                  </span>
                ) : c.simples === "Não" ? (
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">
                    Não
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <InfoRow label="Anexo" value={c.anexo || "—"} />
            <InfoRow label="Alíquota" value={c.aliquota || "—"} />
            <InfoRow
              label="Fator R"
              value={
                c.fatorR === "Sim" ? (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Sim
                  </span>
                ) : (
                  "Não"
                )
              }
            />
            <InfoRow
              label="Precisa IE"
              value={
                c.precisaIE === "Sim" ? (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    Sim
                  </span>
                ) : (
                  "Não"
                )
              }
            />
            {c.observacaoIE && (
              <InfoRowFull label="Observação" value={c.observacaoIE} />
            )}
          </>
        )}
        renderRow={(c) => (
          <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
            <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
              {c.codigo}
            </td>
            <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-200 max-w-xs truncate">
              {c.descricao}
            </td>
            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
              {c.tipo || "—"}
            </td>
            <td className="px-4 py-3">
              {c.simples === "Sim" ? (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                  Sim
                </span>
              ) : c.simples === "Não" ? (
                <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                  Não
                </span>
              ) : (
                <span className="text-xs text-slate-400">—</span>
              )}
            </td>
            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
              {c.anexo || "—"}
            </td>
            <td className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {c.aliquota || "—"}
            </td>
            <td className="px-4 py-3 text-center">
              {c.fatorR === "Sim" ? (
                <span className="inline-flex text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                  Sim
                </span>
              ) : (
                <span className="text-xs text-slate-400">Não</span>
              )}
            </td>
            <td className="px-4 py-3">
              {c.precisaIE === "Sim" ? (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                  Sim
                </span>
              ) : (
                <span className="text-xs text-slate-400">Não</span>
              )}
            </td>
          </tr>
        )}
        emptyMessage="Nenhum CNAE encontrado"
        emptyIcon={Search}
      />

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

function CnaeTableRowDesktop({ cnae: c }) {
  return (
    <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
      <td className="px-4 py-3 font-mono text-xs font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
        {c.codigo}
      </td>
      <td className="px-4 py-3 text-sm text-slate-800 dark:text-slate-200 max-w-xs truncate">
        {c.descricao}
      </td>
      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
        {c.tipo || "—"}
      </td>
      <td className="px-4 py-3">
        {c.simples === "Sim" ? (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
            Sim
          </span>
        ) : c.simples === "Não" ? (
          <span className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
            Não
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">
        {c.anexo || "—"}
      </td>
      <td className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
        {c.aliquota || "—"}
      </td>
      <td className="px-4 py-3 text-center">
        {c.fatorR === "Sim" ? (
          <span className="inline-flex text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
            Sim
          </span>
        ) : c.fatorR === "Não" ? (
          <span className="text-xs text-slate-400">Não</span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {c.precisaIE === "Sim" ? (
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
            Sim
          </span>
        ) : c.precisaIE === "Não" ? (
          <span className="text-xs text-slate-400">Não</span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {c.observacaoIE ? (
          <span
            className="text-xs text-blue-600 dark:text-blue-400 cursor-help"
            title={c.observacaoIE}
          >
            <Info size={14} />
          </span>
        ) : (
          "—"
        )}
      </td>
    </tr>
  );
}

function CnaeCardMobile({ cnae: c }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setExpandido(!expandido)}
        className="w-full text-left p-4 flex items-start gap-3 min-h-[44px]"
        aria-label={`Ver detalhes do CNAE ${c.codigo}`}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
              {c.codigo}
            </span>
            {c.simples === "Sim" && (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-full">
                Simples
              </span>
            )}
            {c.aliquota && (
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {c.aliquota}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-800 dark:text-slate-200 truncate">
            {c.descricao}
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
          {c.tipo && <InfoRowMobile label="Tipo" value={c.tipo} />}
          {c.anexo && <InfoRowMobile label="Anexo" value={c.anexo} />}
          {c.fatorR && <InfoRowMobile label="Fator R" value={c.fatorR} />}
          {c.precisaIE && (
            <InfoRowMobile label="Precisa IE" value={c.precisaIE} />
          )}
          {c.observacaoIE && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
                Observação
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {c.observacaoIE}
              </p>
            </div>
          )}
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

function MultiSelectFilter({ label, options, selected, onToggle }) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white hover:border-blue-500 transition-colors"
      >
        <span className="truncate">
          {selected.length === 0
            ? "Todos"
            : `${selected.length} selecionado(s)`}
        </span>
        {selected.length > 0 && (
          <span className="ml-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">
            {selected.length}
          </span>
        )}
      </button>
      {aberto && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer text-sm text-slate-700 dark:text-slate-300"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
                className="rounded border-slate-300 dark:border-slate-500 text-blue-600 focus:ring-blue-500"
              />
              {opt}
            </label>
          ))}
        </div>
      )}
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
