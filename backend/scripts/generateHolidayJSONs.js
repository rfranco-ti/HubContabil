/**
 * Script para gerar JSONs de feriados para o calendário
 * 
 * Uso: node scripts/generateHolidayJSONs.js
 * 
 * Gera:
 * - frontend/src/data/feriados_nacionais_2026.json
 * - frontend/src/data/feriados_estaduais_BA_2026.json
 * - frontend/src/data/feriados_municipais_BA_2026.json
 */

const fs = require('fs');
const path = require('path');

// Ano de referência
const YEAR = '2026';

// Caminhos
const SOURCE_JSON = path.join(__dirname, '..', '..', 'docs', 'feriados_municipais_2026.json');
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'frontend', 'src', 'data');

// API Feriados
const API_KEY = 'sk_live_89f287f124142457e616e98e5431fe8b28f1724081152a11';
const API_BASE = 'https://feriadosapi.com/api/v1';

async function fetchFromAPI(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}?ano=${YEAR}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API retornou ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erro ao buscar ${endpoint}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📦 Gerando JSONs de Feriados (${YEAR})`);
  console.log('═══════════════════════════════════════════════════════\n');

  // Criar diretório de saída
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log('✅ Diretório criado:', OUTPUT_DIR);
  }

  // 1. Feriados Nacionais
  console.log('📋 Buscando feriados nacionais...');
  const nacionais = await fetchFromAPI('/feriados/nacionais');
  
  if (nacionais && nacionais.feriados) {
    const nacionaisSimples = nacionais.feriados.map(f => ({
      data: f.data,
      nome: f.nome,
      tipo: 'NACIONAL',
      descricao: f.descricao,
      bancario: f.bancario
    }));
    
    const outputPath = path.join(OUTPUT_DIR, `feriados_nacionais_${YEAR}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(nacionaisSimples, null, 2), 'utf-8');
    console.log(`✅ Feriados nacionais salvos: ${nacionaisSimples.length} feriados`);
    console.log(`   Arquivo: ${outputPath}\n`);
  }

  // 2. Feriados Estaduais BA
  console.log('📋 Buscando feriados estaduais da Bahia...');
  const estaduais = await fetchFromAPI('/feriados/estado/BA');
  
  if (estaduais && estaduais.feriados) {
    const estaduaisSimples = estaduais.feriados.map(f => ({
      data: f.data,
      nome: f.nome,
      tipo: 'ESTADUAL',
      descricao: f.descricao,
      uf: 'BA',
      bancario: f.bancario
    }));
    
    const outputPath = path.join(OUTPUT_DIR, `feriados_estaduais_BA_${YEAR}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(estaduaisSimples, null, 2), 'utf-8');
    console.log(`✅ Feriados estaduais BA salvos: ${estaduaisSimples.length} feriados`);
    console.log(`   Arquivo: ${outputPath}\n`);
  }

  // 3. Feriados Municipais BA (filtrar do JSON existente)
  console.log('📋 Filtrando feriados municipais da Bahia...');
  
  let municipaisBA = [];
  
  if (!fs.existsSync(SOURCE_JSON)) {
    console.log(`❌ Arquivo não encontrado: ${SOURCE_JSON}`);
    console.log('   Pulando feriados municipais...\n');
  } else {
    const sourceData = JSON.parse(fs.readFileSync(SOURCE_JSON, 'utf-8'));
    
    // Filtrar apenas BA
    municipaisBA = sourceData.filter(f => f.uf === 'BA');
    
    // Adicionar nome do município (opcional, aumenta tamanho)
    const municipaisSimples = municipaisBA.map(f => ({
      data: f.data,
      nome: f.nome,
      tipo: 'MUNICIPAL',
      descricao: f.descricao,
      uf: 'BA',
      codigo_ibge: f.codigo_ibge
    }));
    
    const outputPath = path.join(OUTPUT_DIR, `feriados_municipais_BA_${YEAR}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(municipaisSimples, null, 2), 'utf-8');
    
    const municipiosUnicos = new Set(municipaisBA.map(f => f.codigo_ibge)).size;
    console.log(`✅ Feriados municipais BA salvos: ${municipaisSimples.length} feriados`);
    console.log(`   Municípios: ${municipiosUnicos}`);
    console.log(`   Arquivo: ${outputPath}`);
    console.log(`   Tamanho: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB\n`);
  }

  // 4. Criar arquivo consolidado (opcional)
  console.log('📋 Criando arquivo consolidado (todos feriados BA)...');
  
  const todosFeriados = [
    ...(nacionais?.feriados || []).map(f => ({ ...f, scope: 'nacional' })),
    ...(estaduais?.feriados || []).map(f => ({ ...f, scope: 'estadual' })),
    ...municipaisBA.map(f => ({ ...f, scope: 'municipal' }))
  ];
  
  const outputPath = path.join(OUTPUT_DIR, `feriados_BA_consolidado_${YEAR}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(todosFeriados, null, 2), 'utf-8');
  console.log(`✅ Consolidado BA: ${todosFeriados.length} feriados totais`);
  console.log(`   Arquivo: ${outputPath}`);
  console.log(`   Tamanho: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB\n`);

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ Geração de JSONs concluída!');
  console.log('═══════════════════════════════════════════════════════\n');

  // Resumo
  console.log('📊 Resumo:');
  console.log(`   Nacionais: ${nacionais?.feriados?.length || 0} feriados`);
  console.log(`   Estaduais BA: ${estaduais?.feriados?.length || 0} feriados`);
  console.log(`   Municipais BA: ${municipaisBA.length} feriados em ${new Set(municipaisBA.map(f => f.codigo_ibge)).size} municípios`);
  console.log(`   Total consolidado: ${todosFeriados.length} feriados\n`);
}

main().catch(console.error);
