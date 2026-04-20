import { forwardRef } from 'react';

/**
 * Componente de Cabeçalho de Página Padronizado
 * 
 * @param {ReactNode} icon - Ícone da página (opcional)
 * @param {string} title - Título da página
 * @param {string} subtitle - Subtítulo/descrição (opcional)
 * @param {ReactNode} actions - Ações/botões no canto direito (opcional)
 * @param {string} className - Classe CSS adicional
 */
const PageHeader = forwardRef(({ icon, title, subtitle, actions, className = '' }, ref) => {
  return (
    <div 
      ref={ref}
      className={`flex items-center justify-between mb-5 pb-4 border-b border-slate-200 ${className}`}
    >
      <div className="flex items-center gap-3 flex-1">
        {icon && (
          <div className="text-primary-600 flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {actions}
        </div>
      )}
    </div>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;
