const express = require('express');
const router = express.Router();
const {
  listarApiKeys,
  criarApiKey,
  revogarApiKey,
  toggleApiKey
} = require('../controllers/apiKeyController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validator');
const { z } = require('zod');

// Schema de validação
const apiKeySchema = z.object({
  body: z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    permissoes: z.array(z.string()).optional(),
    expiraEm: z.string().datetime().optional().nullable()
  })
});

// Todas as rotas protegidas
router.use(protect);

/**
 * GET /api/api-keys
 * Listar API keys do usuário
 */
router.get('/', listarApiKeys);

/**
 * POST /api/api-keys
 * Criar nova API key
 */
router.post('/', validate(apiKeySchema), criarApiKey);

/**
 * PUT /api/api-keys/:id/toggle
 * Ativar/desativar API key
 */
router.put('/:id/toggle', toggleApiKey);

/**
 * DELETE /api/api-keys/:id
 * Revogar API key
 */
router.delete('/:id', revogarApiKey);

module.exports = router;
