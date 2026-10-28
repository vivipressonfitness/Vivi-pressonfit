import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const styles: Record<Variant, string> = {
  primary: 'bg-accent hover:bg-accent-hover text-background font-bold shadow-md shadow-accent/20',
  secondary: 'bg-surface border border-border hover:border-accent/40 text-text-primary hover:text-white font-semibold',
  outline: 'border border-accent text-accent hover:bg-accent/10 font-semibold',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5',
  danger: 'bg-red-600 hover:bg-red-700 text-white font-semibold',
};

// F-10: Botón unificado del sistema de diseño (contraste WCAG 2.2 AA, touch targets >= 44px)
export function Button({
  variant = 'primary',
  loading,
  disabled,
  className = '',
  children,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`rounded-pill px-6 py-3 min-h-[44px] inline-flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...rest}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Cargando…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
