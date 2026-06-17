import { type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({ padding = 'md', className, children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={clsx(
        'rounded-xl border border-gray-200 bg-white shadow-sm',
        { 'p-3': padding === 'sm', 'p-5': padding === 'md', 'p-7': padding === 'lg' },
        className
      )}
    >
      {children}
    </div>
  );
}
