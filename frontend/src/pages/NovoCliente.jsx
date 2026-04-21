import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Building2, MapPin, User, Phone, Mail, Edit2, Plus, Trash2, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import { clientesAPI } from '../services/api';
import { formatCnpj, formatPhoneDisplay, formatCep, formatCpf, formatPhoneByType, unformatPhone, formatCurrencyInput, unformatCurrency } from '../utils/masks';
import { mapCnpjDataToForm, mapCnpjDataToEditableFields } from '../utils/cnpjMapper';
import { 
  Button, 
  Card, 
  TextInput, 
  Select, 
  Textarea, 
  Group, 
  ActionIcon, 
  Text, 
  Title, 
  Box, 
  ThemeIcon,
  SimpleGrid,
  Loader,
  Badge,
  Center,
  Paper,
  Stack,
  Divider,
  Grid
} from "@mantine/core";

export default function NovoCliente() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);
  const [lastApiUsed, setLastApiUsed] = useState(null); // 'open_cnpja', 'invertexto', 'cache'
  const [fetchingInscricaoEstadual, setFetchingInscricaoEstadual] = useState(false);
  const [fetchingInscricaoMunicipal, setFetchingInscricaoMunicipal] = useState(false);
  const [formData, setFormData] = useState({
    cnpj: '',
    razao_social: '',
    nome_fantasia: '',
    data_abertura: '',
    natureza_juridica: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    situacao_sefaz_estadual: '',
    situacao_sefaz_municipal: '',
    regime_tributario: 'Não Enquadrado',
    is_mei: false,
    cnae_principal: { codigo: '', descricao: '' },
    cnaes_secundarios: [],
    qsa: [],
    contatos: [], // Múltiplos contatos: [{nome, email, telefone}]
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: ''
    },
    contato_principal: {
      nome: '',
      email: '',
      telefone: ''
    },
    status: 'Ativo',
    categoria: 'Serviços',
    is_bpo: false,
    honorarios: { valor: 0, dia_vencimento: 10 },
    servicos_prestados: '',
    tem_contabil: false,
    tem_fiscal: false,
    tem_dp: false,
    observacoes: ''
  });

  // Carregar dados preenchidos se vier da Pesquisa de Empresas ou Detalhes
  useEffect(() => {
    if (location.state?.rawData) {
      const data = location.state.rawData;
      const newFormData = mapCnpjDataToForm(data, formData);
      const newEditableFields = mapCnpjDataToEditableFields(data, editableFields);
      
      setFormData(newFormData);
      setEditableFields(newEditableFields);
      setLastApiUsed(data.apiUsed);
      
      toast.info('📋 Dados carregados da pesquisa. Revise e complete as informações!');
    } else if (location.state?.dadosPreenchidos) {
      // Legado para compatibilidade
      const dados = location.state.dadosPreenchidos;
      setFormData(prev => ({
        ...prev,
        ...dados,
        cnpj: formatCnpj(dados.cnpj)
      }));
      toast.info('📋 Dados carregados. Revise e complete as informações!');
    }
  }, [location.state]);

  // Campos editáveis (que vieram em branco da API)
  const [editableFields, setEditableFields] = useState({
    razao_social: false,
    nome_fantasia: false,
    data_abertura: false,
    natureza_juridica: false,
    inscricao_estadual: false,
    inscricao_municipal: false,
    cep: false,
    logradouro: false,
    numero: false,
    complemento: false,
    bairro: false,
    cidade: false,
    uf: false,
    email: false,
    telefone: false,
    cnae_codigo: false,
    cnae_descricao: false
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'cnpj') setLastApiUsed(null);
  };

  // Busca automática ao completar 14 dígitos do CNPJ
  useEffect(() => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length === 14 && !loading && !fetchingCnpj && lastApiUsed === null) {
      handleCnpjBlur();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.cnpj]);

  const handleEnderecoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value }
    }));
  };

  const handleCnaeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      cnae_principal: { ...prev.cnae_principal, [field]: value }
    }));
  };

  const toggleEditable = (field) => {
    setEditableFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCnpjBlur = async () => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return;

    setFetchingCnpj(true);
    try {
      // Usar API do backend (com fallback automático)
      const response = await fetch(`/api/clientes/consulta/${cleanCnpj}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        setFetchingCnpj(false);
        return;
      }
      
      const result = await response.json();

      if (result.success && result.data && (result.data.cnpj || result.data.razaoSocial)) {
        const cnpjData = result.data;
        // Usar mapper extraído e testável
        const newFormData = mapCnpjDataToForm(cnpjData, formData);
        const newEditableFields = mapCnpjDataToEditableFields(cnpjData, editableFields);

        setFormData(newFormData);
        setEditableFields(newEditableFields);
        
        // Salvar qual API foi usada
        setLastApiUsed(cnpjData.apiUsed);
      }
    } catch (err) {
      console.error('Erro ao buscar CNPJ:', err);
    } finally {
      setFetchingCnpj(false);
    }
  };

  // Adicionar CNAE secundário manualmente
  const handleAddCnaeSecundario = () => {
    setFormData(prev => ({
      ...prev,
      cnaes_secundarios: [...prev.cnaes_secundarios, { codigo: '', descricao: '' }]
    }));
  };

  // Buscar Inscrição Estadual via RPA SEFAZ BA
  const handleFetchInscricaoEstadual = async () => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    const uf = formData.endereco.uf?.toUpperCase();
    
    if (cleanCnpj.length !== 14) {
      toast.warning('Por favor, preencha o CNPJ completo antes de buscar a Inscrição Estadual.');
      return;
    }
    
    if (uf !== 'BA') {
      toast.warning('A busca automática de Inscrição Estadual via SEFAZ está disponível apenas para empresas da Bahia (UF = BA).');
      return;
    }
    
    setFetchingInscricaoEstadual(true);
    
    try {
      // Chama o endpoint do backend que fará o scraping
      const response = await fetch('/api/rpa/sefaz-ba/inscricao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cnpj: cleanCnpj })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao buscar Inscrição Estadual');
      }
      
      const data = await response.json();
      
      // Atualiza os campos de Inscrição Estadual e Situação SEFAZ
      setFormData(prev => ({
        ...prev,
        inscricao_estadual: data.inscricaoEstadual || '',
        situacao_sefaz_estadual: data.situacaoCadastral || ''
      }));
      
      // Notificação de sucesso
      toast.success(`✅ Inscrição Estadual obtida com sucesso!\nInscrição: ${data.inscricaoEstadual}`);
      
    } catch (error) {
      console.error('Erro ao buscar Inscrição Estadual:', error);
      toast.error(`❌ Erro ao buscar Inscrição Estadual: ${error.message}\n\nPor favor, preencha manualmente.`);
    } finally {
      setFetchingInscricaoEstadual(false);
    }
  };

  // Buscar Inscrição Municipal (CGA) via RPA Salvador
  const handleFetchInscricaoMunicipal = async () => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    const cidade = formData.endereco.cidade?.toUpperCase();
    
    if (cleanCnpj.length !== 14) {
      toast.warning('Por favor, preencha o CNPJ completo antes de buscar a Inscrição Municipal.');
      return;
    }
    
    if (!cidade.includes('SALVADOR')) {
      toast.warning('A busca automática de Inscrição Municipal via SEFAZ Salvador está disponível apenas para empresas de Salvador.');
      return;
    }
    
    setFetchingInscricaoMunicipal(true);
    
    try {
      const response = await fetch('/api/rpa/salvador/inscricao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cnpj: cleanCnpj })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao buscar Inscrição Municipal');
      }
      
      const data = await response.json();
      
      setFormData(prev => ({
        ...prev,
        inscricao_municipal: data.inscricaoMunicipal || '',
        situacao_sefaz_municipal: data.situacaoMunicipal || ''
      }));
      
      toast.success(`✅ Inscrição Municipal obtida com sucesso!\nCGA: ${data.inscricaoMunicipal}`);
      
    } catch (error) {
      console.error('Erro ao buscar Inscrição Municipal:', error);
      toast.error(`❌ Erro ao buscar Inscrição Municipal: ${error.message}\n\nPor favor, preencha manualmente.`);
    } finally {
      setFetchingInscricaoMunicipal(false);
    }
  };

  const handleRemoveCnaeSecundario = (index) => {
    setFormData(prev => ({
      ...prev,
      cnaes_secundarios: prev.cnaes_secundarios.filter((_, i) => i !== index)
    }));
  };

  const handleCnaeSecundarioChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      cnaes_secundarios: prev.cnaes_secundarios.map((cnae, i) => 
        i === index ? { ...cnae, [field]: value } : cnae
      )
    }));
  };

  // Adicionar membro do QSA manualmente
  const handleAddQsa = () => {
    setFormData(prev => ({
      ...prev,
      qsa: [...prev.qsa, { nome: '', cpf_cnpj: '', qualificacao: '', participacao: 0 }]
    }));
  };

  const handleRemoveQsa = (index) => {
    setFormData(prev => ({
      ...prev,
      qsa: prev.qsa.filter((_, i) => i !== index)
    }));
  };

  const handleQsaChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      qsa: prev.qsa.map((membro, i) => 
        i === index ? { ...membro, [field]: field === 'participacao' ? parseFloat(value) || 0 : value } : membro
      )
    }));
  };

  // Funções para múltiplos contatos
  const handleAddContato = () => {
    setFormData(prev => ({
      ...prev,
      contatos: [...prev.contatos, { nome: '', email: '', telefone: '' }]
    }));
  };

  const handleRemoveContato = (index) => {
    setFormData(prev => ({
      ...prev,
      contatos: prev.contatos.filter((_, i) => i !== index)
    }));
  };

  const handleContatoChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      contatos: prev.contatos.map((contato, i) => 
        i === index ? { ...contato, [field]: field === 'telefone' ? unformatPhone(value) : value } : contato
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanCnpj = formData.cnpj.replace(/\D/g, '');
      
      // Preparar dados limpos para envio
      const dataToSave = {
        cnpj: cleanCnpj,
        razao_social: formData.razao_social,
        nome_fantasia: formData.nome_fantasia,
        data_abertura: formData.data_abertura || null,
        natureza_juridica: formData.natureza_juridica,
        inscricao_estadual: formData.inscricao_estadual,
        inscricao_municipal: formData.inscricao_municipal,
        regime_tributario: formData.regime_tributario,
        cnae_principal: {
          codigo: String(formData.cnae_principal.codigo || ''), // Converte para string
          descricao: formData.cnae_principal.descricao || ''
        },
        cnaes_secundarios: (formData.cnaes_secundarios || []).map(cnae => ({
          codigo: String(cnae.codigo || ''), // Converte para string
          descricao: cnae.descricao || ''
        })),
        endereco: formData.endereco,
        contato_principal: formData.contato_principal,
        contatos: formData.contatos, // Múltiplos contatos
        qsa: (formData.qsa || []).map(socio => ({
          nome: socio.nome || '',
          cpf_cnpj: socio.cpf_cnpj || '',
          qualificacao: socio.qualificacao || '',
          participacao: socio.participacao || 0
        })),
        categoria: formData.categoria,
        is_bpo: formData.is_bpo,
        observacoes: formData.observacoes,
        status: formData.status
      };

      console.log('📋 Enviando dados:', dataToSave);

      await clientesAPI.create(dataToSave);
      toast.success('✅ Cliente cadastrado com sucesso!');
      navigate('/clientes');
    } catch (err) {
      console.error('❌ Erro ao cadastrar:', err);
      console.error('Response:', err.response?.data);
      
      if (err.response?.status === 400 || err.response?.status === 409) {
        toast.warning('⚠️ Este CNPJ já está cadastrado no sistema!');
      } else {
        const errorMsg = err.response?.data?.error || err.message || 'Erro ao cadastrar cliente';
        toast.error(`❌ ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Componente de campo editável com Mantine
  const EditableField = ({ label, value, onChange, type = 'text', fieldKey, placeholder, maxLength, options, styles, minRows }) => {
    const isEditable = editableFields[fieldKey];
    const isEmpty = !value || value === '';

    const labelContent = (
      <Group gap="xs" mb={4}>
        <Text span size="sm" fw={700} c="slate.7">{label}</Text>
        {isEmpty && (
          <ActionIcon 
            variant="subtle" 
            size="xs" 
            color="blue"
            onClick={() => toggleEditable(fieldKey)}
            title={isEditable ? 'Preencher campo' : 'Editar campo'}
          >
            <Edit2 size={12} />
          </ActionIcon>
        )}
      </Group>
    );

    if (options) {
      return (
        <Select
          label={labelContent}
          data={options}
          value={value}
          onChange={(val) => onChange(val || '')}
          disabled={!isEditable && !isEmpty}
          placeholder={isEditable ? placeholder : ''}
          size="md"
          radius="md"
          styles={styles}
        />
      );
    }

    if (type === 'textarea') {
      return (
        <Textarea
          label={labelContent}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!isEditable && !isEmpty}
          placeholder={isEditable ? placeholder : ''}
          size="md"
          radius="md"
          minRows={minRows || 3}
          styles={styles}
        />
      );
    }

    return (
      <TextInput
        type={type === 'date' ? 'date' : 'text'}
        label={labelContent}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        disabled={!isEditable && !isEmpty}
        placeholder={isEditable ? placeholder : ''}
        size="md"
        radius="md"
        styles={styles}
      />
    );
  };

  return (
    <Box p="md" className="h-full overflow-y-auto min-h-screen">
      {/* Header */}
      <Group mb="lg">
        <Button 
          variant="subtle" 
          color="gray" 
          leftSection={<ArrowLeft size={18} />} 
          onClick={() => navigate('/clientes')}
        >
          Voltar para Clientes
        </Button>
      </Group>

      <form onSubmit={handleSubmit} style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <Stack gap="xl">
          {/* Dados Principais */}
          <Card padding="xl" radius="md" withBorder shadow="sm">
            <Group mb="xl">
              <ThemeIcon variant="light" size={56} radius="xl">
                <Building2 size={28} />
              </ThemeIcon>
              <div>
                <Title order={3} fw={900}>Novo Cliente</Title>
                <Text size="sm" c="dimmed">Preencha os dados da empresa para cadastrar no sistema.</Text>
              </div>
            </Group>

          <Grid gutter="md">
            <Grid.Col span={12}>
              <TextInput
                label="CNPJ *"
                value={formatCnpj(formData.cnpj)}
                onChange={(e) => handleChange('cnpj', e.target.value)}
                onBlur={handleCnpjBlur}
                placeholder="00.000.000/0000-00"
                required
                size="md"
                radius="md"
                styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                rightSection={
                  formData.cnpj.replace(/\D/g, '').length === 14 && (
                    <ActionIcon 
                      onClick={handleCnpjBlur}
                      loading={fetchingCnpj}
                      variant="subtle"
                      color="blue"
                    >
                      <Search size={18} />
                    </ActionIcon>
                  )
                }
                description={fetchingCnpj ? 'Buscando dados do CNPJ...' : 'Digite o CNPJ completo e clique na lupa para buscar os dados automaticamente.'}
              />
              {/* Indicador de API usada */}
              {lastApiUsed && formData.cnpj.replace(/\D/g, '').length === 14 && (
                <Badge size="xs" color="gray" variant="light" mt={5}>
                  {lastApiUsed === 'open_cnpja' && '🟢 open.cnpja.com'}
                  {lastApiUsed === 'invertexto' && '🔵 invertexto.com'}
                  {lastApiUsed === 'cache' && '⚡ Cache'}
                </Badge>
              )}
            </Grid.Col>

            <Grid.Col span={12}>
              <EditableField
                label="Razão Social *"
                value={formData.razao_social}
                onChange={(v) => handleChange('razao_social', v)}
                fieldKey="razao_social"
                placeholder="Ex: Empresa Exemplo LTDA"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <EditableField
                label="Nome Fantasia"
                value={formData.nome_fantasia}
                onChange={(v) => handleChange('nome_fantasia', v)}
                fieldKey="nome_fantasia"
                placeholder="Ex: Empresa Exemplo"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <EditableField
                label="Data de Abertura"
                value={formData.data_abertura}
                onChange={(v) => handleChange('data_abertura', v)}
                type="date"
                fieldKey="data_abertura"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <EditableField
                label="Natureza Jurídica"
                value={formData.natureza_juridica}
                onChange={(v) => handleChange('natureza_juridica', v)}
                fieldKey="natureza_juridica"
                placeholder="Ex: Sociedade Empresária Limitada"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Select
                label="Regime Tributário"
                value={formData.regime_tributario}
                onChange={(v) => handleChange('regime_tributario', v)}
                data={[
                  { value: 'Simples Nacional', label: 'Simples Nacional' },
                  { value: 'Simples Nacional - MEI', label: 'Simples Nacional - MEI' },
                  { value: 'Lucro Presumido', label: 'Lucro Presumido' },
                  { value: 'Lucro Real', label: 'Lucro Real' },
                  { value: 'Não Enquadrado', label: 'Não Enquadrado' },
                  { value: 'Outro', label: 'Outro' }
                ]}
                size="md"
                radius="md"
                styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 2 }}>
              <Box pt={32}>
                <Paper withBorder radius="md" p="xs" bg={formData.is_mei ? "green.0" : "red.0"}>
                  <Group justify="space-between" wrap="nowrap">
                    <Text fw={700} size="sm">É MEI?</Text>
                    <Badge 
                      color={formData.is_mei ? "green" : "red"} 
                      variant="filled"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleChange('is_mei', !formData.is_mei)}
                    >
                      {formData.is_mei ? 'SIM' : 'NÃO'}
                    </Badge>
                  </Group>
                </Paper>
              </Box>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Inscrição Estadual"
                value={formData.inscricao_estadual}
                onChange={(e) => handleChange('inscricao_estadual', e.target.value.replace(/\D/g, ''))}
                placeholder="Apenas números"
                size="md"
                radius="md"
                styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                rightSection={
                  <ActionIcon 
                    onClick={handleFetchInscricaoEstadual}
                    loading={fetchingInscricaoEstadual}
                    disabled={formData.endereco.uf?.toUpperCase() !== 'BA'}
                    variant="subtle"
                    color="blue"
                  >
                    <Search size={18} />
                  </ActionIcon>
                }
                description={formData.endereco.uf?.toUpperCase() === 'BA' ? 'Clique na lupa para buscar automaticamente na SEFAZ BA' : 'Disponível apenas para empresas da Bahia'}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Inscrição Municipal"
                value={formData.inscricao_municipal}
                onChange={(e) => handleChange('inscricao_municipal', e.target.value.replace(/\D/g, ''))}
                placeholder="Apenas números"
                size="md"
                radius="md"
                styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                rightSection={
                  <ActionIcon 
                    onClick={handleFetchInscricaoMunicipal}
                    loading={fetchingInscricaoMunicipal}
                    disabled={!formData.endereco.cidade?.toUpperCase().includes('SALVADOR')}
                    variant="subtle"
                    color="blue"
                  >
                    <Search size={18} />
                  </ActionIcon>
                }
                description={formData.endereco.cidade?.toUpperCase().includes('SALVADOR') ? 'Clique na lupa para buscar automaticamente na SEFAZ Salvador' : 'Disponível apenas para empresas de Salvador'}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Situação SEFAZ Estadual"
                value={formData.situacao_sefaz_estadual}
                onChange={(e) => handleChange('situacao_sefaz_estadual', e.target.value)}
                placeholder="ATIVO, INATIVO, etc."
                disabled={fetchingInscricaoEstadual}
                size="md"
                radius="md"
                styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                description="Preenchido automaticamente ao buscar na SEFAZ Estadual ou editável manualmente"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Situação SEFAZ Municipal"
                value={formData.situacao_sefaz_municipal}
                onChange={(e) => handleChange('situacao_sefaz_municipal', e.target.value)}
                placeholder="ATIVO, INATIVO, etc."
                disabled={fetchingInscricaoMunicipal}
                size="md"
                radius="md"
                styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                description="Preenchido automaticamente ao buscar na Prefeitura ou editável manualmente"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Status Receita Federal"
                value={formData.status}
                onChange={(v) => handleChange('status', v)}
                data={[
                  { value: 'Ativo', label: 'Ativo' },
                  { value: 'Inativo', label: 'Inativo' },
                  { value: 'Bloqueado', label: 'Bloqueado' }
                ]}
                size="md"
                radius="md"
                styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Categoria"
                value={formData.categoria}
                onChange={(e) => handleChange('categoria', e.target.value)}
                placeholder="Ex: Serviços, Comércio..."
                size="md"
                radius="md"
                styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Endereço */}
        <Card padding="xl" radius="md" withBorder shadow="sm">
          <Group mb="xl">
            <ThemeIcon variant="light" size={56} radius="xl" color="orange">
              <MapPin size={28} />
            </ThemeIcon>
            <div>
              <Title order={4} fw={900}>Endereço</Title>
              <Text size="sm" c="dimmed">Localização da sede da empresa.</Text>
            </div>
          </Group>

          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 4 }}>
              <EditableField
                label="CEP"
                value={formatCep(formData.endereco.cep)}
                onChange={(v) => handleEnderecoChange('cep', v)}
                fieldKey="cep"
                placeholder="00000-000"
                maxLength={9}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <EditableField
                label="Logradouro"
                value={formData.endereco.logradouro}
                onChange={(v) => handleEnderecoChange('logradouro', v)}
                fieldKey="logradouro"
                placeholder="Rua, Avenida, etc."
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 3 }}>
              <EditableField
                label="Número"
                value={formData.endereco.numero}
                onChange={(v) => handleEnderecoChange('numero', v)}
                fieldKey="numero"
                placeholder="123"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 9 }}>
              <EditableField
                label="Complemento"
                value={formData.endereco.complemento}
                onChange={(v) => handleEnderecoChange('complemento', v)}
                fieldKey="complemento"
                placeholder="Sala, Andar, etc."
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <EditableField
                label="Bairro"
                value={formData.endereco.bairro}
                onChange={(v) => handleEnderecoChange('bairro', v)}
                fieldKey="bairro"
                placeholder="Nome do bairro"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <EditableField
                label="Cidade"
                value={formData.endereco.cidade}
                onChange={(v) => handleEnderecoChange('cidade', v)}
                fieldKey="cidade"
                placeholder="Salvador"
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 2 }}>
              <EditableField
                label="UF"
                value={formData.endereco.uf}
                onChange={(v) => handleEnderecoChange('uf', v.toUpperCase())}
                fieldKey="uf"
                placeholder="BA"
                maxLength={2}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* Contatos */}
        <Card padding="xl" radius="md" withBorder shadow="sm">
          <Group justify="space-between" mb="xl">
            <Group>
              <ThemeIcon variant="light" size={56} radius="xl" color="green">
                <Mail size={28} />
              </ThemeIcon>
              <div>
                <Title order={4} fw={900}>Contatos</Title>
                <Text size="sm" c="dimmed">Informações de contato e responsáveis.</Text>
              </div>
            </Group>
            <Button
              variant="light"
              color="green"
              leftSection={<Plus size={18} />}
              onClick={handleAddContato}
            >
              Adicionar Contato
            </Button>
          </Group>

          <Stack gap="md">
            {/* Primeiro contato - preenchido automaticamente pela API */}
            <Paper withBorder p="md" radius="md" bg="gray.0" className="dark:bg-slate-800">
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <TextInput
                  label="Nome do Cliente"
                  value={formData.contato_principal.nome || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contato_principal: { ...prev.contato_principal, nome: e.target.value } }))}
                  placeholder="Nome do cliente"
                  size="sm"
                  radius="md"
                  styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                />
                <TextInput
                  label="E-mail"
                  type="email"
                  value={formData.contato_principal.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contato_principal: { ...prev.contato_principal, email: e.target.value } }))}
                  placeholder="contato@empresa.com"
                  size="sm"
                  radius="md"
                  styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                />
                <TextInput
                  label="Telefone"
                  value={formatPhoneDisplay(formData.contato_principal.telefone, 'mobile')}
                  onChange={(e) => setFormData(prev => ({ ...prev, contato_principal: { ...prev.contato_principal, telefone: unformatPhone(e.target.value) } }))}
                  placeholder="(71) 9 99999-9999"
                  maxLength={16}
                  size="sm"
                  radius="md"
                  styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                />
              </SimpleGrid>
            </Paper>

            {/* Contatos adicionais */}
            {formData.contatos.map((contato, index) => (
              <Paper key={index} withBorder p="md" radius="md" bg="gray.0" className="dark:bg-slate-800" pos="relative">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => handleRemoveContato(index)}
                  pos="absolute"
                  top={10}
                  right={10}
                  style={{ zIndex: 10 }}
                >
                  <Trash2 size={18} />
                </ActionIcon>

                <Grid gutter="md" align="flex-end">
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                      label="Nome do Contato"
                      value={contato.nome}
                      onChange={(e) => handleContatoChange(index, 'nome', e.target.value)}
                      placeholder="Nome da pessoa para contato"
                      size="sm"
                      radius="md"
                      styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                      label="E-mail"
                      type="email"
                      value={contato.email}
                      onChange={(e) => handleContatoChange(index, 'email', e.target.value)}
                      placeholder="contato@empresa.com"
                      size="sm"
                      radius="md"
                      styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                    />
                  </Grid.Col>
                  <Grid.Col span={{ base: 12, md: 4 }}>
                    <TextInput
                      label="Telefone"
                      value={formatPhoneDisplay(contato.telefone, 'mobile')}
                      onChange={(e) => handleContatoChange(index, 'telefone', e.target.value)}
                      placeholder="(71) 9 99999-9999"
                      maxLength={16}
                      size="sm"
                      radius="md"
                      styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                    />
                  </Grid.Col>
                </Grid>
              </Paper>
            ))}
          </Stack>
        </Card>

        {/* CNAE Principal */}
        <Card padding="xl" radius="md" withBorder shadow="sm">
          <Group mb="xl">
            <ThemeIcon variant="light" size={56} radius="xl" color="cyan">
              <Building2 size={28} />
            </ThemeIcon>
            <div>
              <Title order={4} fw={900}>CNAE Principal</Title>
              <Text size="sm" c="dimmed">Classificação da atividade econômica principal.</Text>
            </div>
          </Group>

          <Grid gutter="md" align="flex-start">
            <Grid.Col span={{ base: 12, md: 2 }}>
              <EditableField
                label="Código CNAE"
                value={formData.cnae_principal.codigo}
                onChange={(v) => handleCnaeChange('codigo', v)}
                fieldKey="cnae_codigo"
                placeholder="0000-0/00"
                styles={{ input: { height: '62px' } }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 10 }}>
              <EditableField
                label="Descrição"
                value={formData.cnae_principal.descricao}
                onChange={(v) => handleCnaeChange('descricao', v)}
                fieldKey="cnae_descricao"
                placeholder="Descrição da atividade principal"
                type="textarea"
                minRows={2}
              />
            </Grid.Col>
          </Grid>
        </Card>

        {/* CNAEs Secundários */}
        <Card padding="xl" radius="md" withBorder shadow="sm">
          <Group justify="space-between" mb="xl">
            <Group>
              <ThemeIcon variant="light" size={56} radius="xl" color="cyan">
                <Building2 size={28} />
              </ThemeIcon>
              <div>
                <Title order={4} fw={900}>CNAEs Secundários</Title>
                <Text size="sm" c="dimmed">Atividades econômicas secundárias.</Text>
              </div>
            </Group>
            <Button
              variant="light"
              color="cyan"
              leftSection={<Plus size={18} />}
              onClick={handleAddCnaeSecundario}
            >
              Adicionar
            </Button>
          </Group>

          {formData.cnaes_secundarios.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="xl">Nenhum CNAE secundário cadastrado.</Text>
          ) : (
            <Stack gap="md">
              {formData.cnaes_secundarios.map((cnae, index) => (
                <Paper key={index} withBorder p="md" radius="md" bg="gray.0" className="dark:bg-slate-800" pos="relative">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleRemoveCnaeSecundario(index)}
                    pos="absolute"
                    top={10}
                    right={10}
                    style={{ zIndex: 10 }}
                  >
                    <Trash2 size={18} />
                  </ActionIcon>

                  <Grid gutter="md" align="flex-end">
                    <Grid.Col span={{ base: 12, md: 2 }}>
                      <TextInput
                        label="Código"
                        value={cnae.codigo}
                        onChange={(e) => handleCnaeSecundarioChange(index, 'codigo', e.target.value)}
                        placeholder="0000-0/00"
                        size="sm"
                        radius="md"
                        styles={{ 
                          label: { fontWeight: 700, marginBottom: 4 },
                          input: { height: '62px' }
                        }}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 10 }}>
                      <Textarea
                        label="Descrição"
                        value={cnae.descricao}
                        onChange={(e) => handleCnaeSecundarioChange(index, 'descricao', e.target.value)}
                        placeholder="Descrição da atividade"
                        size="sm"
                        radius="md"
                        autosize
                        minRows={2}
                        styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          )}
        </Card>

        {/* Quadro Societário (QSA) */}
        <Card padding="xl" radius="md" withBorder shadow="sm">
          <Group justify="space-between" mb="xl">
            <Group>
              <ThemeIcon variant="light" size={56} radius="xl" color="indigo">
                <Users size={28} />
              </ThemeIcon>
              <div>
                <Title order={4} fw={900}>Quadro Societário (QSA)</Title>
                <Text size="sm" c="dimmed">Sócios e administradores da empresa.</Text>
              </div>
            </Group>
            <Button
              variant="light"
              color="indigo"
              leftSection={<Plus size={18} />}
              onClick={handleAddQsa}
            >
              Adicionar Sócio
            </Button>
          </Group>

          {formData.qsa.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="xl">Nenhum sócio cadastrado.</Text>
          ) : (
            <Stack gap="md">
              {formData.qsa.map((membro, index) => (
                <Paper key={index} withBorder p="md" radius="md" bg="gray.0" className="dark:bg-slate-800" pos="relative">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleRemoveQsa(index)}
                    pos="absolute"
                    top={10}
                    right={10}
                    style={{ zIndex: 10 }}
                  >
                    <Trash2 size={18} />
                  </ActionIcon>

                  <Grid gutter="md" align="flex-end">
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="Nome"
                        value={membro.nome}
                        onChange={(e) => handleQsaChange(index, 'nome', e.target.value)}
                        placeholder="Nome do sócio"
                        size="sm"
                        radius="md"
                        styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 2 }}>
                      <TextInput
                        label="CPF/CNPJ"
                        value={formatCpf(membro.cpf_cnpj)}
                        onChange={(e) => handleQsaChange(index, 'cpf_cnpj', e.target.value)}
                        placeholder="000.000.000-00"
                        size="sm"
                        radius="md"
                        styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <TextInput
                        label="Qualificação"
                        value={membro.qualificacao}
                        onChange={(e) => handleQsaChange(index, 'qualificacao', e.target.value)}
                        placeholder="Ex: Administrador"
                        size="sm"
                        radius="md"
                        styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <TextInput
                        label="Participação (R$)"
                        value={formatCurrencyInput(membro.participacao)}
                        onChange={(e) => handleQsaChange(index, 'participacao', unformatCurrency(e.target.value))}
                        placeholder="R$ 0,00"
                        size="sm"
                        radius="md"
                        styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              ))}
            </Stack>
          )}
        </Card>

        {/* Financeiro */}
        <Card padding="xl" radius="md" withBorder shadow="sm">
          <Group mb="xl">
            <ThemeIcon variant="light" size={56} radius="xl" color="blue">
              <Save size={28} />
            </ThemeIcon>
            <div>
              <Title order={4} fw={900}>Financeiro</Title>
              <Text size="sm" c="dimmed">Informações contratuais e honorários.</Text>
            </div>
          </Group>

          <Grid gutter="md">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <TextInput
                label="Valor do Honorário (R$)"
                value={formatCurrencyInput(formData.honorarios.valor)}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  honorarios: { ...prev.honorarios, valor: unformatCurrency(e.target.value) } 
                }))}
                placeholder="R$ 0,00"
                size="md"
                radius="md"
                styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Select
                label="Dia do Vencimento"
                value={formData.honorarios.dia_vencimento?.toString()}
                onChange={(v) => setFormData(prev => ({ 
                  ...prev, 
                  honorarios: { ...prev.honorarios, dia_vencimento: parseInt(v) } 
                }))}
                data={Array.from({ length: 31 }, (_, i) => ({ value: (i + 1).toString(), label: (i + 1).toString() }))}
                size="md"
                radius="md"
                styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Descrição dos Serviços"
                value={formData.servicos_prestados}
                onChange={(e) => handleChange('servicos_prestados', e.target.value)}
                placeholder="Descreva os detalhes dos serviços acordados..."
                autosize
                minRows={2}
                size="md"
                radius="md"
                styles={{ label: { fontWeight: 700, marginBottom: 4 } }}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Paper withBorder p="md" radius="md" bg="gray.0" className="dark:bg-slate-800">
                <Group justify="space-between">
                  <Text fw={700} size="sm">Serviços Prestados:</Text>
                  <Group gap="xl">
                    <Group gap="xs">
                      <Text size="sm" fw={500}>Contábil</Text>
                      <Badge 
                        color={formData.tem_contabil ? "green" : "red"} 
                        variant="filled"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleChange('tem_contabil', !formData.tem_contabil)}
                      >
                        {formData.tem_contabil ? 'SIM' : 'NÃO'}
                      </Badge>
                    </Group>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>Fiscal</Text>
                      <Badge 
                        color={formData.tem_fiscal ? "green" : "red"} 
                        variant="filled"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleChange('tem_fiscal', !formData.tem_fiscal)}
                      >
                        {formData.tem_fiscal ? 'SIM' : 'NÃO'}
                      </Badge>
                    </Group>
                    <Group gap="xs">
                      <Text size="sm" fw={500}>DP</Text>
                      <Badge 
                        color={formData.tem_dp ? "green" : "red"} 
                        variant="filled"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleChange('tem_dp', !formData.tem_dp)}
                      >
                        {formData.tem_dp ? 'SIM' : 'NÃO'}
                      </Badge>
                    </Group>
                  </Group>
                </Group>
              </Paper>
            </Grid.Col>
          </Grid>
        </Card>

        {/* Observações */}
        <Card padding="xl" radius="md" withBorder shadow="sm">
          <Group mb="xl">
            <ThemeIcon variant="light" size={56} radius="xl" color="gray">
              <User size={28} />
            </ThemeIcon>
            <div>
              <Title order={4} fw={900}>Observações</Title>
              <Text size="sm" c="dimmed">Informações adicionais sobre o cliente.</Text>
            </div>
          </Group>

          <Textarea
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            placeholder="Digite observações importantes sobre este cliente..."
            minRows={4}
            size="md"
            radius="md"
            className="w-full"
          />
        </Card>

        {/* Botões de Ação */}
        <Group grow gap="md">
          <Button
            type="button"
            variant="default"
            size="lg"
            radius="md"
            onClick={() => navigate('/clientes')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            size="lg"
            radius="md"
            loading={loading || fetchingCnpj}
            leftSection={<Save size={20} />}
          >
            Salvar Cliente
          </Button>
        </Group>
      </Stack>
    </form>
  </Box>
);
}
