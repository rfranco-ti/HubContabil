import { useEffect, useState } from 'react';
import { useEditor as useTipTapEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

export const useTipTap = (initialContent, onChange) => {
  const [content, setContent] = useState(initialContent);

  const editor = useTipTapEditor({
    extensions: [StarterKit],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[40px]',
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent !== content) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  return { editor, content };
};

export default useTipTap;
