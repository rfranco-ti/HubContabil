const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist');
const { createCanvas, loadImage } = require('canvas');
const Tesseract = require('tesseract.js');

// ========== CONFIGURAÇÕES ==========
const HEADLESS_MODE = process.env.HEADLESS_MODE !== 'false';
const MAX_RETRIES = 2;

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ========== OCR UTILS (Reusing logic from FichaCadastralController) ==========
const preprocessImage = async buf => {
  const img = await loadImage(buf);
  const tw = 3500, th = Math.round(img.height * tw / img.width);
  let cv = createCanvas(tw, th), ctx = cv.getContext('2d');
  ctx.drawImage(img, 0, 0, tw, th);
  const idata = ctx.getImageData(0, 0, tw, th), d = idata.data;
  const copy = new Uint8ClampedArray(d);
  const kernel = [0,-1,0, -1,5,-1, 0,-1,0];
  for (let y=1; y<th-1; y++) for (let x=1; x<tw-1; x++) {
    let r=0,g=0,b=0;
    for (let ky=-1; ky<=1; ky++) for (let kx=-1; kx<=1; kx++) {
      const idx = ((y+ky)*tw + (x+kx))*4, w = kernel[(ky+1)*3 + (kx+1)];
      r += copy[idx]*w; g += copy[idx+1]*w; b += copy[idx+2]*w;
    }
    const idx = (y*tw + x)*4;
    d[idx]=Math.min(255,Math.max(0,r)); d[idx+1]=Math.min(255,Math.max(0,g)); d[idx+2]=Math.min(255,Math.max(0,b));
  }
  ctx.putImageData(idata, 0, 0);
  const gray = ctx.getImageData(0,0,tw,th), gd = gray.data;
  const hist = Array(256).fill(0);
  for (let i=0; i<gd.length; i+=4) hist[gd[i]]++;
  let sum=0, total=tw*th;
  for (let i=0; i<256; i++) sum += i*hist[i];
  let sumB=0, wB=0, max=0, thr=128;
  for (let t=0; t<256; t++) {
    wB += hist[t]; if (!wB) continue;
    const wF = total - wB; if (!wF) break;
    sumB += t*hist[t];
    const mB = sumB/wB, mF = (sum-sumB)/wF;
    const between = wB*wF*(mB-mF)*(mB-mF);
    if (between > max) { max = between; thr = t; }
  }
  for (let i=0; i<gd.length; i+=4) {
    const v = gd[i] > thr ? 255 : 0;
    gd[i]=gd[i+1]=gd[i+2]=v;
  }
  ctx.putImageData(gray, 0, 0);
  return cv.toBuffer('image/png');
};

const extractTextFromPDF = async pdfPath => {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const page = await pdf.getPage(1);
  const vp = page.getViewport({ scale: 5.5 });
  const cv = createCanvas(vp.width, vp.height), ctx = cv.getContext('2d');
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  const processed = await preprocessImage(cv.toBuffer('image/png'));
  const { data: { text } } = await Tesseract.recognize(processed, 'por', {
    tessedit_pageseg_mode: '6',
    tessedit_ocr_engine_mode: '1',
  });
  return text;
};

// ========== PARSING ==========
const parseDadosResumidos = textoBruto => {
  const texto = (textoBruto || '').replace(/\s+/g, ' ').trim();
  
  const extrairCampo = (ctx, rot, fim=null) => {
    const padrao = fim ? `(?=${fim})` : '(?=\\s*(?:[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]{2,}\\s*:|\\.|$))';
    const regex = new RegExp(`${rot}\\s*:?\\s*([^]*?)${padrao}`, 'i');
    const match = ctx.match(regex);
    return match ? match[1].trim() : '';
  };

  const inscricaoMunicipal = (extrairCampo(texto, 'INSCRIÇÃO MUNICIPAL \\(CGA\\)', 'SITUAÇÃO') || '').replace(/[^\d.\/\-]/g, '');
  let situacaoMunicipal = extrairCampo(texto, 'SITUAÇÃO CADASTRAL', 'IDENTIFICAÇÃO|Data|Razão') || '';
  situacaoMunicipal = situacaoMunicipal.replace(/Razão.*/i, '').trim();
  
  if (!situacaoMunicipal) {
    situacaoMunicipal = (texto.match(/Ativa\s+Regular/i) || [])[0] || '';
  }

  return { inscricaoMunicipal, situacaoMunicipal };
};

// ========== CONTROLADOR ==========
const buscarInscricaoMunicipalSalvador = async (req, res) => {
  const { cnpj } = req.body;
  if (!cnpj) return res.status(400).json({ message: 'CNPJ obrigatório.' });
  const clean = cnpj.replace(/\D/g, '');

  const url = 'https://servicosweb.sefaz.salvador.ba.gov.br/WebsiteV2/Sistemas/AlvaraCgaInternet/Modulos/Principal/AlvaraCgaEmissaoFichaResumidaFrm.aspx';

  for (let t=1; t<=MAX_RETRIES; t++) {
    let browser, context, page;
    try {
      console.info(`🤖 [Salvador Municipal] Tentativa ${t} para CNPJ ${clean}...`);
      browser = await chromium.launch({ 
        headless: HEADLESS_MODE, 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled'] 
      });
      context = await browser.newContext({ acceptDownloads: true });
      page = await context.newPage();
      page.on('dialog', d => d.accept());
      
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      await page.waitForSelector('#ctl00_ContentPlaceHolderPrincipal_RdBNuCnpj', { timeout: 15000 });
      await page.click('#ctl00_ContentPlaceHolderPrincipal_RdBNuCnpj');
      await page.fill('#ctl00_ContentPlaceHolderPrincipal_txtNuCnpj', clean);
      
      const [download] = await Promise.all([
        page.waitForEvent('download', { timeout: 60000 }),
        page.click('#ctl00_ContentPlaceHolderPrincipal_BtnConsultar0')
      ]);
      
      const tmpPath = path.join(__dirname, `../../temp/municipal_${Date.now()}.pdf`);
      // Ensure dir exists
      if (!fs.existsSync(path.dirname(tmpPath))) fs.mkdirSync(path.dirname(tmpPath), { recursive: true });
      
      await download.saveAs(tmpPath);
      
      const texto = await extractTextFromPDF(tmpPath);
      const { inscricaoMunicipal, situacaoMunicipal } = parseDadosResumidos(texto);
      
      // Limpeza
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      await browser.close();
      
      if (!inscricaoMunicipal) {
        return res.status(404).json({ message: 'Inscrição Municipal não encontrada para este CNPJ.' });
      }

      return res.json({
        sucesso: true,
        inscricaoMunicipal,
        situacaoMunicipal,
        message: 'Inscrição Municipal obtida com sucesso em Salvador.'
      });
    } catch (e) {
      console.error(`❌ [Salvador Municipal] Erro tentativa ${t}:`, e.message);
      if (browser) await browser.close().catch(()=>{});
      if (t === MAX_RETRIES) return res.status(500).json({ message: 'Erro ao consultar Inscrição Municipal', error: e.message });
      await sleep(2000 * t);
    }
  }
};

module.exports = { buscarInscricaoMunicipalSalvador };
