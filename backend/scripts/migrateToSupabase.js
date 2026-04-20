/**
 * Script de Migração: MongoDB → Supabase (PostgreSQL)
 * 
 * Uso: node scripts/migrateToSupabase.js
 * 
 * Pré-requisitos:
 * - MongoDB com dados
 * - Projeto Supabase criado
 * - .env configurado com DATABASE_URL e credenciais Supabase
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');
const { supabase, storage } = require('../config/supabase');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configurações de migração
const CONFIG = {
  mongodb: {
    uri: process.env.MONGODB_URI
  },
  storage: {
    bucketDocumentos: 'documentos',
    bucketThumbnails: 'thumbnails'
  },
  limits: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFilesPerClient: 50
  }
};

// Estatísticas da migração
const stats = {
  users: { migrated: 0, errors: 0 },
  clients: { migrated: 0, errors: 0 },
  cnaes: { migrated: 0, errors: 0 },
  qsa: { migrated: 0, errors: 0 },
  pastas: { migrated: 0, errors: 0 },
  documentos: { migrated: 0, errors: 0, skipped: 0 },
  storage: { uploaded: 0, failed: 0, totalBytes: 0 }
};

async function main() {
  console.log('🚀 Iniciando migração MongoDB → Supabase\n');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // 1. Conectar ao MongoDB
    console.log('📦 Conectando ao MongoDB...');
    await mongoose.connect(CONFIG.mongodb.uri);
    console.log('✅ MongoDB conectado!\n');

    // 2. Testar conexão com Supabase
    console.log('🔗 Testando conexão com Supabase...');
    await prisma.$connect();
    console.log('✅ Supabase conectado!\n');

    console.log('═══════════════════════════════════════════════════════\n');

    // 3. Iniciar migração
    await migrateUsers();
    await migrateClients();
    await migratePastas();
    await migrateDocumentos();

    // 4. Exibir estatísticas
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 ESTATÍSTICAS DA MIGRAÇÃO\n');
    printStats();

    console.log('\n✅ Migração concluída!\n');

  } catch (error) {
    console.error('\n❌ Erro crítico na migração:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    await prisma.$disconnect();
  }
}

async function migrateUsers() {
  console.log('👥 Migrando usuários...');
  
  const User = mongoose.model('User');
  const users = await User.find({});

  for (const user of users) {
    try {
      await prisma.user.create({
        data: {
          id: user._id.toString(),
          nome: user.nome,
          email: user.email,
          senha: user.senha,
          cargo: user.cargo || 'Contador',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
      stats.users.migrated++;
      console.log(`  ✅ ${user.email}`);
    } catch (error) {
      stats.users.errors++;
      console.error(`  ❌ ${user.email}: ${error.message}`);
    }
  }

  console.log(`   Total: ${stats.users.migrated} migrados, ${stats.users.errors} erros\n`);
}

async function migrateClients() {
  console.log('🏢 Migrando clientes...');
  
  const Client = mongoose.model('Client');
  const clients = await Client.find({}).populate('usuario_responsavel');

  for (const client of clients) {
    try {
      // Criar cliente
      await prisma.client.create({
        data: {
          id: client._id.toString(),
          cnpj: client.cnpj,
          razaoSocial: client.razao_social,
          nomeFantasia: client.nome_fantasia,
          dataAbertura: client.data_abertura,
          naturezaJuridica: client.natureza_juridica,
          inscricaoEstadual: client.inscricao_estadual,
          inscricaoMunicipal: client.inscricao_municipal,
          regimeTributario: client.regime_tributario,
          
          // CNAE Principal
          cnaePrincipalCodigo: client.cnae_principal?.codigo,
          cnaePrincipalDescricao: client.cnae_principal?.descricao,
          
          // Endereço
          enderecoCep: client.endereco?.cep,
          enderecoLogradouro: client.endereco?.logradouro,
          enderecoNumero: client.endereco?.numero,
          enderecoComplemento: client.endereco?.complemento,
          enderecoBairro: client.endereco?.bairro,
          enderecoCidade: client.endereco?.cidade,
          enderecoUf: client.endereco?.uf,
          
          // Contato
          contatoEmail: client.contato_principal?.email,
          contatoTelefone: client.contato_principal?.telefone,
          
          // Dossiê
          senhasPortais: client.senhas_portais || {},
          certificadoPossui: client.certificado_digital?.possui || false,
          certificadoSenha: client.certificado_digital?.senha,
          certificadoVencimento: client.certificado_digital?.vencimento,
          
          // Honorários
          honorariosValor: client.honorarios?.valor || 0,
          honorariosDiaVencimento: client.honorarios?.dia_vencimento,
          
          // Controle
          categoria: client.categoria || 'Serviços',
          isBpo: client.is_bpo || false,
          observacoes: client.observacoes,
          status: client.status || 'Ativo',
          
          usuarioResponsavelId: client.usuario_responsavel?._id?.toString(),
          
          createdAt: client.createdAt,
          updatedAt: client.updatedAt
        }
      });

      // Migrar CNAEs Secundários
      if (client.cnaes_secundarios?.length > 0) {
        for (const cnae of client.cnaes_secundarios) {
          try {
            await prisma.cnaeSecundario.create({
              data: {
                clientId: client._id.toString(),
                codigo: cnae.codigo,
                descricao: cnae.descricao
              }
            });
            stats.cnaes.migrated++;
          } catch (error) {
            stats.cnaes.errors++;
          }
        }
      }

      // Migrar QSA
      if (client.qsa?.length > 0) {
        for (const socio of client.qsa) {
          try {
            await prisma.clientQsa.create({
              data: {
                clientId: client._id.toString(),
                nome: socio.nome,
                cpfCnpj: socio.cpf_cnpj,
                qualificacao: socio.qualificacao,
                participacao: socio.participacao
              }
            });
            stats.qsa.migrated++;
          } catch (error) {
            stats.qsa.errors++;
          }
        }
      }

      stats.clients.migrated++;
      console.log(`  ✅ ${client.razao_social}`);
    } catch (error) {
      stats.clients.errors++;
      console.error(`  ❌ ${client.razao_social}: ${error.message}`);
    }
  }

  console.log(`   Total: ${stats.clients.migrated} migrados, ${stats.clients.errors} erros`);
  console.log(`   CNAEs: ${stats.cnaes.migrated} migrados, ${stats.cnaes.errors} erros`);
  console.log(`   QSA: ${stats.qsa.migrated} migrados, ${stats.qsa.errors} erros\n`);
}

async function migratePastas() {
  console.log('📁 Migrando pastas de documentos...');
  
  const PastaDocumento = mongoose.model('PastaDocumento');
  const pastas = await PastaDocumento.find({}).populate('cliente').populate('criada_por').populate('pasta_pai');

  for (const pasta of pastas) {
    try {
      await prisma.pastaDocumento.create({
        data: {
          id: pasta._id.toString(),
          clientId: pasta.cliente?._id.toString(),
          nome: pasta.nome,
          descricao: pasta.descricao,
          pastaPaiId: pasta.pasta_pai?._id?.toString(),
          criadaPorId: pasta.criada_por?._id?.toString(),
          createdAt: pasta.createdAt,
          updatedAt: pasta.updatedAt
        }
      });
      stats.pastas.migrated++;
      console.log(`  ✅ ${pasta.nome}`);
    } catch (error) {
      stats.pastas.errors++;
      console.error(`  ❌ ${pasta.nome}: ${error.message}`);
    }
  }

  console.log(`   Total: ${stats.pastas.migrated} migradas, ${stats.pastas.errors} erros\n`);
}

async function migrateDocumentos() {
  console.log('📄 Migrando documentos e arquivos...');
  
  const Documento = mongoose.model('Documento');
  const documentos = await Documento.find({})
    .populate('cliente')
    .populate('pasta')
    .populate('uploaded_by');

  for (const doc of documentos) {
    try {
      // Verificar limites
      if (stats.documentos.migrated >= CONFIG.limits.maxFilesPerClient) {
        console.log(`  ⚠️  Limite de arquivos por cliente atingido, pulando ${doc.nome_original}`);
        stats.documentos.skipped++;
        continue;
      }

      // Caminho do arquivo local
      const localPath = path.join(__dirname, '..', doc.path);
      
      // Verificar se arquivo existe localmente
      if (!fs.existsSync(localPath)) {
        console.log(`  ⚠️  Arquivo não encontrado: ${localPath}`);
        stats.documentos.skipped++;
        continue;
      }

      // Ler arquivo
      const fileBuffer = fs.readFileSync(localPath);
      
      // Verificar tamanho
      if (fileBuffer.length > CONFIG.limits.maxFileSize) {
        console.log(`  ⚠️  Arquivo muito grande: ${doc.nome_original} (${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB)`);
        stats.documentos.skipped++;
        continue;
      }

      // Caminho no Supabase Storage
      const storagePath = `${doc.cliente?._id}/${doc._id}_${doc.nome_arquivo}`;
      
      // Upload para Supabase
      try {
        await storage.upload(
          CONFIG.storage.bucketDocumentos,
          storagePath,
          fileBuffer,
          { contentType: doc.mimetype }
        );
        stats.storage.uploaded++;
        stats.storage.totalBytes += fileBuffer.length;
      } catch (error) {
        console.log(`  ❌ Erro no upload: ${doc.nome_original}`);
        stats.storage.failed++;
        stats.documentos.errors++;
        continue;
      }

      // Thumbnail path (se existir)
      let thumbnailPath = null;
      if (doc.thumbnail_path) {
        const thumbnailLocalPath = path.join(__dirname, '..', doc.thumbnail_path);
        if (fs.existsSync(thumbnailLocalPath)) {
          const thumbnailBuffer = fs.readFileSync(thumbnailLocalPath);
          const thumbnailStoragePath = `${doc.cliente?._id}/${doc._id}_thumb_${path.basename(doc.thumbnail_path)}`;
          
          try {
            await storage.upload(
              CONFIG.storage.bucketThumbnails,
              thumbnailStoragePath,
              thumbnailBuffer,
              { contentType: 'image/jpeg' }
            );
            thumbnailPath = thumbnailStoragePath;
          } catch (error) {
            console.log(`  ⚠️  Erro no upload da thumbnail: ${doc.nome_original}`);
          }
        }
      }

      // Criar registro no PostgreSQL
      await prisma.documento.create({
        data: {
          id: doc._id.toString(),
          clientId: doc.cliente?._id.toString(),
          nomeOriginal: doc.nome_original,
          nomeArquivo: doc.nome_arquivo,
          storagePath: storagePath,
          thumbnailPath: thumbnailPath,
          mimetype: doc.mimetype,
          tamanhoBytes: fileBuffer.length,
          tamanhoOriginalBytes: doc.tamanho,
          tipo: doc.tipo,
          descricao: doc.descricao,
          pastaId: doc.pasta?._id?.toString(),
          ocrRealizado: doc.ocr_realizado || false,
          ocrTexto: doc.ocr_texto,
          uploadedById: doc.uploaded_by?._id?.toString(),
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt
        }
      });

      stats.documentos.migrated++;
      console.log(`  ✅ ${doc.nome_original} (${(fileBuffer.length / 1024).toFixed(1)} KB)`);

    } catch (error) {
      stats.documentos.errors++;
      console.error(`  ❌ ${doc.nome_original}: ${error.message}`);
    }
  }

  const totalSizeMB = (stats.storage.totalBytes / 1024 / 1024).toFixed(2);
  console.log(`   Total: ${stats.documentos.migrated} migrados, ${stats.documentos.errors} erros, ${stats.documentos.skipped} pulados`);
  console.log(`   Storage: ${stats.storage.uploaded} uploads, ${stats.storage.failed} falhas, ${totalSizeMB} MB usados\n`);
}

function printStats() {
  console.log('┌─────────────────────────────────────────────────────┐');
  console.log(`│ Users:       ${String(stats.users.migrated).padStart(4)} migrados, ${String(stats.users.errors).padStart(4)} erros           │`);
  console.log(`│ Clients:     ${String(stats.clients.migrated).padStart(4)} migrados, ${String(stats.clients.errors).padStart(4)} erros           │`);
  console.log(`│ CNAEs:       ${String(stats.cnaes.migrated).padStart(4)} migrados, ${String(stats.cnaes.errors).padStart(4)} erros           │`);
  console.log(`│ QSA:         ${String(stats.qsa.migrated).padStart(4)} migrados, ${String(stats.qsa.errors).padStart(4)} erros           │`);
  console.log(`│ Pastas:      ${String(stats.pastas.migrated).padStart(4)} migradas, ${String(stats.pastas.errors).padStart(4)} erros           │`);
  console.log(`│ Documentos:  ${String(stats.documentos.migrated).padStart(4)} migrados, ${String(stats.documentos.errors).padStart(4)} erros, ${String(stats.documentos.skipped).padStart(4)} pulados │`);
  console.log(`│ Storage:     ${String(stats.storage.uploaded).padStart(4)} uploads, ${String(stats.storage.failed).padStart(4)} falhas, ${(stats.storage.totalBytes / 1024 / 1024).toFixed(2).padStart(6)} MB      │`);
  console.log('└─────────────────────────────────────────────────────┘');
}

main();
