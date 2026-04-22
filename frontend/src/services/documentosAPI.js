import api from './api';

// Adaptador para manter compatibilidade com o código antigo do Gerador
export const clientesAPI = {
  listar: async () => {
    const response = await api.get('/clientes');
    return response.data;
  }
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
  // Obter próximo número sequencial
  obterProximoNumero: async (tipo) => {
    const response = await api.get(`/documentos-gerados/proximo-numero/${tipo}`);
    return response.data;
  },
};

export default { clientesAPI, documentosGeradosAPI };
