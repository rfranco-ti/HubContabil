const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma = require("../config/prisma");

const gerarAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "fallback-key-change-in-production",
    { expiresIn: "8h" },
  );
};

const gerarRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || "fallback-refresh-change-in-production",
    { expiresIn: "7d" },
  );
};

const registrarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, cargo } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Usuario ja existe com este e-mail" });
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        cargo: cargo || "Contador",
      },
    });

    if (user) {
      const accessToken = gerarAccessToken(user.id);
      const refreshToken = gerarRefreshToken(user.id);
      const refreshHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: refreshHash },
      });

      res.status(201).json({
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        accessToken,
        refreshToken,
      });
    } else {
      res.status(400).json({ message: "Dados invalidos" });
    }
  } catch (error) {
    console.error("Erro ao registrar usuario:", error);
    res
      .status(500)
      .json({ message: "Erro interno no servidor", error: error.message });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, senha } = req.body;

    console.log("[LOGIN] Body recebido:", JSON.stringify(req.body));
    console.log("[LOGIN] Email:", email, "| Senha length:", senha?.length);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      console.log("[LOGIN] Usuario nao encontrado com email:", email);
      return res.status(401).json({ message: "E-mail ou senha invalidos" });
    }

    console.log("[LOGIN] Usuario encontrado, comparando senhas...");
    console.log("[LOGIN] Hash no DB:", user.senha.substring(0, 30) + "...");

    const senhaMatch = await bcrypt.compare(senha, user.senha);
    console.log("[LOGIN] bcrypt.compare result:", senhaMatch);

    if (!senhaMatch) {
      console.log("[LOGIN] Senha NAO confere!");
      return res.status(401).json({ message: "E-mail ou senha invalidos" });
    }

    console.log("[LOGIN] Login OK! Gerando tokens...");

    const accessToken = gerarAccessToken(user.id);
    const refreshToken = gerarRefreshToken(user.id);
    const refreshHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshHash },
    });

    res.json({
      id: user.id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    res
      .status(500)
      .json({ message: "Erro interno no servidor", error: error.message });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token obrigatorio" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "fallback-refresh-change-in-production",
    );

    const refreshHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || user.refreshToken !== refreshHash) {
      return res
        .status(401)
        .json({ message: "Refresh token invalido ou revogado" });
    }

    const newAccessToken = gerarAccessToken(user.id);
    const newRefreshToken = gerarRefreshToken(user.id);
    const newRefreshHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshHash },
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    res.status(401).json({ message: "Refresh token invalido ou expirado" });
  }
};

const logoutUsuario = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const refreshHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");
      const user = await prisma.user.findFirst({
        where: { refreshToken: refreshHash },
      });
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null },
        });
      }
    }
    res.json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  refreshAccessToken,
  logoutUsuario,
};
