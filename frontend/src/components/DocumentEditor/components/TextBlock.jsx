import React from 'react';
import { useNode } from '@craftjs/core';

/**
 * TextBlock - Componente compatível com React 19 + Craft.js
 * ✅ Usa React.forwardRef (OBRIGATÓRIO)
 * ✅ Tem displayName definido
 * ✅ Configura craft.props
 */
export const TextBlock = React.forwardRef(({ content, fontSize, fontWeight, textAlign, color, ...props }, ref) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const handleContentChange = (e) => {
    const newContent = e.target.innerText;
    setProp((prop) => (prop.content = newContent));
  };

  return (
    <div
      ref={(dom) => {
        if (dom) {
          connect(drag(dom));
        }
      }}
      className={`relative group p-2 rounded transition-all ${
        selected ? 'ring-2 ring-primary-500 bg-primary-50' : 'hover:bg-slate-50'
      }`}
      style={{
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight,
        textAlign: textAlign,
        color: color,
      }}
      {...props}
    >
      <div
        contentEditable={selected}
        suppressContentEditableWarning
        onBlur={handleContentChange}
        className="outline-none min-h-[20px] cursor-text"
        dangerouslySetInnerHTML={{ __html: content || 'Texto...' }}
      />
      
      {selected && (
        <div className="absolute -top-3 -right-3 bg-primary-600 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
          Editando
        </div>
      )}
    </div>
  );
});

TextBlock.craft = {
  displayName: 'TextBlock',
  props: {
    content: 'Texto de exemplo',
    fontSize: 12,
    fontWeight: 'normal',
    textAlign: 'left',
    color: '#000000',
  },
};

export default TextBlock;
