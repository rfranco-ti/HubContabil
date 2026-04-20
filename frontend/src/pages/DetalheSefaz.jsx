import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Building2, FileText, CheckCircle2, MapPin, Hash, ChevronDown, ChevronUp } from 'lucide-react';

export default function DetalheSefaz() {
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState(null);
  const [cnpj, setCnpj] = useState('');
  const [showTextoExtraido, setShowTextoExtraido] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    // Recupera os dados do estado da navegação
    if (location.state?.result) {
      setResult(location.state.result);
      setCnpj(location.state.cnpj || '');
    } else {
      // Se não houver estado, volta para a página anterior
      navigate('/robos/sefaz-ba');
    }
  }, [location, navigate]);

  const downloadImage = () => {
    if (!result?.imagemRenderizada) return;
    
    const link = document.createElement('a');
    link.href = result.imagemRenderizada;
    link.download = `sefaz-ba-${cnpj.replace(/\D/g, '')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPdf = async () => {
    if (!result?.pdfBase64) {
      alert('PDF não disponível para este resultado.');
      return;
    }
    
    try {
      setDownloadingPdf(true);
      
      // Converte base64 para Uint8Array
      const base64Data = result.pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Cria blob e faz download
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sefaz-ba-${cnpj.replace(/\D/g, '')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      alert('Erro ao baixar PDF. Tente novamente.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const parseSefazData = () => {
    if (!result?.texto_extraido) return null;

    const texto = result.texto_extraido;
    const dados = {
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      inscricaoEstadual: '',
      situacao: '',
      dataSituacao: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      municipio: '',
      uf: '',
      cep: '',
      telefone: '',
      email: '',
      cnae: '',
      dataInicioAtividade: ''
    };

    // Padrões de extração
    const patterns = {
      razaoSocial: /(?:Razão Social|Nome Empresarial):\s*(.+)/i,
      nomeFantasia: /(?:Nome Fantasia|Fantasia):\s*(.+)/i,
      cnpj: /CNPJ:\s*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{14})/i,
      inscricaoEstadual: /Inscrição(?: Estadual)?(?: IE)?:?\s*([\d.-]+|NÃO INSCRITO|ISENTO)/i,
      situacao: /Situação(?: do Cadastro)?:?\s*(.+?)(?:\n|$)/i,
      dataSituacao: /Data(?: da)?(?: Situação)?:?\s*(\d{2}\/\d{2}\/\d{4})/i,
      endereco: /(?:Endereço|Logradouro|Rua|Avenida|Av\.?):\s*(.+)/i,
      numero: /Número:\s*(\d+(?:-[A-Z])?|S\/N|SN)/i,
      complemento: /Complemento:\s*(.+)/i,
      bairro: /Bairro:\s*(.+)/i,
      municipio: /Município:\s*(.+)/i,
      uf: /UF:\s*([A-Z]{2})/i,
      cep: /CEP:\s*(\d{5}-\d{3}|\d{8})/i,
      telefone: /(?:Telefone|Tel\.?):\s*\(?(\d{2})\)?\s*(\d{4,5})[- ]?(\d{4})/i,
      email: /E-mail:\s*([\w.-]+@[\w.-]+\.\w+)/i,
      cnae: /CNAE(?: Principal)?:?\s*(\d{4}[-/]\d{2})?\s*-?\s*(.+)/i,
      dataInicioAtividade: /Data(?: de)?(?: Início das Atividades)?:?\s*(\d{2}\/\d{2}\/\d{4})/i
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const match = texto.match(pattern);
      if (match) {
        dados[key] = match[1]?.trim() || match[0].split(':')[1]?.trim() || '';
      }
    }

    // Tenta extrair CNAE de forma alternativa
    if (!dados.cnae) {
      const cnaeMatch = texto.match(/(\d{4}[-/]\d{2})\s*-[^-]/i);
      if (cnaeMatch) {
        dados.cnae = cnaeMatch[0].trim();
      }
    }

    return dados;
  };

  if (!result) {
    return null;
  }

  const dados = parseSefazData();

  return (
    <div className="p-4 md:p-8 overflow-y-auto">
      {/* Estilos de impressão */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            background: white !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .print-container {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
          }
          
          .print-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .print-header {
            border-bottom: 2px solid #1e40af !important;
            padding-bottom: 16px !important;
            margin-bottom: 24px !important;
          }
        }
      `}</style>

      {/* Header com botões de ação (não imprime) */}
      <div className="no-print flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 font-bold transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Voltar
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadImage}
            disabled={!result?.imagemRenderizada}
            className="flex items-center bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-md"
          >
            <Download size={16} className="mr-2" /> Baixar Print
          </button>
          <button
            onClick={downloadPdf}
            disabled={!result?.pdfBase64 || downloadingPdf}
            className="flex items-center bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-md"
          >
            <FileText size={16} className="mr-2" />
            {downloadingPdf ? 'Baixando...' : 'Baixar PDF'}
          </button>
        </div>
      </div>

      {/* Container Principal */}
      <div className="print-container bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-6">
        {/* Cabeçalho */}
        <div className="print-header flex items-center mb-6 pb-4 border-b border-slate-200">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl mr-5 flex-shrink-0">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800">Consulta Cadastral - SEFAZ Bahia</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              CNPJ: {cnpj || '—'} • {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>

        {/* Status da Consulta */}
        <div className="print-section bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
          <div className="flex items-center text-emerald-700 font-bold mb-2">
            <CheckCircle2 className="mr-2" size={20} /> Consulta Realizada com Sucesso
          </div>
          <p className="text-sm text-emerald-600">{result.message}</p>
        </div>

        {/* Dados Principais */}
        {dados && (
          <>
            <div className="print-section mb-6">
              <h2 className="text-lg font-black text-slate-800 flex items-center mb-4">
                <FileText size={20} className="mr-2 text-blue-600" /> Dados Cadastrais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoCard 
                  label="Razão Social" 
                  value={dados.razaoSocial || '—'} 
                  fullSpan={dados.razaoSocial?.length > 40}
                />
                {dados.nomeFantasia && (
                  <InfoCard label="Nome Fantasia" value={dados.nomeFantasia} fullSpan={dados.nomeFantasia.length > 40} />
                )}
                <InfoCard label="CNPJ" value={formatarCnpj(dados.cnpj) || formatarCnpj(cnpj)} />
                <InfoCard label="Inscrição Estadual" value={dados.inscricaoEstadual || '—'} />
                <InfoCard 
                  label="Situação Cadastral" 
                  value={dados.situacao || '—'} 
                  highlight={dados.situacao?.toLowerCase().includes('ativo')}
                />
                <InfoCard label="Data da Situação" value={formatarData(dados.dataSituacao)} />
                <InfoCard label="Início das Atividades" value={formatarData(dados.dataInicioAtividade)} />
              </div>
            </div>

            {/* Endereço */}
            {(dados.endereco || dados.bairro || dados.municipio) && (
              <div className="print-section mb-6">
                <h2 className="text-lg font-black text-slate-800 flex items-center mb-4">
                  <MapPin size={20} className="mr-2 text-blue-600" /> Endereço
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <InfoCard 
                    label="Logradouro" 
                    value={dados.endereco ? `${dados.endereco}, ${dados.numero || 'S/N'}` : '—'}
                    fullSpan
                  />
                  {dados.complemento && <InfoCard label="Complemento" value={dados.complemento} />}
                  <InfoCard label="Bairro" value={dados.bairro || '—'} />
                  <InfoCard label="Município" value={dados.municipio || '—'} />
                  <InfoCard label="UF" value={dados.uf || 'BA'} />
                  <InfoCard label="CEP" value={formatarCep(dados.cep)} />
                </div>
              </div>
            )}

            {/* Contatos */}
            {(dados.telefone || dados.email) && (
              <div className="print-section mb-6">
                <h2 className="text-lg font-black text-slate-800 flex items-center mb-4">
                  <FileText size={20} className="mr-2 text-blue-600" /> Contatos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dados.telefone && <InfoCard label="Telefone" value={formatarTelefone(dados.telefone)} />}
                  {dados.email && <InfoCard label="E-mail" value={dados.email} fullSpan />}
                </div>
              </div>
            )}

            {/* CNAE */}
            {dados.cnae && (
              <div className="print-section mb-6">
                <h2 className="text-lg font-black text-slate-800 flex items-center mb-4">
                  <Hash size={20} className="mr-2 text-blue-600" /> Atividade Econômica (CNAE)
                </h2>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <span className="text-sm font-bold text-slate-800">{dados.cnae}</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Texto Extraído Completo */}
        {result.texto_extraido && (
          <div className="print-section mb-6">
            <button
              onClick={() => setShowTextoExtraido(!showTextoExtraido)}
              className="w-full flex items-center justify-between bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-4 rounded-xl transition-all duration-200"
            >
              <div className="flex items-center">
                <FileText size={20} className="mr-2 text-blue-600" />
                Texto Extraído da Página
              </div>
              {showTextoExtraido ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showTextoExtraido && (
              <pre className="mt-4 text-xs text-slate-700 whitespace-pre-wrap font-mono bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-96 overflow-y-auto">
                {result.texto_extraido}
              </pre>
            )}
          </div>
        )}

        {/* Imagem do Print */}
        {result.imagemRenderizada && (
          <div className="print-section">
            <button
              onClick={() => setShowPrint(!showPrint)}
              className="w-full flex items-center justify-between bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-4 rounded-xl transition-all duration-200"
            >
              <div className="flex items-center">
                <Building2 size={20} className="mr-2 text-blue-600" />
                Print da Página Original
              </div>
              {showPrint ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showPrint && (
              <div className="mt-4 overflow-hidden rounded-lg shadow-sm border border-slate-200 print:shadow-none print:border">
                <img src={result.imagemRenderizada} alt="Print da Sefaz BA" className="w-full h-auto" />
              </div>
            )}
          </div>
        )}

        {/* PDF da Página Original */}
        {result.pdfBase64 && (
          <div className="print-section mt-6">
            <button
              onClick={() => setShowPdf(!showPdf)}
              className="w-full flex items-center justify-between bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 px-4 rounded-xl transition-all duration-200"
            >
              <div className="flex items-center">
                <FileText size={20} className="mr-2 text-blue-600" />
                PDF da Página Original
              </div>
              {showPdf ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showPdf && (
              <div className="mt-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-slate-600">
                      PDF da página original da SEFAZ BA gerado no momento da consulta.
                    </p>
                    <button
                      onClick={downloadPdf}
                      disabled={downloadingPdf}
                      className="inline-flex items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-sm px-4 py-2 rounded-xl transition-colors shadow-md"
                    >
                      <Download size={16} className="mr-2" />
                      {downloadingPdf ? 'Baixando...' : 'Baixar PDF'}
                    </button>
                  </div>
                  <div className="w-full h-[600px] bg-white rounded-lg border border-slate-200 overflow-hidden">
                    <iframe
                      src={`data:application/pdf;base64,${result.pdfBase64}`}
                      className="w-full h-full"
                      title="PDF da Página Original"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rodapé */}
        <div className="no-print mt-8 pt-6 border-t border-slate-200 text-center text-sm text-slate-500">
          <p>Documento gerado automaticamente em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, highlight, fullSpan }) {
  return (
    <div className={`bg-slate-50 p-4 rounded-xl border border-slate-100 ${fullSpan ? 'md:col-span-2 lg:col-span-3' : ''}`}>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-bold ${highlight ? 'text-emerald-600' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}

function formatarCnpj(cnpj) {
  if (!cnpj) return '—';
  const nums = cnpj.replace(/\D/g, '');
  if (nums.length !== 14) return cnpj;
  return `${nums.slice(0,2)}.${nums.slice(2,5)}.${nums.slice(5,8)}/${nums.slice(8,12)}-${nums.slice(12,14)}`;
}

function formatarData(data) {
  if (!data) return '—';
  // Se já estiver no formato DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return data;
  const d = new Date(data);
  if (isNaN(d.getTime())) return data;
  return d.toLocaleDateString('pt-BR');
}

function formatarCep(cep) {
  if (!cep) return '—';
  const nums = cep.replace(/\D/g, '');
  if (nums.length !== 8) return cep;
  return `${nums.slice(0,5)}-${nums.slice(5,8)}`;
}

function formatarTelefone(tel) {
  if (!tel) return '—';
  const nums = tel.replace(/\D/g, '');
  if (nums.length === 10) return `(${nums.slice(0,2)}) ${nums.slice(2,6)}-${nums.slice(6,10)}`;
  if (nums.length === 11) return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7,11)}`;
  return tel;
}
