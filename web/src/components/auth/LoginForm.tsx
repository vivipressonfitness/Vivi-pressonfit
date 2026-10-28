import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { formatAuthError } from '../../lib/authErrors';

export function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | undefined)?.from;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);

      const { user } = useAuthStore.getState();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile, error: profileError } = await import('../../lib/supabase').then(({ supabase }) =>
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      );

      if (profileError) {
        throw profileError;
      }

      if (profile) {
        useAuthStore.getState().setProfile(profile);
        const { useMembershipStore } = await import('../../store/membershipStore');
        useMembershipStore.getState().setFromProfile(profile);
      }

      navigate(from || (profile?.is_admin ? '/admin' : '/dashboard'), { replace: true });
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-surface max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-1">Iniciar Sesión</h1>
      <p className="text-sm text-text-secondary mb-6">Accede a tu contenido del mes</p>

      {from === '/membresia' && (
        <div className="mb-5 rounded-xl border border-accent/40 bg-accent/10 p-3.5 text-accent text-sm">
          <p className="font-semibold">¡Estás a un paso de tu membresía VIP!</p>
          <p className="text-text-secondary text-xs mt-1">
            Inicia sesión para continuar con tu suscripción, o si eres nueva alumna{' '}
            <Link to="/registro" state={{ from: '/membresia' }} className="text-accent underline font-semibold">
              regístrate aquí
            </Link>.
          </p>
        </div>
      )}

      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Contraseña"
        type="password"
        name="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="flex justify-end -mt-2 mb-4">
        <Link
          to="/recuperar"
          className="text-xs text-text-secondary hover:text-accent transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {error && <p role="alert" className="text-red-400 text-sm mb-4">{error}</p>}
      <Button loading={loading} type="submit" className="w-full">Entrar a mi Cuenta</Button>
      <p className="text-sm text-text-secondary mt-4 text-center">
        ¿Aún no eres miembro?{' '}
        <Link to="/registro" state={{ from }} className="text-accent font-semibold hover:underline">Inscríbete aquí</Link>
      </p>
    </form>
  );
}
