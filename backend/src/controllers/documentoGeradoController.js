const prisma = require("../config/prisma");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { AppError } = require("../middlewares/errorHandler");

/**
 * Controller para gestão de documentos gerados
 * Usando Prisma ORM (Supabase PostgreSQL)
 */

/**
 * POST /api/documentos-gerados
 * Salvar documento gerado no histórico
 */
const salvarDocumento = async (req, res, next) => {
  try {
    const { tipo, dados, clienteId } = req.body;

    // Validações
    if (!tipo) {
      throw new AppError("Tipo de documento é obrigatório", 400);
    }

    if (!dados) {
      throw new AppError("Dados do documento são obrigatórios", 400);
    }

    // Usuário logado
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    // Gerar nome do arquivo
    const timestamp = Date.now();
    const nomeArquivo = `${tipo}_${timestamp}.pdf`;
    const storagePath = `documentos-gerados/${nomeArquivo}`;

    // Se o PDF foi enviado no request (multipart/form-data)
    let tamanho = 0;
    if (req.file) {
      // Upload para Supabase Storage (implementar se necessário)
      tamanho = req.file.size;
    }

    // Gerar hash
    const hash = crypto
      .createHash("md5")
      .update(JSON.stringify({ tipo, dados, timestamp }))
      .digest("hex");

    // Salvar no banco com Prisma
    const documento = await prisma.documentoGerado.create({
      data: {
        usuarioId,
        clienteId: clienteId || null,
        tipo,
        dados,
        storagePath,
        nomeArquivo,
        tamanho,
        hash,
        status: "gerado",
      },
    });

    return res.status(201).json({
      success: true,
      data: documento,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/documentos-gerados
 * Listar histórico de documentos gerados
 */
const listarDocumentos = async (req, res, next) => {
  try {
    const { tipo, clienteId, status, pagina = 1, limite = 20 } = req.query;

    // Usuário logado
    const usuarioId = req.usuario?.id;

    // Verificar se o model existe (pode não estar no schema ainda)
    if (!prisma.documentoGerado) {
      return res.json({
        success: true,
        data: [],
        total: 0,
        pagina: 1,
        totalPages: 0,
      });
    }

    if (!usuarioId) {
      return res.json({
        success: true,
        data: [],
        total: 0,
        pagina: 1,
        totalPages: 0,
      });
    }

    // Filtros
    const filtro = { usuarioId };
    if (tipo) filtro.tipo = tipo;
    if (clienteId) filtro.clienteId = clienteId;
    if (status) filtro.status = status;

    // Paginação
    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const pular = (paginaNum - 1) * limiteNum;

    // Buscar documentos
    const documentos = await prisma.documentoGerado.findMany({
      where: filtro,
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limiteNum,
      skip: pular,
    });

    // Total
    const total = await prisma.documentoGerado.count({ where: filtro });

    return res.json({
      success: true,
      data: documentos,
      paginacao: {
        pagina: paginaNum,
        limite: limiteNum,
        total,
        paginas: Math.ceil(total / limiteNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/documentos-gerados/:id
 * Obter documento por ID
 */
const getDocumento = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Usuário logado
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const documento = await prisma.documentoGerado.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            nomeFantasia: true,
            cnpj: true,
          },
        },
      },
    });

    if (!documento) {
      throw new AppError("Documento não encontrado", 404);
    }

    // Verificar se o usuário tem permissão
    if (documento.usuarioId !== usuarioId) {
      throw new AppError("Sem permissão para visualizar este documento", 403);
    }

    return res.json({
      success: true,
      data: documento,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/documentos-gerados/:id/download
 * Download do documento PDF
 */
const downloadDocumento = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Usuário logado
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const documento = await prisma.documentoGerado.findUnique({
      where: { id },
    });

    if (!documento) {
      throw new AppError("Documento não encontrado", 404);
    }

    // Verificar permissão
    if (documento.usuarioId !== usuarioId) {
      throw new AppError("Sem permissão para baixar este documento", 403);
    }

    // Se estiver usando Supabase Storage, retornar URL
    if (documento.storagePath) {
      return res.json({
        success: true,
        url: documento.storagePath,
        message: "Download via Supabase Storage",
      });
    }

    throw new AppError("Arquivo não disponível para download", 404);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/documentos-gerados/:id
 * Deletar documento
 */
const deletarDocumento = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Usuário logado
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const documento = await prisma.documentoGerado.findUnique({
      where: { id },
    });

    if (!documento) {
      throw new AppError("Documento não encontrado", 404);
    }

    // Verificar permissão
    if (documento.usuarioId !== usuarioId) {
      throw new AppError("Sem permissão para deletar este documento", 403);
    }

    // Remover arquivo físico se existir localmente
    // (Se estiver no Supabase, usar storage.delete)

    await prisma.documentoGerado.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Documento deletado com sucesso",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/documentos-gerados/:id/status
 * Atualizar status do documento
 */
const atualizarStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["gerado", "enviado", "arquivado"].includes(status)) {
      throw new AppError("Status inválido", 400);
    }

    // Usuário logado
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const documento = await prisma.documentoGerado.update({
      where: { id },
      data: { status },
    });

    if (!documento) {
      throw new AppError("Documento não encontrado", 404);
    }

    return res.json({
      success: true,
      data: documento,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/documentos-gerados/estatisticas
 * Obter estatísticas de documentos gerados
 */
const getEstatisticas = async (req, res, next) => {
  try {
    // Usuário logado
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    // Total geral
    const total = await prisma.documentoGerado.count({
      where: { usuarioId },
    });

    // Por tipo
    const porTipo = await prisma.documentoGerado.groupBy({
      by: ["tipo"],
      where: { usuarioId },
      _count: true,
    });

    // Por status
    const porStatus = await prisma.documentoGerado.groupBy({
      by: ["status"],
      where: { usuarioId },
      _count: true,
    });

    // Últimos 30 dias
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    const ultimos30Dias = await prisma.documentoGerado.count({
      where: {
        usuarioId,
        createdAt: { gte: trintaDiasAtras },
      },
    });

    return res.json({
      success: true,
      data: {
        total,
        porTipo,
        porStatus,
        ultimos30Dias,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/documentos-gerados/proximo-numero/:tipo
 * Obter próximo número sequencial para um tipo de documento hoje
 */
const getProximoNumero = async (req, res, next) => {
  try {
    const { tipo } = req.params;
    
    // Usuário logado
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      throw new AppError("Usuário não autenticado", 401);
    }

    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const fimDia = new Date();
    fimDia.setHours(23, 59, 59, 999);

    const count = await prisma.documentoGerado.count({
      where: {
        tipo,
        createdAt: {
          gte: inicioDia,
          lte: fimDia,
        },
      },
    });

    return res.json({
      success: true,
      proximo: count + 1,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  salvarDocumento,
  listarDocumentos,
  getDocumento,
  downloadDocumento,
  deletarDocumento,
  atualizarStatus,
  getEstatisticas,
  getProximoNumero,
};
