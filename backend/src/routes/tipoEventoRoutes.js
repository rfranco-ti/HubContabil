const express = require("express");
const router = express.Router();
const {
  listarTipos,
  listarTiposAdmin,
  obterTipo,
  criarTipo,
  atualizarTipo,
  desativarTipo,
  reativarTipo,
  resumoTipos,
} = require("../controllers/tipoEventoController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// ===================== ROTAS PÚBLICAS =====================

// GET /api/tipos-evento/ - Listar tipos ativos (frontend usa para popular selects)
router.get("/", listarTipos);

// ===================== ROTAS ADMIN (protegidas + admin only) =====================

// GET /api/tipos-evento/admin - Listar todos os tipos (inclui inativos)
router.get("/admin", protect, adminOnly, listarTiposAdmin);

// GET /api/tipos-evento/admin/resumo - Resumo estatístico
router.get("/admin/resumo", protect, adminOnly, resumoTipos);

// GET /api/tipos-evento/:id - Obter tipo específico com detalhes
router.get("/:id", protect, adminOnly, obterTipo);

// POST /api/tipos-evento/admin - Criar novo tipo
router.post("/admin", protect, adminOnly, criarTipo);

// PUT /api/tipos-evento/admin/:id - Atualizar tipo
router.put("/admin/:id", protect, adminOnly, atualizarTipo);

// DELETE /api/tipos-evento/admin/:id - Desativar tipo
router.delete("/admin/:id", protect, adminOnly, desativarTipo);

// POST /api/tipos-evento/admin/:id/reativar - Reativar tipo desativado
router.post("/admin/:id/reativar", protect, adminOnly, reativarTipo);

module.exports = router;
