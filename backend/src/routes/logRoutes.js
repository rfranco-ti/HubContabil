const express = require('express');
const router = express.Router();
const { getLogs, getLogStats, downloadLogs, clearLogs } = require('../controllers/logController');
const { protect } = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/adminMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Logs
 *     description: Logs do sistema (apenas admin)
 */

// Todas as rotas são protegidas e requerem admin
router.use(protect);
router.use(requireAdmin);

/**
 * @swagger
 * /api/logs:
 *   get:
 *     summary: Listar logs do sistema com filtros
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warn, error]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Logs retornados com sucesso
 */
router.get('/', getLogs);

/**
 * @swagger
 * /api/logs/stats:
 *   get:
 *     summary: Obter estatísticas dos logs
 *     tags: [Logs]
 *     responses:
 *       200:
 *         description: Estatísticas dos logs
 */
router.get('/stats', getLogStats);

/**
 * @swagger
 * /api/logs/download:
 *   get:
 *     summary: Download de logs em TXT ou CSV
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [txt, csv]
 *           default: txt
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arquivo de logs para download
 */
router.get('/download', downloadLogs);

/**
 * @swagger
 * /api/logs:
 *   delete:
 *     summary: Limpar logs antigos
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Logs limpos com sucesso
 */
router.delete('/', clearLogs);

module.exports = router;
