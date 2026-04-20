import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const agendamentosAPI = {
  listar: async () => {
    const response = await api.get('/agendamentos');
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post('/agendamentos', dados);
    return response.data;
  },

  atualizar: async (id, dados) => {
    const response = await api.put(`/agendamentos/${id}`, dados);
    return response.data;
  },

  excluir: async (id) => {
    const response = await api.delete(`/agendamentos/${id}`);
    return response.data;
  },

  executar: async (id) => {
    const response = await api.post(`/agendamentos/${id}/executar`);
    return response.data;
  }
};

export default agendamentosAPI;
