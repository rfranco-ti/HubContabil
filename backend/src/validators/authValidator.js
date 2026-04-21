const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
  })
});

const registerSchema = z.object({
  body: z.object({
    nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    email: z.string().email('E-mail inválido'),
    senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    cargo: z.string().optional()
  })
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token é obrigatório'
    })
  })
});

module.exports = {
  loginSchema,
  registerSchema,
  refreshSchema
};
