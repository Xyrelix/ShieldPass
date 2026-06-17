import { type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  narrow?: boolean;
}

export function PageContainer({ narrow = false, className, children, ...props }: PageContainerProps) {
  return (
    <main
      {...props}
      className={clsx(
        'mx-auto w-full flex-1 px-4 py-10',
        narrow ? 'max-w-lg' : 'max-w-5xl',
        className
      )}
    >
      {children}
    </main>
  );
}
