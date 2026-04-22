import axios from 'axios';
import { getPersistentRefresh } from '../utils/security';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

export const setupInterceptors = (onLogout) => {
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getPersistentRefresh();

        if (!refreshToken) {
          onLogout();
          return Promise.reject(error);
        }

        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = response.data;

          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          onLogout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

// Auth API
export const authAPI = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
  register: (data) => api.post('/auth/register', data),
  refresh: (refreshToken) => axios.post(`${API_URL}/auth/refresh`, { refreshToken }),
  logout: () => {
    const refreshToken = getPersistentRefresh();
    if (refreshToken) {
      axios.post(`${API_URL}/auth/logout`, { refreshToken }).catch(() => {});
    }
  },
};

// Clientes API
export const clientesAPI = {
  getAll: () => api.get('/clientes'),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
  consultarCnpj: (cnpj) => api.get(`/clientes/consulta/${cnpj}`),
  pesquisar: (query) => api.get(`/clientes/pesquisa`, { params: { query } }),
};

// RPA API
export const rpaAPI = {
  simplesNacional: (cnpj) => api.post('/rpa/simples-nacional', { cnpj }),
  sefazBahia: (cnpj) => api.post('/rpa/sefaz-ba', { cnpj }),
};

// GED API
export const gedAPI = {
  upload: (formData) =>
    api.post('/ged/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  ocr: (filename) => api.post('/ged/ocr', { filename }),
};

// Notas API
export const notasAPI = {
  listar: () => api.get('/notas'),
  criar: (data) => api.post('/notas', data),
  atualizar: (id, data) => api.put(`/notas/${id}`, data),
  excluir: (id) => api.delete(`/notas/${id}`),
  reordenar: (notas) => api.patch('/notas/reordenar', { notas }),
};

// Documentos API
export const documentosAPI = {
  upload: (formData, onProgress, signal) =>
    api.post('/documentos/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      signal,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    }),
  getAll: (params) => api.get('/documentos', { params }),
  getById: (id) => api.get(`/documentos/${id}`),
  delete: (id) => api.delete(`/documentos/${id}`),
};

export default api;
