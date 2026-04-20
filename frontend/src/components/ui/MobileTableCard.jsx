/**
 * MobileTableCard - Componente de Card para Tabelas Responsivas
 *
 * Renderiza dados tabulares como cards expansíveis em mobile/tablet
 * e como tabela tradicional em desktop
 *
 * PROPS:
 * - data: array de objetos com os dados
 * - columns: array de { key, label, render?, badge?, badgeColor?, className? }
 * - primaryField: campo principal exibido no header do card
 * - secondaryFields: campos secundários exibidos no header (badges)
 * - detailFields: campos exibidos apenas no corpo expandido
 * - actions: array de { label, icon, onClick, variant? }
 * - emptyMessage: mensagem quando não há dados
 * - emptyIcon: ícone para estado vazio
 * - onRowClick: callback ao clicar no card/linha
 * - renderHeader?: função customizada para header do card
 * - renderDetails?: função customizada para detalhes do card
 *
 * EXEMPLO DE USO:
 * <MobileTableCard
 *   data={clientes}
 *   columns={[
 *     { key: 'razao_social', label: 'Empresa' },
 *     { key: 'cnpj', label: 'CNPJ', render: (v) => formatCnpj(v) },
 *     { key: 'status', label: 'Status', badge: true, badgeColor: (v) => v === 'Ativo' ? 'green' : 'red' }
 *   ]}
 *   primaryField="razao_social"
 *   secondaryFields={['cnpj']}
 *   detailFields={['telefone', 'email', 'status']}
 *   actions={[
 *     { label: 'Ver', icon: Eye, onClick: (row) => navigate(`/empresa/${row.cnpj}`) },
 *     { label: 'Editar', icon: Edit, onClick: (row) => handleEdit(row) },
 *     { label: 'Excluir', icon: Trash, onClick: (row) => handleDelete(row), variant: 'danger' }
 *   ]}
 * />
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, MoreVertical } from "lucide-react";

// Cores padrão para badges
const BADGE_COLORS = {
  blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  green:
    "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  yellow:
    "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  purple:
    "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  gray: "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800",
};

function getBadgeColor(colorName) {
  return BADGE_COLORS[colorName] || BADGE_COLORS.blue;
}

export function MobileTableCard({
  data,
  columns,
  primaryField,
  secondaryFields = [],
  detailFields = [],
  actions = [],
  emptyMessage = "Nenhum dado disponível",
  emptyIcon: EmptyIcon,
  onRowClick,
  renderHeader,
  renderDetails,
}) {
  const [expandedRows, setExpandedRows] = useState({});
  const [openActionMenu, setOpenActionMenu] = useState(null);

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));
    setOpenActionMenu(null);
  };

  const toggleActionMenu = (index, e) => {
    e.stopPropagation();
    setOpenActionMenu((prev) => (prev === index ? null : index));
  };

  const getColumn = (key) => columns.find((c) => c.key === key) || {};

  const renderValue = (row, key) => {
    const col = getColumn(key);
    const value = row[key];
    if (col.render) return col.render(value, row);
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Sim" : "Não";
    return String(value);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center">
        {EmptyIcon && (
          <EmptyIcon
            size={48}
            className="mx-auto mb-4 text-slate-300 dark:text-slate-600"
          />
        )}
        <p className="font-semibold text-slate-600 dark:text-slate-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((row, index) => {
        const isExpanded = expandedRows[index];
        const primaryValue = renderValue(row, primaryField);
        const secondaryValues = secondaryFields.map((key) => ({
          key,
          value: renderValue(row, key),
          column: getColumn(key),
        }));
        const detailValues = detailFields.map((key) => ({
          key,
          label: getColumn(key).label || key,
          value: renderValue(row, key),
          column: getColumn(key),
        }));

        return (
          <div
            key={index}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
          >
            {/* Card Header - Sempre visível */}
            <button
              onClick={() =>
                onRowClick ? onRowClick(row, index) : toggleRow(index)
              }
              className="w-full text-left p-4 min-h-[60px] flex items-start gap-3 active:bg-slate-50 dark:active:bg-slate-700/50"
              aria-expanded={isExpanded}
            >
              {/* Ícone de expandir */}
              <div className="flex-shrink-0 mt-0.5">
                {isExpanded ? (
                  <ChevronUp
                    size={20}
                    className="text-slate-400 dark:text-slate-500"
                  />
                ) : (
                  <ChevronDown
                    size={20}
                    className="text-slate-400 dark:text-slate-500"
                  />
                )}
              </div>

              {/* Conteúdo principal */}
              <div className="flex-1 min-w-0">
                {renderHeader ? (
                  renderHeader(row, isExpanded)
                ) : (
                  <div className="space-y-1.5">
                    {/* Valor primário */}
                    <div className="text-base font-semibold text-slate-900 dark:text-white truncate">
                      {primaryValue}
                    </div>

                    {/* Valores secundários (badges ou texto) */}
                    {secondaryValues.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        {secondaryValues.map(({ key, value, column }) => {
                          if (column.badge) {
                            const colorClass = column.badgeColor
                              ? typeof column.badgeColor === "function"
                                ? getBadgeColor(column.badgeColor(value, row))
                                : getBadgeColor(column.badgeColor)
                              : getBadgeColor("blue");
                            return (
                              <span
                                key={key}
                                className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colorClass}`}
                              >
                                {value}
                              </span>
                            );
                          }
                          return (
                            <span
                              key={key}
                              className="text-sm text-slate-600 dark:text-slate-400"
                            >
                              {value}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botão de ações (se houver) */}
              {actions.length > 0 && (
                <div
                  className="relative flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => toggleActionMenu(index, e)}
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    aria-label="Ações"
                  >
                    <MoreVertical
                      size={18}
                      className="text-slate-500 dark:text-slate-400"
                    />
                  </button>

                  {/* Dropdown de ações */}
                  {openActionMenu === index && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenActionMenu(null)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-20">
                        {actions.map((action, actionIndex) => {
                          const Icon = action.icon;
                          const variantClasses =
                            action.variant === "danger"
                              ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                              : action.variant === "success"
                                ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700";

                          return (
                            <button
                              key={actionIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row, index);
                                setOpenActionMenu(null);
                              }}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-colors ${variantClasses}`}
                            >
                              {Icon && <Icon size={16} />}
                              <span>{action.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </button>

            {/* Detalhes expansíveis */}
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700 pt-3">
                {renderDetails ? (
                  renderDetails(row, index)
                ) : (
                  <div className="space-y-2.5">
                    {detailValues.map(({ key, label, value, column }) => (
                      <div
                        key={key}
                        className="flex items-start justify-between gap-3"
                      >
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex-shrink-0 min-w-[100px]">
                          {label}
                        </span>
                        <span
                          className={`text-sm text-slate-700 dark:text-slate-300 ${column?.className || ""}`}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * TableWrapper - Wrapper para tabelas HTML tradicionais com scroll horizontal
 *
 * Usado apenas em desktop/tablet grande (≥ 768px)
 *
 * EXEMPLO DE USO:
 * <TableWrapper>
 *   <table className="w-full">
 *     <thead>...</thead>
 *     <tbody>...</tbody>
 *   </table>
 * </TableWrapper>
 */
export function TableWrapper({ children, className = "" }) {
  return (
    <div
      className={`hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

/**
 * ResponsiveTableContainer - Container que alterna entre MobileTableCard e TableWrapper
 *
 * Em mobile (< 768px): mostra MobileTableCard
 * Em desktop (≥ 768px): mostra TableWrapper
 */
export function ResponsiveTableContainer({
  mobileView,
  desktopView,
  className = "",
}) {
  return (
    <div className={className}>
      {/* Mobile/Tablet (< 768px) */}
      <div className="md:hidden">{mobileView}</div>

      {/* Desktop (≥ 768px) */}
      <div className="hidden md:block">{desktopView}</div>
    </div>
  );
}

export default MobileTableCard;
