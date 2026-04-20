import React from 'react';
import { useNode } from '@craftjs/core';

/**
 * SpacerBlock - Componente compatível com React 19 + Craft.js
 * ✅ Usa React.forwardRef (OBRIGATÓRIO)
 */
export const SpacerBlock = React.forwardRef(({ height, ...props }, ref) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={ref}
      className={`relative group ${
        selected ? 'ring-2 ring-primary-500 bg-primary-50' : 'bg-transparent'
      }`}
      style={{ height: `${height}px`, minHeight: '20px' }}
      {...props}
    >
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <input
            type="range"
            min="10"
            max="200"
            value={height}
            onChange={(e) => setProp((prop) => (prop.height = parseInt(e.target.value)))}
            className="w-32"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="ml-2 text-xs text-slate-600">{height}px</span>
        </div>
      )}
    </div>
  );
});

SpacerBlock.craft = {
  displayName: 'SpacerBlock',
  props: {
    height: 40,
  },
};

export default SpacerBlock;
