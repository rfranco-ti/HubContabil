const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { uploadDocumento, executarOcr } = require('../controllers/gedController');
const { gerarContrato } = require('../controllers/contratoController');

/**
 * @swagger
 * /api/ged/upload:
 *   post:
 *     summary: Upload de documento para o Supabase Storage
 *     description: Faz upload de arquivos PDF, imagens ou outros documentos
 *     tags: [GED]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documento:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo para upload
 *     responses:
 *       201:
 *         description: Documento enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 filename:
 *                   type: string
 *                 storagePath:
 *                   type: string
 *                 url:
 *                   type: string
 *                   format: uri
 *       400:
 *         description: Nenhum documento enviado
 *       500:
 *         description: Erro no upload
 */
router.post('/upload', upload.single('documento'), uploadDocumento);

/**
 * @swagger
 * /api/ged/ocr:
 *   post:
 *     summary: Processar OCR em documento
 *     description: Extrai texto de PDF ou imagens usando OCR
 *     tags: [GED]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [filename]
 *             properties:
 *               filename:
 *                 type: string
 *                 description: Nome do arquivo no storage
 *     responses:
 *       200:
 *         description: OCR concluído
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 metodo:
 *                   type: string
 *                   description: Método utilizado (Tesseract, OCR.space, pdf2json)
 *                 transcricao:
 *                   type: string
 *                   description: Texto extraído
 *                 caracteres:
 *                   type: integer
 *                   description: Número de caracteres extraídos
 *       400:
 *         description: Filename obrigatório
 *       404:
 *         description: Documento não encontrado
 *       500:
 *         description: Falha no OCR
 */
router.post('/ocr', executarOcr);

/**
 * @swagger
 * /api/ged/gerar-contrato:
 *   post:
 *     summary: Gerar contrato em PDF
 *     tags: [GED]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dadosContrato:
 *                 type: object
 *                 description: Dados para geração do contrato
 *     responses:
 *       200:
 *         description: Contrato gerado com sucesso
 *       500:
 *         description: Erro ao gerar contrato
 */
router.post('/gerar-contrato', gerarContrato);

module.exports = router;
