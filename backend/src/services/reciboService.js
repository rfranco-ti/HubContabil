const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const prisma = require('../config/prisma');
const { storage } = require('../config/supabase');

/**
 * Service para geração e gestão de recibos
 * Implementação simplificada sem pdfme - usando pdf-lib para geração básica
 */

/**
 * Gerar PDF de recibo usando pdf-lib
 * @param {Object} dados - Dados para o recibo
 * @returns {Promise<Uint8Array>} - Buffer do PDF
 */
const gerarPDF = async (dados) => {
  try {
    // Criar novo documento PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    
    // Registrar fonte
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Cores
    const primaryColor = rgb(0.145, 0.388, 0.918); // #2563eb
    
    // Header
    page.drawRectangle({
      x: 0,
      y: height - 60,
      width: width,
      height: 60,
      color: primaryColor,
    });
    
    // Título
    page.drawText('RECIBO DE HONORÁRIOS', {
      x: width / 2 - 100,
      y: height - 35,
      size: 18,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
    
    // Dados do cliente
    let y = height - 100;
    const lineHeight = 20;
    
    page.drawText('CLIENTE:', {
      x: 50,
      y: y,
      size: 10,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    page.drawText(dados.cliente_nome || '', {
      x: 50,
      y: y - 15,
      size: 11,
      font: font,
    });
    
    page.drawText(`CNPJ: ${dados.cliente_cnpj || ''}`, {
      x: 50,
      y: y - 35,
      size: 9,
      font: font,
    });
    
    // Descrição
    y -= 70;
    page.drawText('DESCRIÇÃO:', {
      x: 50,
      y: y,
      size: 9,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    // Quebrar texto longo em múltiplas linhas
    const descricao = dados.descricao || '';
    const lines = page.drawTextWithFont(descricao, {
      font: font,
      size: 10,
      x: 50,
      y: y - 15,
      maxWidth: width - 100,
      lineHeight: 15,
    });
    
    // Valor
    y -= 120;
    page.drawText('VALOR:', {
      x: 50,
      y: y,
      size: 11,
      font: boldFont,
      color: rgb(0.3, 0.3, 0.3),
    });
    
    page.drawText(dados.valor || 'R$ 0,00', {
      x: 50,
      y: y - 20,
      size: 16,
      font: boldFont,
      color: primaryColor,
    });
    
    // Data e forma de pagamento
    y -= 50;
    page.drawText(`Data: ${dados.data || ''}`, {
      x: 50,
      y: y,
      size: 9,
      font: font,
    });
    
    if (dados.forma_pagamento) {
      page.drawText(`Forma de Pagamento: ${dados.forma_pagamento}`, {
        x: 50,
        y: y - 15,
        size: 9,
        font: font,
      });
    }
    
    // Observações
    if (dados.observacoes) {
      y -= 40;
      page.drawText('Observações:', {
        x: 50,
        y: y,
        size: 9,
        font: boldFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      page.drawText(dados.observacoes, {
        x: 50,
        y: y - 15,
        size: 8,
        font: font,
      });
    }
    
    // Linha de assinatura
    y -= 80;
    page.drawLine({
      start: { x: 50, y: y },
      end: { x: 250, y: y },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    page.drawText('Assinatura do Responsável', {
      x: 50,
      y: y - 15,
      size: 9,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
    
    // Serializar PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw new Error(`Falha na geração do PDF: ${error.message}`);
  }
};

/**
 * Upload do PDF para Supabase Storage
 * @param {Uint8Array} pdfBuffer - Buffer do PDF
 * @param {string} clienteId - ID do cliente
 * @param {string} reciboId - ID do recibo
 * @returns {Promise<string>} - URL pública do PDF
 */
const uploadPDFParaStorage = async (pdfBuffer, clienteId, reciboId) => {
  try {
    const bucket = process.env.STORAGE_BUCKET_DOCUMENTOS || 'documentos';
    const fileName = `recibos/${clienteId}/${reciboId}.pdf`;

    // Converter Uint8Array para Buffer
    const buffer = Buffer.from(pdfBuffer);

    // Upload
    await storage.upload(bucket, fileName, buffer, {
      contentType: 'application/pdf',
    });

    // Obter URL pública
    const publicUrl = storage.getPublicUrl(bucket, fileName);

    return publicUrl;
  } catch (error) {
    console.error('Erro ao upload PDF:', error);
    throw new Error(`Falha no upload do PDF: ${error.message}`);
  }
};

/**
 * Obter modelos de recibo
 * @param {string} tipo - Tipo de modelo ('avulso' ou 'honorario')
 * @param {string} usuarioId - ID do usuário (opcional, para modelos personalizados)
 * @returns {Promise<Array>} - Lista de modelos
 */
const getModelos = async (tipo, usuarioId = null) => {
  try {
    const where = { tipo };

    // Incluir modelos padrão E modelos do usuário
    if (usuarioId) {
      where.OR = [
        { isDefault: true },
        { usuarioId },
      ];
    } else {
      where.isDefault = true;
    }

    const modelos = await prisma.reciboModelo.findMany({
      where,
      orderBy: [
        { isDefault: 'desc' },
        { nome: 'asc' },
      ],
      select: {
        id: true,
        nome: true,
        tipo: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return modelos;
  } catch (error) {
    console.error('Erro ao buscar modelos:', error);
    throw new Error('Falha ao buscar modelos');
  }
};

/**
 * Obter modelo completo por ID
 * @param {string} id - ID do modelo
 * @returns {Promise<Object>} - Modelo completo
 */
const getModeloById = async (id) => {
  try {
    const modelo = await prisma.reciboModelo.findUnique({
      where: { id },
    });

    if (!modelo) {
      throw new Error('Modelo não encontrado');
    }

    return modelo;
  } catch (error) {
    console.error('Erro ao buscar modelo:', error);
    throw error;
  }
};

/**
 * Criar modelo personalizado
 * @param {Object} data - Dados do modelo
 * @returns {Promise<Object>} - Modelo criado
 */
const criarModelo = async (data) => {
  try {
    const modelo = await prisma.reciboModelo.create({
      data,
    });

    return modelo;
  } catch (error) {
    console.error('Erro ao criar modelo:', error);
    throw new Error('Falha ao criar modelo');
  }
};

/**
 * Deletar modelo (apenas personalizados)
 * @param {string} id - ID do modelo
 * @returns {Promise<void>}
 */
const deletarModelo = async (id) => {
  try {
    const modelo = await prisma.reciboModelo.findUnique({
      where: { id },
    });

    if (!modelo) {
      throw new Error('Modelo não encontrado');
    }

    if (modelo.isDefault) {
      throw new Error('Não é possível deletar modelos padrão');
    }

    await prisma.reciboModelo.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Erro ao deletar modelo:', error);
    throw error;
  }
};

/**
 * Gerar recibo e salvar no histórico
 * @param {Object} params - Parâmetros
 * @param {string} params.usuarioId - ID do usuário
 * @param {string} params.clienteId - ID do cliente
 * @param {string} params.modeloId - ID do modelo
 * @param {string} params.tipo - Tipo de recibo
 * @param {Object} params.dados - Dados do recibo
 * @returns {Promise<Object>} - Recibo gerado
 */
const gerarRecibo = async ({ usuarioId, clienteId, modeloId, tipo, dados }) => {
  try {
    // 1. Buscar modelo (para referência futura)
    const modelo = await getModeloById(modeloId);

    // 2. Validar tipo
    if (modelo.tipo !== tipo) {
      throw new Error('Tipo de modelo incompatível');
    }

    // 3. Gerar PDF (usando implementação simplificada com pdf-lib)
    const pdfBuffer = await gerarPDF(dados);

    // 4. Criar registro no banco
    const recibo = await prisma.recibo.create({
      data: {
        usuarioId,
        clienteId,
        modeloId,
        tipo,
        dados,
        valor: dados.valor || 0,
        status: 'gerado',
      },
    });

    // 5. Upload do PDF para storage
    try {
      const pdfUrl = await uploadPDFParaStorage(pdfBuffer, clienteId, recibo.id);

      // 6. Atualizar registro com URL
      await prisma.recibo.update({
        where: { id: recibo.id },
        data: { pdfUrl },
      });

      recibo.pdfUrl = pdfUrl;
    } catch (uploadError) {
      console.error('Erro ao fazer upload do PDF, mas recibo foi criado:', uploadError);
    }

    // 7. Retornar buffer do PDF e dados do recibo
    return {
      recibo,
      pdfBuffer,
    };
  } catch (error) {
    console.error('Erro ao gerar recibo:', error);
    throw error;
  }
};

/**
 * Listar recibos do histórico
 * @param {Object} params - Parâmetros de filtro
 * @param {string} params.usuarioId - ID do usuário
 * @param {string} params.clienteId - ID do cliente (opcional)
 * @param {string} params.tipo - Tipo (opcional)
 * @param {string} params.status - Status (opcional)
 * @returns {Promise<Array>} - Lista de recibos
 */
const listarRecibos = async ({ usuarioId, clienteId, tipo, status }) => {
  try {
    const where = { usuarioId };

    if (clienteId) {
      where.clienteId = clienteId;
    }

    if (tipo) {
      where.tipo = tipo;
    }

    if (status) {
      where.status = status;
    }

    const recibos = await prisma.recibo.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            cnpj: true,
          },
        },
        modelo: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return recibos;
  } catch (error) {
    console.error('Erro ao listar recibos:', error);
    throw new Error('Falha ao listar recibos');
  }
};

/**
 * Obter recibo por ID
 * @param {string} id - ID do recibo
 * @param {string} usuarioId - ID do usuário (para validação)
 * @returns {Promise<Object>} - Recibo
 */
const getReciboById = async (id, usuarioId) => {
  try {
    const recibo = await prisma.recibo.findUnique({
      where: { id },
      include: {
        cliente: {
          select: {
            id: true,
            razaoSocial: true,
            cnpj: true,
          },
        },
        modelo: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    });

    if (!recibo) {
      throw new Error('Recibo não encontrado');
    }

    // Validar permissão
    if (recibo.usuarioId !== usuarioId) {
      throw new Error('Sem permissão para visualizar este recibo');
    }

    return recibo;
  } catch (error) {
    console.error('Erro ao buscar recibo:', error);
    throw error;
  }
};

module.exports = {
  getModelos,
  getModeloById,
  criarModelo,
  deletarModelo,
  gerarRecibo,
  listarRecibos,
  getReciboById,
  gerarPDF,
};
