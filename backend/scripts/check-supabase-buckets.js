/**
 * Script para verificar e criar buckets do Supabase Storage se necessário
 * Executar: node scripts/check-supabase-buckets.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY não configuradas no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Buckets necessários
const requiredBuckets = [
  { name: 'documentos', public: false, fileSizeLimit: '5MB' },
  { name: 'thumbnails', public: true, fileSizeLimit: '100KB' }
];

/**
 * Verificar se bucket existe
 */
async function checkBucketExists(bucketName) {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      throw new Error(`Erro ao listar buckets: ${error.message}`);
    }

    return data.some(bucket => bucket.name === bucketName);
  } catch (error) {
    console.error(`❌ Erro ao verificar bucket "${bucketName}":`, error.message);
    return false;
  }
}

/**
 * Criar bucket
 */
async function createBucket(bucketName, isPublic, fileSizeLimit) {
  try {
    console.log(`📦 Criando bucket "${bucketName}"...`);
    
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: isPublic,
      fileSizeLimit: fileSizeLimit
    });

    if (error) {
      throw new Error(`Erro ao criar bucket: ${error.message}`);
    }

    console.log(`✅ Bucket "${bucketName}" criado com sucesso!`);
    return data;
  } catch (error) {
    console.error(`❌ Falha ao criar bucket "${bucketName}":`, error.message);
    throw error;
  }
}

/**
 * Listar buckets existentes
 */
async function listBuckets() {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      throw new Error(`Erro ao listar buckets: ${error.message}`);
    }

    console.log('\n📋 Buckets existentes:');
    data.forEach(bucket => {
      console.log(`  ✓ ${bucket.name}`);
      console.log(`    Público: ${bucket.public ? 'Sim' : 'Não'}`);
      console.log(`    Limite: ${(bucket.file_size_limit / 1024 / 1024).toFixed(2)} MB`);
      console.log(`    Criado em: ${bucket.created_at}`);
      console.log('');
    });

    return data;
  } catch (error) {
    console.error('❌ Erro ao listar buckets:', error.message);
    return [];
  }
}

/**
 * Main
 */
async function main() {
  console.log('🔍 Verificando buckets do Supabase Storage...\n');
  console.log(`📡 Conectando a: ${supabaseUrl}`);
  console.log('');

  for (const bucket of requiredBuckets) {
    const exists = await checkBucketExists(bucket.name);

    if (exists) {
      console.log(`✅ Bucket "${bucket.name}" já existe`);
    } else {
      console.log(`⚠️  Bucket "${bucket.name}" NÃO encontrado`);
      try {
        await createBucket(bucket.name, bucket.public, bucket.fileSizeLimit);
      } catch (error) {
        console.error(`   Ação manual necessária: Crie o bucket "${bucket.name}" no Dashboard do Supabase`);
      }
    }
    console.log('');
  }

  // Listar todos os buckets
  await listBuckets();

  console.log('✨ Verificação concluída!');
  console.log('');
  console.log('💡 Se buckets foram criados, você pode remover esta verificação do projeto.');
  console.log('   Os buckets só precisam ser criados uma vez.');
}

main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
