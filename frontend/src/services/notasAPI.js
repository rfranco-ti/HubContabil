import api from './api';

export const notasAPI = {
  // Listar todas as notas
  async listar() {
    const response = await api.get('/notas');
    return response.data;
  },

  // Criar nova nota
  async criar(dados) {
    const response = await api.post('/notas', dados);
    return response.data;
  },

  // Atualizar nota
  async atualizar(id, dados) {
    const response = await api.put(`/notas/${id}`, dados);
    return response.data;
  },

  // Excluir nota
  async excluir(id) {
    const response = await api.delete(`/notas/${id}`);
    return response.data;
  },

  // Reordenar notas
  async reordenar(notas) {
    const response = await api.patch('/notas/reordenar', { notas });
    return response.data;
  },
};
