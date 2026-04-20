import { useState, useEffect } from 'react';
import { X, Loader2, User, Mail, Lock, Briefcase } from 'lucide-react';

export default function ModalUsuario({ usuario, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    cargo: 'Contador'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Preencher formulário se estiver editando
  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome || '',
        email: usuario.email || '',
        senha: '', // Não preencher senha para segurança
        cargo: usuario.cargo || 'Contador'
      });
    }
  }, [usuario]);

  // Fechar com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Validar formulário
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 2) {
      newErrors.nome = 'Nome deve ter no mínimo 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!usuario && !formData.senha) {
      // Senha obrigatória apenas na criação
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha && formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Preparar dados (remover senha vazia)
      const dadosEnvio = {
        ...formData,
        senha: formData.senha || undefined
      };

      await onSave(dadosEnvio);
    } catch (error) {
      // Erro já foi tratado no componente pai
      console.error('Erro no submit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {usuario ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {usuario ? 'Atualize as informações do usuário' : 'Preencha os dados para criar um novo usuário'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Nome Completo *
            </label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Ex: João da Silva"
                className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nome ? 'border-red-500' : 'border-slate-300'
                }`}
                autoFocus
              />
            </div>
            {errors.nome && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span> {errors.nome}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="usuario@exemplo.com"
                className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span> {errors.email}
              </p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {usuario ? 'Nova Senha (opcional)' : 'Senha *'}
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={formData.senha}
                onChange={(e) => handleChange('senha', e.target.value)}
                placeholder={usuario ? 'Deixe vazio para manter a senha atual' : 'Mínimo 6 caracteres'}
                className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.senha ? 'border-red-500' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.senha && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span> {errors.senha}
              </p>
            )}
            {usuario && (
              <p className="mt-2 text-xs text-slate-500">
                💡 Deixe em branco se não deseja alterar a senha
              </p>
            )}
          </div>

          {/* Cargo */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Cargo *
            </label>
            <div className="relative">
              <Briefcase size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <select
                value={formData.cargo}
                onChange={(e) => handleChange('cargo', e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="Contador">Contador</option>
                <option value="Administrador">Administrador</option>
                <option value="Auxiliar">Auxiliar</option>
                <option value="Estagiário">Estagiário</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-700 font-bold hover:bg-slate-100 rounded-xl transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Salvando...
                </>
              ) : (
                <>
                  <User size={18} className="mr-2" />
                  {usuario ? 'Atualizar' : 'Criar Usuário'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
