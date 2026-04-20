import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';

export default function Alert({
  children,
  variant = 'info',
  className,
  title,
  onClose,
  ...props
}) {
  const variants = {
    info: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      icon: 'text-cyan-600',
      title: 'text-cyan-800',
      text: 'text-cyan-700',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      title: 'text-green-800',
      text: 'text-green-700',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      text: 'text-red-700',
    },
  };

  const icons = {
    info: <Info size={20} />,
    success: <CheckCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    error: <AlertCircle size={20} />,
  };

  const style = variants[variant];

  return (
    <div
      className={cn('p-4 rounded-lg border', style.bg, style.border, className)}
      role="alert"
      {...props}
    >
      <div className="flex items-start gap-3">
        <div className={style.icon}>{icons[variant]}</div>
        <div className="flex-1">
          {title && <h3 className={cn('font-semibold mb-1', style.title)}>{title}</h3>}
          <div className={cn('text-sm', style.text)}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
