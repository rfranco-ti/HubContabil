const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// Utility: delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * RPA de OCR usando OCR.space via Puppeteer
 * Automatiza o site ocr.space para extrair texto de PDFs escaneados
 */
class OcrSpaceRPA {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Inicializa o navegador (headless para produção)
   */
  async init() {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await puppeteer.launch({
        headless: true, // Modo headless para produção
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--window-size=1280,900",
        ],
      });
    }
    this.page = await this.browser.newPage();
    await this.page.setDefaultNavigationTimeout(60000);
    await this.page.setDefaultTimeout(30000);
  }

  /**
   * Clica em um elemento por XPath
   */
  async clickByXPath(xpath) {
    const clicked = await this.page.evaluate((xp) => {
      const result = document.evaluate(
        xp,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null,
      );
      const element = result.singleNodeValue;
      if (element) {
        element.click();
        return true;
      }
      return false;
    }, xpath);
    return clicked;
  }

  /**
   * Realiza OCR em um arquivo PDF/imagem usando OCR.space
   * Segue o passo a passo exato fornecido pelo usuário
   * @param {string} filePath - Caminho absoluto do arquivo
   * @returns {Promise<string>} Texto extraído
   */
  async processarOCR(filePath) {
    try {
      console.log("[OCR-RPA] ===== INICIANDO PROCESSO =====");
      console.log("[OCR-RPA] Arquivo:", path.basename(filePath));
      await this.init();

      // Acessar site
      console.log("[OCR-RPA] Passo 0: Acessando OCR.space...");
      await this.page.goto("https://ocr.space/", {
        waitUntil: "networkidle0",
        timeout: 60000,
      });

      // Aguardar página carregar
      await this.page.waitForSelector('input[type="file"]', { timeout: 15000 });
      console.log("[OCR-RPA] ✅ Página carregada");
      await delay(1000);

      // PASSO 1: Upload do arquivo
      console.log("[OCR-RPA] Passo 1: Fazendo upload do arquivo...");
      const fileInput = await this.page.$('input[type="file"]');
      if (!fileInput) {
        throw new Error("Campo de upload não encontrado");
      }
      await fileInput.uploadFile(filePath);
      console.log("[OCR-RPA] ✅ Upload realizado");
      await delay(3000);

      // PASSO 2+3: Selecionar Portuguese no select
      console.log("[OCR-RPA] Passo 2: Selecionando idioma...");

      // Aguarda o select existir na página
      await this.page.waitForSelector("#ocrLanguage", { timeout: 10000 });

      // Seleciona o idioma português pelo valor "por"
      await this.page.select("#ocrLanguage", "por");

      console.log("[OCR-RPA] ✅ Portuguese selecionado (value = por)");
      await delay(1000);

      if (!langSelected) {
        console.log("[OCR-RPA] ⚠️ Portuguese não encontrado, tentando por...");
        // Fallback: tentar selecionar 'por'
        await this.page.evaluate(() => {
          const select = document.querySelector('select[name="language"]');
          if (select) {
            select.value = "por";
            select.dispatchEvent(new Event("change", { bubbles: true }));
          }
        });
      }
      console.log("[OCR-RPA] ✅ Idioma selecionado");
      await delay(1000);

      // PASSO 4: Clicar checkbox 1
      console.log("[OCR-RPA] Passo 4: Marcando checkbox 1...");
      const checkbox1Clicked = await this.clickByXPath(
        "/html/body/div[2]/form/fieldset/div/div[7]/div[2]/div/input",
      );
      if (checkbox1Clicked) {
        console.log("[OCR-RPA] ✅ Checkbox 1 marcado");
      } else {
        console.log("[OCR-RPA] ⚠️ Checkbox 1 não encontrado");
      }
      await delay(500);

      // PASSO 5: Clicar checkbox 2
      console.log("[OCR-RPA] Passo 5: Marcando checkbox 2...");
      const checkbox2Clicked = await this.clickByXPath(
        "/html/body/div[2]/form/fieldset/div/div[8]/div[2]/div/input",
      );
      if (checkbox2Clicked) {
        console.log("[OCR-RPA] ✅ Checkbox 2 marcado");
      } else {
        console.log("[OCR-RPA] ⚠️ Checkbox 2 não encontrado");
      }
      await delay(500);

      // PASSO 6: Clicar "Extract Text (only)"
      console.log("[OCR-RPA] Passo 6: Selecionando modo Extract Text...");
      const extractClicked = await this.clickByXPath(
        "/html/body/div[2]/form/fieldset/div/div[10]/div[2]/div[1]/label",
      );
      if (extractClicked) {
        console.log("[OCR-RPA] ✅ Extract Text selecionado");
      }
      await delay(500);

      // PASSO 7: Selecionar OCR Engine
      console.log("[OCR-RPA] Passo 7: Selecionando OCR Engine...");
      const engineClicked = await this.clickByXPath(
        "/html/body/div[2]/form/fieldset/div/div[11]/div[2]/div[1]/label",
      );
      if (engineClicked) {
        console.log("[OCR-RPA] ✅ OCR Engine selecionado");
      }
      await delay(500);

      // PASSO 8: Clicar "Start OCR!"
      console.log("[OCR-RPA] Passo 8: Iniciando OCR...");
      const startClicked = await this.clickByXPath(
        "/html/body/div[2]/form/fieldset/div/div[13]/div[2]/a",
      );

      if (!startClicked) {
        // Fallback: procurar botão por texto
        const fallbackClicked = await this.page.evaluate(() => {
          const links = Array.from(document.querySelectorAll("a"));
          const startLink = links.find((a) =>
            a.textContent.includes("Start OCR"),
          );
          if (startLink) {
            startLink.click();
            return true;
          }
          return false;
        });

        if (!fallbackClicked) {
          throw new Error('Botão "Start OCR!" não encontrado');
        }
      }
      console.log("[OCR-RPA] ✅ OCR iniciado");

      // PASSO 9+10: Aguardar conversão e extrair texto
      console.log("[OCR-RPA] Passo 9-10: Aguardando conversão...");

      let textoExtraido = "";
      const maxRetries = 36; // 3 minutos max (5s * 36)
      let retryCount = 0;

      while (retryCount < maxRetries) {
        await delay(5000);
        retryCount++;

        console.log(`[OCR-RPA] Aguardando... (${retryCount}/${maxRetries})`);

        // Tentar pegar texto do textarea por XPath
        const textoFound = await this.page.evaluate((xp) => {
          const result = document.evaluate(
            xp,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null,
          );
          const textarea = result.singleNodeValue;
          return textarea ? textarea.value : null;
        }, "/html/body/div[2]/form/fieldset/div/div[20]/div[3]/div/div[2]/div[1]/textarea");

        if (textoFound && textoFound.trim().length > 0) {
          textoExtraido = textoFound;
          console.log(
            `[OCR-RPA] ✅ Texto extraído: ${textoExtraido.length} caracteres`,
          );
          break;
        }

        // Fallback: procurar textarea por atributos
        const fallbackTexto = await this.page.evaluate(() => {
          const textarea = document.querySelector("textarea[readonly]");
          return textarea ? textarea.value : null;
        });

        if (fallbackTexto && fallbackTexto.trim().length > 0) {
          textoExtraido = fallbackTexto;
          console.log(
            `[OCR-RPA] ✅ Texto extraído (fallback): ${textoExtraido.length} caracteres`,
          );
          break;
        }
      }

      if (!textoExtraido || textoExtraido.trim().length === 0) {
        throw new Error("Nenhum texto extraído após 3 minutos");
      }

      console.log("[OCR-RPA] ===== PROCESSO CONCLUÍDO =====");
      return textoExtraido.trim();
    } catch (error) {
      console.error("[OCR-RPA] ❌ Erro:", error.message);
      throw new Error(`Falha no RPA OCR.space: ${error.message}`);
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
const rpaInstance = new OcrSpaceRPA();

module.exports = {
  OcrSpaceRPA,
  processarOCR: (filePath) => rpaInstance.processarOCR(filePath),
  shutdown: () => rpaInstance.shutdown(),
};
