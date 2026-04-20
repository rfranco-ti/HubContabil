import { useState } from 'react';

/**
 * Formulário para preenchimento do Comunicado/Circular
 * 
 * @param {Object} formData - Dados atuais do formulário
 * @param {Function} onChange - Callback para mudanças nos dados
 */
const ComunicadoForm = ({ formData = {}, onChange }) => {
  const [localData, setLocalData] = useState({
    titulo: '',
    conteudo: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    cidade: '',
    contadorNome: '',
    contadorCRC: '',
    empresaNome: '',
    contatoEmail: '',
    contatoTelefone: '',
    ...formData
  });

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange?.(newData);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>📢 Comunicado Oficial</h3>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {/* Título e Cidade */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Título do Comunicado *
            </label>
            <input
              type="text"
              value={localData.titulo}
              onChange={(e) => handleChange('titulo', e.target.value)}
              placeholder="Ex: Atualização das Tabelas de INSS"
              style={inputStyle}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Cidade *
            </label>
            <input
              type="text"
              value={localData.cidade}
              onChange={(e) => handleChange('cidade', e.target.value)}
              placeholder="Nome da cidade"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Data de Emissão */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Data de Emissão *
          </label>
          <input
            type="date"
            value={localData.dataEmissao}
            onChange={(e) => handleChange('dataEmissao', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Conteúdo */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Conteúdo do Comunicado *
          </label>
          <textarea
            value={localData.conteudo}
            onChange={(e) => handleChange('conteudo', e.target.value)}
            placeholder="Digite o texto completo do comunicado (use Enter para novos parágrafos)"
            rows={10}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            Dica: Pressione Enter para criar novos parágrafos
          </p>
        </div>

        {/* Dados do Contador */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <h4 style={{ marginBottom: '15px', color: '#666' }}>Dados do Contador Responsável</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Nome do Contador *
              </label>
              <input
                type="text"
                value={localData.contadorNome}
                onChange={(e) => handleChange('contadorNome', e.target.value)}
                placeholder="Nome completo"
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                CRC *
              </label>
              <input
                type="text"
                value={localData.contadorCRC}
                onChange={(e) => handleChange('contadorCRC', e.target.value.toUpperCase())}
                placeholder="000000/O-0"
                style={inputStyle}
              />
            </div>
          </div>
          
          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Nome do Escritório *
            </label>
            <input
              type="text"
              value={localData.empresaNome}
              onChange={(e) => handleChange('empresaNome', e.target.value)}
              placeholder="Razão social"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Dados de Contato */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <h4 style={{ marginBottom: '15px', color: '#666' }}>Dados de Contato (Opcional)</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Email
              </label>
              <input
                type="email"
                value={localData.contatoEmail}
                onChange={(e) => handleChange('contatoEmail', e.target.value)}
                placeholder="contato@empresa.com.br"
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Telefone
              </label>
              <input
                type="tel"
                value={localData.contatoTelefone}
                onChange={(e) => handleChange('contatoTelefone', e.target.value)}
                placeholder="(00) 0000-0000"
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s'
};

export default ComunicadoForm;
