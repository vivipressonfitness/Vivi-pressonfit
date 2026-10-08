import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
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
      console.debug('post-signIn user:', user);
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile, error: profileError } = await import('../../lib/supabase').then(({ supabase }) =>
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      );

      console.debug('post-signIn profile fetch:', profile, profileError);

      if (profileError) {
        throw profileError;
      }

      navigate(profile?.is_admin ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-surface max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-1">Iniciar Sesión</h2>
      <p className="text-sm text-text-secondary mb-6">Accede a tu contenido del mes</p>
      <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Contraseña" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <Button loading={loading} type="submit" className="w-full">Entrar a mi Cuenta</Button>
      <p className="text-sm text-text-secondary mt-4 text-center">
        ¿Aún no eres miembro?{' '}
        <Link to="/registro" className="text-accent font-semibold hover:underline">Inscríbete aquí</Link>
      </p>
    </form>
  );
}
