import { forwardRef } from 'react';
import '../../styles/document/a4.css';

/**
 * Componente base para documentos A4
 * 
 * @param {ReactNode} children - Conteúdo do documento
 * @param {string} className - Classe CSS adicional
 * @param {ref} ref - Referência para impressão
 */
const A4Document = forwardRef(({ children, className = '' }, ref) => {
  return (
    <div ref={ref} className={`a4-document ${className}`}>
      <div className="a4-document-content">
        {children}
      </div>
    </div>
  );
});

A4Document.displayName = 'A4Document';

export default A4Document;
