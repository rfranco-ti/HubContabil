const express = require("express");
const router = express.Router();
const {
  getCalendarioContabil,
  criarObrigacao,
  atualizarObrigacao,
  deletarObrigacao,
  getEstatisticas,
  getDashboard,
} = require("../controllers/calendarioContabilController");
const {
  getEventosUsuario,
  criarEvento,
  atualizarEvento,
  excluirEvento,
} = require("../controllers/calendarioEventoController");
const { protect } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Calendário
 *   description: Calendário contábil e obrigações acessórias
 */

// ==================== ROTAS PÚBLICAS ====================

/**
 * @swagger
 * /api/calendario/contabil:
 *   get:
 *     summary: Obter calendário contábil com obrigações e feriados
 *     tags: [Calendário]
 *     parameters:
 *       - in: query
 *         name: ano
 *         schema:
 *           type: integer
 *         description: Filtrar por ano
 *       - in: query
 *         name: mes
 *         schema:
 *           type: integer
 *         description: Filtrar por mes (1-12)
 *     responses:
 *       200:
 *         description: Calendario contabil retornado com sucesso
 *       500:
 *         description: Erro ao carregar calendario
 */
router.get("/contabil", getCalendarioContabil);

/**
 * @swagger
 * /api/calendario/contabil/estatisticas:
 *   get:
 *     summary: Obter estatísticas do calendário contábil
 *     tags: [Calendário]
 *     parameters:
 *       - in: query
 *         name: ano
 *         schema:
 *           type: integer
 *         description: Ano para estatísticas
 *     responses:
 *       200:
 *         description: Estatísticas retornadas
 */
router.get("/contabil/estatisticas", getEstatisticas);

/**
 * @swagger
 * /api/calendario/dashboard:
 *   get:
 *     summary: Dados agregados para o dashboard
 *     tags: [Calendário]
 *     responses:
 *       200:
 *         description: Dados do dashboard retornados
 */
router.get("/dashboard", getDashboard);

// ==================== ROTAS PROTEGIDAS ====================

/**
 * @swagger
 * /api/calendario/contabil:
 *   post:
 *     summary: Criar nova obrigação no calendário
 *     tags: [Calendário]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ano, mes, dia, nomeEvento, categoria]
 *             properties:
 *               ano:
 *                 type: integer
 *               mes:
 *                 type: integer
 *                 description: 1-12
 *               dia:
 *                 type: integer
 *                 description: 1-31
 *               nomeEvento:
 *                 type: string
 *               periodoApuracao:
 *                 type: string
 *               baseLegal:
 *                 type: string
 *               categoria:
 *                 type: string
 *                 enum: [Tributário Federal, Trabalhista e Previdenciário, Feriados, Tributário Estadual, Tributário Municipal]
 *               isFeriado:
 *                 type: boolean
 *               isPontoFacultativo:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Obrigação criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post("/contabil", protect, criarObrigacao);

/**
 * @swagger
 * /api/calendario/contabil/{id}:
 *   put:
 *     summary: Atualizar obrigação do calendário
 *     tags: [Calendário]
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
 *         description: Obrigação atualizada
 *       404:
 *         description: Obrigação não encontrada
 *   delete:
 *     summary: Deletar obrigação do calendário
 *     tags: [Calendário]
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
 *         description: Obrigação deletada
 *       404:
 *         description: Obrigação não encontrada
 */
router.put("/contabil/:id", protect, atualizarObrigacao);
router.delete("/contabil/:id", protect, deletarObrigacao);

// ==================== EVENTOS DO USUÁRIO ====================

/**
 * @swagger
 * /api/calendario/eventos:
 *   get:
 *     summary: Listar eventos do usuário no calendário
 *     tags: [Calendário]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos do usuário
 *       401:
 *         description: Não autorizado
 *   post:
 *     summary: Criar evento no calendário
 *     tags: [Calendário]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [titulo, data]
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               data:
 *                 type: string
 *                 format: date-time
 *               tipo:
 *                 type: string
 *               cor:
 *                 type: string
 *     responses:
 *       201:
 *         description: Evento criado com sucesso
 */
router.get("/eventos", protect, getEventosUsuario);
router.post("/eventos", protect, criarEvento);

/**
 * @swagger
 * /api/calendario/eventos/{id}:
 *   put:
 *     summary: Atualizar evento do calendário
 *     tags: [Calendário]
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
 *         description: Evento atualizado
 *       404:
 *         description: Evento não encontrado
 *   delete:
 *     summary: Excluir evento do calendário
 *     tags: [Calendário]
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
router.put("/eventos/:id", protect, atualizarEvento);
router.delete("/eventos/:id", protect, excluirEvento);

module.exports = router;
