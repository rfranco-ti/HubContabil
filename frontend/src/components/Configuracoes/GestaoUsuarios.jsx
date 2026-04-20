import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2, 
  Search,
  X,
  CheckCircle,
  AlertCircle,
  Shield
} from 'lucide-react';
import { usuariosAPI } from '../../services/usuariosAPI';
import { toast } from 'sonner';
import ModalUsuario from './ModalUsuario';

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  // Carregar usuários
  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      setCarregando(true);
      const response = await usuariosAPI.listar();
      if (response.success && response.data) {
        setUsuarios(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      const errorMsg = error.response?.data?.message || 'Erro ao carregar usuários';
      toast.error(errorMsg);
    } finally {
      setCarregando(false);
    }
  }

  // Abrir modal de criação
  const handleAbrirModalCriacao = () => {
    setUsuarioEditando(null);
    setModalAberto(true);
  };

  // Abrir modal de edição
  const handleAbrirModalEdicao = (usuario) => {
    setUsuarioEditando(usuario);
    setModalAberto(true);
  };

  // Fechar modal
  const handleFecharModal = () => {
    setModalAberto(false);
    setUsuarioEditando(null);
  };

  // Salvar usuário (criar ou editar)
  const handleSalvarUsuario = async (dados) => {
    try {
      if (usuarioEditando) {
        // Editando
        const response = await usuariosAPI.atualizar(usuarioEditando.id, dados);
        if (response.success) {
          toast.success(response.message || 'Usuário atualizado com sucesso!');
          await carregarUsuarios();
        }
      } else {
        // Criando
        const response = await usuariosAPI.criar(dados);
        if (response.success) {
          toast.success(response.message || 'Usuário criado com sucesso!');
          await carregarUsuarios();
        }
      }
      handleFecharModal();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      const errorMsg = error.response?.data?.message || 'Erro ao salvar usuário';
      toast.error(errorMsg);
      throw error; // Re-throw para o modal saber que falhou
    }
  };

  // Excluir usuário
  const handleExcluirUsuario = async (usuario) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${usuario.nome}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const response = await usuariosAPI.excluir(usuario.id);
      if (response.success) {
        toast.success(response.message || 'Usuário excluído com sucesso!');
        await carregarUsuarios();
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      const errorMsg = error.response?.data?.message || 'Erro ao excluir usuário';
      toast.error(errorMsg);
    }
  };

  // Filtrar usuários pela busca
  const usuariosFiltrados = usuarios.filter(user => {
    const termo = busca.toLowerCase();
    return (
      user.nome.toLowerCase().includes(termo) ||
      user.email.toLowerCase().includes(termo) ||
      user.cargo.toLowerCase().includes(termo)
    );
  });

  // Loading
  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-3 text-slate-600">Carregando usuários...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl mr-4">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Gestão de Usuários</h2>
            <p className="text-sm text-slate-500">Gerencie os usuários do sistema.</p>
          </div>
        </div>

        <button
          onClick={handleAbrirModalCriacao}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-blue-500/20"
        >
          <Plus size={18} className="mr-2" />
          Novo Usuário
        </button>
      </div>

      {/* Busca */}
      <div className="mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou cargo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Usuários */}
      {usuariosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <Users size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            {busca ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
          </h3>
          <p className="text-slate-500">
            {busca ? 'Tente buscar com outros termos.' : 'Clique em "Novo Usuário" para começar.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                          {usuario.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{usuario.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{usuario.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        usuario.cargo === 'Administrador' 
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {usuario.cargo === 'Administrador' && <Shield size={12} className="mr-1" />}
                        {usuario.cargo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAbrirModalEdicao(usuario)}
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar usuário"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleExcluirUsuario(usuario)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir usuário"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-slate-200">
            {usuariosFiltrados.map((usuario) => (
              <div key={usuario.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3 flex-shrink-0">
                      {usuario.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{usuario.nome}</h3>
                      <p className="text-sm text-slate-500 truncate">{usuario.email}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                    usuario.cargo === 'Administrador' 
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {usuario.cargo}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-xs text-slate-500">
                    Criado em {new Date(usuario.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAbrirModalEdicao(usuario)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleExcluirUsuario(usuario)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contador */}
      {usuariosFiltrados.length > 0 && (
        <div className="mt-4 text-sm text-slate-500 text-center">
          Mostrando {usuariosFiltrados.length} de {usuarios.length} usuário(s)
        </div>
      )}

      {/* Modal de Criação/Edição */}
      {modalAberto && (
        <ModalUsuario
          usuario={usuarioEditando}
          onClose={handleFecharModal}
          onSave={handleSalvarUsuario}
        />
      )}
    </div>
  );
}
