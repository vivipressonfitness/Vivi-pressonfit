import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { formatAuthError } from '../lib/authErrors';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordError = touched.password && password.length < 8
    ? 'La nueva contraseña debe tener al menos 8 caracteres'
    : undefined;

  const confirmError = touched.confirmPassword && password !== confirmPassword
    ? 'Las contraseñas no coinciden'
    : undefined;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    if (password.length < 8 || password !== confirmPassword) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });
      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2500);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="pt-36 pb-20 px-4">
      <div className="card-surface max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-1">Nueva Contraseña</h1>
        <p className="text-sm text-text-secondary mb-6">
          Introduce tu nueva contraseña segura para acceder a tu cuenta del programa.
        </p>

        {success ? (
          <div role="status" className="space-y-4 text-center">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300 text-sm">
              <p className="font-semibold mb-1">¡Contraseña actualizada correctamente!</p>
              <p className="text-text-secondary text-xs">
                Redirigiendo al inicio de sesión en unos segundos...
              </p>
            </div>
            <Link to="/login" className="inline-block text-sm text-accent hover:underline font-semibold">
              Iniciar sesión ahora →
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div>
              <Input
                label="Nueva contraseña (mínimo 8 caracteres)"
                type="password"
                name="newPassword"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                error={passwordError}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                placeholder="Introduce tu nueva contraseña"
              />
              {password && <PasswordStrength password={password} />}
            </div>

            <div className="mt-4">
              <Input
                label="Confirma tu nueva contraseña"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                error={confirmError}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, confirmPassword: true }))}
                placeholder="Repite la nueva contraseña"
              />
            </div>

            {error && (
              <p role="alert" className="text-red-400 text-sm mb-4">
                {error}
              </p>
            )}

            <Button loading={loading} type="submit" className="w-full">
              Guardar nueva contraseña
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
