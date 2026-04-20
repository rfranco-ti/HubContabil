import { forwardRef } from 'react';
import A4Document from '../A4Document';
import { formatDateByExtense } from '../utils/formatters';

/**
 * Template de Comunicado/Circular para Clientes
 * 
 * @param {Object} data - Dados do comunicado
 * @param {string} data.titulo - Título do comunicado
 * @param {string} data.conteudo - Corpo do texto (pode conter HTML)
 * @param {string} data.dataEmissao - Data de emissão
 * @param {string} data.cidade - Cidade
 * @param {string} data.contadorNome - Nome do contador responsável
 * @param {string} data.contadorCRC - CRC do contador
 * @param {string} data.empresaNome - Nome do escritório
 * @param {string} data.contatoEmail - Email para contato
 * @param {string} data.contatoTelefone - Telefone para contato
 */
const Comunicado = forwardRef((props, ref) => {
  const {
    titulo = '',
    conteudo = '',
    dataEmissao = new Date(),
    cidade = '',
    contadorNome = '',
    contadorCRC = '',
    empresaNome = '',
    contatoEmail = '',
    contatoTelefone = ''
  } = props.data || {};

  // Converte quebras de linha em parágrafos
  const parseContent = () => {
    if (!conteudo) return null;
    return conteudo.split('\n').map((paragraph, index) => (
      <p key={index} className="text-justify" style={{ marginTop: index > 0 ? '15px' : '0' }}>
        {paragraph}
      </p>
    ));
  };

  return (
    <A4Document ref={ref}>
      {/* Cabeçalho */}
      <header className="document-header">
        <h1>Comunicado Oficial</h1>
      </header>

      {/* Data e cidade */}
      <div style={{ textAlign: 'right', marginBottom: '30px' }}>
        <p>
          {cidade}, {formatDateByExtense(dataEmissao)}.
        </p>
      </div>

      {/* Saudação */}
      <div className="document-body">
        <p className="text-justify" style={{ marginBottom: '25px' }}>
          Aos nossos clientes,
        </p>

        {/* Título do comunicado */}
        {titulo && (
          <h2 style={{ 
            textAlign: 'center', 
            fontSize: '14pt', 
            marginBottom: '25px',
            textDecoration: 'underline'
          }}>
            {titulo}
          </h2>
        )}

        {/* Conteúdo */}
        <div style={{ marginBottom: '40px' }}>
          {parseContent()}
        </div>

        {/* Despedida */}
        <p style={{ marginBottom: '40px' }}>
          Atenciosamente,
        </p>
      </div>

      {/* Assinatura */}
      <div className="document-signature">
        <div className="signature-line"></div>
        <div className="signature-text bold">{contadorNome}</div>
        <div className="signature-text">CRC: {contadorCRC}</div>
        <div className="signature-text bold">{empresaNome}</div>
      </div>

      {/* Rodapé com contato */}
      <footer className="document-footer" style={{ marginTop: '40px' }}>
        {(contatoEmail || contatoTelefone) && (
          <p>
            Contato: {contatoEmail}
            {contatoEmail && contatoTelefone && ' | '}
            {contatoTelefone}
          </p>
        )}
      </footer>
    </A4Document>
  );
});

Comunicado.displayName = 'Comunicado';

export default Comunicado;
