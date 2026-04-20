const express = require('express');
const router = express.Router();
const {
  listarAgendamentos,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento,
  executarAgendamento
} = require('../controllers/agendamentoController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validator');
const { z } = require('zod');

// Schema de validação para criação/edição
const agendamentoSchema = z.object({
  body: z.object({
    nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    tipoRobo: z.enum(['SIMPLES_NACIONAL', 'SEFAZ_BA'], { message: 'Tipo de robô inválido' }),
    cnpj: z.string().min(14, 'CNPJ deve ter 14 dígitos'),
    recorrencia: z.enum(['unica', 'diaria', 'semanal', 'mensal', 'x_vezes_dia', 'x_vezes_semana']),
    diasSemana: z.union([z.number().min(0).max(6), z.array(z.number().min(0).max(6))]).optional().nullable(),
    horaExecucao: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário deve ser no formato HH:MM'),
    vezesPorDia: z.number().min(1).max(24).optional(),
    vezesPorSemana: z.number().min(0).max(168).optional(),
    ativo: z.boolean().optional()
  })
});

// Todas as rotas protegidas
router.use(protect);

/**
 * GET /api/agendamentos
 * Listar agendamentos do usuário
 */
router.get('/', listarAgendamentos);

/**
 * POST /api/agendamentos
 * Criar agendamento
 */
router.post('/', validate(agendamentoSchema), criarAgendamento);

/**
 * PUT /api/agendamentos/:id
 * Atualizar agendamento
 */
router.put('/:id', atualizarAgendamento);

/**
 * DELETE /api/agendamentos/:id
 * Excluir agendamento
 */
router.delete('/:id', excluirAgendamento);

/**
 * POST /api/agendamentos/:id/executar
 * Executar manualmente
 */
router.post('/:id/executar', executarAgendamento);

module.exports = router;
