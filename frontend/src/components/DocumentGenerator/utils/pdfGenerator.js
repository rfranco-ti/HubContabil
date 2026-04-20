/**
 * Utilitário para geração de PDF usando pdfmake
 * (Opcional - para geração programática de PDFs)
 * 
 * Para usar: npm install pdfmake
 */

// Importação condicional (pdfmake é opcional)
let pdfMake = null;

try {
  // Em ambiente browser
  if (typeof window !== 'undefined') {
    // pdfmake deve ser carregado via CDN ou bundle
    pdfMake = window.pdfMake;
  }
} catch (_e) {
  console.warn('pdfmake não disponível. Use react-to-print para impressão.');
}

/**
 * Gera PDF usando pdfmake (se disponível)
 * 
 * @param {Object} docDefinition - Definição do documento pdfmake
 * @param {string} fileName - Nome do arquivo
 * @returns {Promise<void>}
 */
export const generatePDF = async (docDefinition, fileName = 'documento.pdf') => {
  if (!pdfMake) {
    console.warn('pdfmake não está disponível. Use a impressão via browser.');
    return;
  }

  try {
    const pdf = pdfMake.createPdf(docDefinition);
    pdf.download(fileName);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};

/**
 * Cria definição de documento pdfmake para recibo
 * 
 * @param {Object} data - Dados do recibo
 * @returns {Object} Definição do documento
 */
export const createReciboDocDefinition = (data) => {
  return {
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 15],
    content: [
      {
        text: 'Recibo de Honorários',
        style: 'header',
        alignment: 'center'
      },
      {
        text: `Nº ${data.numero || '001'}`,
        alignment: 'right',
        margin: [0, 0, 0, 20]
      },
      {
        text: [
          'Recebemos de ',
          { text: data.clienteNome || '', bold: true },
          ', inscrito(a) no CPF/CNPJ sob nº ',
          { text: data.clienteDocumento || '', bold: true },
          ', a importância de ',
          { text: `R$ ${Number(data.valor || 0).toFixed(2)}`, bold: true },
          `, referente aos serviços contábeis do mês de ${data.referencia || ''}.`
        ],
        margin: [0, 20]
      },
      {
        text: `Emitido em ${new Date(data.dataEmissao).toLocaleDateString('pt-BR')}`,
        margin: [0, 30]
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 5, x2: 500, y2: 5 }],
        margin: [0, 40, 0, 10]
      },
      {
        text: data.contadorNome || '',
        bold: true,
        alignment: 'center'
      },
      {
        text: `CRC: ${data.contadorCRC || ''}`,
        alignment: 'center',
        fontSize: 10
      }
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 20]
      }
    }
  };
};

/**
 * Cria definição de documento pdfmake para termo de recebimento
 * 
 * @param {Object} data - Dados do termo
 * @returns {Object} Definição do documento
 */
export const createTermoRecebimentoDocDefinition = (data) => {
  const documentos = data.documentos || [];
  
  return {
    pageSize: 'A4',
    pageMargins: [15, 15, 15, 15],
    content: [
      {
        text: 'Termo de Recebimento de Documentos',
        style: 'header',
        alignment: 'center'
      },
      {
        text: [
          'Eu, ',
          { text: data.clienteNome || '', bold: true },
          ', CPF/CNPJ nº ',
          { text: data.clienteDocumento || '', bold: true },
          ', declaro que RECEBI de ',
          { text: data.empresaNome || '', bold: true },
          ' os documentos abaixo relacionados.'
        ],
        margin: [0, 30]
      },
      {
        text: 'DOCUMENTOS ENTREGUES:',
        bold: true,
        margin: [0, 20, 0, 10]
      },
      {
        ul: documentos.map(doc => ({ text: doc })),
        margin: [0, 0, 0, 30]
      },
      {
        text: `Data: ${new Date(data.dataRecebimento).toLocaleDateString('pt-BR')}`,
        margin: [0, 20]
      },
      {
        columns: [
          {
            width: '*',
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 200, y2: 5 }], margin: [0, 40, 0, 5] },
              { text: data.clienteNome || '', alignment: 'center' }
            ]
          },
          {
            width: '*',
            stack: [
              { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 200, y2: 5 }], margin: [0, 40, 0, 5] },
              { text: data.responsavelNome || '', alignment: 'center' }
            ]
          }
        ],
        margin: [0, 30]
      }
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 20]
      }
    }
  };
};

export default { generatePDF, createReciboDocDefinition, createTermoRecebimentoDocDefinition };
