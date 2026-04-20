// Script para atualizar todas as URLs hardcoded no frontend
// Executar: node scripts/update-api-urls.js

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const files = [];

// Encontrar todos arquivos JS/JSX
function findFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findFiles(fullPath);
    } else if (entry.name.match(/\.(js|jsx|tsx)$/)) {
      files.push(fullPath);
    }
  }
}

findFiles(srcDir);

let totalChanges = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Substituir URLs absolutas por relativas
  content = content.replace(
    /http:\/\/localhost:3000\/api/g,
    '/api'
  );
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Atualizado: ${path.relative(srcDir, file)}`);
    totalChanges++;
  }
});

console.log(`\n🎉 Total de arquivos atualizados: ${totalChanges}`);
console.log('💡 Agora configure o Vite proxy em vite.config.js');
