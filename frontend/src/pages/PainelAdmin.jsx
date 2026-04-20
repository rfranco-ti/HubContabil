import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Tag,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  Shield,
  Palette,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function PainelAdmin() {
  const [abaAtiva, setAbaAtiva] = useState('tipos');
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('user') || '{}');

  // Verificar se usuário é admin
  useEffect(() => {
    const cargo = usuario.cargo || '';
    const isAdmin = cargo.toLowerCase() === 'admin' || cargo.toLowerCase() === 'administrador';

    if (!isAdmin) {
      toast.error('Acesso negado. Apenas administradores podem acessar esta área.');
      navigate('/dashboard');
    }
  }, [navigate, usuario.cargo]);

  if (!usuario?.cargo) return null;

  return (
    <div className="painel-admin">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel do Administrador</h1>
            <p className="text-sm text-gray-500">Gerencie tipos de evento e feriados do calendário</p>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setAbaAtiva('tipos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            abaAtiva === 'tipos'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Tag size={16} />
          Tipos de Evento
        </button>
        <button
          onClick={() => setAbaAtiva('feriados')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            abaAtiva === 'feriados'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar size={16} />
          Feriados
        </button>
      </div>

      {/* Conteúdo */}
      {abaAtiva === 'tipos' && <GerenciarTipos />}
      {abaAtiva === 'feriados' && <GerenciarFeriados />}
    </div>
  );
}

// ===================== GERENCIAR TIPOS DE EVENTO =====================

function GerenciarTipos() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    label: '',
    cor: '#3b82f6',
    icone: '📅',
    descricao: '',
    ordem: 0
  });

  useEffect(() => {
    carregarTipos();
  }, []);

  const carregarTipos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/tipos-evento/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTipos(res.data.tipos || []);
    } catch (error) {
      toast.error('Erro ao carregar tipos de evento');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (tipo = null) => {
    if (tipo) {
      setEditando(tipo);
      setFormData({
        nome: tipo.nome || '',
        label: tipo.label || '',
        cor: tipo.cor || '#3b82f6',
        icone: tipo.icone || '📅',
        descricao: tipo.descricao || '',
        ordem: tipo.ordem || 0
      });
    } else {
      setEditando(null);
      setFormData({ nome: '', label: '', cor: '#3b82f6', icone: '📅', descricao: '', ordem: 0 });
    }
    setModalAberto(true);
  };

  const salvarTipo = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editando
        ? `${API_URL}/tipos-evento/admin/${editando.id}`
        : `${API_URL}/tipos-evento/admin`;
      const method = editando ? 'put' : 'post';

      const res = await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(res.data.message || 'Tipo salvo com sucesso!');
      setModalAberto(false);
      carregarTipos();
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao salvar tipo';
      toast.error(msg);
    }
  };

  const desativarTipo = async (id) => {
    if (!confirm('Deseja desativar este tipo de evento?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tipos-evento/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Tipo desativado com sucesso');
      carregarTipos();
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao desativar tipo';
      toast.error(msg);
    }
  };

  const reativarTipo = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/tipos-evento/admin/${id}/reativar`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Tipo reativado com sucesso');
      carregarTipos();
    } catch (error) {
      toast.error('Erro ao reativar tipo');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      {/* Header da seção */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Tipos de Evento</h2>
          <p className="text-sm text-gray-500">{tipos.length} tipos cadastrados</p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Novo Tipo
        </button>
      </div>

      {/* Grid de tipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tipos.map((tipo) => (
          <div
            key={tipo.id}
            className={`border rounded-xl p-4 transition-all ${
              tipo.ativo
                ? 'border-gray-200 bg-white hover:shadow-md'
                : 'border-gray-200 bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: tipo.cor + '20' }}
                >
                  {tipo.icone || '📅'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{tipo.label}</h3>
                  <p className="text-xs text-gray-500 font-mono">{tipo.nome}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {tipo.ativo && (
                  <button
                    onClick={() => abrirModal(tipo)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {tipo.descricao && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tipo.descricao}</p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                {/* Cor */}
                <div className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: tipo.cor }}
                  />
                  <span className="text-xs text-gray-500">{tipo.cor}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Badge ehPadrao */}
                {tipo.ehPadrao && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                    Sistema
                  </span>
                )}

                {/* Status */}
                {tipo.ativo ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                    Ativo
                  </span>
                ) : (
                  <button
                    onClick={() => reativarTipo(tipo.id)}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-600 font-medium hover:bg-green-100 hover:text-green-700 transition-colors"
                  >
                    Reativar
                  </button>
                )}
              </div>
            </div>

            {/* Contagem de vínculos */}
            {tipo._count && (tipo._count.eventos > 0 || tipo._count.obrigacoes > 0) && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex gap-3 text-xs text-gray-500">
                {tipo._count.eventos > 0 && (
                  <span>{tipo._count.eventos} evento{tipo._count.eventos > 1 ? 's' : ''}</span>
                )}
                {tipo._count.obrigacoes > 0 && (
                  <span>{tipo._count.obrigacoes} obrigaç{tipo._count.obrigacoes > 1 ? 'ões' : 'ão'}</span>
                )}
              </div>
            )}

            {/* Botão desativar (apenas não padrão) */}
            {tipo.ativo && !tipo.ehPadrao && (
              <button
                onClick={() => desativarTipo(tipo.id)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={12} />
                Desativar
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modal Form */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalAberto(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette size={20} className="text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {editando ? 'Editar Tipo de Evento' : 'Novo Tipo de Evento'}
                </h3>
              </div>
              <button onClick={() => setModalAberto(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={salvarTipo} className="p-6 space-y-4">
              {/* Nome (slug) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (identificador)</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={e => setFormData(p => ({ ...p, nome: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="ex: trabalhista, datas_comemorativas"
                  required
                  disabled={!!editando}
                />
                <p className="text-xs text-gray-500 mt-1">Apenas letras minúsculas, números e underscore</p>
              </div>

              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome exibido</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={e => setFormData(p => ({ ...p, label: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="ex: Trabalhista"
                  required
                />
              </div>

              {/* Cor e Ícone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.cor}
                      onChange={e => setFormData(p => ({ ...p, cor: e.target.value }))}
                      className="w-10 h-10 border-0 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.cor}
                      onChange={e => setFormData(p => ({ ...p, cor: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ícone (emoji)</label>
                  <input
                    type="text"
                    value={formData.icone}
                    onChange={e => setFormData(p => ({ ...p, icone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-2xl text-center focus:ring-2 focus:ring-purple-500"
                    placeholder="📅"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={e => setFormData(p => ({ ...p, descricao: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  rows={2}
                  placeholder="Descreva o propósito deste tipo..."
                />
              </div>

              {/* Ordem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordem de exibição</label>
                <input
                  type="number"
                  value={formData.ordem}
                  onChange={e => setFormData(p => ({ ...p, ordem: parseInt(e.target.value) || 0 }))}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min={0}
                />
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Pré-visualização:</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: formData.cor + '20' }}
                  >
                    {formData.icone || '📅'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formData.label || 'Nome do Tipo'}</p>
                    <p className="text-xs text-gray-500 font-mono">{formData.nome || 'slug'}</p>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  {editando ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== GERENCIAR FERIADOS =====================

function GerenciarFeriados() {
  const [feriados, setFeriados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroAno, setFiltroAno] = useState('2026');
  const [filtroAbrangencia, setFiltroAbrangencia] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    data: '',
    abrangencia: 'NACIONAL',
    uf: '',
    municipio: '',
    recorrente: true,
    setorAfetado: ['geral'],
    descricao: ''
  });
  const [estatisticas, setEstatisticas] = useState(null);

  useEffect(() => {
    carregarFeriados();
  }, [filtroAno, filtroAbrangencia]);

  const carregarFeriados = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = { ano: filtroAno };
      if (filtroAbrangencia) params.abrangencia = filtroAbrangencia;

      const res = await axios.get(`${API_URL}/feriados/admin`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeriados(res.data.feriados || []);
      setEstatisticas(res.data.estatisticas || null);
    } catch (error) {
      toast.error('Erro ao carregar feriados');
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (feriado = null) => {
    if (feriado) {
      setEditando(feriado);
      const dataStr = feriado.data ? feriado.data.split('T')[0] : '';
      setFormData({
        nome: feriado.nome || '',
        data: dataStr,
        abrangencia: feriado.abrangencia || 'NACIONAL',
        uf: feriado.uf || '',
        municipio: feriado.municipio || '',
        recorrente: feriado.recorrente !== false,
        setorAfetado: feriado.setorAfetado || ['geral'],
        descricao: feriado.descricao || ''
      });
    } else {
      setEditando(null);
      setFormData({ nome: '', data: '', abrangencia: 'NACIONAL', uf: '', municipio: '', recorrente: true, setorAfetado: ['geral'], descricao: '' });
    }
    setModalAberto(true);
  };

  const salvarFeriado = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const body = {
        ...formData,
        uf: formData.uf || null,
        municipio: formData.municipio || null,
        ano: formData.data ? new Date(formData.data).getFullYear() : parseInt(filtroAno)
      };

      const url = editando
        ? `${API_URL}/feriados/admin/${editando.id}`
        : `${API_URL}/feriados/admin`;
      const method = editando ? 'put' : 'post';

      const res = await axios[method](url, body, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(res.data.message || 'Feriado salvo com sucesso!');
      setModalAberto(false);
      carregarFeriados();
    } catch (error) {
      const msg = error.response?.data?.message || 'Erro ao salvar feriado';
      toast.error(msg);
    }
  };

  const deletarFeriado = async (id) => {
    if (!confirm('Deseja deletar este feriado permanentemente?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/feriados/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Feriado deletado');
      carregarFeriados();
    } catch (error) {
      toast.error('Erro ao deletar feriado');
    }
  };

  const abrLabel = (abr) => {
    const map = { NACIONAL: '🇧🇷 Nacional', ESTADUAL: '📍 Estadual', MUNICIPAL: '🏙️ Municipal' };
    return map[abr] || abr;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Feriados</h2>
          <p className="text-sm text-gray-500">
            {feriados.length} feriados em {filtroAno}
            {estatisticas && ` • ${estatisticas.nacionais} nacionais, ${estatisticas.estaduais} estaduais, ${estatisticas.municipais} municipais`}
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Novo Feriado
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <select
          value={filtroAno}
          onChange={e => setFiltroAno(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="2026">2026</option>
          <option value="2027">2027</option>
          <option value="2025">2025</option>
        </select>
        <select
          value={filtroAbrangencia}
          onChange={e => setFiltroAbrangencia(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">Todas abrangências</option>
          <option value="NACIONAL">🇧🇷 Nacional</option>
          <option value="ESTADUAL">📍 Estadual</option>
          <option value="MUNICIPAL">🏙️ Municipal</option>
        </select>
      </div>

      {/* Tabela de feriados */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Data</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Abrangência</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Recorrente</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {feriados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  <Calendar size={40} className="mx-auto mb-2 text-gray-300" />
                  Nenhum feriado encontrado para os filtros selecionados
                </td>
              </tr>
            ) : (
              feriados.map((feriado) => (
                <tr key={feriado.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                    {feriado.data ? new Date(feriado.data + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{feriado.nome}</p>
                    {feriado.descricao && <p className="text-xs text-gray-500 mt-0.5">{feriado.descricao}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm">{abrLabel(feriado.abrangencia)}</span>
                    {feriado.uf && feriado.abrangencia !== 'MUNICIPAL' && (
                      <span className="text-xs text-gray-500 ml-1">({feriado.uf})</span>
                    )}
                    {feriado.municipio && (
                      <span className="text-xs text-gray-500 ml-1">({feriado.municipio}/{feriado.uf})</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {feriado.recorrente ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Sim</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Não</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => abrirModal(feriado)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deletarFeriado(feriado.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Deletar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Feriado */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalAberto(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {editando ? 'Editar Feriado' : 'Novo Feriado'}
                </h3>
              </div>
              <button onClick={() => setModalAberto(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={salvarFeriado} className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Feriado</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={e => setFormData(p => ({ ...p, nome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  placeholder="ex: Tiradentes"
                  required
                />
              </div>

              {/* Data */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={e => setFormData(p => ({ ...p, data: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Abrangência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Abrangência</label>
                <select
                  value={formData.abrangencia}
                  onChange={e => setFormData(p => ({ ...p, abrangencia: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="NACIONAL">🇧🇷 Nacional</option>
                  <option value="ESTADUAL">📍 Estadual</option>
                  <option value="MUNICIPAL">🏙️ Municipal</option>
                </select>
              </div>

              {/* UF e Município (condicional) */}
              {(formData.abrangencia === 'ESTADUAL' || formData.abrangencia === 'MUNICIPAL') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
                    <input
                      type="text"
                      value={formData.uf}
                      onChange={e => setFormData(p => ({ ...p, uf: e.target.value.toUpperCase().slice(0, 2) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-purple-500"
                      placeholder="SP"
                      required={formData.abrangencia === 'ESTADUAL'}
                      maxLength={2}
                    />
                  </div>
                  {formData.abrangencia === 'MUNICIPAL' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Município</label>
                      <input
                        type="text"
                        value={formData.municipio}
                        onChange={e => setFormData(p => ({ ...p, municipio: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        placeholder="São Paulo"
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Recorrente */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recorrente"
                  checked={formData.recorrente}
                  onChange={e => setFormData(p => ({ ...p, recorrente: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="recorrente" className="text-sm text-gray-700">
                  Feriado recorrente (repete todo ano automaticamente)
                </label>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
                <textarea
                  value={formData.descricao}
                  onChange={e => setFormData(p => ({ ...p, descricao: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={2}
                  placeholder="Informações adicionais sobre o feriado..."
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Check size={16} />
                  {editando ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
