import { useState, useEffect } from 'react';
import { X, Loader2, Key, Calendar, Shield } from 'lucide-react';

export default function ModalApiKey({ onClose, onSave, permissoesDisponiveis }) {
  const [formData, setFormData] = useState({
    nome: '',
    permissoes: [],
    expiraEm: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (formData.permissoes.length === 0) newErrors.permissoes = 'Selecione pelo menos uma permissão';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dadosEnvio = {
        ...formData,
        expiraEm: formData.expiraEm || null
      };
      await onSave(dadosEnvio);
    } catch (error) {
      console.error('Erro no submit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const togglePermissao = (perm) => {
    setFormData(prev => {
      const perms = prev.permissoes.includes(perm)
        ? prev.permissoes.filter(p => p !== perm)
        : [...prev.permissoes, perm];
      return { ...prev, permissoes: perms };
    });
    if (errors.permissoes) setErrors(prev => ({ ...prev, permissoes: null }));
  };

  const toggleTodasPermissoes = () => {
    if (formData.permissoes.length === permissoesDisponiveis.length) {
      handleChange('permissoes', []);
    } else {
      handleChange('permissoes', permissoesDisponiveis.map(p => p.value));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Nova API Key</h2>
            <p className="text-blue-100 text-sm mt-1">Configure nome e permissões de acesso.</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Key size={14} className="inline mr-1" />
              Nome da API Key *
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Integração sistema externo"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nome ? 'border-red-500' : 'border-slate-300'}`}
              autoFocus
            />
            {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
          </div>

          {/* Permissões */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-700">
                <Shield size={14} className="inline mr-1" />
                Permissões *
              </label>
              <button
                type="button"
                onClick={toggleTodasPermissoes}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {formData.permissoes.length === permissoesDisponiveis.length ? 'Desmarcar todas' : 'Selecionar todas'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {permissoesDisponiveis.map(perm => (
                <label
                  key={perm.value}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                    formData.permissoes.includes(perm.value)
                      ? 'bg-blue-50 border border-blue-300'
                      : 'bg-slate-50 border border-transparent hover:border-slate-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.permissoes.includes(perm.value)}
                    onChange={() => togglePermissao(perm.value)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">{perm.icon}</span>
                  <span className="text-xs text-slate-700">{perm.label}</span>
                </label>
              ))}
            </div>
            {errors.permissoes && <p className="mt-1 text-sm text-red-600">{errors.permissoes}</p>}
          </div>

          {/* Expiração */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Calendar size={14} className="inline mr-1" />
              Data de Expiração (opcional)
            </label>
            <input
              type="datetime-local"
              value={formData.expiraEm}
              onChange={(e) => handleChange('expiraEm', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-slate-500">Deixe vazio para nunca expirar</p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-slate-700 font-bold hover:bg-slate-200 rounded-xl transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Criando...
              </>
            ) : (
              <>
                <Key size={18} className="mr-2" />
                Criar API Key
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
