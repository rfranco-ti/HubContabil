const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

const authMiddleware = async (req, res, next) => {
  let token;
  const secret = process.env.JWT_SECRET || "chave_super_secreta_padrao_mudar_depois";

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, secret);

      // Buscar usuário no Prisma
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          nome: true,
          email: true,
          cargo: true,
        },
      });

      if (!user) {
        console.warn(`[AUTH] Usuário não encontrado para o ID: ${decoded.id}`);
        return res.status(401).json({
          success: false,
          error: "Não autorizado, usuário não encontrado",
        });
      }

      req.usuario = user;
      next();
    } catch (error) {
      console.error("[AUTH] Falha na verificação do token:", error.message);
      return res.status(401).json({
        success: false,
        error: "Não autorizado, falha na verificação do token",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Não autorizado, nenhum token fornecido",
    });
  }
};

/**
 * Middleware que verifica se o usuário tem cargo de Admin
 * Deve ser usado APÓS o middleware `protect`
 *
 * Aceita: 'Admin', 'admin', 'Administrador', 'administrador'
 */
const adminOnly = async (req, res, next) => {
  const cargo = req.usuario?.cargo;

  if (!cargo) {
    return res.status(403).json({
      success: false,
      error: "Acesso negado. Cargo não definido.",
      cargoRequerido: "Admin ou Administrador",
    });
  }

  const cargoLower = cargo.toLowerCase();
  const isAdmin = cargoLower === "admin" || cargoLower === "administrador";

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      error:
        "Acesso negado. Apenas administradores podem realizar esta operação.",
      cargoRequerido: "Admin ou Administrador",
      seuCargo: cargo,
    });
  }

  next();
};

const protect = authMiddleware;

module.exports = {
  authMiddleware,
  protect,
  adminOnly,
};
