import { useState } from 'react';

/**
 * Formulário para preenchimento da Procuração
 * 
 * @param {Object} formData - Dados atuais do formulário
 * @param {Function} onChange - Callback para mudanças nos dados
 */
const ProcuracaoForm = ({ formData = {}, onChange }) => {
  const [localData, setLocalData] = useState({
    outorganteNome: '',
    outorganteNacionalidade: 'Brasileiro(a)',
    outorganteEstadoCivil: '',
    outorganteProfissao: '',
    outorganteRG: '',
    outorganteCPF: '',
    outorganteEndereco: '',
    outorgadoNome: '',
    outorgadoNacionalidade: 'Brasileiro(a)',
    outorgadoEstadoCivil: '',
    outorgadoProfissao: '',
    outorgadoRG: '',
    outorgadoCPF: '',
    outorgadoEndereco: '',
    poderes: [],
    poderesOutros: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    cidade: '',
    validade: '',
    ...formData
  });

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange?.(newData);
  };

  const handlePoderesToggle = (poderKey) => {
    const currentPoderes = localData.poderes || [];
    const newPoderes = currentPoderes.includes(poderKey)
      ? currentPoderes.filter(p => p !== poderKey)
      : [...currentPoderes, poderKey];
    
    handleChange('poderes', newPoderes);
  };

  const handleDocumentoChange = (field, value) => {
    let val = value.replace(/\D/g, '');
    if (val.length <= 9) {
      val = val.replace(/(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
    } else {
      val = val.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    handleChange(field, val);
  };

  const estadoCivilOptions = [
    'Solteiro(a)',
    'Casado(a)',
    'Divorciado(a)',
    'Viúvo(a)',
    'Separado(a)',
    'União Estável'
  ];

  const poderesOptions = [
    { key: 'receita_federal', label: 'Representar perante a Receita Federal' },
    { key: 'assinaturas', label: 'Assinar declarações e obrigações fiscais' },
    { key: 'protocolar', label: 'Protocolizar documentos' },
    { key: 'certidoes', label: 'Solicitar certidões' },
    { key: 'bancos', label: 'Representar perante instituições bancárias' },
    { key: 'orgaos_publicos', label: 'Representar perante órgãos públicos em geral' }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '20px', color: '#333' }}>📜 Procuração</h3>
      
      <div style={{ display: 'grid', gap: '15px' }}>
        {/* Dados do Outorgante */}
        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h4 style={{ marginBottom: '15px', color: '#666' }}>Dados do Outorgante (Cliente)</h4>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Nome Completo *
            </label>
            <input
              type="text"
              value={localData.outorganteNome}
              onChange={(e) => handleChange('outorganteNome', e.target.value)}
              placeholder="Nome completo"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Nacionalidade
              </label>
              <input
                type="text"
                value={localData.outorganteNacionalidade}
                onChange={(e) => handleChange('outorganteNacionalidade', e.target.value)}
                placeholder="Brasileiro(a)"
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Estado Civil
              </label>
              <select
                value={localData.outorganteEstadoCivil}
                onChange={(e) => handleChange('outorganteEstadoCivil', e.target.value)}
                style={inputStyle}
              >
                <option value="">Selecione...</option>
                {estadoCivilOptions.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Profissão
              </label>
              <input
                type="text"
                value={localData.outorganteProfissao}
                onChange={(e) => handleChange('outorganteProfissao', e.target.value)}
                placeholder="Profissão"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                RG *
              </label>
              <input
                type="text"
                value={localData.outorganteRG}
                onChange={(e) => handleChange('outorganteRG', e.target.value)}
                placeholder="00.000.000"
                maxLength={12}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                CPF *
              </label>
              <input
                type="text"
                value={localData.outorganteCPF}
                onChange={(e) => handleDocumentoChange('outorganteCPF', e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Endereço Completo *
            </label>
            <input
              type="text"
              value={localData.outorganteEndereco}
              onChange={(e) => handleChange('outorganteEndereco', e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Dados do Outorgado */}
        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h4 style={{ marginBottom: '15px', color: '#666' }}>Dados do Outorgado (Procurador)</h4>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Nome Completo *
            </label>
            <input
              type="text"
              value={localData.outorgadoNome}
              onChange={(e) => handleChange('outorgadoNome', e.target.value)}
              placeholder="Nome completo"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Nacionalidade
              </label>
              <input
                type="text"
                value={localData.outorgadoNacionalidade}
                onChange={(e) => handleChange('outorgadoNacionalidade', e.target.value)}
                placeholder="Brasileiro(a)"
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Estado Civil
              </label>
              <select
                value={localData.outorgadoEstadoCivil}
                onChange={(e) => handleChange('outorgadoEstadoCivil', e.target.value)}
                style={inputStyle}
              >
                <option value="">Selecione...</option>
                {estadoCivilOptions.map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Profissão
              </label>
              <input
                type="text"
                value={localData.outorgadoProfissao}
                onChange={(e) => handleChange('outorgadoProfissao', e.target.value)}
                placeholder="Profissão"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                RG *
              </label>
              <input
                type="text"
                value={localData.outorgadoRG}
                onChange={(e) => handleChange('outorgadoRG', e.target.value)}
                placeholder="00.000.000"
                maxLength={12}
                style={inputStyle}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                CPF *
              </label>
              <input
                type="text"
                value={localData.outorgadoCPF}
                onChange={(e) => handleDocumentoChange('outorgadoCPF', e.target.value)}
                placeholder="000.000.000-00"
                maxLength={14}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Endereço Completo *
            </label>
            <input
              type="text"
              value={localData.outorgadoEndereco}
              onChange={(e) => handleChange('outorgadoEndereco', e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Poderes */}
        <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h4 style={{ marginBottom: '15px', color: '#666' }}>Poderes Concedidos</h4>
          
          <div style={{ display: 'grid', gap: '10px' }}>
            {poderesOptions.map((poder) => (
              <label key={poder.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={(localData.poderes || []).includes(poder.key)}
                  onChange={() => handlePoderesToggle(poder.key)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>{poder.label}</span>
              </label>
            ))}
            
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                Outros Poderes (Especificar)
              </label>
              <textarea
                value={localData.poderesOutros}
                onChange={(e) => handleChange('poderesOutros', e.target.value)}
                placeholder="Descreva outros poderes concedidos..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>
        </div>

        {/* Dados da Emissão */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
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
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Validade (Opcional)
            </label>
            <input
              type="text"
              value={localData.validade}
              onChange={(e) => handleChange('validade', e.target.value)}
              placeholder="Ex: 1 ano, indeterminado"
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

export default ProcuracaoForm;
