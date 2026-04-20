// backend/src/controllers/rpa/FichaCadastralController.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist');
const { createCanvas, loadImage } = require('canvas');
const Tesseract = require('tesseract.js');

// ========== CONFIGURAÇÕES ==========
const RPA_PDF_DIR = 'ficha-cadastral-salvador';
const TEMP_DIR = path.resolve(__dirname, '../../temp/pdfs', RPA_PDF_DIR);
const MAX_AGE_MS = parseInt(process.env.PDF_CACHE_MINUTES || '60') * 60 * 1000;
const HEADLESS_MODE = process.env.HEADLESS_MODE !== 'false';
const MAX_RETRIES = parseInt(process.env.MAX_RETRIES || '2');
const CACHE_TTL_MS = parseInt(process.env.CACHE_TTL_HOURS || '12') * 60 * 60 * 1000;

// ========== CACHE ==========
const cache = new Map();
const getCached = (cnpj, forceRefresh) => {
  if (forceRefresh) { cache.delete(cnpj); return null; }
  const e = cache.get(cnpj);
  if (!e) return null;
  if (Date.now() - e.timestamp > CACHE_TTL_MS) { cache.delete(cnpj); return null; }
  return e;
};
const setCached = (cnpj, data) => cache.set(cnpj, { ...data, timestamp: Date.now() });

// ========== UTILITÁRIOS ==========
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
setInterval(() => {
  try {
    fs.readdirSync(TEMP_DIR).forEach(f => {
      const p = path.join(TEMP_DIR, f);
      if (Date.now() - fs.statSync(p).mtimeMs > MAX_AGE_MS) fs.unlinkSync(p);
    });
  } catch (e) {}
}, 15 * 60 * 1000);

const sleep = ms => new Promise(r => setTimeout(r, ms));
const validarCNPJ = cnpj => {
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = slice => {
    let p = slice.length === 12 ? 5 : 6, s = 0;
    for (let i = 0; i < slice.length; i++) { s += slice[i] * p; p--; if (p < 2) p = 9; }
    return s % 11 < 2 ? 0 : 11 - (s % 11);
  };
  return calc(cnpj.slice(0,12)) === +cnpj[12] && calc(cnpj.slice(0,13)) === +cnpj[13];
};

// ========== HUMANIZAÇÃO ==========
const humanDelay = (b, v=0.5) => sleep(b*(1-v) + Math.random()*b*2*v);
const humanMouseMove = async (p, tx, ty) => {
  const sx = 100+Math.random()*200, sy = 100+Math.random()*200;
  await p.mouse.move(sx, sy); await humanDelay(100);
  for (let i=1, st=15+Math.floor(Math.random()*10); i<=st; i++) {
    const pr = i/st, ease = pr<0.5 ? 2*pr*pr : 1-Math.pow(-2*pr+2,2)/2;
    const cx = sx + (tx-sx)*ease, cy = sy + (ty-sy)*ease;
    await p.mouse.move(cx+(Math.random()-0.5)*8, cy+(Math.random()-0.5)*8);
    await humanDelay(15);
  }
};
const humanClick = async (p, sel) => {
  const el = await p.$(sel); if (!el) throw new Error(`Elemento não encontrado: ${sel}`);
  const { x, y, width, height } = await el.boundingBox();
  const tx = x+width/2+(Math.random()-0.5)*6, ty = y+height/2+(Math.random()-0.5)*6;
  await humanMouseMove(p, tx, ty); await humanDelay(150);
  await p.mouse.down(); await humanDelay(80); await p.mouse.up(); await humanDelay(200);
};
const humanType = async (p, sel, txt) => {
  const loc = p.locator(sel); await loc.click({ force: true }); await humanDelay(300);
  await p.keyboard.press('Control+A'); await p.keyboard.press('Backspace'); await humanDelay(200);
  await loc.pressSequentially(txt, { delay: 80+Math.random()*120 });
};

// ========== PRÉ‑PROCESSAMENTO AVANÇADO ==========
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

