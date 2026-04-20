import { useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, ChevronDown, X, History, Save } from 'lucide-react';
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
import '../../styles/document/DocumentGenerator.css';

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
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [documentRef, setDocumentRef] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({ form: false, preview: false });

  // Carregar clientes e histórico ao montar
  useEffect(() => {
    loadClientes();
    loadHistory();
  }, []);

  const loadClientes = async () => {
    try {
      const response = await clientesAPI.listar();
      setClientes(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
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
      alert('Documento salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      alert('Erro ao salvar documento');
    } finally {
      setIsSaving(false);
    }
  };

  // Configuração dos templates
  const templateConfig = {
    recibo: { component: ReciboHonorarios, form: ReciboForm, title: 'Recibo de Honorários' },
    termo_recebimento: { component: TermoRecebimento, form: TermoRecebimentoForm, title: 'Termo de Recebimento de Documentos' },
    termo_devolucao: { component: TermoDevolucao, form: TermoDevolucaoForm, title: 'Termo de Devolução de Documentos' },
    comunicado: { component: Comunicado, form: ComunicadoForm, title: 'Comunicado Oficial' },
    declaracao: { component: DeclaracaoRegularidade, form: DeclaracaoForm, title: 'Declaração de Regularidade' },
    procuracao: { component: Procuracao, form: ProcuracaoForm, title: 'Procuração Simples' }
  };

  // Hook de impressão
  const handlePrint = useReactToPrint({
    content: () => documentRef,
    documentTitle: selectedTemplate ? templateConfig[selectedTemplate]?.title : 'Documento',
    onAfterPrint: () => console.log('Documento impresso com sucesso'),
    onPrintError: (error) => console.error('Erro ao imprimir:', error)
  });

  // Selecionar template
  const handleSelectTemplate = (templateId) => {
    setSelectedTemplate(templateId);
    setFormData({});
    setSelectedCliente(null);
  };

  // Voltar para tela inicial do gerador
  const handleBack = () => {
    setSelectedTemplate(null);
    setFormData({});
    setSelectedCliente(null);
    setCollapsedSections({ form: false, preview: false });
  };

  // Toggle collapse sections
  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Renderizar formulário
  const renderForm = () => {
    if (!selectedTemplate) return null;
    const config = templateConfig[selectedTemplate];
    const FormComponent = config.form;
    return <FormComponent formData={formData} onChange={setFormData} />;
  };

  // Renderizar documento - A4 direto no container
  const renderDocument = () => {
    if (!selectedTemplate) return null;
    const config = templateConfig[selectedTemplate];
    const DocumentComponent = config.component;

    return <DocumentComponent ref={setDocumentRef} data={formData} />;
  };

  return (
    <div className="dg-container">
      {/* CSS para escala responsiva do A4 */}
      <style>{`
        /* A4 document base styles */
        .a4-document {
          width: 210mm;
          min-height: 297mm;
          background: white;
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.15);
          margin: 0 auto;
          padding: 20mm;
          box-sizing: border-box;
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #000;
          max-width: 100%;
        }

        /* Responsive scaling */
        @media (max-width: 850px) {
          .a4-document {
            transform: scale(0.9);
            transform-origin: top center;
            padding: 15mm;
          }
        }

        @media (max-width: 750px) {
          .a4-document {
            transform: scale(0.8);
            padding: 12mm;
          }
        }

        @media (max-width: 650px) {
          .a4-document {
            transform: scale(0.7);
            padding: 10mm;
          }
        }

        @media (max-width: 550px) {
          .a4-document {
            transform: scale(0.6);
            padding: 8mm;
          }
        }

        /* Preview container responsive */
        @media (max-width: 1024px) {
          .preview-content {
            padding: 16px;
          }
        }

        @media (max-width: 768px) {
          .preview-content {
            padding: 12px;
          }
        }
      `}</style>

      {/* Toolbar interna (apenas ações) */}
      <div className="dg-toolbar">
        <div className="dg-toolbar__left">
          {selectedTemplate && (
            <button
              onClick={handleBack}
              className="dg-toolbar__button"
              title="Voltar para seleção de templates"
              aria-label="Voltar"
            >
              <ChevronDown size={20} className="dg-chevron--back" />
            </button>
          )}
          {selectedTemplate && (
            <span className="dg-toolbar__title">
              {templateConfig[selectedTemplate]?.title}
            </span>
          )}
        </div>

        <div className="dg-toolbar__right">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`dg-toolbar__icon-button ${showHistory ? 'dg-toolbar__icon-button--active' : ''}`}
            title="Histórico de Documentos"
          >
            <History size={20} />
            <span className="dg-hidden-mobile">Histórico</span>
          </button>
          {selectedTemplate && (
            <button onClick={handleBack} className="dg-toolbar__icon-button">
              <X size={20} />
              <span className="dg-hidden-mobile">Fechar</span>
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="dg-content">
        {!selectedTemplate ? (
          // Seletor de Templates
          <div className="dg-selector">
            <h3 className="dg-selector__title">
              Selecione o tipo de documento
            </h3>

            <div className="dg-grid">
              {DOCUMENT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template.id)}
                  className="dg-card"
                >
                  <span className="dg-card__icon">{template.icon}</span>
                  <span className="dg-card__text">{template.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Editor - Layout Responsivo
          <div className="dg-editor-layout">
            {/* Formulário */}
            <div className="dg-form-section">
              <button
                onClick={() => toggleSection('form')}
                className="dg-section-header"
                aria-expanded={!collapsedSections.form}
              >
                <div className="dg-section-header__left">
                  <ChevronDown
                    size={18}
                    className={`dg-chevron ${collapsedSections.form ? 'dg-chevron--rotated' : ''}`}
                  />
                  <span>📝 Formulário</span>
                </div>
                <span className="dg-section-count">
                  {collapsedSections.form ? 'Mostrar' : 'Ocultar'}
                </span>
              </button>

              {!collapsedSections.form && (
                <div className="dg-form-content">
                  {/* Seletor de Cliente */}
                  <div className="dg-client-selector">
                    <label className="dg-client-selector__label">
                      🏢 Selecionar Cliente (Opcional)
                    </label>
                    <select
                      value={selectedCliente?._id || selectedCliente?.id || ''}
                      onChange={(e) => handleSelectCliente(e.target.value)}
                      className="dg-select"
                    >
                      <option value="">Selecione um cliente...</option>
                      {clientes.map(cliente => (
                        <option
                          key={cliente._id || cliente.id}
                          value={cliente._id || cliente.id}
                        >
                          {cliente.razao_social || cliente.nome_fantasia || 'Sem nome'} - {cliente.cnpj || cliente.cpf || ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Ações */}
                  <div className="dg-action-buttons">
                    <button
                      onClick={handleSaveDocument}
                      disabled={isSaving}
                      className={`dg-primary-button dg-primary-button--success ${isSaving ? 'dg-primary-button--disabled' : ''}`}
                    >
                      <Save size={16} />
                      <span>{isSaving ? 'Salvando...' : 'Salvar'}</span>
                    </button>
                    <button
                      onClick={() => handlePrint()}
                      className="dg-primary-button"
                    >
                      <Printer size={16} />
                      <span>Imprimir / PDF</span>
                    </button>
                  </div>

                  {/* Formulário */}
                  <div className="dg-form-scroll">
                    {renderForm()}
                  </div>
                </div>
              )}
            </div>

            {/* Preview do Documento */}
            <div className="dg-preview-section">
              <button
                onClick={() => toggleSection('preview')}
                className="dg-section-header"
                aria-expanded={!collapsedSections.preview}
              >
                <div className="dg-section-header__left">
                  <ChevronDown
                    size={18}
                    className={`dg-chevron ${collapsedSections.preview ? 'dg-chevron--rotated' : ''}`}
                  />
                  <span>📄 Prévia do Documento</span>
                </div>
                <span className="dg-section-count">
                  {collapsedSections.preview ? 'Mostrar' : 'Ocultar'}
                </span>
              </button>

              {!collapsedSections.preview && (
                <div className="dg-preview-content">
                  {renderDocument()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Painel de Histórico (lateral) */}
        {showHistory && (
          <div className="dg-history-panel">
            <div className="dg-history-header">
              <h3 className="dg-history-title">📚 Histórico Recente</h3>
              <button onClick={() => setShowHistory(false)} className="dg-toolbar__icon-button">
                <X size={16} />
              </button>
            </div>

            <div className="dg-history-list">
              {history.length === 0 ? (
                <p className="dg-history-empty">Nenhum documento gerado recentemente</p>
              ) : (
                history.map((doc) => (
                  <div key={doc._id || doc.id} className="dg-history-item">
                    <div className="dg-history-item__info">
                      <p className="dg-history-item__type">
                        {doc.tipo.replace(/_/g, ' ').toUpperCase()}
                      </p>
                      <p className="dg-history-item__date">
                        {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      {doc.cliente && (
                        <p className="dg-history-item__client">
                          {doc.cliente.razao_social || doc.cliente.nome_fantasia}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTemplate(doc.tipo);
                        setFormData(doc.dados || {});
                      }}
                      className="dg-history-view-button"
                    >
                      Ver
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentGenerator;
