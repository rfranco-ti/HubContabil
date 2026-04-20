import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';

/**
 * Hook personalizado para impressão de documentos
 * 
 * @param {ReactNode} content - Conteúdo a ser impresso
 * @returns {Function} Função para acionar impressão
 */
export const useDocumentPrint = () => {
  const componentRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Documento',
    onAfterPrint: () => {
      console.log('Documento impresso com sucesso');
    },
    onPrintError: (error) => {
      console.error('Erro ao imprimir:', error);
    }
  });
  
  return { componentRef, handlePrint };
};

/**
 * Hook para impressão com nome do arquivo personalizado
 * 
 * @param {string} fileName - Nome do arquivo
 * @returns {Object} componentRef e handlePrint
 */
export const useDocumentPrintWithName = (fileName = 'documento') => {
  const componentRef = useRef(null);
  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: fileName,
    onAfterPrint: () => {
      console.log(`${fileName} impresso com sucesso`);
    },
    onPrintError: (error) => {
      console.error(`Erro ao imprimir ${fileName}:`, error);
    }
  });
  
  return { componentRef, handlePrint };
};
