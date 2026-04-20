const rpaService = require('../../services/puppeteerService');

/**
 * @desc    Robô do Simples Nacional - Consulta Optantes
 * @route   POST /api/rpa/simples-nacional
 */
const buscarSimplesNacional = async (req, res) => {
  const { cnpj } = req.body;
  if (!cnpj) return res.status(400).json({ message: 'CNPJ é obrigatório.' });

  try {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    const url = 'https://www8.receita.fazenda.gov.br/SimplesNacional/aplicacoes.aspx?id=21';

    const browser = await rpaService.initBrowser();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });

    console.log(`🤖 [Simples Nacional] Acessando portal...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    try {
      await page.waitForSelector('input[id*="cnpj"], input[id*="Cnpj"], input[name*="cnpj"], input[name*="CNPJ"]', { timeout: 8000 });
      const cnpjInput = await page.$('input[id*="cnpj"], input[id*="Cnpj"], input[name*="cnpj"], input[name*="CNPJ"]');
      if (cnpjInput) {
        await cnpjInput.click({ clickCount: 3 });
        await cnpjInput.type(cleanCnpj, { delay: 50 });
        console.log(`🤖 [Simples Nacional] CNPJ digitado: ${cleanCnpj}`);
      }
    } catch (e) {
      console.log(`⚠️ [Simples Nacional] Campo de CNPJ não encontrado nesta etapa: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 1500));

    const screenshotBuffer = await page.screenshot({ encoding: 'base64', fullPage: true });

    const textoExtraido = await page.evaluate(() => {
      const body = document.querySelector('body');
      return body ? body.innerText : 'Não foi possível extrair texto.';
    });

    await page.close();

    return res.json({
      sucesso: true,
      message: 'Portal do Simples Nacional acessado com sucesso pelo Robô.',
      cnpj_buscado: cnpj,
      texto_extraido: textoExtraido,
      imagemRenderizada: `data:image/png;base64,${screenshotBuffer}`,
      aviso: 'Sites da Receita Federal podem exigir Captcha para submissão do formulário. A imagem mostra o estado atual da página.'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro no robô do Simples Nacional.', error: error.message });
  }
};

module.exports = {
  buscarSimplesNacional
};
