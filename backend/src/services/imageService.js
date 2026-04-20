const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Gera thumbnail para imagens
 * @param {string} inputPath - Caminho do arquivo original
 * @param {string} outputPath - Caminho para salvar thumbnail
 * @param {number} width - Largura máxima (padrão: 300px)
 * @returns {Promise<{path: string, tamanho: number}>}
 */
const gerarThumbnail = async (inputPath, outputPath, width = 300) => {
  try {
    // Garante que o diretório exista
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Gera thumbnail mantendo aspect ratio
    const metadata = await sharp(inputPath).metadata();
    const height = Math.round((width / metadata.width) * metadata.height);

    await sharp(inputPath)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    const stats = fs.statSync(outputPath);
    
    return {
      path: outputPath,
      tamanho: stats.size
    };
  } catch (error) {
    console.error('Erro ao gerar thumbnail:', error);
    return null;
  }
};

/**
 * Comprime imagem
 * @param {string} inputPath - Caminho do arquivo original
 * @param {string} outputPath - Caminho para salvar comprimido
 * @param {number} quality - Qualidade 1-100 (padrão: 75)
 * @returns {Promise<{path: string, tamanho: number, economia: number}>}
 */
const comprimirImagem = async (inputPath, outputPath, quality = 75) => {
  try {
    // Garante que o diretório exista
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const originalStats = fs.statSync(inputPath);

    await sharp(inputPath)
      .jpeg({ quality })
      .toFile(outputPath);

    const compressedStats = fs.statSync(outputPath);
    const economia = ((originalStats.size - compressedStats.size) / originalStats.size) * 100;

    return {
      path: outputPath,
      tamanho: compressedStats.size,
      economia: Math.round(economia * 100) / 100
    };
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    return null;
  }
};

/**
 * Verifica se é um arquivo de imagem
 * @param {string} mimetype - MIME type do arquivo
 * @returns {boolean}
 */
const isImagem = (mimetype) => {
  return mimetype && mimetype.startsWith('image/');
};

/**
 * Verifica se é uma imagem que pode ser convertida para JPEG
 * @param {string} mimetype - MIME type do arquivo
 * @returns {boolean}
 */
const isImagemComprimivel = (mimetype) => {
  return mimetype && (
    mimetype.startsWith('image/') ||
    mimetype === 'application/pdf'
  );
};

module.exports = {
  gerarThumbnail,
  comprimirImagem,
  isImagem,
  isImagemComprimivel
};
