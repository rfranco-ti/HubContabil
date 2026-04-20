import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export default function Modal({
  children,
  isOpen,
  onClose,
  title,
  className,
  size = 'md',
}) {
  const sizes = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[95vw]',
  };

  if (!isOpen) return null;

  return (
    <dialog className={cn('modal modal-open', className)} open={isOpen}>
      <div className={cn('modal-box', sizes[size])}>
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">{title}</h3>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
              <X size={20} />
            </button>
          </div>
        )}
        {children}
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={onClose}>
              Fechar
            </button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
