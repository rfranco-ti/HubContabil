/* Cores por tipo de feriado */
export const CORES_FERIADOS = {
  nacional: {
    bg: '#FEE2E2',
    border: '#EF4444',
    text: '#DC2626'
  },
  estadual: {
    bg: '#FFEDD5',
    border: '#F97316',
    text: '#EA580C'
  },
  municipal: {
    bg: '#DBEAFE',
    border: '#3B82F6',
    text: '#1D4ED8'
  },
  evento: {
    bg: '#D1FAE5',
    border: '#10B981',
    text: '#059669'
  }
};

export function getCorFeriado(tipo) {
  return CORES_FERIADOS[tipo]?.border || '#6B7280';
}

export function getCorFeriadoBg(tipo) {
  return CORES_FERIADOS[tipo]?.bg || '#F3F4F6';
}

export function getCorFeriadoText(tipo) {
  return CORES_FERIADOS[tipo]?.text || '#374151';
}
