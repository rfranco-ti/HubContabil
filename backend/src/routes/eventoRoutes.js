const express = require('express');
const router = express.Router();
const { protect: authMiddleware } = require('../middlewares/authMiddleware');
const eventoController = require('../controllers/eventoController');

/**
 * @swagger
 * tags:
 *   name: Eventos
 *   description: Gestão de eventos e compromissos
 */

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * @swagger
 * /api/eventos:
 *   get:
 *     summary: Listar eventos do usuário
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Evento'
 *   post:
 *     summary: Criar novo evento
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Evento'
 *     responses:
 *       201:
 *         description: Evento criado com sucesso
 */
router.get('/', eventoController.listarEventos);
router.post('/', eventoController.criarEvento);

/**
 * @swagger
 * /api/eventos/{id}:
 *   put:
 *     summary: Atualizar evento
 *     tags: [Eventos]
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
 *             $ref: '#/components/schemas/Evento'
 *     responses:
 *       200:
 *         description: Evento atualizado
 *       404:
 *         description: Evento não encontrado
 *   delete:
 *     summary: Excluir evento
 *     tags: [Eventos]
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
 *         description: Evento excluído
 *       404:
 *         description: Evento não encontrado
 */
router.put('/:id', eventoController.atualizarEvento);
router.delete('/:id', eventoController.excluirEvento);

module.exports = router;
