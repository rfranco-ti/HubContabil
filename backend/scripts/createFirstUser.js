/**
 * Script para criar o primeiro usuário do sistema
 * Executar: node scripts/createFirstUser.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createFirstUser = async () => {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado!');

    // Verificar se já existe usuário
    const existingUser = await User.findOne({ email: 'admin@hubcontabil.com' });
    
    if (existingUser) {
      console.log('⚠️  Usuário admin já existe!');
      console.log('Email: admin@hubcontabil.com');
      await mongoose.disconnect();
      return;
    }

    // Criar usuário admin
    const adminUser = await User.create({
      nome: 'Administrador',
      email: 'admin@hubcontabil.com',
      senha: 'admin123',
      cargo: 'Sócio Diretor'
    });

    console.log('✅ Usuário criado com sucesso!');
    console.log('-----------------------------------');
    console.log('Email: admin@hubcontabil.com');
    console.log('Senha: admin123');
    console.log('-----------------------------------');
    console.log('⚠️  ALTERE A SENHA APÓS O PRIMEIRO ACESSO!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    process.exit(1);
  }
};

createFirstUser();
