const { z } = require('zod');

/**
 * Schema de validação para criação/atualização de cliente
 */
const clienteSchema = z.object({
  body: z.object({
    cnpj: z.string({
      required_error: 'CNPJ é obrigatório'
    }).min(14, 'CNPJ deve ter 14 dígitos'),
    razao_social: z.string().optional(),
    nome_fantasia: z.string().optional(),
    data_abertura: z.string().datetime().nullable().optional(),
    natureza_juridica: z.string().optional(),
    inscricao_estadual: z.string().optional(),
    inscricao_municipal: z.string().optional(),
    regime_tributario: z.string().optional(),
    cnae_principal: z.object({
      codigo: z.string().optional(),
      descricao: z.string().optional()
    }).optional(),
    cnaes_secundarios: z.array(z.object({
      codigo: z.string().optional(),
      descricao: z.string().optional()
    })).optional(),
    endereco: z.object({
      cep: z.string().optional(),
      logradouro: z.string().optional(),
      numero: z.string().optional(),
      complemento: z.string().optional(),
      bairro: z.string().optional(),
      cidade: z.string().optional(),
      uf: z.string().length(2, 'UF deve ter 2 caracteres').optional()
    }).optional(),
    contato_principal: z.object({
      email: z.string().email().optional(),
      telefone: z.string().optional()
    }).optional(),
    contatos: z.array(z.object({
      nome: z.string().optional(),
      email: z.string().email().optional(),
      telefone: z.string().optional(),
      cargo: z.string().optional(),
      ehPrincipal: z.boolean().optional()
    })).optional(),
    qsa: z.array(z.object({
      nome: z.string().optional(),
      cpf_cnpj: z.string().optional(),
      qualificacao: z.string().optional(),
      participacao: z.number().min(0).max(100).optional()
    })).optional(),
    categoria: z.string().optional(),
    is_bpo: z.boolean().optional(),
    observacoes: z.string().optional(),
    status: z.string().optional()
  })
});

/**
 * Schema para busca de cliente por ID (params)
 */
const clienteIdSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'ID do cliente é obrigatório'
    }).min(1, 'ID inválido')
  })
});

/**
 * Schema para consulta de CNPJ
 */
const cnpjConsultaSchema = z.object({
  params: z.object({
    cnpj: z.string({
      required_error: 'CNPJ é obrigatório'
    }).min(14, 'CNPJ deve ter 14 dígitos')
  })
});

/**
 * Schema para pesquisa de empresa
 */
const pesquisaEmpresaSchema = z.object({
  query: z.object({
    query: z.string({
      required_error: 'Termo de pesquisa é obrigatório'
    }).min(2, 'Termo deve ter no mínimo 2 caracteres')
  })
});

module.exports = {
  clienteSchema,
  clienteIdSchema,
  cnpjConsultaSchema,
  pesquisaEmpresaSchema
};
