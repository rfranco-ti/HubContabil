import React, { useState } from 'react';
import TemplateEditor from '../components/TemplateEditor/TemplateEditor';
import { FolderOpen, Plus, FileText, Trash2 } from 'lucide-react';

export default function EditorModelos() {
  const [view, setView] = useState('editor');
  const [modelos, setModelos] = useState(() => {
    const saved = localStorage.getItem('doc_models');
    return saved ? JSON.parse(saved) : [];
  });

  const handleSaveModelo = (modelo) => setModelos([...modelos, modelo]);

  const handleDeleteModelo = (id) => {
    if (window.confirm('Excluir este modelo?')) {
      const updated = modelos.filter(m => m.id !== id);
      setModelos(updated);
      localStorage.setItem('doc_models', JSON.stringify(updated));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📄 Editor de Modelos</h1>
              <p className="text-sm text-gray-500 mt-1">Crie documentos com campos variáveis {"{{variavel}}"}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <FolderOpen size={18} /> Meus Modelos ({modelos.length})
              </button>
              <button onClick={() => setView('editor')} className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${view === 'editor' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <Plus size={18} /> Novo Modelo
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {view === 'editor' ? (
          <TemplateEditor onSave={handleSaveModelo} />
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Meus Modelos</h2>
            {modelos.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-6">Nenhum modelo salvo</p>
                <button onClick={() => setView('editor')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                  <Plus size={18} className="inline mr-2" />Criar Modelo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modelos.map((m) => (
                  <div key={m.id} className="border rounded-lg p-4 hover:shadow-md bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800 truncate">{m.name}</h3>
                      <button onClick={() => handleDeleteModelo(m.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{m.placeholders.length} campos • {new Date(m.createdAt).toLocaleDateString('pt-BR')}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {m.placeholders.slice(0, 3).map(ph => (<span key={ph} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{`{{${ph}}}`}</span>))}
                      {m.placeholders.length > 3 && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">+{m.placeholders.length - 3}</span>}
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm">📝 Editar</button>
                      <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 text-sm">📄 Usar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
