const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

/**
 * GET /api/usuarios
 * Listar todos os usuários (apenas admin)
 */
const listarUsuarios = async (req, res) => {
  try {
    console.log('=== GET /api/usuarios - Listar usuários ===');
    
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`✅ ${usuarios.length} usuários encontrados`);
    res.json({ success: true, data: usuarios });
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    res.status(500).json({ success: false, message: 'Erro ao listar usuários', error: error.message });
  }
};

/**
 * GET /api/usuarios/:id
 * Obter detalhes de um usuário específico (apenas admin)
 */
const obterUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== GET /api/usuarios/:id ===');
    console.log('ID:', id);

    const usuario = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    console.log('✅ Usuário encontrado:', usuario.nome);
    res.json({ success: true, data: usuario });
  } catch (error) {
    console.error('❌ Erro ao obter usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao obter usuário', error: error.message });
  }
};

/**
 * POST /api/usuarios
 * Criar novo usuário (apenas admin)
 */
const criarUsuario = async (req, res) => {
  try {
    console.log('\n=== POST /api/usuarios - Criar usuário ===');
    
    const { nome, email, senha, cargo } = req.body;
    console.log('Body recebido:', { nome, email, cargo });

    // Verificar se usuário já existe
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      console.log('ERRO: Usuário já existe com este email');
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário já existe com este e-mail' 
      });
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);
    console.log('Senha criptografada com bcrypt');

    // Criar usuário
    const usuario = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        cargo: cargo || 'Contador'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        createdAt: true
      }
    });

    console.log('✅ Usuário criado com sucesso! ID:', usuario.id);
    res.status(201).json({ 
      success: true, 
      data: usuario,
      message: 'Usuário criado com sucesso' 
    });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao criar usuário', error: error.message });
  }
};

/**
 * PUT /api/usuarios/:id
 * Atualizar usuário (apenas admin)
 */
const atualizarUsuario = async (req, res) => {
  try {
    console.log('\n=== PUT /api/usuarios/:id - Atualizar usuário ===');
    
    const { id } = req.params;
    const { nome, email, senha, cargo } = req.body;
    console.log('Body recebido:', { nome, email, cargo, temSenha: !!senha });

    // Verificar se usuário existe
    const usuarioExistente = await prisma.user.findUnique({ where: { id } });
    if (!usuarioExistente) {
      console.log('ERRO: Usuário não encontrado');
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Se email foi alterado, verificar se já existe
    if (email && email !== usuarioExistente.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        console.log('ERRO: Email já está em uso');
        return res.status(400).json({ success: false, message: 'Email já está em uso' });
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {
      nome: nome || usuarioExistente.nome,
      email: email || usuarioExistente.email,
      cargo: cargo || usuarioExistente.cargo
    };

    // Se senha foi fornecida, hash e atualizar
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      dadosAtualizacao.senha = await bcrypt.hash(senha, salt);
      console.log('Senha atualizada');
    }

    // Atualizar usuário
    const usuarioAtualizado = await prisma.user.update({
      where: { id },
      data: dadosAtualizacao,
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        updatedAt: true
      }
    });

    console.log('✅ Usuário atualizado com sucesso!');
    res.json({ 
      success: true, 
      data: usuarioAtualizado,
      message: 'Usuário atualizado com sucesso' 
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar usuário', error: error.message });
  }
};

/**
 * DELETE /api/usuarios/:id
 * Excluir usuário (apenas admin)
 */
const excluirUsuario = async (req, res) => {
  try {
    console.log('\n=== DELETE /api/usuarios/:id - Excluir usuário ===');
    
    const { id } = req.params;
    const adminId = req.usuario.id;
    console.log('ID do usuário a excluir:', id);
    console.log('ID do admin solicitante:', adminId);

    // Impedir que admin exclua a si mesmo
    if (id === adminId) {
      console.log('ERRO: Usuário não pode excluir a si mesmo');
      return res.status(400).json({ 
        success: false, 
        message: 'Você não pode excluir sua própria conta' 
      });
    }

    // Verificar se usuário existe
    const usuarioExistente = await prisma.user.findUnique({ where: { id } });
    if (!usuarioExistente) {
      console.log('ERRO: Usuário não encontrado');
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Excluir usuário
    await prisma.user.delete({ where: { id } });

    console.log('✅ Usuário excluído com sucesso!');
    res.json({ 
      success: true, 
      message: 'Usuário excluído com sucesso' 
    });
  } catch (error) {
    console.error('❌ Erro ao excluir usuário:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir usuário', error: error.message });
  }
};

module.exports = {
  listarUsuarios,
  obterUsuario,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario
};
