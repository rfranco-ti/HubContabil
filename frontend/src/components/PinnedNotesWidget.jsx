import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Pin, ExternalLink, StickyNote } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Cores das notas (Microsoft Sticky Notes palette)
const CORES_NOTAS = [
  { id: 'yellow', bg: '#fff740', border: '#e6df3a', accent: '#ffe600', text: 'text-gray-900', textLight: 'text-gray-700' },
  { id: 'pink', bg: '#ff7eb9', border: '#e66aa5', accent: '#ff65a3', text: 'text-white', textLight: 'text-white/90' },
  { id: 'blue', bg: '#7afcff', border: '#6fe5e6', accent: '#5ce0e3', text: 'text-gray-900', textLight: 'text-gray-700' },
  { id: 'green', bg: '#a8f0a8', border: '#96d896', accent: '#85e085', text: 'text-gray-900', textLight: 'text-gray-700' },
  { id: 'purple', bg: '#e8b4f8', border: '#d2a0e0', accent: '#d99aee', text: 'text-gray-900', textLight: 'text-gray-700' },
];

export default function PinnedNotesWidget() {
  const [notasFixadas, setNotasFixadas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarNotasFixadas();
  }, []);

  async function carregarNotasFixadas() {
    try {
      setCarregando(true);
      const response = await fetch(`${API_URL}/notas`);
      const result = await response.json();
      
      if (result.success) {
        // Filtrar apenas notas fixadas e pegar as 4 mais recentes
        const fixadas = result.data
          .filter(nota => nota.fixada)
          .sort((a, b) => new Date(b.dataFixacao || b.updatedAt) - new Date(a.dataFixacao || a.updatedAt))
          .slice(0, 4);
        
        setNotasFixadas(fixadas);
      }
    } catch (error) {
      console.error('Erro ao carregar notas fixadas:', error);
    } finally {
      setCarregando(false);
    }
  }

  const getCorConfig = (corId) => {
    return CORES_NOTAS.find(c => c.id === corId) || CORES_NOTAS[0];
  };

  if (carregando) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Pin size={20} className="text-red-600" />
            Notas Fixadas
          </h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Pin size={20} className="text-red-600" />
          Notas Fixadas
        </h2>
        <Link
          to="/notas"
          className="text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1"
        >
          Ver todas
          <ExternalLink size={14} />
        </Link>
      </div>

      {notasFixadas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <StickyNote size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma nota fixada</p>
          <p className="text-xs mt-1">Fixe notas no mural para vê-las aqui</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {notasFixadas.map((nota) => {
            const cor = getCorConfig(nota.cor);
            return (
              <Link
                key={nota.id}
                to="/notas"
                className="border-2 rounded-lg p-3 hover:shadow-lg transition-all duration-200 group"
                style={{
                  backgroundColor: cor.bg,
                  borderColor: cor.border,
                }}
              >
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cor.accent }}></div>
                  <Pin size={12} className="text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className={`font-semibold text-xs mb-1 line-clamp-2 ${cor.text}`}>
                  {nota.titulo}
                </h3>
                <p className={`text-xs line-clamp-3 whitespace-pre-wrap ${cor.textLight}`}>
                  {nota.conteudo}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(nota.updatedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
