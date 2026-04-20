import { useState, useEffect } from 'react';
import { X, Loader2, Clock, Bot, Repeat, Calendar } from 'lucide-react';

const TIPOS_ROBO = [
  { value: 'SIMPLES_NACIONAL', label: 'Simples Nacional', icon: '🏛️' },
  { value: 'SEFAZ_BA', label: 'SEFAZ-BA', icon: '📋' }
];

const RECORRENCIAS = [
  { value: 'unica', label: 'Execução única', icon: '1️⃣', mostraDias: false, mostraVezes: false },
  { value: 'diaria', label: 'Diária', icon: '📅', mostraDias: false, mostraVezes: false },
  { value: 'semanal', label: 'Semanal', icon: '📆', mostraDias: true, mostraVezes: false },
  { value: 'mensal', label: 'Mensal', icon: '🗓️', mostraDias: false, mostraVezes: false },
  { value: 'x_vezes_dia', label: 'X vezes por dia', icon: '🔄', mostraDias: false, mostraVezes: 'dia' },
  { value: 'x_vezes_semana', label: 'X vezes por semana', icon: '🔁', mostraDias: true, mostraVezes: 'semana' }
];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function ModalAgendamento({ agendamento, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nome: '',
    tipoRobo: 'SIMPLES_NACIONAL',
    cnpj: '',
    recorrencia: 'diaria',
    horaExecucao: '08:00',
    diasSemana: [],
    vezesPorDia: 1,
    vezesPorSemana: 1,
    ativo: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (agendamento) {
      setFormData({
        nome: agendamento.nome || '',
        tipoRobo: agendamento.tipoRobo || 'SIMPLES_NACIONAL',
        cnpj: agendamento.cnpj || '',
        recorrencia: agendamento.recorrencia || 'diaria',
        horaExecucao: agendamento.horaExecucao || '08:00',
        diasSemana: agendamento.diasSemana ? (typeof agendamento.diasSemana === 'number' ? [agendamento.diasSemana] : agendamento.diasSemana) : [],
        vezesPorDia: agendamento.vezesPorDia || 1,
        vezesPorSemana: agendamento.vezesPorSemana || 1,
        ativo: agendamento.ativo !== false
      });
    }
  }, [agendamento]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.cnpj.trim()) newErrors.cnpj = 'CNPJ é obrigatório';
    if (!formData.horaExecucao) newErrors.horaExecucao = 'Horário é obrigatório';

    const rec = RECORRENCIAS.find(r => r.value === formData.recorrencia);
    if (rec?.mostraDias && formData.diasSemana.length === 0) {
      newErrors.diasSemana = 'Selecione pelo menos um dia';
    }

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
        cnpj: formData.cnpj.replace(/\D/g, ''),
        diasSemana: formData.diasSemana.length > 0 ? formData.diasSemana : null
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

  const toggleDiaSemana = (dia) => {
    setFormData(prev => {
      const dias = prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter(d => d !== dia)
        : [...prev.diasSemana, dia];
      return { ...prev, diasSemana: dias };
    });
    if (errors.diasSemana) setErrors(prev => ({ ...prev, diasSemana: null }));
  };

  const mascaraCNPJ = (value) => {
    const nums = value.replace(/\D/g, '').slice(0, 14);
    if (nums.length <= 2) return nums;
    if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`;
    if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`;
    if (nums.length <= 12) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`;
    return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`;
  };

  const handleCNPJChange = (e) => {
    handleChange('cnpj', mascaraCNPJ(e.target.value));
  };

  const recSelecionada = RECORRENCIAS.find(r => r.value === formData.recorrencia);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">
              {agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {agendamento ? 'Atualize as configurações' : 'Configure a execução automática de um robô'}
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Nome */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Agendamento *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Consulta Simples - Empresa X"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.nome ? 'border-red-500' : 'border-slate-300'}`}
              autoFocus
            />
            {errors.nome && <p className="mt-1 text-sm text-red-600">{errors.nome}</p>}
          </div>

          {/* Tipo de Robô */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Bot size={14} className="inline mr-1" />
              Tipo de Robô *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TIPOS_ROBO.map(tipo => (
                <button
                  key={tipo.value}
                  type="button"
                  onClick={() => handleChange('tipoRobo', tipo.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-center ${
                    formData.tipoRobo === tipo.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">{tipo.icon}</span>
                  <p className="text-sm font-bold text-slate-700 mt-1">{tipo.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* CNPJ */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">CNPJ Alvo *</label>
            <input
              type="text"
              value={formData.cnpj}
              onChange={handleCNPJChange}
              placeholder="00.000.000/0000-00"
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${errors.cnpj ? 'border-red-500' : 'border-slate-300'}`}
            />
            {errors.cnpj && <p className="mt-1 text-sm text-red-600">{errors.cnpj}</p>}
          </div>

          {/* Recorrência */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Repeat size={14} className="inline mr-1" />
              Recorrência *
            </label>
            <select
              value={formData.recorrencia}
              onChange={(e) => handleChange('recorrencia', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {RECORRENCIAS.map(rec => (
                <option key={rec.value} value={rec.value}>{rec.icon} {rec.label}</option>
              ))}
            </select>
          </div>

          {/* Horário */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Clock size={14} className="inline mr-1" />
              Horário de Execução *
            </label>
            <input
              type="time"
              value={formData.horaExecucao}
              onChange={(e) => handleChange('horaExecucao', e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.horaExecucao ? 'border-red-500' : 'border-slate-300'}`}
            />
            {errors.horaExecucao && <p className="mt-1 text-sm text-red-600">{errors.horaExecucao}</p>}
          </div>

          {/* Dias da Semana (se aplicável) */}
          {recSelecionada?.mostraDias && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <Calendar size={14} className="inline mr-1" />
                Dias da Semana *
              </label>
              <div className="grid grid-cols-7 gap-2">
                {DIAS_SEMANA.map((dia, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleDiaSemana(idx)}
                    className={`p-2 rounded-lg text-xs font-bold transition-all ${
                      formData.diasSemana.includes(idx)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {dia}
                  </button>
                ))}
              </div>
              {errors.diasSemana && <p className="mt-1 text-sm text-red-600">{errors.diasSemana}</p>}
            </div>
          )}

          {/* Vezes por dia/semana */}
          {recSelecionada?.mostraVezes === 'dia' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quantas vezes por dia?</label>
              <input
                type="number"
                min="1"
                max="24"
                value={formData.vezesPorDia}
                onChange={(e) => handleChange('vezesPorDia', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {recSelecionada?.mostraVezes === 'semana' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Quantas vezes por semana?</label>
              <input
                type="number"
                min="1"
                max="168"
                value={formData.vezesPorSemana}
                onChange={(e) => handleChange('vezesPorSemana', parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Ativo */}
          <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer">
            <div>
              <p className="font-bold text-slate-700">Agendamento Ativo</p>
              <p className="text-xs text-slate-500">Execuções ocorrerão conforme programado</p>
            </div>
            <input
              type="checkbox"
              checked={formData.ativo}
              onChange={(e) => handleChange('ativo', e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </form>

        {/* Footer Buttons - Fixed */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 flex-shrink-0">
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
                Salvando...
              </>
            ) : (
              <>
                <Clock size={18} className="mr-2" />
                {agendamento ? 'Atualizar' : 'Criar Agendamento'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
