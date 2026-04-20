import { useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import obrigacoesData from '../data/obrigacoes2026.json';

// Cores por tipo de obrigação
const CORES = {
  fiscal: { bg: '#3b82f6', border: '#2563eb', text: '#ffffff' },    // Blue
  dp: { bg: '#22c55e', border: '#16a34a', text: '#ffffff' },        // Green
  declaracao: { bg: '#f59e0b', border: '#d97706', text: '#ffffff' } // Yellow
};

export default function CalendarioObrigacoes() {
  const [obrigacaoSelecionada, setObrigacaoSelecionada] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'

  // Format obrigações como eventos do FullCalendar
  const eventosObrigacoes = useMemo(() => {
    const eventos = [];

    // Obrigações mensais
    Object.entries(obrigacoesData.meses).forEach(([mes, dados]) => {
      dados.obrigacoes.forEach(obrigacao => {
        eventos.push({
          id: `obrigacao-${obrigacao.data}`,
          title: obrigacao.titulo,
          start: obrigacao.data,
          backgroundColor: CORES[obrigacao.tipo]?.bg || '#6b7280',
          borderColor: CORES[obrigacao.tipo]?.border || '#4b5563',
          textColor: CORES[obrigacao.tipo]?.text || '#ffffff',
          extendedProps: {
            tipo: obrigacao.tipo,
            descricao: obrigacao.descricao,
            tags: obrigacao.tags || [],
            fonte: obrigacoesData.fonte
          }
        });
      });
    });

    // Declarações
    Object.entries(obrigacoesData.declaracoes).forEach(([mes, declaracoes]) => {
      declaracoes.forEach(decl => {
        eventos.push({
          id: `declaracao-${decl.data}`,
          title: `📋 ${decl.titulo}`,
          start: decl.data,
          backgroundColor: CORES.declaracao.bg,
          borderColor: CORES.declaracao.border,
          textColor: CORES.declaracao.text,
          extendedProps: {
            tipo: 'declaracao',
            descricao: decl.descricao,
            tags: ['declaração', 'prazo'],
            fonte: obrigacoesData.fonte
          }
        });
      });
    });

    return eventos;
  }, []);

  // Estatísticas
  const stats = useMemo(() => {
    const fiscal = eventosObrigacoes.filter(e => e.extendedProps.tipo === 'fiscal').length;
    const dp = eventosObrigacoes.filter(e => e.extendedProps.tipo === 'dp').length;
    const declaracoes = eventosObrigacoes.filter(e => e.extendedProps.tipo === 'declaracao').length;
    return { fiscal, dp, declaracoes, total: eventosObrigacoes.length };
  }, [eventosObrigacoes]);

  const handleEventClick = (info) => {
    setObrigacaoSelecionada({
      titulo: info.event.title,
      data: info.event.start,
      tipo: info.event.extendedProps.tipo,
      descricao: info.event.extendedProps.descricao,
      tags: info.event.extendedProps.tags,
      fonte: info.event.extendedProps.fonte
    });
  };

  const renderizarEvento = (eventInfo) => {
    return (
      <div
        className="px-2 py-1 rounded text-xs font-medium truncate cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          backgroundColor: eventInfo.event.backgroundColor,
          color: eventInfo.event.textColor,
          border: `1px solid ${eventInfo.event.borderColor}`
        }}
        title={eventInfo.event.title}
      >
        {eventInfo.timeText && (
          <span className="mr-1">{eventInfo.timeText}</span>
        )}
        <span>{eventInfo.event.title}</span>
      </div>
    );
  };

  const formatarData = (date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTipoLabel = (tipo) => {
    const labels = {
      fiscal: '🔵 Fiscal/Tributário',
      dp: '🟢 Departamento Pessoal',
      declaracao: '🟡 Declaração/Obrigação Acessória'
    };
    return labels[tipo] || tipo;
  };

  return (
    <div>
      {/* Header com estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total de Obrigações</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">🔵 Fiscais</p>
          <p className="text-2xl font-bold text-blue-600">{stats.fiscal}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">🟢 DP</p>
          <p className="text-2xl font-bold text-green-600">{stats.dp}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">🟡 Declarações</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.declaracoes}</p>
        </div>
      </div>

      {/* Toggle View */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setViewMode('calendar')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'calendar'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          📅 Calendário
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          📋 Lista
        </button>
      </div>

      {/* Calendário ou Lista */}
      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
            initialView="dayGridMonth"
            locale={ptBrLocale}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,listMonth'
            }}
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              list: 'Lista'
            }}
            events={eventosObrigacoes}
            eventContent={renderizarEvento}
            eventClick={handleEventClick}
            height="auto"
            firstDay={1}
            fixedWeekCount={false}
            dayMaxEventRows={4}
            dayMaxEventRowsText="+mais"
            stickyHeaderDates={true}
            noEventsContent="Nenhuma obrigação neste período"
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {eventosObrigacoes
              .sort((a, b) => new Date(a.start) - new Date(b.start))
              .map((evento, index) => (
                <button
                  key={evento.id}
                  onClick={() => handleEventClick({ event: evento })}
                  className="w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-start gap-4"
                >
                  <div
                    className="w-1 h-full min-h-[60px] rounded flex-shrink-0"
                    style={{ backgroundColor: evento.backgroundColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-gray-900 truncate">{evento.title}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatarData(evento.start)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {evento.extendedProps.descricao}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {evento.extendedProps.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Modal de Detalhes */}
      {obrigacaoSelecionada && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setObrigacaoSelecionada(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {obrigacaoSelecionada.titulo}
              </h3>
              <button
                onClick={() => setObrigacaoSelecionada(null)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Data de Vencimento</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {formatarData(obrigacaoSelecionada.data)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-medium">{getTipoLabel(obrigacaoSelecionada.tipo)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Descrição</p>
                <p className="text-gray-700 mt-1">{obrigacaoSelecionada.descricao}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Tags</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {obrigacaoSelecionada.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400">
                  Fonte: {obrigacaoSelecionada.fonte}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setObrigacaoSelecionada(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
