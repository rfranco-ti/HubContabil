import { useEditor } from '@craftjs/core';
import { X } from 'lucide-react';

export default function PropsPanel() {
  const { actions, selected } = useEditor((state) => {
    const [selectedNodeId] = state.events.selected || [];
    return {
      selected: selectedNodeId ? state.nodes[selectedNodeId] : null,
    };
  });

  if (!selected) {
    return (
      <div className="p-3 border-b border-slate-200 bg-slate-50">
        <h3 className="font-bold text-slate-800 text-xs mb-1">Propriedades</h3>
        <p className="text-xs text-slate-500">
          Selecione um elemento para editar
        </p>
      </div>
    );
  }

  const { fontSize, fontWeight, textAlign, color, field, placeholder, height, width, thickness, margin } = selected.data.props || {};

  return (
    <div className="p-3 border-b border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 text-xs">
          {selected.data.custom.displayName || selected.data.name}
        </h3>
        <button
          onClick={() => actions.clearEvents()}
          className="text-slate-400 hover:text-slate-600"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-2">
        {fontSize !== undefined && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Fonte (px)
            </label>
            <input
              type="number"
              value={fontSize}
              onChange={(e) =>
                actions.setProp(selected.id, (props) => {
                  props.fontSize = parseInt(e.target.value);
                })
              }
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>
        )}

        {fontWeight !== undefined && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Peso
            </label>
            <select
              value={fontWeight}
              onChange={(e) =>
                actions.setProp(selected.id, (props) => {
                  props.fontWeight = e.target.value;
                })
              }
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
            >
              <option value="normal">Normal</option>
              <option value="bold">Negrito</option>
              <option value="300">Light</option>
              <option value="600">Semi-bold</option>
            </select>
          </div>
        )}

        {textAlign !== undefined && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Alinhamento
            </label>
            <div className="flex gap-1">
              {['left', 'center', 'right'].map((align) => (
                <button
                  key={align}
                  onClick={() =>
                    actions.setProp(selected.id, (props) => {
                      props.textAlign = align;
                    })
                  }
                  className={`flex-1 px-1 py-1 text-xs border rounded ${
                    textAlign === align
                      ? 'bg-primary-100 border-primary-500 text-primary-700'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {align[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {color !== undefined && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Cor
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) =>
                actions.setProp(selected.id, (props) => {
                  props.color = e.target.value;
                })
              }
              className="w-full h-6 border border-slate-300 rounded cursor-pointer"
            />
          </div>
        )}

        {height !== undefined && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Altura (px)
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) =>
                actions.setProp(selected.id, (props) => {
                  props.height = parseInt(e.target.value);
                })
              }
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>
        )}

        {width !== undefined && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Largura (px)
            </label>
            <input
              type="number"
              value={width}
              onChange={(e) =>
                actions.setProp(selected.id, (props) => {
                  props.width = parseInt(e.target.value);
                })
              }
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
            />
          </div>
        )}

        {field !== undefined && (
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Campo
            </label>
            <input
              type="text"
              value={field}
              onChange={(e) =>
                actions.setProp(selected.id, (props) => {
                  props.field = e.target.value;
                  props.placeholder = `{{${e.target.value}}}`;
                })
              }
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs"
              placeholder="ex: cliente_nome"
            />
          </div>
        )}
      </div>
    </div>
  );
}
