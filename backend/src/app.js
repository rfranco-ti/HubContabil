const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente IMEDIATAMENTE
dotenv.config();

const prisma = require('./config/prisma');
const path = require('path');
const fs = require('fs');

// Configurar timezone Brasil ANTES de tudo
process.env.TZ = 'America/Sao_Paulo';

// Middlewares
const configTimezone = require('./middlewares/timezone');
const requestLogger = require('./middlewares/logger');
const errorHandler = require('./middlewares/errorHandler');

// Documentação
const swaggerSpec = require('./docs/swagger');

// Rotas
const routes = require('./routes');

/**
 * Conectar ao banco de dados Supabase PostgreSQL
 */
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Supabase PostgreSQL Connected!');
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error.message);
    console.log('⚠️  O servidor Express vai continuar rodando mesmo sem banco.');
  }
}

/**
 * Configurar aplicação Express
 * @returns {express.Application}
 */
function createApp() {
  const app = express();

  // Middlewares globais
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  
  // Timezone Brasil
  app.use(configTimezone);
  
  // Logger de requisições
  app.use(requestLogger);

  // Rota de health check
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Rota raiz
  app.get('/', (req, res) => {
    res.json({
      message: 'Bem-vindo à API do Hub Contábil!',
      version: '2.0.0',
      documentation: '/api-docs',
      health: '/health',
      endpoints: {
        auth: '/api/auth',
        clientes: '/api/clientes',
        rpa: '/api/rpa',
        ged: '/api/ged',
        documentos: '/api/documentos',
        recibos: '/api/recibo',
        eventos: '/api/eventos',
        notas: '/api/notas',
        conversoes: '/api/conversoes',
        calendario: '/api/calendario'
      }
    });
  });

  const tempPdfsDir = path.join(__dirname, 'temp', 'pdfs');
  const legacyTempPdfsDir = path.join(__dirname, '..', 'temp', 'pdfs');
  const isSafeRpaDirName = (rpaDir) =>
    typeof rpaDir === 'string'
    && rpaDir.length > 0
    && /^[a-z0-9][a-z0-9-_]{0,127}$/i.test(rpaDir);
  const isSafePdfFileName = (fileName) =>
    typeof fileName === 'string'
    && fileName.length > 0
    && fileName === path.basename(fileName)
    && fileName.toLowerCase().endsWith('.pdf');

  const buildContentDisposition = (dispositionType, fileName) => {
    const safeFallback = fileName.replace(/["\\]/g, '_');
    const encoded = encodeURIComponent(fileName);
    return `${dispositionType}; filename="${safeFallback}"; filename*=UTF-8''${encoded}`;
  };

  const serveTempPdf = (req, res) => {
    const rpaDir = req.params.rpaDir;
    const fileName = req.params.fileName;
    if (rpaDir && !isSafeRpaDirName(rpaDir)) {
      return res.status(400).json({ message: 'Diretório inválido.' });
    }
    if (!isSafePdfFileName(fileName)) {
      return res.status(400).json({ message: 'Nome de arquivo inválido.' });
    }

    const newDir = rpaDir ? path.join(tempPdfsDir, rpaDir) : tempPdfsDir;
    const legacyDir = rpaDir ? path.join(legacyTempPdfsDir, rpaDir) : legacyTempPdfsDir;

    const candidates = [
      path.join(newDir, fileName),
      path.join(tempPdfsDir, fileName),
      path.join(legacyDir, fileName),
      path.join(legacyTempPdfsDir, fileName),
    ];

    let foundPath = candidates.find(p => fs.existsSync(p));
    if (!foundPath) return res.status(404).json({ message: 'PDF não encontrado.' });

    const cameFromLegacy = foundPath.startsWith(legacyTempPdfsDir);
    if (cameFromLegacy) {
      try {
        if (!fs.existsSync(newDir)) fs.mkdirSync(newDir, { recursive: true });
        const migratedPath = path.join(newDir, fileName);
        if (!fs.existsSync(migratedPath)) fs.renameSync(foundPath, migratedPath);
        foundPath = migratedPath;
      } catch {}
    }

    const download =
      req.query.download === '1'
      || req.query.download === 'true'
      || req.query.disposition === 'attachment';

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': buildContentDisposition(download ? 'attachment' : 'inline', fileName),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Expose-Headers': 'Content-Disposition, Content-Type, Content-Length',
    });

    return res.sendFile(foundPath);
  };

  app.get('/api/temp/pdfs/:rpaDir/:fileName', serveTempPdf);
  app.get('/temp/pdfs/:rpaDir/:fileName', serveTempPdf);
  app.get('/api/temp/pdfs/:fileName', serveTempPdf);
  app.get('/temp/pdfs/:fileName', serveTempPdf);

  // Documentação Swagger
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Hub Contábil - API Documentation'
  }));

  // Registrar rotas
  app.use('/api', routes);

  // Handler de erros global (deve ser o último middleware)
  app.use(errorHandler);

  return app;
}

module.exports = { createApp, connectDatabase };
