const express = require('express');
const router = express.Router();
const {
  contarNaoLidas,
  listarNaoLidas,
  listarTodas,
  marcarComoLida,
  marcarTodasComoLidas,
  deletarNotificacao,
  resumo
} = require('../controllers/notificacaoController');
const { protect } = require('../middlewares/authMiddleware');

// Todas as rotas de notificação exigem autenticação
router.use(protect);

// GET /api/notificacoes/count - Contar não lidas (para badge do sino)
router.get('/count', contarNaoLidas);

// GET /api/notificacoes/resumo - Resumo estatístico
router.get('/resumo', resumo);

// GET /api/notificacoes - Listar não lidas
router.get('/', listarNaoLidas);

// GET /api/notificacoes/todas - Listar todas com paginação
router.get('/todas', listarTodas);

// PUT /api/notificacoes/:id/lida - Marcar como lida
router.put('/:id/lida', marcarComoLida);

// PUT /api/notificacoes/lidar-todas - Marcar todas como lidas
router.put('/lidar-todas', marcarTodasComoLidas);

// DELETE /api/notificacoes/:id - Deletar notificação
router.delete('/:id', deletarNotificacao);

module.exports = router;
