const { z } = require('zod');

/**
 * Schema de validação para registro de usuário
 */
const registerSchema = z.object({
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
 * Schema de validação para login
 */
const loginSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email é obrigatório'
    }).email('Email inválido'),
    senha: z.string({
      required_error: 'Senha é obrigatória'
    })
  })
});

module.exports = {
  registerSchema,
  loginSchema
};
