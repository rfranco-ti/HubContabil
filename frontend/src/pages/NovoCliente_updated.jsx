import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Building2, MapPin, User, Phone, Mail, Edit2, Plus, Trash2, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import { clientesAPI } from '../services/api';
import { formatCnpj, formatPhoneDisplay, formatCep, formatCpf, formatPhoneByType, unformatPhone, formatCurrencyInput, unformatCurrency } from '../utils/masks';
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
  Center
} from "@mantine/core";

export default function NovoCliente() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [fetchingCnpj, setFetchingCnpj] = useState(false);
  const [lastApiUsed, setLastApiUsed] = useState(null); // 'open_cnpja', 'invertexto', 'cache'
  const [fetchingInscricaoEstadual, setFetchingInscricaoEstadual] = useState(false);
  const [formData, setFormData] = useState({
    cnpj: '',
    razao_social: '',
    nome_fantasia: '',
    data_abertura: '',
    natureza_juridica: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    situacao_sefaz: '',
    regime_tributario: 'Simples Nacional',
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
    observacoes: ''
  });

  // Carregar dados preenchidos se vier da Pesquisa de Empresas
  useEffect(() => {
    if (location.state?.dadosPreenchidos) {
      const dados = location.state.dadosPreenchidos;
      setFormData(prev => ({
        ...prev,
        ...dados,
        cnpj: formatCnpj(dados.cnpj)
      }));
      toast.info('📋 Dados carregados da pesquisa. Revise e complete as informações!');
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
  };

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
      
      const data = await response.json();

      if (data.company) {
        // Verifica quais campos estão vazios e marca como editáveis
        const newEditableFields = { ...editableFields };

        setFormData(prev => ({
          ...prev,
          razao_social: data.company.name || prev.razao_social,
          nome_fantasia: data.alias || prev.nome_fantasia,
          data_abertura: data.founded ? new Date(data.founded).toISOString().split('T')[0] : prev.data_abertura,
          natureza_juridica: data.company.nature?.text || prev.natureza_juridica,
          inscricao_estadual: prev.inscricao_estadual,
          inscricao_municipal: prev.inscricao_municipal,
          cnae_principal: {
            codigo: data.mainActivity?.id || prev.cnae_principal.codigo,
            descricao: data.mainActivity?.text || prev.cnae_principal.descricao
          },
          cnaes_secundarios: (data.sideActivities || []).map(a => ({
            codigo: a.id || '',
            descricao: a.text || ''
          })),
          qsa: (data.company?.members || data.members || []).map(m => ({
            nome: m.person?.name || m.name || '',
            cpf_cnpj: formatCpf(m.person?.taxId || m.cpf || ''),
            qualificacao: m.role?.text || m.qualification || '',
            participacao: m.equity || 0
          })),
          endereco: {
            cep: data.address?.zip || prev.endereco.cep,
            logradouro: data.address?.street || prev.endereco.logradouro,
            numero: data.address?.number || prev.endereco.numero,
            complemento: data.address?.details || prev.endereco.complemento,
            bairro: data.address?.district || prev.endereco.bairro,
            cidade: data.address?.city || prev.endereco.cidade,
            uf: data.address?.state || prev.endereco.uf
          },
          contato_principal: {
            nome: data.company?.name || prev.contato_principal.nome,
            email: data.emails?.[0]?.address || data.emails?.[0] || prev.contato_principal.email,
            // Formata telefone com regra mobile
            telefone: data.phones?.[0] ?
              formatPhoneByType(data.phones[0].area, data.phones[0].number, data.phones[0].type) :
              prev.contato_principal.telefone
          },
          // Regime tributário baseado na API
          regime_tributario: (() => {
            if (data.mei) return 'Simples Nacional'; // MEI é Simei
            if (data.simpleNational) return 'Simples Nacional';
            return 'Outro';
          })()
        }));

        // Marca campos vazios como editáveis
        if (!data.company.name) newEditableFields.razao_social = true;
        if (!data.alias) newEditableFields.nome_fantasia = true;
        if (!data.founded) newEditableFields.data_abertura = true;
        if (!data.company.nature?.text) newEditableFields.natureza_juridica = true;
        if (!data.address?.zip) newEditableFields.cep = true;
        if (!data.address?.street) newEditableFields.logradouro = true;
        if (!data.address?.number) newEditableFields.numero = true;
        if (!data.address?.details) newEditableFields.complemento = true;
        if (!data.address?.district) newEditableFields.bairro = true;
        if (!data.address?.city) newEditableFields.cidade = true;
        if (!data.address?.state) newEditableFields.uf = true;
        if (!data.emails?.[0]?.address && !data.emails?.[0]) newEditableFields.email = true;
        if (!data.phones?.[0]) newEditableFields.telefone = true;
        if (!data.mainActivity?.id) newEditableFields.cnae_codigo = true;
        if (!data.mainActivity?.text) newEditableFields.cnae_descricao = true;

        setEditableFields(newEditableFields);
        
        // Salvar qual API foi usada
        setLastApiUsed(data.apiUsed);
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
        situacao_sefaz: data.situacaoCadastral || ''
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

  // Componente de campo editável
  const EditableField = ({ label, value, onChange, type = 'text', fieldKey, placeholder, maxLength, options }) => {
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
          disabled={!isEditable && isEmpty}
          placeholder={isEditable ? placeholder : ''}
          size="md"
          radius="md"
        />
      );
    }

    if (type === 'textarea') {
      return (
        <Textarea
          label={labelContent}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!isEditable && isEmpty}
          placeholder={isEditable ? placeholder : ''}
          size="md"
          radius="md"
          minRows={3}
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
        disabled={!isEditable && isEmpty}
        placeholder={isEditable ? placeholder : ''}
        size="md"
        radius="md"
      />
    );
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto bg-base-200 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/clientes')}>
          <ArrowLeft size={18} className="mr-2" />
          Voltar para Clientes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-5xl space-y-6">
        {/* Dados Principais */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="bg-primary/10 text-primary p-4 rounded-2xl mr-4">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-base-content">Novo Cliente</h1>
              <p className="text-sm text-base-content/60 mt-0.5">Preencha os dados da empresa para cadastrar no sistema.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Select label="CNPJ *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formatCnpj(formData.cnpj)}
                  onChange={(e) => handleChange('cnpj', e.target.value)}
                  onBlur={handleCnpjBlur}
                  placeholder="00.000.000/0000-00"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                {/* Botão de lupa - aparece quando CNPJ tem 14 dígitos */}
                {formData.cnpj.replace(/\D/g, '').length === 14 && (
                  <button
                    type="button"
                    onClick={handleCnpjBlur}
                    disabled={fetchingCnpj}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Pesquisar CNPJ na base de dados"
                  >
                    {fetchingCnpj ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Search size={18} />
                    )}
                  </button>
                )}
                {/* Indicador de API usada */}
                {lastApiUsed && formData.cnpj.replace(/\D/g, '').length === 14 && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-600">
                    {lastApiUsed === 'open_cnpja' && '🟢 open.cnpja.com'}
                    {lastApiUsed === 'invertexto' && '🔵 invertexto.com'}
                    {lastApiUsed === 'cache' && '⚡ Cache'}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center">
                {fetchingCnpj && <Loader2 className="animate-spin mr-1" size={12} />}
                {fetchingCnpj ? 'Buscando dados do CNPJ...' : 'Digite o CNPJ completo e clique na lupa para buscar os dados automaticamente.'}
              </p>
            </div>

            <div className="md:col-span-2">
              <EditableField
                label="Razão Social *"
                value={formData.razao_social}
                onChange={(v) => handleChange('razao_social', v)}
                fieldKey="razao_social"
                placeholder="Ex: Empresa Exemplo LTDA"
              />
            </div>

            <div>
              <EditableField
                label="Nome Fantasia"
                value={formData.nome_fantasia}
                onChange={(v) => handleChange('nome_fantasia', v)}
                fieldKey="nome_fantasia"
                placeholder="Ex: Empresa Exemplo"
              />
            </div>

            <div>
              <EditableField
                label="Data de Abertura"
                value={formData.data_abertura}
                onChange={(v) => handleChange('data_abertura', v)}
                type="date"
                fieldKey="data_abertura"
              />
            </div>

            <div>
              <EditableField
                label="Natureza Jurídica"
                value={formData.natureza_juridica}
                onChange={(v) => handleChange('natureza_juridica', v)}
                fieldKey="natureza_juridica"
                placeholder="Ex: Sociedade Empresária Limitada"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Regime Tributário" value={formData.regime_tributario} onChange={(val) => {(e) => handleChange('regime_tributario', e.target.value)} /* Note: adapt onChange for Select */} data={[<option value="Simples Nacional">Simples Nacional</option>
                <option value="Lucro Presumido">Lucro Presumido</option>
                <option value="Lucro Real">Lucro Real</option>
                <option value="Não Enquadrado">Não Enquadrado</option>
                <option value="Outro">Outro</option>]} size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
            </div>

            <div>
              <Select label="Inscrição Estadual</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.inscricao_estadual}
                  onChange={(e) => handleChange('inscricao_estadual', e.target.value.replace(/\D/g, ''))}
                  placeholder="Apenas números"
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={handleFetchInscricaoEstadual}
                  disabled={fetchingInscricaoEstadual || formData.endereco.uf?.toUpperCase() !== 'BA'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Buscar Inscrição Estadual na SEFAZ BA (apenas para BA)"
                >
                  {fetchingInscricaoEstadual ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Search size={18} />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {formData.endereco.uf?.toUpperCase() === 'BA'
                  ? 'Clique na lupa para buscar automaticamente na SEFAZ BA'
                  : 'Disponível apenas para empresas da Bahia'}
              </p>
            </div>

            <div>
              <TextInput label="Inscrição Municipal" type="text" value={formData.inscricao_municipal} onChange={(e) => handleChange('inscricao_municipal', e.target.value.replace(/\D/g, ''))} placeholder="Apenas números" size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Situação SEFAZ</label>
              <input
                type="text"
                value={formData.situacao_sefaz}
                onChange={(e) => handleChange('situacao_sefaz', e.target.value)}
                placeholder="ATIVO, INATIVO, etc."
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                readOnly
              />
              <p className="text-xs text-slate-400 mt-1">
                Preenchido automaticamente ao buscar Inscrição Estadual na SEFAZ BA
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Status Receita Federal" value={formData.status} onChange={(val) => {(e) => handleChange('status', e.target.value)} /* Note: adapt onChange for Select */} data={[<option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Bloqueado">Bloqueado</option>]} size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
            </div>

            <div>
              <TextInput label="Categoria" type="text" value={formData.categoria} onChange={(e) => handleChange('categoria', e.target.value)} placeholder="Ex: Serviços, Comércio..." size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
            </div>
          </div>
        </Card>

        {/* Endereço */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="bg-primary-100 text-primary-600 p-4 rounded-2xl mr-4">
              <MapPin size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Endereço</h2>
              <p className="text-sm text-slate-500 mt-0.5">Dados do endereço comercial.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <EditableField
                label="CEP"
                value={formatCep(formData.endereco.cep)}
                onChange={(v) => handleEnderecoChange('cep', v.replace(/\D/g, ''))}
                fieldKey="cep"
                placeholder="00000-000"
                maxLength={9}
              />
            </div>

            <div className="md:col-span-2">
              <EditableField
                label="Logradouro"
                value={formData.endereco.logradouro}
                onChange={(v) => handleEnderecoChange('logradouro', v)}
                fieldKey="logradouro"
                placeholder="Rua, Avenida..."
              />
            </div>

            <div>
              <EditableField
                label="Número"
                value={formData.endereco.numero}
                onChange={(v) => handleEnderecoChange('numero', v)}
                fieldKey="numero"
                placeholder="123"
              />
            </div>

            <div>
              <EditableField
                label="Complemento"
                value={formData.endereco.complemento}
                onChange={(v) => handleEnderecoChange('complemento', v)}
                fieldKey="complemento"
                placeholder="Sala 101"
              />
            </div>

            <div>
              <EditableField
                label="Bairro"
                value={formData.endereco.bairro}
                onChange={(v) => handleEnderecoChange('bairro', v)}
                fieldKey="bairro"
                placeholder="Centro"
              />
            </div>

            <div>
              <EditableField
                label="Cidade"
                value={formData.endereco.cidade}
                onChange={(v) => handleEnderecoChange('cidade', v)}
                fieldKey="cidade"
                placeholder="Salvador"
              />
            </div>

            <div>
              <EditableField
                label="UF"
                value={formData.endereco.uf}
                onChange={(v) => handleEnderecoChange('uf', v.toUpperCase())}
                fieldKey="uf"
                placeholder="BA"
                maxLength={2}
              />
            </div>
          </div>
        </Card>

        {/* Contato */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-primary-100 text-primary-600 p-4 rounded-2xl mr-4">
                <Mail size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Contatos</h2>
                <p className="text-sm text-slate-500 mt-0.5">Dados para contato com a empresa.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddContato}
              className="flex items-center bg-primary-100 hover:bg-primary-200 text-primary-700 font-bold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} className="mr-1" />
              Adicionar Contato
            </button>
          </div>

          <div className="space-y-4">
            {/* Primeiro contato - preenchido automaticamente pela API */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start border border-slate-200 rounded-xl p-4 bg-slate-50">
              <div className="md:col-span-4">
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Nome do Cliente
                  <Edit2 size={14} className="inline ml-1 text-slate-400" />
                </label>
                <input
                  type="text"
                  value={formData.contato_principal.nome || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, contato_principal: { ...prev.contato_principal, nome: e.target.value } }))}
                  placeholder="Nome do cliente"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div className="md:col-span-4">
                <TextInput label="E-mail" type="email" value={formData.contato_principal.email} onChange={(e) => setFormData(prev => ({ ...prev, contato_principal: { ...prev.contato_principal, email: e.target.value } }))} placeholder="contato@empresa.com" size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
              </div>
              <div className="md:col-span-3">
                <TextInput label="Telefone" type="text" value={formatPhoneDisplay(formData.contato_principal.telefone, 'mobile')} onChange={(e) => setFormData(prev => ({ ...prev, contato_principal: { ...prev.contato_principal, telefone: unformatPhone(e.target.value) } }))} placeholder="(71) 9 99999-9999" maxLength={16} size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
              </div>
            </div>

            {/* Contatos adicionais */}
            {formData.contatos.map((contato, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="md:col-span-4">
                  <TextInput label="Nome do Contato" type="text" value={contato.nome} onChange={(e) => handleContatoChange(index, 'nome', e.target.value)} placeholder="Nome da pessoa para contato" size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
                </div>
                <div className="md:col-span-4">
                  <TextInput label="E-mail" type="email" value={contato.email} onChange={(e) => handleContatoChange(index, 'email', e.target.value)} placeholder="contato@empresa.com" size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
                </div>
                <div className="md:col-span-3">
                  <TextInput label="Telefone" type="text" value={formatPhoneDisplay(contato.telefone, 'mobile')} onChange={(e) => handleContatoChange(index, 'telefone', e.target.value)} placeholder="(71) 9 99999-9999" maxLength={16} size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveContato(index)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* CNAE Principal */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="bg-primary-100 text-primary-600 p-4 rounded-2xl mr-4">
              <Building2 size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">CNAE Principal</h2>
              <p className="text-sm text-slate-500 mt-0.5">Classificação da atividade econômica principal.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <EditableField
                label="Código CNAE"
                value={formData.cnae_principal.codigo}
                onChange={(v) => handleCnaeChange('codigo', v)}
                fieldKey="cnae_codigo"
                placeholder="0000-0/00"
              />
            </div>

            <div className="md:col-span-3">
              <EditableField
                label="Descrição"
                value={formData.cnae_principal.descricao}
                onChange={(v) => handleCnaeChange('descricao', v)}
                fieldKey="cnae_descricao"
                placeholder="Descrição da atividade principal"
              />
            </div>
          </div>
        </Card>

        {/* CNAEs Secundários */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-primary-100 text-primary-600 p-4 rounded-2xl mr-4">
                <Building2 size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">CNAEs Secundários</h2>
                <p className="text-sm text-slate-500 mt-0.5">Atividades econômicas secundárias.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddCnaeSecundario}
              className="flex items-center bg-primary-100 hover:bg-primary-200 text-primary-700 font-bold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} className="mr-1" />
              Adicionar
            </button>
          </div>

          {formData.cnaes_secundarios.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Nenhum CNAE secundário cadastrado.</p>
          ) : (
            <div className="space-y-4">
              {formData.cnaes_secundarios.map((cnae, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-10 gap-4 items-start border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="md:col-span-3">
                    <TextInput label="Código" type="text" value={cnae.codigo} onChange={(e) => handleCnaeSecundarioChange(index, 'codigo', e.target.value)} placeholder="0000-0/00" size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
                  </div>
                  <div className="md:col-span-6">
                    <TextInput label="Descrição" type="text" value={cnae.descricao} onChange={(e) => handleCnaeSecundarioChange(index, 'descricao', e.target.value)} placeholder="Descrição da atividade" size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveCnaeSecundario(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quadro Societário (QSA) */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-primary-100 text-primary-600 p-4 rounded-2xl mr-4">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">Quadro Societário (QSA)</h2>
                <p className="text-sm text-slate-500 mt-0.5">Sócios e administradores da empresa.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddQsa}
              className="flex items-center bg-primary-100 hover:bg-primary-200 text-primary-700 font-bold px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={18} className="mr-1" />
              Adicionar Sócio
            </button>
          </div>

          {formData.qsa.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Nenhum sócio cadastrado.</p>
          ) : (
            <div className="space-y-4">
              {formData.qsa.map((membro, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="md:col-span-4">
                    <TextInput label="Nome" type="text" value={membro.nome} onChange={(e) => handleQsaChange(index, 'nome', e.target.value)} placeholder="Nome do sócio" size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
                  </div>
                  <div className="md:col-span-2">
                    <TextInput label="CPF/CNPJ" type="text" value={formatCpf(membro.cpf_cnpj)} onChange={(e) => handleQsaChange(index, 'cpf_cnpj', e.target.value)} placeholder="000.000.000-00" size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
                  </div>
                  <div className="md:col-span-3">
                    <TextInput label="Qualificação" type="text" value={membro.qualificacao} onChange={(e) => handleQsaChange(index, 'qualificacao', e.target.value)} placeholder="Ex: Administrador" size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
                  </div>
                  <div className="md:col-span-2">
                    <TextInput label="Participação (R$)" type="text" value={formatCurrencyInput(membro.participacao)} onChange={(e) => handleQsaChange(index, 'participacao', unformatCurrency(e.target.value))} placeholder="R$ 0,00" size="md" radius="md" styles={{ label: { fontWeight: 700, marginBottom: 4 } }} />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveQsa(index)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Observações */}
        <Card>
          <div className="flex items-center mb-4">
            <div className="bg-primary/10 text-primary p-4 rounded-2xl mr-4">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black text-base-content">Observações</h2>
              <p className="text-sm text-base-content/60 mt-0.5">Informações adicionais sobre o cliente.</p>
            </div>
          </div>

          <textarea
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            placeholder="Digite observações importantes sobre este cliente..."
            rows={4}
            className="textarea textarea-bordered w-full resize-none"
          />
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/clientes')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="flex-1"
            loading={loading || fetchingCnpj}
            disabled={loading || fetchingCnpj}
          >
            <Save size={20} className="mr-2" />
            Salvar Cliente
          </Button>
        </div>
      </form>
    </div>
  );
}
