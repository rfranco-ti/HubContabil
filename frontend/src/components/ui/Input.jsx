import { cn } from '@/lib/utils';

export default function Input({
  label,
  error,
  helperText,
  icon,
  className,
  type = 'text',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'w-full px-4 py-2.5 border rounded-lg text-sm transition-all duration-200',
            'focus:outline-none focus:ring-2',
            icon && 'pl-10',
            error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200 dark:border-red-900/60 dark:focus:ring-red-900/40'
              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200 dark:border-slate-700 dark:focus:ring-blue-900/40',
            'bg-white text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
