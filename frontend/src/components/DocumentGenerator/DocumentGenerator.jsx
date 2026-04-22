import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  Box, 
  Paper, 
  Grid, 
  Stack, 
  Group, 
  Text, 
  Title, 
  Button, 
  Select, 
  ActionIcon, 
  Divider, 
  ScrollArea,
  Badge,
  ThemeIcon,
  Tooltip,
  SimpleGrid,
  LoadingOverlay,
  Collapse,
} from '@mantine/core';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import { 
  Printer, 
  ChevronDown, 
  X, 
  History, 
  Save, 
  FileSignature, 
  Users, 
  Plus, 
  FileText,
  ChevronUp,
  ArrowLeft
} from 'lucide-react';
import { clientesAPI, documentosGeradosAPI } from '../../services/documentosAPI';
import ReciboHonorarios from './templates/ReciboHonorarios';
import TermoRecebimento from './templates/TermoRecebimento';
import TermoDevolucao from './templates/TermoDevolucao';
import Comunicado from './templates/Comunicado';
import DeclaracaoRegularidade from './templates/DeclaracaoRegularidade';
import Procuracao from './templates/Procuracao';
import ReciboForm from './forms/ReciboForm';
import TermoRecebimentoForm from './forms/TermoRecebimentoForm';
import TermoDevolucaoForm from './forms/TermoDevolucaoForm';
import ComunicadoForm from './forms/ComunicadoForm';
import DeclaracaoForm from './forms/DeclaracaoForm';
import ProcuracaoForm from './forms/ProcuracaoForm';
import { toast } from 'sonner';
// Remover import do CSS antigo para evitar conflitos
// import '../../styles/document/DocumentGenerator.css';

/**
 * Lista de templates disponíveis
 */
