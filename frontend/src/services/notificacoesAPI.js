import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Configuração do axios com interceptor JWT
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const notificacoesAPI = {
  // Contar não lidas (para badge)
  contarNaoLidas: async () => {
    const response = await api.get('/notificacoes/count');
    return response.data;
  },

  // Listar não lidas (para dropdown)
  listarNaoLidas: async () => {
    const response = await api.get('/notificacoes');
    return response.data;
  },

  // Listar todas com paginação
  listarTodas: async (page = 1, limit = 20) => {
    const response = await api.get('/notificacoes/todas', {
      params: { page, limit }
    });
    return response.data;
  },

  // Marcar como lida
  marcarComoLida: async (id) => {
    const response = await api.put(`/notificacoes/${id}/lida`);
    return response.data;
  },

  // Marcar todas como lidas
  marcarTodasComoLidas: async () => {
    const response = await api.put('/notificacoes/lidar-todas');
    return response.data;
  },

  // Deletar notificação
  deletar: async (id) => {
    const response = await api.delete(`/notificacoes/${id}`);
    return response.data;
  },

  // Resumo estatístico
  resumo: async () => {
    const response = await api.get('/notificacoes/resumo');
    return response.data;
  }
};
