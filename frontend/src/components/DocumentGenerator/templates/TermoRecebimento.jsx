import { forwardRef } from 'react';
import A4Document from '../A4Document';
import { formatCPF, formatDate } from '../utils/formatters';

/**
 * Template de Termo de Recebimento de Documentos
 * 
 * @param {Object} data - Dados do termo
 * @param {string} data.clienteNome - Nome do cliente
 * @param {string} data.clienteDocumento - CPF/CNPJ do cliente
 * @param {string} data.empresaNome - Nome do escritório
 * @param {string} data.finalidade - Finalidade da entrega
 * @param {Array} data.documentos - Lista de documentos entregues
 * @param {string} data.dataRecebimento - Data do recebimento
 * @param {string} data.responsavelNome - Nome do responsável
 * @param {string} data.responsavelCargo - Cargo do responsável
 */
const TermoRecebimento = forwardRef((props, ref) => {
  const {
    clienteNome = '',
    clienteDocumento = '',
    empresaNome = '',
    finalidade = 'processamento contábil',
    documentos = [],
    dataRecebimento = new Date(),
    responsavelNome = '',
    responsavelCargo = ''
  } = props.data || {};

  // Lista padrão de documentos
  const documentoLabels = {
    ctps: 'Carteira de Trabalho (CTPS)',
    rg: 'RG',
    cpf: 'CPF',
    cnh: 'CNH',
    certidao_nascimento: 'Certidão de Nascimento/Casamento',
    comprovante_residencia: 'Comprovante de Residência',
    holerites: 'Holerites/Contracheques',
    extratos_bancarios: 'Extratos Bancários',
    declaracao_ir: 'Declaração de IR',
    outros: 'Outros'
  };

  return (
    <A4Document ref={ref}>
      {/* Cabeçalho */}
      <header className="document-header">
        <h1>Termo de Recebimento de Documentos</h1>
      </header>

      {/* Corpo do termo */}
      <div className="document-body">
        <p className="text-justify">
          Eu, <span className="bold">{clienteNome}</span>, inscrito(a) no CPF/CNPJ sob nº{' '}
          <span className="bold">{formatCPF(clienteDocumento)}</span>, declaro que RECEBI de{' '}
          <span className="bold">{empresaNome}</span> os documentos abaixo relacionados para fins de{' '}
          <span className="bold">{finalidade}</span>:
        </p>

        {/* Lista de documentos */}
        <div style={{ 
          border: '1px solid #000', 
          padding: '15px', 
          margin: '25px 0',
          backgroundColor: '#fafafa'
        }}>
          <p className="bold" style={{ marginBottom: '15px' }}>DOCUMENTOS ENTREGUES:</p>
          
          {documentos.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {documentos.map((doc, index) => (
                <li key={index} style={{ marginBottom: '8px' }}>
                  {documentoLabels[doc] || doc}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, fontStyle: 'italic' }}>Nenhum documento listado</p>
          )}
        </div>

        <p style={{ marginTop: '25px' }}>
          Data do Recebimento: <span className="bold">{formatDate(dataRecebimento)}</span>
        </p>
      </div>

      {/* Assinaturas */}
      <div className="document-signature" style={{ marginTop: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginBottom: '40px' }}>
          <div>
            <div className="signature-line"></div>
            <div className="signature-text bold">{clienteNome}</div>
            <div className="signature-text">(Recebedor)</div>
          </div>
          
          <div>
            <div className="signature-line"></div>
            <div className="signature-text bold">{responsavelNome}</div>
            <div className="signature-text">{responsavelCargo}</div>
            <div className="signature-text">{empresaNome}</div>
          </div>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="document-footer">
        <p>Este documento foi gerado eletronicamente.</p>
      </footer>
    </A4Document>
  );
});

TermoRecebimento.displayName = 'TermoRecebimento';

export default TermoRecebimento;
