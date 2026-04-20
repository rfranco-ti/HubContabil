import { cn } from '@/lib/utils';

export default function Select({
  label,
  error,
  helperText,
  children,
  className,
  size = 'md',
  placeholder = 'Selecione...',
  ...props
}) {
  const sizes = {
    sm: 'select-sm',
    md: 'select-md',
    lg: 'select-lg',
  };

  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-medium">{label}</span>
        </label>
      )}
      <select
        className={cn(
          'select select-bordered w-full',
          sizes[size],
          error && 'select-error',
          className
        )}
        defaultValue=""
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {children}
      </select>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
      {helperText && !error && (
        <label className="label">
          <span className="label-text-alt text-base-content/60">{helperText}</span>
        </label>
      )}
    </div>
  );
}

export function Option({ children, ...props }) {
  return <option {...props}>{children}</option>;
}
