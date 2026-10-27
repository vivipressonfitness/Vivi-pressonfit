import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className = '', ...rest }: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full bg-background border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent ${
          error ? 'border-red-500' : 'border-border'
        } ${className}`}
        {...rest}
      />
      {error && (
        <p id={errorId} role="alert" className="text-red-400 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
