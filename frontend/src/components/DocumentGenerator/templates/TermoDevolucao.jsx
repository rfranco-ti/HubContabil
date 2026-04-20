import { forwardRef } from 'react';
import A4Document from '../A4Document';
import { formatCPF, formatDate } from '../utils/formatters';

/**
 * Template de Termo de Devolução de Documentos
 * 
 * @param {Object} data - Dados do termo
 * @param {string} data.empresaNome - Nome do escritório
 * @param {string} data.empresaCNPJ - CNPJ do escritório
 * @param {string} data.clienteNome - Nome do cliente
 * @param {string} data.clienteDocumento - CPF/CNPJ do cliente
 * @param {Array} data.documentos - Lista de documentos devolvidos
 * @param {string} data.motivo - Motivo da devolução
 * @param {string} data.dataDevolucao - Data da devolução
 * @param {string} data.responsavelNome - Nome do responsável
 * @param {string} data.responsavelCargo - Cargo do responsável
 */
const TermoDevolucao = forwardRef((props, ref) => {
  const {
    empresaNome = '',
    empresaCNPJ = '',
    clienteNome = '',
    clienteDocumento = '',
    documentos = [],
    motivo = '',
    dataDevolucao = new Date(),
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
    certidoes: 'Certidões',
    comprovantes: 'Comprovantes diversos',
    outros: 'Outros'
  };

  return (
    <A4Document ref={ref}>
      {/* Cabeçalho */}
      <header className="document-header">
        <h1>Termo de Devolução de Documentos</h1>
      </header>

      {/* Corpo do termo */}
      <div className="document-body">
        <p className="text-justify">
          <span className="bold">{empresaNome}</span>, pessoa jurídica de direito privado,
          inscrita no CNPJ sob nº <span className="bold">{formatCPF(empresaCNPJ)}</span>,
          com sede em seu endereço comercial,
        </p>

        <p className="text-justify" style={{ marginTop: '15px' }}>
          <strong>DEVOLVEU</strong> a <span className="bold">{clienteNome}</span>, inscrito(a) no
          CPF/CNPJ sob nº <span className="bold">{formatCPF(clienteDocumento)}</span>, os documentos
          originais abaixo relacionados:
        </p>

        {/* Lista de documentos */}
        <div style={{ 
          border: '1px solid #000', 
          padding: '15px', 
          margin: '25px 0',
          backgroundColor: '#fafafa'
        }}>
          <p className="bold" style={{ marginBottom: '15px' }}>DOCUMENTOS DEVOLVIDOS:</p>
          
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

        {motivo && (
          <p className="text-justify" style={{ marginTop: '20px' }}>
            <strong>Motivo da Devolução:</strong> {motivo}
          </p>
        )}

        <p style={{ marginTop: '25px' }}>
          Data: <span className="bold">{formatDate(dataDevolucao)}</span>
        </p>
      </div>

      {/* Assinaturas */}
      <div className="document-signature" style={{ marginTop: '60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', marginBottom: '40px' }}>
          <div>
            <div className="signature-line"></div>
            <div className="signature-text bold">{clienteNome}</div>
            <div className="signature-text">(Recebi os documentos em perfeitas condições)</div>
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

TermoDevolucao.displayName = 'TermoDevolucao';

export default TermoDevolucao;
