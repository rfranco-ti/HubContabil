const prisma = require('../config/prisma');

/**
 * Middleware para verificar se o usuário é admin
 * Deve ser usado APÓS o middleware de autenticação (protect)
 */
const requireAdmin = async (req, res, next) => {
  try {
    const userId = req.usuario?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Não autenticado' 
      });
    }

    // Buscar usuário para verificar cargo/permissões
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        nome: true, 
        email: true,
        cargo: true 
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    // Verificar se é admin (pode ser por cargo ou flag explícito)
    // Por enquanto, vamos verificar se o email contém "admin" ou cargo é "Administrador"
    const isAdmin = user.cargo === 'Administrador' || 
                    user.email.toLowerCase().includes('admin');

    if (!isAdmin) {
      console.log(`Acesso negado: Usuário ${user.email} não é admin`);
      return res.status(403).json({ 
        success: false, 
        message: 'Acesso negado. Apenas administradores podem realizar esta operação' 
      });
    }

    console.log(`✅ Admin verificado: ${user.email}`);
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Erro no middleware requireAdmin:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao verificar permissões de admin' 
    });
  }
};

module.exports = requireAdmin;
