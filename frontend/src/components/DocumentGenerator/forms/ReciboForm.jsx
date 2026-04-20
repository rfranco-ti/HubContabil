import { useState } from 'react';
import { formatCurrency } from '../utils/formatters';

/**
 * Formulário para preenchimento do Recibo de Honorários
 * 
 * @param {Object} formData - Dados atuais do formulário
 * @param {Function} onChange - Callback para mudanças nos dados
 */
const ReciboForm = ({ formData = {}, onChange }) => {
  const [localData, setLocalData] = useState({
    numero: '',
    valor: '',
    clienteNome: '',
    clienteDocumento: '',
    referencia: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    contadorNome: '',
    contadorCRC: '',
    empresaNome: '',
    empresaCNPJ: '',
    cidade: '',
    ...formData
  });

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange?.(newData);
  };

  const handleValorChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = (Number(value) / 100).toFixed(2);
    handleChange('valor', value);
  };

  const handleDocumentoChange = (e) => {
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
      <h3 style={{ marginBottom: '20px', color: '#333' }}>📋 Dados do Recibo</h3>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {/* Número e Valor */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Número do Recibo *
            </label>
            <input
              type="text"
              value={localData.numero}
              onChange={(e) => handleChange('numero', e.target.value)}
              placeholder="001"
              style={inputStyle}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Valor (R$) *
            </label>
            <input
              type="text"
              value={localData.valor ? formatCurrency(Number(localData.valor)) : ''}
              onChange={handleValorChange}
              placeholder="R$ 0,00"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Dados do Cliente */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Nome do Cliente *
          </label>
          <input
            type="text"
            value={localData.clienteNome}
            onChange={(e) => handleChange('clienteNome', e.target.value)}
            placeholder="Nome completo do cliente"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            CPF/CNPJ do Cliente *
          </label>
          <input
            type="text"
            value={localData.clienteDocumento}
            onChange={handleDocumentoChange}
            placeholder="000.000.000-00"
            maxLength={18}
            style={inputStyle}
          />
        </div>

        {/* Referência e Data */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Mês/Ano de Referência *
            </label>
            <input
              type="text"
              value={localData.referencia}
              onChange={(e) => handleChange('referencia', e.target.value)}
              placeholder="Ex: Janeiro/2026"
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

        {/* Dados do Contador */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <h4 style={{ marginBottom: '15px', color: '#666' }}>Dados do Contador</h4>
          
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

        {/* Dados do Escritório */}
        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <h4 style={{ marginBottom: '15px', color: '#666' }}>Dados do Escritório</h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
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
          </div>
          
          <div style={{ marginTop: '15px' }}>
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

export default ReciboForm;
