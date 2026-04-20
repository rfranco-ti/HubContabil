import React from 'react';
import { useEditor } from '@craftjs/core';
import { Type, Image, Minus, Square, Tag } from 'lucide-react';

/**
 * Sidebar - Craft.js React 19 (Oficial)
 * 
 * ✅ Segue documentação oficial do Craft.js
 * ✅ Usa connectors.create() corretamente
 * ✅ Componentes devem ter forwardRef
 * 
 * Documentação: https://craft.js.org/docs/api/editor-connectors
 */

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

export default function Sidebar() {
  const { connectors } = useEditor();

  return (
    <div className="w-52 bg-white border-r border-slate-200 overflow-auto flex-shrink-0">
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
            <div key={block.name}>
              {/* 
                ✅ DOCUMENTAÇÃO OFICIAL:
                connectors.create(ref, <Component {...props} />)
                
                O componente DEVE usar React.forwardRef
              */}
              <div
                ref={(ref) => {
                  if (ref) {
                    // Cria o elemento React com o tipo e props corretos
                    const element = React.createElement(block.type, block.defaultProps);
                    connectors.create(ref, element);
                  }
                }}
                className="flex items-start gap-2 p-2 rounded border border-slate-200 hover:border-primary-500 hover:bg-primary-50 cursor-move transition-all group"
              >
                <div className="text-slate-500 group-hover:text-primary-600 transition-colors">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs text-slate-700 group-hover:text-primary-700 truncate">
                    {block.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {block.description}
                  </p>
                </div>
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