const DOCUMENT_TEMPLATES = [
  { id: 'recibo', name: 'Recibo de Honorários', icon: '💰' },
  { id: 'termo_recebimento', name: 'Termo de Recebimento de Documentos', icon: '📥' },
  { id: 'termo_devolucao', name: 'Termo de Devolução de Documentos', icon: '📤' },
  { id: 'comunicado', name: 'Comunicado/Circular', icon: '📢' },
  { id: 'declaracao', name: 'Declaração de Regularidade', icon: '📜' },
  { id: 'procuracao', name: 'Procuração Simples', icon: '✒️' }
];
const DocumentGenerator = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTemplate = templateId || null;
  const [formData, setFormData] = useState({});
  const [documentRef, setDocumentRef] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState({ form: false, preview: false });

  // Carregar clientes e histórico ao montar
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([loadClientes(), loadHistory()]);
      setIsLoading(false);
    };
    init();
  }, []);

  // Monitorar mudança de clientes para auto-selecionar se vier via URL
  useEffect(() => {
    const cnpjParam = searchParams.get('cnpj');
    if (cnpjParam && clientes.length > 0 && !selectedCliente) {
      const found = clientes.find(c => c.cnpj?.replace(/\D/g, '') === cnpjParam.replace(/\D/g, ''));
      if (found) {
        handleSelectCliente(found.id || found._id);
        // Se não houver template selecionado e viermos da tela de cliente, padrão é recibo
        if (!selectedTemplate) {
          navigate(`/gerador-documentos/recibo?${searchParams.toString()}`, { replace: true });
        }
      }
    }
  }, [clientes, searchParams]);

  const loadClientes = async () => {
    try {
      const response = await clientesAPI.listar();
      // O backend retorna o array diretamente ou dentro de um objeto data
      const data = Array.isArray(response) ? response : (response.data || []);
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      toast.error('Erro ao carregar lista de clientes');
    }
  };

  const loadHistory = async () => {
    try {
      const response = await documentosGeradosAPI.listar({ limite: 10 });
      setHistory(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  // Auto-preencher dados do cliente
  const handleSelectCliente = (clienteId) => {
    const cliente = clientes.find(c => c._id === clienteId || c.id === clienteId);
    setSelectedCliente(cliente);

    if (cliente) {
      setFormData(prev => ({
        ...prev,
        clienteNome: cliente.razao_social || cliente.nome_fantasia || '',
        clienteDocumento: cliente.cnpj || cliente.cpf || '',
        empresaNome: cliente.razao_social || '',
        empresaCNPJ: cliente.cnpj || '',
        valor: cliente.honorarios?.valor || prev.valor || '',
        cidade: cliente.endereco?.cidade || 'Salvador',
      }));
    }
  };

  // Salvar documento no histórico
  const handleSaveDocument = async () => {
    if (!selectedTemplate || !formData) return;

    setIsSaving(true);
    try {
      await documentosGeradosAPI.salvar({
        tipo: selectedTemplate,
        dados: formData,
        clienteId: selectedCliente?._id || selectedCliente?.id || null,
      });

      loadHistory();
      toast.success('Documento salvo no histórico com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      toast.error('Erro ao salvar documento');
    } finally {
      setIsSaving(false);
    }
  };

  // Configuração dos templates
  const templateConfig = {
    recibo: { component: ReciboHonorarios, form: ReciboForm, title: 'Recibo de Honorários', icon: '💰' },
    termo_recebimento: { component: TermoRecebimento, form: TermoRecebimentoForm, title: 'Termo de Recebimento', icon: '📥' },
    termo_devolucao: { component: TermoDevolucao, form: TermoDevolucaoForm, title: 'Termo de Devolução', icon: '📤' },
    comunicado: { component: Comunicado, form: ComunicadoForm, title: 'Comunicado Oficial', icon: '📢' },
    declaracao: { component: DeclaracaoRegularidade, form: DeclaracaoForm, title: 'Declaração de Regularidade', icon: '📜' },
    procuracao: { component: Procuracao, form: ProcuracaoForm, title: 'Procuração Simples', icon: '✒️' }
  };

  // Hook de impressão
  const handlePrint = useReactToPrint({
    content: () => documentRef,
    documentTitle: selectedTemplate ? templateConfig[selectedTemplate]?.title : 'Documento',
  });

  // Selecionar template
  const handleSelectTemplate = (templateId) => {
    navigate(`/gerador-documentos/${templateId}`);
    // Preservar dados se já houver um cliente selecionado, senão limpar
    if (!selectedCliente) {
      setFormData({});
    }
  };

  // Voltar para tela inicial do gerador
  const handleBack = () => {
    navigate('/gerador-documentos');
    setFormData({});
    setSelectedCliente(null);
    setCollapsedSections({ form: false, preview: false });
  };

  // Renderizar formulário
  const renderForm = () => {
    if (!selectedTemplate) return null;
    const config = templateConfig[selectedTemplate];
    const FormComponent = config.form;
    return <FormComponent formData={formData} onChange={setFormData} />;
  };

  // Renderizar documento
  const renderDocument = () => {
    if (!selectedTemplate) return null;
    const config = templateConfig[selectedTemplate];
    const DocumentComponent = config.component;

    return <DocumentComponent ref={setDocumentRef} data={formData} />;
  };

  return (
    <Box pos="relative">
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 2 }} />

      <style>{`
        .a4-preview-container {
          background: #f1f5f9;
          padding: 20px;
          display: flex;
          justify-content: center;
          overflow-y: auto;
          height: calc(100vh - 100px);
          border-radius: 0 0 12px 0;
        }

        .a4-document-wrapper {
          transform: scale(0.65);
          transform-origin: top center;
          width: 210mm;
          height: 297mm;
        }

        .a4-document {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15);
          padding: 20mm;
          box-sizing: border-box;
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
        }

        .editor-sidebar {
          height: calc(100vh - 100px);
          overflow-y: auto;
          background: white;
          border-right: 1px solid #e2e8f0;
          padding-right: 10px;
        }

        /* Otimização de escala baseada na largura da tela */
        @media (min-width: 1400px) { .a4-document-wrapper { transform: scale(0.7); } }
        @media (min-width: 1600px) { .a4-document-wrapper { transform: scale(0.85); } }
        @media (min-width: 1900px) { .a4-document-wrapper { transform: scale(1.0); } }

        @media (max-width: 1200px) {
          .a4-document-wrapper { transform: scale(1); width: 100%; height: auto; }
          .a4-preview-container { height: auto; padding: 10px; border-radius: 12px; }
          .editor-sidebar { height: auto; border-right: none; }
          .a4-document { width: 100%; padding: 10mm; }
        }
      `}</style>

      {/* Header / Toolbar */}
      <Paper p="xs" radius={0} className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <Group justify="space-between" px="md">
          <Group gap="xs">
            {selectedTemplate && (
              <Button 
                variant="subtle" 
                color="gray" 
                size="xs"
                leftSection={<ArrowLeft size={16} />}
                onClick={handleBack}
              >
                Voltar
              </Button>
            )}
            <Title order={5}>
              {selectedTemplate ? templateConfig[selectedTemplate].title : 'Gerador de Documentos'}
            </Title>
          </Group>

          <Group gap="xs">
            <Button 
              variant="light" 
              size="xs" 
              color="indigo"
              leftSection={<History size={16} />}
              onClick={() => setShowHistory(!showHistory)}
            >
              Histórico
            </Button>
            
            {selectedTemplate && (
              <Group gap="xs">
                <Button 
                  variant="filled" 
                  size="xs" 
                  color="green" 
                  leftSection={<Save size={16} />}
                  onClick={handleSaveDocument}
                  loading={isSaving}
                >
                  Salvar
                </Button>
                <Button 
                  variant="filled" 
                  size="xs" 
                  color="blue" 
                  leftSection={<Printer size={16} />}
                  onClick={() => handlePrint()}
                >
                  Imprimir
                </Button>
              </Group>
            )}
          </Group>
        </Group>
      </Paper>

      <Grid gutter={0} align="stretch" style={{ flex: 1 }}>
        <Grid.Col span={{ base: 12, lg: selectedTemplate ? 4 : 12 }}>
          {!selectedTemplate ? (
            <Box p="xl">
              <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {Object.entries(templateConfig).map(([id, config]) => (
                  <Paper 
                    key={id} 
                    withBorder 
                    p="xl" 
                    radius="lg" 
                    className="hover:shadow-md transition-all cursor-pointer bg-white group"
                    onClick={() => handleSelectTemplate(id)}
                  >
                    <Stack align="center" gap="md">
                      <Text size="3rem">{config.icon}</Text>
                      <Title order={5} ta="center">{config.title}</Title>
                      <Button variant="light" fullWidth className="group-hover:bg-blue-50">Selecionar</Button>
                    </Stack>
                  </Paper>
                ))}
              </SimpleGrid>
            </Box>
          ) : (
            <Box className="editor-sidebar" p="md">
              <Stack gap="md">
                <Select
                  label="🏢 Cliente Vinculado"
                  placeholder="Selecione o cliente..."
                  data={clientes.map(c => ({
                    value: c.id || c._id,
                    label: `${c.razao_social || c.nome_fantasia} - ${c.cnpj || c.cpf}`
                  }))}
                  value={selectedCliente?.id || selectedCliente?._id || ''}
                  onChange={handleSelectCliente}
                  searchable
                  nothingFoundMessage="Nenhum cliente encontrado"
                />
                <Divider label="Campos do Documento" labelPosition="center" my="xs" />
                {renderForm()}
              </Stack>
            </Box>
          )}
        </Grid.Col>

        {/* Lado Direito: Preview (Apenas se template selecionado) */}
        {selectedTemplate && (
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Box pos="relative">
              <Box p="xs" bg="gray.1" style={{ borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Group gap="xs" px="sm">
                  <Badge variant="dot" size="xs" color="blue">LIVE PREVIEW</Badge>
                  <Text size="10px" fw={700} c="dimmed">FORMATO A4</Text>
                </Group>
                <Text size="10px" c="dimmed" px="sm">Escalado para caber na tela</Text>
              </Box>
              <Box className="a4-preview-container">
                <Box className="a4-document-wrapper">
                  {renderDocument()}
                </Box>
              </Box>
            </Box>
          </Grid.Col>
        )}
      </Grid>

      {/* Drawer/Modal de Histórico Lateral */}
      <Collapse in={showHistory}>
        <Paper withBorder p="md" radius="md" mt="md" bg="gray.0">
          <Group justify="space-between" mb="md">
            <Title order={5}>Histórico Recente</Title>
            <ActionIcon variant="subtle" onClick={() => setShowHistory(false)}><X size={18} /></ActionIcon>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
            {history.map((doc) => (
              <Paper key={doc.id || doc._id} withBorder p="sm" radius="md" bg="white">
                <Group justify="space-between" mb="xs">
                  <Badge size="xs" variant="light">{doc.tipo.replace(/_/g, ' ')}</Badge>
                  <Text size="xs" c="dimmed">{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</Text>
                </Group>
                <Text size="sm" fw={700} truncate>{doc.cliente?.razao_social || 'Documento Avulso'}</Text>
                <Button 
                  variant="subtle" 
                  size="compact-xs" 
                  fullWidth 
                  mt="sm"
                  onClick={() => {
                    setSelectedTemplate(doc.tipo);
                    setFormData(doc.dados || {});
                    setShowHistory(false);
                  }}
                >
                  Carregar Dados
                </Button>
              </Paper>
            ))}
          </SimpleGrid>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default DocumentGenerator;
