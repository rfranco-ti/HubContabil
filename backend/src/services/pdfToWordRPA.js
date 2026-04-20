const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Utility: delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * RPA para converter PDF para Word usando onlineocr.net
 */
class PdfToWordRPA {
  constructor() {
    this.browser = null;
    this.page = null;
    this.downloadPath = path.join(__dirname, '..', 'temp', 'downloads');
  }

  /**
   * Inicializa o navegador
   */
  async init() {
    if (!fs.existsSync(this.downloadPath)) {
      fs.mkdirSync(this.downloadPath, { recursive: true });
    }

    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await puppeteer.launch({
        headless: false, // MODO VISÍVEL - altere para true quando pronto
        slowMo: 50,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--window-size=1440,900'
        ]
      });
    }
    this.page = await this.browser.newPage();
    await this.page.setDefaultNavigationTimeout(120000);
    await this.page.setDefaultTimeout(60000);
    
    // Configurar download path
    const cdp = await this.page.createCDPSession();
    await cdp.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: this.downloadPath
    });
  }

  /**
   * Converte PDF para Word
   * @param {string} filePath - Caminho absoluto do PDF
   * @returns {Promise<string>} Caminho do arquivo Word baixado
   */
  async converterPdfParaWord(filePath) {
    try {
      console.log('[PDF-TO-WORD] Iniciando conversão...');
      await this.init();

      console.log(`[PDF-TO-WORD] Acessando onlineocr.net: ${path.basename(filePath)}`);
      await this.page.goto('https://www.onlineocr.net/pdf-to-word', {
        waitUntil: 'networkidle0',
        timeout: 60000
      });

      // Aguardar página carregar
      console.log('[PDF-TO-WORD] Aguardando elementos...');
      await this.page.waitForSelector('input[type="file"]', { timeout: 15000 });

      // 1. Upload do arquivo
      console.log('[PDF-TO-WORD] Fazendo upload do arquivo...');
      const fileInput = await this.page.$('input[type="file"]');
      if (!fileInput) {
        throw new Error('Campo de upload não encontrado');
      }
      await fileInput.uploadFile(filePath);
      console.log('[PDF-TO-WORD] ✅ Upload realizado');
      
      // Disparar eventos para ASP.NET reconhecer o upload
      await this.page.evaluate(() => {
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) {
          // Disparar eventos que ASP.NET espera
          fileInput.dispatchEvent(new Event('change', { bubbles: true }));
          fileInput.dispatchEvent(new Event('input', { bubbles: true }));
          
          // Forçar validação do ASP.NET
          if (typeof Page_ClientValidate === 'function') {
            Page_ClientValidate();
            console.log('Page_IsValid:', Page_IsValid);
          }
        }
      });
      
      // Aguardar upload completar e botão CONVERT aparecer
      console.log('[PDF-TO-WORD] Aguardando botão CONVERT habilitar...');
      await delay(5000);
      
      // Verificar se o botão foi habilitado
      const btnStatus = await this.page.evaluate(() => {
        const btn = document.querySelector('#MainContent_btnOCRConvert');
        if (!btn) return { found: false };
        return {
          found: true,
          disabled: btn.disabled,
          className: btn.className,
          hasAspNetDisabled: btn.classList.contains('aspNetDisabled')
        };
      });
      console.log('[PDF-TO-WORD] Botão status:', JSON.stringify(btnStatus));

      // 2. Selecionar idioma Brazilian
      console.log('[PDF-TO-WORD] Selecionando idioma: Brazilian');
      const langSelected = await this.page.evaluate(() => {
        const selects = document.querySelectorAll('select');
        for (const select of selects) {
          const options = Array.from(select.options);
          const brazilian = options.find(o => o.text.toLowerCase().includes('brazilian') || o.value.toLowerCase().includes('brazilian'));
          if (brazilian) {
            select.value = brazilian.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }
        }
        return false;
      });

      if (!langSelected) {
        console.log('[PDF-TO-WORD] ⚠️ Idioma Brazilian não encontrado, usando padrão');
      } else {
        console.log('[PDF-TO-WORD] ✅ Idioma selecionado');
      }
      await delay(1000);

      // 3. Clicar em CONVERT - forçar submit do formulário ASP.NET
      console.log('[PDF-TO-WORD] Submetendo formulário ASP.NET...');
      
      // Submeter o formulário diretamente (contorna validação client-side)
      const formSubmitted = await this.page.evaluate(() => {
        const form = document.querySelector('form');
        if (!form) return false;
        
        // Adicionar event target para ASP.NET saber qual botão foi clicado
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = '__EVENTTARGET';
        input.value = 'ctl00$MainContent$btnOCRConvert';
        form.appendChild(input);
        
        form.submit();
        return true;
      });

      if (!formSubmitted) {
        throw new Error('Não foi possível submeter o formulário');
      }
      console.log('[PDF-TO-WORD] ✅ Formulário submetido');

      // Aguardar resposta do servidor
      console.log('[PDF-TO-WORD] Aguardando processamento do servidor...');
      
      // Aguardar panel de resultado aparecer
      try {
        await this.page.waitForSelector('#MainContent_PanelFileLink', { timeout: 60000 });
        console.log('[PDF-TO-WORD] ✅ Resultado encontrado!');
      } catch (waitErr) {
        console.log('[PDF-TO-WORD] ⚠️ Panel não apareceu, aguardando mais...');
        await delay(10000);
      }

      // 4. Aguardar conversão e download
      console.log('[PDF-TO-WORD] Aguardando conversão e download...');
      
      const maxRetries = 24; // 2 minutos max
      let retryCount = 0;

      while (retryCount < maxRetries) {
        await delay(5000);
        retryCount++;

        // Procurar botão de download específico
        const downloadLink = await this.page.$('#MainContent_lnkBtnDownloadOutput');
      
      if (downloadLink) {
        const text = await downloadLink.evaluate(el => el.textContent.trim());
        const href = await downloadLink.evaluate(el => el.href);
        
        if (text.includes('Download Output File')) {
          console.log(`[PDF-TO-WORD] ✅ Download botão encontrado!`);
          console.log(`[PDF-TO-WORD] Texto: "${text}"`);

          // Configurar listener de download ANTES de clicar
          const downloadPromise = this.page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
          
          // 5. Clicar para baixar (triggers __doPostBack)
          console.log('[PDF-TO-WORD] Clicando no download...');
          
          // Executar o __doPostBack diretamente
          await this.page.evaluate(() => {
            __doPostBack('ctl00$MainContent$lnkBtnDownloadOutput', '');
          });

          // Aguardar o download
          const download = await downloadPromise;
          
          if (download) {
            const fileName = `converted_${Date.now()}.docx`;
            const wordPath = path.join(this.downloadPath, fileName);
            await download.saveAs(wordPath);
            
            console.log(`[PDF-TO-WORD] ✅ Arquivo salvo: ${wordPath}`);
            return wordPath;
          }

          // Fallback: aguardar resposta de rede
          console.log('[PDF-TO-WORD] Tentando capturar via network response...');
          const responsePromise = this.page.waitForResponse(
            resp => resp.headers()['content-disposition'] || 
                    resp.url().includes('.docx') || 
                    resp.url().includes('download'),
            { timeout: 30000 }
          ).catch(() => null);

          const response = await responsePromise;
          if (response) {
            const buffer = await response.buffer();
            const fileName = `converted_${Date.now()}.docx`;
            const wordPath = path.join(this.downloadPath, fileName);
            fs.writeFileSync(wordPath, buffer);
            console.log(`[PDF-TO-WORD] ✅ Arquivo salvo via response: ${wordPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
            return wordPath;
          }

          // Último fallback: verificar se arquivo apareceu na pasta
          await delay(5000);
          const files = fs.readdirSync(this.downloadPath);
          const recentFiles = files
            .filter(f => f.endsWith('.docx') || f.endsWith('.doc') || f.endsWith('.crdownload') || f.endsWith('.part'))
            .map(f => ({ name: f, time: fs.statSync(path.join(this.downloadPath, f)).mtimeMs }))
            .sort((a, b) => b.time - a.time);
          
          if (recentFiles.length > 0) {
            const filePath = path.join(this.downloadPath, recentFiles[0].name);
            console.log(`[PDF-TO-WORD] ✅ Arquivo encontrado: ${filePath}`);
            return filePath;
          }

          throw new Error('Não foi possível capturar o download');
        }
      }

      // Debug a cada 8 retries
      if (retryCount % 8 === 0) {
        const panelContent = await this.page.evaluate(() => {
          const panel = document.getElementById('MainContent_PanelFileLink');
          return panel ? panel.innerHTML : 'Panel não encontrado';
        });
        console.log(`[PDF-TO-WORD] Debug panel:`, panelContent.substring(0, 200));
        console.log(`[PDF-TO-WORD] Aguardando conversão... (${retryCount}/${maxRetries})`);
      }
      }

      throw new Error('Botão de download não apareceu após 2 minutos');

    } catch (error) {
      console.error('[PDF-TO-WORD] Erro:', error.message);
      throw new Error(`Falha na conversão PDF para Word: ${error.message}`);
    }
  }

  /**
   * Fecha o navegador
   */
  async shutdown() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

// Singleton
const rpaInstance = new PdfToWordRPA();

module.exports = {
  PdfToWordRPA,
  converterPdfParaWord: (filePath) => rpaInstance.converterPdfParaWord(filePath),
  shutdown: () => rpaInstance.shutdown()
};
