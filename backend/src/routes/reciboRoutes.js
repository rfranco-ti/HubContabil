const express = require('express');
const { listarModelos, getModelo, criarModelo, deletarModelo, gerarRecibo, listarRecibos, getRecibo } = require('../controllers/reciboController');
const { protect: authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Recibos
 *   description: Geração e gestão de recibos personalizados
 */

/**
 * @swagger
 * /api/recibo/modelos:
 *   get:
 *     summary: Listar modelos de recibo
 *     tags: [Recibos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de modelos de recibo
 *   post:
 *     summary: Criar novo modelo de recibo
 *     tags: [Recibos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Modelo criado com sucesso
 */
router.get('/modelos', authMiddleware, listarModelos);
router.post('/modelos', authMiddleware, criarModelo);

/**
 * @swagger
 * /api/recibo/modelos/{id}:
 *   get:
 *     summary: Buscar modelo de recibo por ID
 *     tags: [Recibos]
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
 *         description: Dados do modelo
 *       404:
 *         description: Modelo não encontrado
 *   delete:
 *     summary: Deletar modelo de recibo
 *     tags: [Recibos]
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
 *         description: Modelo deletado
 *       404:
 *         description: Modelo não encontrado
 */
router.get('/modelos/:id', authMiddleware, getModelo);
router.delete('/modelos/:id', authMiddleware, deletarModelo);

/**
 * @swagger
 * /api/recibo/gerar:
 *   post:
 *     summary: Gerar recibo em PDF
 *     tags: [Recibos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               modeloId:
 *                 type: string
 *               dados:
 *                 type: object
 *     responses:
 *       200:
 *         description: Recibo gerado com sucesso
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Erro ao gerar recibo
 */
router.post('/gerar', authMiddleware, gerarRecibo);

/**
 * @swagger
 * /api/recibo/recibos:
 *   get:
 *     summary: Listar histórico de recibos gerados
 *     tags: [Recibos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de recibos
 */
router.get('/recibos', authMiddleware, listarRecibos);

/**
 * @swagger
 * /api/recibo/recibos/{id}:
 *   get:
 *     summary: Buscar recibo por ID
 *     tags: [Recibos]
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
 *         description: Dados do recibo
 *       404:
 *         description: Recibo não encontrado
 */
router.get('/recibos/:id', authMiddleware, getRecibo);

module.exports = router;
