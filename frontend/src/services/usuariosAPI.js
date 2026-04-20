import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Configuração do axios para usuários
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para adicionar token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor de resposta para debug
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('usuariosAPI Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const usuariosAPI = {
  /**
   * Listar todos os usuários
   */
  listar: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  /**
   * Obter detalhes de um usuário
   */
  obter: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  /**
   * Criar novo usuário
   */
  criar: async (dados) => {
    const response = await api.post('/usuarios', dados);
    return response.data;
  },

  /**
   * Atualizar usuário existente
   */
  atualizar: async (id, dados) => {
    const response = await api.put(`/usuarios/${id}`, dados);
    return response.data;
  },

  /**
   * Excluir usuário
   */
  excluir: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  }
};

export default usuariosAPI;
