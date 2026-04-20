import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

/**
 * Gera PDF a partir de conteúdo HTML
 * 
 * @param {string} html - Conteúdo HTML do documento
 * @param {string} filename - Nome do arquivo de saída
 */
export function generatePdfFromHtml(html, filename = 'documento.pdf') {
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 40],
    content: [
      { html: html },
    ],
  };

  pdfMake.createPdf(docDefinition).download(filename);
}

/**
 * Gera PDF com dados preenchidos
 * 
 * @param {Object} template - Template com conteúdo e placeholders
 * @param {Object} data - Dados para preencher
 * @param {string} filename - Nome do arquivo de saída
 */
export function generatePdfWithData(template, data, filename = 'documento.pdf') {
  let content = template.content;
  
  // Substituir placeholders
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    content = content.replace(regex, data[key] || '');
  });
  
  generatePdfFromHtml(content, filename);
}
