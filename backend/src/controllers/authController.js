const AuthService = require("../services/authService");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @swagger
 * /api/auth/registrar:
 *   post:
 *     summary: Registrar um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome: { type: string }
 *               email: { type: string }
 *               senha: { type: string }
 *               cargo: { type: string }
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *       400:
 *         description: Erro na validação ou usuário já existe
 */
const registrarUsuario = asyncHandler(async (req, res) => {
  const result = await AuthService.registrar(req.body);
  res.status(201).json(result);
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email: { type: string }
 *               senha: { type: string }
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *       401:
 *         description: Credenciais inválidas
 */
const loginUsuario = asyncHandler(async (req, res) => {
  const { email, senha } = req.body;
  const result = await AuthService.login(email, senha);
  res.json(result);
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Renovar token de acesso
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Tokens renovados
 *       401:
 *         description: Refresh token inválido ou expirado
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await AuthService.refresh(refreshToken);
  res.json(result);
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout do usuário
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Logout realizado
 */
const logoutUsuario = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await AuthService.logout(refreshToken);
  res.json({ message: "Logout realizado com sucesso" });
});

module.exports = {
  registrarUsuario,
  loginUsuario,
  refreshAccessToken,
  logoutUsuario,
};
