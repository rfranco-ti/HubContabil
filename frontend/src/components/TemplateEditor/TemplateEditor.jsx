import { useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { useReactToPrint } from 'react-to-print';
import { TemplateHandler } from 'easy-template-x';
import { saveAs } from 'file-saver';
import { 
  Printer, FileDown, Save, Bold, Italic, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Image as ImageIcon, ZoomIn, ZoomOut,
  FileText, Undo, Redo, X,
  Pencil, Eye, PenTool, Link
} from 'lucide-react';

// Placeholders do sistema
const SYSTEM_PLACEHOLDERS = [
  { name: 'data_hoje', label: 'Data de Hoje', icon: '📅' },
  { name: 'hora_atual', label: 'Hora Atual', icon: '🕐' },
  { name: 'cidade', label: 'Cidade', icon: '🏙️' },
  { name: 'estado', label: 'Estado', icon: '📍' },
  { name: 'ano_atual', label: 'Ano', icon: '📆' },
  { name: 'mes_atual', label: 'Mês', icon: '📆' },
];

// Placeholders do cliente
const CLIENT_PLACEHOLDERS = [
  { name: 'nome_cliente', label: 'Nome do Cliente', icon: '👤' },
  { name: 'documento_cliente', label: 'CPF/CNPJ', icon: '📋' },
  { name: 'endereco_cliente', label: 'Endereço', icon: '🏠' },
  { name: 'cidade_cliente', label: 'Cidade', icon: '🏙️' },
  { name: 'estado_cliente', label: 'Estado', icon: '📍' },
  { name: 'telefone_cliente', label: 'Telefone', icon: '📞' },
  { name: 'email_cliente', label: 'E-mail', icon: '✉️' },
  { name: 'nome_empresa', label: 'Empresa', icon: '🏢' },
  { name: 'documento_empresa', label: 'CNPJ Empresa', icon: '📋' },
  { name: 'nome_responsavel', label: 'Responsável', icon: '✍️' },
  { name: 'cargo_responsavel', label: 'Cargo', icon: '💼' },
  { name: 'descricao_servico', label: 'Descrição Serviço', icon: '📝' },
  { name: 'valor_total', label: 'Valor Total', icon: '💰' },
];

export default function EditorModelos({ onSave, onGenerate: _onGenerate }) {
  const [mode, setMode] = useState('edit');
  const [modelName, setModelName] = useState('Meu Modelo');
  const [modelFile, setModelFile] = useState(null);
  const [formData, setFormData] = useState({});
  const [placeholders, setPlaceholders] = useState([]);
  const [zoom, setZoom] = useState(100);
  const [showPlaceholdersPanel, setShowPlaceholdersPanel] = useState(false);
  const contentRef = useRef();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        underline: false,
        textAlign: false,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Comece a digitar seu modelo aqui...\n\nUse "🔗 Campos" para adicionar campos variáveis.',
      }),
    ],
    content: `
      <h1 style="text-align: center; color: #1e40af;">RECIBO DE PRESTAÇÃO DE SERVIÇOS</h1>
      <p style="text-align: right;"><strong>Data:</strong> {{data_hoje}}</p>
      <h2 style="color: #1e3a8a; border-bottom: 2px solid #1e40af;">DADOS DO CLIENTE</h2>
      <p><strong>Nome:</strong> {{nome_cliente}}</p>
      <p><strong>CPF/CNPJ:</strong> {{documento_cliente}}</p>
      <h2 style="color: #1e3a8a; border-bottom: 2px solid #1e40af;">SERVIÇO</h2>
      <p>{{descricao_servico}}</p>
      <p style="font-size: 18px;"><strong>Total: R$ {{valor_total}}</strong></p>
      <br/><br/>
      <div style="display: flex; justify-content: space-between; margin-top: 60px;">
        <div style="text-align: center; border-top: 1px solid #000; padding-top: 8px; width: 45%;">
          <p><strong>{{nome_empresa}}</strong></p>
        </div>
        <div style="text-align: center; border-top: 1px solid #000; padding-top: 8px; width: 45%;">
          <p><strong>{{nome_cliente}}</strong></p>
        </div>
      </div>
    `,
    editorProps: { attributes: { class: 'focus:outline-none' } },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      const matches = content.match(/\{\{([^}]+)\}\}/g) || [];
      const unique = [...new Set(matches.map(m => m.replace(/[{}]/g, '')))];
      setPlaceholders(unique);
    },
  });

  const _handlePrint = useReactToPrint({ content: () => contentRef.current, documentTitle: modelName });

  const handleSaveModel = () => {
    const model = { id: Date.now(), name: modelName, content: editor.getHTML(), placeholders, createdAt: new Date().toISOString() };
    onSave?.(model);
    const saved = JSON.parse(localStorage.getItem('doc_models') || '[]');
    saved.push(model);
    localStorage.setItem('doc_models', JSON.stringify(saved));
    alert('✅ Modelo salvo!');
  };

  const _handleUploadModel = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => { setModelFile(file); alert('✅ Modelo carregado!'); };
      reader.readAsArrayBuffer(file);
    }
  };

  const _handleGenerateDocx = async () => {
    if (!modelFile) { alert('⚠️ Carregue um modelo .docx!'); return; }
    try {
      const handler = new TemplateHandler();
      const doc = await handler.process(modelFile, formData);
      saveAs(doc, `${modelName.replace(/\s+/g, '_')}.docx`);
    } catch (error) { alert('❌ Erro: ' + error.message); }
  };

  const insertPlaceholder = (name) => editor?.chain().focus().insertContent(`{{${name}}}`).run();

  // Zoom controls
  const zoomIn = () => setZoom(Math.min(200, zoom + 10));
  const zoomOut = () => setZoom(Math.max(50, zoom - 10));

  if (!editor) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Ribbon Bar */}
      <div className="bg-white border-b shadow-lg no-print flex-shrink-0">
        {/* Title Bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-gradient-to-r from-blue-700 to-blue-900">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 backdrop-blur px-2 py-0.5 rounded">
              <span className="text-white font-semibold text-xs">📄 Editor</span>
            </div>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="bg-white/90 border-0 focus:ring-2 focus:ring-white/50 rounded px-2 py-0.5 text-xs font-medium w-64"
              placeholder="Nome do Modelo"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/80 text-[10px] bg-white/10 px-1.5 py-0.5 rounded">📋 {placeholders.length}</span>
            <button onClick={handleSaveModel} className="flex items-center gap-1.5 px-3 py-0.5 bg-white text-blue-700 rounded text-xs font-semibold hover:bg-blue-50">
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>

        {/* Tabs + Toolbar integrated */}
        {mode === 'edit' ? (
          <div className="flex items-center gap-0.5 px-3 py-1 bg-gray-50 border-t">
            {/* Mode Tabs */}
            <div className="flex items-center gap-0.5 pr-2 border-r">
              <button
                onClick={() => setMode('edit')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition ${mode === 'edit' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                title="Editar"
              >
                <Pencil size={14} />
                <span className="text-xs font-medium">Editar</span>
              </button>
              <button
                onClick={() => setMode('preview')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition ${mode === 'preview' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                title="Visualizar"
              >
                <Eye size={14} />
                <span className="text-xs font-medium">Visualizar</span>
              </button>
              <button
                onClick={() => setMode('fill')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition ${mode === 'fill' ? 'bg-white text-green-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                title="Preencher"
              >
                <PenTool size={14} />
                <span className="text-xs font-medium">Preencher</span>
              </button>
              <button
                onClick={() => setShowPlaceholdersPanel(!showPlaceholdersPanel)}
                className={`flex items-center gap-1 px-2 py-1 rounded transition ${showPlaceholdersPanel ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
                title="Inserir Campos"
              >
                <Link size={14} />
                <span className="text-xs font-medium">Campos</span>
              </button>
            </div>
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 pr-2 border-r">
              <button onClick={() => editor.chain().focus().undo().run()} className="p-1 hover:bg-gray-200 rounded" title="Desfazer"><Undo size={14} /></button>
              <button onClick={() => editor.chain().focus().redo().run()} className="p-1 hover:bg-gray-200 rounded" title="Refazer"><Redo size={14} /></button>
            </div>
            <div className="flex items-center gap-0.5 px-2 border-r">
              <button onClick={() => editor.chain().focus().toggleBold().run()} className="p-1 hover:bg-gray-200 rounded font-bold text-xs" title="Negrito">B</button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className="p-1 hover:bg-gray-200 rounded italic text-xs" title="Itálico">I</button>
              <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="p-1 hover:bg-gray-200 rounded underline text-xs" title="Sublinhado">U</button>
            </div>
            <div className="flex items-center gap-0.5 px-2 border-r">
              <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`p-1 hover:bg-gray-200 rounded ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`} title="Esquerda"><AlignLeft size={14} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`p-1 hover:bg-gray-200 rounded ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`} title="Centro"><AlignCenter size={14} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`p-1 hover:bg-gray-200 rounded ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`} title="Direita"><AlignRight size={14} /></button>
              <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`p-1 hover:bg-gray-200 rounded ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}`} title="Justificar"><AlignJustify size={14} /></button>
            </div>
            <div className="flex items-center gap-0.5 px-2 border-r">
              <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-1 hover:bg-gray-200 rounded ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`} title="Lista"><List size={14} /></button>
              <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-1 hover:bg-gray-200 rounded ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`} title="Numeração"><ListOrdered size={14} /></button>
            </div>
            <div className="flex items-center gap-0.5 px-2">
              <button onClick={() => { const url = prompt('URL:'); if(url) editor.chain().focus().setImage({ src: url }).run(); }} className="p-1 hover:bg-gray-200 rounded" title="Imagem"><ImageIcon size={14} /></button>
            </div>
            <div className="flex items-center gap-1 ml-auto mr-2">
              <button onClick={zoomOut} className="p-1 hover:bg-gray-200 rounded" title="Diminuir"><ZoomOut size={12} /></button>
              <span className="text-xs font-medium w-10 text-center">{zoom}%</span>
              <button onClick={zoomIn} className="p-1 hover:bg-gray-200 rounded" title="Aumentar"><ZoomIn size={12} /></button>
            </div>
          </div>
        ) : (
          /* Non-edit mode - just tabs */
          <div className="flex items-center gap-0.5 px-3 py-1 bg-gray-50 border-t">
            <button
              onClick={() => setMode('edit')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-t transition ${mode === 'edit' ? 'bg-white text-blue-700 border-t-2 border-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Pencil size={14} /> Editor
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-t transition ${mode === 'preview' ? 'bg-white text-blue-700 border-t-2 border-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Eye size={14} /> Visualizar
            </button>
            <button
              onClick={() => setMode('fill')}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-t transition ${mode === 'fill' ? 'bg-white text-green-700 border-t-2 border-green-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <PenTool size={14} /> Preencher
            </button>
            <button
              onClick={() => setShowPlaceholdersPanel(!showPlaceholdersPanel)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-t transition ${showPlaceholdersPanel ? 'bg-white text-purple-700 border-t-2 border-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Link size={14} /> Campos
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area - Split Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className={`flex-1 overflow-auto bg-gray-300 flex justify-center p-4 transition-all duration-300 ${showPlaceholdersPanel ? 'basis-[calc(100%-400px)]' : ''}`}>
          <div 
            className="transition-all duration-300 shadow-2xl"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              width: showPlaceholdersPanel ? 'calc(210mm * 0.78)' : '210mm',
              minHeight: '297mm',
            }}
          >
            <div ref={contentRef} className="bg-white" style={{ width: '100%', minHeight: '297mm', padding: showPlaceholdersPanel ? '15mm' : '20mm' }}>
              {mode === 'edit' ? (
                <EditorContent editor={editor} />
              ) : mode === 'preview' ? (
                <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
              ) : (
                <div>
                  <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
                  {placeholders.length > 0 && (
                    <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg no-print">
                      <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2 text-sm">
                        <FileText size={16} /> Preencher ({placeholders.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {placeholders.map(ph => (
                          <div key={ph}>
                            <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">{ph.replace(/_/g, ' ')}</label>
                            <input
                              type="text"
                              value={formData[ph] || ''}
                              onChange={(e) => setFormData({ ...formData, [ph]: e.target.value })}
                              className="w-full px-2 py-1.5 text-sm border border-green-300 rounded focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Placeholders Panel - Reduced width */}
        {showPlaceholdersPanel && (
          <div className="w-[365px] bg-white border-l shadow-2xl no-print flex flex-col flex-shrink-0">
            {/* Header */}
            <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-white">🔗 Inserir Campos</h3>
                <p className="text-xs text-purple-100">Clique para inserir</p>
              </div>
              <button onClick={() => setShowPlaceholdersPanel(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition text-white" title="Fechar">
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* System */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold">SISTEMA</span>
                </div>
                <div className="space-y-2">
                  {SYSTEM_PLACEHOLDERS.map(ph => (
                    <button
                      key={ph.name}
                      onClick={() => insertPlaceholder(ph.name)}
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-lg transition-all group hover:shadow-md"
                    >
                      <span className="text-sm font-medium text-gray-800">{ph.icon} {ph.label}</span>
                      <code className="text-xs bg-white px-2 py-1 rounded text-blue-700 font-mono group-hover:bg-blue-50">{`{{${ph.name}}}`}</code>
                    </button>
                  ))}
                </div>
              </div>

              {/* Client */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">CLIENTE</span>
                </div>
                <div className="space-y-2">
                  {CLIENT_PLACEHOLDERS.map(ph => (
                    <button
                      key={ph.name}
                      onClick={() => insertPlaceholder(ph.name)}
                      className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-lg transition-all group hover:shadow-md"
                    >
                      <span className="text-sm font-medium text-gray-800">{ph.icon} {ph.label}</span>
                      <code className="text-xs bg-white px-2 py-1 rounded text-green-700 font-mono group-hover:bg-green-50">{`{{${ph.name}}}`}</code>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar - Compacto */}
      <footer className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-3 py-1 text-[10px] no-print flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span>📄 A4 (210×297mm)</span>
            <span>📋 {placeholders.length} campos</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Zoom: {zoom}%</span>
            <span>● Salvo</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
