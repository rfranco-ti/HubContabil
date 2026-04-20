const express = require('express');
const router = express.Router();
const {
  listarUsuarios,
  obterUsuario,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario
} = require('../controllers/usuarioController');
const { protect } = require('../middlewares/authMiddleware');
const requireAdmin = require('../middlewares/adminMiddleware');
const validate = require('../middlewares/validator');
const {
  criarUsuarioSchema,
  atualizarUsuarioSchema,
  usuarioIdSchema
} = require('../validators/usuarioValidator');

/**
 * @swagger
 * tags:
 *   - name: Usuários
 *     description: Gestão de usuários (apenas admin)
 */

// Todas as rotas são protegidas e requerem admin
router.use(protect);
router.use(requireAdmin);

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Listar todos os usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 */
router.get('/', listarUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obter detalhes de um usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário encontrado
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', validate(usuarioIdSchema), obterUsuario);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Criar novo usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               cargo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', validate(criarUsuarioSchema), criarUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Atualizar usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               cargo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       404:
 *         description: Usuário não encontrado
 */
router.put('/:id', validate(atualizarUsuarioSchema), atualizarUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Excluir usuário
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuário excluído
 *       400:
 *         description: Não pode excluir a si mesmo
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/:id', validate(usuarioIdSchema), excluirUsuario);

module.exports = router;
