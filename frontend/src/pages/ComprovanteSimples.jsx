import { useState } from "react";
import { Search, Loader2, FileDown, Building2, Download, Info, XCircle } from "lucide-react";
import api from "../services/api";

export default function ComprovanteSimples() {
  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sucesso, setSucesso] = useState(null);

  const formatarCnpj = (value) => {
    const nums = value.replace(/\D/g, "").slice(0, 14);
    if (nums.length <= 2) return nums;
    if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`;
    if (nums.length <= 8) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`;
    if (nums.length <= 12) return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`;
    return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`;
  };

  const handleCnpjChange = (e) => {
    setCnpj(formatarCnpj(e.target.value));
    setError(null);
    setSucesso(null);
  };

  const handleGerarComprovante = async () => {
    const clean = cnpj.replace(/\D/g, "");
    if (clean.length !== 14) {
      setError("Informe um CNPJ válido com 14 dígitos.");
      return;
    }

    setLoading(true);
    setError(null);
    setSucesso(null);

    try {
      const response = await api.get(`/simples/certificate/${clean}`, {
        responseType: "blob",
      });

      // Recebe o PDF e faz download
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `comprovante-simples-${clean}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSucesso("Comprovante gerado e baixado com sucesso!");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleGerarComprovante();
  };

  return (
    <div className="p-4 md:p-6 xl:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
            <FileDown className="text-blue-600 dark:text-blue-400" size={28} />
          </div>
          Comprovante Simples Nacional
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 ml-14">
          Emissão do comprovante em PDF do registro no Simples Nacional e MEI
        </p>
      </div>

      {/* Campo de busca */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          CNPJ da Empresa
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={cnpj}
              onChange={handleCnpjChange}
              onKeyDown={handleKeyDown}
              placeholder="00.000.000/0000-00"
              className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
            />
          </div>
          <button
            onClick={handleGerarComprovante}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Download size={20} />
            )}
            {loading ? "Gerando..." : "Baixar PDF"}
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300">Erro ao gerar comprovante</p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Sucesso */}
      {sucesso && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <FileDown className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">{sucesso}</p>
          </div>
        </div>
      )}

      {/* Aviso */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3">
        <Info className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
        <div>
          <p className="font-semibold text-amber-800 dark:text-amber-300">Informações</p>
          <ul className="text-sm text-amber-700 dark:text-amber-400 mt-1 space-y-1">
            <li>• O comprovante é emitido diretamente do portal do Simples Nacional</li>
            <li>• Cada geração consome <strong>1 crédito</strong> da API Cnpja</li>
            <li>• O PDF contém a situação atual e dados da empresa</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
