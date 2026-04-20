const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Adiciona o plugin de stealth para evitar detecção de robô
puppeteer.use(StealthPlugin());

/**
 * Serviço Arquitetural do RPA (Robotic Process Automation).
 * Será a fundação para os robôs que irão interagir com e-CAC, Sefaz, Simples Nacional, etc.
 */
class RpaService {
  constructor() {
    this.browser = null;
  }

  // Inicia uma instância imaculada do navegador
  async initBrowser(options = {}) {
    if (!this.browser) {
      console.log('🤖 Iniciando motor do Puppeteer (Robô)...');
      this.browser = await puppeteer.launch({
        headless: options.headless !== undefined ? options.headless : 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
          '--disable-blink-features=AutomationControlled',
          ...(options.args || [])
        ],
        ...options
      });
      console.log('✅ Robô inicializado com sucesso.');
    }
    return this.browser;
  }

  // Desliga o motor do robô
  async fecharBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('🛑 Motor do robô encerrado.');
    }
  }

  // Exemplo de Prova de Conceito: Entrar em um portal do Governo e tirar uma foto (screenshot)
  // ou extrair um texto da tela.
  async acessarPortalETirarPrint(url, pathDestino) {
    try {
      const browser = await this.initBrowser();
      const page = await browser.newPage();
      
      // Mascarando o robô para parecer um usuário humano real (evita bloqueio Cloudflare/Sefaz)
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      console.log(`Navegando silenciosamente para: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
      
      // Tira um print de como a tela do governo está carregada
      await page.screenshot({ path: pathDestino, fullPage: true });
      await page.close();
      
      return true;
    } catch (error) {
      console.error(`❌ Erro no Robô ao acessar ${url}:`, error.message);
      return false;
    }
  }
}

module.exports = new RpaService();
