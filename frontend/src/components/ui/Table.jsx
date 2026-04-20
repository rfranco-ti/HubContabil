import { cn } from '@/lib/utils';
import { createContext, useContext } from 'react';

const TableConfigContext = createContext({ hoverable: true, zebra: false });

function useTableConfig() {
  return useContext(TableConfigContext);
}

export default function Table({
  children,
  className,
  hoverable = true,
  zebra = false,
  ...props
}) {
  return (
    <TableConfigContext.Provider value={{ hoverable, zebra }}>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <table
          className={cn(
            'w-full text-sm text-left text-slate-700 dark:text-slate-200',
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    </TableConfigContext.Provider>
  );
}

export function TableHeader({ children, className, ...props }) {
  return (
    <thead
      className={cn('bg-slate-50 border-b border-slate-200 dark:bg-slate-900/40 dark:border-slate-800', className)}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }) {
  const { zebra, hoverable } = useTableConfig();
  return (
    <tr
      className={cn(
        'border-b border-slate-200 dark:border-slate-800',
        zebra && 'odd:bg-white even:bg-slate-50 dark:odd:bg-slate-950 dark:even:bg-slate-900/20',
        hoverable && 'hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className, ...props }) {
  return (
    <th className={cn('px-5 py-3.5 font-semibold text-slate-700 dark:text-slate-200', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }) {
  return (
    <td className={cn('px-5 py-4 text-slate-700 dark:text-slate-200', className)} {...props}>
      {children}
    </td>
  );
}
