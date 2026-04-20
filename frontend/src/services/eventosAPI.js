import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Configuração do axios com token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * API para Eventos do Calendário
 */
export const eventosAPI = {
  // Listar eventos
  listar: async (dataInicio, dataFim) => {
    const response = await api.get('/eventos', {
      params: { dataInicio, dataFim }
    });
    return response.data;
  },

  // Criar evento
  criar: async (dados) => {
    const response = await api.post('/eventos', dados);
    return response.data;
  },

  // Atualizar evento
  atualizar: async (id, dados) => {
    const response = await api.put(`/eventos/${id}`, dados);
    return response.data;
  },

  // Excluir evento
  excluir: async (id) => {
    const response = await api.delete(`/eventos/${id}`);
    return response.data;
  }
};

export default { eventosAPI };
