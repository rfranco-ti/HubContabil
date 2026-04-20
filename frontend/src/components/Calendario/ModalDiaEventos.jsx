import { X, Plus, Trash2, CalendarDays, Tag, CalendarPlus } from "lucide-react";
import "../../styles/components/ModalDiaEventos.css";

/**
 * Mapeamento fallback de categorias legadas para ícones
 * (usado apenas para eventos oficiais do calendário contabil)
 */
const ICONES_LEGACY = {
  Feriados: "🎌",
  "Tributário Federal": "🏛️",
  "Trabalhista e Previdenciário": "👷",
  "RH - Recursos Humanos": "🎉",
};

/**
 * Obter ícone: primeiro tenta do tipoEvento (extendedProps), depois fallback
 */
function getIcon(categoria, tipoEvento = null) {
  if (tipoEvento?.icone) return tipoEvento.icone;
  return ICONES_LEGACY[categoria] || "📅";
}

export default function ModalDiaEventos({
  data,
  eventosDoDia,
  onClose,
  onAdicionarEvento,
  onRemoverEvento,
  tiposEvento = [],
}) {
  const dataObj = new Date(data + "T12:00:00Z");
  const diaSemana = dataObj.toLocaleDateString("pt-BR", { weekday: "long" });
  const dataFormatada = dataObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const oficiais = eventosDoDia.filter(
    (e) => e.extendedProps?.tipo === "oficial",
  );
  const usuario = eventosDoDia.filter(
    (e) => e.extendedProps?.tipo === "usuario",
  );

  // Mapa slug -> tipo para lookup
  const mapaTipos = {};
  tiposEvento.forEach((t) => {
    mapaTipos[t.nome] = t;
  });

  return (
    <div className="modal-dia-overlay" onClick={onClose}>
      <div className="modal-dia-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-dia-header">
          <div className="modal-dia-titulo">
            <CalendarDays size={20} />
            <div>
              <h3
                className="modal-dia-data"
                style={{ textTransform: "capitalize" }}
              >
                {diaSemana}
              </h3>
              <span className="modal-dia-data-completa">{dataFormatada}</span>
            </div>
          </div>
          <button onClick={onClose} className="modal-dia-fechar">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-dia-body">
          {eventosDoDia.length > 0 && (
            <div className="modal-dia-lista">
              {eventosDoDia.map((ev, i) => {
                const cat =
                  ev.extendedProps?.categoria || ev.extendedProps?.tipo || "";
                const isUsuario = ev.extendedProps?.tipo === "usuario";
                const slugTipo = ev.extendedProps?.tipoEventoSlug;
                const tipoDoBanco = slugTipo ? mapaTipos[slugTipo] : null;
                const icone = getIcon(cat, tipoDoBanco);

                return (
                  <div
                    key={i}
                    className="modal-dia-evento-item"
                    onClick={() => !isUsuario && ev._openDetails?.()}
                  >
                    <span className="modal-dia-evento-icon">{icone}</span>
                    <span className="modal-dia-evento-nome">{ev.title}</span>
                    <span className="modal-dia-evento-cat">{cat}</span>
                    {isUsuario && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoverEvento(ev);
                        }}
                        className="modal-dia-evento-remover"
                        title="Remover"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Botão Adicionar */}
          <button className="modal-dia-btn-add" onClick={onAdicionarEvento}>
            <Plus size={16} />
            Adicionar evento
          </button>
        </div>
      </div>
    </div>
  );
}
