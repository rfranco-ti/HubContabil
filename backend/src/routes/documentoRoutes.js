const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { protect: authMiddleware } = require('../middlewares/authMiddleware');
const {
  uploadDocumento,
  uploadMultiplo,
  getDocumentos,
  getDocumentosByCliente,
  getDocumentoById,
  updateDocumento,
  deleteDocumento,
  downloadDocumento,
  criarPasta,
  listarPastas,
  getPastaById,
  atualizarPasta,
  deletarPasta
} = require('../controllers/documentoController');

/**
 * @swagger
 * tags:
 *   name: Documentos
 *   description: Gestão de documentos contábeis com armazenamento no Supabase
 */

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * @swagger
 * /api/documentos/upload:
 *   post:
 *     summary: Upload de documento único
 *     tags: [Documentos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documento:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Documento enviado com sucesso
 *       500:
 *         description: Erro no upload
 */
router.post('/upload', upload.single('documento'), uploadDocumento);

/**
 * @swagger
 * /api/documentos/upload-multiplo:
 *   post:
 *     summary: Upload de múltiplos documentos (máx 10)
 *     tags: [Documentos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documentos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Documentos enviados com sucesso
 *       500:
 *         description: Erro no upload
 */
router.post('/upload-multiplo', upload.array('documentos', 10), uploadMultiplo);

/**
 * @swagger
 * /api/documentos:
 *   get:
 *     summary: Listar todos os documentos
 *     tags: [Documentos]
 *     responses:
 *       200:
 *         description: Lista de documentos
 *       500:
 *         description: Erro ao buscar documentos
 */
router.get('/', getDocumentos);

/**
 * @swagger
 * /api/documentos/cliente/{clienteId}:
 *   get:
 *     summary: Listar documentos de um cliente
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de documentos do cliente
 *       500:
 *         description: Erro ao buscar documentos
 */
router.get('/cliente/:clienteId', getDocumentosByCliente);

/**
 * @swagger
 * /api/documentos/{id}:
 *   get:
 *     summary: Buscar documento por ID
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do documento
 *       404:
 *         description: Documento não encontrado
 *   put:
 *     summary: Atualizar documento
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Documento atualizado
 *       404:
 *         description: Documento não encontrado
 *   delete:
 *     summary: Deletar documento
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Documento deletado
 *       404:
 *         description: Documento não encontrado
 */
router.route('/:id')
  .get(getDocumentoById)
  .put(updateDocumento)
  .delete(deleteDocumento);

/**
 * @swagger
 * /api/documentos/{id}/download:
 *   get:
 *     summary: Download de documento
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Arquivo para download
 *       404:
 *         description: Documento não encontrado
 */
router.get('/:id/download', downloadDocumento);

/**
 * @swagger
 * /api/documentos/pastas:
 *   post:
 *     summary: Criar pasta para organizar documentos
 *     tags: [Documentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Pasta criada com sucesso
 *       500:
 *         description: Erro ao criar pasta
 */
router.post('/pastas', criarPasta);

/**
 * @swagger
 * /api/documentos/pastas/{clienteId}:
 *   get:
 *     summary: Listar pastas de um cliente
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de pastas
 *       500:
 *         description: Erro ao buscar pastas
 */
router.get('/pastas/:clienteId', listarPastas);

/**
 * @swagger
 * /api/documentos/pastas/detalhe/{id}:
 *   get:
 *     summary: Buscar pasta por ID
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados da pasta
 *       404:
 *         description: Pasta não encontrada
 */
router.get('/pastas/detalhe/:id', getPastaById);

/**
 * @swagger
 * /api/documentos/pastas/{id}:
 *   put:
 *     summary: Atualizar pasta
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pasta atualizada
 *       404:
 *         description: Pasta não encontrada
 *   delete:
 *     summary: Deletar pasta
 *     tags: [Documentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pasta deletada
 *       404:
 *         description: Pasta não encontrada
 */
router.route('/pastas/:id')
  .put(atualizarPasta)
  .delete(deletarPasta);

module.exports = router;
