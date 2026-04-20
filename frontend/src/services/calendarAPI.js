import api from './api';

/**
 * API do Calendário
 */
export const calendarAPI = {
  /**
   * Buscar obrigações fiscais de um ano
   */
  getObrigacoes: (year) => {
    return api.get(`/calendar/obrigacoes?year=${year}`);
  },

  /**
   * Buscar feriados de um ano/estado/município
   */
  getFeriados: (year, uf = null, ibge = null) => {
    const params = new URLSearchParams({ year: year.toString() });
    if (uf) params.append('uf', uf);
    if (ibge) params.append('ibge', ibge.toString());
    return api.get(`/calendar/feriados?${params}`);
  },

  /**
   * Buscar todos os eventos de um mês
   */
  getEventosDoMes: (month, year, options = {}) => {
    const params = new URLSearchParams({
      month: month.toString(),
      year: year.toString()
    });
    if (options.clientId) params.append('client_id', options.clientId);
    if (options.tipo) params.append('tipo', options.tipo);
    return api.get(`/calendar/eventos?${params}`);
  },

  /**
   * Criar novo evento
   */
  criarEvento: (data) => {
    return api.post('/calendar/eventos', data);
  },

  /**
   * Atualizar evento
   */
  atualizarEvento: (id, data) => {
    return api.put(`/calendar/eventos/${id}`, data);
  },

  /**
   * Deletar evento
   */
  deletarEvento: (id) => {
    return api.delete(`/calendar/eventos/${id}`);
  }
};

export default calendarAPI;
