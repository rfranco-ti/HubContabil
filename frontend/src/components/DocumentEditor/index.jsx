import { useState, useCallback } from 'react';
import { Editor, Frame, Element } from '@craftjs/core';
import { toast } from 'sonner';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import PropsPanel from './PropsPanel';
import ClientDataPanel from './ClientDataPanel';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';

// Importar TODOS os componentes
import { TextBlock } from './components/TextBlock';
import { DynamicField } from './components/DynamicField';
import { ImageBlock } from './components/ImageBlock';
import { DividerBlock } from './components/DividerBlock';
import { SpacerBlock } from './components/SpacerBlock';
import { clientesAPI } from '../../services/api';

export default function DocumentEditor() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [templateName, setTemplateName] = useState('Novo Template');
  const [savedData, setSavedData] = useState(null);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const fetchClientData = useCallback(async (clientId) => {
    try {
      const response = await clientesAPI.getById(clientId);
      setSelectedClient(response.data);
    } catch (error) {
      console.error('❌ Erro ao buscar dados do cliente:', error);
      toast.error('Erro ao carregar dados do cliente');
    }
  }, []);

  const handleNodesChange = useCallback((data) => {
    if (!data || !data.nodes) return;
    
    const nodes = data.nodes;
    const structure = {
      nodes: Object.values(nodes).map(node => ({
        id: node.id,
        type: node.data?.name,
        props: node.data?.props,
        parent: node.data?.parent,
      })),
      timestamp: Date.now(),
    };
    setSavedData(structure);
  }, []);

  const handleExportPDF = () => {
    toast.info('Exportação PDF será implementada no backend');
  };

  const handleExportDOCX = () => {
    toast.info('Exportação DOCX será implementada no backend');
  };

  const handleSave = () => {
    if (!savedData) {
      toast.warning('Crie um template antes de salvar');
      return;
    }
    toast.success('Template salvo (mock)');
    console.log('📄 Template data:', savedData);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-800">Editor de Documentos</h1>
          <p className="text-xs text-slate-500">Crie e personalize seus templates</p>
        </div>
        <Toolbar
          templateName={templateName}
          onNameChange={setTemplateName}
          onSave={handleSave}
          onExportPDF={handleExportPDF}
          onExportDOCX={handleExportDOCX}
        />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <Editor
          resolver={{
            TextBlock,
            DynamicField,
            ImageBlock,
            DividerBlock,
            SpacerBlock,
          }}
          onNodesChange={handleNodesChange}
          enabled={true}
          indicator={{
            className: 'craft-indicator',
            style: {
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              border: '2px solid #2563eb',
            },
          }}
        >
          {/* Left Sidebar */}
          <Sidebar />

          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-slate-100 p-4">
            <Frame>
              <Element
                canvas
                is="div"
                className="w-full max-w-3xl mx-auto bg-white shadow min-h-[700px] p-6"
              >
                <TextBlock 
                  content="RECIBO DE HONORÁRIOS" 
                  fontSize={16} 
                  fontWeight="bold"
                  textAlign="center"
                />
              </Element>
            </Frame>
          </div>

          {/* Right Panel - Collapsible */}
          <div
            className={`bg-white border-l border-slate-200 overflow-auto flex-shrink-0 transition-all duration-300 ease-in-out ${
              rightPanelOpen ? 'w-64' : 'w-0'
            }`}
          >
            {rightPanelOpen && (
              <div className="w-64">
                <PropsPanel />
                <ClientDataPanel 
                  selectedClient={selectedClient}
                  onClientSelect={fetchClientData}
                />
              </div>
            )}
          </div>

          {/* Toggle Button - Melhorado */}
          <button
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-slate-300 rounded-l-lg p-2 shadow-lg hover:bg-slate-50 hover:border-primary-500 transition-all z-20 group ${
              rightPanelOpen ? 'right-64' : 'right-0'
            }`}
            title={rightPanelOpen ? 'Fechar painel (←)' : 'Abrir painel (→)'}
          >
            {rightPanelOpen ? (
              <PanelRightClose size={18} className="text-slate-600 group-hover:text-primary-600" />
            ) : (
              <PanelRightOpen size={18} className="text-slate-600 group-hover:text-primary-600" />
            )}
          </button>
        </Editor>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 text-xs text-slate-500 flex justify-between">
        <span>💡 Dica: Arraste blocks do sidebar para o canvas</span>
        <span>Atalho: Botão lateral para abrir/fechar painel</span>
      </div>
    </div>
  );
}
