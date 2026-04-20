import { Save, FileText, FileDown } from 'lucide-react';

export default function Toolbar({ templateName, onNameChange, onSave, onExportPDF, onExportDOCX }) {
  return (
    <div className="flex items-center gap-4">
      <input
        type="text"
        value={templateName}
        onChange={(e) => onNameChange(e.target.value)}
        className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        placeholder="Nome do template"
      />
      
      <div className="flex items-center gap-2">
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Save size={16} />
          Salvar
        </button>
        
        <button
          onClick={onExportPDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          <FileText size={16} />
          PDF
        </button>
        
        <button
          onClick={onExportDOCX}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FileDown size={16} />
          DOCX
        </button>
      </div>
    </div>
  );
}
