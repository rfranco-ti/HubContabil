const reciboService = require('../services/reciboService');

/**
 * Controller para gestão de recibos
 */

/**
 * GET /api/recibo/modelos
 * Listar modelos de recibo
 */
const listarModelos = async (req, res) => {
  try {
    const { tipo } = req.query;

    // Validar tipo
    if (!tipo || !['avulso', 'honorario'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetro "tipo" é obrigatório e deve ser "avulso" ou "honorario"',
      });
    }

    // Usuário logado (injetado pelo middleware de auth)
    const usuarioId = req.usuario?.id;

    const modelos = await reciboService.getModelos(tipo, usuarioId);

    return res.json({
      success: true,
      data: modelos,
    });
  } catch (error) {
    console.error('Erro ao listar modelos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao listar modelos',
    });
  }
};

/**
 * GET /api/recibo/modelos/:id
 * Obter modelo completo por ID
 */
const getModelo = async (req, res) => {
  try {
    const { id } = req.params;

    const modelo = await reciboService.getModeloById(id);

    return res.json({
      success: true,
      data: modelo,
    });
  } catch (error) {
    console.error('Erro ao buscar modelo:', error);

    if (error.message === 'Modelo não encontrado') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar modelo',
    });
  }
};

/**
 * POST /api/recibo/modelos
 * Criar modelo personalizado
 */
const criarModelo = async (req, res) => {
  try {
    const { nome, tipo, estrutura } = req.body;

    // Validações básicas
    if (!nome || nome.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Nome deve ter pelo menos 3 caracteres',
      });
    }

    if (!tipo || !['avulso', 'honorario'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo deve ser "avulso" ou "honorario"',
      });
    }

    // Usuário logado
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    // Criar modelo
    const modelo = await reciboService.criarModelo({
      nome,
      tipo,
      estrutura: estrutura || {},
      usuarioId,
      isDefault: false,
    });

    return res.status(201).json({
      success: true,
      data: modelo,
    });
  } catch (error) {
    console.error('Erro ao criar modelo:', error);

    return res.status(500).json({
      success: false,
      error: 'Erro ao criar modelo',
    });
  }
};

/**
 * DELETE /api/recibo/modelos/:id
 * Deletar modelo personalizado
 */
const deletarModelo = async (req, res) => {
  try {
    const { id } = req.params;

    await reciboService.deletarModelo(id);

    return res.json({
      success: true,
      message: 'Modelo deletado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar modelo:', error);

    if (error.message === 'Modelo não encontrado') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message === 'Não é possível deletar modelos padrão') {
      return res.status(403).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erro ao deletar modelo',
    });
  }
};

/**
 * POST /api/recibo/gerar
 * Gerar recibo em PDF
 */
const gerarRecibo = async (req, res) => {
  try {
    const { clienteId, modeloId, tipo, dados } = req.body;

    // Validações básicas
    if (!clienteId) {
      return res.status(400).json({
        success: false,
        error: 'ID do cliente é obrigatório',
      });
    }

    if (!modeloId) {
      return res.status(400).json({
        success: false,
        error: 'ID do modelo é obrigatório',
      });
    }

    if (!tipo || !['avulso', 'honorario'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo deve ser "avulso" ou "honorario"',
      });
    }

    if (!dados || !dados.cliente_nome || !dados.cliente_cnpj || !dados.descricao || !dados.valor) {
      return res.status(400).json({
        success: false,
        error: 'Dados obrigatórios faltando: cliente_nome, cliente_cnpj, descricao, valor',
      });
    }

    // Usuário logado
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    // Gerar recibo
    const resultado = await reciboService.gerarRecibo({
      usuarioId,
      clienteId,
      modeloId,
      tipo,
      dados,
    });

    // Set headers para download do PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="recibo_${resultado.recibo.id}.pdf"`
    );

    // Enviar PDF
    return res.send(Buffer.from(resultado.pdfBuffer));
  } catch (error) {
    console.error('Erro ao gerar recibo:', error);

    if (error.message === 'Modelo não encontrado') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message === 'Tipo de modelo incompatível') {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erro ao gerar recibo',
    });
  }
};

/**
 * GET /api/recibos
 * Listar histórico de recibos
 */
const listarRecibos = async (req, res) => {
  try {
    const { clienteId, tipo, status } = req.query;

    // Usuário logado
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const recibos = await reciboService.listarRecibos({
      usuarioId,
      clienteId,
      tipo,
      status,
    });

    return res.json({
      success: true,
      data: recibos,
    });
  } catch (error) {
    console.error('Erro ao listar recibos:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao listar recibos',
    });
  }
};

/**
 * GET /api/recibos/:id
 * Obter recibo por ID
 */
const getRecibo = async (req, res) => {
  try {
    const { id } = req.params;

    // Usuário logado
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const recibo = await reciboService.getReciboById(id, usuarioId);

    return res.json({
      success: true,
      data: recibo,
    });
  } catch (error) {
    console.error('Erro ao buscar recibo:', error);

    if (error.message === 'Recibo não encontrado') {
      return res.status(404).json({
        success: false,
        error: error.message,
      });
    }

    if (error.message === 'Sem permissão para visualizar este recibo') {
      return res.status(403).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar recibo',
    });
  }
};

module.exports = {
  listarModelos,
  getModelo,
  criarModelo,
  deletarModelo,
  gerarRecibo,
  listarRecibos,
  getRecibo,
};
