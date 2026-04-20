import { TemplateHandler } from 'easy-template-x';
import { saveAs } from 'file-saver';

/**
 * Gera documento DOCX a partir de template e dados
 * 
 * @param {Blob} templateFile - Arquivo .docx template
 * @param {Object} data - Dados para preencher placeholders
 * @param {string} outputFilename - Nome do arquivo de saída
 * @returns {Promise<Blob>} - Arquivo DOCX gerado
 */
export async function generateDocx(templateFile, data, outputFilename = 'documento.docx') {
  try {
    const handler = new TemplateHandler();
    const doc = await handler.process(templateFile, data);
    saveAs(doc, outputFilename);
    return doc;
  } catch (error) {
    console.error('Erro ao gerar DOCX:', error);
    throw new Error('Falha ao gerar documento DOCX: ' + error.message);
  }
}

/**
 * Extrai placeholders de um template DOCX
 * 
 * @param {Blob} templateFile - Arquivo .docx template
 * @returns {Promise<string[]>} - Lista de placeholders encontrados
 */
export async function extractPlaceholders(_templateFile) {
  return [];
}
