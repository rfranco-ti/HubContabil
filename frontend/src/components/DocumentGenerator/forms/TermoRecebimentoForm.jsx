import { useState, useEffect } from 'react';
import { 
  TextInput, 
  Stack, 
  Group, 
  Title, 
  SimpleGrid, 
  Divider,
  Checkbox,
  Box,
  Text
} from '@mantine/core';
import { IconUser, IconBuilding, IconFileCheck, IconCalendar } from '@tabler/icons-react';

/**
 * Formulário para preenchimento do Termo de Recebimento de Documentos
 */
const TermoRecebimentoForm = ({ formData = {}, onChange }) => {
  const [localData, setLocalData] = useState({
    clienteNome: '',
    clienteDocumento: '',
    empresaNome: 'HubContabil Assessoria',
    finalidade: 'processamento contábil',
    documentos: [],
    dataRecebimento: new Date().toISOString().split('T')[0],
    responsavelNome: 'Ricardo Franco',
    responsavelCargo: 'Contador',
    ...formData
  });

  // Sincronizar dados externos
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      setLocalData(prev => ({ ...prev, ...formData }));
    }
  }, [formData]);

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
      // Armazena o texto dos outros documentos em um campo separado
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

  const documentoOptions = [
    { value: 'ctps', label: 'Carteira de Trabalho (CTPS)' },
    { value: 'rg', label: 'RG' },
    { value: 'cpf', label: 'CPF' },
    { value: 'cnh', label: 'CNH' },
    { value: 'certidao_nascimento', label: 'Certidão de Nascimento/Casamento' },
    { value: 'comprovante_residencia', label: 'Comprovante de Residência' },
    { value: 'holerites', label: 'Holerites/Contracheques' },
    { value: 'extratos_bancarios', label: 'Extratos Bancários' },
    { value: 'declaracao_ir', label: 'Declaração de IR' }
  ];

  return (
    <Stack gap="md">
      <Title order={5} c="blue.7">📥 Termo de Recebimento</Title>
      
      <TextInput
        label="Nome do Cliente"
        placeholder="Nome completo ou Razão Social"
        leftSection={<IconUser size={16} />}
        value={localData.clienteNome}
        onChange={(e) => handleChange('clienteNome', e.target.value)}
        required
      />

      <TextInput
        label="CPF/CNPJ do Cliente"
        value={localData.clienteDocumento}
        onChange={(e) => handleChange('clienteDocumento', e.target.value)}
        required
      />

      <TextInput
        label="Nome do Escritório"
        leftSection={<IconBuilding size={16} />}
        value={localData.empresaNome}
        onChange={(e) => handleChange('empresaNome', e.target.value)}
      />

      <TextInput
        label="Finalidade"
        placeholder="Ex: processamento contábil"
        value={localData.finalidade}
        onChange={(e) => handleChange('finalidade', e.target.value)}
      />

      <Divider label="Documentos Entregues" labelPosition="center" my="sm" />

      <Checkbox.Group
        label="Selecione os documentos recebidos"
        value={localData.documentos}
        onChange={(vals) => handleChange('documentos', vals)}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
          {documentoOptions.map((op) => (
            <Checkbox key={op.value} value={op.value} label={op.label} />
          ))}
        </SimpleGrid>
      </Checkbox.Group>

      <Divider />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput
          label="Data do Recebimento"
          type="date"
          leftSection={<IconCalendar size={16} />}
          value={localData.dataRecebimento}
          onChange={(e) => handleChange('dataRecebimento', e.target.value)}
        />
        <TextInput
          label="Responsável"
          value={localData.responsavelNome}
          onChange={(e) => handleChange('responsavelNome', e.target.value)}
        />
      </SimpleGrid>

      <TextInput
        label="Cargo do Responsável"
        value={localData.responsavelCargo}
        onChange={(e) => handleChange('responsavelCargo', e.target.value)}
      />
    </Stack>
  );
};

export default TermoRecebimentoForm;
