import { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import { FileText, Info, Plus, X, CalendarPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/components/CalendarioContabil.css';

// Mapeamento de meses em português para data
const MESES_MAP = {
  'Janeiro': '01', 'Fevereiro': '02', 'Março': '03', 'Abril': '04',
  'Maio': '05', 'Junho': '06', 'Julho': '07', 'Agosto': '08',
  'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12'
};

// Cores por categoria
const CORES_CALENDARIO = {
  'Feriados': { bg: '#FEE2E2', border: '#EF4444', text: '#DC2626' },
  'Tributário Federal': { bg: '#DBEAFE', border: '#3B82F6', text: '#2563EB' },
  'Trabalhista e Previdenciário': { bg: '#D1FAE5', border: '#10B981', text: '#059669' },
  'RH - Recursos Humanos': { bg: '#FEF3C7', border: '#F59E0B', text: '#D97706' },
  'Fiscal': { bg: '#EDE9FE', border: '#8B5CF6', text: '#7C3AED' },
  'Departamento Pessoal': { bg: '#FCE7F3', border: '#EC4899', text: '#DB2777' }
};

function getCorCategoria(categoria) {
  return CORES_CALENDARIO[categoria] || { bg: '#F3F4F6', border: '#6B7280', text: '#4B5563' };
}

// Componente Modal de Eventos da Data
function ModalEventosData({ data, eventosDoDia, onClose, onAdicionarEvento, onExcluirEvento, getCorCategoria }) {
  const dataFormatada = new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const eventosOficiais = eventosDoDia.filter(e => !e.tipoUsuario);
  const eventosUsuario = eventosDoDia.filter(e => e.tipoUsuario);
  const totalEventos = eventosDoDia.length;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg">
                <CalendarPlus size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Eventos do Dia</h3>
                <p className="text-xs text-gray-500 mt-0.5 capitalize">{dataFormatada}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {totalEventos === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarPlus size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">Nenhum evento nesta data</p>
              <p className="text-sm text-gray-500 mt-1">Adicione um evento fiscal, DP ou personalizado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Eventos Oficiais */}
              {eventosOficiais.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    Eventos Oficiais ({eventosOficiais.length})
                  </h4>
                  <div className="space-y-2">
                    {eventosOficiais.map((evento, index) => {
                      const cor = getCorCategoria(evento.extendedProps?.categoria || evento.categoria);
                      return (
                        <div
                          key={index}
                          className="p-4 rounded-lg border-l-4 hover:bg-gray-50 transition-colors"
                          style={{ borderLeftColor: cor.border, backgroundColor: cor.bg }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{evento.title || evento.titulo}</p>
                              {(evento.extendedProps?.categoria || evento.categoria) && (
                                <p className="text-xs text-gray-600 mt-1">{evento.extendedProps?.categoria || evento.categoria}</p>
                              )}
                              {(evento.extendedProps?.periodo || evento.periodo) && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {(evento.extendedProps?.periodo || evento.periodo).replace(/^- /, '')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Eventos do Usuário */}
              {eventosUsuario.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    Meus Eventos ({eventosUsuario.length})
                  </h4>
                  <div className="space-y-2">
                    {eventosUsuario.map((evento) => {
                      const cor = getCorCategoria(evento.categoria);
                      return (
                        <div
                          key={evento.id}
                          className="p-4 rounded-lg border-l-4 hover:bg-gray-50 transition-colors"
                          style={{ borderLeftColor: cor.border, backgroundColor: cor.bg }}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{evento.titulo}</p>
                              {evento.categoria && (
                                <p className="text-xs text-gray-600 mt-1">{evento.categoria}</p>
                              )}
                              {evento.descricao && (
                                <p className="text-xs text-gray-500 mt-1">{evento.descricao}</p>
                              )}
                            </div>
                            <button
                              onClick={() => onExcluirEvento(evento.id)}
                              className="text-red-400 hover:text-red-600 p-1 ml-2"
                              title="Excluir evento"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              onClose();
              onAdicionarEvento();
            }}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Adicionar Evento
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CalendarioContabil() {
  const [eventosOficiais, setEventosOficiais] = useState([]);
  const [eventosUsuario, setEventosUsuario] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');

  // Novos estados para modal de data e eventos do usuário
  const [dataSelecionada, setDataSelecionada] = useState(null);
  const [modalDataAberto, setModalDataAberto] = useState(false);
  const [modalEventoAberto, setModalEventoAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novoEvento, setNovoEvento] = useState({
    titulo: '',
    descricao: '',
    categoria: 'Fiscal'
  });

  useEffect(() => {
    carregarEventosOficiais();
    carregarEventosUsuario();
  }, []);

  // Carregar eventos oficiais do calendário contábil
  async function carregarEventosOficiais() {
    try {
      setCarregando(true);
      setErro(null);

      const response = await fetch('/api/calendario/contabil');

      if (!response.ok) {
        throw new Error('Erro ao carregar calendário contábil');
      }

      const data = await response.json();
      const eventosFormatados = [];

      // Processar dados do JSON
      const ano2026 = data['2026'] || {};

      Object.entries(ano2026).forEach(([mes, dias]) => {
        const mesNum = MESES_MAP[mes];
        if (!mesNum) return;

        Object.entries(dias).forEach(([dia, eventosDoDia]) => {
          eventosDoDia.forEach((evento, index) => {
            const categoria = evento.calendar || 'Outros';
            const cor = getCorCategoria(categoria);

            eventosFormatados.push({
              id: `contabil-${mesNum}-${dia}-${index}`,
              title: evento.eventName,
              start: `2026-${mesNum}-${dia.padStart(2, '0')}`,
              backgroundColor: cor.bg,
              borderColor: cor.border,
              textColor: cor.text,
              tipoUsuario: false,
              extendedProps: {
                categoria,
                periodo: evento.eventPeriod || '',
                base: evento.eventBase || '',
                descricao: `${evento.eventName}${evento.eventPeriod ? ' ' + evento.eventPeriod : ''}`,
                baseLegal: evento.eventBase
              }
            });
          });
        });
      });

      setEventosOficiais(eventosFormatados);
      setCarregando(false);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
      setErro('Não foi possível carregar o calendário contábil.');
      setCarregando(false);
    }
  }

  // Carregar eventos do usuário do banco de dados
  async function carregarEventosUsuario() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/calendario/eventos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEventosUsuario(data.eventos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar eventos do usuário:', error);
    }
  }

  // Salvar novo evento no banco de dados
  async function salvarEventoBackend(evento) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Usuário não autenticado');
        return null;
      }

      const response = await fetch('/api/calendario/eventos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(evento)
      });

      if (response.ok) {
        const data = await response.json();
        return data.evento;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar evento');
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast.error(`Erro ao salvar evento: ${error.message}`);
      return null;
    }
  }

  // Excluir evento do banco de dados
  async function excluirEventoBackend(eventoId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Usuário não autenticado');
        return false;
      }

      const response = await fetch(`/api/calendario/eventos/${eventoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return true;
      } else {
        throw new Error('Erro ao excluir evento');
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast.error(`Erro ao excluir evento: ${error.message}`);
      return false;
    }
  }

  // Todos os eventos combinados (oficiais + usuário)
  const todosEventos = useMemo(() => {
    const eventosCombinados = [...eventosOficiais];

    // Adicionar eventos do usuário
    eventosUsuario.forEach(evento => {
      const cor = getCorCategoria(evento.categoria);
      eventosCombinados.push({
        id: evento.id,
        title: evento.titulo,
        start: evento.data,
        backgroundColor: cor.bg,
        borderColor: cor.border,
        textColor: cor.text,
        tipoUsuario: true,
        extendedProps: {
          categoria: evento.categoria,
          descricao: evento.descricao || '',
          periodo: '',
          base: ''
        }
      });
    });

    return eventosCombinados;
  }, [eventosOficiais, eventosUsuario]);

  // Filtrar eventos por categoria
  const eventosFiltrados = useMemo(() => {
    if (filtroCategoria === 'todas') return todosEventos;
    return todosEventos.filter(e =>
      e.extendedProps?.categoria === filtroCategoria || e.categoria === filtroCategoria
    );
  }, [todosEventos, filtroCategoria]);

  // Categorias únicas (incluindo Fiscal e Departamento Pessoal)
  const categorias = useMemo(() => {
    const cats = new Set();
    eventosOficiais.forEach(e => cats.add(e.extendedProps?.categoria));
    eventosUsuario.forEach(e => cats.add(e.categoria));
    return ['todas', ...Array.from(cats).filter(Boolean)];
  }, [eventosOficiais, eventosUsuario]);

  const handleClicarEvento = (evento) => {
    setEventoSelecionado({
      titulo: evento.title,
      categoria: evento.extendedProps?.categoria || evento.categoria,
      periodo: evento.extendedProps?.periodo || '',
      base: evento.extendedProps?.base || '',
      data: evento.start,
      descricao: evento.extendedProps?.descricao || evento.descricao || '',
      tipoUsuario: evento.tipoUsuario
    });
  };

  // Clicar em uma data no calendário
  const handleClicarData = (info) => {
    const data = info.dateStr;
    setDataSelecionada(data);

    // Filtrar eventos do dia (oficiais + usuário)
    const eventosDoDia = todosEventos.filter(e => e.start === data);

    setModalDataAberto(true);
  };

  // Abrir modal para adicionar evento
  const handleAdicionarEvento = () => {
    setNovoEvento({
      titulo: '',
      descricao: '',
      categoria: 'Fiscal'
    });
    setModalEventoAberto(true);
  };

  // Salvar novo evento
  const handleSalvarEvento = async () => {
    if (!novoEvento.titulo.trim()) {
      toast.warning('Preencha o título do evento');
      return;
    }

    setSalvando(true);

    const eventoSalvo = await salvarEventoBackend({
      titulo: novoEvento.titulo,
      descricao: novoEvento.descricao,
      data: dataSelecionada,
      categoria: novoEvento.categoria
    });

    if (eventoSalvo) {
      setEventosUsuario([...eventosUsuario, eventoSalvo]);
      setModalEventoAberto(false);
      setNovoEvento({ titulo: '', descricao: '', categoria: 'Fiscal' });
      toast.success('✅ Evento adicionado com sucesso!');
    }

    setSalvando(false);
  };

  // Excluir evento do usuário
  const handleExcluirEvento = async (eventoId) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    const sucesso = await excluirEventoBackend(eventoId);

    if (sucesso) {
      setEventosUsuario(eventosUsuario.filter(e => e.id !== eventoId));
      toast.success('✅ Evento excluído com sucesso!');
    }
  };

  const renderizarEvento = ({ event }) => {
    const categoria = event.extendedProps?.categoria || event.categoria;
    const cor = getCorCategoria(categoria);

    return (
      <div
        className="calendario-obrigacao-evento"
        style={{ backgroundColor: cor.bg, borderColor: cor.border }}
        onClick={(e) => {
          e.stopPropagation();
          handleClicarEvento(event);
        }}
        title={event.title}
      >
        <span className="calendario-obrigacao-titulo">{event.title}</span>
      </div>
    );
  };

  if (carregando) {
    return (
      <div className="calendario-loading">
        <div className="calendario-loading__spinner"></div>
        <p className="calendario-loading__text">Carregando calendário contábil...</p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="calendario-error">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="font-medium">{erro}</p>
        <button
          onClick={carregarEventosOficiais}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="calendario-obrigacoes-container">
      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <h3 className="font-semibold text-gray-900">Filtrar por Categoria:</h3>
          <div className="flex gap-2 flex-wrap">
            {categorias.map(cat => {
              const cor = cat === 'todas'
                ? { bg: '#F3F4F6', border: '#6B7280', text: '#4B5563' }
                : getCorCategoria(cat);
              const ativo = filtroCategoria === cat;

              return (
                <button
                  key={cat}
                  onClick={() => setFiltroCategoria(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    ativo
                      ? 'ring-2 ring-offset-1 ring-blue-400'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: cor.bg,
                    borderColor: cor.border,
                    color: cor.text
                  }}
                >
                  {cat === 'todas' ? 'Todas' : cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-gray-500" />
          <h3 className="font-semibold text-gray-900">Legenda</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(CORES_CALENDARIO).map(([nome, cor]) => (
            <div key={nome} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: cor.bg, border: `2px solid ${cor.border}` }}
              />
              <span className="text-xs text-gray-700">{nome}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendário */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridYear'
          }}
          events={eventosFiltrados}
          eventContent={renderizarEvento}
          eventClick={(info) => handleClicarEvento(info.event)}
          dateClick={handleClicarData}
          height="auto"
          firstDay={1}
          fixedWeekCount={false}
          showNonCurrentDates={true}
          dayMaxEventRows={4}
          dayMaxEventRowsText="+mais"
          stickyHeaderDates={true}
          initialDate="2026-01-01"
        />
      </div>

      {/* Modal de Detalhes do Evento */}
      {eventoSelecionado && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setEventoSelecionado(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-lg"
                  style={{
                    backgroundColor: getCorCategoria(eventoSelecionado.categoria).bg,
                    border: `2px solid ${getCorCategoria(eventoSelecionado.categoria).border}`
                  }}
                >
                  <FileText
                    size={20}
                    style={{ color: getCorCategoria(eventoSelecionado.categoria).text }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{eventoSelecionado.titulo}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(eventoSelecionado.data + 'T12:00:00').toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                  {eventoSelecionado.tipoUsuario && (
                    <span className="inline-block mt-1 text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">
                      Meu Evento
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setEventoSelecionado(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-500 uppercase">Categoria</p>
                <p className="text-sm text-gray-900 font-medium mt-1">{eventoSelecionado.categoria}</p>
              </div>

              {eventoSelecionado.periodo && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Período de Apuração</p>
                  <p className="text-sm text-gray-900 mt-1">{eventoSelecionado.periodo.replace(/^- /, '')}</p>
                </div>
              )}

              {eventoSelecionado.base && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Base Legal</p>
                  <p className="text-sm text-gray-900 mt-1 font-mono">{eventoSelecionado.base}</p>
                </div>
              )}

              {eventoSelecionado.descricao && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Descrição</p>
                  <p className="text-sm text-gray-900 mt-1">{eventoSelecionado.descricao}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eventos da Data */}
      {modalDataAberto && dataSelecionada && (
        <ModalEventosData
          data={dataSelecionada}
          eventosDoDia={todosEventos.filter(e => e.start === dataSelecionada)}
          onClose={() => setModalDataAberto(false)}
          onAdicionarEvento={handleAdicionarEvento}
          onExcluirEvento={handleExcluirEvento}
          getCorCategoria={getCorCategoria}
        />
      )}

      {/* Modal Adicionar Evento */}
      {modalEventoAberto && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setModalEventoAberto(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 rounded-lg">
                  <CalendarPlus size={20} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Adicionar Evento</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(dataSelecionada + 'T12:00:00').toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalEventoAberto(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                disabled={salvando}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={novoEvento.titulo}
                  onChange={(e) => setNovoEvento({...novoEvento, titulo: e.target.value})}
                  placeholder="Ex: Vencimento ICMS"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={salvando}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={novoEvento.descricao}
                  onChange={(e) => setNovoEvento({...novoEvento, descricao: e.target.value})}
                  placeholder="Detalhes do evento..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={salvando}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Categoria</label>
                <select
                  value={novoEvento.categoria}
                  onChange={(e) => setNovoEvento({...novoEvento, categoria: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={salvando}
                >
                  <option value="Fiscal">🔵 Fiscal</option>
                  <option value="Departamento Pessoal">🟣 Departamento Pessoal (DP)</option>
                  <option value="Tributário Federal">🔵 Tributário Federal</option>
                  <option value="Trabalhista e Previdenciário">🟢 Trabalhista e Previdenciário</option>
                  <option value="RH - Recursos Humanos">🟡 RH - Recursos Humanos</option>
                  <option value="Feriados">🔴 Feriados</option>
                  <option value="Outros">⚪ Outros</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setModalEventoAberto(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={salvando}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvarEvento}
                  disabled={!novoEvento.titulo.trim() || salvando}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {salvando ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Adicionar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
