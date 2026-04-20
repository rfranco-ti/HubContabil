const express = require('express');
const router = express.Router();
const pastasNotasController = require('../controllers/pastasNotasController');
const { protect: authMiddleware } = require('../middlewares/authMiddleware');

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// CRUD de pastas
router.get('/', pastasNotasController.listarPastas);
router.post('/', pastasNotasController.criarPasta);
router.put('/:id', pastasNotasController.atualizarPasta);
router.delete('/:id', pastasNotasController.excluirPasta);

module.exports = router;
