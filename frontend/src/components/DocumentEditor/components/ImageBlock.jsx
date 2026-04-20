import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import { Image as ImageIcon, Trash2 } from 'lucide-react';

/**
 * ImageBlock - Componente compatível com React 19 + Craft.js
 * ✅ Usa React.forwardRef (OBRIGATÓRIO)
 */
export const ImageBlock = React.forwardRef(({ src, alt, width, height, ...props }, ref) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setProp((prop) => (prop.src = event.target?.result));
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setProp((prop) => (prop.src = null));
  };

  return (
    <div
      ref={ref}
      className={`relative inline-block group ${
        selected ? 'ring-2 ring-primary-500' : ''
      }`}
      style={{ width, height }}
      {...props}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={alt || 'Imagem'}
            className="w-full h-full object-cover"
          />
          
          {selected && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <Trash2 size={14} />
            </button>
          )}
        </>
      ) : (
        <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          ) : (
            <>
              <ImageIcon className="text-slate-400 mb-2" size={32} />
              <span className="text-xs text-slate-500 text-center px-2">
                Clique para upload
              </span>
            </>
          )}
        </label>
      )}
    </div>
  );
});

ImageBlock.craft = {
  displayName: 'ImageBlock',
  props: {
    src: null,
    alt: 'Imagem',
    width: 200,
    height: 200,
  },
};

export default ImageBlock;
