import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building,
  MapPin,
  Users,
  FileText,
  Briefcase,
  Loader2,
  Edit,
  Save,
  X,
  FolderOpen,
  Plus,
  Trash2,
  RefreshCw,
  BadgeCheck,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  Globe,
  Hash,
  Building2,
  Scale,
  TrendingUp,
  Shield,
  Info,
  FileSignature,
} from "lucide-react";
import { 
  Text as MantineText, 
  Badge, 
  Button, 
  Group, 
  Stack, 
  ThemeIcon,
  Box,
  SimpleGrid,
  Card
} from "@mantine/core";
import api from "../../services/api";
import DocumentosCliente from "../../components/DocumentosCliente";
import { toast } from "sonner";
import { mapCnpjDataToForm } from "../../utils/cnpjMapper";
import { formatCurrency, formatCurrencyInput, unformatCurrency, formatDate } from "../../utils/masks";

export default function DetalheCliente() {
  const { cnpj } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [dadosEdit, setDadosEdit] = useState(null);
  const [activeTab, setActiveTab] = useState("dados");
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const cleanCnpj = cnpj?.replace(/\D/g, "");

  // Carregar rascunho se existir (apenas para esta aba/sessão)
  useEffect(() => {
    if (cleanCnpj) {
      const draft = sessionStorage.getItem(`draft_client_${cleanCnpj}`);
      if (draft) {
        try {
          const parsedDraft = JSON.parse(draft);
          setDadosEdit(parsedDraft);
          setEditMode(true);
          toast.info("Rascunho de edição recuperado.");
        } catch (e) {
          console.error("Erro ao carregar rascunho:", e);
        }
      }
    }
  }, [cleanCnpj]);

  // Persistir rascunho e alertar sobre saída acidental
  useEffect(() => {
    if (editMode && dadosEdit && cleanCnpj) {
      sessionStorage.setItem(`draft_client_${cleanCnpj}`, JSON.stringify(dadosEdit));
      
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = "";
      };
      
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [dadosEdit, editMode, cleanCnpj]);

  // Limpar rascunho ao sair definitivamente da página (unmount)
  useEffect(() => {
    return () => {
      // Quando o componente desmonta (navegação interna), limpamos o rascunho
      // por questão de segurança, exceto se for um refresh (tratado pelo sessionStorage)
      if (cleanCnpj) {
        sessionStorage.removeItem(`draft_client_${cleanCnpj}`);
      }
    };
  }, [cleanCnpj]);

  useEffect(() => {
    fetchCliente();
  }, [cleanCnpj]);

  const fetchCliente = async () => {
    if (!cleanCnpj) return;
    setLoading(true);
    try {
      // Buscar no nosso banco de dados
      const response = await api.get(`/clientes`);
      const allClients = response.data;
      const found = allClients.find(c => c.cnpj.replace(/\D/g, "") === cleanCnpj);
      
      if (!found) {
        throw new Error("Cliente não encontrado no sistema.");
      }

      setCliente(found);
      setDadosEdit(found);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar cliente:", err);
      setError(err.message || "Erro ao carregar dados do cliente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!dadosEdit) return;
    setSaving(true);
    try {
      // Ajustar formato para o backend
      const { honorariosValor, honorariosDiaVencimento, ...dadosRestantes } = dadosEdit;
      const payload = {
        ...dadosRestantes,
        honorarios: {
          valor: Number(honorariosValor || 0),
          dia_vencimento: honorariosDiaVencimento || null
        }
      };
      
      await api.put(`/clientes/${cliente.id}`, payload);
      setCliente(dadosEdit);
      setEditMode(false);
      sessionStorage.removeItem(`draft_client_${cleanCnpj}`);
      toast.success("Cliente atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar cliente:", err);
      toast.error("Erro ao salvar alterações: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleAutoFill = async () => {
    const cnpjAtual = (dadosEdit?.cnpj || "").replace(/\D/g, "");
    
    if (cnpjAtual.length !== 14) {
      toast.warning("Por favor, digite um CNPJ válido com 14 dígitos para realizar o preenchimento automático.");
      return;
    }

    setRefreshing(true);
    try {
      console.log("[AutoFill] Consultando CNPJ:", cnpjAtual);
      const response = await api.get(`/clientes/consulta-fresh/${cnpjAtual}`);
      const apiData = response.data.data;
      
      console.log("[AutoFill] Dados recebidos:", apiData);

      if (!apiData) throw new Error("Dados não encontrados na API.");

      // Mapear dados da API normalizada para o formato do formulário usando o mapper centralizado
      const novosDados = mapCnpjDataToForm(apiData, dadosEdit);
      
      setDadosEdit(novosDados);
      setEditMode(true); // Entrar em modo de edição para ver os novos dados

      toast.success("Dados preenchidos automaticamente! Verifique e salve as alterações.");
    } catch (err) {
      console.error("Erro no preenchimento automático:", err);
      toast.error("Erro ao buscar dados na API: " + err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancel = () => {
    setDadosEdit(cliente);
    setEditMode(false);
    sessionStorage.removeItem(`draft_client_${cleanCnpj}`);
  };

  // Helpers de formatação
  const formatCnpj = (raw) => {
    const c = String(raw || "").replace(/\D/g, "").padStart(14, "0");
    if (c.length !== 14) return raw;
    return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12, 14)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <span className="ml-4 text-lg text-slate-500 font-bold">Carregando dados do cliente...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <button onClick={() => navigate("/clientes")} className="flex items-center text-blue-600 hover:text-blue-800 font-bold mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Voltar para Clientes
        </button>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-red-700">
          <p className="font-bold mb-2">Erro</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  const data = editMode ? dadosEdit : cliente;

  const updateField = (field, value) => setDadosEdit(prev => ({ ...prev, [field]: value }));
  const updateNestedField = (parent, field, value) => setDadosEdit(prev => ({
    ...prev,
    [parent]: { ...(prev[parent] || {}), [field]: value }
  }));

  const InfoCard = ({ label, value, highlight, editable, onChange, options, icon: Icon, type = "text" }) => (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-transparent dark:border-slate-600">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon size={12} className="text-slate-400" />}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
      </div>
      {editable ? (
        options ? (
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded px-2 py-1 w-full outline-none focus:border-blue-500"
          >
            <option value="">Selecione...</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : type === "currency" ? (
          <input
            type="text"
            value={formatCurrencyInput(value)}
            onChange={(e) => onChange(unformatCurrency(e.target.value))}
            className="text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded px-2 py-1 w-full outline-none focus:border-blue-500"
            placeholder="R$ 0,00"
          />
        ) : (
          <input
            type={type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded px-2 py-1 w-full outline-none focus:border-blue-500"
          />
        )
      ) : (
        <p className={`text-sm font-semibold ${highlight ? "text-emerald-600" : "text-slate-800 dark:text-slate-200"}`}>
          {type === "currency" ? formatCurrency(value) : type === "date" ? formatDate(value) : (value || "—")}
        </p>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 xl:p-8 min-h-screen">
      {/* HEADER FIXO COM TABS */}
      <div className="sticky top-[60px] z-[40] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md -mx-4 md:-mx-6 xl:-mx-8 px-4 md:px-6 xl:px-8 pt-4 md:pt-6 xl:pt-8 pb-4 mb-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/clientes")}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all border border-slate-200 dark:border-slate-700 shadow-sm group"
            >
              <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400 group-hover:text-blue-600 transition-colors" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none">
                <Building size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-black text-slate-800 dark:text-white leading-tight">
                  {cliente.razao_social}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="filled" color={cliente.status === "Ativo" ? "green" : "red"} size="sm" radius="sm">
                    {cliente.status}
                  </Badge>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {formatCnpj(cliente.cnpj)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            {!editMode ? (
              <>
                <Button 
                  variant="light" 
                  color="indigo" 
                  onClick={() => navigate(`/gerador-documentos?cnpj=${cleanCnpj}`)}
                  leftSection={<FileSignature size={16} />}
                >
                  Gerar Documento
                </Button>
                <Button 
                  variant="light" 
                  color="blue" 
                  onClick={handleAutoFill}
                  loading={refreshing}
                  leftSection={<RefreshCw size={16} />}
                >
                  Preenchimento Automático
                </Button>
                <Button 
                  color="blue" 
                  onClick={() => setEditMode(true)}
                  leftSection={<Edit size={16} />}
                >
                  Editar Dados
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="light" 
                  color="gray" 
                  onClick={handleCancel}
                  leftSection={<X size={16} />}
                >
                  Cancelar
                </Button>
                <Button 
                  color="emerald" 
                  onClick={handleSave}
                  loading={saving}
                  leftSection={<Save size={16} />}
                >
                  Salvar Alterações
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Tabs Navegação */}
        <div className="flex gap-1 mt-6 overflow-x-auto no-scrollbar">
          {[
            { id: "dados", label: "Dados Gerais", icon: Building },
            { id: "socios", label: "Sócios (QSA)", icon: Users },
            { id: "atividades", label: "Atividades (CNAE)", icon: Briefcase },
            { id: "documentos", label: "Documentos", icon: FolderOpen },
            { id: "observacoes", label: "Observações", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}
              `}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "documentos" ? (
        <DocumentosCliente clienteId={cliente.id} clienteNome={cliente.razao_social} />
      ) : activeTab === "socios" ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-6">
            <Users size={20} className="mr-2 text-blue-600" /> Quadro de Sócios e Administradores (QSA)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(data.qsa || []).length > 0 ? (
              data.qsa.map((socio, idx) => (
                <Card key={idx} padding="md" radius="md" withBorder className="bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                  <Stack gap="xs">
                    <Group justify="space-between" align="flex-start">
                      <div className="flex-1">
                        <MantineText size="md" fw={900} c="blue.7" className="dark:text-blue-400">{socio.nome}</MantineText>
                        <MantineText size="xs" c="dimmed" ff="monospace" fw={600}>{socio.cpf_cnpj}</MantineText>
                      </div>
                      <Badge 
                        variant="light" 
                        color="blue" 
                        h="auto" 
                        py={4}
                        styles={{ label: { whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.2 } }}
                      >
                        {socio.qualificacao}
                      </Badge>
                    </Group>
                    
                    <SimpleGrid cols={2} spacing="xs">
                      <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <MantineText size="10px" fw={700} c="dimmed" className="uppercase tracking-tighter">Entrada</MantineText>
                        <MantineText size="xs" fw={700}>{socio.data_entrada || "—"}</MantineText>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <MantineText size="10px" fw={700} c="dimmed" className="uppercase tracking-tighter">Participação (Valor)</MantineText>
                        <MantineText size="xs" fw={700}>{formatCurrency(socio.participacao)}</MantineText>
                      </div>
                    </SimpleGrid>

                    {(socio.pais || socio.representante_legal) && (
                      <div className="mt-1 p-3 border-t border-slate-100 dark:border-slate-700">
                        <Stack gap={4}>
                          {socio.pais && (
                            <Group gap={4}>
                              <Globe size={12} className="text-slate-400" />
                              <MantineText size="xs" fw={600}><span className="text-slate-400">País:</span> {socio.pais}</MantineText>
                            </Group>
                          )}
                          {socio.representante_legal && (
                            <Group gap={4}>
                              <Users size={12} className="text-slate-400" />
                              <MantineText size="xs" fw={600}><span className="text-slate-400">Representante:</span> {socio.representante_legal}</MantineText>
                            </Group>
                          )}
                        </Stack>
                      </div>
                    )}
                  </Stack>
                </Card>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center text-slate-400 italic text-sm">Nenhum sócio registrado.</div>
            )}
          </div>
        </div>
      ) : activeTab === "atividades" ? (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-6">
              <Briefcase size={20} className="mr-2 text-blue-600" /> CNAE Principal
            </h2>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="bg-blue-600 text-white font-bold p-2 rounded-lg text-sm min-w-[100px] text-center">
                  {data.cnae_principal?.codigo}
                </div>
                <MantineText size="sm" fw={700} className="dark:text-slate-200">
                  {data.cnae_principal?.descricao || "Descrição não informada"}
                </MantineText>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-6">
              <FileText size={20} className="mr-2 text-emerald-600" /> CNAEs Secundários
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {(data.cnaes_secundarios || []).length > 0 ? (
                data.cnaes_secundarios.map((cnae, idx) => (
                  <div key={idx} className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                    <MantineText size="xs" fw={800} ff="monospace" c="dimmed" className="min-w-[80px]">
                      {cnae.codigo}
                    </MantineText>
                    <MantineText size="xs" fw={600} className="dark:text-slate-300">
                      {cnae.descricao}
                    </MantineText>
                  </div>
                ))
              ) : (
                <MantineText size="sm" c="dimmed" fs="italic">Nenhuma atividade secundária registrada.</MantineText>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "observacoes" ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-6">
            <FileText size={20} className="mr-2 text-blue-600" /> Observações e Anotações Internas
          </h2>
          {editMode ? (
            <textarea
              value={data.observacoes || ""}
              onChange={(e) => updateField("observacoes", e.target.value)}
              rows={12}
              className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              placeholder="Adicione informações detalhadas sobre o cliente, particularidades, acordos ou histórico..."
            />
          ) : (
            <div className="p-6 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-600 min-h-[300px]">
              {cliente.observacoes ? (
                <MantineText size="sm" style={{ whiteSpace: 'pre-wrap' }}>{cliente.observacoes}</MantineText>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <Info size={40} className="text-slate-300 mb-4" />
                  <MantineText size="sm" c="dimmed">Nenhuma observação registrada para este cliente.</MantineText>
                  <Button variant="subtle" size="xs" mt="sm" onClick={() => { setEditMode(true); setActiveTab("observacoes"); }}>
                    Adicionar Observação
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* DADOS PRINCIPAIS */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl mr-4">
                <Building size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                {editMode ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Razão Social</label>
                      <input
                        type="text"
                        value={data.razao_social || ""}
                        onChange={(e) => updateField("razao_social", e.target.value)}
                        className="w-full text-lg font-black text-slate-800 dark:text-white bg-transparent border-b-2 border-blue-200 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Nome Fantasia</label>
                      <input
                        type="text"
                        value={data.nome_fantasia || ""}
                        onChange={(e) => updateField("nome_fantasia", e.target.value)}
                        className="w-full text-lg font-black text-slate-800 dark:text-white bg-transparent border-b-2 border-blue-200 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl font-black text-slate-800 dark:text-white">{cliente.razao_social}</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Fantasia: {cliente.nome_fantasia || "—"}</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoCard label="CNPJ" value={formatCnpj(cliente.cnpj)} icon={Hash} />
              <InfoCard
                label="Status no Sistema"
                value={data.status}
                icon={Shield}
                editable={editMode}
                onChange={(v) => updateField("status", v)}
                options={["Ativo", "Inativo", "Suspenso", "Bloqueado"]}
                highlight={data.status === "Ativo"}
              />
              <InfoCard
                label="Regime Tributário"
                value={data.regime_tributario}
                icon={Scale}
                editable={editMode}
                onChange={(v) => updateField("regime_tributario", v)}
                options={["Simples Nacional", "Simples Nacional - MEI", "Lucro Presumido", "Lucro Real", "Não Enquadrado", "Isento", "Imune", "Outro"]}
                highlight={true}
              />
              <InfoCard label="Data de Abertura" value={data.data_abertura} icon={Calendar} />
              <InfoCard label="Natureza Jurídica" value={cliente.natureza_juridica} icon={Scale} />
              <InfoCard
                label="Categoria"
                value={data.categoria}
                icon={Briefcase}
                editable={editMode}
                onChange={(v) => updateField("categoria", v)}
                options={["Serviços", "Comércio", "Indústria", "Misto"]}
              />
              <InfoCard 
                label="Valor Honorários" 
                value={data.honorariosValor}
                editable={editMode} 
                type="currency"
                onChange={(v) => updateField("honorariosValor", v)}
                icon={DollarSign}
                highlight
              />
              <InfoCard 
                label="Dia Vencimento" 
                value={data.honorariosDiaVencimento}
                editable={editMode} 
                type="number"
                onChange={(v) => updateField("honorariosDiaVencimento", v)}
                icon={Calendar}
              />
            </div>
          </div>

          {/* DETALHES FISCAIS / RECEITA FEDERAL */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-4">
              <Scale size={20} className="mr-2 text-blue-600" /> Detalhes Fiscais e Cadastrais
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoCard 
                label="Capital Social" 
                value={data.capital_social}
                editable={editMode} 
                type="currency"
                onChange={(v) => updateField("capital_social", v)}
                icon={TrendingUp}
              />
              <InfoCard 
                label="Porte da Empresa" 
                value={data.porte} 
                editable={editMode} 
                onChange={v => updateField("porte", v)} 
                icon={Building2} 
              />
              <InfoCard 
                label="Data da Situação" 
                value={data.situacao_data} 
                editable={editMode} 
                onChange={v => updateField("situacao_data", v)} 
                icon={Calendar} 
              />
              <InfoCard 
                label="Motivo da Situação" 
                value={data.situacao_motivo} 
                editable={editMode} 
                onChange={v => updateField("situacao_motivo", v)} 
                icon={Info} 
              />
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Simples Nacional</span>
                  <Badge color={data.opcao_simples ? "green" : "red"}>
                    {data.opcao_simples ? "Optante" : "Não Optante"}
                  </Badge>
                </div>
                {data.data_opcao_simples !== data.data_exclusao_simples && (
                  <div className="grid grid-cols-2 gap-2">
                    <InfoCard label="Data de Opção" value={data.data_opcao_simples} editable={editMode} onChange={v => updateField("data_opcao_simples", v)} />
                    <InfoCard label="Data de Exclusão" value={data.data_exclusao_simples} editable={editMode} onChange={v => updateField("data_exclusao_simples", v)} />
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Microempreendedor Individual (MEI)</span>
                  <Badge color={data.opcao_mei ? "green" : "red"}>
                    {data.opcao_mei ? "Optante" : "Não Optante"}
                  </Badge>
                </div>
                {data.data_opcao_mei !== data.data_exclusao_mei && (
                  <div className="grid grid-cols-2 gap-2">
                    <InfoCard label="Data de Opção" value={data.data_opcao_mei} editable={editMode} onChange={v => updateField("data_opcao_mei", v)} />
                    <InfoCard label="Data de Exclusão" value={data.data_exclusao_mei} editable={editMode} onChange={v => updateField("data_exclusao_mei", v)} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ENDEREÇO */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-4">
              <MapPin size={20} className="mr-2 text-blue-600" /> Endereço Comercial
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoCard label="CEP" value={data.endereco?.cep} editable={editMode} onChange={v => updateNestedField("endereco", "cep", v)} />
              <InfoCard label="Logradouro" value={data.endereco?.logradouro} editable={editMode} onChange={v => updateNestedField("endereco", "logradouro", v)} />
              <InfoCard label="Número" value={data.endereco?.numero} editable={editMode} onChange={v => updateNestedField("endereco", "numero", v)} />
              <InfoCard label="Bairro" value={data.endereco?.bairro} editable={editMode} onChange={v => updateNestedField("endereco", "bairro", v)} />
              <InfoCard label="Cidade" value={data.endereco?.cidade} editable={editMode} onChange={v => updateNestedField("endereco", "cidade", v)} />
              <InfoCard label="UF" value={data.endereco?.uf} editable={editMode} onChange={v => updateNestedField("endereco", "uf", v)} />
            </div>
          </div>

          {/* CONTATOS */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-4">
              <Users size={20} className="mr-2 text-blue-600" /> Contatos Principais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <InfoCard 
                  label="Telefone Principal" 
                  value={data.contato_principal?.telefone} 
                  icon={Phone} 
                  editable={editMode} 
                  onChange={v => updateNestedField("contato_principal", "telefone", v)} 
               />
               <InfoCard 
                  label="E-mail Principal" 
                  value={data.contato_principal?.email} 
                  icon={Mail} 
                  editable={editMode} 
                  onChange={v => updateNestedField("contato_principal", "email", v)} 
               />
            </div>
          </div>

          {/* CERTIFICADO DIGITAL */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-4">
              <BadgeCheck size={20} className="mr-2 text-blue-600" /> Certificado Digital
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <InfoCard 
                  label="Possui Certificado?" 
                  value={data.certificado_digital?.possui ? "Sim" : "Não"} 
                  icon={Shield} 
                  editable={editMode} 
                  options={["Sim", "Não"]}
                  onChange={v => updateNestedField("certificado_digital", "possui", v === "Sim")} 
                  highlight={data.certificado_digital?.possui}
               />
               {data.certificado_digital?.possui ? (
                 <>
                   <InfoCard 
                      label="Senha" 
                      value={data.certificado_digital?.senha} 
                      icon={Briefcase} 
                      editable={editMode} 
                      onChange={v => updateNestedField("certificado_digital", "senha", v)} 
                   />
                   <InfoCard 
                      label="Data de Emissão" 
                      value={data.certificado_digital?.emissao ? data.certificado_digital.emissao.split('T')[0] : null} 
                      type="date"
                      icon={Calendar} 
                      editable={editMode} 
                      onChange={v => updateNestedField("certificado_digital", "emissao", v ? new Date(v).toISOString() : null)} 
                   />
                   <InfoCard 
                      label="Data de Vencimento" 
                      value={data.certificado_digital?.vencimento ? data.certificado_digital.vencimento.split('T')[0] : null} 
                      type="date"
                      icon={Calendar} 
                      editable={editMode} 
                      onChange={v => updateNestedField("certificado_digital", "vencimento", v ? new Date(v).toISOString() : null)} 
                   />
                 </>
               ) : (
                 <div className="col-span-1 sm:col-span-1 lg:col-span-3 py-2">
                   <MantineText size="sm" c="dimmed">Cliente não possui certificado digital cadastrado.</MantineText>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
