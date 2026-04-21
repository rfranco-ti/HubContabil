const { z } = require("zod");

/**
 * Schema para validação de criação/atualização de cliente
 */
const clienteSchema = z.object({
  cnpj: z.string().transform((v) => v.replace(/\D/g, "")).refine((v) => v.length === 14, "CNPJ deve ter 14 dígitos"),
  razao_social: z.string().min(3, "Razão Social deve ter no mínimo 3 caracteres"),
  nome_fantasia: z.string().optional().nullable(),
  data_abertura: z.string().optional().nullable(),
  natureza_juridica: z.string().optional().nullable(),
  inscricao_estadual: z.string().optional().nullable(),
  inscricao_municipal: z.string().optional().nullable(),
  situacao_sefaz_estadual: z.string().optional().nullable(),
  situacao_sefaz_municipal: z.string().optional().nullable(),
  nire: z.string().optional().nullable(),
  situacao_sefaz: z.string().optional().nullable(),
  regime_tributario: z.enum(["Simples Nacional", "Simples Nacional - MEI", "Lucro Presumido", "Lucro Real", "Outro", "Não Enquadrado", "Nao Informado"]).default("Outro"),
  status: z.enum(["Ativo", "Inativo", "Suspenso"]).default("Ativo"),
  categoria: z.string().default("Serviços"),
  is_bpo: z.boolean().default(false),
  observacoes: z.string().optional().nullable(),
  
  // Endereço
  endereco: z.object({
    cep: z.string().optional().nullable(),
    logradouro: z.string().optional().nullable(),
    numero: z.string().optional().nullable(),
    complemento: z.string().optional().nullable(),
    bairro: z.string().optional().nullable(),
    cidade: z.string().optional().nullable(),
    uf: z.string().optional().nullable(),
  }).optional(),

  // CNAE
  cnae_principal: z.object({
    codigo: z.string().optional().nullable(),
    descricao: z.string().optional().nullable(),
  }).optional(),

  cnaes_secundarios: z.array(z.object({
    codigo: z.string(),
    descricao: z.string(),
  })).optional().default([]),

  // Contatos (QSA/Sócios)
  qsa: z.array(z.object({
    nome: z.string(),
    cpf_cnpj: z.string().optional().nullable(),
    qualificacao: z.string().optional().nullable(),
    participacao: z.number().optional().nullable(),
  })).optional().default([]),

  // Contatos de atendimento
  contatos: z.array(z.object({
    nome: z.string(),
    email: z.string().email("E-mail inválido").optional().nullable().or(z.literal("")),
    telefone: z.string().optional().nullable(),
    cargo: z.string().optional().nullable(),
    eh_principal: z.boolean().default(false),
  })).optional().default([]),

  // Legado / Compatibilidade
  contato_principal: z.object({
    nome: z.string().optional(),
    email: z.string().optional(),
    telefone: z.string().optional(),
  }).optional(),
});

/**
 * Schema simplificado para consulta
 */
const cnpjConsultaSchema = z.object({
  cnpj: z.string().transform((v) => v.replace(/\D/g, "")).refine((v) => v.length === 14, "CNPJ deve ter 14 dígitos"),
});

/**
 * Schema para ID de cliente (UUID)
 */
const clienteIdSchema = z.object({
  id: z.string().uuid("ID inválido"),
});

/**
 * Schema para pesquisa de empresas
 */
const pesquisaEmpresaSchema = z.object({
  query: z.string().min(1, "Termo de pesquisa obrigatório"),
});

module.exports = {
  clienteSchema,
  clienteIdSchema,
  cnpjConsultaSchema,
  pesquisaEmpresaSchema,
};
