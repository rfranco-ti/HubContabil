const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Hub Contábil API',
    version: '2.0.0',
    description: 'API completa para o sistema Hub Contábil - Gestão de clientes, documentos, automação robótica e calendário contábil',
    contact: {
      name: 'Equipe Hub Contábil'
    },
    license: {
      name: 'ISC'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de desenvolvimento'
    },
    {
      url: 'https://api.hubcontabil.com',
      description: 'Servidor de produção'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido no endpoint /api/auth/login'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['nome', 'email', 'senha'],
        properties: {
          id: { type: 'string', description: 'ID único do usuário' },
          nome: { type: 'string', description: 'Nome completo do usuário' },
          email: { type: 'string', format: 'email', description: 'Email do usuário' },
          cargo: { type: 'string', description: 'Cargo/função do usuário' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Client: {
        type: 'object',
        required: ['cnpj'],
        properties: {
          id: { type: 'string', description: 'ID único do cliente' },
          cnpj: { type: 'string', description: 'CNPJ da empresa (14 dígitos)' },
          razaoSocial: { type: 'string', description: 'Razão social' },
          nomeFantasia: { type: 'string', description: 'Nome fantasia' },
          dataAbertura: { type: 'string', format: 'date', description: 'Data de abertura' },
          naturezaJuridica: { type: 'string', description: 'Natureza jurídica' },
          inscricaoEstadual: { type: 'string', description: 'Inscrição estadual' },
          inscricaoMunicipal: { type: 'string', description: 'Inscrição municipal' },
          regimeTributario: { type: 'string', enum: ['Simples Nacional', 'Lucro Presumido', 'Lucro Real', 'Outro'] },
          categoria: { type: 'string', description: 'Categoria do cliente' },
          isBpo: { type: 'boolean', description: 'Se é cliente BPO' },
          observacoes: { type: 'string', description: 'Observações gerais' },
          status: { type: 'string', enum: ['Ativo', 'Inativo', 'Suspenso'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      Evento: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          titulo: { type: 'string', description: 'Título do evento' },
          descricao: { type: 'string', description: 'Descrição do evento' },
          data: { type: 'string', format: 'date-time', description: 'Data e hora do evento' },
          tipo: { type: 'string', description: 'Tipo do evento' },
          clienteId: { type: 'string', description: 'ID do cliente relacionado' }
        }
      },
      Documento: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          nome: { type: 'string', description: 'Nome do arquivo' },
          tipo: { type: 'string', description: 'Tipo do documento' },
          url: { type: 'string', format: 'uri', description: 'URL do documento no storage' },
          clienteId: { type: 'string', description: 'ID do cliente relacionado' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', description: 'Mensagem de erro' }
        }
      }
    }
  },
  security: [{
    bearerAuth: []
  }]
};

const options = {
  swaggerDefinition,
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/validators/*.js'
  ]
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
