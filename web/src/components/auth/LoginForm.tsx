import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { getAuthErrorDetails } from '../../lib/authErrors';
import type { AuthErrorDetails } from '../../lib/authErrors';

// F-09: Formulario de Login robusto con validación inline, acciones de recuperación y preservación de 'from'
export function LoginForm() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const initializing = useAuthStore((s) => s.initializing);

  const rawFrom = (location.state as { from?: string } | undefined)?.from;
  const safeFrom = rawFrom && !rawFrom.startsWith('/login') && !rawFrom.startsWith('/registro')
    ? rawFrom
    : (profile?.is_admin ? '/admin' : '/dashboard');

  // Redirigir automáticamente si la usuaria ya tiene sesión activa
  useEffect(() => {
    if (!initializing && user) {
      navigate(safeFrom, { replace: true });
    }
  }, [user, initializing, navigate, safeFrom]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const [authError, setAuthError] = useState<AuthErrorDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // Validaciones inline
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailError = touched.email && !email.trim()
    ? 'El correo electrónico es obligatorio'
    : touched.email && !emailRegex.test(email.trim())
    ? 'Ingresa un formato de correo válido (ej: nombre@correo.com)'
    : undefined;

  const passwordError = touched.password && !password
    ? 'Ingresa tu contraseña'
    : undefined;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!emailRegex.test(email.trim()) || !password) {
      return;
    }

    setLoading(true);
    setAuthError(null);

    try {
      await signIn(email.trim().toLowerCase(), password);

      const { user: authedUser, reloadProfile } = useAuthStore.getState();
      if (!authedUser) {
        navigate('/login');
        return;
      }

      // Cargar perfil actualizado
      const prof = await reloadProfile();
      const destination = rawFrom && !rawFrom.startsWith('/login') && !rawFrom.startsWith('/registro')
        ? rawFrom
        : (prof?.is_admin ? '/admin' : '/dashboard');

      navigate(destination, { replace: true });
    } catch (err) {
      setAuthError(getAuthErrorDetails(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-surface max-w-md mx-auto" noValidate>
      <h1 className="text-2xl font-bold mb-1">Iniciar Sesión</h1>
      <p className="text-sm text-text-secondary mb-6">Accede a tu contenido del mes</p>

      {rawFrom === '/membresia' && (
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
        error={emailError}
        onChange={(e) => {
          setEmail(e.target.value);
          if (authError) setAuthError(null);
        }}
        onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
        placeholder="tu@email.com"
      />

      <Input
        label="Contraseña"
        type="password"
        name="password"
        autoComplete="current-password"
        required
        value={password}
        error={passwordError}
        onChange={(e) => {
          setPassword(e.target.value);
          if (authError) setAuthError(null);
        }}
        onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
        placeholder="Tu contraseña"
      />

      <div className="flex justify-end -mt-2 mb-4">
        <Link
          to="/recuperar"
          className="text-xs text-text-secondary hover:text-accent transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      {authError && (
        <div role="alert" className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-red-300 text-sm space-y-2">
          <p>{authError.message}</p>
          {authError.action && (
            authError.action.isExternal ? (
              <a
                href={authError.action.to}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-semibold text-accent underline underline-offset-2 hover:text-accent-hover"
              >
                {authError.action.label}
              </a>
            ) : (
              <Link
                to={authError.action.to}
                state={{ from: rawFrom }}
                className="inline-block text-xs font-semibold text-accent underline underline-offset-2 hover:text-accent-hover"
              >
                {authError.action.label}
              </Link>
            )
          )}
        </div>
      )}

      <Button loading={loading} type="submit" className="w-full">
        Entrar a mi Cuenta
      </Button>

      <p className="text-sm text-text-secondary mt-4 text-center">
        ¿Aún no eres miembro?{' '}
        <Link to="/registro" state={{ from: rawFrom }} className="text-accent font-semibold hover:underline">
          Inscríbete aquí
        </Link>
      </p>
    </form>
  );
}
