import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Filter,
  Search,
  X,
  Loader2,
  AlertTriangle,
  AlertCircle,
  Info,
  Trash2,
  RefreshCw,
  Clock,
  BarChart3
} from 'lucide-react';
import { logsAPI } from '@/services/logsAPI';
import { toast } from 'sonner';

const NIVEIS_LOG = {
  error: { label: 'Erro', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  warn: { label: 'Aviso', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  info: { label: 'Info', icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
};

export default function LogsSistema() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('todas');
  const [limite, setLimite] = useState(100);
  const [exibindoFiltros, setExibindoFiltros] = useState(false);
  const [filtroRapido, setFiltroRapido] = useState(null);
  const [logSelecionado, setLogSelecionado] = useState(null); // novo estado para modal

  // Carregar logs e estatísticas
  useEffect(() => {
    carregarLogs();
    carregarEstatisticas();
  }, [filtroNivel, busca, limite]);

  // Quando filtro rápido mudar, atualiza filtroNivel
  useEffect(() => {
    if (filtroRapido) {
      setFiltroNivel(filtroRapido);
    } else {
      setFiltroNivel('todas');
    }
  }, [filtroRapido]);

  async function carregarLogs() {
    try {
      setCarregando(true);
      const params = { limit: limite };
      if (filtroNivel !== 'todas') params.level = filtroNivel;
      if (busca) params.search = busca;

      const response = await logsAPI.listar(params);
      if (response.success) {
        setLogs(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast.error('Erro ao carregar logs do sistema');
    } finally {
      setCarregando(false);
    }
  }

  async function carregarEstatisticas() {
    try {
      const response = await logsAPI.estatisticas();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  // Handler para clique nos cards de estatísticas
  const handleCardClick = (nivel) => {
    if (filtroRapido === nivel) {
      setFiltroRapido(null);
      setFiltroNivel('todas');
    } else {
      if (nivel === null) {
        setFiltroRapido(null);
        setFiltroNivel('todas');
      } else {
        setFiltroRapido(nivel);
        setFiltroNivel(nivel);
      }
    }
  };

  // Handler para clique em um log (abrir modal)
  const handleLogClick = (log) => {
    setLogSelecionado(log);
  };

  // Fechar modal
  const handleFecharModal = () => {
    setLogSelecionado(null);
  };

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && logSelecionado) {
        handleFecharModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [logSelecionado]);

  // Download de logs
  const handleDownload = async (format) => {
    try {
      await logsAPI.download(format, filtroNivel !== 'todas' ? filtroNivel : null);
      toast.success(`Logs exportados em formato ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Erro ao exportar logs:', error);
      toast.error('Erro ao exportar logs');
    }
  };

  // Limpar logs antigos
  const handleLimparLogs = async () => {
    if (!confirm('Limpar logs com mais de 7 dias?\n\nEsta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await logsAPI.limpar(7);
      if (response.success) {
        toast.success(response.message);
        await carregarLogs();
        await carregarEstatisticas();
      }
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
      toast.error('Erro ao limpar logs');
    }
  };

  // Format timestamp
  const formatarData = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Obter configuração do nível
  const getNivelConfig = (level) => {
    return NIVEIS_LOG[level] || NIVEIS_LOG.info;
  };

  // Traduzir nível para texto legível
  const traduzirNivel = (level) => {
    const traducao = {
      error: { texto: 'Erro', descricao: 'Ocorreu um erro no sistema', emoji: '🔴' },
      warn: { texto: 'Aviso', descricao: 'Situação que requer atenção', emoji: '🟡' },
      info: { texto: 'Informação', descricao: 'Operação normal do sistema', emoji: '🔵' }
    };
    return traducao[level] || traducao.info;
  };

  // Formatar dados extras do log
  const formatarExtras = (log) => {
    const extras = [];
    if (log.userAgent) extras.push({ label: 'Navegador', value: log.userAgent });
    if (log.ip) extras.push({ label: 'IP', value: log.ip });
    if (log.userId) extras.push({ label: 'Usuário ID', value: log.userId });
    if (log.service) extras.push({ label: 'Serviço', value: log.service });
    if (log.stack) extras.push({ label: 'Stack Trace', value: log.stack, type: 'code' });
    return extras;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl mr-4">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Logs do Sistema</h2>
            <p className="text-sm text-slate-500">Monitore todas as operações do sistema.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { carregarLogs(); carregarEstatisticas(); }}
            className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Atualizar"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setExibindoFiltros(!exibindoFiltros)}
            className={`flex items-center px-4 py-2 rounded-lg transition-all ${
              exibindoFiltros 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Filter size={16} className="mr-2" />
            Filtros
          </button>
          <button
            onClick={() => handleDownload('txt')}
            className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-all"
          >
            <Download size={16} className="mr-2" />
            TXT
          </button>
          <button
            onClick={() => handleDownload('csv')}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
          >
            <Download size={16} className="mr-2" />
            CSV
          </button>
          <button
            onClick={handleLimparLogs}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
          >
            <Trash2 size={16} className="mr-2" />
            Limpar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Card Total */}
          <div
            onClick={() => handleCardClick(null)}
            className={`bg-white rounded-xl shadow-sm border p-4 transition-all cursor-pointer hover:shadow-md ${
              filtroRapido === null && filtroNivel === 'todas'
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <BarChart3 size={20} className="text-blue-600" />
              <span className="text-xs text-slate-500">Total</span>
            </div>
            <p className="text-2xl font-black text-slate-800">{stats.total}</p>
            <p className="text-xs text-slate-500 mt-1">Logs registrados</p>
            {filtroRapido === null && filtroNivel === 'todas' && (
              <p className="text-xs text-blue-600 font-bold mt-2">✓ Filtrando</p>
            )}
          </div>

          {/* Card Info */}
          <div
            onClick={() => handleCardClick('info')}
            className={`bg-white rounded-xl shadow-sm border p-4 transition-all cursor-pointer hover:shadow-md ${
              filtroRapido === 'info'
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-slate-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Info size={20} className="text-blue-600" />
              <span className="text-xs text-slate-500">Info</span>
            </div>
            <p className="text-2xl font-black text-blue-600">{stats.info}</p>
            <p className="text-xs text-slate-500 mt-1">Informações</p>
            {filtroRapido === 'info' && (
              <p className="text-xs text-blue-600 font-bold mt-2">✓ Filtrando</p>
            )}
          </div>

          {/* Card Warnings */}
          <div
            onClick={() => handleCardClick('warn')}
            className={`bg-white rounded-xl shadow-sm border p-4 transition-all cursor-pointer hover:shadow-md ${
              filtroRapido === 'warn'
                ? 'border-yellow-500 ring-2 ring-yellow-200'
                : 'border-slate-200 hover:border-yellow-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle size={20} className="text-yellow-600" />
              <span className="text-xs text-slate-500">Warnings</span>
            </div>
            <p className="text-2xl font-black text-yellow-600">{stats.warnings}</p>
            <p className="text-xs text-slate-500 mt-1">Alertas</p>
            {filtroRapido === 'warn' && (
              <p className="text-xs text-yellow-600 font-bold mt-2">✓ Filtrando</p>
            )}
          </div>

          {/* Card Errors */}
          <div
            onClick={() => handleCardClick('error')}
            className={`bg-white rounded-xl shadow-sm border p-4 transition-all cursor-pointer hover:shadow-md ${
              filtroRapido === 'error'
                ? 'border-red-500 ring-2 ring-red-200'
                : 'border-slate-200 hover:border-red-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <AlertCircle size={20} className="text-red-600" />
              <span className="text-xs text-slate-500">Erros</span>
            </div>
            <p className="text-2xl font-black text-red-600">{stats.errors}</p>
            <p className="text-xs text-slate-500 mt-1">Erros registrados</p>
            {filtroRapido === 'error' && (
              <p className="text-xs text-red-600 font-bold mt-2">✓ Filtrando</p>
            )}
          </div>
        </div>
      )}

      {/* Filtros Avançados */}
      {exibindoFiltros && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nível</label>
              <select
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todos os níveis</option>
                <option value="info">Info</option>
                <option value="warn">Aviso</option>
                <option value="error">Erro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Limite</label>
              <select
                value={limite}
                onChange={(e) => setLimite(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={50}>50 logs</option>
                <option value={100}>100 logs</option>
                <option value={200}>200 logs</option>
                <option value={500}>500 logs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Buscar</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="URL, método, mensagem..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                {busca && (
                  <button
                    onClick={() => setBusca('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Busca Rápida (sempre visível) */}
      {!exibindoFiltros && (
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar logs..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {carregando ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <span className="ml-3 text-slate-600">Carregando logs...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            Nenhum log encontrado
          </h3>
          <p className="text-slate-500">
            {busca || filtroNivel !== 'todas' 
              ? 'Tente ajustar os filtros de busca.'
              : 'O sistema ainda não registrou operações.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header da tabela */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700">
                {logs.length} log(s) encontrado(s)
              </span>
              {filtroRapido && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                  filtroRapido === 'error' ? 'bg-red-100 text-red-700' :
                  filtroRapido === 'warn' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {filtroRapido === 'error' ? '🔴 Erros' :
                   filtroRapido === 'warn' ? '🟡 Avisos' :
                   '🔵 Informações'}
                  <button
                    onClick={() => setFiltroRapido(null)}
                    className="ml-1 hover:opacity-70"
                    title="Limpar filtro"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            {stats?.lastUpdate && (
              <span className="text-xs text-slate-500 flex items-center">
                <Clock size={12} className="mr-1" />
                Última atualização: {new Date(stats.lastUpdate).toLocaleString('pt-BR')}
              </span>
            )}
          </div>

          {/* Lista de Logs */}
          <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
            {logs.map((log, index) => {
              const nivelConfig = getNivelConfig(log.level);
              const NivelIcon = nivelConfig.icon;

              return (
                <div
                  key={index}
                  onClick={() => handleLogClick(log)}
                  className="p-4 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {/* Ícone do nível */}
                    <div className={`p-2 rounded-lg ${nivelConfig.bg} ${nivelConfig.border} border flex-shrink-0`}>
                      <NivelIcon size={16} className={nivelConfig.color} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      {/* Timestamp e Nível */}
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-500 font-mono">
                          {formatarData(log.timestamp)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${nivelConfig.bg} ${nivelConfig.color}`}>
                          {nivelConfig.label}
                        </span>
                        {log.method && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono font-bold">
                            {log.method}
                          </span>
                        )}
                        {log.statusCode && (
                          <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                            log.statusCode >= 400 
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {log.statusCode}
                          </span>
                        )}
                      </div>

                      {/* Mensagem */}
                      <p className="text-sm text-slate-800 font-medium mb-1">
                        {log.message || 'Sem mensagem'}
                      </p>

                      {/* Detalhes extras */}
                      {(log.url || log.duration || log.ip) && (
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          {log.url && (
                            <span className="font-mono" title={log.url}>
                              📍 {log.url.length > 60 ? log.url.substring(0, 60) + '...' : log.url}
                            </span>
                          )}
                          {log.duration && <span>⏱️ {log.duration}</span>}
                          {log.ip && <span>🌐 {log.ip}</span>}
                          {log.userId && <span>👤 {log.userId.substring(0, 8)}...</span>}
                        </div>
                      )}

                      {/* Stack trace (se houver) */}
                      {log.stack && (
                        <details className="mt-2">
                          <summary className="text-xs text-red-600 cursor-pointer font-medium">
                            Ver stack trace
                          </summary>
                          <pre className="mt-2 p-3 bg-slate-900 text-green-400 rounded-lg text-xs overflow-x-auto font-mono">
                            {log.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Log */}
      {logSelecionado && (() => {
        const nivelInfo = traduzirNivel(logSelecionado.level);
        const extras = formatarExtras(logSelecionado);

        return (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleFecharModal}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className={`px-6 py-5 flex items-center justify-between ${
                logSelecionado.level === 'error' ? 'bg-red-600' :
                logSelecionado.level === 'warn' ? 'bg-yellow-500' :
                'bg-blue-600'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    {nivelInfo.emoji}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {nivelInfo.texto}
                    </h2>
                    <p className="text-white text-opacity-90 text-sm">
                      {nivelInfo.descricao}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleFecharModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body do Modal */}
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {/* Timestamp e Método */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Data e Hora</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {formatarData(logSelecionado.timestamp)}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Duração</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {logSelecionado.duration || '-'}
                    </p>
                  </div>
                </div>

                {/* Mensagem */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-xs text-slate-500 mb-2">Mensagem</p>
                  <p className="text-sm font-medium text-slate-800">
                    {logSelecionado.message || 'Sem mensagem'}
                  </p>
                </div>

                {/* URL e Método HTTP */}
                {(logSelecionado.url || logSelecionado.method) && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-2">Requisição</p>
                    <div className="flex items-center gap-2">
                      {logSelecionado.method && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono font-bold">
                          {logSelecionado.method}
                        </span>
                      )}
                      {logSelecionado.url && (
                        <span className="text-sm font-mono text-slate-700 break-all">
                          {logSelecionado.url}
                        </span>
                      )}
                      {logSelecionado.statusCode && (
                        <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                          logSelecionado.statusCode >= 400
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {logSelecionado.statusCode}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Extras */}
                {extras.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500 font-semibold">Informações Adicionais</p>
                    {extras.map((extra, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500 mb-1">{extra.label}</p>
                        {extra.type === 'code' ? (
                          <pre className="text-xs font-mono text-red-600 bg-slate-900 p-3 rounded overflow-x-auto">
                            {extra.value}
                          </pre>
                        ) : (
                          <p className="text-sm text-slate-700 break-all">{extra.value}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Dados brutos (colapsável) */}
                <details className="border border-slate-200 rounded-lg">
                  <summary className="px-4 py-3 bg-slate-50 cursor-pointer text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                    Ver dados brutos (JSON)
                  </summary>
                  <pre className="p-4 text-xs font-mono text-slate-600 bg-slate-50 overflow-x-auto max-h-48">
                    {JSON.stringify(logSelecionado, null, 2)}
                  </pre>
                </details>
              </div>

              {/* Footer do Modal */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Clique fora ou pressione ESC para fechar
                </p>
                <button
                  onClick={handleFecharModal}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
