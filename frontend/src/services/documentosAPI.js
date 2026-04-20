import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Configuração do axios com token de autenticação
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
 * API para Clientes
 */
export const clientesAPI = {
  // Listar todos os clientes
  listar: async () => {
    const response = await api.get('/clientes');
    return response.data;
  },

  // Buscar cliente por ID
  buscar: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  // Buscar cliente por CNPJ
  buscarPorCNPJ: async (cnpj) => {
    const response = await api.get(`/clientes/cnpj/${cnpj}`);
    return response.data;
  },
};

/**
 * API para Documentos Gerados
 */
export const documentosGeradosAPI = {
  // Listar documentos gerados
  listar: async (filtros = {}) => {
    const response = await api.get('/documentos-gerados', { params: filtros });
    return response.data;
  },

  // Buscar documento por ID
  buscar: async (id) => {
    const response = await api.get(`/documentos-gerados/${id}`);
    return response.data;
  },

  // Salvar documento gerado
  salvar: async (dados) => {
    const response = await api.post('/documentos-gerados', dados);
    return response.data;
  },

  // Download de documento
  download: async (id) => {
    const response = await api.get(`/documentos-gerados/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Deletar documento
  deletar: async (id) => {
    const response = await api.delete(`/documentos-gerados/${id}`);
    return response.data;
  },

  // Atualizar status
  atualizarStatus: async (id, status) => {
    const response = await api.put(`/documentos-gerados/${id}/status`, { status });
    return response.data;
  },

  // Estatísticas
  estatisticas: async () => {
    const response = await api.get('/documentos-gerados/estatisticas');
    return response.data;
  },
};

export default { clientesAPI, documentosGeradosAPI };
