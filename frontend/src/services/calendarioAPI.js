import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const tiposEventoAPI = {
  listar: async () => {
    const response = await axios.get(`${API_URL}/tipos-evento`);
    return response.data;
  }
};

// Configuração do axios para eventos
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Adicionar interceptor de resposta para melhor debug
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const eventosAPI = {
  listar: async () => {
    const response = await api.get('/calendario/eventos');
    return response.data;
  },
  criar: async (dados) => {
    const response = await api.post('/calendario/eventos', dados);
    return response.data;
  },
  atualizar: async (id, dados) => {
    const response = await api.put(`/calendario/eventos/${id}`, dados);
    return response.data;
  },
  excluir: async (id) => {
    const response = await api.delete(`/calendario/eventos/${id}`);
    return response.data;
  }
};
