import { useState, useEffect } from 'react';
import { 
  TextInput, 
  Select, 
  Stack, 
  Group, 
  Title, 
  SimpleGrid, 
  Divider,
  Checkbox,
  Textarea,
  Paper,
  Box
} from '@mantine/core';
import { IconUser, IconHome, IconBuilding, IconGavel, IconCalendar } from '@tabler/icons-react';

/**
 * Formulário para preenchimento da Procuração
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
    outorgadoNome: 'Ricardo Franco',
    outorgadoNacionalidade: 'Brasileiro(a)',
    outorgadoEstadoCivil: 'Casado(a)',
    outorgadoProfissao: 'Contador',
    outorgadoRG: '00.000.000-0',
    outorgadoCPF: '000.000.000-00',
    outorgadoEndereco: 'Rua das Flores, 123, Salvador - BA',
    poderes: [],
    poderesOutros: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    cidade: 'Salvador',
    validade: '',
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

  const estadoCivilOptions = [
    { value: 'Solteiro(a)', label: 'Solteiro(a)' },
    { value: 'Casado(a)', label: 'Casado(a)' },
    { value: 'Divorciado(a)', label: 'Divorciado(a)' },
    { value: 'Viúvo(a)', label: 'Viúvo(a)' },
    { value: 'União Estável', label: 'União Estável' }
  ];

  const poderesOptions = [
    { value: 'receita_federal', label: 'Representar perante a Receita Federal' },
    { value: 'assinaturas', label: 'Assinar declarações e obrigações fiscais' },
    { value: 'protocolar', label: 'Protocolizar documentos' },
    { value: 'certidoes', label: 'Solicitar certidões' },
    { value: 'bancos', label: 'Representar perante instituições bancárias' },
    { value: 'orgaos_publicos', label: 'Representar perante órgãos públicos' }
  ];

  return (
    <Stack gap="lg">
      {/* Outorgante */}
      <Box>
        <Title order={5} c="blue.7" mb="sm">👤 Dados do Outorgante (Cliente)</Title>
        <Stack gap="sm">
          <TextInput
            label="Nome Completo"
            placeholder="Nome do cliente ou representante"
            leftSection={<IconUser size={16} />}
            value={localData.outorganteNome}
            onChange={(e) => handleChange('outorganteNome', e.target.value)}
            required
          />
          <SimpleGrid cols={3} spacing="sm">
            <TextInput
              label="Nacionalidade"
              value={localData.outorganteNacionalidade}
              onChange={(e) => handleChange('outorganteNacionalidade', e.target.value)}
            />
            <Select
              label="Estado Civil"
              data={estadoCivilOptions}
              value={localData.outorganteEstadoCivil}
              onChange={(val) => handleChange('outorganteEstadoCivil', val)}
            />
            <TextInput
              label="Profissão"
              value={localData.outorganteProfissao}
              onChange={(e) => handleChange('outorganteProfissao', e.target.value)}
            />
          </SimpleGrid>
          <SimpleGrid cols={2} spacing="sm">
            <TextInput
              label="RG"
              value={localData.outorganteRG}
              onChange={(e) => handleChange('outorganteRG', e.target.value)}
            />
            <TextInput
              label="CPF"
              value={localData.outorganteCPF}
              onChange={(e) => handleChange('outorganteCPF', e.target.value)}
            />
          </SimpleGrid>
          <TextInput
            label="Endereço Completo"
            placeholder="Rua, nº, Bairro, Cidade - UF"
            leftSection={<IconHome size={16} />}
            value={localData.outorganteEndereco}
            onChange={(e) => handleChange('outorganteEndereco', e.target.value)}
          />
        </Stack>
      </Box>

      <Divider />

      {/* Outorgado */}
      <Box>
        <Title order={5} c="blue.7" mb="sm">⚖️ Dados do Outorgado (Procurador)</Title>
        <Stack gap="sm">
          <TextInput
            label="Nome do Procurador"
            value={localData.outorgadoNome}
            onChange={(e) => handleChange('outorgadoNome', e.target.value)}
          />
          <SimpleGrid cols={2} spacing="sm">
            <TextInput
              label="CPF"
              value={localData.outorgadoCPF}
              onChange={(e) => handleChange('outorgadoCPF', e.target.value)}
            />
            <TextInput
              label="Endereço do Procurador"
              value={localData.outorgadoEndereco}
              onChange={(e) => handleChange('outorgadoEndereco', e.target.value)}
            />
          </SimpleGrid>
        </Stack>
      </Box>

      <Divider />

      {/* Poderes */}
      <Box>
        <Title order={5} c="blue.7" mb="sm">📜 Poderes Concedidos</Title>
        <Checkbox.Group
          value={localData.poderes}
          onChange={(vals) => handleChange('poderes', vals)}
        >
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
            {poderesOptions.map((op) => (
              <Checkbox key={op.value} value={op.value} label={op.label} />
            ))}
          </SimpleGrid>
        </Checkbox.Group>
        <Textarea
          label="Outros Poderes (Especificar)"
          placeholder="Descreva poderes adicionais..."
          mt="md"
          value={localData.poderesOutros}
          onChange={(e) => handleChange('poderesOutros', e.target.value)}
          rows={3}
        />
      </Box>

      <Divider />

      {/* Emissão */}
      <Box>
        <Title order={5} c="blue.7" mb="sm">📅 Dados da Emissão</Title>
        <SimpleGrid cols={3} spacing="sm">
          <TextInput
            label="Cidade"
            value={localData.cidade}
            onChange={(e) => handleChange('cidade', e.target.value)}
          />
          <TextInput
            label="Data"
            type="date"
            leftSection={<IconCalendar size={16} />}
            value={localData.dataEmissao}
            onChange={(e) => handleChange('dataEmissao', e.target.value)}
          />
          <TextInput
            label="Validade"
            placeholder="Ex: 1 ano"
            value={localData.validade}
            onChange={(e) => handleChange('validade', e.target.value)}
          />
        </SimpleGrid>
      </Box>
    </Stack>
  );
};

export default ProcuracaoForm;
