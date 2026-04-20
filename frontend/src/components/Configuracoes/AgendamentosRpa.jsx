import { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Play,
  Calendar,
  Repeat,
  Bot,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { agendamentosAPI } from '../../services/agendamentosAPI';
import { toast } from 'sonner';
import ModalAgendamento from './ModalAgendamento';

const TIPOS_ROBO = {
  SIMPLES_NACIONAL: { label: 'Simples Nacional', icon: '🏛️', color: 'bg-blue-100 text-blue-700' },
  SEFAZ_BA: { label: 'SEFAZ-BA', icon: '📋', color: 'bg-purple-100 text-purple-700' }
};

const RECORRENCIAS = {
  unica: { label: 'Execução única', icon: '1️⃣' },
  diaria: { label: 'Diária', icon: '📅' },
  semanal: { label: 'Semanal', icon: '📆' },
  mensal: { label: 'Mensal', icon: '🗓️' },
  x_vezes_dia: { label: 'X vezes por dia', icon: '🔄' },
  x_vezes_semana: { label: 'X vezes por semana', icon: '🔁' }
};

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function AgendamentosRpa() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoEditando, setAgendamentoEditando] = useState(null);

  useEffect(() => {
    carregarAgendamentos();
  }, []);

  async function carregarAgendamentos() {
    try {
      setCarregando(true);
      const response = await agendamentosAPI.listar();
      if (response.success) {
        setAgendamentos(response.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setCarregando(false);
    }
  }

  const handleAbrirModalCriacao = () => {
    setAgendamentoEditando(null);
    setModalAberto(true);
  };

  const handleAbrirModalEdicao = (agendamento) => {
    setAgendamentoEditando(agendamento);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setAgendamentoEditando(null);
  };

  const handleSalvarAgendamento = async (dados) => {
    try {
      if (agendamentoEditando) {
        const response = await agendamentosAPI.atualizar(agendamentoEditando.id, dados);
        if (response.success) {
          toast.success(response.message || 'Agendamento atualizado!');
          await carregarAgendamentos();
        }
      } else {
        const response = await agendamentosAPI.criar(dados);
        if (response.success) {
          toast.success(response.message || 'Agendamento criado!');
          await carregarAgendamentos();
        }
      }
      handleFecharModal();
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      const errorMsg = error.response?.data?.message || 'Erro ao salvar agendamento';
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleExcluirAgendamento = async (agendamento) => {
    if (!confirm(`Excluir o agendamento "${agendamento.nome}"?`)) return;

    try {
      const response = await agendamentosAPI.excluir(agendamento.id);
      if (response.success) {
        toast.success(response.message || 'Agendamento excluído!');
        await carregarAgendamentos();
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error(error.response?.data?.message || 'Erro ao excluir');
    }
  };

  const handleExecutarAgora = async (agendamento) => {
    try {
      const response = await agendamentosAPI.executar(agendamento.id);
      if (response.success) {
        toast.success('Robô executado (simulado)!');
        await carregarAgendamentos();
      }
    } catch (error) {
      console.error('Erro ao executar:', error);
      toast.error('Erro ao executar robô');
    }
  };

  const formatarProximaExecucao = (data) => {
    if (!data) return 'Não definida';
    const d = new Date(data);
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatarCNPJ = (cnpj) => {
    if (!cnpj) return '';
    const nums = cnpj.replace(/\D/g, '');
    if (nums.length === 14) {
      return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`;
    }
    return cnpj;
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-3 text-slate-600">Carregando agendamentos...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl mr-4">
            <Clock size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Agendamento de Robôs</h2>
            <p className="text-sm text-slate-500">Automatize execuções de RPA em horários definidos.</p>
          </div>
        </div>

        <button
          onClick={handleAbrirModalCriacao}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-blue-500/20"
        >
          <Plus size={18} className="mr-2" />
          Novo Agendamento
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Execução simulada</p>
          <p className="text-xs text-amber-700 mt-1">
            Atualmente os robôs são executados de forma simulada. A integração real com Puppeteer será implementada em sprints futuras, junto com notificações automáticas.
          </p>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      {agendamentos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <Clock size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            Nenhum agendamento criado
          </h3>
          <p className="text-slate-500 mb-4">
            Crie seu primeiro agendamento para automatizar execuções de RPA.
          </p>
          <button
            onClick={handleAbrirModalCriacao}
            className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700"
          >
            <Plus size={16} className="mr-1" />
            Criar primeiro agendamento
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agendamentos.map((ag) => {
            const tipoInfo = TIPOS_ROBO[ag.tipoRobo] || TIPOS_ROBO.SIMPLES_NACIONAL;
            const recInfo = RECORRENCIAS[ag.recorrencia] || RECORRENCIAS.unica;

            return (
              <div
                key={ag.id}
                className={`bg-white rounded-xl shadow-sm border p-5 transition-all hover:shadow-md ${
                  ag.ativo ? 'border-slate-200' : 'border-slate-300 opacity-75'
                }`}
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tipoInfo.icon}</span>
                    <div>
                      <h3 className="font-bold text-slate-800">{ag.nome}</h3>
                      <p className="text-xs text-slate-500 font-mono">{formatarCNPJ(ag.cnpj)}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${ag.ativo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {ag.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-500 mb-1">Tipo de Robô</p>
                    <p className="text-sm font-semibold text-slate-700">{tipoInfo.label}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-500 mb-1">Recorrência</p>
                    <p className="text-sm font-semibold text-slate-700">{recInfo.icon} {recInfo.label}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-500 mb-1">Horário</p>
                    <p className="text-sm font-semibold text-slate-700 flex items-center">
                      <Clock size={12} className="mr-1" /> {ag.horaExecucao}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-500 mb-1">Próxima Execução</p>
                    <p className="text-xs font-semibold text-slate-700">{formatarProximaExecucao(ag.proximaExecucao)}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-xs text-slate-500">
                  <span className="flex items-center">
                    <CheckCircle size={12} className="mr-1" />
                    {ag.totalExecucoes} execução(ões)
                  </span>
                  {ag.diasSemanaList && (
                    <span className="flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {ag.diasSemanaList}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleExecutarAgora(ag)}
                      className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Executar agora"
                    >
                      <Play size={16} />
                    </button>
                    <button
                      onClick={() => handleAbrirModalEdicao(ag)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleExcluirAgendamento(ag)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {ag.ultimoResultado?.status && (
                    <span className={`text-xs flex items-center ${
                      ag.ultimoResultado.status === 'sucesso' ? 'text-green-600' :
                      ag.ultimoResultado.status === 'erro' ? 'text-red-600' :
                      'text-slate-500'
                    }`}>
                      {ag.ultimoResultado.status === 'sucesso' && <CheckCircle size={12} className="mr-1" />}
                      {ag.ultimoResultado.status === 'erro' && <XCircle size={12} className="mr-1" />}
                      Última: {ag.ultimoResultado.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalAberto && (
        <ModalAgendamento
          agendamento={agendamentoEditando}
          onClose={handleFecharModal}
          onSave={handleSalvarAgendamento}
          diasSemana={DIAS_SEMANA}
        />
      )}
    </div>
  );
}
