import { useState } from 'react';

/**
 * Formulário para preenchimento do Termo de Devolução de Documentos
 * 
 * @param {Object} formData - Dados atuais do formulário
 * @param {Function} onChange - Callback para mudanças nos dados
 */
const TermoDevolucaoForm = ({ formData = {}, onChange }) => {
  const [localData, setLocalData] = useState({
    empresaNome: '',
    empresaCNPJ: '',
    clienteNome: '',
    clienteDocumento: '',
    documentos: [],
    motivo: '',
    dataDevolucao: new Date().toISOString().split('T')[0],
    responsavelNome: '',
    responsavelCargo: '',
    ...formData
  });

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange?.(newData);
  };

  const handleDocumentoToggle = (docKey) => {
    const currentDocs = localData.documentos || [];
    const newDocs = currentDocs.includes(docKey)
      ? currentDocs.filter(d => d !== docKey)
      : [...currentDocs, docKey];
    
    handleChange('documentos', newDocs);
  };

  const handleOutrosDocumentos = (e) => {
    const value = e.target.value;
    if (value.trim()) {
      const currentDocs = localData.documentos || [];
      if (!currentDocs.includes('outros')) {
        handleChange('documentos', [...currentDocs, 'outros']);
      }
      handleChange('outrosDocumentosTexto', value);
    }
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

  const documentoOptions = [
    { key: 'ctps', label: 'Carteira de Trabalho (CTPS)' },
    { key: 'rg', label: 'RG' },
    { key: 'cpf', label: 'CPF' },
    { key: 'cnh', label: 'CNH' },
    { key: 'certidao_nascimento', label: 'Certidão de Nascimento/Casamento' },
    { key: 'comprovante_residencia', label: 'Comprovante de Residência' },
    { key: 'holerites', label: 'Holerites/Contracheques' },
    { key: 'extratos_bancarios', label: 'Extratos Bancários' },
    { key: 'declaracao_ir', label: 'Declaração de IR' },
    { key: 'certidoes', label: 'Certidões' },
    { key: 'comprovantes', label: 'Comprovantes diversos' }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>📋 Termo de Devolução</h3>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {/* Dados do Escritório */}
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
            CNPJ do Escritório *
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

        {/* Dados do Cliente */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Nome do Cliente *
          </label>
          <input
            type="text"
            value={localData.clienteNome}
            onChange={(e) => handleChange('clienteNome', e.target.value)}
            placeholder="Nome completo"
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

        {/* Lista de Documentos */}
        <div style={{ 
          border: '1px solid #ddd', 
          borderRadius: '6px', 
          padding: '15px',
          backgroundColor: '#fafafa'
        }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600' }}>
            📄 Documentos Devolvidos
          </label>
          
          <div style={{ display: 'grid', gap: '10px' }}>
            {documentoOptions.map((doc) => (
              <label key={doc.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={(localData.documentos || []).includes(doc.key)}
                  onChange={() => handleDocumentoToggle(doc.key)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>{doc.label}</span>
              </label>
            ))}
            
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={(localData.documentos || []).includes('outros')}
                  onChange={() => handleDocumentoToggle('outros')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>Outros</span>
              </label>
              {(localData.documentos || []).includes('outros') && (
                <input
                  type="text"
                  placeholder="Especifique quais documentos..."
                  onChange={handleOutrosDocumentos}
                  style={{ ...inputStyle, marginTop: '8px', marginLeft: '26px', width: 'calc(100% - 26px)' }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Motivo */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Motivo da Devolução *
          </label>
          <textarea
            value={localData.motivo}
            onChange={(e) => handleChange('motivo', e.target.value)}
            placeholder="Ex: Solicitação do cliente, encerramento do contrato, etc."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Data e Responsável */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Data da Devolução *
            </label>
            <input
              type="date"
              value={localData.dataDevolucao}
              onChange={(e) => handleChange('dataDevolucao', e.target.value)}
              style={inputStyle}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Nome do Responsável *
            </label>
            <input
              type="text"
              value={localData.responsavelNome}
              onChange={(e) => handleChange('responsavelNome', e.target.value)}
              placeholder="Nome completo"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
            Cargo do Responsável *
          </label>
          <input
            type="text"
            value={localData.responsavelCargo}
            onChange={(e) => handleChange('responsavelCargo', e.target.value)}
            placeholder="Ex: Contador, Assistente Contábil"
            style={inputStyle}
          />
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

export default TermoDevolucaoForm;
