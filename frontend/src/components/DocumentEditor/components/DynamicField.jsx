import React from 'react';
import { useNode } from '@craftjs/core';

/**
 * DynamicField - Componente compatível com React 19 + Craft.js
 * ✅ Usa React.forwardRef (OBRIGATÓRIO)
 */
export const DynamicField = React.forwardRef(({ field, placeholder, fontSize, fontWeight, color, ...props }, ref) => {
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
      className={`relative inline-block px-2 py-1 rounded border-2 transition-all ${
        selected
          ? 'border-primary-500 bg-primary-50'
          : 'border-dashed border-slate-300 hover:border-primary-300'
      }`}
      style={{
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight,
        color: color,
      }}
      {...props}
    >
      <span className="text-primary-600 font-mono">{placeholder || `{{${field}}}`}</span>
      
      {selected && (
        <div className="absolute -top-8 left-0 bg-primary-600 text-white text-xs px-2 py-1 rounded shadow-lg">
          Campo: {field}
        </div>
      )}
    </div>
  );
});

DynamicField.craft = {
  displayName: 'DynamicField',
  props: {
    field: 'campo',
    placeholder: '{{campo}}',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
  },
};

export default DynamicField;
