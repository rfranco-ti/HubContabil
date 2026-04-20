/**
 * Tabela Responsiva - Mobile First
 *
 * Em mobile (< 768px): renderiza cards expansíveis
 * Em tablet/desktop (≥ 768px): renderiza tabela tradicional
 *
 * Uso:
 * <ResponsiveTable
 *   columns={[{ key: 'nome', label: 'Nome' }, { key: 'email', label: 'Email' }]}
 *   data={[{ nome: 'João', email: 'joao@email.com' }]}
 *   mobileFields={['nome', 'email']} // campos que aparecem no card mobile
 *   renderRow={(row) => <tr>...</tr>}
 *   renderCard={(row, expanded) => <CardMobile data={row} expanded={expanded} />}
 * />
 */

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export function ResponsiveTable({
  columns,
  data,
  mobileFields,
  renderRow,
  renderCard,
  emptyMessage = "Nenhum dado disponível",
  emptyIcon: EmptyIcon,
}) {
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        {EmptyIcon && (
          <EmptyIcon
            size={40}
            className="mx-auto mb-3 text-slate-400 opacity-30"
          />
        )}
        <p className="font-semibold text-slate-700 dark:text-slate-300">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Cards Mobile (visível apenas em telas < 768px) */}
      <div className="md:hidden space-y-2">
        {data.map((row, index) => (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Card Header */}
            <button
              onClick={() => toggleRow(index)}
              className="w-full text-left p-4 flex items-start gap-3 min-h-[44px]"
              aria-expanded={expandedRows[index]}
              aria-label="Ver detalhes"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {mobileFields
                    .filter((f) => f.badge)
                    .map((f, i) => (
                      <span
                        key={i}
                        className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                          f.badgeColor ||
                          "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {row[f.key]}
                      </span>
                    ))}
                  {mobileFields
                    .filter((f) => !f.badge)
                    .map((f, i) => (
                      <span
                        key={i}
                        className="text-sm font-semibold text-slate-900 dark:text-white truncate"
                      >
                        {row[f.key]}
                      </span>
                    ))}
                </div>
              </div>
              {expandedRows[index] ? (
                <ChevronUp
                  size={18}
                  className="text-slate-400 flex-shrink-0 mt-1"
                />
              ) : (
                <ChevronDown
                  size={18}
                  className="text-slate-400 flex-shrink-0 mt-1"
                />
              )}
            </button>

            {/* Card Details */}
            {expandedRows[index] && renderCard && (
              <div className="px-4 pb-4 space-y-2 text-sm border-t border-slate-100 dark:border-slate-700 pt-3">
                {renderCard(row)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tabela Desktop (visível apenas em telas ≥ 768px) */}
      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-600">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 font-bold ${col.className || ""}`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
              {data.map((row, index) => renderRow(row, index))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-slate-400 uppercase">
        {label}
      </span>
      <span className="text-sm text-slate-700 dark:text-slate-300">{value}</span>
    </div>
  );
}

export function InfoRowFull({ label, value }) {
  return (
    <div>
      <span className="text-xs font-semibold text-slate-400 uppercase block mb-1">
        {label}
      </span>
      <span className="text-sm text-slate-700 dark:text-slate-300">{value}</span>
    </div>
  );
}
