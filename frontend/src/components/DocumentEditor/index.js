// Componentes do Editor
export { default as TextBlock } from './components/TextBlock';
export { default as DynamicField } from './components/DynamicField';
export { default as ImageBlock } from './components/ImageBlock';
export { default as DividerBlock } from './components/DividerBlock';
export { default as SpacerBlock } from './components/SpacerBlock';

// Componentes da UI
export { default as Sidebar } from './Sidebar';
export { default as Canvas } from './Canvas';
export { default as PropsPanel } from './PropsPanel';
export { default as ClientDataPanel } from './ClientDataPanel';
export { default as Toolbar } from './Toolbar';

// Utilitários
export { generatePDF } from './utils/pdfGenerator.js';
export { generateDOCX } from './utils/docxGenerator';

// Componente Principal
export { default } from './index.jsx';
