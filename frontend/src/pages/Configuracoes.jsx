import { useState } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle, Key, Database, Bell, Shield, Users, Clock, BarChart3, FileText } from 'lucide-react';
import GestaoUsuarios from '../components/Configuracoes/GestaoUsuarios';
import AgendamentosRpa from '../components/Configuracoes/AgendamentosRpa';
import GestaoApis from '../components/Configuracoes/GestaoApis';
import LogsSistema from '../pages/LogsSistema';

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('geral');
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    api_url: '/api',
    timeout: '30000',
    max_upload_size: '5',
    notifications_enabled: true,
    dark_mode: false,
    auto_backup: true,
    backup_frequency: 'daily'
  });

  const handleChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    // Simula salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    localStorage.setItem('hubConfig', JSON.stringify(config));
    setLoading(false);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Configurações</h1>
        <p className="mt-1 text-slate-500 text-lg">Gerencie as preferências do sistema.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('geral')}
          className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'geral'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          ⚙️ Geral
        </button>
        <button
          onClick={() => setActiveTab('usuarios')}
          className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'usuarios'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Users size={14} className="inline mr-1" />
          Usuários
        </button>
        <button
          onClick={() => setActiveTab('agendamentos')}
          className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'agendamentos'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Clock size={14} className="inline mr-1" />
          Agendamentos
        </button>
        <button
          onClick={() => setActiveTab('apis')}
          className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'apis'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Key size={14} className="inline mr-1" />
          APIs
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'logs'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <FileText size={14} className="inline mr-1" />
          Logs
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'geral' ? (
        <div className="max-w-4xl space-y-6">
          {/* API */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl mr-4">
                <Database size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Conexão API</h2>
                <p className="text-sm text-slate-500 mt-0.5">Configurações de conexão com o backend.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">URL da API</label>
                <input
                  type="text"
                  value={config.api_url}
                  onChange={(e) => handleChange('api_url', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Timeout (ms)</label>
                <input
                  type="number"
                  value={config.timeout}
                  onChange={(e) => handleChange('timeout', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl mr-4">
                <Save size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Upload de Arquivos</h2>
                <p className="text-sm text-slate-500 mt-0.5">Limites e preferências de upload.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tamanho Máximo (MB)</label>
              <input
                type="number"
                value={config.max_upload_size}
                onChange={(e) => handleChange('max_upload_size', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>

          {/* Notificações */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl mr-4">
                <Bell size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Notificações</h2>
                <p className="text-sm text-slate-500 mt-0.5">Preferências de notificação do sistema.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-bold text-slate-700">Ativar Notificações</p>
                  <p className="text-sm text-slate-500">Receba alertas do sistema.</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.notifications_enabled}
                  onChange={(e) => handleChange('notifications_enabled', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Backup */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl mr-4">
                <Shield size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Backup</h2>
                <p className="text-sm text-slate-500 mt-0.5">Configurações de backup automático.</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                <div>
                  <p className="font-bold text-slate-700">Backup Automático</p>
                  <p className="text-sm text-slate-500">Realizar backup periodicamente.</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.auto_backup}
                  onChange={(e) => handleChange('auto_backup', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>

              {config.auto_backup && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Frequência</label>
                  <select
                    value={config.backup_frequency}
                    onChange={(e) => handleChange('backup_frequency', e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="hourly">Horária</option>
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2" size={20} />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>

          {/* Documentação da API */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 text-white p-3 rounded-xl mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Documentação da API</h2>
                <p className="text-sm text-slate-600">Explore todos os endpoints disponíveis.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="http://localhost:3000/api-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-4 bg-white rounded-xl border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg mr-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Swagger UI</p>
                  <p className="text-xs text-slate-500">Documentação interativa</p>
                </div>
              </a>

              <div className="flex items-center p-4 bg-white rounded-xl border border-slate-200">
                <div className="bg-green-100 text-green-600 p-3 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Status da API</p>
                  <p className="text-xs text-green-600 font-medium">Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'usuarios' ? (
        /* Tab Usuários */
        <GestaoUsuarios />
      ) : activeTab === 'agendamentos' ? (
        /* Tab Agendamentos */
        <AgendamentosRpa />
      ) : activeTab === 'apis' ? (
        /* Tab APIs */
        <GestaoApis />
      ) : (
        /* Tab Logs */
        <LogsSistema />
      )}
    </div>
  );
}
