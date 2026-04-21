const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { AppError } = require('../middlewares/errorHandler');

class AuthService {
  static gerarAccessToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'fallback-key-change-in-production',
      { expiresIn: '8h' }
    );
  }

  static gerarRefreshToken(userId) {
    return jwt.sign(
      { id: userId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-change-in-production',
      { expiresIn: '7d' }
    );
  }

  static hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static async registrar(dados) {
    const { nome, email, senha, cargo } = dados;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      throw new AppError('Usuário já existe com este e-mail', 400);
    }

    const senhaHash = await bcrypt.hash(senha, 12);

    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        cargo: cargo || 'Contador'
      }
    });

    const accessToken = this.gerarAccessToken(user.id);
    const refreshToken = this.gerarRefreshToken(user.id);
    const refreshHash = this.hashToken(refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshHash }
    });

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      accessToken,
      refreshToken
    };
  }

  static async login(email, senha) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(senha, user.senha))) {
      throw new AppError('E-mail ou senha inválidos', 401);
    }

    const accessToken = this.gerarAccessToken(user.id);
    const refreshToken = this.gerarRefreshToken(user.id);
    const refreshHash = this.hashToken(refreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshHash }
    });

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      cargo: user.cargo,
      accessToken,
      refreshToken
    };
  }

  static async refresh(token) {
    if (!token) throw new AppError('Refresh token obrigatório', 401);

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_SECRET || 'fallback-refresh-change-in-production'
      );

      const refreshHash = this.hashToken(token);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user || user.refreshToken !== refreshHash) {
        throw new AppError('Refresh token inválido ou revogado', 401);
      }

      const newAccessToken = this.gerarAccessToken(user.id);
      const newRefreshToken = this.gerarRefreshToken(user.id);
      const newRefreshHash = this.hashToken(newRefreshToken);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshHash }
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (err) {
      throw new AppError('Refresh token inválido ou expirado', 401);
    }
  }

  static async logout(token) {
    if (!token) return;

    const refreshHash = this.hashToken(token);
    const user = await prisma.user.findFirst({
      where: { refreshToken: refreshHash }
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null }
      });
    }
  }
}

module.exports = AuthService;
