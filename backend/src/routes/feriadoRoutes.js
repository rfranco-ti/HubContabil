const express = require('express');
const router = express.Router();
const {
  listarFeriados,
  listarFeriadosAdmin,
  listarUFs,
  listarFeriadosRelevantes,
  criarFeriado,
  atualizarFeriado,
  deletarFeriado,
  importarFeriados
} = require('../controllers/feriadoController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// ===================== ROTAS PÚBLICAS =====================

// GET /api/feriados/ - Listar feriados com filtros (ano, abrangencia, uf)
router.get('/', listarFeriados);

// GET /api/feriados/ufs - Listar UFs com feriados
router.get('/ufs', listarUFs);

// GET /api/feriados/relevantes - Feriados relevantes para uma localização
router.get('/relevantes', listarFeriadosRelevantes);

// ===================== ROTAS ADMIN (protegidas + admin only) =====================

// GET /api/feriados/admin - Listar todos os feriados (admin)
router.get('/admin', protect, adminOnly, listarFeriadosAdmin);

// POST /api/feriados/admin - Criar feriado
router.post('/admin', protect, adminOnly, criarFeriado);

// POST /api/feriados/admin/importar - Importar múltiplos feriados
router.post('/admin/importar', protect, adminOnly, importarFeriados);

// PUT /api/feriados/admin/:id - Atualizar feriado
router.put('/admin/:id', protect, adminOnly, atualizarFeriado);

// DELETE /api/feriados/admin/:id - Deletar feriado
router.delete('/admin/:id', protect, adminOnly, deletarFeriado);

module.exports = router;
