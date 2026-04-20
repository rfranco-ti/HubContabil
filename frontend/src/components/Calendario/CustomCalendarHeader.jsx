/**
 * Header personalizado para o FullCalendar
 * Navegação acessível: < MÊS ANO >
 */

export default function CustomCalendarHeader({ title, onPrev, onNext, onToday }) {
  return (
    <div className="fc-header-toolbar-custom">
      <div className="fc-header-nav">
        <button
          type="button"
          onClick={onPrev}
          className="fc-nav-button fc-nav-prev"
          aria-label="Mês anterior"
          title="Mês anterior"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4L7 10L13 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          type="button"
          onClick={onToday}
          className="fc-today-button"
          aria-label="Ir para mês atual"
          title="Hoje"
        >
          Hoje
        </button>

        <button
          type="button"
          onClick={onNext}
          className="fc-nav-button fc-nav-next"
          aria-label="Próximo mês"
          title="Próximo mês"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 4L13 10L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="fc-header-title">
        <h2 className="fc-title">{title}</h2>
      </div>

      <div className="fc-header-spacer"></div>
    </div>
  );
}
