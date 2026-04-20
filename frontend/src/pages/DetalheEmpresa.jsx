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
} from "lucide-react";
import { useSalvarCliente } from "../hooks/useCnpj";
import DocumentosCliente from "../components/DocumentosCliente";

export default function DetalheEmpresa() {
  const { cnpj } = useParams();
  const navigate = useNavigate();

  // Estado direto — SEM TanStack Query para esta página
  const [dadosApi, setDadosApi] = useState(null);
  const [loadingApi, setLoadingApi] = useState(true);
  const [errorApi, setErrorApi] = useState(null);
  const [apiUsed, setApiUsed] = useState(null);

  const { mutate: salvarCliente, isPending: saving } = useSalvarCliente();
  const [editMode, setEditMode] = useState(false);
  const [dadosEdit, setDadosEdit] = useState(null);
  const [activeTab, setActiveTab] = useState("dados");
  const [savedToDatabase, setSavedToDatabase] = useState(false);
  const [dados, setDados] = useState(null);
  const [fetchKey, setFetchKey] = useState(0);

  const refetchCnpj = () => setFetchKey((k) => k + 1);

  // FETCH DIRETO — SEM cache de nenhum tipo
  useEffect(() => {
    const clean = cnpj?.replace(/\D/g, "");
    if (!clean || clean.length !== 14) return;

    let cancelled = false;
    console.log("🔍 [DetalheEmpresa] Buscando dados frescos para:", clean);

    (async () => {
      setLoadingApi(true);
      setErrorApi(null);
      try {
        const ts = Date.now();
        const response = await fetch(
          `/api/clientes/consulta-fresh/${clean}?_t=${ts}&_k=${fetchKey}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          },
        );
        const result = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(result.message || "Erro ao consultar CNPJ");
        }

        console.log("✅ [DetalheEmpresa] Dados recebidos:", {
          apiUsed: result.data?.apiUsed,
          fromCache: result.data?.fromCache,
          razaoSocial: result.data?.razaoSocial,
          telefones: result.data?.telefones?.length,
          email: result.data?.email,
          socios: result.data?.socios?.length,
        });

        setDadosApi(result.data);
        setApiUsed(result.data?.apiUsed || null);
        setDados(result.data);
        setDadosEdit(result.data);
        setSavedToDatabase(false);
      } catch (err) {
        if (!cancelled) {
          console.error("❌ [DetalheEmpresa] Erro:", err.message);
          setErrorApi(err.message);
        }
      } finally {
        if (!cancelled) setLoadingApi(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cnpj, fetchKey]);

  const handleSalvarEdicao = () => {
    if (!dadosEdit) return;

    const dadosParaEnviar = {
      razao_social: dadosEdit.razaoSocial,
      nome_fantasia: dadosEdit.nomeFantasia,
      regime_tributario: dadosEdit.regimeTributario,
      natureza_juridica: dadosEdit.naturezaJuridica,
      categoria: dadosEdit.categoria || "Serviços",
      status: dadosEdit.situacao?.descricao?.toLowerCase().includes("ativa")
        ? "Ativo"
        : "Inativo",
      observacoes: dadosEdit.observacoes || "",
      endereco: dadosEdit.endereco,
      cnae_principal: dadosEdit.cnaePrincipal,
      cnaes_secundarios: dadosEdit.cnaesSecundarios,
      contatos: dadosEdit.contatos,
      qsa: dadosEdit.socios,
      honorarios: dadosEdit.honorarios,
    };

    salvarCliente(dadosParaEnviar, {
      onSuccess: (data) => {
        setDados(data);
        setDadosEdit(data);
        setEditMode(false);
        setSavedToDatabase(true);
        alert("Dados salvos com sucesso!");
      },
      onError: (err) => {
        alert("Erro ao salvar: " + err.message);
      },
    });
  };

  const handleCancelEdicao = () => {
    setDadosEdit(savedToDatabase && dados ? dados : dadosApi || null);
    setEditMode(false);
  };

  // Helpers
  const formatCnpj = (raw) => {
    const c = String(raw || "")
      .replace(/\D/g, "")
      .padStart(14, "0");
    if (c.length !== 14) return raw;
    return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12, 14)}`;
  };

  const formatCurrency = (v) => {
    if (!v && v !== 0) return "—";
    return Number(v).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatCpf = (raw) => {
    if (!raw) return "—";
    // Mantém TODOS os caracteres originais (incluindo *) e apenas aplica a máscara
    const c = String(raw).padStart(11, "0").slice(0, 11);
    if (c.length < 3) return raw;
    return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9, 11)}`;
  };

  const formatarTelefone = (tel) => {
    if (!tel || !tel.numero) return "—";
    let n = tel.numero.replace(/\D/g, "");
    const ddd = tel.ddd || "";

    if (n.length === 0) return "—";

    // Detectar tipo pelo primeiro dígito
    // 2-5 = Fixo | 6-9 = Celular (Ref: Anatel / Plano de Numeração Brasileiro)
    const primeiroDigito = n[0];
    const isCelular = primeiroDigito >= "6" && primeiroDigito <= "9";

    // Se é celular mas tem apenas 8 dígitos, adicionar o "9"
    if (isCelular && n.length === 8) {
      n = "9" + n;
    }

    if (ddd) {
      if (n.length === 9) {
        return `(${ddd}) ${n.slice(0, 1)} ${n.slice(1, 5)}-${n.slice(5)}`; // Celular: (71) 9 8288-6218
      }
      return `(${ddd}) ${n.slice(0, 4)}-${n.slice(4)}`; // Fixo: (71) 3288-6218
    }
    return n;
  };

  // Loading
  if (loadingApi) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <span className="ml-4 text-lg text-slate-500 font-bold">
          Buscando dados da empresa na API...
        </span>
      </div>
    );
  }

  // Error
  if (errorApi && !dadosApi) {
    return (
      <div className="p-8">
        <button
          onClick={() => navigate("/clientes")}
          className="flex items-center text-blue-600 hover:text-blue-800 font-bold mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Voltar
        </button>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-red-700 font-medium">
          <p className="font-bold mb-2">Erro ao consultar CNPJ</p>
          <p className="text-sm">{errorApi}</p>
          <button
            onClick={() => refetchCnpj()}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const cliente = editMode ? dadosEdit : savedToDatabase ? dados : dadosApi;
  if (!cliente) return null;

  const updateField = (field, value) =>
    setDadosEdit((prev) => ({ ...prev, [field]: value }));
  const updateEndereco = (field, value) =>
    setDadosEdit((prev) => ({
      ...prev,
      endereco: { ...(prev.endereco || {}), [field]: value },
    }));
  const updateContato = (index, field, value) =>
    setDadosEdit((prev) => {
      const contatos = [...(prev.contatos || [])];
      contatos[index] = { ...contatos[index], [field]: value };
      return { ...prev, contatos };
    });
  const addContato = () =>
    setDadosEdit((prev) => ({
      ...prev,
      contatos: [
        ...(prev.contatos || []),
        { nome: "", email: "", telefone: "", cargo: "", ehPrincipal: false },
      ],
    }));
  const removeContato = (index) =>
    setDadosEdit((prev) => {
      const c = [...(prev.contatos || [])];
      c.splice(index, 1);
      return { ...prev, contatos: c };
    });

  const apiLabel =
    apiUsed === "opencnpj"
      ? "🟢 api.opencnpj.org"
      : apiUsed === "invertexto"
        ? "🟡 api.invertexto.com"
        : apiUsed === "minhareceita"
          ? "🔵 minhareceita.org"
          : apiUsed === "cnpja"
            ? "🟣 api.cnpja.com"
            : apiUsed === "brasilapi"
              ? "🔵 brasilapi.com.br (cache antigo)"
              : "💾 cache";

  // DEBUG: log para rastrear apiUsed
  console.log(
    "🔍 [DetalheEmpresa] apiUsed:",
    apiUsed,
    "| apiLabel:",
    apiLabel,
    "| dados:",
    !!dadosApi,
  );

  // InfoCard component
  const InfoCard = ({
    label,
    value,
    highlight,
    editable,
    onChange,
    options,
    icon: Icon,
  }) => (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
      <div className="flex items-center gap-1.5 mb-1">
        {Icon && <Icon size={12} className="text-slate-400" />}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </p>
      </div>
      {editable ? (
        options ? (
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )
      ) : (
        <p
          className={`text-sm font-semibold ${highlight ? "text-emerald-600" : "text-slate-800 dark:text-slate-200"}`}
        >
          {value || "—"}
        </p>
      )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 xl:p-8 overflow-y-auto max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/clientes")}
          className="flex items-center text-blue-600 hover:text-blue-800 font-bold transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Voltar
        </button>
        <div className="flex gap-2">
          {!savedToDatabase && (
            <button
              onClick={() => refetchCnpj()}
              className="flex items-center bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl transition-colors text-sm"
            >
              <RefreshCw size={16} className="mr-1.5" /> Atualizar
            </button>
          )}
          {savedToDatabase && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm"
            >
              <Edit size={16} className="mr-1.5" /> Editar
            </button>
          )}
          {editMode && (
            <>
              <button
                onClick={handleCancelEdicao}
                className="flex items-center bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold px-4 py-2 rounded-xl transition-colors text-sm"
              >
                <X size={16} className="mr-1.5" /> Cancelar
              </button>
              <button
                onClick={handleSalvarEdicao}
                disabled={saving}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm disabled:opacity-50"
              >
                <Save size={16} className="mr-1.5" />{" "}
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </>
          )}
          {!savedToDatabase && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm"
            >
              <Save size={16} className="mr-1.5" /> Salvar no Banco
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700">
        {["dados", "documentos"]
          .filter((t) => t === "dados" || savedToDatabase)
          .map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center px-5 py-2.5 font-bold border-b-2 transition-colors text-sm ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "dados" ? (
                <>
                  <Building size={16} className="mr-2" />
                  Dados da Empresa
                </>
              ) : (
                <>
                  <FolderOpen size={16} className="mr-2" />
                  Documentos
                </>
              )}
            </button>
          ))}
      </div>

      {activeTab === "documentos" && savedToDatabase && dados?._id && (
        <DocumentosCliente
          clienteId={dados._id}
          clienteNome={dados.razao_social || dados.razaoSocial || "Empresa"}
        />
      )}

      {activeTab === "dados" && (
        <div className="space-y-6">
          {!savedToDatabase && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start justify-between">
              <div className="flex items-start">
                <span className="text-xl mr-3">⚠️</span>
                <div>
                  <p className="font-bold text-amber-800 dark:text-amber-300">
                    Dados da Receita Federal
                  </p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Visualização. Clique em "Salvar no Banco" para cadastrar.
                  </p>
                </div>
              </div>
              <span className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800 font-medium text-amber-600">
                Fonte: {apiLabel}
              </span>
            </div>
          )}

          {/* DADOS PRINCIPAIS */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center mb-5">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl mr-4">
                <Building
                  size={24}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                {editMode ? (
                  <input
                    type="text"
                    value={cliente.razaoSocial || ""}
                    onChange={(e) => updateField("razaoSocial", e.target.value)}
                    className="text-xl font-black text-slate-800 dark:text-white border-b-2 border-blue-300 focus:border-blue-500 focus:outline-none bg-transparent w-full max-w-lg"
                  />
                ) : (
                  <>
                    <h1 className="text-xl font-black text-slate-800 dark:text-white">
                      {cliente.razaoSocial || "—"}
                    </h1>
                    {cliente.nomeFantasia &&
                      cliente.nomeFantasia !== cliente.razaoSocial && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          Fantasia: {cliente.nomeFantasia}
                        </p>
                      )}
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoCard
                label="CNPJ"
                value={formatCnpj(cliente.cnpj)}
                icon={Hash}
              />
              <InfoCard
                label="Situação"
                value={cliente.situacao?.descricao || "—"}
                icon={Shield}
                highlight={cliente.situacao?.descricao
                  ?.toLowerCase()
                  .includes("ativa")}
              />
              <InfoCard
                label="Data Abertura"
                value={cliente.dataAbertura || "—"}
                icon={Calendar}
              />
              <InfoCard
                label="Natureza Jurídica"
                value={cliente.naturezaJuridica || "—"}
                icon={Scale}
              />
              <InfoCard
                label="Porte"
                value={cliente.porte?.descricao || cliente.porte?.codigo || "—"}
                icon={Building2}
              />
              <InfoCard
                label="Capital Social"
                value={formatCurrency(cliente.capitalSocial)}
                icon={DollarSign}
              />
            </div>
          </div>

          {/* TRIBUTÁRIO */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-4">
              <BadgeCheck size={20} className="mr-2 text-emerald-600" />{" "}
              Informações Tributárias
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              <InfoCard
                label="Regime Tributário"
                value={cliente.regimeTributario || "—"}
                icon={Scale}
                editable={editMode}
                onChange={(v) => updateField("regimeTributario", v)}
                options={[
                  "Simples Nacional",
                  "Simples Nacional - MEI",
                  "Lucro Presumido",
                  "Lucro Real",
                  "Não Enquadrado",
                  "Outro",
                ]}
                highlight={
                  cliente.regimeTributario &&
                  !["Outro", "Não Enquadrado", "Nao Informado"].includes(
                    cliente.regimeTributario,
                  )
                }
              />
              {cliente.opcaoSimples !== null &&
                cliente.opcaoSimples !== undefined && (
                  <InfoCard
                    label="Optante Simples"
                    value={cliente.opcaoSimples ? "✅ Sim" : "❌ Não"}
                    icon={BadgeCheck}
                  />
                )}
              {cliente.opcaoMei !== null && cliente.opcaoMei !== undefined && (
                <InfoCard
                  label="Optante MEI"
                  value={cliente.opcaoMei ? "✅ Sim" : "❌ Não"}
                  icon={BadgeCheck}
                />
              )}
              {cliente.dataOpcaoSimples && (
                <InfoCard
                  label="Data Opção Simples"
                  value={cliente.dataOpcaoSimples}
                  icon={Calendar}
                />
              )}
              {cliente.dataExclusaoSimples && (
                <InfoCard
                  label="Data Exclusão Simples"
                  value={cliente.dataExclusaoSimples}
                  icon={Calendar}
                />
              )}
              {cliente.dataOpcaoMei && (
                <InfoCard
                  label="Data Opção MEI"
                  value={cliente.dataOpcaoMei}
                  icon={Calendar}
                />
              )}
              {cliente.dataExclusaoMei && (
                <InfoCard
                  label="Data Exclusão MEI"
                  value={cliente.dataExclusaoMei}
                  icon={Calendar}
                />
              )}
            </div>
          </div>

          {/* ENDEREÇO */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-4">
              <MapPin size={20} className="mr-2 text-blue-600" /> Endereço
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoCard
                label="Logradouro"
                value={cliente.endereco?.logradouro || "—"}
                icon={MapPin}
                editable={editMode}
                onChange={(v) => updateEndereco("logradouro", v)}
              />
              <InfoCard
                label="Número"
                value={cliente.endereco?.numero || "—"}
                editable={editMode}
                onChange={(v) => updateEndereco("numero", v)}
              />
              <InfoCard
                label="Complemento"
                value={cliente.endereco?.complemento || "—"}
                editable={editMode}
                onChange={(v) => updateEndereco("complemento", v)}
              />
              <InfoCard
                label="Bairro"
                value={cliente.endereco?.bairro || "—"}
                editable={editMode}
                onChange={(v) => updateEndereco("bairro", v)}
              />
              <InfoCard
                label="Cidade"
                value={cliente.endereco?.cidade || "—"}
                editable={editMode}
                onChange={(v) => updateEndereco("cidade", v)}
              />
              <InfoCard
                label="UF"
                value={cliente.endereco?.uf || "—"}
                editable={editMode}
                onChange={(v) => updateEndereco("uf", v)}
              />
              <InfoCard
                label="CEP"
                value={cliente.endereco?.cep || "—"}
                editable={editMode}
                onChange={(v) => updateEndereco("cep", v)}
              />
            </div>
          </div>

          {/* CONTATOS */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center">
                <Phone size={20} className="mr-2 text-blue-600" /> Contatos
              </h2>
              {editMode && (
                <button
                  onClick={addContato}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <Plus size={14} /> Adicionar
                </button>
              )}
            </div>

            {/* Telefones da API — sempre 2 slots para consistência visual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <InfoCard
                label={`Telefone 1${cliente.telefones?.[0]?.tipo ? ` (${cliente.telefones[0].tipo})` : ""}`}
                value={
                  cliente.telefones && cliente.telefones.length > 0
                    ? formatarTelefone(cliente.telefones[0])
                    : "—"
                }
                icon={Phone}
              />
              <InfoCard
                label={`Telefone 2${cliente.telefones?.[1]?.tipo ? ` (${cliente.telefones[1].tipo})` : ""}`}
                value={
                  cliente.telefones && cliente.telefones.length > 1
                    ? formatarTelefone(cliente.telefones[1])
                    : "—"
                }
                icon={Phone}
              />
            </div>
            {cliente.email && (
              <InfoCard label="E-mail" value={cliente.email} icon={Mail} />
            )}

            {/* Contatos editáveis */}
            {editMode && cliente.contatos && cliente.contatos.length > 0 && (
              <div className="space-y-3 mt-4">
                {cliente.contatos.map((contato, i) => (
                  <div
                    key={i}
                    className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 relative"
                  >
                    {contato.ehPrincipal && (
                      <span className="absolute top-2 right-2 text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                        Principal
                      </span>
                    )}
                    <button
                      onClick={() => removeContato(i)}
                      className="absolute top-2 left-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={contato.nome || ""}
                          onChange={(e) =>
                            updateContato(i, "nome", e.target.value)
                          }
                          className="text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">
                          Cargo
                        </label>
                        <input
                          type="text"
                          value={contato.cargo || ""}
                          onChange={(e) =>
                            updateContato(i, "cargo", e.target.value)
                          }
                          className="text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">
                          E-mail
                        </label>
                        <input
                          type="email"
                          value={contato.email || ""}
                          onChange={(e) =>
                            updateContato(i, "email", e.target.value)
                          }
                          className="text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase">
                          Telefone
                        </label>
                        <input
                          type="text"
                          value={contato.telefone || ""}
                          onChange={(e) =>
                            updateContato(i, "telefone", e.target.value)
                          }
                          className="text-sm font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ATIVIDADE PRINCIPAL */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-4">
              <Briefcase size={20} className="mr-2 text-blue-600" /> Atividade
              Principal
            </h2>
            {cliente.cnaePrincipal?.codigo ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md mr-2">
                  {cliente.cnaePrincipal.codigo}
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {cliente.cnaePrincipal.descricao ||
                    "Descrição não disponível nesta API"}
                </span>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">
                Atividade principal não disponível.
              </p>
            )}
          </div>

          {/* CNAES SECUNDÁRIOS */}
          {cliente.cnaesSecundarios && cliente.cnaesSecundarios.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-4">
                <Briefcase size={20} className="mr-2 text-blue-600" />{" "}
                Atividades Secundárias ({cliente.cnaesSecundarios.length})
              </h2>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cliente.cnaesSecundarios.map((cnae, i) => (
                  <div
                    key={i}
                    className="flex items-center bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-600"
                  >
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded mr-3 flex-shrink-0">
                      {cnae.codigo}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {cnae.descricao || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QUADRO SOCIETÁRIO */}
          {cliente.socios && cliente.socios.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-4">
                <Users size={20} className="mr-2 text-blue-600" /> Quadro
                Societário ({cliente.socios.length})
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-600">
                      <th className="px-4 py-3 font-bold">Nome</th>
                      <th className="px-4 py-3 font-bold">CPF/CNPJ</th>
                      <th className="px-4 py-3 font-bold">Qualificação</th>
                      <th className="px-4 py-3 font-bold hidden md:table-cell">
                        Data Entrada
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-600 text-sm">
                    {cliente.socios.map((socio, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">
                          {socio.nome || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-mono">
                          {formatCpf(socio.cpfCnpj)}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                          {socio.qualificacao || "—"}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden md:table-cell">
                          {socio.dataEntrada || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* HONORÁRIOS (após salvar) */}
          {savedToDatabase && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-4">
                <DollarSign size={20} className="mr-2 text-emerald-600" />{" "}
                Honorários
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoCard
                  label="Valor"
                  value={formatCurrency(cliente.honorarios?.valor || 0)}
                  icon={DollarSign}
                  editable={editMode}
                  onChange={(v) => {
                    const n = parseFloat(
                      v.replace(/[^0-9.,]/g, "").replace(",", "."),
                    );
                    updateField("honorarios", {
                      ...(cliente.honorarios || {}),
                      valor: isNaN(n) ? 0 : n,
                    });
                  }}
                />
                <InfoCard
                  label="Dia Vencimento"
                  value={
                    cliente.honorarios?.dia_vencimento
                      ? `${cliente.honorarios.dia_vencimento}º dia`
                      : "—"
                  }
                  icon={Calendar}
                  editable={editMode}
                  onChange={(v) => {
                    const n = parseInt(v);
                    updateField("honorarios", {
                      ...(cliente.honorarios || {}),
                      dia_vencimento: isNaN(n) ? null : n,
                    });
                  }}
                />
              </div>
            </div>
          )}

          {/* ANOTAÇÕES (após salvar) */}
          {savedToDatabase && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center mb-4">
                <FileText size={20} className="mr-2 text-blue-600" /> Anotações
              </h2>
              {editMode ? (
                <textarea
                  value={cliente.observacoes || ""}
                  onChange={(e) => updateField("observacoes", e.target.value)}
                  placeholder="Anotações sobre a empresa..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              ) : (
                <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600 min-h-[60px]">
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {cliente.observacoes || "Nenhuma anotação."}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
