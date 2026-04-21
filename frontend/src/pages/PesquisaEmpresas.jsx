import { useState, useEffect } from "react";
import {
  Search,
  Building,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { clientesAPI } from "../services/api";
import { formatCnpj, formatPhoneByType, formatCpf } from "../utils/masks";

export default function PesquisaEmpresas() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState(null);
  const [saving, setSaving] = useState(null);
  const [savedCnpjs, setSavedCnpjs] = useState([]);
  const navigate = useNavigate();

  // Carregar clientes cadastrados ao montar
  useEffect(() => {
    carregarClientesCadastrados();
  }, []);

  async function carregarClientesCadastrados() {
    try {
      const response = await clientesAPI.getAll();
      const cnpjs = response.data.map((c) => c.cnpj.replace(/\D/g, ""));
      setSavedCnpjs(cnpjs);
    } catch (error) {
      console.error("Erro ao carregar clientes cadastrados:", error);
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResultados(null);
    try {
      const url = `https://bff.cnpja.com/search?query=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const data = await res.json();

      let allRecords = [];
      if (Array.isArray(data)) {
        allRecords = data;
      } else if (data.records && Array.isArray(data.records)) {
        allRecords = data.records;
      } else if (data.results && Array.isArray(data.results)) {
        allRecords = data.results;
      } else if (data.data && Array.isArray(data.data)) {
        allRecords = data.data;
      } else {
        allRecords = Object.values(data).find((v) => Array.isArray(v)) || [];
      }

      setResultados(allRecords);
    } catch (error) {
      console.error("Erro na busca:", error);
      toast.error("Erro ao buscar empresas. Tente novamente.");
      setResultados([]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSalvarCliente = async (item) => {
    const taxId = item.office?.taxId;
    if (!taxId) return;

    const cleanCnpj = taxId.replace(/\D/g, "");

    if (savedCnpjs.includes(cleanCnpj)) {
      toast.warning("Este CNPJ já está cadastrado no sistema!");
      return;
    }

    setSaving(cleanCnpj);

    try {
      // Usar endpoint fresh para buscar sempre das APIs externas (ignora cache)
      const response = await fetch(
        `/api/clientes/consulta-fresh/${cleanCnpj}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Erro ao consultar dados da empresa",
        );
      }

      const result = await response.json();
      if (!result.success || !result.data) {
        throw new Error("Dados inválidos recebidos da API");
      }

      const rawData = result.data;

      toast.success("Dados carregados! Redirecionando para cadastro...");
      setTimeout(() => {
        navigate("/clientes/novo", {
          state: { novoCliente: true, rawData },
        });
      }, 1500);
    } catch (err) {
      console.error("Erro ao buscar dados da empresa:", err);
      if (err.message.includes("429")) {
        toast.error(
          "Limite de requisições excedido. Aguarde e tente novamente.",
        );
      } else {
        toast.error(`Erro ao buscar dados: ${err.message}`);
      }
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Pesquisa de Empresas
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Busque por nome, razão social ou nome fantasia e adicione ao seu
          portfólio.
        </p>
      </div>

      {/* Barra de Pesquisa */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Ex: Padaria, Comercial Silva, Hub Tecnologia..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={16} />
            ) : (
              <Search className="mr-2" size={16} />
            )}
            {loading ? "Buscando..." : "Pesquisar"}
          </button>
        </div>
      </div>

      {/* Resultados */}
      {resultados !== null && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
          {/* Header da tabela */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              {resultados.length > 0
                ? `${resultados.length} resultado(s) encontrado(s)`
                : "Nenhum resultado encontrado."}
            </p>
          </div>

          {resultados.length > 0 && (
            <div
              className="overflow-y-auto flex-1"
              style={{ maxHeight: "calc(100vh - 300px)" }}
            >
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-10">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      CNPJ
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resultados.map((item, index) => {
                    const taxId = item.office?.taxId || "";
                    const saved = savedCnpjs.includes(taxId);
                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-400 font-medium text-center w-10">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 border border-blue-100">
                              <Building size={16} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                                {item.office?.company?.name || "N/A"}
                              </p>
                              <div className="flex items-center gap-1 mt-0.5 md:hidden">
                                <span className="text-xs font-mono text-gray-500">
                                  {taxId ? formatCnpj(taxId) : ""}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-sm font-mono text-gray-600">
                            {taxId ? formatCnpj(taxId) : "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/empresa/${taxId}`)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Eye size={14} className="mr-1.5" />
                              <span className="hidden sm:inline">Detalhes</span>
                            </button>
                            {saved ? (
                              <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg">
                                <CheckCircle size={14} className="mr-1.5" />
                                <span className="hidden sm:inline">
                                  Cadastrado
                                </span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleSalvarCliente(item)}
                                disabled={saving === taxId}
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {saving === taxId ? (
                                  <Loader2
                                    className="animate-spin mr-1.5"
                                    size={14}
                                  />
                                ) : (
                                  <CheckCircle size={14} className="mr-1.5" />
                                )}
                                <span className="hidden sm:inline">
                                  {saving === taxId
                                    ? "Cadastrando..."
                                    : "Cadastrar Cliente"}
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
