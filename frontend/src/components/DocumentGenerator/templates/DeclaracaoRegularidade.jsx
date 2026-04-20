import { forwardRef } from 'react';
import A4Document from '../A4Document';
import { formatCPF, formatDateByExtense, formatMonthYear } from '../utils/formatters';

/**
 * Template de Declaração de Regularidade
 * 
 * @param {Object} data - Dados da declaração
 * @param {string} data.empresaNome - Nome do escritório
 * @param {string} data.empresaCNPJ - CNPJ do escritório
 * @param {string} data.empresaEndereco - Endereço completo do escritório
 * @param {string} data.clienteNome - Nome do cliente
 * @param {string} data.clienteDocumento - CPF/CNPJ do cliente
 * @param {string} data.dataInicioContrato - Data de início do contrato
 * @param {string} data.situacao - Situação do cliente (adimplente/inadimplente)
 * @param {string} data.dataEmissao - Data de emissão
 * @param {string} data.cidade - Cidade
 * @param {string} data.contadorNome - Nome do contador
 * @param {string} data.contadorCRC - CRC do contador
 */
const DeclaracaoRegularidade = forwardRef((props, ref) => {
  const {
    empresaNome = '',
    empresaCNPJ = '',
    empresaEndereco = '',
    clienteNome = '',
    clienteDocumento = '',
    dataInicioContrato = '',
    situacao = 'adimplente',
    dataEmissao = new Date(),
    cidade = '',
    contadorNome = '',
    contadorCRC = ''
  } = props.data || {};

  const isAdimplente = situacao === 'adimplente';

  return (
    <A4Document ref={ref}>
      {/* Cabeçalho */}
      <header className="document-header">
        <h1>Declaração de Regularidade</h1>
      </header>

      {/* Corpo da declaração */}
      <div className="document-body">
        <p className="text-justify">
          <span className="bold">{empresaNome}</span>, pessoa jurídica de direito privado,
          inscrita no CNPJ sob nº <span className="bold">{formatCPF(empresaCNPJ)}</span>,
          com sede em <span className="bold">{empresaEndereco}</span>,
        </p>

        <p className="text-justify" style={{ marginTop: '15px' }}>
          <strong>DECLARA</strong> para os devidos fins que:
        </p>

        <p className="text-justify" style={{ marginTop: '15px' }}>
          <span className="bold">{clienteNome}</span>, inscrito(a) no CPF/CNPJ sob nº{' '}
          <span className="bold">{formatCPF(clienteDocumento)}</span>, é nosso cliente desde{' '}
          <span className="bold">{formatMonthYear(dataInicioContrato)}</span>,
          encontrando-se <span className="bold" style={{ color: isAdimplente ? '#00aa00' : '#cc0000' }}>
            {isAdimplente ? 'ADIMPLENTE' : 'INADIMPLENTE'}
          </span>{' '}
          com todas as obrigações contábeis e fiscais até a presente data.
        </p>

        <p className="text-justify" style={{ marginTop: '25px' }}>
          Por ser verdade, firmamos a presente declaração.
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
        <p>Esta declaração foi gerada eletronicamente.</p>
        <p style={{ fontSize: '9pt', marginTop: '10px' }}>
          Válida por 30 (trinta) dias a partir da data de emissão.
        </p>
      </footer>
    </A4Document>
  );
});

DeclaracaoRegularidade.displayName = 'DeclaracaoRegularidade';

export default DeclaracaoRegularidade;
