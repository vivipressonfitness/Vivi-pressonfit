import type { InputHTMLAttributes, KeyboardEvent } from 'react';
import { useId, useState } from 'react';
import { EyeIcon, EyeOffIcon } from './Icons';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  type = 'text',
  className = '',
  showPasswordToggle,
  onKeyDown,
  onKeyUp,
  onBlur,
  ...rest
}: Props) {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const capsLockId = `${id}-caps`;

  const [visiblePassword, setVisiblePassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  const isPassword = type === 'password';
  const canToggle = isPassword && (showPasswordToggle ?? true);
  const effectiveType = isPassword && visiblePassword ? 'text' : type;

  const handleKeyModifier = (e: KeyboardEvent<HTMLInputElement>) => {
    if (isPassword && e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  const describedByIds = [
    error ? errorId : null,
    helperText ? helperId : null,
    isCapsLockOn ? capsLockId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={effectiveType}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByIds}
          onKeyDown={(e) => {
            handleKeyModifier(e);
            onKeyDown?.(e);
          }}
          onKeyUp={(e) => {
            handleKeyModifier(e);
            onKeyUp?.(e);
          }}
          onBlur={(e) => {
            setIsCapsLockOn(false);
            onBlur?.(e);
          }}
          className={`w-full bg-background border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent ${
            canToggle ? 'pr-11' : ''
          } ${error ? 'border-red-500' : 'border-border'} ${className}`}
          {...rest}
        />

        {canToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setVisiblePassword((prev) => !prev)}
            aria-label={visiblePassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visiblePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary focus:outline-none focus:text-accent p-1.5 rounded-lg transition"
          >
            {visiblePassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Alerta de bloqueo de mayúsculas */}
      {isCapsLockOn && (
        <p id={capsLockId} role="status" className="text-amber-400 text-xs mt-1.5 flex items-center gap-1.5">
          <span>⚠️</span> Bloq Mayús está activado
        </p>
      )}

      {/* Texto de ayuda o instrucción */}
      {helperText && !error && (
        <p id={helperId} className="text-text-secondary text-xs mt-1">
          {helperText}
        </p>
      )}

      {/* Mensaje de error accesible */}
      {error && (
        <p id={errorId} role="alert" className="text-red-400 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
