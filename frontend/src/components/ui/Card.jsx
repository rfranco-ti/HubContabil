import { cn } from '@/lib/utils';

export default function Card({
  children,
  className,
  title,
  description,
  actions,
  hover = false,
  ...props
}) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        hover && 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200',
        className
      )}
      {...props}
    >
      {(title || description) && (
        <div className="px-5 pt-5 pb-2">
          {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      )}
      <div className="p-5">
        {children}
        {actions && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
