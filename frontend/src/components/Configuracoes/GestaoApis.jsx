import { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Trash2,
  Loader2,
  Copy,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Shield,
  Clock,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import { apiKeysAPI } from '../../services/apiKeysAPI';
import { toast } from 'sonner';
import ModalApiKey from './ModalApiKey';

const PERMISSOES_DISPONIVEIS = [
  { value: 'read:clientes', label: 'Ler clientes', icon: '🏢' },
  { value: 'write:clientes', label: 'Criar/editar clientes', icon: '✏️' },
  { value: 'read:documentos', label: 'Ler documentos', icon: '📄' },
  { value: 'write:documentos', label: 'Upload documentos', icon: '📤' },
  { value: 'read:calendario', label: 'Ler calendário', icon: '📅' },
  { value: 'write:calendario', label: 'Criar eventos', icon: '➕' },
  { value: 'read:recibos', label: 'Ler recibos', icon: '💰' },
  { value: 'write:recibos', label: 'Gerar recibos', icon: '🧾' }
];

export default function GestaoApis() {
  const [apiKeys, setApiKeys] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [chaveCopiada, setChaveCopiada] = useState(false);
  const [chaveRecemCriada, setChaveRecemCriada] = useState(null);

  useEffect(() => {
    carregarApiKeys();
  }, []);

  async function carregarApiKeys() {
    try {
      setCarregando(true);
      const response = await apiKeysAPI.listar();
      if (response.success) {
        setApiKeys(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar API keys:', error);
      toast.error('Erro ao carregar API keys');
    } finally {
      setCarregando(false);
    }
  }

  const handleAbrirModal = () => {
    setChaveRecemCriada(null);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
  };

  const handleSalvarApiKey = async (dados) => {
    try {
      const response = await apiKeysAPI.criar(dados);
      if (response.success) {
        toast.success(response.message || 'API key criada!');
        setChaveRecemCriada(response.data);
        await carregarApiKeys();
      }
    } catch (error) {
      console.error('Erro ao criar API key:', error);
      const errorMsg = error.response?.data?.message || 'Erro ao criar API key';
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleRevogarApiKey = async (apiKey) => {
    if (!confirm(`Revogar a API key "${apiKey.nome}"?\n\nEsta ação não pode ser desfeita.`)) return;

    try {
      const response = await apiKeysAPI.revogar(apiKey.id);
      if (response.success) {
        toast.success(response.message || 'API key revogada!');
        await carregarApiKeys();
      }
    } catch (error) {
      console.error('Erro ao revogar:', error);
      toast.error(error.response?.data?.message || 'Erro ao revogar');
    }
  };

  const handleToggleApiKey = async (apiKey) => {
    try {
      const response = await apiKeysAPI.toggle(apiKey.id);
      if (response.success) {
        toast.success(response.message);
        await carregarApiKeys();
      }
    } catch (error) {
      console.error('Erro ao alternar:', error);
      toast.error('Erro ao alternar API key');
    }
  };

  const copiarChave = async (chave) => {
    try {
      await navigator.clipboard.writeText(chave);
      setChaveCopiada(true);
      toast.success('Chave copiada para a área de transferência!');
      setTimeout(() => setChaveCopiada(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar chave');
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatarExpiracao = (data) => {
    if (!data) return 'Nunca expira';
    const exp = new Date(data);
    const agora = new Date();
    const expirada = exp < agora;
    return (
      <span className={expirada ? 'text-red-600 font-bold' : 'text-slate-700'}>
        {formatarData(data)} {expirada && '(Expirada)'}
      </span>
    );
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-3 text-slate-600">Carregando API keys...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl mr-4">
            <Key size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Gestão de APIs</h2>
            <p className="text-sm text-slate-500">Gerencie chaves de acesso e documentação da API.</p>
          </div>
        </div>

        <button
          onClick={handleAbrirModal}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-blue-500/20"
        >
          <Plus size={18} className="mr-2" />
          Nova API Key
        </button>
      </div>

      {/* Documentação da API */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-blue-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-3 rounded-xl mr-4">
              <ExternalLink size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Documentação da API</h3>
              <p className="text-sm text-slate-600">Explore todos os endpoints, parâmetros e exemplos.</p>
            </div>
          </div>
          <a
            href="http://localhost:3000/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition-all"
          >
            Abrir Swagger UI
            <ExternalLink size={16} className="ml-2" />
          </a>
        </div>

        {/* Endpoints disponíveis */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { metodo: 'GET', path: '/api/clientes', desc: 'Listar clientes' },
            { metodo: 'POST', path: '/api/clientes', desc: 'Criar cliente' },
            { metodo: 'GET', path: '/api/documentos', desc: 'Listar documentos' },
            { metodo: 'GET', path: '/api/calendario/contabil', desc: 'Calendário contábil' },
            { metodo: 'GET', path: '/api/recibo', desc: 'Listar recibos' },
            { metodo: 'POST', path: '/api/agendamentos', desc: 'Criar agendamento' }
          ].map((ep, i) => (
            <div key={i} className="flex items-center gap-2 bg-white rounded-lg p-2 border border-blue-100">
              <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                ep.metodo === 'GET' ? 'bg-green-100 text-green-700' :
                ep.metodo === 'POST' ? 'bg-blue-100 text-blue-700' :
                ep.metodo === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {ep.metodo}
              </span>
              <span className="text-xs font-mono text-slate-700 truncate">{ep.path}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Banner informativo */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Shield size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Segurança das API Keys</p>
          <p className="text-xs text-amber-700 mt-1">
            As chaves são armazenadas como hash SHA-256. Apenas o prefixo é exibido após a criação.
            Use o header <code className="bg-amber-100 px-1 rounded">X-API-Key: sk_live_...</code> para autenticação.
          </p>
        </div>
      </div>

      {/* Chave recém-criada (destaque especial) */}
      {chaveRecemCriada && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={20} className="text-green-600" />
            <h3 className="font-bold text-green-800">API Key Criada com Sucesso!</h3>
          </div>
          <p className="text-sm text-green-700 mb-3">
            <AlertTriangle size={14} className="inline mr-1" />
            <strong>Guarde esta chave agora!</strong> Ela não será exibida novamente.
          </p>
          <div className="flex items-center gap-2 bg-white rounded-lg p-3 border border-green-200">
            <code className="text-sm font-mono text-slate-800 flex-1 break-all">
              {chaveRecemCriada.chaveCompleta}
            </code>
            <button
              onClick={() => copiarChave(chaveRecemCriada.chaveCompleta)}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              {chaveCopiada ? <CheckCircle size={14} /> : <Copy size={14} />}
              {chaveCopiada ? 'Copiada!' : 'Copiar'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de API Keys */}
      {apiKeys.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <Key size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            Nenhuma API key criada
          </h3>
          <p className="text-slate-500 mb-4">
            Crie sua primeira API key para acesso programático ao sistema.
          </p>
          <button
            onClick={handleAbrirModal}
            className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700"
          >
            <Plus size={16} className="mr-1" />
            Criar primeira API key
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <div
              key={key.id}
              className={`bg-white rounded-xl shadow-sm border p-5 transition-all ${
                key.ativa ? 'border-slate-200 hover:shadow-md' : 'border-slate-300 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-slate-800">{key.nome}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      key.ativa ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {key.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  {/* Prefixo e Stats */}
                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                    <code className="bg-slate-100 px-2 py-1 rounded font-mono text-xs">
                      {key.prefixo}
                    </code>
                    <span className="flex items-center">
                      <BarChart3 size={12} className="mr-1" />
                      {key.totalRequisicoes} requisições
                    </span>
                    <span className="flex items-center">
                      <Clock size={12} className="mr-1" />
                      Última: {formatarData(key.ultimaUtilizacao)}
                    </span>
                  </div>

                  {/* Permissões */}
                  <div className="flex flex-wrap gap-1">
                    {(key.permissoes || []).map((perm, i) => {
                      const permInfo = PERMISSOES_DISPONIVEIS.find(p => p.value === perm);
                      return (
                        <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                          {permInfo?.icon} {permInfo?.label || perm}
                        </span>
                      );
                    })}
                  </div>

                  {/* Expiração */}
                  <div className="mt-2 text-xs text-slate-500">
                    Expira em: {formatarExpiracao(key.expiraEm)}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={() => handleToggleApiKey(key)}
                    className={`p-2 rounded-lg transition-all ${
                      key.ativa
                        ? 'text-slate-500 hover:text-yellow-600 hover:bg-yellow-50'
                        : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
                    }`}
                    title={key.ativa ? 'Desativar' : 'Ativar'}
                  >
                    {key.ativa ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleRevogarApiKey(key)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Revogar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <ModalApiKey
          onClose={handleFecharModal}
          onSave={handleSalvarApiKey}
          permissoesDisponiveis={PERMISSOES_DISPONIVEIS}
        />
      )}
    </div>
  );
}
