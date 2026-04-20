const { z } = require('zod');

/**
 * Schema de validação para criação de usuário
 */
const criarUsuarioSchema = z.object({
  body: z.object({
    nome: z.string({
      required_error: 'Nome é obrigatório'
    }).min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string({
      required_error: 'Email é obrigatório'
    }).email('Email inválido'),
    senha: z.string({
      required_error: 'Senha é obrigatória'
    }).min(6, 'Senha deve ter no mínimo 6 caracteres'),
    cargo: z.string().optional()
  })
});

/**
 * Schema de validação para atualização de usuário
 */
const atualizarUsuarioSchema = z.object({
  body: z.object({
    nome: z.string()
      .min(2, 'Nome deve ter no mínimo 2 caracteres')
      .optional(),
    email: z.string()
      .email('Email inválido')
      .optional(),
    senha: z.string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
      .optional(),
    cargo: z.string().optional()
  }).refine(
    (data) => {
      // Pelo menos um campo deve ser fornecido
      return Object.keys(data).length > 0;
    },
    {
      message: 'Pelo menos um campo deve ser fornecido para atualização'
    }
  ),
  params: z.object({
    id: z.string().uuid('ID de usuário inválido')
  })
});

/**
 * Schema de validação para obter/excluir usuário
 */
const usuarioIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID de usuário inválido')
  })
});

module.exports = {
  criarUsuarioSchema,
  atualizarUsuarioSchema,
  usuarioIdSchema
};
