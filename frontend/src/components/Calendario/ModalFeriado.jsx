import { useEffect } from 'react';
import { X } from 'lucide-react';
import '../../styles/calendario/ModalFeriado.css';

export default function ModalFeriado({ feriado, onClose }) {
  // Fechar modal ao pressionar ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Impedir scroll do body quando modal aberto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!feriado) return null;

  const feriados = feriado.feriadosAgrupados || [feriado];

  return (
    <div className="modal-feriado-overlay" onClick={onClose}>
      <div className="modal-feriado-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-feriado-header">
          <h2 className="modal-feriado-title">
            {feriados.length === 1 ? 'Detalhes do Feriado' : `Feriados (${feriados.length})`}
          </h2>
          <button className="modal-feriado-close" onClick={onClose} aria-label="Fechar">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-feriado-body">
          {feriados.map((f, index) => (
            <div key={index} className="modal-feriado-item">
              {/* Tipo Badge */}
              <div className={`modal-feriado-badge modal-feriado-badge--${f.extendedProps?.tipo || f.tipo}`}>
                {getTipoLabel(f.extendedProps?.tipo || f.tipo)}
              </div>

              {/* Nome */}
              <h3 className="modal-feriado-item-title">{f.title || f.nome}</h3>

              {/* Data */}
              <p className="modal-feriado-item-data">
                <strong>Data:</strong> {formatarData(f.start || f.data)}
              </p>

              {/* Descrição */}
              <p className="modal-feriado-item-descricao">
                {f.extendedProps?.descricao || f.descricao}
              </p>

              {/* Localização (se municipal/estadual) */}
              {(f.extendedProps?.tipo === 'municipal' || f.tipo === 'municipal') && (
                <p className="modal-feriado-item-local">
                  <strong>Município:</strong> {f.extendedProps?.cidade || f.cidade || 'N/A'}
                </p>
              )}
              
              {(f.extendedProps?.tipo === 'estadual' || f.tipo === 'estadual') && (
                <p className="modal-feriado-item-local">
                  <strong>Estado:</strong> {f.extendedProps?.estado || f.estado || 'N/A'}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="modal-feriado-footer">
          <button className="modal-feriado-button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getTipoLabel(tipo) {
  const labels = {
    nacional: 'Nacional',
    estadual: 'Estadual',
    municipal: 'Municipal',
    obrigacao: 'Obrigação',
    evento_usuario: 'Evento'
  };
  return labels[tipo] || tipo;
}

function formatarData(data) {
  if (!data) return 'N/A';
  const [dia, mes, ano] = data.split('/');
  if (ano) return `${dia}/${mes}/${ano}`;
  
  // Formato ISO
  const date = new Date(data);
  return date.toLocaleDateString('pt-BR');
}
