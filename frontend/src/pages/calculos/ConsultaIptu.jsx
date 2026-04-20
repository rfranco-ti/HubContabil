import { useState, useRef, useEffect } from 'react';
import { Search, FileText, Download, Loader2, AlertCircle, MapPin, Printer, X, ChevronDown, Eye, ImageDown, Save } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Configuração correta do pdfmake (sem redefinir fontes)
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfFonts && pdfFonts.vfs) {
  pdfMake.vfs = pdfFonts.vfs;
}

export default function ConsultaIptu() {
  const [numeroIptu, setNumeroIptu] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalImageOpen, setModalImageOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleConsultar = async (e) => {
    e.preventDefault();
    if (!numeroIptu) {
      toast.error('Por favor, informe o número da inscrição do IPTU.');
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const response = await api.post('/rpa/iptu-salvador', { numeroIptu });
      if (response.data.sucesso) {
        setResultado(response.data);
        toast.success('Consulta realizada com sucesso!');
      } else {
        toast.error(response.data.message || 'Erro ao realizar consulta.');
      }
    } catch (error) {
      console.error('Erro na consulta:', error);
      const errorMsg = error.response?.data?.message || 'Erro ao conectar com o servidor.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Definição do PDF (exatamente como antes, com a tabela refinada)
  const gerarDocDefinition = (d) => {
    const widths = ['16%', '34%', '8%', '9%', '8%', '9%', '8%', '8%'];
    const linhaCompleta = (label, valor) => [
      { text: label, bold: true, fontSize: 10.5 },
      { text: valor, fontSize: 10.5, colSpan: 7 },
      {}, {}, {}, {}, {}, {}
    ];

    return {
      pageSize: 'A4',
      pageMargins: [11, 33.4, 27.5, 14.85],
      content: [
        { text: 'PMS - Prefeitura Municipal de Salvador', fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 3] },
        { text: 'Secretaria Municipal da Fazenda', fontSize: 12, alignment: 'center' },
        { text: 'Diretoria de Receita Municipal - Coordenadoria de Cadastro Imobiliários', fontSize: 10, alignment: 'center' },
        { text: d.titulo || 'CERTIDÃO DE DADOS CADASTRAIS', fontSize: 13, bold: true, alignment: 'center', margin: [0, 6, 0, 10] },
        {
          table: {
            widths,
            body: [
              linhaCompleta('Inscrição Imobiliária', d.inscricao),
              linhaCompleta('CIB', d.cib),
              linhaCompleta('Inscrição Imob. Mãe', d.inscMae || '-'),
              linhaCompleta('Contribuinte', d.contribuinte),
              linhaCompleta('CPF/CNPJ', d.cpfCnpj),
              [
                { text: 'Endereço', bold: true, fontSize: 10.5 },
                { text: d.endereco, fontSize: 10.5, colSpan: 3 }, {}, {},
                { text: 'Nº Métrico', bold: true, fontSize: 10.5 },
                { text: d.numMetrico, fontSize: 10.5 },
                { text: 'Nº de Porta', bold: true, fontSize: 10.5 },
                { text: d.numPorta, fontSize: 10.5 }
              ],
              [
                { text: 'Loteamento', bold: true, fontSize: 10.5 },
                { text: d.loteamento, fontSize: 10.5, colSpan: 3 }, {}, {},
                { text: 'Quadra', bold: true, fontSize: 10.5 },
                { text: d.quadra, fontSize: 10.5 },
                { text: 'Lote', bold: true, fontSize: 10.5 },
                { text: d.lote, fontSize: 10.5 }
              ],
              [
                { text: 'Conjunto', bold: true, fontSize: 10.5 },
                { text: d.conjunto, fontSize: 10.5, colSpan: 3 }, {}, {},
                { text: 'Edifício', bold: true, fontSize: 10.5 },
                { text: d.edificio, fontSize: 10.5 },
                { text: 'Bloco', bold: true, fontSize: 10.5 },
                { text: d.bloco, fontSize: 10.5 }
              ],
              [
                { text: 'Sub-Unidade', bold: true, fontSize: 10.5 },
                { text: `${d.subUnidadeCod} - ${d.subUnidadeNome}`, fontSize: 10.5 },
                { text: 'Nº Sub-Unidade', bold: true, fontSize: 10.5 },
                { text: d.numSubUnidade, fontSize: 10.5 },
                { text: 'Bairro', bold: true, fontSize: 10.5 },
                { text: d.bairro, fontSize: 10.5 },
                { text: 'CEP', bold: true, fontSize: 10.5 },
                { text: d.cep, fontSize: 10.5 }
              ],
              linhaCompleta('Complemento', d.complemento),
              ...[
                ['Área Terreno (m²)', d.areaTerreno],
                ['Fração Ideal', d.fracaoIdeal],
                ['Área Construída (m²)', d.areaConstruida],
                ['Área Total (m²)', d.areaTotal],
                ['Valor Venal IPTU', d.valorVenal],
                ['Tipo Imóvel', d.tipoImovel],
                ['Padrão Construtivo', d.padrao],
                ['Logradouro Tributário', d.logradouroTrib],
                ['Data Lançamento', d.dataLanc],
                ['Situação Cadastral', d.sitCadastral],
                ['Situação Fiscal (IPTU)', d.sitFiscal],
                ['Data de Emissão', d.dataEmissao]
              ].map(([label, valor]) => linhaCompleta(label, valor))
            ]
          },
          layout: {
            hLineWidth: () => 0.3,
            vLineWidth: () => 0.3,
            hLineColor: () => '#aaaaaa',
            vLineColor: () => '#aaaaaa',
            paddingTop: () => 3.5,
            paddingBottom: () => 3.5,
            paddingLeft: () => 2,
            paddingRight: () => 2
          }
        },
        { text: d.textoCertidao || '', fontSize: 9, alignment: 'justify', margin: [0, 10, 0, 6] },
        { text: d.codControle || '', fontSize: 10, bold: true, margin: [0, 0, 0, 5] },
        { text: d.textoRodape || '', fontSize: 8, alignment: 'center', margin: [0, 10, 0, 0] }
      ],
      defaultStyle: { font: 'Roboto', color: '#000000' }
    };
  };

  const downloadPDF = () => {
    if (!resultado?.dados) {
      toast.error('Dados estruturados não encontrados.');
      return;
    }
    try {
      const docDef = gerarDocDefinition(resultado.dados);
      pdfMake.createPdf(docDef).download(`certidao_iptu_${numeroIptu}.pdf`);
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar o PDF.');
    }
  };

  // Geração do HTML fiel à certidão original para impressão
  // AJUSTES: fonte reduzida em 0.3pt, padding direito na coluna "Nº de Porta"
  const gerarHtmlParaImpressao = (dados) => {
  if (!dados) return '';

  const estilos = `
    <style type="text/css">
      @page {
        size: A4 portrait;
        margin: 1.2cm 0.7cm 0.3cm 0.7cm;   /* margem inferior mínima */
      }
      body {
        margin: 0;
        font-family: 'Times New Roman', Times, serif;
        font-size: 11.2pt;
        line-height: 1.25;
        color: #000;
        background: white;
      }
      .PS_areaaForm {
        background-color: #F4EFE3;
        padding: 8px 12px;                 /* reduzido de 10px 12px */
        display: block;
      }
      .style1 { font-family: Arial, sans-serif; font-size: medium; text-align: center; }
      .style2 { font-family: Arial, sans-serif; font-size: large; font-weight: bold; }
      .style3 { text-align: center; }
      .style4 { font-family: Arial, sans-serif; font-size: small; }
      .style5 { width: 981px; font-size: 10.2pt; }
      .style6 { width: 988px; font-size: 9.2pt; }
      .style7 { width: 167px; padding-right: 8px; }
      .style8 { width: 111px; }
      .style9 { width: 85px; }
      .style10 { width: 88px; }
      .style11 { padding-top: 15px; padding-left: 20px; height: auto; }
      .style12 {
        width: 981px;
        font-family: 'Times New Roman', Times, serif;
        text-align: justify;
        padding-top: 10px;
        height: auto;
        font-size: 10.2pt;
      }
      .style13 { width: 157px; }
      table {
        border-collapse: collapse;
        width: 100%;
      }
      td {
        padding: 2px 4px;
        vertical-align: top;
      }
      strong, b {
        font-weight: 700;
      }
      p {
        margin: 2px 0;                     /* reduzido de 3px */
      }
    </style>
  `;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Certidão IPTU ${dados.inscricao || ''}</title>
  ${estilos}
</head>
<body>
  <div class="PS_areaaForm">
    <div id="ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_dvDadosCertidao">
      <div class="style3">
        <table>
          <tr>
            <td class="style3"></td>
            <td align="left">
              <span class="style2">PMS - Prefeitura Municipal de Salvador<br /></span>
              <span class="style4">Secretaria Municipal da Fazenda<br />
              <span class="style4">Diretoria de Receita Municipal - Coordenadoria de Cadastro Imobiliários<br />
              <b><span>${dados.titulo || 'Certidão de Dados Cadastrais Utilizados para Cálculo do IPTU 2026'}</span></b></span>
            </td>
          </tr>
        </table>
      </div>
      <br />
      <table cellpadding="5" cellspacing="0" style="width:100%">
        <tr><td class="style13"><strong>Incrição Imobiliária</strong></td><td colspan="7">${dados.inscricao || ''}</td></tr>
        <tr><td class="style13"><strong>CIB</strong></td><td colspan="7">${dados.cib || ''}</td></tr>
        <tr><td class="style13"><b>Inscrição Imob. Mãe</b></td><td colspan="7">${dados.inscMae || '-'}</td></tr>
        <tr><td class="style13"><strong>Contribuinte</strong></td><td colspan="7">${dados.contribuinte || ''}</td></tr>
        <tr><td class="style13"><b>CPF/CNPJ</b></td><td colspan="7">${dados.cpfCnpj || ''}</td></tr>
        <tr>
          <td class="style13"><strong>Endereço</strong></td>
          <td style="width:25%" colspan="3">${dados.endereco || ''}</td>
          <td class="style9"><b>Nº Métrico</b></td>
          <td>${dados.numMetrico || ''}</td>
          <td class="style10"><b>Nº de Porta</b></td>
          <td class="style7">${dados.numPorta || ''}</td>
        </tr>
        <tr>
          <td class="style13"><b>Loteamento</b></td>
          <td colspan="3">${dados.loteamento || ''}</td>
          <td class="style9"><b>Quadra</b></td>
          <td>${dados.quadra || ''}</td>
          <td class="style10"><b>Lote</b></td>
          <td class="style7">${dados.lote || ''}</td>
        </tr>
        <tr>
          <td class="style13"><b>Conjunto</b></td>
          <td colspan="3">${dados.conjunto || ''}</td>
          <td class="style9"><b>Edifício</b></td>
          <td>${dados.edificio || ''}</td>
          <td class="style10"><b>Bloco</b></td>
          <td class="style7">${dados.bloco || ''}</td>
        </tr>
        <tr>
          <td class="style13"><b>Sub-Unidade</b></td>
          <td style="width:20%">${dados.subUnidadeCod || ''} - ${dados.subUnidadeNome || ''}</td>
          <td style="width:14%" class="style8"><b>Nº Sub-Unidade</b></td>
          <td>${dados.numSubUnidade || ''}</td>
          <td class="style9"><b>Bairro</b></td>
          <td style="width:25%">${dados.bairro || ''}</td>
          <td class="style10"><b>CEP</b></td>
          <td class="style7">${dados.cep || ''}</td>
        </tr>
        <tr>
          <td class="style13"><b>Complemento</b></td>
          <td colspan="7">${dados.complemento || ''}</td>
        </tr>
        <tr><td class="style13"><b>Área Terreno(m²)</b></td><td colspan="7">${dados.areaTerreno || ''}</td></tr>
        <tr><td class="style13"><b>Fração Ideal</b></td><td colspan="7">${dados.fracaoIdeal || ''}</td></tr>
        <tr><td class="style13"><b>Área Construida(m²)</b></td><td colspan="7">${dados.areaConstruida || ''}</td></tr>
        <tr><td class="style13"><b>Área Total(m²)</b></td><td colspan="7">${dados.areaTotal || ''}</td></tr>
        <tr><td class="style13"><b>Valor Venal IPTU</b></td><td colspan="7">${dados.valorVenal || ''}</td></tr>
        <tr><td class="style13"><b>Tipo Imóvel</b></td><td colspan="7">${dados.tipoImovel || ''}</td></tr>
        <tr><td class="style13"><b>Padrão Construtivo</b></td><td colspan="7">${dados.padrao || ''}</td></tr>
        <tr><td class="style13"><b>Logradouro Tributário</b></td><td colspan="7">${dados.logradouroTrib || ''}</td></tr>
        <tr><td class="style13"><b>Data Lançamento</b></td><td colspan="7">${dados.dataLanc || ''}</td></tr>
        <tr><td class="style13"><b>Situação Cadastral</b></td><td colspan="7">${dados.sitCadastral || ''}</td></tr>
        <tr><td class="style13"><b>Situação Fiscal (IPTU)</b></td><td colspan="7">${dados.sitFiscal || ''}</td></tr>
        <tr><td class="style13"><b>Data de Emissão</b></td><td colspan="7">${dados.dataEmissao || ''}</td></tr>
      </table>
      <br />
      <table cellpadding="5" cellspacing="0">
        <tr><td class="style5" style="text-align: justify">${dados.textoCertidao || ''}</td></tr>
      </table>
      <table cellpadding="5" cellspacing="0">
        <tr><td class="style12" style="text-align: justify">${dados.codControle || ''}</td></tr>
        <tr><td class="style5">${dados.textoValidade || ''}</td></tr>
      </table>
      <p>&nbsp;</p><p>&nbsp;</p>
      <table cellpadding="5" cellspacing="0">
        <tr><td class="style6" style="text-align: justify">${dados.textoRodape || ''}</td></tr>
      </table>
    </div>
  </div>
</body>
</html>`;
};

  const imprimirFormulario = () => {
    if (!resultado?.dados) {
      toast.error('Dados não encontrados para impressão.');
      return;
    }

    const htmlContent = gerarHtmlParaImpressao(resultado.dados);
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          const onAfterPrint = () => document.body.removeChild(iframe);
          iframe.contentWindow.addEventListener('afterprint', onAfterPrint, { once: true });
          setTimeout(() => { if (iframe.parentNode) document.body.removeChild(iframe); }, 60000);
        } catch (err) {
          console.error('Erro ao imprimir:', err);
          toast.error('Falha ao abrir impressão.');
          document.body.removeChild(iframe);
        }
      }, 200);
    };
  };

  const downloadImagem = () => {
    if (!resultado?.imagemRenderizada) return;
    const link = document.createElement('a');
    link.href = resultado.imagemRenderizada;
    link.download = `print_iptu_${numeroIptu}.png`;
    link.click();
  };

  const abrirModalImagem = () => {
    setModalImageOpen(true);
    setDropdownOpen(false);
  };

  const DadosEstruturados = ({ dados }) => {
    if (!dados) return null;
    const campos = [
      { label: 'Inscrição Imobiliária', value: dados.inscricao },
      { label: 'CIB', value: dados.cib },
      { label: 'Inscrição Imob. Mãe', value: dados.inscMae || '-' },
      { label: 'Contribuinte', value: dados.contribuinte },
      { label: 'CPF/CNPJ', value: dados.cpfCnpj },
      { label: 'Endereço', value: dados.endereco },
      { label: 'Nº Métrico', value: dados.numMetrico },
      { label: 'Nº de Porta', value: dados.numPorta },
      { label: 'Loteamento', value: dados.loteamento },
      { label: 'Quadra', value: dados.quadra || '-' },
      { label: 'Lote', value: dados.lote || '-' },
      { label: 'Conjunto', value: dados.conjunto || '-' },
      { label: 'Edifício', value: dados.edificio || '-' },
      { label: 'Bloco', value: dados.bloco || '-' },
      { label: 'Sub-Unidade', value: `${dados.subUnidadeCod} - ${dados.subUnidadeNome}` },
      { label: 'Nº Sub-Unidade', value: dados.numSubUnidade },
      { label: 'Bairro', value: dados.bairro },
      { label: 'CEP', value: dados.cep },
      { label: 'Complemento', value: dados.complemento || '-' },
      { label: 'Área Terreno (m²)', value: dados.areaTerreno },
      { label: 'Fração Ideal', value: dados.fracaoIdeal },
      { label: 'Área Construída (m²)', value: dados.areaConstruida },
      { label: 'Área Total (m²)', value: dados.areaTotal },
      { label: 'Valor Venal IPTU', value: dados.valorVenal },
      { label: 'Tipo Imóvel', value: dados.tipoImovel },
      { label: 'Padrão Construtivo', value: dados.padrao },
      { label: 'Logradouro Tributário', value: dados.logradouroTrib },
      { label: 'Data Lançamento', value: dados.dataLanc },
      { label: 'Situação Cadastral', value: dados.sitCadastral },
      { label: 'Situação Fiscal (IPTU)', value: dados.sitFiscal },
      { label: 'Data de Emissão', value: dados.dataEmissao },
      { label: 'Código de Controle', value: dados.codControle }
    ];

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Dados da Certidão
          </h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campos.map((campo, idx) => (
            <div key={idx} className="flex flex-col border-b border-gray-100 pb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{campo.label}</span>
              <span className="text-sm text-gray-800 font-medium mt-0.5 break-words">{campo.value || '—'}</span>
            </div>
          ))}
        </div>
        {dados.textoCertidao && (
          <div className="px-6 pb-6">
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 border border-gray-200">
              <p className="font-semibold mb-2 text-gray-900">Ressalva:</p>
              <p className="leading-relaxed">{dados.textoCertidao}</p>
            </div>
          </div>
        )}
        {dados.textoRodape && (
          <div className="px-6 pb-6 text-center text-xs text-gray-500 italic">
            {dados.textoRodape}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {modalImageOpen && resultado?.imagemRenderizada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-300">
          <button
            onClick={() => setModalImageOpen(false)}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="max-w-6xl w-full max-h-[90vh] flex flex-col gap-4">
            <div className="flex justify-end gap-2">
              <button
                onClick={downloadImagem}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
              >
                <Save className="w-5 h-5" />
                Salvar Imagem
              </button>
            </div>
            <div className="bg-white rounded-xl overflow-auto flex justify-center p-2">
              <img
                src={resultado.imagemRenderizada}
                alt="Página original da certidão"
                className="max-w-none h-auto"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-blue-600" />
            Consulta IPTU Salvador
          </h1>
          <p className="text-gray-500 mt-2">
            Robô RPA para extração de dados cadastrais e emissão de espelho do IPTU.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <form onSubmit={handleConsultar} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label htmlFor="iptu" className="block text-sm font-semibold text-gray-700">
                Número da Inscrição (IPTU)
              </label>
              <div className="relative">
                <input
                  id="iptu"
                  type="text"
                  placeholder="Ex: 123456-7"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  value={numeroIptu}
                  onChange={(e) => setNumeroIptu(e.target.value)}
                  disabled={loading}
                />
                <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Consultar IPTU
                </>
              )}
            </button>
          </form>
        </div>

        {resultado && (
          <div className="p-6 sm:p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-md"
              >
                <Download className="w-5 h-5" />
                Baixar PDF
              </button>

              <button
                onClick={imprimirFormulario}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-200"
              >
                <Printer className="w-5 h-5" />
                Imprimir Formulário
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-200"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  Mais Opções
                </button>
                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => { downloadImagem(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ImageDown className="w-4 h-4 text-blue-500" />
                      Baixar Imagem (PNG)
                    </button>
                    <button
                      onClick={abrirModalImagem}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-indigo-500" />
                      Visualizar Página Original
                    </button>
                  </div>
                )}
              </div>
            </div>

            <DadosEstruturados dados={resultado.dados} />

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-bold">Aviso Legal</p>
                <p>Os dados acima foram extraídos automaticamente do portal oficial da SEFAZ Salvador. A precisão das informações depende da disponibilidade e atualização do sistema governamental.</p>
              </div>
            </div>
          </div>
        )}

        {!resultado && !loading && (
          <div className="p-20 text-center space-y-4">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-10 h-10 text-blue-300" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Aguardando Consulta</h3>
              <p className="text-gray-500">Informe o número da inscrição imobiliária para iniciar o robô.</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-600" />
          </div>
          <h4 className="font-bold text-gray-900">Automação RPA</h4>
          <p className="text-sm text-gray-500">O robô navega, preenche e extrai os dados simulando um usuário humano.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="font-bold text-gray-900">PDF Profissional</h4>
          <p className="text-sm text-gray-500">Download de PDF com layout fiel à certidão oficial.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Printer className="w-6 h-6 text-blue-600" />
          </div>
          <h4 className="font-bold text-gray-900">Impressão Integrada</h4>
          <p className="text-sm text-gray-500">Impressão direta sem sair do sistema, com layout idêntico ao portal.</p>
        </div>
      </div>
    </div>
  );
}