import { useState, useEffect } from 'react';
import { 
  TextInput, 
  NumberInput, 
  Stack, 
  Group, 
  Title, 
  SimpleGrid, 
  Divider,
  Text,
  Paper,
  Select
} from '@mantine/core';
import { IconCalendar, IconUser, IconBuilding, IconHash, IconCoin, IconFileDescription } from '@tabler/icons-react';
import { documentosGeradosAPI } from '../../../services/documentosAPI';

/**
 * Formulário para preenchimento do Recibo de Honorários
 */
const ReciboForm = ({ formData = {}, onChange }) => {
  const [localData, setLocalData] = useState({
    numero: '',
    tipoRecibo: 'mensal', // mensal | avulso
    valor: '',
    clienteNome: '',
    clienteDocumento: '',
    referencia: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    contadorNome: 'Ricardo Franco', 
    contadorCRC: 'BA-000000/O',
    empresaNome: 'HubContabil Assessoria',
    empresaCNPJ: '00.000.000/0001-00',
    cidade: 'Salvador',
    ...formData
  });

  // Sincronizar dados externos
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      setLocalData(prev => ({ ...prev, ...formData }));
    }
  }, [formData]);

  // Gerar número automático ao mudar tipo ou carregar sem número
  useEffect(() => {
    if (!localData.numero || localData.numero.length < 5) {
      handleGenerateId();
    }
  }, []);

  const handleGenerateId = async (currentType = localData.tipoRecibo) => {
    try {
      const resp = await documentosGeradosAPI.obterProximoNumero('recibo');
      const sequence = String(resp.proximo || 1).padStart(4, '0');
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const suffix = currentType === 'mensal' ? 'M' : 'A';
      const newId = `REC${dateStr}${sequence}${suffix}`;
      
      handleChange('numero', newId);
    } catch (error) {
      console.error('Erro ao gerar ID:', error);
    }
  };

  const handleChange = (field, value) => {
    const newData = { ...localData, [field]: value };
    setLocalData(newData);
    onChange?.(newData);
  };

  return (
    <Stack gap="md">
      <Title order={5} c="blue.7">💰 Dados do Recibo</Title>
      
      <SimpleGrid cols={2} spacing="md">
        <Select
          label="Tipo de Recibo"
          data={[
            { value: 'mensal', label: 'Honorário Mensal (M)' },
            { value: 'avulso', label: 'Serviço Avulso (A)' }
          ]}
          value={localData.tipoRecibo}
          onChange={(val) => {
            handleChange('tipoRecibo', val);
            handleGenerateId(val);
          }}
          leftSection={<IconFileDescription size={16} />}
        />

        <TextInput
          label="Número do Recibo"
          placeholder="Gerado automaticamente"
          value={localData.numero}
          onChange={(e) => handleChange('numero', e.target.value)}
          leftSection={<IconHash size={16} />}
          readOnly
          styles={{ input: { backgroundColor: 'var(--mantine-color-gray-0)', fontWeight: 700 } }}
        />
      </SimpleGrid>

      <SimpleGrid cols={1} spacing="md">
        <NumberInput
          label="Valor do Recibo (R$)"
          placeholder="0,00"
          decimalScale={2}
          fixedDecimalScale
          prefix="R$ "
          value={localData.valor}
          onChange={(val) => handleChange('valor', val)}
          required
          size="md"
          leftSection={<IconCoin size={16} />}
        />
      </SimpleGrid>

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
        placeholder="00.000.000/0000-00"
        leftSection={<IconHash size={16} />}
        value={localData.clienteDocumento}
        onChange={(e) => handleChange('clienteDocumento', e.target.value)}
        required
      />

      <SimpleGrid cols={2} spacing="md">
        <TextInput
          label="Referência"
          placeholder="Ex: Janeiro/2026"
          leftSection={<IconCalendar size={16} />}
          value={localData.referencia}
          onChange={(e) => handleChange('referencia', e.target.value)}
          required
        />
        
        <TextInput
          label="Data de Emissão"
          type="date"
          value={localData.dataEmissao}
          onChange={(e) => handleChange('dataEmissao', e.target.value)}
          required
        />
      </SimpleGrid>

      <Divider label="Informações do Emissor" labelPosition="center" my="sm" />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput
          label="Nome do Contador"
          value={localData.contadorNome}
          onChange={(e) => handleChange('contadorNome', e.target.value)}
        />
        <TextInput
          label="CRC"
          value={localData.contadorCRC}
          onChange={(e) => handleChange('contadorCRC', e.target.value.toUpperCase())}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <TextInput
          label="Nome do Escritório"
          leftSection={<IconBuilding size={16} />}
          value={localData.empresaNome}
          onChange={(e) => handleChange('empresaNome', e.target.value)}
        />
        <TextInput
          label="CNPJ do Escritório"
          value={localData.empresaCNPJ}
          onChange={(e) => handleChange('empresaCNPJ', e.target.value)}
        />
      </SimpleGrid>

      <TextInput
        label="Cidade"
        value={localData.cidade}
        onChange={(e) => handleChange('cidade', e.target.value)}
      />
    </Stack>
  );
};

export default ReciboForm;
