import { forwardRef } from 'react';
import A4Document from '../A4Document';
import { formatCPF, formatDateByExtense } from '../utils/formatters';

/**
 * Template de Procuração Simples
 * 
 * @param {Object} data - Dados da procuração
 * @param {string} data.outorganteNome - Nome do outorgante (cliente)
 * @param {string} data.outorganteNacionalidade - Nacionalidade do outorgante
 * @param {string} data.outorganteEstadoCivil - Estado civil do outorgante
 * @param {string} data.outorganteProfissao - Profissão do outorgante
 * @param {string} data.outorganteRG - RG do outorgante
 * @param {string} data.outorganteCPF - CPF do outorgante
 * @param {string} data.outorganteEndereco - Endereço do outorgante
 * @param {string} data.outorgadoNome - Nome do outorgado (procurador)
 * @param {string} data.outorgadoNacionalidade - Nacionalidade do outorgado
 * @param {string} data.outorgadoEstadoCivil - Estado civil do outorgado
 * @param {string} data.outorgadoProfissao - Profissão do outorgado
 * @param {string} data.outorgadoRG - RG do outorgado
 * @param {string} data.outorgadoCPF - CPF do outorgado
 * @param {string} data.outorgadoEndereco - Endereço do outorgado
 * @param {Array} data.poderes - Lista de poderes concedidos
 * @param {string} data.poderesOutros - Outros poderes (texto)
 * @param {string} data.dataEmissao - Data de emissão
 * @param {string} data.cidade - Cidade
 * @param {string} data.validade - Validade da procuração (opcional)
 */
const Procuracao = forwardRef((props, ref) => {
  const {
    outorganteNome = '',
    outorganteNacionalidade = '',
    outorganteEstadoCivil = '',
    outorganteProfissao = '',
    outorganteRG = '',
    outorganteCPF = '',
    outorganteEndereco = '',
    outorgadoNome = '',
    outorgadoNacionalidade = '',
    outorgadoEstadoCivil = '',
    outorgadoProfissao = '',
    outorgadoRG = '',
    outorgadoCPF = '',
    outorgadoEndereco = '',
    poderes = [],
    poderesOutros = '',
    dataEmissao = new Date(),
    cidade = '',
    validade = ''
  } = props.data || {};

  // Lista de poderes
  const poderesLabels = {
    receita_federal: 'Representar perante a Receita Federal',
    assinaturas: 'Assinar declarações e obrigações fiscais',
    protocolar: 'Protocolizar documentos',
    certidoes: 'Solicitar certidões',
    bancos: 'Representar perante instituições bancárias',
    orgaos_publicos: 'Representar perante órgãos públicos em geral',
    outros: 'Outros poderes'
  };

  return (
    <A4Document ref={ref}>
      {/* Cabeçalho */}
      <header className="document-header">
        <h1>Procuração</h1>
      </header>

      {/* Corpo da procuração */}
      <div className="document-body">
        {/* Dados do Outorgante */}
        <div className="document-section">
          <p className="document-section-title">OUTORGANTE:</p>
          <p className="text-justify">
            <span className="bold">{outorganteNome}</span>,
            {outorganteNacionalidade && ` ${outorganteNacionalidade}`},
            {outorganteEstadoCivil && ` ${outorganteEstadoCivil}`},
            {outorganteProfissao && ` ${outorganteProfissao}`},
            portador(a) do RG nº {outorganteRG} e inscrito(a) no CPF sob nº{' '}
            <span className="bold">{formatCPF(outorganteCPF)}</span>,
            residente e domiciliado(a) em {outorganteEndereco}.
          </p>
        </div>

        {/* Dados do Outorgado */}
        <div className="document-section" style={{ marginTop: '20px' }}>
          <p className="document-section-title">OUTORGADO:</p>
          <p className="text-justify">
            <span className="bold">{outorgadoNome}</span>,
            {outorgadoNacionalidade && ` ${outorgadoNacionalidade}`},
            {outorgadoEstadoCivil && ` ${outorgadoEstadoCivil}`},
            {outorgadoProfissao && ` ${outorgadoProfissao}`},
            portador(a) do RG nº {outorgadoRG} e inscrito(a) no CPF sob nº{' '}
            <span className="bold">{formatCPF(outorgadoCPF)}</span>,
            residente e domiciliado(a) em {outorgadoEndereco}.
          </p>
        </div>

        {/* Poderes */}
        <div className="document-section" style={{ marginTop: '30px' }}>
          <p className="document-section-title">PODERES:</p>
          <p className="text-justify">
            Pelo presente instrumento particular de procuração, o OUTORGANTE nomeia e constitui o
            OUTORGADO como seu bastante procurador, conferindo-lhe poderes para:
          </p>

          {poderes.length > 0 && (
            <ul style={{ marginTop: '15px', paddingLeft: '20px' }}>
              {poderes.map((poder, index) => (
                <li key={index} style={{ marginBottom: '8px' }} className="text-justify">
                  {poderesLabels[poder] || poder}
                </li>
              ))}
            </ul>
          )}

          {poderesOutros && (
            <p className="text-justify" style={{ marginTop: '15px' }}>
              <strong>Outros poderes:</strong> {poderesOutros}
            </p>
          )}
        </div>

        {/* Validade */}
        {validade && (
          <p className="text-justify" style={{ marginTop: '20px' }}>
            <strong>Validade:</strong> {validade}
          </p>
        )}

        {/* Data */}
        <p style={{ marginTop: '40px' }}>
          {cidade}, {formatDateByExtense(dataEmissao)}.
        </p>
      </div>

      {/* Assinatura */}
      <div className="document-signature">
        <div className="signature-line"></div>
        <div className="signature-text bold">{outorganteNome}</div>
        <div className="signature-text">CPF: {formatCPF(outorganteCPF)}</div>
        <div className="signature-text">Outorgante</div>
      </div>

      {/* Rodapé */}
      <footer className="document-footer">
        <p>Reconhecer firma em cartório (se necessário).</p>
      </footer>
    </A4Document>
  );
});

Procuracao.displayName = 'Procuracao';

export default Procuracao;
