import { useEditor } from '@craftjs/core';
import { Type, Image, Minus, Square, Tag } from 'lucide-react';

// Sidebar Component
function Sidebar() {
  const { connectors } = useEditor();

  const blocks = [
    {
      name: 'Texto',
      icon: Type,
      description: 'Bloco de texto editável',
      type: 'TextBlock',
      defaultProps: {
        content: 'Texto de exemplo',
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
        color: '#000000',
      },
    },
    {
      name: 'Campo Dinâmico',
      icon: Tag,
      description: 'Placeholder {{campo}}',
      type: 'DynamicField',
      defaultProps: {
        field: 'campo',
        placeholder: '{{campo}}',
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2563eb',
      },
    },
    {
      name: 'Imagem/Logo',
      icon: Image,
      description: 'Upload de imagem',
      type: 'ImageBlock',
      defaultProps: {
        src: null,
        alt: 'Imagem',
        width: 200,
        height: 200,
      },
    },
    {
      name: 'Linha',
      icon: Minus,
      description: 'Divisória horizontal',
      type: 'DividerBlock',
      defaultProps: {
        color: '#e2e8f0',
        thickness: 1,
        margin: 16,
      },
    },
    {
      name: 'Espaçador',
      icon: Square,
      description: 'Espaço vertical',
      type: 'SpacerBlock',
      defaultProps: {
        height: 40,
      },
    },
  ];

  return (
    <div className="w-56 bg-white border-r border-slate-200 overflow-auto flex-shrink-0">
      <div className="p-3 border-b border-slate-100">
        <h2 className="font-bold text-slate-800 text-sm">Blocks</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Arraste para o canvas
        </p>
      </div>
      
      <div className="p-2 space-y-2">
        {blocks.map((block) => {
          const Icon = block.icon;
          
          return (
            <div
              key={block.name}
              ref={(ref) => {
                if (ref) {
                  // Criar elemento React para o block
                  const element = {
                    type: block.type,
                    props: block.defaultProps,
                  };
                  connectors.create(ref, element);
                }
              }}
              className="flex items-start gap-2 p-2 rounded border border-slate-200 hover:border-primary-500 hover:bg-primary-50 cursor-move transition-all group"
            >
              <div className="text-slate-500 group-hover:text-primary-600 transition-colors">
                <Icon size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-xs text-slate-700 group-hover:text-primary-700">
                  {block.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {block.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2 mt-2 border-t border-slate-100">
        <div className="bg-blue-50 border border-blue-200 rounded p-2">
          <p className="text-xs text-blue-700">
            💡 Arraste para o canvas
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente wrapper
export default function EditorContent({ onSaveData }) {
  const { query } = useEditor();

  // Monitorar mudanças nos nodes
  useEditor((state) => {
    if (onSaveData && state.nodes) {
      const nodes = Object.values(state.nodes).map(node => ({
        id: node.id,
        type: node.data?.name,
        props: node.data?.props,
        parent: node.data?.parent,
      }));
      
      if (nodes.length > 0) {
        onSaveData({ nodes, timestamp: Date.now() });
      }
    }
  });

  return <Sidebar />;
}
