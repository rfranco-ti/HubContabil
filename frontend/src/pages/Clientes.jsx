import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Building,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Edit2,
  FolderOpen,
  Receipt,
  Users,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui";
import MobileTableCard from "@/components/ui/MobileTableCard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { clientesAPI } from "../services/api";
import { formatPhoneDisplay, formatCnpj } from "../utils/masks";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await clientesAPI.getAll();
      console.log("✅ Clientes carregados:", response.data.length);
      setClientes(response.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        console.log("🔑 Sessão expirada, redirecionando para login...");
        return;
      }

      console.error("❌ Erro ao carregar clientes:", err);

      let errorMessage = "Erro ao carregar clientes.";

      if (err.response) {
        if (err.response.status === 500) {
          errorMessage =
            "Erro no servidor. Verifique se o backend está rodando.";
        } else {
          errorMessage = `Erro ${err.response.status}: ${err.response.data?.message || ""}`;
        }
      } else if (err.request) {
        errorMessage =
          "Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3000";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cliente) => {
    const razaoSocial =
      cliente.razao_social || cliente.nome_fantasia || "Este cliente";
    if (
      !confirm(
        `Tem certeza que deseja excluir "${razaoSocial}"? Esta ação não pode ser desfeita.`,
      )
    )
      return;

    try {
      await clientesAPI.delete(cliente._id);
      setClientes(clientes.filter((c) => c._id !== cliente._id));
      toast.success("✅ Cliente excluído com sucesso!");
    } catch (err) {
      toast.error("❌ Erro ao excluir cliente.");
      console.error(err);
    }
  };

  const handleNavigateToDocuments = () => {
    toast.info("📁 Em breve: Documentos do cliente");
  };

  const handleGenerateReceipt = () => {
    toast.info("📄 Em breve: Gerar recibo de honorários");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Ativo":
        return "green";
      case "Inativo":
        return "gray";
      case "Suspenso":
        return "red";
      default:
        return "blue";
    }
  };

  const filteredClientes = clientes.filter((cliente) => {
    const term = searchTerm.toLowerCase();
    return (
      cliente.razao_social?.toLowerCase().includes(term) ||
      cliente.nome_fantasia?.toLowerCase().includes(term) ||
      cliente.cnpj?.includes(term)
    );
  });

  // Colunas para o componente MobileTableCard
  const mobileColumns = [
    { key: "razao_social", label: "Empresa" },
    { key: "cnpj", label: "CNPJ", render: (v) => formatCnpj(v) },
    {
      key: "status",
      label: "Status",
      badge: true,
      badgeColor: (v) => getStatusColor(v),
    },
    {
      key: "telefone",
      label: "Telefone",
      render: (_, row) =>
        row.contato_principal?.telefone
          ? formatPhoneDisplay(row.contato_principal.telefone)
          : "—",
    },
    {
      key: "email",
      label: "Email",
      render: (_, row) => row.contato_principal?.email || "—",
    },
    {
      key: "endereco",
      label: "Endereço",
      render: (_, row) => {
        const end = row.endereco;
        if (!end) return "—";
        const parts = [
          end.logradouro,
          end.numero,
          end.bairro,
          end.cidade,
          end.uf,
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "—";
      },
    },
  ];

  // Ações para mobile
  const mobileActions = [
    {
      label: "Ver Detalhes",
      icon: Eye,
      onClick: (row) => navigate(`/empresa/${row.cnpj.replace(/\D/g, "")}`),
    },
    {
      label: "Editar",
      icon: Edit2,
      onClick: (row) => navigate(`/empresa/${row.cnpj.replace(/\D/g, "")}`),
    },
    {
      label: "Documentos",
      icon: FolderOpen,
      onClick: () => handleNavigateToDocuments(),
    },
    {
      label: "Gerar Recibo",
      icon: Receipt,
      onClick: () => handleGenerateReceipt(),
    },
    {
      label: "Excluir",
      icon: Trash2,
      onClick: (row) => handleDelete(row),
      variant: "danger",
    },
  ];

  if (loading) {
    return (
      <div className="p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/60 font-medium">
            Carregando clientes...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-100 rounded-lg">
            <Users size={24} className="text-primary-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">
              Clientes
            </h1>
            <p className="text-sm text-secondary-500">
              Gerencie as empresas e acesse rapidamente seus dados fiscais
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate("/pesquisa/empresas")}
            className="flex-1 sm:flex-none"
          >
            <Search size={18} className="mr-2" />
            <span className="hidden sm:inline">Pesquisar</span>
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate("/clientes/novo")}
            className="flex-1 sm:flex-none"
          >
            <Plus size={18} className="mr-2" />
            <span className="hidden sm:inline">Novo Cliente</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive-50 border border-destructive-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-destructive-600 shrink-0 h-5 w-5 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-destructive-800">Erro!</h3>
              <p className="text-sm text-destructive-700 mt-1">{error}</p>
            </div>
            <button
              onClick={fetchClientes}
              className="text-destructive-600 hover:text-destructive-700 font-medium text-sm"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && clientes.length === 0 && (
        <div className="bg-white rounded-lg border border-secondary-200 shadow-sm">
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center">
            <Building size={64} className="text-secondary-300 mb-4" />
            <h3 className="text-xl font-bold text-secondary-900 mb-2">
              Nenhum cliente cadastrado
            </h3>
            <p className="text-secondary-500 mb-6">
              Comece adicionando uma nova empresa ao seu portfólio.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => navigate("/pesquisa/empresas")}
              >
                <Search size={20} className="mr-2" />
                Pesquisar
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate("/clientes/novo")}
              >
                <Plus size={20} className="mr-2" />
                Cadastrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabela e Filtros */}
      {clientes.length > 0 && (
        <div className="bg-white rounded-lg border border-secondary-200 shadow-sm overflow-hidden flex flex-col">
          {/* Barra de Pesquisa */}
          <div className="p-4 border-b border-secondary-200 bg-secondary-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Buscar por Razão Social, Fantasia ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 min-h-[44px] border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <p className="text-sm text-secondary-500 font-medium">
              {filteredClientes.length} de {clientes.length} clientes
            </p>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-3 space-y-2">
            <MobileTableCard
              data={filteredClientes}
              columns={mobileColumns}
              primaryField="razao_social"
              secondaryFields={["cnpj", "status"]}
              detailFields={["telefone", "email", "endereco"]}
              actions={mobileActions}
              emptyMessage="Nenhum cliente encontrado"
              onRowClick={(row) =>
                navigate(`/empresa/${row.cnpj.replace(/\D/g, "")}`)
              }
              renderHeader={(row) => (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0 border border-primary-200">
                      <Building size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {row.razao_social || row.nome_fantasia || "Sem nome"}
                      </div>
                      {row.nome_fantasia &&
                        row.razao_social !== row.nome_fantasia && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {row.nome_fantasia}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
              renderDetails={(row) => (
                <div className="space-y-3">
                  {row.contato_principal?.telefone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone
                        size={14}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        {formatPhoneDisplay(row.contato_principal.telefone)}
                      </span>
                    </div>
                  )}
                  {row.contato_principal?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail
                        size={14}
                        className="text-slate-400 flex-shrink-0"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        {row.contato_principal.email}
                      </span>
                    </div>
                  )}
                  {row.endereco && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin
                        size={14}
                        className="text-slate-400 flex-shrink-0 mt-0.5"
                      />
                      <span className="text-slate-700 dark:text-slate-300">
                        {[
                          row.endereco.logradouro,
                          row.endereco.numero,
                          row.endereco.bairro,
                          row.endereco.cidade,
                          row.endereco.uf,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            />
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="bg-secondary-50 border-b border-secondary-200">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-secondary-700 text-sm">
                    Empresa
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-secondary-700 text-sm">
                    CNPJ
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-secondary-700 text-sm">
                    Telefone
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-secondary-700 text-sm">
                    Contato Principal
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-secondary-700 text-sm">
                    Status
                  </th>
                  <th className="px-5 py-3.5 font-semibold text-secondary-700 text-sm text-center">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {filteredClientes.map((cliente) => (
                  <tr
                    key={cliente._id}
                    className="bg-white hover:bg-secondary-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center">
                        <div
                          className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 font-bold border border-primary-200 cursor-pointer hover:bg-primary-200 transition-colors"
                          onClick={() =>
                            navigate(
                              `/empresa/${cliente.cnpj.replace(/\D/g, "")}`,
                            )
                          }
                        >
                          <Building size={18} />
                        </div>
                        <div>
                          <span
                            className="font-semibold text-secondary-900 cursor-pointer hover:text-primary-600 transition-colors"
                            onClick={() =>
                              navigate(
                                `/empresa/${cliente.cnpj.replace(/\D/g, "")}`,
                              )
                            }
                          >
                            {cliente.razao_social}
                          </span>
                          {cliente.nome_fantasia && (
                            <p className="text-xs text-secondary-500 mt-0.5">
                              {cliente.nome_fantasia}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-secondary-600 font-mono text-sm">
                      {formatCnpj(cliente.cnpj)}
                    </td>
                    <td className="px-5 py-4 text-secondary-600 text-sm">
                      {cliente.contato_principal?.telefone
                        ? formatPhoneDisplay(cliente.contato_principal.telefone)
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-secondary-500 text-sm">
                      {cliente.contato_principal?.email || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          cliente.status === "Ativo"
                            ? "bg-success-100 text-success-700"
                            : cliente.status === "Inativo"
                              ? "bg-secondary-100 text-secondary-600"
                              : "bg-destructive-100 text-destructive-700"
                        }`}
                      >
                        {cliente.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative flex justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Menu handler mantido para compatibilidade desktop
                          }}
                          className="p-2 hover:bg-secondary-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                          title="Opções"
                        >
                          <MoreVertical
                            size={18}
                            className="text-secondary-600"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
