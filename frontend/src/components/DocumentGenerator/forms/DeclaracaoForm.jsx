import { useState } from 'react';

/**
 * Formulário para preenchimento da Declaração de Regularidade
 * 
 * @param {Object} formData - Dados atuais do formulário
 * @param {Function} onChange - Callback para mudanças nos dados
 */
const DeclaracaoForm = ({ formData = {}, onChange }) => {
  const [localData, setLocalData] = useState({
    empresaNome: '',
    empresaCNPJ: '',
    empresaEndereco: '',
    clienteNome: '',
    clienteDocumento: '',
    dataInicioContrato: '',
    situacao: 'adimplente',
    dataEmissao: new Date().toISOString().split('T')[0],
    cidade: '',
    contadorNome: '',
    contadorCRC: '',
    ...formData
  });

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange?.(newData);
  };

  const handleClienteDocumentoChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    handleChange('clienteDocumento', value);
  };

  const handleEmpresaCNPJChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    handleChange('empresaCNPJ', value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>📜 Declaração de Regularidade</h3>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {/* Dados do Escritório */}
        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h4 style={{ marginBottom: '15px', color: '#666' }}>Dados do Escritório</h4>
          
          <div>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginTop: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                CNPJ *
              </label>
              <input
                type="text"
                value={localData.empresaCNPJ}
                onChange={handleEmpresaCNPJChange}
                placeholder="00.000.000/0001-00"
                maxLength={18}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Endereço Completo *
              </label>
              <input
                type="text"
                value={localData.empresaEndereco}
                onChange={(e) => handleChange('empresaEndereco', e.target.value)}
                placeholder="Rua, número, bairro, cidade - UF"
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Dados do Cliente */}
        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h4 style={{ marginBottom: '15px', color: '#666' }}>Dados do Cliente</h4>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Nome do Cliente *
            </label>
            <input
              type="text"
              value={localData.clienteNome}
              onChange={(e) => handleChange('clienteNome', e.target.value)}
              placeholder="Nome completo ou razão social"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                CPF/CNPJ do Cliente *
              </label>
              <input
                type="text"
                value={localData.clienteDocumento}
                onChange={handleClienteDocumentoChange}
                placeholder="000.000.000-00"
                maxLength={18}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Data de Início do Contrato *
              </label>
              <input
                type="date"
                value={localData.dataInicioContrato}
                onChange={(e) => handleChange('dataInicioContrato', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Situação *
            </label>
            <div style={{ display: 'flex', gap: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="situacao"
                  value="adimplente"
                  checked={localData.situacao === 'adimplente'}
                  onChange={(e) => handleChange('situacao', e.target.value)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: '#00aa00', fontWeight: '600' }}>✅ Adimplente</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="situacao"
                  value="inadimplente"
                  checked={localData.situacao === 'inadimplente'}
                  onChange={(e) => handleChange('situacao', e.target.value)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ color: '#cc0000', fontWeight: '600' }}>⚠️ Inadimplente</span>
              </label>
            </div>
          </div>
        </div>

        {/* Dados da Emissão */}
        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h4 style={{ marginBottom: '15px', color: '#666' }}>Dados da Emissão</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
          </div>
        </div>

        {/* Dados do Contador */}
        <div>
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

export default DeclaracaoForm;
