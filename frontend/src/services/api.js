import axios from "axios";
import { getToken, clearAuth } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token JWT
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Flag para evitar múltiplas tentativas de refresh simultâneas
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Função para renovar o token de acesso
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("Sem refresh token");

  const response = await axios.post(`${API_URL}/auth/refresh`, {
    refreshToken,
  });
  const { accessToken, refreshToken: newRefreshToken } = response.data;

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", newRefreshToken);

  return accessToken;
};

// Interceptor para lidar com token expirado/inválido
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

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Auth
export const authAPI = {
  login: (email, senha) => api.post("/auth/login", { email, senha }),
  register: (data) => api.post("/auth/register", data),
  refresh: (refreshToken) =>
    axios.post(`${API_URL}/auth/refresh`, { refreshToken }),
  logout: () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      axios.post(`${API_URL}/auth/logout`, { refreshToken }).catch(() => {});
    }
    clearAuth();
  },
};

// Clientes
export const clientesAPI = {
  getAll: () => api.get("/clientes"),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post("/clientes", data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
  consultarCnpj: (cnpj) => api.get(`/clientes/consulta/${cnpj}`),
  pesquisar: (query) => api.get(`/clientes/pesquisa?query=${query}`),
};

// RPA
export const rpaAPI = {
  simplesNacional: (cnpj) => api.post("/rpa/simples-nacional", { cnpj }),
  sefazBahia: (cnpj) => api.post("/rpa/sefaz-ba", { cnpj }),
};

// GED
export const gedAPI = {
  upload: (formData) =>
    api.post("/ged/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  ocr: (filename) => api.post("/ged/ocr", { filename }),
};

// Notas (Sticky Notes)
export const notasAPI = {
  listar: () => api.get("/notas"),
  criar: (data) => api.post("/notas", data),
  atualizar: (id, data) => api.put(`/notas/${id}`, data),
  excluir: (id) => api.delete(`/notas/${id}`),
  reordenar: (notas) => api.patch("/notas/reordenar", { notas }),
  listarPastas: () => api.get("/notas/pastas"),
  criarPasta: (data) => api.post("/notas/pastas", data),
  atualizarPasta: (id, data) => api.put(`/notas/pastas/${id}`, data),
  excluirPasta: (id) => api.delete(`/notas/pastas/${id}`),
};

// Documentos (vinculados a clientes)
export const documentosAPI = {
  upload: (formData, onProgress, abortSignal) =>
    api.post("/documentos/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      signal: abortSignal,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percentCompleted);
        }
      },
    }),
  uploadMultiplo: (formData) =>
    api.post("/documentos/upload-multiplo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAll: (params) => api.get("/documentos", { params }),
  getByCliente: (clienteId) => api.get(`/documentos/cliente/${clienteId}`),
  getById: (id) => api.get(`/documentos/${id}`),
  update: (id, data) => api.put(`/documentos/${id}`, data),
  delete: (id) => api.delete(`/documentos/${id}`),
  ocr: (id) => api.post(`/documentos/${id}/ocr`),
  download: (id) =>
    api.get(`/documentos/${id}/download`, { responseType: "blob" }),
  pastas: {
    criar: (data) => api.post("/documentos/pastas", data),
    listar: (clienteId, params) =>
      api.get(`/documentos/pastas/${clienteId}`, { params }),
    getById: (id) => api.get(`/documentos/pastas/detalhe/${id}`),
    update: (id, data) => api.put(`/documentos/pastas/${id}`, data),
    delete: (id) => api.delete(`/documentos/pastas/${id}`),
  },
};

export default api;
