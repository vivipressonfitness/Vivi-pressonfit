import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const styles: Record<Variant, string> = {
  primary: 'bg-accent hover:bg-accent-hover text-white font-bold',
  outline: 'border border-accent text-accent hover:bg-accent/10 font-semibold',
  ghost: 'text-text-secondary hover:text-text-primary',
  danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold',
};

export function Button({ variant = 'primary', loading, disabled, className = '', children, ...rest }: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={`rounded-pill px-6 py-3 transition disabled:opacity-50 ${styles[variant]} ${className}`}
      {...rest}
    >
      {loading ? 'Cargando…' : children}
    </button>
  );
}
