const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const PDFParser = require('pdf2json');
const { storage } = require('../config/supabase');

const BUCKET_DOCUMENTOS = 'documentos';

// Extrair texto de PDF usando pdf2json (puro JS, sem dependências externas)
function extractTextFromPdf(filePath) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataReady', (data) => {
      let text = '';
      if (data && data.Pages) {
        data.Pages.forEach(page => {
          if (page.Texts) {
            page.Texts.forEach(textItem => {
              if (textItem.R && textItem.R.length > 0) {
                textItem.R.forEach(r => {
                  text += decodeURIComponent(r.T) + ' ';
                });
              }
            });
          }
          text += '\n';
        });
      }
      resolve(text.trim());
    });

    pdfParser.on('pdfParser_dataError', (err) => {
      reject(new Error(err.parserError || 'Erro ao analisar PDF'));
    });

    pdfParser.loadPDF(filePath);
  });
}

// @desc    Receber arquivo de usuário e guardar no Supabase Storage
// @route   POST /api/ged/upload
const uploadDocumento = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum documento físico detectado.' });
    }

    // Ler arquivo local (temporário do multer)
    const fileBuffer = fs.readFileSync(req.file.path);

    // Gerar path no Supabase: ged/{timestamp}_{nome}
    const storagePath = `ged/${Date.now()}_${req.file.originalname}`;

    // Upload para Supabase Storage
    await storage.upload(BUCKET_DOCUMENTOS, storagePath, fileBuffer, {
      contentType: req.file.mimetype,
      upsert: false
    });

    // URL pública
    const publicUrl = storage.getPublicUrl(BUCKET_DOCUMENTOS, storagePath);

    // Remover arquivo local temporário
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      message: 'Documento arquivado com sucesso no Cofre Contábil.',
      filename: req.file.originalname,
      storagePath,
      url: publicUrl
    });
  } catch (error) {
    console.error('[GED Upload] Erro:', error);
    // Limpar arquivo local em caso de erro
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Erro crítico de Upload no GED', error: error.message });
  }
};

// @desc    Acionar IA para leitura ótica (OCR) de documentos contábeis
// @route   POST /api/ged/ocr
const executarOcr = async (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).json({ message: 'Necessário informar qual arquivo.' });

  // Para OCR, precisamos baixar do Supabase primeiro
  let localFilePath = null;

  try {
    console.log(`[OCR] Iniciando processamento: ${filename}`);

    // Se o filename parece um storagePath do Supabase, baixar primeiro
    let filePath;
    if (filename.startsWith('ged/') || filename.startsWith('clientes/')) {
      console.log(`[OCR] Baixando arquivo do Supabase...`);
      const fileBuffer = await storage.download(BUCKET_DOCUMENTOS, filename);

      // Salvar temporariamente
      const tempName = `temp_ocr_${Date.now()}_${path.basename(filename)}`;
      localFilePath = path.join(__dirname, '..', 'uploads', 'temp', tempName);
      const tempDir = path.dirname(localFilePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      fs.writeFileSync(localFilePath, fileBuffer);
      filePath = localFilePath;
    } else {
      // Arquivo local legado
      filePath = path.join(__dirname, '..', 'uploads', filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'Documento não localizado nos arquivos seguros.' });
      }
    }

    const ext = path.extname(filename).toLowerCase();
    let textoExtraido = '';
    let metodo = '';

    // Se for PDF, tentar extrair texto embutido primeiro (rápido)
    if (ext === '.pdf') {
      console.log(`[OCR] PDF detectado, tentando pdf2json...`);

      const texto = await extractTextFromPdf(filePath);

      if (texto && texto.length > 50) {
        textoExtraido = texto;
        metodo = 'pdf2json (texto embutido)';
        console.log(`[OCR] ✅ Texto extraído (pdf2json): ${textoExtraido.length} caracteres`);
      } else {
        // PDF escaneado → Usar RPA OCR.space
        console.log(`[OCR] ⚠️ PDF escaneado detectado, usando OCR.space RPA...`);
        const { processarOCR } = require('../services/ocrSpaceRPA');
        try {
          textoExtraido = await processarOCR(filePath);
          metodo = 'OCR.space RPA (PDF escaneado)';
          console.log(`[OCR] ✅ OCR.space: ${textoExtraido.length} caracteres`);
        } catch (rpaError) {
          console.error('[OCR] Falha no RPA:', rpaError.message);
          throw new Error(`PDF escaneado. OCR.space falhou: ${rpaError.message}`);
        }
      }
    } else {
      // Imagem direta (PNG, JPG, etc) - OCR com Tesseract
      console.log(`[OCR] Processando imagem direta...`);

      const { data: { text } } = await Tesseract.recognize(
        filePath,
        'por',
        { logger: m => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`) }
      );

      textoExtraido = text.trim();
      metodo = 'Tesseract OCR (imagem)';
    }

    res.json({
      message: 'OCR concluído com sucesso!',
      metodo: metodo,
      transcricao: textoExtraido,
      caracteres: textoExtraido.length
    });

  } catch (error) {
    console.error('[OCR] Erro:', error);
    res.status(500).json({
      message: 'Falha no motor de OCR.',
      error: error.message,
      dica: 'Certifique-se de que o arquivo é um PDF válido ou imagem (PNG/JPG).'
    });
  } finally {
    // Limpar arquivo temporário
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
};

module.exports = {
  uploadDocumento,
  executarOcr
};
