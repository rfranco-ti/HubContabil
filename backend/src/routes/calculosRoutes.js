const express = require('express');
const router = express.Router();
const {
  calcularRescisaoController,
  getTabelas,
} = require('../controllers/calculoRescisaoController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Cálculos
 *     description: Calculadoras contábeis, trabalhistas, fiscais e previdenciárias
 */

// Todas as rotas de cálculos são protegidas (requer auth)
router.use(protect);

/**
 * @swagger
 * /api/calculos/rescisao:
 *   post:
 *     summary: Calcular rescisão trabalhista completa
 *     tags: [Cálculos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dataAdmissao, dataDemissao, salario, motivo]
 *             properties:
 *               dataAdmissao:
 *                 type: string
 *                 format: date
 *                 example: "2024-03-15"
 *               dataDemissao:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-05"
 *               salario:
 *                 type: number
 *                 example: 3000
 *               motivo:
 *                 type: string
 *                 enum: [sem_justa_causa, com_justa_causa, pedido_demissao, acordo_mutuo]
 *               saldoFGTS:
 *                 type: number
 *                 example: 6000
 *               dependentesIR:
 *                 type: integer
 *                 example: 0
 *               statusFerias:
 *                 type: string
 *                 enum: [nenhuma, vencida_simples, vencida_dobro]
 *                 default: nenhuma
 *               faltasPeriodo:
 *                 type: integer
 *                 default: 0
 *               tipoAviso:
 *                 type: string
 *                 enum: [indenizado, trabalhado, nao_aplicavel, dispensado_cumprimento]
 *                 default: indenizado
 *     responses:
 *       200:
 *         description: Rescisão calculada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/rescisao', calcularRescisaoController);

/**
 * @swagger
 * /api/calculos/rescisao/tabelas:
 *   get:
 *     summary: Obter tabelas tributárias vigentes (INSS, IRRF, Salário Mínimo)
 *     tags: [Cálculos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tabelas retornadas com sucesso
 */
router.get('/rescisao/tabelas', getTabelas);

module.exports = router;
