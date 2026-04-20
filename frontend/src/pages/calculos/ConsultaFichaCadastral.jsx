// frontend/src/pages/calculos/ConsultaFichaCadastral.jsx
import { useState, useEffect } from 'react';
import InputMask from 'react-input-mask';
import {
  Search, Download, Loader2, Printer, X, ZoomIn, Save,
  Building2, Building, Eye, ChevronDown, ChevronUp, MapPin,
  Activity, Copy, Check, History, ExternalLink, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

if (pdfFonts?.pdfMake?.vfs) pdfMake.vfs = pdfFonts.pdfMake.vfs;
else if (pdfFonts?.vfs) pdfMake.vfs = pdfFonts.vfs;

const CACHE_KEY = 'ficha_cadastral_cache';
const CACHE_TTL_HOURS = 12;
const HISTORY_KEY = 'ficha_cadastral_history';

const loadCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const cache = JSON.parse(raw);
    const now = Date.now();
    const valid = {};
    Object.entries(cache).forEach(([cnpj, entry]) => {
      if (now - entry.timestamp < CACHE_TTL_HOURS * 3600000) valid[cnpj] = entry;
    });
    localStorage.setItem(CACHE_KEY, JSON.stringify(valid));
    return valid;
  } catch { return {}; }
};

const saveToCache = (cnpj, data) => {
  const cache = loadCache();
  cache[cnpj] = { data, timestamp: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

const loadHistory = () => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
};

const saveToHistory = (cnpj, razaoSocial) => {
  const history = loadHistory().filter(h => h.cnpj !== cnpj);
  history.unshift({ cnpj, razaoSocial, timestamp: Date.now() });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
};

// ========== FUNÇÕES DE FORMATAÇÃO ==========
const limparNumeros = (valor) => (valor || '').replace(/\D/g, '');

const formatarCNPJ = (valor) => {
  const nums = limparNumeros(valor);
  if (nums.length !== 14) return valor;
  return nums.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

const formatarCEP = (valor) => {
  const nums = limparNumeros(valor);
  if (nums.length !== 8) return valor;
  return nums.replace(/^(\d{5})(\d{3})$/, '$1-$2');
};

const formatarTelefone = (valor) => {
  const nums = limparNumeros(valor);
  if (nums.length < 10) return valor;
  
  const ddd = nums.substring(0, 2);
  const numero = nums.substring(2);
  const primeiroDigito = numero.charAt(0);
  const ehCelular = ['6', '7', '8', '9'].includes(primeiroDigito);
  
  if (ehCelular) {
    let numSemDDD = numero;
    if (numSemDDD.length === 8) numSemDDD = '9' + numSemDDD;
    if (numSemDDD.length === 9) {
      return `(${ddd}) ${numSemDDD.replace(/^(\d)(\d{4})(\d{4})$/, '$1 $2-$3')}`;
    }
  } else {
    if (numero.length === 8) {
      return `(${ddd}) ${numero.replace(/^(\d{4})(\d{4})$/, '$1-$2')}`;
    }
  }
  return valor;
};

// Componente InfoRow que aceita rawValue para cópia
const InfoRow = ({ label, value, rawValue, badge }) => {
  const [copied, setCopied] = useState(false);
  const displayValue = value || '—';
  const copyValue = rawValue !== undefined ? rawValue : value;
  
  const handleCopy = () => {
    navigator.clipboard?.writeText(copyValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success(`${label} copiado!`);
  };
  
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-100 pb-2 group">
      <span className="text-gray-500 font-medium">{label}:</span>
      <div className="flex items-center gap-2">
        {badge ? (
          <span className={`font-semibold ${badge === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {displayValue}
          </span>
        ) : (
          <span className="text-gray-800 font-semibold">{displayValue}</span>
        )}
        {copyValue && (
          <button onClick={handleCopy} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
};

const Card = ({ title, icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
      {icon} {title}
    </h3>
    {children}
  </div>
);

export default function ConsultaFichaCadastral() {
  const [cnpj, setCnpj] = useState('');
  const [forceRefresh, setForceRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [resultado, setResultado] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [history, setHistory] = useState(loadHistory());

  useEffect(() => {
    setHistory(loadHistory());
  }, [resultado]);

  const handleConsultar = async (e, cnpjFromHistory = null) => {
    if (e) e.preventDefault();
    const targetCnpj = (cnpjFromHistory || cnpj).replace(/\D/g, '');
    if (targetCnpj.length !== 14) {
      toast.error('CNPJ inválido.');
      return;
    }

    if (!forceRefresh) {
      const cache = loadCache();
      if (cache[targetCnpj]) {
        toast.success('Dados recuperados do cache local.');
        setResultado(cache[targetCnpj].data);
        return;
      }
    }

    setLoading(true);
    setResultado(null);
    
    const messages = [
      '🚀 Iniciando navegador...',
      '🌐 Acessando portal da SEFAZ...',
      '📝 Preenchendo formulário...',
      '🔍 Consultando CNPJ...',
      '📄 Baixando ficha cadastral...',
      '🤖 Processando OCR...',
    ];
    
    let msgIndex = 0;
    setLoadingMessage(messages[0]);
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setLoadingMessage(messages[msgIndex]);
    }, 4000);

    try {
      const response = await api.post('/rpa/ficha-cadastral', { cnpj: targetCnpj, forceRefresh });
      clearInterval(interval);
      if (response.data.sucesso) {
        setResultado(response.data);
        saveToCache(targetCnpj, response.data);
        const razao = response.data.dados?.razaoSocial || '';
        saveToHistory(targetCnpj, razao);
        toast.success('Consulta realizada com sucesso!');
      } else {
        toast.error(response.data.message || 'Erro.');
      }
    } catch (error) {
      clearInterval(interval);
      const msg = error.response?.data?.message || 'Erro na consulta.';
      toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const gerarDocDefinition = (d) => ({
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 60],
    header: { text: 'FICHA CADASTRAL RESUMIDA - SALVADOR/BA', alignment: 'center', margin: [0,20,0,0], fontSize:10, color:'#666' },
    content: [
      { text: 'Prefeitura Municipal de Salvador', style: 'header' },
      { text: 'Secretaria Municipal da Fazenda', style: 'subheader' },
      { canvas: [{ type: 'line', x1:0, y1:5, x2:515, y2:5, lineWidth:1, lineColor:'#3b82f6' }] },
      { text: '\n' },
      {
        style: 'tableExample',
        table: {
          widths: ['30%','70%'],
          body: [
            [{ text: 'DADOS DA EMPRESA', colSpan:2, style: 'tableHeader' }, {}],
            ['Inscrição Municipal (CGA)', { text: d.inscricao, bold:true }],
            ['CNPJ', { text: formatarCNPJ(d.cnpj), bold:true }],
            ['Razão Social', d.razaoSocial],
            ['Nome Fantasia', d.nomeFantasia],
            ['Situação Cadastral', { text: d.situacao, color: d.situacao?.includes('Ativa')?'green':'red', bold:true }],
            ['Data Início Atividade', d.dataInicio],
            ['Tipo de Unidade', d.tipoUnidade],
            ['Forma de Atuação', d.formaAtuacao],
            ['Tipo de Constituição', d.tipoConstituicao],
            ['Nº TVL', d.numeroTVL],
            ['Validade TVL', d.validadeTVL],
          ]
        },
        layout: 'lightHorizontalLines'
      },
      { text: '\n' },
      {
        style: 'tableExample',
        table: {
          widths: ['30%','70%'],
          body: [
            [{ text: 'ENDEREÇO', colSpan:2, style: 'tableHeader' }, {}],
            ['Logradouro', d.logradouro],
            ['Número', d.numero || 'S/N'],
            ['Complemento', d.complemento],
            ['Bairro', d.bairro],
            ['CEP', formatarCEP(d.cep)],
            ['Cidade', 'Salvador'],
            ['UF', 'BA'],
            ['Edifício', d.edificio || '—'],
          ]
        },
        layout: 'lightHorizontalLines'
      },
      { text: '\n' },
      {
        style: 'tableExample',
        table: {
          widths: ['30%','70%'],
          body: [
            [{ text: 'CONTATO', colSpan:2, style: 'tableHeader' }, {}],
            ['Telefone', formatarTelefone(d.telefone)],
            ['E-mail', d.email],
          ]
        },
        layout: 'lightHorizontalLines'
      },
      { text: '\n\n' },
      { text: 'Documento gerado automaticamente pelo sistema HubContabil.', fontSize:8, italic:true, alignment:'center' }
    ],
    styles: {
      header: { fontSize:18, bold:true, alignment:'center', color:'#1e3a8a' },
      subheader: { fontSize:14, alignment:'center', margin:[0,0,0,10] },
      tableHeader: { bold:true, fontSize:12, color:'white', fillOpacity:1, fillColor:'#1e3a8a', margin:[5,2,5,2] },
      tableExample: { margin:[0,5,0,15], fontSize:10 }
    }
  });

  const normalizePdfUrl = (pdfUrl) => {
    if (!pdfUrl) return null;
    if (pdfUrl.startsWith('/temp/pdfs/')) return pdfUrl.replace('/temp/pdfs/', '/api/temp/pdfs/');
    return pdfUrl;
  };

  const getAbsolutePdfUrl = (pdfUrl) => {
    if (!pdfUrl) return null;
    const normalized = normalizePdfUrl(pdfUrl);
    if (/^https?:\/\//i.test(normalized)) return normalized;
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    const origin = /^https?:\/\//i.test(apiBase) ? new URL(apiBase).origin : window.location.origin;
    return `${origin}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
  };

  const extractFileNameFromContentDisposition = (cd) => {
    if (!cd) return null;
    const utf8 = cd.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    if (utf8?.[1]) {
      try { return decodeURIComponent(utf8[1]); } catch { return utf8[1]; }
    }
    const ascii = cd.match(/filename\s*=\s*"([^"]+)"/i) || cd.match(/filename\s*=\s*([^;]+)/i);
    return ascii?.[1]?.trim() || null;
  };

  const fetchPdfBlob = async ({ download } = { download: false }) => {
    if (!resultado?.pdfUrl) throw new Error('URL do PDF não disponível.');
    const absoluteUrl = getAbsolutePdfUrl(normalizePdfUrl(resultado.pdfUrl));
    const url = new URL(absoluteUrl);
    if (download) url.searchParams.set('download', '1');

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Falha ao baixar o arquivo.');
    const blob = await response.blob();
    return {
      blob,
      contentDisposition: response.headers.get('content-disposition'),
    };
  };

  const downloadPDF = async () => {
    try {
      const { blob, contentDisposition } = await fetchPdfBlob({ download: true });
      const filename =
        extractFileNameFromContentDisposition(contentDisposition)
        || `ficha_cadastral_${resultado?.dados?.cnpj || 'consulta'}.pdf`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Download iniciado.');
    } catch (error) {
      console.error('Erro no download:', error);
      toast.error('Erro ao baixar PDF.');
    }
  };

  const viewPDFInline = () => {
    if (!resultado?.pdfUrl) return;
    setShowPdfViewer(true);
  };

  const imprimirPDF = () => {
    if (!resultado?.dados) return;
    pdfMake.createPdf(gerarDocDefinition(resultado.dados)).print();
  };

  const saveImage = () => {
    if (!resultado?.imagemRenderizada) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${resultado.imagemRenderizada}`;
    link.download = `ficha_preview_${cnpj}.png`;
    link.click();
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
    toast.info('Histórico limpo.');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      {isImageModalOpen && resultado?.imagemRenderizada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setIsImageModalOpen(false)}>
          <button className="absolute top-6 right-6 text-white"><X size={32} /></button>
          <div className="max-w-5xl w-full max-h-[90vh] bg-white rounded-xl overflow-auto p-2">
            <img src={`data:image/png;base64,${resultado.imagemRenderizada}`} alt="Preview" className="max-w-none h-auto" />
          </div>
        </div>
      )}

      {showPdfViewer && resultado?.pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-xl overflow-hidden">
            <button
              onClick={() => setShowPdfViewer(false)}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 shadow"
            >
              <X size={24} />
            </button>
            <iframe
              src={getAbsolutePdfUrl(resultado.pdfUrl)}
              className="w-full h-full"
              title="PDF Original"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            Ficha Cadastral Salvador
          </h1>
          <p className="text-gray-500 mt-2">Consulta automatizada com cache inteligente (12h).</p>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <History size={18} className="text-gray-400" />
            <select
              className="text-sm border rounded-lg px-3 py-1.5 bg-white"
              onChange={(e) => e.target.value && handleConsultar(null, e.target.value)}
              defaultValue=""
            >
              <option value="">Histórico</option>
              {history.map(h => (
                <option key={h.cnpj} value={h.cnpj}>{formatarCNPJ(h.cnpj)} - {h.razaoSocial?.substring(0,20)}</option>
              ))}
            </select>
            <button onClick={clearHistory} className="text-xs text-gray-400 hover:text-red-500">limpar</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <form onSubmit={handleConsultar} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
              <div className="flex-1 space-y-2 w-full">
                <label className="block text-sm font-semibold text-gray-700">CNPJ da Empresa</label>
                <div className="relative">
                  <InputMask
                    mask="99.999.999/9999-99"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    disabled={loading}
                  >
                    {(inputProps) => (
                      <input
                        {...inputProps}
                        type="text"
                        placeholder="00.000.000/0000-00"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    )}
                  </InputMask>
                  <Building className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="w-full md:w-auto">
                {loading ? (
                  <button
                    disabled
                    className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 opacity-90 cursor-wait"
                  >
                    <Loader2 className="animate-spin" size={20} />
                    {loadingMessage || 'Processando...'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Search size={20} />
                    Consultar
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={forceRefresh}
                  onChange={(e) => setForceRefresh(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <RefreshCw size={16} className={forceRefresh ? 'text-blue-600' : 'text-gray-400'} />
                Forçar nova consulta (ignorar cache)
              </label>
            </div>
          </form>
        </div>

        {resultado && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap gap-3">
              <button onClick={downloadPDF} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:bg-green-700">
                <Download size={18} /> Baixar PDF
              </button>
              <button onClick={viewPDFInline} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold border hover:bg-gray-200">
                <ExternalLink size={18} /> Visualizar PDF
              </button>
              <button onClick={imprimirPDF} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold border hover:bg-gray-200">
                <Printer size={18} /> Imprimir
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <Card title="Identificação" icon={<Building2 className="text-blue-500" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Razão Social" value={resultado.dados.razaoSocial} />
                  <InfoRow label="Nome Fantasia" value={resultado.dados.nomeFantasia} />
                  <InfoRow label="CNPJ" value={formatarCNPJ(resultado.dados.cnpj)} rawValue={limparNumeros(resultado.dados.cnpj)} />
                  <InfoRow label="Inscrição Municipal (CGA)" value={resultado.dados.inscricao} rawValue={limparNumeros(resultado.dados.inscricao)} />
                  <InfoRow label="Situação" value={resultado.dados.situacao} badge={resultado.dados.situacao?.toLowerCase().includes('ativa') ? 'success' : 'danger'} />
                  <InfoRow label="Data Início Atividade" value={resultado.dados.dataInicio} />
                  <InfoRow label="Tipo de Unidade" value={resultado.dados.tipoUnidade} />
                  <InfoRow label="Forma de Atuação" value={resultado.dados.formaAtuacao} />
                  <InfoRow label="Tipo de Constituição" value={resultado.dados.tipoConstituicao} />
                  <InfoRow label="Nº TVL" value={resultado.dados.numeroTVL} />
                  <InfoRow label="Validade TVL" value={resultado.dados.validadeTVL} />
                </div>
              </Card>

              <Card title="Endereço" icon={<MapPin className="text-indigo-500" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Logradouro" value={resultado.dados.logradouro} />
                  <InfoRow label="Número" value={resultado.dados.numero} />
                  <InfoRow label="Edifício" value={resultado.dados.edificio || '—'} />
                  <InfoRow label="Complemento" value={resultado.dados.complemento} />
                  <InfoRow label="Bairro" value={resultado.dados.bairro} />
                  <InfoRow label="CEP" value={formatarCEP(resultado.dados.cep)} rawValue={limparNumeros(resultado.dados.cep)} />
                  <InfoRow label="Cidade" value="Salvador" />
                  <InfoRow label="UF" value="BA" />
                  
                </div>
              </Card>

              <Card title="Contato" icon={<Building2 className="text-green-500" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Telefone" value={formatarTelefone(resultado.dados.telefone)} rawValue={limparNumeros(resultado.dados.telefone)} />
                  <InfoRow label="Email" value={resultado.dados.email} />
                </div>
              </Card>

              <Card title="Atividades" icon={<Activity className="text-orange-500" />}>
                {resultado.dados.atividadePrincipal ? (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-2">Principal</h4>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-600" style={{ width: '35%' }}>Código</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-600" style={{ width: '52.5%' }}>Descrição</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-600" style={{ width: '12.5%' }}>Data Início</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="px-4 py-2 font-mono">{resultado.dados.atividadePrincipal.codigo}</td>
                            <td className="px-4 py-2 whitespace-pre-line">{resultado.dados.atividadePrincipal.descricao}</td>
                            <td className="px-4 py-2">{resultado.dados.atividadePrincipal.dataInicio}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <InfoRow label="CNAE Principal" value={resultado.dados.cnaePrincipal} />
                )}

                {resultado.dados.atividadesSecundarias?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Secundárias</h4>
                    <div className="overflow-x-auto border rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-600" style={{ width: '35%' }}>Código</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-600" style={{ width: '52.5%' }}>Descrição</th>
                            <th className="px-4 py-2 text41 text-left font-medium text-gray-600" style={{ width: '12.5%' }}>Data Início</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resultado.dados.atividadesSecundarias.map((atv, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-4 py-2 font-mono">{atv.codigo}</td>
                              <td className="px-4 py-2 whitespace-pre-line">{atv.descricao}</td>
                              <td className="px-4 py-2">{atv.dataInicio}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </Card>

              {resultado.dados.observacoes && (
                <Card title="Observações" icon={<Activity className="text-purple-500" />}>
                  <p className="text-gray-700 whitespace-pre-line">{resultado.dados.observacoes}</p>
                </Card>
              )}
            </div>

            <div className="border-t pt-4">
              <button onClick={() => setShowPreview(!showPreview)} className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 rounded-xl">
                <span className="font-semibold flex items-center gap-2"><Eye className="text-indigo-500" /> Visualizar página original da SEFAZ</span>
                {showPreview ? <ChevronUp /> : <ChevronDown />}
              </button>
              {showPreview && (
                <div className="mt-4 space-y-3">
                  <div className="cursor-zoom-in border rounded-xl overflow-hidden bg-gray-50" onClick={() => setIsImageModalOpen(true)}>
                    <img src={`data:image/png;base64,${resultado.imagemRenderizada}`} alt="Preview" className="w-full h-auto max-h-[400px] object-contain mx-auto" />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={saveImage} className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-800">
                      <Save size={16} /> Salvar imagem
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
