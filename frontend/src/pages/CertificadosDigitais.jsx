import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Key,
  Download,
  Edit,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronDown,
  ChevronRight,
  Calendar,
  Lock,
  FileText,
  ArrowLeft,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { clientesAPI } from '../services/api';
import { Button, Badge, Input } from '@/components/ui';

export default function CertificadosDigitais() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteCheckbox, setDeleteCheckbox] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await clientesAPI.getAll();
      const clientesComCertificados = response.data
        .filter(c => c.certificado_digital?.possui)
        .map(c => ({
          ...c,
          certificado: {
            ...c.certificado_digital,
            id: c._id,
            cliente: c.razao_social,
            cnpj: c.cnpj,
          }
        }));
      setClientes(clientesComCertificados);
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Erro ao buscar certificados:', err);
        toast.error('Erro ao carregar certificados');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (certificado) => {
    // Simula download do certificado
    const blob = new Blob([JSON.stringify(certificado, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificado_${certificado.cliente.replace(/\s/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Download do certificado de ${certificado.cliente} iniciado`);
  };

  const handleEdit = (certificado) => {
    setEditingId(certificado.id);
    setEditForm({
      data_emissao: certificado.data_emissao || '',
      data_vencimento: certificado.data_vencimento || '',
      senha: certificado.senha || '',
    });
    setOpenMenuId(null);
    toast.info('✏️ Campos disponíveis para edição. Altere os dados e clique em "Salvar" para confirmar.', {
      autoClose: 4000,
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const cliente = clientes.find(c => c._id === id);
      await clientesAPI.update(id, {
        ...cliente,
        certificado_digital: {
          ...cliente.certificado_digital,
          data_emissao: editForm.data_emissao,
          data_vencimento: editForm.data_vencimento,
          senha: editForm.senha,
        }
      });
      setEditingId(null);
      setEditForm({});
      fetchClientes();
      toast.success('Certificado atualizado com sucesso!');
    } catch (err) {
      toast.error('Erro ao atualizar certificado');
      console.error(err);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = (certificado) => {
    setDeleteConfirm(certificado);
    setDeleteCheckbox(false);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCheckbox) {
      toast.warning('Você deve marcar a checkbox para confirmar a exclusão');
      return;
    }
    try {
      const cliente = clientes.find(c => c._id === deleteConfirm.id);
      await clientesAPI.update(deleteConfirm.id, {
        ...cliente,
        certificado_digital: { possui: false },
      });
      setDeleteConfirm(null);
      setDeleteCheckbox(false);
      fetchClientes();
      toast.success('Certificado excluído com sucesso');
    } catch (err) {
      toast.error('Erro ao excluir certificado');
      console.error(err);
    }
  };

  const handleReplace = (certificado) => {
    toast.info(`🔄 Substituir certificado de ${certificado.cliente} - Em desenvolvimento`);
    setOpenMenuId(null);
  };

  const handleOpenMenu = (id, event) => {
    event.stopPropagation();
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY + 8,
      right: window.innerWidth - rect.right,
    });
    setOpenMenuId(id);
  };

  const getStatusBadge = (vencimento) => {
    if (!vencimento) return { variant: 'default', text: 'Sem data' };
    const hoje = new Date();
    const venc = new Date(vencimento);
    const diffDias = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
    
    if (diffDias < 0) return { variant: 'error', text: `Vencido há ${Math.abs(diffDias)} dias` };
    if (diffDias <= 30) return { variant: 'warning', text: `Vence em ${diffDias} dias` };
    return { variant: 'success', text: `Vence em ${diffDias} dias` };
  };

  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const filteredClientes = clientes.filter(c =>
    c.certificado.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.certificado.cnpj?.includes(searchTerm)
  );

  const isEditing = (id) => editingId === id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500 font-medium">Carregando certificados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="p-2.5 bg-blue-100 rounded-lg">
            <Key size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Certificados Digitais</h1>
            <p className="text-sm text-gray-500">Gerencie os certificados digitais dos clientes</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Buscar por cliente ou CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      {filteredClientes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
          <Key size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum certificado encontrado</h3>
          <p className="text-gray-500">Não há certificados cadastrados ou nenhum corresponde à busca.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-gray-700">Cliente</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-700">Certificado</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-700">Emissão</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-700">Vencimento</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-700">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-gray-700 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClientes.map((cliente) => {
                  const cert = cliente.certificado;
                  const status = getStatusBadge(cert.data_vencimento);
                  const editing = isEditing(cliente._id);

                  return (
                    <tr key={cliente._id} className={`bg-white hover:bg-gray-50 transition-colors ${editing ? 'bg-blue-50' : ''}`}>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{cert.cliente}</p>
                          <p className="text-xs text-gray-500 font-mono">{cert.cnpj}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleDownload(cert)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                        >
                          <FileText size={16} />
                          <span>Baixar certificado</span>
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        {editing ? (
                          <input
                            type="date"
                            value={editForm.data_emissao}
                            onChange={(e) => setEditForm({ ...editForm, data_emissao: e.target.value })}
                            className="px-3 py-1.5 border-2 border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={14} />
                            <span>{formatDate(cert.data_emissao)}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {editing ? (
                          <input
                            type="date"
                            value={editForm.data_vencimento}
                            onChange={(e) => setEditForm({ ...editForm, data_vencimento: e.target.value })}
                            className="px-3 py-1.5 border-2 border-blue-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={14} />
                            <span>{formatDate(cert.data_vencimento)}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={status.variant}>{status.text}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="relative flex justify-center">
                          {editing ? (
                            <div className="flex gap-2">
                              <Button size="sm" variant="success" onClick={() => handleSaveEdit(cliente._id)}>
                                <CheckCircle size={14} className="mr-1" />
                                Salvar
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                <X size={14} className="mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={(e) => handleOpenMenu(cliente._id, e)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical size={18} className="text-gray-600" />
                              </button>
                              {openMenuId === cliente._id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                  <div
                                    className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[220px]"
                                    style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
                                  >
                                    <button
                                      onClick={() => handleEdit(cert)}
                                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <Edit size={16} className="mr-2 text-blue-600" />
                                      Editar dados
                                    </button>
                                    <button
                                      onClick={() => handleReplace(cert)}
                                      className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                      <RefreshCw size={16} className="mr-2 text-yellow-600" />
                                      Substituir certificado
                                    </button>
                                    <hr className="my-2 border-gray-200" />
                                    <button
                                      onClick={() => handleDelete(cert)}
                                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                      <Trash2 size={16} className="mr-2" />
                                      Excluir certificado
                                    </button>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Excluir Certificado</h3>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                Você está prestes a excluir o certificado digital de:
              </p>
              <p className="font-semibold text-red-900 mt-1">{deleteConfirm.cliente}</p>
              <p className="text-xs text-red-600 font-mono mt-1">{deleteConfirm.cnpj}</p>
            </div>

            <div className="mb-4">
              <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={deleteCheckbox}
                  onChange={(e) => setDeleteCheckbox(e.target.checked)}
                  className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  Confirmo que desejo excluir permanentemente o certificado digital de <strong>{deleteConfirm.cliente}</strong>. 
                  Entendo que esta ação não pode ser desfeita.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setDeleteConfirm(null); setDeleteCheckbox(false); }}>
                Cancelar
              </Button>
              <Button
                variant="error"
                className="flex-1"
                disabled={!deleteCheckbox}
                onClick={handleConfirmDelete}
              >
                <Trash2 size={16} className="mr-2" />
                Excluir Certificado
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
