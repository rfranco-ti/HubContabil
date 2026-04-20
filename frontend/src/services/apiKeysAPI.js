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

export const apiKeysAPI = {
  listar: async () => {
    const response = await api.get('/api-keys');
    return response.data;
  },

  criar: async (dados) => {
    const response = await api.post('/api-keys', dados);
    return response.data;
  },

  revogar: async (id) => {
    const response = await api.delete(`/api-keys/${id}`);
    return response.data;
  },

  toggle: async (id) => {
    const response = await api.put(`/api-keys/${id}/toggle`);
    return response.data;
  }
};

export default apiKeysAPI;
