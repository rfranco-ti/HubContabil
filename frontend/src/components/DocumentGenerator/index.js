// Document Generator Components
export { default as A4Document } from './A4Document';
export { default as DocumentGenerator } from './DocumentGenerator';

// Templates
export { default as ReciboHonorarios } from './templates/ReciboHonorarios';
export { default as TermoRecebimento } from './templates/TermoRecebimento';
export { default as TermoDevolucao } from './templates/TermoDevolucao';
export { default as Comunicado } from './templates/Comunicado';
export { default as DeclaracaoRegularidade } from './templates/DeclaracaoRegularidade';
export { default as Procuracao } from './templates/Procuracao';

// Forms
export { default as ReciboForm } from './forms/ReciboForm';
export { default as TermoRecebimentoForm } from './forms/TermoRecebimentoForm';
export { default as TermoDevolucaoForm } from './forms/TermoDevolucaoForm';
export { default as ComunicadoForm } from './forms/ComunicadoForm';
export { default as DeclaracaoForm } from './forms/DeclaracaoForm';
export { default as ProcuracaoForm } from './forms/ProcuracaoForm';

// Hooks
export { useDocumentPrint, useDocumentPrintWithName } from './hooks/useDocumentPrint';

// Utils
export * from './utils/formatters';
export { generatePDF } from './utils/pdfGenerator';
