const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect: authMiddleware } = require('../middlewares/authMiddleware');
const documentoGeradoController = require('../controllers/documentoGeradoController');

/**
 * @swagger
 * tags:
 *   name: Documentos Gerados
 *   description: Histórico de documentos gerados pelo sistema
 */

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * @swagger
 * /api/documentos-gerados:
 *   get:
 *     summary: Listar documentos gerados
 *     tags: [Documentos Gerados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de documentos gerados
 *   post:
 *     summary: Salvar novo documento gerado
 *     tags: [Documentos Gerados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Documento salvo com sucesso
 */
router.get('/', documentoGeradoController.listarDocumentos);
router.post('/', upload.single('pdf'), documentoGeradoController.salvarDocumento);

/**
 * @swagger
 * /api/documentos-gerados/estatisticas:
 *   get:
 *     summary: Obter estatísticas de documentos gerados
 *     tags: [Documentos Gerados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas retornadas com sucesso
 */
router.get('/estatisticas', documentoGeradoController.getEstatisticas);
router.get('/proximo-numero/:tipo', documentoGeradoController.getProximoNumero);

/**
 * @swagger
 * /api/documentos-gerados/{id}:
 *   get:
 *     summary: Buscar documento gerado por ID
 *     tags: [Documentos Gerados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do documento
 *       404:
 *         description: Documento não encontrado
 *   delete:
 *     summary: Deletar documento gerado
 *     tags: [Documentos Gerados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Documento deletado
 *       404:
 *         description: Documento não encontrado
 */
router.get('/:id', documentoGeradoController.getDocumento);
router.delete('/:id', documentoGeradoController.deletarDocumento);

/**
 * @swagger
 * /api/documentos-gerados/{id}/download:
 *   get:
 *     summary: Download do documento PDF
 *     tags: [Documentos Gerados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arquivo PDF para download
 *       404:
 *         description: Documento não encontrado
 */
router.get('/:id/download', documentoGeradoController.downloadDocumento);

/**
 * @swagger
 * /api/documentos-gerados/{id}/status:
 *   put:
 *     summary: Atualizar status do documento
 *     tags: [Documentos Gerados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status atualizado
 *       404:
 *         description: Documento não encontrado
 */
router.put('/:id/status', documentoGeradoController.atualizarStatus);

module.exports = router;
