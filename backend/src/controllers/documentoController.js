const prisma = require('../config/prisma');
const { storage } = require('../config/supabase');
const path = require('path');
const fs = require('fs');
const forge = require('node-forge');
const crypto = require('crypto');
const { encrypt } = require('../utils/cryptoUtils');
const queueService = require('../services/queueService');

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/x-x509-ca-cert', 'application/x-pkcs12'
];

const BUCKET_DOCUMENTOS = 'documentos';
const BUCKET_THUMBNAILS = 'thumbnails';

// Gerar caminho de storage organizado por CNPJ com nome seguro (UUID)
function gerarStoragePath(cliente, pasta, nomeArquivo) {
  const cnpj = cliente.cnpj.replace(/\D/g, ''); // Apenas números
  const pastaPath = pasta ? `${pasta.replace(/\//g, '_')}/` : '';
  const ext = path.extname(nomeArquivo);
  const nomeSeguro = crypto.randomUUID();
  return `clientes/${cnpj}/${pastaPath}${nomeSeguro}${ext}`;
}

// Gerar caminho de thumbnail
function gerarThumbnailPath(nomeArquivo) {
  const timestamp = Date.now();
  return `thumbs/${timestamp}_${path.basename(nomeArquivo)}.png`;
}

// Extrair metadados de certificado digital PFX/P12
function processarCertificado(buffer, senha) {
  try {
    const p12Der = buffer.toString('binary');
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, senha);

    // Encontrar o certificado principal
    let cert;
    for (const bagType in p12.getBags({ bagType: forge.pki.oids.certBag })) {
      const bags = p12.getBags({ bagType: forge.pki.oids.certBag })[bagType];
      if (bags && bags.length > 0) {
        cert = bags[0].cert;
        break;
      }
    }

    if (!cert) throw new Error('Não foi possível encontrar o certificado no arquivo P12/PFX');

    return {
      emissao: new Date(cert.validity.notBefore),
      vencimento: new Date(cert.validity.notAfter),
      subject: cert.subject.attributes.map(a => `${a.shortName || a.name}=${a.value}`).join(', ')
    };
  } catch (err) {
    console.error('[Certificado] Erro ao processar:', err.message);
    throw new Error('Senha incorreta ou arquivo de certificado inválido');
  }
}

