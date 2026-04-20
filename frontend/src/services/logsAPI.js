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

export const logsAPI = {
  listar: async (params = {}) => {
    const response = await api.get('/logs', { params });
    return response.data;
  },

  estatisticas: async () => {
    const response = await api.get('/logs/stats');
    return response.data;
  },

  download: async (format = 'txt', level = null) => {
    const params = { format };
    if (level) params.level = level;

    const response = await api.get('/logs/download', {
      params,
      responseType: 'blob'
    });

    const blob = new Blob([response.data], {
      type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;'
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const extension = format === 'csv' ? 'csv' : 'txt';
    link.setAttribute('download', `logs_${new Date().toISOString().split('T')[0]}.${extension}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  limpar: async (days = 7) => {
    const response = await api.delete('/logs', { params: { days } });
    return response.data;
  }
};

export default logsAPI;
