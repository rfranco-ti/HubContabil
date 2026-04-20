const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Verificando usuários no banco de dados...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        cargo: true,
        createdAt: true,
      },
    });

    if (users.length === 0) {
      console.log('⚠️  Nenhum usuário encontrado no banco de dados.\n');
      
      // Criar usuário admin padrão
      console.log('📝 Criando usuário admin padrão...\n');
      
      const senhaHash = await bcrypt.hash('123456', 10);
      
      const admin = await prisma.user.create({
        data: {
          nome: 'Administrador',
          email: 'admin@hubcontabil.com',
          senha: senhaHash,
          cargo: 'Administrador',
        },
      });

      console.log('✅ Usuário criado com sucesso!\n');
      console.log('📋 Credenciais:');
      console.log('   Email: admin@hubcontabil.com');
      console.log('   Senha: 123456\n');
      console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');
    } else {
      console.log('✅ Usuários encontrados:\n');
      users.forEach((user) => {
        console.log(`   - ${user.nome} (${user.email}) - ${user.cargo}`);
      });
      console.log('\n💡 Dica: Se esqueceu a senha, você pode resetar manualmente no banco de dados.\n');
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
