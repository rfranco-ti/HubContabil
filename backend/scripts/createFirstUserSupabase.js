/**
 * Script para Criar Primeiro Usuário no Supabase
 * 
 * Uso: node scripts/createFirstUserSupabase.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

async function createFirstUser() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('👥 CRIANDO PRIMEIRO USUÁRIO NO SUPABASE\n');

  try {
    // Conectar ao Prisma
    await prisma.$connect();
    console.log('🔗 Conectado ao Supabase!\n');

    // Verificar se já existe usuário
    const existingUser = await prisma.user.findFirst({
      where: { email: 'admin@hubcontabil.com' }
    });

    if (existingUser) {
      console.log('⚠️  Usuário admin já existe!');
      console.log('Email:', existingUser.email);
      console.log('Nome:', existingUser.nome);
      console.log('\n═══════════════════════════════════════════════════════\n');
      return;
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash('admin123', 10);
    console.log('🔐 Criptografando senha...');

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        nome: 'Administrador',
        email: 'admin@hubcontabil.com',
        senha: senhaHash,
        cargo: 'Sócio Diretor'
      }
    });

    console.log('✅ Usuário criado com sucesso!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 DADOS DE ACESSO\n');
    console.log('Email: admin@hubcontabil.com');
    console.log('Senha: admin123');
    console.log('Nome: Administrador');
    console.log('Cargo: Sócio Diretor');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n⚠️  ALTERE A SENHA APÓS O PRIMEIRO ACESSO!\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFirstUser();
