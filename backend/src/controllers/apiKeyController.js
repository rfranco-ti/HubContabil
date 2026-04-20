const crypto = require('crypto');
const prisma = require('../config/prisma');

// Gerar API key segura
const gerarApiKey = () => {
  return `sk_live_${crypto.randomBytes(32).toString('hex')}`;
};

// Hash para armazenamento
const hashApiKey = (key) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

/**
 * GET /api/api-keys
 * Listar API keys do usuário
 */
const listarApiKeys = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const apiKeys = await prisma.apiKey.findMany({
      where: { usuarioId: userId },
      orderBy: { createdAt: 'desc' }
    });

    // Não enviar o hash completo, apenas o prefixo
    const formatadas = apiKeys.map(key => ({
      id: key.id,
      nome: key.nome,
      prefixo: key.prefixo,
      permissoes: key.permissoes,
      ultimaUtilizacao: key.ultimaUtilizacao?.toISOString() || null,
      totalRequisicoes: key.totalRequisicoes,
      expiraEm: key.expiraEm?.toISOString() || null,
      ativa: key.ativa,
      createdAt: key.createdAt.toISOString()
    }));

    res.json({ success: true, data: formatadas });
  } catch (error) {
    console.error('Erro ao listar API keys:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar API keys', error: error.message });
  }
};

/**
 * POST /api/api-keys
 * Criar nova API key
 */
const criarApiKey = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const { nome, permissoes, expiraEm } = req.body;

    if (!nome) {
      return res.status(400).json({ success: false, message: 'Nome é obrigatório' });
    }

    const chaveCompleta = gerarApiKey();
    const chaveHash = hashApiKey(chaveCompleta);
    const prefixo = chaveCompleta.substring(0, 12) + '...';

    const apiKey = await prisma.apiKey.create({
      data: {
        nome,
        chave: chaveHash,
        prefixo,
        permissoes: permissoes || [],
        expiraEm: expiraEm ? new Date(expiraEm) : null,
        usuarioId: userId
      }
    });

    res.status(201).json({
      success: true,
      data: {
        id: apiKey.id,
        nome: apiKey.nome,
        prefixo: apiKey.prefixo,
        chaveCompleta, // Enviada apenas na criação!
        permissoes: apiKey.permissoes,
        expiraEm: apiKey.expiraEm?.toISOString() || null,
        createdAt: apiKey.createdAt.toISOString()
      },
      message: 'API key criada com sucesso. Guarde a chave, ela não será exibida novamente.'
    });
  } catch (error) {
    console.error('Erro ao criar API key:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar API key', error: error.message });
  }
};

/**
 * DELETE /api/api-keys/:id
 * Revogar API key
 */
const revogarApiKey = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const existente = await prisma.apiKey.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ success: false, message: 'API key não encontrada' });
    if (existente.usuarioId !== userId) return res.status(403).json({ success: false, message: 'Sem permissão' });

    await prisma.apiKey.delete({ where: { id } });
    res.json({ success: true, message: 'API key revogada com sucesso' });
  } catch (error) {
    console.error('Erro ao revogar API key:', error);
    res.status(500).json({ success: false, message: 'Erro ao revogar API key', error: error.message });
  }
};

/**
 * PUT /api/api-keys/:id
 * Ativar/desativar API key
 */
const toggleApiKey = async (req, res) => {
  try {
    const userId = req.usuario?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Não autenticado' });

    const existente = await prisma.apiKey.findUnique({ where: { id } });
    if (!existente) return res.status(404).json({ success: false, message: 'API key não encontrada' });
    if (existente.usuarioId !== userId) return res.status(403).json({ success: false, message: 'Sem permissão' });

    const atualizada = await prisma.apiKey.update({
      where: { id },
      data: { ativa: !existente.ativa }
    });

    res.json({
      success: true,
      data: { id: atualizada.id, ativa: atualizada.ativa },
      message: atualizada.ativa ? 'API key ativada' : 'API key desativada'
    });
  } catch (error) {
    console.error('Erro ao alternar API key:', error);
    res.status(500).json({ success: false, message: 'Erro ao alternar API key', error: error.message });
  }
};

/**
 * Middleware para autenticar requests via API key
 */
const authApiKey = async (req, res, next) => {
  try {
    const apiKeyHeader = req.headers['x-api-key'] || req.query.api_key;
    if (!apiKeyHeader) {
      return res.status(401).json({ success: false, message: 'API key required' });
    }

    const chaveHash = hashApiKey(apiKeyHeader);

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        chave: chaveHash,
        ativa: true
      },
      include: { usuario: { select: { id: true, nome: true, email: true } } }
    });

    if (!apiKey) {
      return res.status(401).json({ success: false, message: 'Invalid API key' });
    }

    // Verificar expiração
    if (apiKey.expiraEm && apiKey.expiraEm < new Date()) {
      return res.status(401).json({ success: false, message: 'API key expired' });
    }

    // Atualizar stats
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        ultimaUtilizacao: new Date(),
        totalRequisicoes: apiKey.totalRequisicoes + 1
      }
    });

    req.apiKey = apiKey;
    req.usuario = apiKey.usuario;
    next();
  } catch (error) {
    console.error('Erro na autenticação API key:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  listarApiKeys,
  criarApiKey,
  revogarApiKey,
  toggleApiKey,
  authApiKey
};
