/**
 * Script para converter Markdown de Atividades MEI para JSON
 * 
 * Uso: node scripts/convertMeiActivities.js
 */

const fs = require('fs');
const path = require('path');

function convertMarkdownToJson() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📦 Convertendo Atividades MEI para JSON\n');

  // Ler arquivo Markdown
  const mdPath = path.join(__dirname, '..', '..', 'docs', 'ATIVIDADES_PERMITIDAS_MEI.md');
  const mdContent = fs.readFileSync(mdPath, 'utf-8');

  // Extrair linhas da tabela
  const lines = mdContent.split('\n');
  const atividades = [];

  // Pular cabeçalho e separador (primeiras 5 linhas)
  const tableLines = lines.slice(5);

  for (const line of tableLines) {
    // Ignorar linhas vazias ou que não são da tabela
    if (!line.trim() || !line.startsWith('|')) continue;
    if (line.includes('| CNAE |') || line.includes('|------|')) continue;

    // Parse da linha da tabela
    const columns = line.split('|').map(col => col.trim()).filter(col => col);

    if (columns.length >= 5) {
      const [cnae, ocupacao, descricao, iss, icms] = columns;

      // Gerar keywords para busca
      const keywords = [
        cnae,
        ocupacao.toLowerCase(),
        descricao.toLowerCase(),
        ...ocupacao.toLowerCase().split(' '),
        ...descricao.toLowerCase().split(' ')
      ].filter(k => k.length > 2);

      atividades.push({
        cnae: cnae.trim(),
        ocupacao: ocupacao.trim(),
        descricao: descricao.trim(),
        iss: iss.trim().toLowerCase() === 'sim',
        icms: icms.trim().toLowerCase() === 'sim',
        keywords: [...new Set(keywords)] // Remove duplicatas
      });
    }
  }

  // Ordenar por CNAE
  atividades.sort((a, b) => a.cnae.localeCompare(b.cnae));

  // Remover keywords duplicadas entre atividades
  const atividadesUnicas = [];
  const cnaesVistos = new Set();

  for (const atividade of atividades) {
    if (!cnaesVistos.has(atividade.cnae)) {
      atividadesUnicas.push(atividade);
      cnaesVistos.add(atividade.cnae);
    }
  }

  // Salvar JSON
  const outputPath = path.join(__dirname, '..', 'frontend', 'src', 'data', 'atividadesMei.json');
  
  // Criar diretório se não existir
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify(atividadesUnicas, null, 2), 'utf-8');

  console.log('✅ Conversão concluída!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 Estatísticas:');
  console.log(`   Total de atividades: ${atividadesUnicas.length}`);
  console.log(`   Arquivo: ${outputPath}`);
  console.log(`   Tamanho: ${(fs.readFileSync(outputPath).length / 1024).toFixed(2)} KB`);
  
  // Contar por ISS/ICMS
  const comIss = atividadesUnicas.filter(a => a.iss).length;
  const comIcms = atividadesUnicas.filter(a => a.icms).length;
  
  console.log(`   Com ISS: ${comIss} (${((comIss/atividadesUnicas.length)*100).toFixed(1)}%)`);
  console.log(`   Com ICMS: ${comIcms} (${((comIcms/atividadesUnicas.length)*100).toFixed(1)}%)`);
  console.log('═══════════════════════════════════════════════════════\n');
}

convertMarkdownToJson();
