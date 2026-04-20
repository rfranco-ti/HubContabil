const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { storage } = require('../config/supabase');
const path = require('path');

const BUCKET_DOCUMENTOS = 'documentos';

// @desc    Gerador dinâmico de Contratos e Recibos em PDF
// @route   POST /api/ged/gerar-contrato
const gerarContrato = async (req, res) => {
  try {
    const {
      razao_social = 'Empresa não informada',
      cnpj = '00.000.000/0001-00',
      endereco = 'Endereço não informado',
      valor_honorario = '0,00',
      dia_vencimento = '10',
      data_inicio = new Date().toLocaleDateString('pt-BR')
    } = req.body;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([595, 842]); // A4
    const { width, height } = page.getSize();

    let y = height - 60;
    const margin = 50;
    const lineHeight = 18;

    // Cabeçalho
    page.drawText('CONTRATO DE PRESTAÇÃO DE SERVIÇOS CONTÁBEIS', {
      x: margin, y, size: 14, font: fontBold, color: rgb(0.05, 0.3, 0.55)
    });
    y -= 10;
    page.drawLine({ start: { x: margin, y }, end: { x: width - margin, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
    y -= 30;

    // Dados do Contratante
    page.drawText('CONTRATANTE:', { x: margin, y, size: 11, font: fontBold });
    y -= lineHeight;
    page.drawText(`Razão Social: ${razao_social}`, { x: margin, y, size: 10, font });
    y -= lineHeight;
    page.drawText(`CNPJ: ${cnpj}`, { x: margin, y, size: 10, font });
    y -= lineHeight;
    page.drawText(`Endereço: ${endereco}`, { x: margin, y, size: 10, font });
    y -= lineHeight * 2;

    // Dados do Contratado
    page.drawText('CONTRATADO:', { x: margin, y, size: 11, font: fontBold });
    y -= lineHeight;
    page.drawText('Hub Contábil - Escritório de Contabilidade', { x: margin, y, size: 10, font });
    y -= lineHeight * 2;

    // Cláusulas
    const clausulas = [
      `CLÁUSULA 1ª – O CONTRATADO prestará serviços de escrituração contábil, fiscal e trabalhista ao CONTRATANTE, conforme legislação vigente.`,
      `CLÁUSULA 2ª – Os honorários mensais ficam estabelecidos em R$ ${valor_honorario} (reais), com vencimento todo dia ${dia_vencimento} de cada mês.`,
      `CLÁUSULA 3ª – O presente contrato entra em vigor na data de ${data_inicio}, por prazo indeterminado, podendo ser rescindido por qualquer das partes mediante aviso prévio de 30 dias.`,
      `CLÁUSULA 4ª – O CONTRATANTE se compromete a enviar toda a documentação fiscal e bancária até o dia 5 de cada mês, sob pena de atraso nas obrigações acessórias.`,
      `CLÁUSULA 5ª – As partes elegem o foro da Comarca local para dirimir quaisquer dúvidas oriundas deste contrato.`
    ];

    for (const clausula of clausulas) {
      const words = clausula.split(' ');
      let line = '';
      for (const word of words) {
        const testLine = line + word + ' ';
        const textWidth = font.widthOfTextAtSize(testLine, 10);
        if (textWidth > width - margin * 2) {
          page.drawText(line.trim(), { x: margin, y, size: 10, font });
          y -= lineHeight;
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
      if (line.trim()) {
        page.drawText(line.trim(), { x: margin, y, size: 10, font });
        y -= lineHeight * 1.5;
      }
    }

    // Assinatura
    y -= 40;
    page.drawLine({ start: { x: margin, y }, end: { x: 250, y }, thickness: 0.5, color: rgb(0, 0, 0) });
    page.drawText('Assinatura do Contratante', { x: margin + 30, y: y - 14, size: 9, font });

    page.drawLine({ start: { x: 320, y }, end: { x: width - margin, y }, thickness: 0.5, color: rgb(0, 0, 0) });
    page.drawText('Assinatura do Contratado', { x: 350, y: y - 14, size: 9, font });

    // Salvar em memória e devolver ao frontend
    const pdfBytes = await pdfDoc.save();
    const fileName = `contrato-${cnpj.replace(/\D/g, '')}-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '..', 'uploads', fileName);
    fs.writeFileSync(filePath, pdfBytes);

    res.json({
      message: 'Contrato gerado com sucesso!',
      filename: fileName,
      url: `/uploads/${fileName}`,
      pdfBase64: Buffer.from(pdfBytes).toString('base64')
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro crítico na geração do contrato.', error: error.message });
  }
};

module.exports = { gerarContrato };
