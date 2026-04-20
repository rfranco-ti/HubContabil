import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { tiposEventoAPI } from '../../services/calendarioAPI';
import '../../styles/components/ModalEvento.css';

export default function ModalEvento({ evento, dataClicada, onClose, onSave }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: dataClicada || '',
    tipoId: '',
    lembrete: false
  });
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    tiposEventoAPI.listar().then(res => {
      console.log('=== ModalEvento: Tipos carregados ===');
      console.log('Response:', res);
      console.log('Tipos:', res.tipos || []);
      setTipos(res.tipos || []);
    }).catch(err => {
      console.error('❌ Erro ao carregar tipos de evento:', err);
    });
  }, []);

  useEffect(() => {
    if (evento) {
      console.log('=== ModalEvento: Editando evento ===');
      console.log('Evento:', evento);
      setFormData({
        titulo: evento.titulo || '',
        descricao: evento.descricao || '',
        data: evento.data && evento.data.length === 10 ? evento.data : '',
        tipoId: evento.tipoId || '',
        lembrete: evento.lembrete || false
      });
    } else if (dataClicada) {
      console.log('=== ModalEvento: Nova data clicada ===');
      console.log('Data:', dataClicada);
      setFormData(prev => ({ ...prev, data: dataClicada }));
    }
  }, [evento, dataClicada]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        titulo: formData.titulo,
        descricao: formData.descricao,
        data: formData.data,
        tipoId: formData.tipoId,
        lembrete: formData.lembrete
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-evento-overlay" onClick={onClose}>
      <div className="modal-evento-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-evento-header">
          <h2 className="modal-evento-title">{evento ? 'Editar Evento' : 'Novo Evento'}</h2>
          <button className="modal-evento-close" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-evento-body">
            <div className="modal-evento-field">
              <label className="modal-evento-label">Título *</label>
              <input
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData(p => ({ ...p, titulo: e.target.value }))}
                placeholder="Ex: Reunião com cliente"
                className="modal-evento-input"
                required
                autoFocus
              />
            </div>

            <div className="modal-evento-field">
              <label className="modal-evento-label">Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData(p => ({ ...p, descricao: e.target.value }))}
                placeholder="Detalhes..."
                className="modal-evento-textarea"
                rows={2}
              />
            </div>

            <div className="modal-evento-field">
              <label className="modal-evento-label">Data *</label>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData(p => ({ ...p, data: e.target.value }))}
                className="modal-evento-input"
                required
              />
            </div>

            <div className="modal-evento-field">
              <label className="modal-evento-label">Tipo de Evento *</label>
              <select
                value={formData.tipoId}
                onChange={(e) => setFormData(p => ({ ...p, tipoId: e.target.value }))}
                className="modal-evento-select"
                required
              >
                <option value="">Selecione...</option>
                {tipos.map(tipo => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.icone} {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Campos extras para feriados */}
            {tipos.find(t => t.id === formData.tipoId)?.nome === 'feriado_estadual' && (
              <div className="modal-evento-field">
                <label className="modal-evento-label">UF</label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="Ex: BA"
                  className="modal-evento-input"
                  onChange={(e) => setFormData(p => ({ ...p, uf: e.target.value.toUpperCase() }))}
                />
              </div>
            )}

            {tipos.find(t => t.id === formData.tipoId)?.nome === 'feriado_municipal' && (
              <div className="modal-evento-field">
                <label className="modal-evento-label">Município</label>
                <input
                  type="text"
                  placeholder="Ex: Salvador"
                  className="modal-evento-input"
                  onChange={(e) => setFormData(p => ({ ...p, municipio: e.target.value }))}
                />
              </div>
            )}

            <div className="modal-evento-checkbox">
              <input
                type="checkbox"
                id="lembrete"
                checked={formData.lembrete}
                onChange={(e) => setFormData(p => ({ ...p, lembrete: e.target.checked }))}
              />
              <label htmlFor="lembrete">Ativar lembrete</label>
            </div>

            <div className="modal-evento-footer">
              <button type="button" className="modal-evento-btn-cancel" onClick={onClose}>Cancelar</button>
              <button type="submit" className="modal-evento-btn-save" disabled={loading || !formData.titulo || !formData.data || !formData.tipoId}>
                {loading ? 'Salvando...' : (evento ? 'Atualizar' : 'Criar Evento')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
