import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { formatAuthError } from '../lib/authErrors';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailError = touched && !email.trim()
    ? 'El correo electrónico es obligatorio'
    : touched && !emailRegex.test(email.trim())
    ? 'Ingresa un formato de correo válido (ej: nombre@correo.com)'
    : undefined;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);

    if (!emailRegex.test(email.trim())) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/recuperar-password`,
        }
      );
      if (resetError) throw resetError;
      setSubmitted(true);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="pt-36 pb-20 px-4">
      <div className="card-surface max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-1">Recuperar Contraseña</h1>
        <p className="text-sm text-text-secondary mb-6">
          Ingresa tu correo electrónico registrado y te enviaremos un enlace seguro para restablecer tu contraseña.
        </p>

        {submitted ? (
          <div role="status" className="space-y-4">
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300 text-sm">
              <p className="font-semibold mb-1">¡Correo enviado con éxito!</p>
              <p className="text-text-secondary text-xs leading-relaxed">
                Revisa tu bandeja de entrada en <strong className="text-text-primary">{email}</strong> (y también tu carpeta de spam o correo no deseado). Haz clic en el enlace para definir tu nueva contraseña.
              </p>
            </div>
            <div className="pt-2 text-center">
              <Link to="/login" className="text-sm text-accent hover:underline font-semibold">
                ← Volver a Iniciar Sesión
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <Input
              label="Email registrado"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              error={emailError}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              onBlur={() => setTouched(true)}
              placeholder="ejemplo@correo.com"
            />
            {error && (
              <p role="alert" className="text-red-400 text-sm mb-4">
                {error}
              </p>
            )}
            <Button loading={loading} type="submit" className="w-full">
              Enviar enlace de recuperación
            </Button>
            <p className="text-sm text-text-secondary mt-5 text-center">
              ¿Recordaste tu contraseña?{' '}
              <Link to="/login" className="text-accent font-semibold hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
