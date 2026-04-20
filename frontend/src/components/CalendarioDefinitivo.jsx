import { useState, useEffect, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import {
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  CalendarDays,
  Tag,
  Clock,
} from "lucide-react";
import ModalEvento from "./Calendario/ModalEvento";
import ModalDiaEventos from "./Calendario/ModalDiaEventos";
import { eventosAPI, tiposEventoAPI } from "../services/calendarioAPI";
import { toast } from 'sonner';
import "../styles/components/CalendarioDefinitivo.css";
import "../styles/components/CalendarioModal.css";

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

/**
 * Mapeamento de categorias legadas do calendário oficial para slugs de TipoEvento
 * As categorias vêm do JSON do calendário contabil e precisam ser traduzidas
 * para os tipos do banco de dados.
 */
const CATEGORIA_PARA_TIPO = {
  Feriados: "feriado",
  "Tributário Federal": "tributario",
  "Trabalhista e Previdenciário": "trabalhista",
  "RH - Recursos Humanos": "datas_comemorativas",
};

/**
 * Cores fallback para categorias que não têm tipo correspondente
 */
const CORES_FALLBACK = {
  Feriados: { bg: "#FEE2E2", border: "#EF4444", text: "#DC2626", icon: "🎌" },
  "Tributário Federal": {
    bg: "#DBEAFE",
    border: "#3B82F6",
    text: "#2563EB",
    icon: "🏛️",
  },
  "Trabalhista e Previdenciário": {
    bg: "#D1FAE5",
    border: "#10B981",
    text: "#059669",
    icon: "👷",
  },
  "RH - Recursos Humanos": {
    bg: "#FEF3C7",
    border: "#F59E0B",
    text: "#D97706",
    icon: "🎉",
  },
};

/**
 * Converter hex para formato com alpha
 */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Obter cores de um tipo de evento do banco ou fallback
 */
function getCorTipo(tipoEvento, categoriaLegada = null) {
  if (tipoEvento) {
    return {
      bg: hexToRgba(tipoEvento.cor, 0.15),
      border: tipoEvento.cor,
      text: tipoEvento.cor,
      icon: tipoEvento.icone || "📅",
    };
  }

  // Fallback para categoria legada
  if (categoriaLegada && CORES_FALLBACK[categoriaLegada]) {
    return CORES_FALLBACK[categoriaLegada];
  }

  // Default
  return { bg: "#F3F4F6", border: "#6B7280", text: "#4B5563", icon: "📅" };
}

export default function CalendarioDefinitivo() {
  const [viewMode, setViewMode] = useState("calendar"); // 'calendar' | 'list'
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [mesAtual, setMesAtual] = useState(new Date());
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [busca, setBusca] = useState("");
  const calendarRef = useRef(null);

  // Estados para modais
  const [modalEventoAberto, setModalEventoAberto] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [dataClicada, setDataClicada] = useState(null);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [eventosUsuario, setEventosUsuario] = useState([]);

  // Modal de dia (novo - mostra todos eventos + add)
  const [modalDiaAberto, setModalDiaAberto] = useState(false);
  const [eventosDoDiaSelecionado, setEventosDoDiaSelecionado] = useState([]);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [tiposEvento, setTiposEvento] = useState([]);
  const [mapaTipos, setMapaTipos] = useState({}); // slug -> tipo

  // Carregar tipos de evento do banco
  useEffect(() => {
    tiposEventoAPI
      .listar()
      .then((res) => {
        const tipos = res.tipos || [];
        setTiposEvento(tipos);

        // Criar mapa slug -> tipo para lookup rápido
        const mapa = {};
        tipos.forEach((t) => {
          mapa[t.nome] = t;
        });
        setMapaTipos(mapa);
      })
      .catch(console.error);
  }, []);

  // Carregar eventos do banco
  useEffect(() => {
    carregarEventos();
    carregarEventosUsuario();
  }, []);

  async function carregarEventos() {
    try {
      setCarregando(true);
      setErro(null);

      const response = await fetch("/api/calendario/contabil");
      if (!response.ok) throw new Error("Erro ao carregar calendário");

      const data = await response.json();
      const eventosFormatados = formatarEventos(data);
      setEventos(eventosFormatados);
    } catch (error) {
      console.error("Erro:", error);
      setErro("Não foi possível carregar o calendário contábil.");
      toast.error("Erro ao carregar calendário");
    } finally {
      setCarregando(false);
    }
  }

  // Carregar eventos do usuário
  async function carregarEventosUsuario() {
    try {
      const response = await eventosAPI.listar();
      if (response.success && response.data) {
        setEventosUsuario(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar eventos do usuário:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error config:", error.config);
    }
  }

  // Formatar dados do banco para FullCalendar
  function formatarEventos(data) {
    const eventos = [];
    const meta = data._meta || {};

    // Mapear nome do mês para número
    const mesesMap = {
      Janeiro: 1,
      Fevereiro: 2,
      Março: 3,
      Abril: 4,
      Maio: 5,
      Junho: 6,
      Julho: 7,
      Agosto: 8,
      Setembro: 9,
      Outubro: 10,
      Novembro: 11,
      Dezembro: 12,
    };

    // Remover _meta e iterar anos/meses/dias
    const { _meta, ...anosData } = data;

    Object.entries(anosData).forEach(([ano, meses]) => {
      Object.entries(meses).forEach(([mesNome, dias]) => {
        const mesNum = mesesMap[mesNome];
        if (!mesNum) {
          console.warn("Mês não encontrado:", mesNome);
          return;
        }

        Object.entries(dias).forEach(([dia, eventosDoDia]) => {
          eventosDoDia.forEach((ev) => {
            // Formatar data corretamente: YYYY-MM-DD
            const dataStr = `${ano}-${String(mesNum).padStart(2, "0")}-${dia.padStart(2, "0")}`;

            // Mapear categoria legada para tipo do banco
            const slugTipo = CATEGORIA_PARA_TIPO[ev.calendar];
            const tipoDoBanco = mapaTipos[slugTipo];
            const cor = getCorTipo(tipoDoBanco, ev.calendar);

            eventos.push({
              id: `oficial-${dataStr}-${ev.eventName}`,
              title: ev.eventName,
              start: dataStr,
              backgroundColor: cor.border,
              borderColor: cor.border,
              textColor: cor.text,
              extendedProps: {
                categoria: ev.calendar,
                periodoApuracao: ev.eventPeriod || "",
                baseLegal: ev.eventBase || "",
                cor: cor,
                tipo: "oficial",
                tipoEventoSlug: slugTipo,
              },
            });
          });
        });
      });
    });

    // Adicionar eventos do usuário
    eventosUsuario.forEach((ev) => {
      const dataStr = ev.data;
      if (!dataStr || dataStr.length !== 10) {
        console.warn("Evento com data inválida:", ev);
        return;
      }

      const tipoEncontrado = tiposEvento.find((t) => t.id === ev.tipoId);
      const corHex = ev.tipoCor || tipoEncontrado?.cor || "#6b7280";
      const icone = tipoEncontrado?.icone || "📅";

      eventos.push({
        id: ev.id,
        title: ev.titulo,
        start: dataStr,
        backgroundColor: corHex,
        borderColor: corHex,
        textColor: "#ffffff",
        extendedProps: {
          categoria: tipoEncontrado?.label || "Evento",
          descricao: ev.descricao || "",
          cor: { bg: corHex, border: corHex, text: "#ffffff", icon: icone },
          tipo: "usuario",
          tipoId: ev.tipoId,
          lembrete: ev.lembrete,
        },
      });
    });

    return eventos;
  }

  // Filtrar eventos
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((ev) => {
      const matchCategoria =
        filtroCategoria === "todas" ||
        ev.extendedProps.categoria === filtroCategoria;
      const matchBusca =
        !busca ||
        ev.title.toLowerCase().includes(busca.toLowerCase()) ||
        ev.extendedProps.categoria.toLowerCase().includes(busca.toLowerCase());
      return matchCategoria && matchBusca;
    });
  }, [eventos, filtroCategoria, busca]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const cats = {};
    eventosFiltrados.forEach((ev) => {
      const cat = ev.extendedProps.categoria;
      cats[cat] = (cats[cat] || 0) + 1;
    });
    return {
      total: eventosFiltrados.length,
      porCategoria: cats,
    };
  }, [eventosFiltrados]);

  // Navegação
  const irParaMesAnterior = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev();
      setMesAtual(calendarRef.current.getApi().getDate());
    }
  };

  const irParaProximoMes = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next();
      setMesAtual(calendarRef.current.getApi().getDate());
    }
  };

  const irParaHoje = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
      setMesAtual(new Date());
    }
  };

  const handleDatesSet = (info) => {
    setMesAtual(info.view.currentStart);
  };

  const handleEventClick = (clickInfo) => {
    const evento = clickInfo.event;

    if (evento.extendedProps?.tipo === "usuario") {
      // Extract date safely - use local date components
      let dataStr;
      if (evento.start) {
        const year = evento.start.getFullYear();
        const month = String(evento.start.getMonth() + 1).padStart(2, "0");
        const day = String(evento.start.getDate()).padStart(2, "0");
        dataStr = `${year}-${month}-${day}`;
      }

      setEventoEditando({
        id: evento.id,
        titulo: evento.title,
        descricao: evento.extendedProps.descricao,
        data: dataStr,
        tipoId: evento.extendedProps.tipoId,
        cor: evento.backgroundColor,
        lembrete: evento.extendedProps.lembrete,
      });
      setDataClicada(null);
      setModalEventoAberto(true);
    } else {
      // Evento oficial → detalhes
      let dataStr;
      if (evento.start) {
        const year = evento.start.getFullYear();
        const month = String(evento.start.getMonth() + 1).padStart(2, "0");
        const day = String(evento.start.getDate()).padStart(2, "0");
        dataStr = `${year}-${month}-${day}`;
      }

      setEventoSelecionado({
        titulo: evento.title,
        categoria: evento.extendedProps?.categoria || "",
        periodoApuracao: evento.extendedProps?.periodoApuracao || "",
        baseLegal: evento.extendedProps?.baseLegal || "",
        data: dataStr,
        cor: evento.extendedProps?.cor,
      });
      setModalEventoAberto(false);
      setModalDiaAberto(false);
    }
  };

  const handleDateClick = (clickInfo) => {
    // FullCalendar provides dateStr in ISO format or we can construct it from the date object
    let dataStr;

    if (clickInfo.dateStr) {
      // dateStr is already in YYYY-MM-DD format
      dataStr = clickInfo.dateStr;
    } else if (clickInfo.date) {
      // Fallback: construct from Date object using local time
      const year = clickInfo.date.getFullYear();
      const month = String(clickInfo.date.getMonth() + 1).padStart(2, "0");
      const day = String(clickInfo.date.getDate()).padStart(2, "0");
      dataStr = `${year}-${month}-${day}`;
    }

    if (!dataStr) return;

    const eventos = eventosFiltrados.filter((ev) => {
      const evDate =
        ev.start instanceof Date
          ? ev.start.toISOString().split("T")[0]
          : typeof ev.start === "string"
            ? ev.start.split("T")[0]
            : "";
      return evDate === dataStr;
    });

    setDiaSelecionado(dataStr);
    setEventosDoDiaSelecionado(eventos);
    setModalDiaAberto(true);
  };

  const handleAbrirModalNovoEvento = () => {
    // Fecha modal do dia, abre modal de criar evento
    setModalDiaAberto(false);
    setDataClicada(diaSelecionado);
    setEventoEditando(null);
    setModalEventoAberto(true);
  };

  const handleRemoverEventoUsuario = async (ev) => {
    if (!confirm(`Remover "${ev.title}"?`)) return;
    try {
      const res = await eventosAPI.excluir(ev.id);
      if (res.success) {
        toast.success("Evento removido");
        carregarEventosUsuario();
      }
    } catch (error) {
      toast.error("Erro ao remover evento");
    }
  };

  const handleFecharModal = () => {
    setModalEventoAberto(false);
    setEventoEditando(null);
    setDataClicada(null);
    setEventoSelecionado(null);
    setModalDiaAberto(false);
    setDiaSelecionado(null);
    setEventosDoDiaSelecionado([]);
  };

  // Renderizar evento no calendário
  const renderizarEvento = ({ event }) => {
    const cor =
      event.extendedProps.cor ||
      getCorTipo(null, event.extendedProps.categoria);
    return (
      <div
        className="cal-evento-item"
        style={{
          backgroundColor: cor.bg,
          borderColor: cor.border,
          color: cor.text,
        }}
        title={`${event.title}\n${event.extendedProps.periodoApuracao || ""}`}
      >
        <span className="cal-evento-icon">{cor.icon}</span>
        <span className="cal-evento-titulo">{event.title}</span>
      </div>
    );
  };

  // Loading
  if (carregando) {
    return (
      <div className="cal-loading">
        <div className="cal-loading-spinner"></div>
        <p>Carregando calendário contábil...</p>
      </div>
    );
  }

  // Error
  if (erro) {
    return (
      <div className="cal-error">
        <div className="cal-error-icon">⚠️</div>
        <h3>Erro ao carregar calendário</h3>
        <p>{erro}</p>
        <button onClick={carregarEventos} className="cal-btn-primary">
          Tentar Novamente
        </button>
      </div>
    );
  }

  // Categorias únicas
  const categorias = [
    ...new Set(eventos.map((e) => e.extendedProps.categoria)),
  ].filter(Boolean);

  return (
    <div className="cal-container">
      {/* Header Compacto e Profissional */}
      <div className="cal-header">
        <div className="cal-header-content">
          {/* Esquerda: Título + Stats */}
          <div className="cal-header-left">
            <div className="cal-title-group">
              <h1 className="cal-title">Calendário Contábil</h1>
              <span className="cal-subtitle">167 obrigações • 2026</span>
            </div>
          </div>

          {/* Centro: Toggle View com Labels */}
          <div className="cal-view-toggle">
            <button
              className={`cal-toggle-btn ${viewMode === "calendar" ? "active" : ""}`}
              onClick={() => setViewMode("calendar")}
              title="Visualização em calendário"
            >
              <CalendarIcon size={16} />
              <span>Calendário</span>
            </button>
            <button
              className={`cal-toggle-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="Visualização em lista"
            >
              <List size={16} />
              <span>Lista</span>
            </button>
          </div>

          {/* Direita: Busca + Filtro */}
          <div className="cal-header-right">
            <div className="cal-search-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="cal-search-input"
              />
            </div>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="cal-category-select"
            >
              <option value="todas">Todas</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="cal-content">
        {viewMode === "calendar" ? (
          <>
            {/* Calendar Header */}
            <div className="cal-nav-header">
              <div className="cal-nav-buttons">
                <button
                  onClick={irParaMesAnterior}
                  className="cal-nav-btn"
                  aria-label="Mês anterior"
                >
                  <ChevronLeft size={20} />
                </button>
                <button onClick={irParaHoje} className="cal-btn-hoje">
                  Hoje
                </button>
                <button
                  onClick={irParaProximoMes}
                  className="cal-nav-btn"
                  aria-label="Próximo mês"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <h2 className="cal-mes-ano">
                {MESES[mesAtual.getMonth()]} {mesAtual.getFullYear()}
              </h2>
              <div className="cal-legenda">
                {tiposEvento.slice(0, 6).map((tipo) => {
                  const cor = getCorTipo(tipo);
                  return (
                    <span key={tipo.id} className="cal-legenda-item">
                      <span style={{ color: cor.border }}>{cor.icon}</span>
                      <span>{tipo.label}</span>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* FullCalendar */}
            <div className="cal-fullcalendar-wrapper">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                initialDate={new Date()}
                locale={ptBrLocale}
                headerToolbar={false}
                events={eventosFiltrados}
                eventContent={renderizarEvento}
                eventClick={handleEventClick}
                dateClick={handleDateClick}
                datesSet={handleDatesSet}
                height="auto"
                firstDay={0}
                fixedWeekCount={false}
                showNonCurrentDates={false}
                dayMaxEventRows={4}
                moreLinkText="+mais"
                stickyHeaderDates={true}
                editable={false}
                selectable={true}
                timeZone="local"
              />
            </div>
          </>
        ) : (
          /* View Lista */
          <div className="cal-list-view">
            <div className="cal-list-header">
              <h3>
                <List size={20} />
                Lista de Obrigações
              </h3>
              <span className="cal-count">{estatisticas.total} eventos</span>
            </div>

            {eventosFiltrados.length === 0 ? (
              <div className="cal-empty-state">
                <CalendarDays size={48} />
                <p>Nenhuma obrigação encontrada</p>
                <button
                  onClick={() => {
                    setBusca("");
                    setFiltroCategoria("todas");
                  }}
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <div className="cal-list-table-wrapper">
                <table className="cal-list-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Obrigação</th>
                      <th>Categoria</th>
                      <th>Período</th>
                      <th>Base Legal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventosFiltrados
                      .sort((a, b) => a.start.localeCompare(b.start))
                      .map((ev) => {
                        const cor =
                          ev.extendedProps.cor ||
                          getCorTipo(null, ev.extendedProps.categoria);
                        const dataObj = new Date(ev.start + "T12:00:00");
                        return (
                          <tr key={ev.id} className="cal-list-row">
                            <td className="cal-list-data">
                              <div className="cal-data-badge">
                                <span className="cal-dia">
                                  {dataObj
                                    .getDate()
                                    .toString()
                                    .padStart(2, "0")}
                                </span>
                                <span className="cal-mes">
                                  {MESES[dataObj.getMonth()].substring(0, 3)}
                                </span>
                              </div>
                            </td>
                            <td className="cal-list-nome">
                              <span
                                style={{ color: cor.text, fontWeight: 600 }}
                              >
                                {cor.icon} {ev.title}
                              </span>
                            </td>
                            <td>
                              <span
                                className="cal-categoria-badge"
                                style={{
                                  backgroundColor: cor.bg,
                                  color: cor.text,
                                  borderColor: cor.border,
                                }}
                              >
                                {ev.extendedProps.categoria}
                              </span>
                            </td>
                            <td className="cal-list-periodo">
                              {ev.extendedProps.periodoApuracao || "-"}
                            </td>
                            <td className="cal-list-base">
                              {ev.extendedProps.baseLegal || "-"}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Evento Oficial (visualização) */}
      {eventoSelecionado && !modalDiaAberto && (
        <div className="cal-modal-overlay" onClick={handleFecharModal}>
          <div
            className="cal-modal-oficial"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cal-modal-header">
              <h3>{eventoSelecionado.titulo}</h3>
              <button onClick={handleFecharModal} className="cal-modal-close">
                <X size={20} />
              </button>
            </div>
            <div className="cal-modal-body">
              <div className="cal-modal-info">
                <div className="cal-info-item">
                  <CalendarDays size={16} />
                  <div>
                    <span className="cal-info-label">Data</span>
                    <span className="cal-info-value">
                      {eventoSelecionado.data &&
                      typeof eventoSelecionado.data === "string" &&
                      eventoSelecionado.data.includes("-")
                        ? (() => {
                            const [ano, mes, dia] =
                              eventoSelecionado.data.split("-");
                            return `${dia}/${mes}/${ano}`;
                          })()
                        : eventoSelecionado.data || "-"}
                    </span>
                  </div>
                </div>
                <div className="cal-info-item">
                  <Tag size={16} />
                  <div>
                    <span className="cal-info-label">Categoria</span>
                    <span className="cal-info-value">
                      {eventoSelecionado.categoria}
                    </span>
                  </div>
                </div>
                {eventoSelecionado.periodoApuracao && (
                  <div className="cal-info-item">
                    <Clock size={16} />
                    <div>
                      <span className="cal-info-label">Período</span>
                      <span className="cal-info-value">
                        {eventoSelecionado.periodoApuracao}
                      </span>
                    </div>
                  </div>
                )}
                {eventoSelecionado.baseLegal && (
                  <div className="cal-info-item">
                    <CalendarDays size={16} />
                    <div>
                      <span className="cal-info-label">Base Legal</span>
                      <span className="cal-info-value">
                        {eventoSelecionado.baseLegal}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Dia - mostra todos eventos + botão adicionar */}
      {modalDiaAberto && diaSelecionado && (
        <ModalDiaEventos
          data={diaSelecionado}
          eventosDoDia={eventosDoDiaSelecionado}
          onClose={handleFecharModal}
          onAdicionarEvento={handleAbrirModalNovoEvento}
          onRemoverEvento={handleRemoverEventoUsuario}
          tiposEvento={tiposEvento}
        />
      )}

      {/* Modal de Evento (criar/editar) */}
      {modalEventoAberto && (
        <ModalEvento
          evento={eventoEditando}
          dataClicada={dataClicada}
          onClose={handleFecharModal}
          onSave={async (dados) => {
            try {
              console.log("=== Salvando evento ===");
              console.log("Dados:", dados);
              console.log("Editando:", eventoEditando);

              if (eventoEditando) {
                console.log("Atualizando evento ID:", eventoEditando.id);
                const res = await eventosAPI.atualizar(
                  eventoEditando.id,
                  dados,
                );
                console.log("Resposta atualização:", res);
                if (res.success) {
                  toast.success("Evento atualizado com sucesso!");
                  await carregarEventosUsuario();
                } else {
                  throw new Error(res.message || "Falha ao atualizar evento");
                }
              } else {
                console.log("Criando novo evento...");
                const res = await eventosAPI.criar(dados);
                console.log("Resposta criação:", res);
                if (res.success) {
                  toast.success("Evento criado com sucesso!");
                  await carregarEventosUsuario();
                } else {
                  throw new Error(res.message || "Falha ao criar evento");
                }
              }
            } catch (error) {
              console.error("❌ Erro ao salvar evento:", error);
              console.error("Response:", error.response?.data);

              const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Erro desconhecido ao salvar evento";
              toast.error(errorMessage);
            }
          }}
        />
      )}
    </div>
  );
}
