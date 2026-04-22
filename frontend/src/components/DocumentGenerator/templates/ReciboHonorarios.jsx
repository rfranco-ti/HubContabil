import { forwardRef } from 'react';
import A4Document from '../A4Document';
import { formatCurrency, currencyToWords, formatDateByExtense, formatCPF } from '../utils/formatters';

/**
 * Template de Recibo de Honorários Contábeis
 * 
 * @param {Object} data - Dados do recibo
 * @param {string} data.numero - Número do recibo
 * @param {number} data.valor - Valor em reais
 * @param {string} data.clienteNome - Nome do cliente
 * @param {string} data.clienteDocumento - CPF/CNPJ do cliente
 * @param {string} data.referencia - Mês/ano de referência
 * @param {string} data.dataEmissao - Data de emissão
 * @param {string} data.contadorNome - Nome do contador
 * @param {string} data.contadorCRC - CRC do contador
 * @param {string} data.empresaNome - Nome do escritório
 * @param {string} data.empresaCNPJ - CNPJ do escritório
 * @param {string} data.cidade - Cidade
 */
const ReciboHonorarios = forwardRef((props, ref) => {
  const {
    numero = '001',
    valor = 0,
    clienteNome = '',
    clienteDocumento = '',
    referencia = '',
    dataEmissao = new Date(),
    contadorNome = '',
    contadorCRC = '',
    empresaNome = '',
    empresaCNPJ = '',
    cidade = '',
    tipoRecibo = 'mensal'
  } = props.data || {};

  return (
    <A4Document ref={ref}>
      {/* Cabeçalho */}
      <header className="document-header">
        <h1>Recibo de Honorários</h1>
      </header>

      {/* Número do recibo */}
      <div style={{ textAlign: 'right', marginBottom: '20px' }}>
        <span className="bold">Nº {numero}</span>
      </div>

      {/* Corpo do recibo */}
      <div className="document-body">
        <p className="text-justify">
          Recebemos de <span className="bold">{clienteNome}</span>,
          inscrito(a) no CPF/CNPJ sob nº {formatCPF(clienteDocumento)},
          a importância de <span className="bold">{formatCurrency(valor)}</span> ({currencyToWords(valor)}),
          referente aos {tipoRecibo === 'avulso' ? 'serviços contábeis avulsos' : 'serviços contábeis do mês'} de <span className="bold">{referencia}</span>.
        </p>

        <p className="text-justify" style={{ marginTop: '30px' }}>
          Por ser verdade, firmamos o presente recibo.
        </p>

        <p style={{ marginTop: '30px' }}>
          {cidade}, {formatDateByExtense(dataEmissao)}.
        </p>
      </div>

      {/* Assinatura */}
      <div className="document-signature">
        <div className="signature-line"></div>
        <div className="signature-text bold">{contadorNome}</div>
        <div className="signature-text">CRC: {contadorCRC}</div>
        <div className="signature-text bold">{empresaNome}</div>
        <div className="signature-text">CNPJ: {formatCPF(empresaCNPJ)}</div>
      </div>

      {/* Rodapé */}
      <footer className="document-footer">
        <p>Este recibo foi gerado eletronicamente.</p>
      </footer>
    </A4Document>
  );
});

ReciboHonorarios.displayName = 'ReciboHonorarios';

export default ReciboHonorarios;
