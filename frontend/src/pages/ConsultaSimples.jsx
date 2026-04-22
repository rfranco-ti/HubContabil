import { useState } from "react";
import {
  Search,
  Loader2,
  BadgeCheck,
  XCircle,
  Calendar,
  Info,
  Building2,
  Download,
  FileCheck,
  Clock,
  AlertTriangle,
} from "lucide-react";
import api from "../services/api";

export default function ConsultaSimples() {
  const [cnpj, setCnpj] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);

  const formatarCnpj = (value) => {
    const nums = value.replace(/\D/g, "").slice(0, 14);
    if (nums.length <= 2) return nums;
    if (nums.length <= 5) return `${nums.slice(0, 2)}.${nums.slice(2)}`;
    if (nums.length <= 8)
      return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5)}`;
    if (nums.length <= 12)
      return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8)}`;
    return `${nums.slice(0, 2)}.${nums.slice(2, 5)}.${nums.slice(5, 8)}/${nums.slice(8, 12)}-${nums.slice(12)}`;
  };

  const handleCnpjChange = (e) => {
    setCnpj(formatarCnpj(e.target.value));
    setError(null);
    setResultado(null);
  };

  const handleConsulta = async () => {
    const clean = cnpj.replace(/\D/g, "");
    if (clean.length !== 14) {
      setError("Informe um CNPJ válido com 14 dígitos.");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const response = await api.get(`/simples/${clean}`);
      const result = response.data;

      setResultado(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleConsulta();
  };

  const formatarData = (v) => {
    if (!v) return "—";
    if (v.includes("T")) v = v.split("T")[0];
    if (v.includes("-")) {
      const [y, m, d] = v.split("-");
      return `${d}/${m}/${y}`;
    }
    return v;
  };

  return (
    <div className="p-4 md:p-6 xl:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-xl">
            <BadgeCheck
              className="text-emerald-600 dark:text-emerald-400"
              size={28}
            />
          </div>
          Simples Nacional
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 ml-14">
          Consulta de opção pelo Simples Nacional e MEI
        </p>
      </div>

      {/* Campo de busca */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          CNPJ da Empresa
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Building2
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              type="text"
              value={cnpj}
              onChange={handleCnpjChange}
              onKeyDown={handleKeyDown}
              placeholder="00.000.000/0000-00"
              className="w-full pl-11 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-lg font-mono"
            />
          </div>
          <button
            onClick={handleConsulta}
            disabled={loading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Search size={20} />
            )}
            {loading ? "Consultando..." : "Consultar"}
          </button>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <XCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-red-800 dark:text-red-300">
              Erro na consulta
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Aviso de créditos */}
      {!resultado && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Info className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              Atenção
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              Esta consulta utiliza a API <strong>Cnpja</strong> e consome{" "}
              <strong>1 crédito</strong> por consulta online. Dados em cache são
              gratuitos.
            </p>
          </div>
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="space-y-6">
          {/* Header do resultado */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck size={20} className="text-emerald-600" />
                Resultado da Consulta
              </h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> {formatarData(resultado.updated)}
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="font-mono">{resultado.taxId}</span>
              </div>
            </div>
            <button
              onClick={() =>
                window.open(
                  `/api/simples/certificate/${resultado.taxId}`,
                  "_blank",
                )
              }
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Download size={16} /> Comprovante PDF
            </button>
          </div>

          {/* Simples Nacional */}
          {resultado.simples && (
            <div
              className={`rounded-2xl border overflow-hidden ${
                resultado.simples.optant
                  ? "bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                  : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
              }`}
            >
              {/* Banner do status */}
              <div
                className={`p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                  resultado.simples.optant
                    ? "bg-emerald-100/50 dark:bg-emerald-900/20"
                    : "bg-slate-100/50 dark:bg-slate-700/30"
                }`}
              >
                <div
                  className={`p-3 rounded-xl ${
                    resultado.simples.optant
                      ? "bg-emerald-200 dark:bg-emerald-800/50"
                      : "bg-slate-200 dark:bg-slate-600"
                  }`}
                >
                  <BadgeCheck
                    size={28}
                    className={
                      resultado.simples.optant
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-slate-500 dark:text-slate-400"
                    }
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Simples Nacional
                  </h3>
                  <p
                    className={`text-sm font-medium ${
                      resultado.simples.optant
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {resultado.simples.optant
                      ? "Empresa optante"
                      : "Empresa não optante"}
                  </p>
                </div>
                <div
                  className={`text-xl font-black px-4 py-2 rounded-xl ${
                    resultado.simples.optant
                      ? "bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200"
                      : "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {resultado.simples.optant ? "✅ Sim" : "❌ Não"}
                </div>
              </div>

              {/* Datas */}
              <div className="p-5">
                {resultado.simples.optant ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-emerald-100 dark:border-emerald-900/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={14} className="text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                        Data de Inclusão
                      </span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                      {formatarData(resultado.simples.since)}
                    </p>
                  </div>
                ) : resultado.simples.history &&
                  resultado.simples.history.length > 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={14} className="text-amber-500" />
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        Empresa excluída do Simples Nacional
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase mb-1">
                          Data de Entrada
                        </p>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">
                          {formatarData(resultado.simples.history[0].from)}
                        </p>
                      </div>
                      <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3">
                        <p className="text-xs font-semibold text-red-500 uppercase mb-1">
                          Data de Exclusão
                        </p>
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">
                          {formatarData(
                            resultado.simples.history[
                              resultado.simples.history.length - 1
                            ].until,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 p-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Nenhum registro encontrado no Simples Nacional.
                    </p>
                  </div>
                )}

                {/* Histórico */}
                {resultado.simples.history &&
                  resultado.simples.history.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        Histórico Completo ({
                          resultado.simples.history.length
                        }{" "}
                        {resultado.simples.history.length === 1
                          ? "período"
                          : "períodos"}
                        )
                      </h4>
                      <div className="space-y-3">
                        {resultado.simples.history.map((h, i) => (
                          <div
                            key={i}
                            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden"
                          >
                            <div className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {formatarData(h.from)}
                                  </span>
                                </div>
                                <span className="text-slate-300 dark:text-slate-600">
                                  →
                                </span>
                                <div className="flex items-center gap-2 flex-1 justify-end">
                                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {formatarData(h.until)}
                                  </span>
                                  <div className="w-3 h-3 rounded-full bg-red-500" />
                                </div>
                              </div>
                              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase mb-1">
                                  Motivo da Exclusão
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  {h.text}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* SIMEI / MEI — só exibe se houver dados relevantes */}
          {resultado.simei &&
            (resultado.simei.optant ||
              resultado.simei.since ||
              (resultado.simei.history &&
                resultado.simei.history.length > 0)) && (
              <div
                className={`rounded-2xl border overflow-hidden ${
                  resultado.simei.optant
                    ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                    : "bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                }`}
              >
                {/* Banner do status */}
                <div
                  className={`p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                    resultado.simei.optant
                      ? "bg-blue-100/50 dark:bg-blue-900/20"
                      : "bg-slate-100/50 dark:bg-slate-700/30"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl ${
                      resultado.simei.optant
                        ? "bg-blue-200 dark:bg-blue-800/50"
                        : "bg-slate-200 dark:bg-slate-600"
                    }`}
                  >
                    <BadgeCheck
                      size={28}
                      className={
                        resultado.simei.optant
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-slate-500 dark:text-slate-400"
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      MEI (SIMEI)
                    </h3>
                    <p
                      className={`text-sm font-medium ${
                        resultado.simei.optant
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {resultado.simei.optant
                        ? "Empresa enquadrada no MEI"
                        : "Empresa não enquadrada no MEI"}
                    </p>
                  </div>
                  <div
                    className={`text-xl font-black px-4 py-2 rounded-xl ${
                      resultado.simei.optant
                        ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                        : "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {resultado.simei.optant ? "✅ Sim" : "❌ Não"}
                  </div>
                </div>

                {/* Datas */}
                <div className="p-5">
                  {resultado.simei.optant ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-blue-100 dark:border-blue-900/30 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock size={14} className="text-blue-600" />
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          Data de Inclusão
                        </span>
                      </div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {formatarData(resultado.simei.since)}
                      </p>
                    </div>
                  ) : resultado.simei.history &&
                    resultado.simei.history.length > 0 ? (
                    <div className="space-y-3">
                      {resultado.simei.history.map((h, i) => (
                        <div
                          key={i}
                          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 overflow-hidden"
                        >
                          <div className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2 flex-1">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  {formatarData(h.from)}
                                </span>
                              </div>
                              <span className="text-slate-300 dark:text-slate-600">
                                →
                              </span>
                              <div className="flex items-center gap-2 flex-1 justify-end">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                  {formatarData(h.until)}
                                </span>
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                              </div>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                              <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase mb-1">
                                Motivo da Exclusão
                              </p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">
                                {h.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 p-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Nenhum registro encontrado no MEI.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
