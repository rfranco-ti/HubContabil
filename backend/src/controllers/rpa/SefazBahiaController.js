const rpaService = require('../../services/puppeteerService');

/**
 * @desc    Robô da Sefaz BA - Consulta Inscrição Estadual e Cadastro
 */

const buscarInscricaoEstadualSefazBahia = async (req, res) => {
  const { cnpj } = req.body;
  if (!cnpj) return res.status(400).json({ message: 'CNPJ é obrigatório.' });

  try {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    const url = 'https://portal.sefaz.ba.gov.br/scripts/cadastro/cadastroBa/consultaBa.asp';

    const browser = await rpaService.initBrowser();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });

    console.log(`🤖 [Sefaz BA - IE] Acessando portal...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const xpathInput = '/html/body/table/tbody/tr[3]/td/table/tbody/tr[2]/td[2]/table/tbody/tr[2]/td[2]/p/input';
    const xpathBotao = '/html/body/table/tbody/tr[3]/td/table/tbody/tr[2]/td[2]/table/tbody/tr[2]/td[4]/input';

    try {
      await page.waitForSelector('::-p-xpath(' + xpathInput + ')', { timeout: 10000 });
      const inputHandle = await page.$('::-p-xpath(' + xpathInput + ')');

      if (inputHandle) {
        await inputHandle.click({ clickCount: 3 });
        await inputHandle.type(cleanCnpj, { delay: 40 });
        console.log(`🤖 [Sefaz BA - IE] CNPJ digitado: ${cleanCnpj}`);
      }

      await new Promise(r => setTimeout(r, 500));

      const botaoHandle = await page.$('::-p-xpath(' + xpathBotao + ')');
      if (botaoHandle) {
        await botaoHandle.click();
        console.log(`🤖 [Sefaz BA - IE] Botão de consulta acionado.`);
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
      }
    } catch (e) {
      console.log(`⚠️ [Sefaz BA - IE] Erro na interação: ${e.message}`);
      return res.status(500).json({ 
        message: 'Erro ao interagir com formulário da SEFAZ BA. Site pode estar indisponível.', 
        error: e.message 
      });
    }

    await new Promise(r => setTimeout(r, 3000));

    const resultado = await page.evaluate(() => {
      const ieXpath = '/html/body/table/tbody/tr[3]/td/table[2]/tbody/tr/td/p[1]/table/tbody/tr[3]/td[2]';
      const situacaoXpath = '/html/body/table/tbody/tr[3]/td/table[2]/tbody/tr/td/table[1]/tbody/tr[13]/td[1]';
      const enderecoXpath = '/html/body/table/tbody/tr[3]/td/table[2]/tbody/tr/td/p[2]/table/tbody/tr[7]/td[1]';

      let inscricaoEstadual = '';
      let situacaoCadastral = '';
      let enderecoCorrespondencia = '';

      const evaluateXPath = (xpath) => {
        const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue;
      };

      const ieElement = evaluateXPath(ieXpath);
      if (ieElement) {
        const texto = ieElement.textContent.trim();
        const match = texto.match(/([0-9.]+\s*[A-Z]*)/i);
        if (match) inscricaoEstadual = match[1].trim();
      }

      const situacaoElement = evaluateXPath(situacaoXpath);
      if (situacaoElement) {
        const texto = situacaoElement.textContent.trim();
        const match = texto.match(/Situa&ccedil;&atilde;o Cadastral Vigente:\s*([A-ZÀ-ÚÂ-ÊÎ-ÔÛÃ-ÕÇ\s]+)/i);
        if (match) {
          situacaoCadastral = match[1].trim();
        } else {
          situacaoCadastral = texto.replace(/Situa&ccedil;&atilde;o Cadastral Vigente:/gi, '').replace(/&nbsp;/g, ' ').trim();
        }
      }

      if (!inscricaoEstadual) {
        const bodyText = document.body.innerText;
        const ieMatch = bodyText.match(/Inscri&ccedil;&atilde;o Estadual:\s*([0-9.\-\s]+[A-Z]*)/i);
        if (ieMatch && ieMatch[1]) inscricaoEstadual = ieMatch[1].trim();
      }

      if (!situacaoCadastral) {
        const bodyText = document.body.innerText;
        const sitMatch = bodyText.match(/Situa&ccedil;&atilde;o Cadastral Vigente:\s*([A-ZÀ-ÚÂ-ÊÎ-ÔÛÃ-ÕÇ]+)/i);
        if (sitMatch && sitMatch[1]) situacaoCadastral = sitMatch[1].trim();
      }

      const enderecoElement = evaluateXPath(enderecoXpath);
      if (enderecoElement) enderecoCorrespondencia = enderecoElement.textContent.trim();

      return { inscricaoEstadual, situacaoCadastral, enderecoCorrespondencia };
    });

    await page.close();

    if (!resultado.inscricaoEstadual) {
      return res.status(404).json({ 
        message: 'Não foi possível encontrar a Inscrição Estadual no site da SEFAZ BA. Verifique se o CNPJ está correto.',
        cnpj_buscado: cnpj
      });
    }

    return res.json({
      sucesso: true,
      message: 'Inscrição Estadual obtida com sucesso na SEFAZ BA.',
      cnpj_buscado: cnpj,
      inscricaoEstadual: resultado.inscricaoEstadual,
      situacaoCadastral: resultado.situacaoCadastral || '',
      enderecoCorrespondencia: resultado.enderecoCorrespondencia || ''
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro no robô da Sefaz BA para Inscrição Estadual.', error: error.message });
  }
};

const buscarSefazBahia = async (req, res) => {
  const { cnpj } = req.body;
  if (!cnpj) return res.status(400).json({ message: 'CNPJ é obrigatório.' });

  try {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    const url = 'https://portal.sefaz.ba.gov.br/scripts/cadastro/cadastroBa/consultaBa.asp';

    const browser = await rpaService.initBrowser();
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768, deviceScaleFactor: 1 });

    console.log(`🤖 [Sefaz BA] Acessando portal...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const xpathInput = '/html/body/table/tbody/tr[3]/td/table/tbody/tr[2]/td[2]/table/tbody/tr[2]/td[2]/p/input';
    const xpathBotao = '/html/body/table/tbody/tr[3]/td/table/tbody/tr[2]/td[2]/table/tbody/tr[2]/td[4]/input';

    try {
      await page.waitForSelector('::-p-xpath(' + xpathInput + ')', { timeout: 10000 });
      const inputHandle = await page.$('::-p-xpath(' + xpathInput + ')');
      if (inputHandle) {
        await inputHandle.click({ clickCount: 3 });
        await inputHandle.type(cleanCnpj, { delay: 40 });
      }
      await new Promise(r => setTimeout(r, 500));
      const botaoHandle = await page.$('::-p-xpath(' + xpathBotao + ')');
      if (botaoHandle) {
        await botaoHandle.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
      }
    } catch (e) {
      console.log(`⚠️ [Sefaz BA] Interação com formulário: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 2000));
    const screenshotBuffer = await page.screenshot({ encoding: 'base64', fullPage: true });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' } });
    const textoExtraido = await page.evaluate(() => document.body ? document.body.innerText : 'Não foi possível extrair texto.');

    await page.close();

    return res.json({
      sucesso: true,
      message: 'Dados da SEFAZ BA obtidos com sucesso pelo Robô.',
      cnpj_buscado: cnpj,
      texto_extraido: textoExtraido,
      imagemRenderizada: `data:image/png;base64,${screenshotBuffer}`,
      pdfBase64: pdfBuffer.toString('base64')
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro no robô da Sefaz BA.', error: error.message });
  }
};

module.exports = {
  buscarInscricaoEstadualSefazBahia,
  buscarSefazBahia
};
