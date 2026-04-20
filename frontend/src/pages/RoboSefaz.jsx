import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Play, CheckCircle2, Loader2, ArrowLeft, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RoboSefaz() {
  const navigate = useNavigate();
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const resultRef = useRef(null);

  const formatCnpj = (value) => {
    const nums = value.replace(/\D/g, '').slice(0, 14);
    return nums
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  };

  const runSefaz = async () => {
    if (cnpj.replace(/\D/g, '').length !== 14) return;
    setLoading(true);
    setResult(null);
    setShowResult(false);
    try {
      const res = await fetch('/api/rpa/sefaz-ba', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cnpj })
      });
      const data = await res.json();
      setResult(data);
      // Redireciona automaticamente para a página de detalhes
      if (data) {
        navigate('/robos/sefaz-ba/detalhes', { 
          state: { result: data, cnpj } 
        });
      }
    } catch { 
      setResult({ message: 'Erro na conexão com o Backend RPA.' }); 
    }
    setLoading(false);
  };

  const toggleResult = () => {
    setShowResult(!showResult);
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col overflow-y-auto">
      <div className="mb-6 md:mb-8">
        <Link
          to="/robos"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Voltar para Robôs
        </Link>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Consulta Cadastral - SEFAZ Bahia</h1>
        <p className="mt-1 text-slate-500 text-base md:text-lg">Cadastro de Contribuintes do ICMS.</p>
      </div>

      <div className="max-w-3xl">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl mr-5 flex-shrink-0">
              <Bot size={28} />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-slate-800">Robô de Consulta à SEFAZ BA</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Automatiza a consulta cadastral no site da SEFAZ Bahia.</p>
            </div>
          </div>

          <input
            type="text"
            placeholder="Digite o CNPJ (14 dígitos)"
            value={cnpj}
            onChange={(e) => setCnpj(formatCnpj(e.target.value))}
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium mb-4"
          />

          <button
            onClick={runSefaz}
            disabled={loading || cnpj.replace(/\D/g, '').length !== 14}
            className="w-full bg-slate-900 hover:bg-slate-800 focus:ring-4 focus:ring-slate-900/30 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Play className="mr-2" size={20} />}
            {loading ? 'Robô trabalhando (até 20 segs)...' : 'Executar Robô'}
          </button>

          {result && (
            <div className="mt-6" ref={resultRef}>
              <button
                onClick={toggleResult}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-4 rounded-xl flex items-center justify-center transition-all duration-200"
              >
                {showResult ? (
                  <>
                    <ChevronUp className="mr-2" size={20} />
                    Ocultar Resultado
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2" size={20} />
                    Ver Resultado da Consulta
                  </>
                )}
              </button>

              {showResult && (
                <div className="mt-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center text-emerald-600 font-bold mb-3 text-lg">
                    <CheckCircle2 className="mr-2" size={20} /> Resposta do Robô
                  </div>
                  <p className="text-sm text-slate-700 mb-2 font-medium">{result.message}</p>
                  {result.texto_extraido && (
                    <details className="mb-3">
                      <summary className="text-xs font-bold text-slate-500 uppercase cursor-pointer hover:text-slate-700">Ver Texto Extraído</summary>
                      <pre className="mt-2 text-xs text-slate-700 whitespace-pre-wrap font-mono bg-white p-3 rounded-lg border border-slate-100 max-h-48 overflow-y-auto">{result.texto_extraido}</pre>
                    </details>
                  )}
                  {result.imagemRenderizada && (
                    <div className="overflow-hidden rounded-lg shadow-sm border border-slate-200 mb-3">
                      <img src={result.imagemRenderizada} alt="Print da Sefaz BA" className="w-full h-auto" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
