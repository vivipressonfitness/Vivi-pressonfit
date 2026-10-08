import type { HTMLAttributes, ReactNode } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...rest }: Props) {
  return (
    <div className={`bg-surface border border-border rounded-2xl p-6 ${className}`} {...rest}>
      {children}
    </div>
  );
}
