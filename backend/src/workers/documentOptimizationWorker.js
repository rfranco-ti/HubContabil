const { boss } = require('../services/queueService');
const prisma = require('../config/prisma');
const { storage } = require('../config/supabase');
const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const AdmZip = require('adm-zip');

const BUCKET_DOCUMENTOS = 'documentos';

async function optimizeImage(inputPath, outputPath) {
  await sharp(inputPath)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);
  return { mime: 'image/webp', ext: '.webp' };
}

async function optimizePdf(inputPath, outputPath) {
  try {
    const tempOcr = `${inputPath}_ocr.pdf`;
    // Skip OCR if it fails, but try GS
    try {
      await exec(`ocrmypdf --output-type pdfa --skip-text "${inputPath}" "${tempOcr}"`);
    } catch (err) {
      console.warn('[Worker] OCR failed or not available, falling back to original PDF', err.message);
      await fs.copyFile(inputPath, tempOcr);
    }
    
    try {
      await exec(`gs -sDEVICE=pdfwrite -dPDFSETTINGS=/ebook -dNOPAUSE -dBATCH -sOutputFile="${outputPath}" "${tempOcr}"`);
    } catch (gsErr) {
       console.warn('[Worker] Ghostscript failed or not available, copying temp file', gsErr.message);
       await fs.copyFile(tempOcr, outputPath);
    }
    
    await fs.unlink(tempOcr).catch(() => {});
  } catch (err) {
    console.error('[Worker] PDF Optimization failed entirely', err);
    throw err;
  }
  return { mime: 'application/pdf', ext: '.pdf' };
}

async function optimizeOffice(inputPath, outputPath) {
  const zip = new AdmZip(inputPath);
  const entries = zip.getEntries();
  
  for (const entry of entries) {
    if (entry.entryName.match(/\.(png|jpe?g)$/i)) {
      try {
        const optimizedBuffer = await sharp(entry.getData())
          .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
        zip.updateFile(entry.entryName, optimizedBuffer);
      } catch (err) {
        console.warn(`[Worker] Failed to optimize internal image ${entry.entryName}`, err.message);
      }
    }
  }
  
  zip.writeZip(outputPath);
  return null;
}

async function processOptimizationJob(job) {
  const { documentoId } = job.data;
  console.log(`[Worker] Iniciando otimização do documento ${documentoId}`);

  try {
    await prisma.documento.update({
      where: { id: documentoId },
      data: { status: 'PROCESSANDO' }
    });

    const doc = await prisma.documento.findUnique({ where: { id: documentoId } });
    if (!doc) throw new Error('Documento não encontrado');
    
    if (doc.tipo === 'certificado_digital' || doc.mimetype.includes('x509') || doc.mimetype.includes('pkcs12')) {
      console.log(`[Worker] Bypass certificado digital ${documentoId}`);
      await prisma.documento.update({ where: { id: documentoId }, data: { status: 'CONCLUIDO' } });
      return;
    }

    const { data, error } = await storage.download(BUCKET_DOCUMENTOS, doc.storagePath);
    if (error) throw new Error(`Falha no download: ${error.message}`);

    const buffer = Buffer.from(await data.arrayBuffer());
    
    const tempDir = path.join(__dirname, '../../temp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const inputPath = path.join(tempDir, `${documentoId}_in${path.extname(doc.storagePath)}`);
    const outputPathBase = path.join(tempDir, `${documentoId}_out`);
    
    await fs.writeFile(inputPath, buffer);
    let outputPath = outputPathBase + path.extname(doc.storagePath);
    let newMime = doc.mimetype;
    let newExt = path.extname(doc.storagePath);

    if (doc.mimetype.startsWith('image/')) {
      outputPath = outputPathBase + '.webp';
      const res = await optimizeImage(inputPath, outputPath);
      newMime = res.mime;
      newExt = res.ext;
    } else if (doc.mimetype === 'application/pdf') {
      const res = await optimizePdf(inputPath, outputPath);
      newMime = res.mime;
      newExt = res.ext;
    } else if (doc.mimetype.includes('openxmlformats')) {
      await optimizeOffice(inputPath, outputPath);
    } else {
      await fs.copyFile(inputPath, outputPath);
    }

    const optimizedBuffer = await fs.readFile(outputPath);
    const finalSize = optimizedBuffer.length;

    let finalStoragePath = doc.storagePath;
    if (newExt !== path.extname(doc.storagePath)) {
      finalStoragePath = doc.storagePath.replace(path.extname(doc.storagePath), newExt);
      await storage.upload(BUCKET_DOCUMENTOS, finalStoragePath, optimizedBuffer, {
        contentType: newMime,
        upsert: true
      });
      await storage.remove(BUCKET_DOCUMENTOS, [doc.storagePath]);
    } else {
      await storage.upload(BUCKET_DOCUMENTOS, finalStoragePath, optimizedBuffer, {
        contentType: newMime,
        upsert: true
      });
    }

    await prisma.documento.update({
      where: { id: documentoId },
      data: {
        tamanhoBytes: finalSize,
        status: 'CONCLUIDO',
        storagePath: finalStoragePath,
        mimetype: newMime
      }
    });

    console.log(`[Worker] Otimização concluída ${documentoId}`);

    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});

  } catch (err) {
    console.error(`[Worker] Erro na otimização ${documentoId}:`, err);
    await prisma.documento.update({
      where: { id: documentoId },
      data: { status: 'ERRO' }
    }).catch(() => {});
    throw err;
  }
}

async function startWorkers() {
  await boss.work('optimize-document', processOptimizationJob);
  console.log('[PgBoss] Worker de otimização iniciado.');
}

module.exports = {
  startWorkers
};
