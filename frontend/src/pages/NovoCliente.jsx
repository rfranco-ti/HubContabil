import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Edit2, 
  Plus, 
  Trash2, 
  Users, 
  Search,
  Shield,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Hash,
  Globe,
  Briefcase,
  FileCode,
  Lock,
  CalendarDays,
  FileUp,
  Scale,
  TrendingUp,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import api, { clientesAPI } from '../services/api';
import { 
  formatCnpj, 
  formatPhoneDisplay, 
  formatCep, 
  formatCpf, 
  unformatPhone, 
  formatCurrencyInput, 
  unformatCurrency 
} from '../utils/masks';
import { mapCnpjDataToForm, mapCnpjDataToEditableFields } from '../utils/cnpjMapper';
import { 
  Button, 
  Card, 
  TextInput as MantineTextInput, 
  Select, 
  Textarea as MantineTextarea, 
  Group, 
  ActionIcon, 
  Text as MantineText, 
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
  Grid,
  Stepper,
  Switch,
  NumberInput,
  FileInput,
  Checkbox,
  Tooltip
} from "@mantine/core";

export default function NovoCliente() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);
  const [lastApiUsed, setLastApiUsed] = useState(null);
  const [fetchingInscricaoEstadual, setFetchingInscricaoEstadual] = useState(false);
  const [fetchingInscricaoMunicipal, setFetchingInscricaoMunicipal] = useState(false);
  const [active, setActive] = useState(0);

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
    nire: '',
    regime_tributario: 'Não Enquadrado',
    is_mei: false,
    capital_social: 0,
    porte: '',
    situacao_data: '',
    situacao_motivo: '',
    opcao_simples: false,
    data_opcao_simples: '',
    data_exclusao_simples: '',
    motivo_exclusao_simples: '',
    data_opcao_mei: '',
    data_exclusao_mei: '',
    cnae_principal: { codigo: '', descricao: '' },
    cnaes_secundarios: [],
    qsa: [],
    contatos: [],
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
    certificado_digital: {
      possui: false,
      senha: '',
      emissao: '',
      vencimento: '',
      arquivo: null
    },
    status: 'Ativo',
    categoria: 'Serviços',

    honorarios: { valor: 0, dia_vencimento: 10 },
    servicos_prestados: '',
    tem_contabil: false,
    tem_fiscal: false,
    observacoes: ''
  });

  const [showManualSimplesHistory, setShowManualSimplesHistory] = useState(false);
  const [showManualMeiHistory, setShowManualMeiHistory] = useState(false);

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
    cnae_descricao: false,
    capital_social: false
  });

  // Handlers
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'cnpj') setLastApiUsed(null);
  };

  const handleEnderecoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco, [field]: value }
    }));
  };

  const handleCnpjBlur = async () => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) return;

    setFetchingCnpj(true);
    try {
      const response = await clientesAPI.consultarCnpj(cleanCnpj);
      const result = response.data;

      if (result.success && result.data) {
        const cnpjData = result.data;
        // Ajuste para o capital_social vindo da API externa
        const newFormData = mapCnpjDataToForm(cnpjData, formData);
        const newEditableFields = mapCnpjDataToEditableFields(cnpjData, editableFields);

        setFormData(newFormData);
        setEditableFields(newEditableFields);
        setLastApiUsed(cnpjData.apiUsed);
        toast.success('Dados do CNPJ carregados com sucesso!');
      }
    } catch (err) {
      console.error('Erro ao buscar CNPJ:', err);
      toast.error('Erro ao consultar CNPJ. Preencha manualmente.');
    } finally {
      setFetchingCnpj(false);
    }
  };

  const handleFetchInscricaoEstadual = async () => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      toast.warning('Preencha o CNPJ primeiro.');
      return;
    }
    setFetchingInscricaoEstadual(true);
    try {
      const response = await api.post('/rpa/sefaz-ba/inscricao', { cnpj: cleanCnpj });
      const { inscricaoEstadual, situacaoCadastral } = response.data;
      
      setFormData(prev => ({
        ...prev,
        inscricao_estadual: inscricaoEstadual || prev.inscricao_estadual,
        situacao_sefaz_estadual: situacaoCadastral || prev.situacao_sefaz_estadual
      }));
      
      toast.success('Inscrição Estadual obtida com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao buscar Inscrição Estadual. Tente preencher manualmente.');
    } finally {
      setFetchingInscricaoEstadual(false);
    }
  };

  const handleFetchInscricaoMunicipal = async () => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length !== 14) {
      toast.warning('Preencha o CNPJ primeiro.');
      return;
    }
    setFetchingInscricaoMunicipal(true);
    try {
      const response = await api.post('/rpa/salvador/inscricao', { cnpj: cleanCnpj });
      const { inscricaoMunicipal, situacaoMunicipal } = response.data;
      
      setFormData(prev => ({
        ...prev,
        inscricao_municipal: inscricaoMunicipal || prev.inscricao_municipal,
        situacao_sefaz_municipal: situacaoMunicipal || prev.situacao_sefaz_municipal
      }));
      
      toast.success('Inscrição Municipal obtida com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao buscar Inscrição Municipal. Tente preencher manualmente.');
    } finally {
      setFetchingInscricaoMunicipal(false);
    }
  };

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
      qsa: prev.qsa.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };

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
      contatos: prev.contatos.map((item, i) => i === index ? { ...item, [field]: value } : item)
    }));
  };


  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        cnpj: formData.cnpj.replace(/\D/g, ''),
        capital_social: typeof formData.capital_social === 'string' ? unformatCurrency(formData.capital_social) : (formData.capital_social / 100),
        qsa: formData.qsa.map(s => ({
          ...s,
          participacao: typeof s.participacao === 'string' ? unformatCurrency(s.participacao) : s.participacao
        })),
        honorarios: {
          ...formData.honorarios,
          valor: typeof formData.honorarios.valor === 'string' ? unformatCurrency(formData.honorarios.valor) : formData.honorarios.valor
        }
      };
      
      // Nota: Se houver arquivo de certificado, precisaríamos de FormData
      // Por enquanto, seguindo o padrão JSON
      await clientesAPI.create(payload);
      toast.success('Cliente cadastrado com sucesso!');
      navigate('/clientes');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao cadastrar cliente');
    } finally {
      setLoading(false);
    }
  };

  const toggleEditable = (field) => {
    setEditableFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // UI Components
  const SectionHeader = ({ icon: Icon, title, color = "blue" }) => (
    <Group gap="sm" mb="md">
      <ThemeIcon variant="light" color={color} size="lg">
        <Icon size={20} />
      </ThemeIcon>
      <Title order={5} fw={900}>{title}</Title>
    </Group>
  );

  const EditableField = ({ label, value, onChange, type = 'text', fieldKey, placeholder, icon: Icon }) => {
    const isEditable = editableFields[fieldKey];
    const isEmpty = !value || value === '';

    return (
      <MantineTextInput
        type={type === 'date' ? 'date' : 'text'}
        leftSection={Icon && <Icon size={16} className="text-slate-400" />}
        label={
          <Group gap="xs" mb={4}>
            <MantineText span size="sm">{label}</MantineText>
            {(isEmpty || isEditable) && (
              <Tooltip label="Editar campo">
                <ActionIcon variant="subtle" size="xs" onClick={() => toggleEditable(fieldKey)}>
                  <Edit2 size={12} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        }
        value={type === 'currency' ? formatCurrencyInput(value) : value}
        onChange={(e) => {
          const val = e.target.value;
          onChange(type === 'currency' ? unformatCurrency(val) : val);
        }}
        disabled={!isEditable && !isEmpty}
        placeholder={placeholder}

      />
    );
  };

  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <Box p="md" className="max-w-[1200px] mx-auto bg-gray-50/50 min-h-screen">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap={0}>
            <Button 
              variant="subtle" 
              color="gray" 
              leftSection={<ArrowLeft size={16} />} 
              onClick={() => navigate('/clientes')}
              size="xs"
              p={0}
              mb={8}
            >
              Voltar para Lista
            </Button>
            <Title order={2} fw={900} className="text-slate-800">Novo Cliente</Title>
            <MantineText c="dimmed" size="sm" fw={500}>Cadastro completo com integração RPA e dados fiscais</MantineText>
          </Stack>

          <Group gap="sm">
            <Button variant="light" color="gray" onClick={() => navigate('/clientes')}>Cancelar</Button>
            {active < 3 ? (
              <Button color="blue" onClick={nextStep}>Próximo Passo</Button>
            ) : (
              <Button color="emerald" onClick={handleSubmit} loading={loading} leftSection={<Save size={18} />}>
                Finalizar Cadastro
              </Button>
            )}
          </Group>
        </Group>

        <Card withBorder radius="xl" p={0} shadow="sm" className="overflow-hidden border-slate-200">
          <Box p="xl" className="bg-white border-b border-slate-100">
             <Stepper active={active} onStepClick={setActive} breakpoint="sm" allowNextStepsSelect={false}
               styles={{
                 stepIcon: { borderSize: 3 },
                 stepCompletedIcon: { color: 'var(--mantine-color-white)' }
               }}
             >
               <Stepper.Step label="Identificação" description="Dados básicos" icon={<Building2 size={18} />} />
               <Stepper.Step label="Localização" description="Endereço e Fisco" icon={<MapPin size={18} />} />
               <Stepper.Step label="Pessoas" description="Sócios e Contatos" icon={<Users size={18} />} />
               <Stepper.Step label="Finalização" description="Financeiro e Outros" icon={<Shield size={18} />} />
             </Stepper>
          </Box>

          <Box p="xl">
            {/* PASSO 1: IDENTIFICAÇÃO */}
            {active === 0 && (
              <Stack gap="xl">
                <Box>
                  <SectionHeader icon={Building2} title="Informações Jurídicas" />
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                    <MantineTextInput
                      label="CNPJ"
                      placeholder="00.000.000/0000-00"
                      value={formatCnpj(formData.cnpj)}
                      onChange={(e) => handleChange('cnpj', e.target.value)}
                      onBlur={handleCnpjBlur}
                      required
                     
                     
                     
                      leftSection={<Hash size={16} className="text-slate-400" />}
                      rightSection={fetchingCnpj ? <Loader size={16} /> : <Search size={18} className="text-blue-500" />}
                    />
                    <Select
                      label="Regime Tributário"
                      value={formData.regime_tributario}
                      onChange={(v) => handleChange('regime_tributario', v)}
                      data={['Simples Nacional', 'Simples Nacional - MEI', 'Lucro Presumido', 'Lucro Real', 'Não Enquadrado', 'Isento', 'Imune', 'Outro']}
                     
                     
                     
                      leftSection={<Scale size={16} className="text-slate-400" />}
                    />
                  </SimpleGrid>

                  <Box mt="lg">
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                      <EditableField label="Razão Social" value={formData.razao_social} onChange={(v) => handleChange('razao_social', v)} fieldKey="razao_social" icon={FileText} />
                      <EditableField label="Nome Fantasia" value={formData.nome_fantasia} onChange={(v) => handleChange('nome_fantasia', v)} fieldKey="nome_fantasia" icon={Briefcase} />
                    </SimpleGrid>
                  </Box>

                  <Box mt="lg">
                    <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
                      <EditableField label="Data de Abertura" value={formData.data_abertura} onChange={(v) => handleChange('data_abertura', v)} type="date" fieldKey="data_abertura" icon={CalendarDays} />
                      <EditableField label="Porte" value={formData.porte} onChange={(v) => handleChange('porte', v)} fieldKey="porte" icon={TrendingUp} />
                      <EditableField label="Capital Social" value={formData.capital_social} onChange={(v) => handleChange('capital_social', v)} type="currency" fieldKey="capital_social" icon={TrendingUp} />
                    </SimpleGrid>
                  </Box>

                  <Box mt="lg">
                    <SimpleGrid cols={{ base: 1, md: 4 }} spacing="lg">
                      <Select label="Status" value={formData.status} onChange={(v) => handleChange('status', v)} data={['Ativo', 'Inativo', 'Suspenso', 'Bloqueado']} />
                      <EditableField label="Categoria" value={formData.categoria} onChange={(v) => handleChange('categoria', v)} fieldKey="categoria" icon={Briefcase} />
                      <MantineTextInput label="NIRE" value={formData.nire} onChange={(e) => handleChange('nire', e.target.value)} leftSection={<Hash size={16} className="text-slate-400" />} />
                      <MantineTextInput label="Data Opção Simples" type="date" value={formData.data_opcao_simples} onChange={(e) => handleChange('data_opcao_simples', e.target.value)} leftSection={<CalendarDays size={16} className="text-slate-400" />} />
                    </SimpleGrid>
                  </Box>
                  
                  <Group mt="xl" gap="xl">
                    <Switch 
                      label="Microempreendedor Individual (MEI)" 
                      checked={formData.is_mei} 
                      onChange={(e) => handleChange('is_mei', e.currentTarget.checked)}
                     
                    />
                  </Group>

                  {/* HISTÓRICO DINÂMICO */}
                  {(formData.data_exclusao_simples || formData.data_exclusao_mei || showManualSimplesHistory || showManualMeiHistory) ? (
                    <>
                      <Divider mt="xl" mb="lg" label={<MantineText c="dimmed" size="xs">HISTÓRICO FISCAL</MantineText>} labelPosition="center" />
                      
                      <Stack gap="xl">
                        {(formData.data_exclusao_simples || showManualSimplesHistory) && (
                          <Paper withBorder p="md" className="bg-blue-50/10">
                            <Stack gap="xs">
                              <MantineText size="xs" c="blue">SIMPLES NACIONAL - REGISTRO HISTÓRICO</MantineText>
                              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                                <MantineTextInput label="Data Inclusão" type="date" value={formData.data_opcao_simples} onChange={(e) => handleChange('data_opcao_simples', e.target.value)} />
                                <MantineTextInput label="Data Exclusão" type="date" value={formData.data_exclusao_simples} onChange={(e) => handleChange('data_exclusao_simples', e.target.value)} />
                                <Select 
                                  label="Motivo da Exclusão" 
                                  placeholder="Selecione o motivo..."
                                  value={formData.motivo_exclusao_simples} 
                                  onChange={(v) => handleChange('motivo_exclusao_simples', v)} 
                                  data={[
                                    'Exclusão por Opção',
                                    'Exclusão de Ofício por Débitos',
                                    'Exclusão por Excesso de Faturamento',
                                    'Exclusão por Atividade Vedada',
                                    'Exclusão por Transformação em Natureza Jurídica Não Permitida',
                                    'Exclusão por Participação em Outra Empresa',
                                    'Outros Motivos'
                                  ]}
                                  clearable
                                />
                              </SimpleGrid>
                            </Stack>
                          </Paper>
                        )}

                        {(formData.data_exclusao_mei || showManualMeiHistory || formData.is_mei) && (
                          <Paper withBorder p="md" className="bg-orange-50/10">
                            <Stack gap="xs">
                              <MantineText size="xs" c="orange">MEI - REGISTRO HISTÓRICO</MantineText>
                              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                                <MantineTextInput label="Data Opção MEI" type="date" value={formData.data_opcao_mei} disabled title="Preenchido automaticamente via API" />
                                <MantineTextInput label="Data Exclusão MEI" type="date" value={formData.data_exclusao_mei} disabled title="Preenchido automaticamente via API" />
                              </SimpleGrid>
                            </Stack>
                          </Paper>
                        )}
                      </Stack>
                    </>
                  ) : (
                    <Group mt="xl" justify="center">
                      <Button variant="subtle" color="blue" size="xs" leftSection={<Plus size={14} />} onClick={() => setShowManualSimplesHistory(true)}>Adicionar Histórico Simples</Button>
                      <Button variant="subtle" color="orange" size="xs" leftSection={<Plus size={14} />} onClick={() => setShowManualMeiHistory(true)}>Adicionar Histórico MEI</Button>
                    </Group>
                  )}
                </Box>
              </Stack>
            )}

            {/* PASSO 2: LOCALIZAÇÃO */}
            {active === 1 && (
              <Stack gap="xl">
                <Box>
                  <SectionHeader icon={MapPin} title="Endereço Comercial" color="red" />
                  <Grid gutter="lg">
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <MantineTextInput label="CEP" value={formatCep(formData.endereco.cep)} onChange={(e) => handleEnderecoChange('cep', e.target.value)} leftSection={<MapPin size={16} className="text-slate-400" />} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 7 }}>
                      <MantineTextInput label="Logradouro" value={formData.endereco.logradouro} onChange={(e) => handleEnderecoChange('logradouro', e.target.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 2 }}>
                      <MantineTextInput label="Nº" value={formData.endereco.numero} onChange={(e) => handleEnderecoChange('numero', e.target.value)} />
                    </Grid.Col>
                  </Grid>

                  <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg" mt="lg">
                    <MantineTextInput label="Bairro" value={formData.endereco.bairro} onChange={(e) => handleEnderecoChange('bairro', e.target.value)} />
                    <MantineTextInput label="Cidade" value={formData.endereco.cidade} onChange={(e) => handleEnderecoChange('cidade', e.target.value)} />
                    <MantineTextInput label="UF" value={formData.endereco.uf} onChange={(e) => handleEnderecoChange('uf', e.target.value)} />
                  </SimpleGrid>
                </Box>

                <Divider label={<MantineText c="dimmed" size="xs">INFORMAÇÕES FISCAIS (RPA)</MantineText>} labelPosition="center" />

                <Box>
                  <SectionHeader icon={Scale} title="Inscrições e Situações" color="orange" />
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                    <Stack gap={4}>
                      <MantineTextInput 
                        label="Inscrição Estadual" 
                        value={formData.inscricao_estadual} 
                        onChange={(e) => handleChange('inscricao_estadual', e.target.value)}
                       
                        rightSection={<Tooltip label="Buscar via SEFAZ BA"><ActionIcon variant="subtle" onClick={handleFetchInscricaoEstadual} loading={fetchingInscricaoEstadual}><Search size={16}/></ActionIcon></Tooltip>}
                      />
                      <MantineTextInput 
                        label="Situação SEFAZ Estadual" 
                        placeholder="Ex: Ativo, Baixado..."
                        value={formData.situacao_sefaz_estadual} 
                        onChange={(e) => handleChange('situacao_sefaz_estadual', e.target.value)}
                       
                      />
                    </Stack>

                    <Stack gap={4}>
                      <MantineTextInput 
                        label="Inscrição Municipal" 
                        value={formData.inscricao_municipal} 
                        onChange={(e) => handleChange('inscricao_municipal', e.target.value)}
                       
                        rightSection={<Tooltip label="Buscar via Salvador"><ActionIcon variant="subtle" onClick={handleFetchInscricaoMunicipal} loading={fetchingInscricaoMunicipal}><Search size={16}/></ActionIcon></Tooltip>}
                      />
                      <MantineTextInput 
                        label="Situação SEFAZ Municipal" 
                        placeholder="Ex: Ativo, Suspenso..."
                        value={formData.situacao_sefaz_municipal} 
                        onChange={(e) => handleChange('situacao_sefaz_municipal', e.target.value)}
                       
                      />
                    </Stack>
                  </SimpleGrid>
                </Box>
              </Stack>
            )}

            {/* PASSO 3: PESSOAS */}
            {active === 2 && (
              <Stack gap="xl">
                <Box>
                  <SectionHeader icon={Mail} title="Outros Contatos" color="cyan" />
                  <Stack gap="sm">
                    <Stack gap="sm">
                      {formData.contatos.map((contato, idx) => (
                        <Paper key={idx} withBorder p="md" radius="lg" className="bg-slate-50/50">
                          <Grid align="flex-end" gutter="sm">
                          <Grid.Col span={{ base: 12, md: 4 }}>
                            <MantineTextInput label="Nome" value={contato.nome} onChange={(e) => handleContatoChange(idx, 'nome', e.target.value)} size="sm" />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, md: 3.5 }}>
                            <MantineTextInput label="E-mail" value={contato.email} onChange={(e) => handleContatoChange(idx, 'email', e.target.value)} size="sm" />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, md: 3.5 }}>
                            <MantineTextInput label="Telefone" value={contato.telefone} onChange={(e) => handleContatoChange(idx, 'telefone', e.target.value)} size="sm" />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, md: 1 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <ActionIcon color="red" variant="subtle" size="lg" onClick={() => handleRemoveContato(idx)}>
                              <Trash2 size={20} />
                            </ActionIcon>
                          </Grid.Col>
                          </Grid>
                        </Paper>
                      ))}
                    </Stack>
                    <Button variant="dashed" color="cyan" fullWidth leftSection={<Plus size={16} />} onClick={handleAddContato}>Adicionar Contato</Button>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <SectionHeader icon={Users} title="Quadro de Sócios (QSA)" color="indigo" />
                  <Stack gap="sm">
                    {formData.qsa.map((socio, idx) => (
                      <Paper key={idx} withBorder p="md" radius="lg" className="bg-slate-50/50">
                        <Grid align="flex-end" gutter="xs">
                          <Grid.Col span={{ base: 12, md: 3.5 }}><MantineTextInput label="Nome Completo" value={socio.nome} onChange={(e) => handleQsaChange(idx, 'nome', e.target.value)} size="sm" /></Grid.Col>
                          <Grid.Col span={{ base: 12, md: 2.5 }}><MantineTextInput label="CPF/CNPJ" value={socio.cpf_cnpj} onChange={(e) => handleQsaChange(idx, 'cpf_cnpj', e.target.value)} size="sm" /></Grid.Col>
                          <Grid.Col span={{ base: 12, md: 2.5 }}>
                            <MantineTextInput 
                              label="Participação (R$)" 
                              value={formatCurrencyInput(socio.participacao)} 
                              onChange={(e) => handleQsaChange(idx, 'participacao', unformatCurrency(e.target.value))} 
                              size="sm" 
                              leftSection="R$"
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, md: 2.5 }}>
                            <MantineTextInput 
                              label="Data Entrada" 
                              type="date"
                              value={socio.data_entrada} 
                              onChange={(e) => handleQsaChange(idx, 'data_entrada', e.target.value)} 
                              size="sm" 
                            />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, md: 1 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <ActionIcon color="red" variant="subtle" onClick={() => handleRemoveQsa(idx)} size="lg">
                              <Trash2 size={20} />
                            </ActionIcon>
                          </Grid.Col>
                        </Grid>
                      </Paper>
                    ))}
                    <Button variant="dashed" color="indigo" fullWidth leftSection={<Plus size={16} />} onClick={handleAddQsa}>Adicionar Sócio</Button>
                  </Stack>
                </Box>
              </Stack>
            )}

            {/* PASSO 4: FINALIZAÇÃO */}
            {active === 3 && (
              <Stack gap="xl">
                <Box>
                  <SectionHeader icon={CreditCard} title="Honorários e Serviços" color="emerald" />
                  <Paper withBorder p="lg" radius="xl">
                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
                      <Stack gap="md">
                        <MantineTextInput 
                          label="Honorário Mensal" 
                          value={formatCurrencyInput(formData.honorarios.valor)} 
                          onChange={(e) => handleChange('honorarios', { ...formData.honorarios, valor: unformatCurrency(e.target.value) })}
                         
                          leftSection={<DollarSign size={18} className="text-emerald-600" />}
                          styles={{ input: { fontSize: '1.2rem', color: 'var(--mantine-color-emerald-7)' } }}
                        />
                        <NumberInput 
                          label="Dia de Vencimento" 
                          value={formData.honorarios.dia_vencimento} 
                          onChange={(v) => handleChange('honorarios', { ...formData.honorarios, dia_vencimento: v })}
                          min={1} max={31}
                        />
                      </Stack>

                      <Stack gap="xs">
                        <MantineText size="sm" mb={4}>Escopo de Atendimento</MantineText>
                        <Checkbox label="Serviços Contábeis" checked={formData.tem_contabil} onChange={(e) => handleChange('tem_contabil', e.currentTarget.checked)} />
                        <Checkbox label="Escrituração Fiscal" checked={formData.tem_fiscal} onChange={(e) => handleChange('tem_fiscal', e.currentTarget.checked)} />
                        <Checkbox label="Departamento Pessoal" checked={formData.tem_dp} onChange={(e) => handleChange('tem_dp', e.currentTarget.checked)} />
                      </Stack>
                    </SimpleGrid>

                    <MantineTextarea 
                      label="Serviços Adicionais / Detalhamento" 
                      placeholder="Descreva particularidades do contrato ou serviços extras..."
                      value={formData.servicos_prestados} 
                      onChange={(e) => handleChange('servicos_prestados', e.target.value)} 
                      minRows={3} mt="lg"
                    />
                  </Paper>
                </Box>

                <Box>
                  <SectionHeader icon={BadgeCheck} title="Certificado Digital" color="blue" />
                  <Paper withBorder p="lg" radius="xl" className={formData.certificado_digital.possui ? "bg-blue-50/20" : ""}>
                    <Stack gap="md">
                      <Switch 
                        label="O cliente possui Certificado Digital?" 
                        checked={formData.certificado_digital.possui} 
                        onChange={(e) => handleChange('certificado_digital', { ...formData.certificado_digital, possui: e.currentTarget.checked })} 
                       
                       
                      />
                      
                      {formData.certificado_digital.possui && (
                        <Grid gutter="md">
                          <Grid.Col span={{ base: 12, md: 6 }}>
                            <MantineTextInput label="Senha do Certificado" type="password" value={formData.certificado_digital.senha} onChange={(e) => handleChange('certificado_digital', { ...formData.certificado_digital, senha: e.target.value })} leftSection={<Lock size={16} />} />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, md: 6 }}>
                             <FileInput 
                               label="Upload do Certificado (.pfx, .p12)" 
                               placeholder="Clique para selecionar o arquivo" 
                               value={formData.certificado_digital.arquivo} 
                               onChange={(file) => handleChange('certificado_digital', { ...formData.certificado_digital, arquivo: file })}
                              
                               leftSection={<FileUp size={16} />}
                               accept=".pfx,.p12"
                             />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, md: 6 }}>
                            <MantineTextInput label="Data de Emissão" type="date" value={formData.certificado_digital.emissao} onChange={(e) => handleChange('certificado_digital', { ...formData.certificado_digital, emissao: e.target.value })} />
                          </Grid.Col>
                          <Grid.Col span={{ base: 12, md: 6 }}>
                            <MantineTextInput label="Data de Vencimento" type="date" value={formData.certificado_digital.vencimento} onChange={(e) => handleChange('certificado_digital', { ...formData.certificado_digital, vencimento: e.target.value })} />
                          </Grid.Col>
                        </Grid>
                      )}
                    </Stack>
                  </Paper>
                </Box>

                <Box>
                  <SectionHeader icon={Info} title="Observações Finais" color="gray" />
                  <MantineTextarea 
                    placeholder="Alguma informação interna importante sobre este cliente?"
                    value={formData.observacoes} 
                    onChange={(e) => handleChange('observacoes', e.target.value)} 
                    minRows={4} 
                  />
                </Box>
              </Stack>
            )}
          </Box>

          <Box p="xl" className="bg-slate-50 border-t border-slate-100">
            <Group justify="space-between">
              <Button variant="subtle" color="gray" onClick={prevStep} disabled={active === 0} leftSection={<ArrowLeft size={16} />}>
                Voltar Passo
              </Button>
              {active < 3 ? (
                <Button color="blue" onClick={nextStep} px="xl">
                  Próximo Passo
                </Button>
              ) : (
                <Button color="emerald" onClick={handleSubmit} loading={loading} px="xl" leftSection={<CheckCircle2 size={20} />}>
                  Concluir Cadastro
                </Button>
              )}
            </Group>
          </Box>
        </Card>
      </Stack>
    </Box>
  );
}

// Subcomponentes icones adicionais para manter consistência
const DollarSign = ({ size, className }) => <CreditCard size={size} className={className} />;
const BadgeCheck = ({ size, className }) => <Shield size={size} className={className} />;