// ========== OCR OTIMIZADO ==========
const extractTextFromPDF = async pdfPath => {
  console.info('📑 Convertendo PDF...');
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const page = await pdf.getPage(1);
  const vp = page.getViewport({ scale: 5.5 });
  const cv = createCanvas(vp.width, vp.height), ctx = cv.getContext('2d');
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  const processed = await preprocessImage(cv.toBuffer('image/png'));
  console.info('🔍 OCR...');
  const { data: { text } } = await Tesseract.recognize(processed, 'por', {
    tessedit_pageseg_mode: '6',
    tessedit_ocr_engine_mode: '1',
    tessedit_char_whitelist: ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ0123456789.,;:!?@&()-_/',
    preserve_interword_spaces: '1',
  });
  console.info('✅ OCR concluído.');
  console.info('📝 TEXTO EXTRAÍDO COMPLETO:\n', text);
  return text;
};

// ========== PARSING ROBUSTO (CORREÇÃO DEFINITIVA DO E-MAIL) ==========
const parseDadosFicha = textoBruto => {
  const texto = (textoBruto || '').replace(/\s+/g, ' ').trim();
  
  const extrairSecao = (ini, fim) => {
    const regex = new RegExp(`${ini}([^]*?)${fim}`, 'i');
    const match = texto.match(regex);
    return match ? match[1].trim() : '';
  };

  const extrairCampo = (ctx, rot, fim=null) => {
    if (!ctx) return '';
    const padrao = fim ? `(?=${fim})` : '(?=\\s*(?:[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ]{2,}\\s*:|\\.|$))';
    const regex = new RegExp(`${rot}\\s*:?\\s*([^]*?)${padrao}`, 'i');
    const match = ctx.match(regex);
    return match ? match[1].trim() : '';
  };

  const secId = extrairSecao('IDENTIFICAÇÃO DA PESSOA JURÍDICA', 'ENDEREÇO DA PESSOA JURÍDICA') || '';
  const secEnd = extrairSecao('ENDEREÇO DA PESSOA JURÍDICA', 'TERMO DE VIABILIDADE|DADOS DE CONSTITUIÇÃO') || '';
  const secTVL = extrairSecao('TERMO DE VIABILIDADE DE LOCALIZAÇÃO', 'DADOS DE CONSTITUIÇÃO') || '';
  const secConst = extrairSecao('DADOS DE CONSTITUIÇÃO', 'ATIVIDADE\\(S\\)') || '';
  const secAtv = extrairSecao('ATIVIDADE\\(S\\)', 'OBSERVAÇÕES') || '';
  const secObs = extrairSecao('OBSERVAÇÕES', '$') || '';

  // Identificação
  const razao = extrairCampo(secId, 'Razão Social', 'SITUAÇÃO|CNPJ|Nome') || '';
  const fantasia = extrairCampo(secId, 'Nome Fantasia', 'Inscrição|CNPJ|Razão') || '';
  const cnpj = (extrairCampo(secId, 'CNPJ', 'Inscrição|Razão|Nome') || '').replace(/\D/g, '');
  const cga = (extrairCampo(secId, 'INSCRIÇÃO MUNICIPAL \\(CGA\\)', 'SITUAÇÃO') || '').replace(/[^\d.\/\-]/g, '');
  let sit = extrairCampo(secId, 'SITUAÇÃO CADASTRAL', 'IDENTIFICAÇÃO|Data|Razão') || '';
  sit = sit.replace(/Razão.*/i, '').trim();
  if (!sit) sit = (texto.match(/Ativa\s+Regular/i) || [])[0] || '';

  // Endereço
  const logr = extrairCampo(secEnd, 'Logradouro', 'Número|Bairro|CEP') || '';
  let num = extrairCampo(secEnd, 'Número', 'Edificio|Bairro|CEP') || '';
  num = num.replace(/\s*Edifício.*/i, '').trim();
  const compl = extrairCampo(secEnd, 'Complemento', 'CEP|Bairro') || '';
  let bairro = extrairCampo(secEnd, 'Bairro', 'CEP|Logradouro|Complemento') || '';
  bairro = bairro.replace(/Complemento:.*/i, '').trim();
  const cep = (extrairCampo(secEnd, 'CEP', 'Telefone|Correio') || '').replace(/\D/g, '');
  const tel = extrairCampo(secEnd, 'Telefone', 'Fax|Correio') || '';
  
  // ========== E-MAIL: SUBSTITUI DOIS CARACTERES ANTES DO DOMÍNIO POR "@" ==========
  let email = '';
  const emMatch = texto.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (emMatch) {
    email = emMatch[1];
  } else {
    // Procura padrão: parte local + 2 caracteres quaisquer + domínio conhecido + .com...
    const heur = texto.match(/([a-zA-Z0-9._%+-]+?)\s*..\s*(GMAIL|HOTMAIL|OUTLOOK|YAHOO|TERRA|UOL|BOL)(\.COM(\.BR)?)/i);
    if (heur) {
      // Remove os dois caracteres problemáticos e insere "@"
      const parteLocal = heur[1].replace(/[^a-zA-Z0-9._%+-]/g, '');
      email = `${parteLocal}@${heur[2]}${heur[3]}`;
    }
  }

  // TVL
  const tvlNum = extrairCampo(secTVL, 'Nº DO TVL', 'Validade') || '';
  let tvlVal = extrairCampo(secTVL, 'Validade', 'Definitivo|TERMO|DADOS') || '';
  if (!tvlVal) tvlVal = (secTVL.match(/Validade\s*:?\s*([^\n]+)/i) || [])[1]?.trim() || '';

  // Constituição
  const tipoConst = extrairCampo(secConst, 'Tipo de Constituição', 'Tipo de unidade') || '';
  const tipoUnid = extrairCampo(secConst, 'Tipo de unidade', 'Forma de Atuação') || '';
  const formaAt = extrairCampo(secConst, 'Forma de Atuação', 'Natureza Jurídica') || '';
  const natJur = extrairCampo(secConst, 'Natureza Jurídica', 'Data Inscrição') || '';
  const dataIni = (extrairCampo(secConst, 'Data Inscrição na Prefeitura', 'ATIVIDADE|$') || '').match(/\d{2}\/\d{2}\/\d{4}/)?.[0] || '';

  // ========== ATIVIDADES: LÓGICA FINAL (FRAGMENTOS MINÚSCULOS SÃO ANEXADOS À ATIVIDADE ANTERIOR) ==========
  const atividades = [];
  const textoBrutoAtv = textoBruto.split('ATIVIDADE(S)')[1]?.split('OBSERVAÇÕES')[0] || '';
  const linhas = textoBrutoAtv.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  console.info('🔍 LINHAS DA SEÇÃO DE ATIVIDADES:', linhas);
  
  let descricaoAtual = '';
  let i = 0;
  
  while (i < linhas.length) {
    const linha = linhas[i];
    const cnaeMatch = linha.match(/(\d{4}-\d\/\d{2})\s+(\d{2}\/\d{2}\/\d{4})/);
    
    if (cnaeMatch) {
      const codigo = cnaeMatch[1];
      const data = cnaeMatch[2];
      const idxCnae = linha.indexOf(cnaeMatch[0]);
      
      let prefixo = '';
      if (idxCnae > 0) {
        prefixo = linha.substring(0, idxCnae).trim();
      }
      
      if (descricaoAtual && atividades.length > 0) {
        const ultima = atividades[atividades.length - 1];
        ultima.descricao += ' ' + descricaoAtual;
        ultima.descricao = ultima.descricao.replace(/\s+/g, ' ').trim();
        console.info(`🔄 Concatenando fragmento à atividade ${atividades.length}: "${descricaoAtual}" -> "${ultima.descricao}"`);
        descricaoAtual = '';
      }
      
      let descricao = prefixo;
      atividades.push({ codigo, dataInicio: data, descricao });
      console.info(`📌 Nova atividade ${atividades.length}: cod=${codigo}, desc="${descricao}"`);
      
      const afterCnae = linha.substring(idxCnae + cnaeMatch[0].length).trim();
      if (afterCnae) {
        const primeiraLetra = afterCnae.charAt(0);
        if (primeiraLetra === primeiraLetra.toLowerCase() && primeiraLetra !== primeiraLetra.toUpperCase()) {
          atividades[atividades.length - 1].descricao += ' ' + afterCnae;
          atividades[atividades.length - 1].descricao = atividades[atividades.length - 1].descricao.trim();
          console.info(`➕ Fragmento minúsculo após CNAE anexado à própria atividade: "${afterCnae}"`);
        } else {
          descricaoAtual = afterCnae;
          console.info(`⏩ Fragmento maiúsculo após CNAE será início da próxima: "${afterCnae}"`);
        }
      }
    } else {
      const primeiraLetra = linha.charAt(0);
      if (primeiraLetra === primeiraLetra.toLowerCase() && primeiraLetra !== primeiraLetra.toUpperCase()) {
        if (atividades.length > 0) {
          const ultima = atividades[atividades.length - 1];
          ultima.descricao += ' ' + linha;
          ultima.descricao = ultima.descricao.replace(/\s+/g, ' ').trim();
          console.info(`🔗 Fragmento minúsculo anexado à última atividade: "${linha}" -> "${ultima.descricao}"`);
        } else {
          descricaoAtual += (descricaoAtual ? ' ' : '') + linha;
        }
      } else {
        descricaoAtual += (descricaoAtual ? ' ' : '') + linha;
        console.info(`📦 Fragmento maiúsculo acumulado para próxima: "${linha}" -> descricaoAtual="${descricaoAtual}"`);
      }
    }
    i++;
  }
  
  if (descricaoAtual && atividades.length > 0) {
    const ultima = atividades[atividades.length - 1];
    ultima.descricao += ' ' + descricaoAtual;
    ultima.descricao = ultima.descricao.replace(/\s+/g, ' ').trim();
    console.info(`🧹 Resto final anexado à última atividade: "${descricaoAtual}" -> "${ultima.descricao}"`);
  }
  
  atividades.forEach(atv => {
    atv.descricao = atv.descricao
      .replace(/^(CNAE|DATA\s*INÍCIO|ATIVIDADE\s*\(S\)|OBSERVAÇÕES)\s*/i, '')
      .replace(/\bDATA\s*INÍCIO\b/gi, '')
      .replace(/\bCNAE\b/gi, '')
      .replace(/\bATIVIDADE\s*\(S\)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  });
  
  const atividadePrincipal = atividades[0] || null;
  const atividadesSecundarias = atividades.slice(1);
  const cnaePrincipal = atividadePrincipal?.codigo || '';

  return {
    identificacao: { inscricaoMunicipal: cga, cnpj, razaoSocial: razao, nomeFantasia: fantasia, situacaoCadastral: sit },
    constituicao: { dataInscricaoPrefeitura: dataIni, tipoUnidade: tipoUnid, formaAtuacao: formaAt, tipoConstituicao: tipoConst, naturezaJuridica: natJur, numeroTVL: tvlNum, validadeTVL: tvlVal },
    endereco: { logradouro: logr, numero: num, complemento: compl, bairro, cep },
    contato: { telefone: tel, email },
    atividadePrincipal,
    atividadesSecundarias,
    cnaePrincipal,
    observacoes: secObs,
  };
};

// ========== CONTROLADOR ==========
const buscarFichaCadastralSalvador = async (req, res) => {
  const { cnpj, forceRefresh } = req.body;
  if (!cnpj) return res.status(400).json({ message: 'CNPJ obrigatório.' });
  const clean = cnpj.replace(/\D/g, '');
  if (!validarCNPJ(clean)) return res.status(400).json({ message: 'CNPJ inválido.' });

  const cached = getCached(clean, forceRefresh);
  if (cached) return res.json({ sucesso: true, fromCache: true, ...cached });

  const url = process.env.SEFAZ_FICHA_URL || 'https://servicosweb.sefaz.salvador.ba.gov.br/WebsiteV2/Sistemas/AlvaraCgaInternet/Modulos/Principal/AlvaraCgaEmissaoFichaResumidaFrm.aspx';

  for (let t=1; t<=MAX_RETRIES; t++) {
    let browser, context, page;
    try {
      console.info(`🔄 Tentativa ${t}...`);
      browser = await chromium.launch({ headless: HEADLESS_MODE, args: ['--start-maximized','--disable-blink-features=AutomationControlled'], slowMo:20 });
      context = await browser.newContext({ viewport:{width:1366,height:768}, userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36', acceptDownloads:true });
      await context.clearCookies();
      page = await context.newPage();
      page.on('dialog', d => d.accept());
      await page.goto(url, { waitUntil:'domcontentloaded' }); await humanDelay(1500);

      await page.waitForSelector('#ctl00_ContentPlaceHolderPrincipal_RdBNuCnpj', {timeout:15000});
      await humanClick(page, '#ctl00_ContentPlaceHolderPrincipal_RdBNuCnpj'); await humanDelay(600);
      await humanType(page, '#ctl00_ContentPlaceHolderPrincipal_txtNuCnpj', clean); await humanDelay(800);
      const [download] = await Promise.all([ page.waitForEvent('download', {timeout:90000}), humanClick(page, '#ctl00_ContentPlaceHolderPrincipal_BtnConsultar0') ]);
      
      const tmp = path.join(TEMP_DIR, `temp_${Date.now()}_${Math.random().toString(36)}.pdf`);
      await download.saveAs(tmp);
      console.info(`✅ PDF: ${fs.statSync(tmp).size} bytes`);
      
      const texto = await extractTextFromPDF(tmp);
      const dados = parseDadosFicha(texto);
      const front = {
        inscricao: dados.identificacao.inscricaoMunicipal,
        cnpj: dados.identificacao.cnpj || clean,
        razaoSocial: dados.identificacao.razaoSocial,
        nomeFantasia: dados.identificacao.nomeFantasia,
        situacao: dados.identificacao.situacaoCadastral,
        dataInicio: dados.constituicao.dataInscricaoPrefeitura,
        tipoUnidade: dados.constituicao.tipoUnidade,
        formaAtuacao: dados.constituicao.formaAtuacao,
        tipoConstituicao: dados.constituicao.tipoConstituicao,
        naturezaJuridica: dados.constituicao.naturezaJuridica,
        numeroTVL: dados.constituicao.numeroTVL,
        validadeTVL: dados.constituicao.validadeTVL,
        logradouro: dados.endereco.logradouro,
        numero: dados.endereco.numero,
        complemento: dados.endereco.complemento,
        bairro: dados.endereco.bairro,
        cep: dados.endereco.cep,
        telefone: dados.contato.telefone,
        email: dados.contato.email,
        atividadePrincipal: dados.atividadePrincipal,
        atividadesSecundarias: dados.atividadesSecundarias,
        cnaePrincipal: dados.cnaePrincipal,
        observacoes: dados.observacoes,
      };
      
      const agora = new Date();
      const dataBr = agora.toLocaleDateString('pt-BR').replace(/\//g,'-');
      const horaBr = agora.toLocaleTimeString('pt-BR').replace(/:/g,'-');
      const finalName = `${front.cnpj}_${dataBr}_${horaBr}.pdf`;
      const finalPath = path.join(TEMP_DIR, finalName);
      fs.renameSync(tmp, finalPath);
      
      const shot = await page.screenshot({ fullPage: true });
      await page.close(); await context.close(); await browser.close();
      
      const resp = { dados: front, pdfUrl: `/api/temp/pdfs/${RPA_PDF_DIR}/${finalName}`, imagemRenderizada: shot.toString('base64') };
      setCached(clean, resp);
      return res.json({ sucesso: true, ...resp });
    } catch (e) {
      console.error(`❌ Erro tentativa ${t}:`, e.message);
      if (page) await page.close().catch(()=>{});
      if (context) await context.close().catch(()=>{});
      if (browser) await browser.close().catch(()=>{});
      if (t === MAX_RETRIES) return res.status(500).json({ message: 'Falha na consulta', error: e.message });
      await sleep(2000 * t);
    }
  }
};

module.exports = { buscarFichaCadastralSalvador };
