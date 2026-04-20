const express = require('express');
const router = express.Router();
const { converterPdfParaWord } = require('../services/pdfToWordRPA');
const path = require('path');
const fs = require('fs');
const { protect: authMiddleware } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Conversões
 *   description: Conversão de arquivos (PDF para Word, etc)
 */

// Todas as rotas exigem autenticação
router.use(authMiddleware);

/**
 * @swagger
 * /api/conversoes/pdf-para-word:
 *   post:
 *     summary: Converter PDF para Word usando RPA
 *     tags: [Conversões]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [filePath]
 *             properties:
 *               filePath:
 *                 type: string
 *                 description: Caminho do arquivo PDF no servidor
 *     responses:
 *       200:
 *         description: Arquivo Word gerado
 *         content:
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Arquivo PDF não encontrado ou inválido
 *       500:
 *         description: Erro na conversão
 */
router.post('/pdf-para-word', async (req, res) => {
  try {
    const { filePath } = req.body;

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(400).json({
        success: false,
        error: 'Arquivo PDF não encontrado'
      });
    }

    const ext = path.extname(filePath).toLowerCase();
    if (ext !== '.pdf') {
      return res.status(400).json({
        success: false,
        error: 'O arquivo deve ser um PDF'
      });
    }

    console.log(`[API] Convertendo PDF para Word: ${path.basename(filePath)}`);

    const wordPath = await converterPdfParaWord(filePath);

    // Ler arquivo e enviar como resposta
    const wordBuffer = fs.readFileSync(wordPath);
    const fileName = path.basename(wordPath);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(wordBuffer);

    // Limpar arquivo temporário
    setTimeout(() => {
      try {
        fs.unlinkSync(wordPath);
        console.log(`[API] Arquivo temporário removido: ${wordPath}`);
      } catch (err) {
        console.error('[API] Erro ao remover temporário:', err.message);
      }
    }, 60000); // Remover após 1 minuto

  } catch (error) {
    console.error('[API] Erro na conversão:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      dica: 'Verifique se o PDF é válido e tente novamente.'
    });
  }
});

module.exports = router;
