import React from 'react';
import { useNode } from '@craftjs/core';

/**
 * DividerBlock - Componente compatível com React 19 + Craft.js
 * ✅ Usa React.forwardRef (OBRIGATÓRIO)
 */
export const DividerBlock = React.forwardRef(({ color, thickness, margin, ...props }, ref) => {
  const {
    connectors: { connect, drag },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  return (
    <div
      ref={ref}
      className={`relative group py-2 ${selected ? 'bg-slate-100' : ''}`}
      style={{ margin: `${margin}px 0` }}
      {...props}
    >
      <hr
        style={{
          borderColor: color,
          borderWidth: `${thickness}px`,
          borderStyle: 'solid',
        }}
      />
    </div>
  );
});

DividerBlock.craft = {
  displayName: 'DividerBlock',
  props: {
    color: '#e2e8f0',
    thickness: 1,
    margin: 16,
  },
};

export default DividerBlock;
