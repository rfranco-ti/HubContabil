const express = require('express');
const router = express.Router();
const {
  getKPIs,
  getVisaoSemana,
  getAtividadesRecentes,
  getDashboardCompleto
} = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Dados agregados para o dashboard principal
 */

// Todas as rotas do dashboard são protegidas
router.use(protect);

// GET /api/dashboard/ - Dashboard completo (todos os dados)
router.get('/', getDashboardCompleto);

// GET /api/dashboard/kpis - KPIs rápidos (6 cards small)
router.get('/kpis', getKPIs);

// GET /api/dashboard/semana - Visão da semana
router.get('/semana', getVisaoSemana);

// GET /api/dashboard/atividades - Atividades recentes
router.get('/atividades', getAtividadesRecentes);

module.exports = router;
