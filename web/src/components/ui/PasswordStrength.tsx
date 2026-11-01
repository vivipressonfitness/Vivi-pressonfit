export interface PasswordAnalysis {
  score: number; // 0 a 4
  label: string;
  colorClass: string;
  hasMinLength: boolean;
  hasMixedCase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordAnalysis {
  if (!password) {
    return {
      score: 0,
      label: 'Sin contraseña',
      colorClass: 'bg-zinc-700',
      hasMinLength: false,
      hasMixedCase: false,
      hasNumber: false,
      hasSpecial: false,
    };
  }

  const hasMinLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasMixedCase = hasLower && hasUpper;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (password.length >= 6) score += 1;
  if (hasMinLength) score += 1;
  if (hasNumber && (hasLower || hasUpper)) score += 1;
  if ((hasMixedCase && hasNumber) || (hasMinLength && hasSpecial)) score += 1;

  // Si no tiene mínimo 8 caracteres, el puntaje máximo es 2 (Débil/Aceptable)
  if (!hasMinLength && score > 2) score = 2;

  let label = 'Débil';
  let colorClass = 'bg-red-500';

  if (score === 0 || score === 1) {
    label = 'Muy débil';
    colorClass = 'bg-red-500';
  } else if (score === 2) {
    label = 'Aceptable';
    colorClass = 'bg-amber-400';
  } else if (score === 3) {
    label = 'Buena';
    colorClass = 'bg-emerald-400';
  } else if (score >= 4) {
    label = 'Excelente';
    colorClass = 'bg-accent';
  }

  return {
    score,
    label,
    colorClass,
    hasMinLength,
    hasMixedCase,
    hasNumber,
    hasSpecial,
  };
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const analysis = evaluatePasswordStrength(password);

  return (
    <div className="mt-2 space-y-1.5" aria-live="polite">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-text-secondary">Fortaleza de contraseña:</span>
        <span className={`font-semibold ${
          analysis.score <= 1
            ? 'text-red-400'
            : analysis.score === 2
            ? 'text-amber-400'
            : analysis.score === 3
            ? 'text-emerald-400'
            : 'text-accent'
        }`}>
          {analysis.label}
        </span>
      </div>

      <div
        role="meter"
        aria-label="Fortaleza de la contraseña"
        aria-valuenow={analysis.score}
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuetext={analysis.label}
        className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-surface rounded-full overflow-hidden"
      >
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-colors duration-300 ${
              analysis.score >= step ? analysis.colorClass : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-text-secondary pt-0.5">
        <span className={analysis.hasMinLength ? 'text-emerald-400' : 'text-zinc-500'}>
          {analysis.hasMinLength ? '✓' : '○'} Mínimo 8 caracteres
        </span>
        <span className={analysis.hasNumber ? 'text-emerald-400' : 'text-zinc-500'}>
          {analysis.hasNumber ? '✓' : '○'} Incluye números
        </span>
        <span className={analysis.hasMixedCase || analysis.hasSpecial ? 'text-emerald-400' : 'text-zinc-500'}>
          {analysis.hasMixedCase || analysis.hasSpecial ? '✓' : '○'} Mayúscula o símbolo
        </span>
      </div>
    </div>
  );
}

