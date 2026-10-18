import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
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
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña');
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
          <div className="space-y-4 text-center">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-400 text-sm">
              <p className="font-semibold mb-1">¡Contraseña actualizada correctamente!</p>
              <p className="text-text-secondary text-xs">
                Redirigiendo al inicio de sesión en unos segundos...
              </p>
            </div>
            <Link to="/login" className="inline-block text-sm text-accent hover:underline font-semibold">
              Iniciar sesión ahora
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <Input
              label="Nueva contraseña (mínimo 6 caracteres)"
              type="password"
              name="newPassword"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirma tu nueva contraseña"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <Button loading={loading} type="submit" className="w-full">
              Guardar nueva contraseña
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

