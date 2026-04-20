const rpaService = require('../../services/puppeteerService');

/**
 * @desc    Robô da Sefaz Salvador - Consulta IPTU
 * @route   POST /api/rpa/iptu-salvador
 */
const buscarIptuSalvador = async (req, res) => {
  const { numeroIptu } = req.body;
  if (!numeroIptu) return res.status(400).json({ message: 'Número do IPTU é obrigatório.' });

  let browser;
  try {
    const url = 'https://servicosweb.sefaz.salvador.ba.gov.br/WebsiteV2/Sistemas/CertidaoDadosCadastrais/Modulos/Principal/CertidaoDadosCadastraisFrm.aspx';

    await rpaService.fecharBrowser();
    browser = await rpaService.initBrowser({ headless: 'new', slowMo: 60 });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });

    console.log(`🤖 [IPTU Salvador] Acessando portal...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const seletorInput = '#ctl00_ContentPlaceHolderPrincipal_txtCdInscricao';
    const seletorBotao = '#ctl00_ContentPlaceHolderPrincipal_BtConsultar';

    await page.waitForSelector(seletorInput, { timeout: 15000 });

    const newPagePromise = new Promise(resolve => browser.once('targetcreated', target => resolve(target.page())));

    console.log(`🤖 [IPTU Salvador] Injetando script de consulta...`);
    await page.evaluate((iptu, inputSel, btnSel) => {
      const campo = document.querySelector(inputSel);
      const botao = document.querySelector(btnSel);
      if (campo && botao) {
        campo.value = iptu;
        botao.click();
        return true;
      }
      return false;
    }, numeroIptu, seletorInput, seletorBotao);

    const resultPage = await newPagePromise;
    if (!resultPage) throw new Error('A página de resultado não foi aberta.');

    await resultPage.bringToFront();
    await resultPage.waitForNetworkIdle({ idleTime: 1000, timeout: 30000 }).catch(() => {});
    await resultPage.waitForSelector('#ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbCdInscricaoImob', { timeout: 10000 });

    await new Promise(r => setTimeout(r, 6000));

    const pdfBuffer = await resultPage.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });
    const pdfBase64 = pdfBuffer.toString('base64');
    const screenshotBuffer = await resultPage.screenshot({ encoding: 'base64', fullPage: true });

    const dadosEstruturados = await resultPage.evaluate(() => {
      const getText = id => document.getElementById(id)?.innerText.trim() || '';
      return {
        titulo: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsTitulo'),
        inscricao: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbCdInscricaoImob'),
        cib: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbNuCIB'),
        inscMae: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_Lcdinscricaomae'),
        contribuinte: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbnmContribuinte'),
        cpfCnpj: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbnuCnpjCpf'),
        endereco: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsLogradouro'),
        numMetrico: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbnuMetrico'),
        numPorta: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbnuPorta'),
        loteamento: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsLoteamento'),
        quadra: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsQuadra'),
        lote: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsLote'),
        conjunto: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsConjuntoHabitacional'),
        edificio: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsEdificio'),
        bloco: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbnuBloco'),
        subUnidadeCod: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbcdSubUnidade'),
        subUnidadeNome: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsSubunidade'),
        numSubUnidade: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbnuSubUnidade'),
        bairro: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsBairro'),
        cep: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbnuCEP'),
        complemento: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsComplementoEndereco'),
        areaTerreno: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbvlAreaTerreno'),
        fracaoIdeal: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbvlFracaoIdeal'),
        areaConstruida: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbvlAreaConstruida'),
        areaTotal: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbvlAreaTotal'),
        valorVenal: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbvlVenalIPTU'),
        tipoImovel: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsUtilizacao'),
        padrao: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsPadraoConstrutivo'),
        logradouroTrib: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsLogradouroTrib'),
        dataLanc: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbDtVigenciaLanc'),
        sitCadastral: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsSituacaoCadastral'),
        sitFiscal: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdsSituacaoFiscalIPTU'),
        dataEmissao: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbdtEmissao'),
        textoCertidao: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbTextoCertidao'),
        codControle: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbCodigoControleCertidao'),
        textoRodape: getText('ctl00_ContentPlaceHolderPrincipal_UCCertidaoDadosCadastrais_LbTextoRodape'),
        htmlCompleto: document.documentElement.outerHTML
      };
    });

    const textoExtraido = await resultPage.evaluate(() => document.body?.innerText || '');

    await resultPage.close();
    await page.close();

    return res.json({
      sucesso: true,
      message: 'Consulta de IPTU realizada com sucesso!',
      numeroIptu,
      dados: dadosEstruturados,
      texto_extraido: textoExtraido,
      imagemRenderizada: `data:image/png;base64,${screenshotBuffer}`,
      pdfBase64: pdfBase64
    });
  } catch (error) {
    if (browser) await browser.close().catch(() => {});
    return res.status(500).json({ message: 'Erro no robô de consulta de IPTU Salvador.', error: error.message });
  }
};

module.exports = {
  buscarIptuSalvador
};