// Upload de documento
const uploadDocumento = async (req, res) => {
  try {
    const { clienteId, pastaId, descricao, tipo } = req.body;
    const usuarioId = req.usuario?.id;

    if (!clienteId) {
      return res.status(400).json({ error: 'clienteId é obrigatório' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Buscar cliente e pasta
    const cliente = await prisma.client.findUnique({ where: { id: clienteId } });
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    let pasta = null;
    if (pastaId) {
      pasta = await prisma.pastaDocumento.findFirst({
        where: { id: pastaId, clientId: clienteId }
      });
      if (!pasta) {
        return res.status(404).json({ error: 'Pasta não encontrada' });
      }
    }

    const fileBuffer = fs.readFileSync(req.file.path);

    // 1. Validação de Magic Bytes
    const { fileTypeFromBuffer } = await import('file-type');
    const fileType = await fileTypeFromBuffer(fileBuffer);
    
    if (!fileType) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Tipo de arquivo desconhecido ou corrompido.' });
    }

    // 2. Validação contra Whitelist
    if (!ALLOWED_MIME_TYPES.includes(fileType.mime)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: `Tipo de arquivo não permitido: ${fileType.mime}` });
    }

    // Gerar nome de arquivo UUID seguro
    const ext = `.${fileType.ext}`;
    const safeFilename = crypto.randomUUID() + ext;

    // Upload para Supabase Storage
    const storagePath = gerarStoragePath(cliente, pasta?.nome, safeFilename);

    await storage.upload(BUCKET_DOCUMENTOS, storagePath, fileBuffer, {
      contentType: fileType.mime,
      upsert: false
    });

    // Gerar thumbnail se for imagem
    let thumbnailPath = null;
    if (req.file.mimetype.startsWith('image/')) {
      try {
        const thumbPath = gerarThumbnailPath(req.file.originalname);
        await storage.upload(BUCKET_THUMBNAILS, thumbPath, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: false
        });
        thumbnailPath = thumbPath;
      } catch (thumbErr) {
        console.log('[Upload] Thumbnail falhou, continuando:', thumbErr.message);
      }
    }

    // Salvar registro no banco
    const isCertificado = tipo === 'certificado_digital' || fileType.mime.includes('pkcs12') || req.file.originalname.toLowerCase().match(/\.(pfx|p12)$/);
    const initialStatus = isCertificado ? 'CONCLUIDO' : 'PENDENTE';

    const documento = await prisma.documento.create({
      data: {
        clientId: clienteId,
        nomeOriginal: req.file.originalname,
        nomeArquivo: safeFilename,
        storagePath,
        thumbnailPath,
        mimetype: fileType.mime,
        tamanhoBytes: req.file.size,
        tamanhoOriginalBytes: req.file.size,
        tipo: isCertificado ? 'certificado_digital' : (tipo || 'documento'),
        status: initialStatus,
        descricao,
        pastaId: pastaId || null,
        uploadedById: usuarioId || null
      },
      include: {
        client: { select: { razaoSocial: true, nomeFantasia: true } },
        pasta: { select: { nome: true } },
        uploadedBy: { select: { nome: true } }
      }
    });

    // Remover arquivo local temporário
    fs.unlinkSync(req.file.path);

    // Processamento especial para Certificado Digital
    if (tipo === 'certificado_digital' || path.extname(req.file.originalname).toLowerCase().match(/\.(pfx|p12)$/)) {
      const { senha } = req.body;
      if (!senha) {
        // Se for certificado mas não enviou senha, apenas logamos (o front deveria ter enviado)
        console.warn('[Upload] Certificado enviado sem senha para processamento de datas.');
      } else {
        try {
          const certInfo = processarCertificado(fileBuffer, senha);
          const encryptedSenha = encrypt(senha);

          await prisma.client.update({
            where: { id: clienteId },
            data: {
              certificadoPossui: true,
              certificadoSenha: encryptedSenha,
              certificadoEmissao: certInfo.emissao,
              certificadoVencimento: certInfo.vencimento
            }
          });
          console.log(`[Upload] Certificado processado para o cliente ${cliente.razaoSocial}. Vencimento: ${certInfo.vencimento}`);
        } catch (certErr) {
          console.error('[Upload] Falha ao processar metadados do certificado:', certErr.message);
          // Não falhamos o upload total se o processamento do certificado falhar (talvez senha errada),
          // mas o registro do documento já foi criado acima.
        }
      }
    } else {
      // Enviar para fila de processamento se não for certificado
      try {
        await queueService.enqueueDocumentOptimization(documento.id);
      } catch (queueErr) {
        console.error('[Upload] Falha ao adicionar à fila:', queueErr.message);
      }
    }

    res.status(201).json(documento);
  } catch (error) {
    console.error('[Upload] Erro:', error);
    res.status(500).json({ error: 'Erro ao fazer upload do documento', details: error.message });
  }
};

