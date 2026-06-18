import { clsx } from 'clsx';

export type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        {
          'bg-green-100 text-green-800': variant === 'green',
          'bg-yellow-100 text-yellow-800': variant === 'yellow',
          'bg-red-100 text-red-800': variant === 'red',
          'bg-blue-100 text-blue-800': variant === 'blue',
          'bg-gray-100 text-gray-700': variant === 'gray',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
