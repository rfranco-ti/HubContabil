const express = require('express');
const router = express.Router();
const stickyNotesController = require('../controllers/stickyNotesController');
const pastasNotasController = require('../controllers/pastasNotasController');
const { protect: authMiddleware } = require('../middlewares/authMiddleware');

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// Rotas de pastas (deve vir antes de /:id para não conflitar)
router.get('/pastas', pastasNotasController.listarPastas);
router.post('/pastas', pastasNotasController.criarPasta);
router.put('/pastas/:id', pastasNotasController.atualizarPasta);
router.delete('/pastas/:id', pastasNotasController.excluirPasta);

// Rotas de notas
router.get('/', stickyNotesController.listarNotas);
router.post('/', stickyNotesController.criarNota);
router.patch('/reordenar', stickyNotesController.reordenarNotas);
router.put('/:id', stickyNotesController.atualizarNota);
router.delete('/:id', stickyNotesController.excluirNota);

module.exports = router;