// Upload múltiplo
const uploadMultiplo = async (req, res) => {
  try {
    const { clienteId, pastaId, tipo } = req.body;
    const usuarioId = req.usuario?.id;

    if (!clienteId) {
      return res.status(400).json({ error: 'clienteId é obrigatório' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const cliente = await prisma.client.findUnique({ where: { id: clienteId } });
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    let pasta = null;
    if (pastaId) {
      pasta = await prisma.pastaDocumento.findFirst({
        where: { id: pastaId, clientId: clienteId }
      });
    }

    const resultados = [];
    const erros = [];

    for (const file of req.files) {
      try {
        const storagePath = gerarStoragePath(cliente, pasta?.nome, file.originalname);
        const fileBuffer = fs.readFileSync(file.path);

        await storage.upload(BUCKET_DOCUMENTOS, storagePath, fileBuffer, {
          contentType: file.mimetype,
          upsert: false
        });

        const documento = await prisma.documento.create({
          data: {
            clientId: clienteId,
            nomeOriginal: file.originalname,
            nomeArquivo: file.filename,
            storagePath,
            mimetype: file.mimetype,
            tamanhoBytes: file.size,
            tamanhoOriginalBytes: file.size,
            tipo: tipo || 'documento',
            pastaId: pastaId || null,
            uploadedById: usuarioId || null
          }
        });

        fs.unlinkSync(file.path);
        resultados.push({ arquivo: file.originalname, status: 'sucesso', documentoId: documento.id });
      } catch (err) {
        erros.push({ arquivo: file.originalname, erro: err.message });
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    res.status(201).json({
      sucesso: resultados.length,
      falhas: erros.length,
      resultados,
      erros
    });
  } catch (error) {
    console.error('[Upload Multiplo] Erro:', error);
    res.status(500).json({ error: 'Erro ao fazer uploads', details: error.message });
  }
};

// Listar documentos (com filtros)
const getDocumentos = async (req, res) => {
  try {
    const { clienteId, pastaId, tipo, search, page = 1, limit = 50 } = req.query;
    const usuarioId = req.usuario?.id;

    const where = {};
    if (clienteId) where.clientId = clienteId;
    if (pastaId) where.pastaId = pastaId;
    if (tipo) where.tipo = tipo;
    if (search) {
      where.OR = [
        { nomeOriginal: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [documentos, total] = await Promise.all([
      prisma.documento.findMany({
        where,
        include: {
          client: { select: { razaoSocial: true, nomeFantasia: true, cnpj: true } },
          pasta: { select: { nome: true } },
          uploadedBy: { select: { nome: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.documento.count({ where })
    ]);

    res.json({
      documentos,
      paginacao: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('[Listar] Erro:', error);
    res.status(500).json({ error: 'Erro ao listar documentos', details: error.message });
  }
};

// Documentos por cliente
const getDocumentosByCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const { pastaId, search } = req.query;

    const where = { clientId: clienteId };
    if (pastaId) where.pastaId = pastaId;
    if (search) {
      where.OR = [
        { nomeOriginal: { contains: search, mode: 'insensitive' } },
        { descricao: { contains: search, mode: 'insensitive' } }
      ];
    }

    const documentos = await prisma.documento.findMany({
      where,
      include: {
        pasta: { select: { nome: true } },
        uploadedBy: { select: { nome: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(documentos);
  } catch (error) {
    console.error('[Listar Cliente] Erro:', error);
    res.status(500).json({ error: 'Erro ao listar documentos do cliente', details: error.message });
  }
};

// Documento por ID
const getDocumentoById = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await prisma.documento.findUnique({
      where: { id },
      include: {
        client: { select: { razaoSocial: true, nomeFantasia: true, cnpj: true } },
        pasta: { select: { nome: true } },
        uploadedBy: { select: { nome: true } }
      }
    });

    if (!documento) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    res.json(documento);
  } catch (error) {
    console.error('[Detalhe] Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar documento', details: error.message });
  }
};

// Atualizar documento
const updateDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const { nomeOriginal, descricao, pastaId, tipo } = req.body;

    const documento = await prisma.documento.findUnique({ where: { id } });
    if (!documento) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const updated = await prisma.documento.update({
      where: { id },
      data: {
        ...(nomeOriginal && { nomeOriginal }),
        ...(descricao !== undefined && { descricao }),
        ...(pastaId !== undefined && { pastaId }),
        ...(tipo && { tipo })
      },
      include: {
        client: { select: { razaoSocial: true, nomeFantasia: true } },
        pasta: { select: { nome: true } }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('[Update] Erro:', error);
    res.status(500).json({ error: 'Erro ao atualizar documento', details: error.message });
  }
};

// Deletar documento
const deleteDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await prisma.documento.findUnique({ where: { id } });
    if (!documento) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    // Deletar do Supabase Storage
    await storage.delete(BUCKET_DOCUMENTOS, documento.storagePath);
    if (documento.thumbnailPath) {
      await storage.delete(BUCKET_THUMBNAILS, documento.thumbnailPath);
    }

    // Deletar do banco
    await prisma.documento.delete({ where: { id } });

    res.json({ message: 'Documento excluído com sucesso' });
  } catch (error) {
    console.error('[Delete] Erro:', error);
    res.status(500).json({ error: 'Erro ao excluir documento', details: error.message });
  }
};

// Download documento
const downloadDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await prisma.documento.findUnique({ where: { id } });
    if (!documento) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const fileBuffer = await storage.download(BUCKET_DOCUMENTOS, documento.storagePath);

    res.setHeader('Content-Type', documento.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${documento.nomeOriginal}"`);
    res.send(fileBuffer);
  } catch (error) {
    console.error('[Download] Erro:', error);
    res.status(500).json({ error: 'Erro ao baixar documento', details: error.message });
  }
};

// URL pública do documento
const getDocumentoUrl = async (req, res) => {
  try {
    const { id } = req.params;

    const documento = await prisma.documento.findUnique({ where: { id } });
    if (!documento) {
      return res.status(404).json({ error: 'Documento não encontrado' });
    }

    const url = storage.getPublicUrl(BUCKET_DOCUMENTOS, documento.storagePath);

    res.json({ url, documento });
  } catch (error) {
    console.error('[URL] Erro:', error);
    res.status(500).json({ error: 'Erro ao gerar URL', details: error.message });
  }
};

// ===== PASTAS =====

// Criar pasta
const criarPasta = async (req, res) => {
  try {
    const { clientId, nome, descricao, pastaPaiId } = req.body;
    const usuarioId = req.usuario?.id;

    if (!clientId || !nome) {
      return res.status(400).json({ error: 'clientId e nome são obrigatórios' });
    }

    const cliente = await prisma.client.findUnique({ where: { id: clientId } });
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    // Verificar pasta pai se fornecida
    if (pastaPaiId) {
      const pai = await prisma.pastaDocumento.findFirst({
        where: { id: pastaPaiId, clientId }
      });
      if (!pai) {
        return res.status(404).json({ error: 'Pasta pai não encontrada' });
      }
    }

    const pasta = await prisma.pastaDocumento.create({
      data: {
        clientId,
        nome,
        descricao,
        pastaPaiId: pastaPaiId || null,
        criadaPorId: usuarioId || null
      },
      include: {
        client: { select: { razaoSocial: true } },
        criadaPor: { select: { nome: true } },
        pastaPai: { select: { nome: true } }
      }
    });

    res.status(201).json(pasta);
  } catch (error) {
    console.error('[Criar Pasta] Erro:', error);
    res.status(500).json({ error: 'Erro ao criar pasta', details: error.message });
  }
};

// Listar pastas de um cliente
const listarPastas = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const { pastaPaiId } = req.query;

    const where = { clientId: clienteId };
    if (pastaPaiId !== undefined) {
      where.pastaPaiId = pastaPaiId === 'null' ? null : pastaPaiId;
    }

    const pastas = await prisma.pastaDocumento.findMany({
      where,
      include: {
        _count: {
          select: { documentos: true, filhos: true }
        }
      },
      orderBy: { nome: 'asc' }
    });

    res.json(pastas);
  } catch (error) {
    console.error('[Listar Pastas] Erro:', error);
    res.status(500).json({ error: 'Erro ao listar pastas', details: error.message });
  }
};

// Pasta por ID
const getPastaById = async (req, res) => {
  try {
    const { id } = req.params;

    const pasta = await prisma.pastaDocumento.findUnique({
      where: { id },
      include: {
        documentos: { orderBy: { createdAt: 'desc' } },
        filhos: true,
        criadaPor: { select: { nome: true } }
      }
    });

    if (!pasta) {
      return res.status(404).json({ error: 'Pasta não encontrada' });
    }

    res.json(pasta);
  } catch (error) {
    console.error('[Detalhe Pasta] Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar pasta', details: error.message });
  }
};

// Atualizar pasta
const atualizarPasta = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, pastaPaiId } = req.body;

    const pasta = await prisma.pastaDocumento.findUnique({ where: { id } });
    if (!pasta) {
      return res.status(404).json({ error: 'Pasta não encontrada' });
    }

    const updated = await prisma.pastaDocumento.update({
      where: { id },
      data: {
        ...(nome && { nome }),
        ...(descricao !== undefined && { descricao }),
        ...(pastaPaiId !== undefined && { pastaPaiId })
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('[Update Pasta] Erro:', error);
    res.status(500).json({ error: 'Erro ao atualizar pasta', details: error.message });
  }
};

// Deletar pasta
const deletarPasta = async (req, res) => {
  try {
    const { id } = req.params;

    const pasta = await prisma.pastaDocumento.findUnique({
      where: { id },
      include: { _count: { select: { documentos: true, filhos: true } } }
    });

    if (!pasta) {
      return res.status(404).json({ error: 'Pasta não encontrada' });
    }

    if (pasta._count.documentos > 0 || pasta._count.filhos > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir uma pasta com documentos ou subpastas'
      });
    }

    await prisma.pastaDocumento.delete({ where: { id } });

    res.json({ message: 'Pasta excluída com sucesso' });
  } catch (error) {
    console.error('[Delete Pasta] Erro:', error);
    res.status(500).json({ error: 'Erro ao excluir pasta', details: error.message });
  }
};

module.exports = {
  uploadDocumento,
  uploadMultiplo,
  getDocumentos,
  getDocumentosByCliente,
  getDocumentoById,
  updateDocumento,
  deleteDocumento,
  downloadDocumento,
  getDocumentoUrl,
  criarPasta,
  listarPastas,
  getPastaById,
  atualizarPasta,
  deletarPasta
};
