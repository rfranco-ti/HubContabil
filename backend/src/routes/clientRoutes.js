const express = require("express");
const router = express.Router();
const {
  consultarCnpjApi,
  consultarCnpjFresh,
  pesquisarEmpresa,
  criarCliente,
  getClientes,
  getClienteById,
  atualizarCliente,
  deletarCliente,
} = require("../controllers/clientController");
const {
  getConfigs,
  updateConfig,
  reorderConfigs,
} = require("../controllers/cnpjApiConfigController");
const { protect } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validator");
const {
  clienteSchema,
  clienteIdSchema,
  cnpjConsultaSchema,
  pesquisaEmpresaSchema,
} = require("../validators/clienteValidator");
const { CnpjaAdapter } = require("../services/cnpj/adapters/CnpjaAdapter");

/**
 * @route   POST /api/clientes/consulta-simples/:cnpj
 * @desc    Consulta Simples Nacional via Cnpja API (consome 1 crédito)
 * @access  Private
 */
/**
 * @route   GET /api/clientes/consulta-simples/:cnpj
 * @desc    Consulta Simples Nacional via Cnpja API (consome 1 crédito)
 * @access  Private
 */
router.get("/consulta-simples/:cnpj", protect, async (req, res) => {
  try {
    const cnpj = req.params.cnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) {
      return res.status(400).json({ message: "CNPJ deve ter 14 dígitos" });
    }

    const adapter = new CnpjaAdapter();
    const data = await adapter.fetchWithSimples(cnpj);

    res.json({ success: true, data });
  } catch (error) {
    console.error("Erro consulta simples:", error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/clientes/pesquisa:
 *   get:
 *     summary: Pesquisar empresas por nome ou razão social
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de pesquisa
 *     responses:
 *       200:
 *         description: Lista de empresas encontradas
 *       400:
 *         description: Termo de pesquisa obrigatório
 *       500:
 *         description: Erro na consulta
 */
router
  .route("/pesquisa")
  .get(protect, validate(pesquisaEmpresaSchema), pesquisarEmpresa);

/**
 * @swagger
 * /api/clientes/consulta/{cnpj}:
 *   get:
 *     summary: Consultar dados de empresa via CNPJ em APIs externas
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cnpj
 *         required: true
 *         schema:
 *           type: string
 *         description: CNPJ com 14 dígitos
 *     responses:
 *       200:
 *         description: Dados da empresa
 *       400:
 *         description: CNPJ inválido
 *       500:
 *         description: Erro na consulta
 */
router
  .route("/consulta/:cnpj")
  .get(protect, validate(cnpjConsultaSchema), consultarCnpjApi);

/**
 * @swagger
 * /api/clientes/consulta-fresh/{cnpj}:
 *   get:
 *     summary: Consultar dados de empresa via CNPJ em APIs externas (ignora cache)
 *     tags: [Clientes]
 *     parameters:
 *       - in: path
 *         name: cnpj
 *         required: true
 *         schema:
 *           type: string
 *         description: CNPJ da empresa (14 dígitos)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados da empresa retornados das APIs externas
 *       400:
 *         description: CNPJ inválido
 *       401:
 *         description: Não autorizado
 *       500:
 *         description: Erro na consulta
 */
router
  .route("/consulta-fresh/:cnpj")
  .get(protect, validate(cnpjConsultaSchema), consultarCnpjFresh);

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Cadastrar novo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       400:
 *         description: CNPJ já cadastrado ou dados inválidos
 *       500:
 *         description: Erro interno no servidor
 *   get:
 *     summary: Listar todos os clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 *       500:
 *         description: Erro ao buscar clientes
 */
router
  .route("/")
  .post(protect, validate(clienteSchema), criarCliente)
  .get(protect, getClientes);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Buscar cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Dados do cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro ao buscar cliente
 *   put:
 *     summary: Atualizar dados do cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Cliente atualizado
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro ao atualizar cliente
 *   delete:
 *     summary: Deletar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do cliente
 *     responses:
 *       200:
 *         description: Cliente excluído com sucesso
 *       404:
 *         description: Cliente não encontrado
 *       500:
 *         description: Erro ao deletar cliente
 */
router
  .route("/:id")
  .get(protect, validate(clienteIdSchema), getClienteById)
  .put(protect, validate(clienteIdSchema), atualizarCliente)
  .delete(protect, validate(clienteIdSchema), deletarCliente);

// ============================================
// CONFIGURAÇÃO DE APIs CNPJ (Admin)
// ============================================

/**
 * @route   GET /api/cnpj-api-config
 * @desc    Listar configurações de APIs CNPJ
 * @access  Private (Admin)
 */
router.get("/cnpj-api-config", protect, getConfigs);

/**
 * @route   PUT /api/cnpj-api-config/:id
 * @desc    Atualizar configuração de uma API
 * @access  Private (Admin)
 */
router.put("/cnpj-api-config/:id", protect, updateConfig);

/**
 * @route   PUT /api/cnpj-api-config/reorder
 * @desc    Reordenar APIs CNPJ
 * @access  Private (Admin)
 */
router.put("/cnpj-api-config/reorder", protect, reorderConfigs);

module.exports = router;
