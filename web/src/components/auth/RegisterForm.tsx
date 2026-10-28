import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useLandingConfig } from '../../hooks/useLandingConfig';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { getAuthErrorDetails } from '../../lib/authErrors';
import type { AuthErrorDetails } from '../../lib/authErrors';
import { formatOfferWithTrial } from '../../lib/offer';

// F-09: Formulario de Registro robusto con validación inline, separación estricta de status/alert y recuperación
export function RegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const initializing = useAuthStore((s) => s.initializing);
  const { config } = useLandingConfig();

  const rawFrom = (location.state as { from?: string } | undefined)?.from;
  const safeFrom = rawFrom && !rawFrom.startsWith('/login') && !rawFrom.startsWith('/registro')
    ? rawFrom
    : (profile?.is_admin ? '/admin' : '/membresia');

  // Redirigir automáticamente si ya está autenticada
  useEffect(() => {
    if (!initializing && user) {
      navigate(safeFrom, { replace: true });
    }
  }, [user, initializing, navigate, safeFrom]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [touched, setTouched] = useState({ fullName: false, email: false, password: false, terms: false });

  const [authError, setAuthError] = useState<AuthErrorDetails | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Validaciones inline
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameError = touched.fullName && (!fullName.trim() || fullName.trim().length < 2)
    ? 'Ingresa tu nombre y apellido completo'
    : undefined;

  const emailError = touched.email && !email.trim()
    ? 'El correo electrónico es obligatorio'
    : touched.email && !emailRegex.test(email.trim())
    ? 'Ingresa una dirección de correo válida'
    : undefined;

  const passwordError = touched.password && (!password || password.length < 6)
    ? 'La contraseña debe tener al menos 6 caracteres'
    : undefined;

  const termsError = touched.terms && !acceptedTerms
    ? 'Debes aceptar los Términos y la Privacidad para continuar'
    : undefined;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: true, terms: true });

    if (fullName.trim().length < 2 || !emailRegex.test(email.trim()) || password.length < 6 || !acceptedTerms) {
      return;
    }

    setLoading(true);
    setAuthError(null);
    setInfoMessage(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: fullName.trim() } },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already registered') || signUpError.status === 422) {
          setAuthError({
            message: 'Este correo electrónico ya está registrado en el programa.',
            action: { label: 'Iniciar sesión con tu cuenta existente →', to: '/login' },
          });
          return;
        }
        throw signUpError;
      }

      // Supabase devuelve identities vacío si el correo ya existía
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setAuthError({
          message: 'Este correo ya pertenece a una cuenta registrada.',
          action: { label: 'Iniciar sesión con tu contraseña →', to: '/login' },
        });
        return;
      }

      // Cargar/hidratar perfil con tolerancia al trigger de Supabase
      if (data.user) {
        await useAuthStore.getState().reloadProfile();
      }

      // Si no hay sesión inmediata (por requerir confirmación por correo)
      if (!data.session) {
        setInfoMessage(
          '¡Cuenta creada con éxito! Si tu cuenta requiere confirmación, revisa tu correo electrónico para activarla e iniciar sesión.'
        );
        return;
      }

      // Con sesión activa, avanzar a la intención original o al checkout de membresía
      const target = rawFrom && !rawFrom.startsWith('/login') && !rawFrom.startsWith('/registro')
        ? rawFrom
        : '/membresia';

      navigate(target, { state: { justRegistered: true }, replace: true });
    } catch (err) {
      setAuthError(getAuthErrorDetails(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-surface max-w-md mx-auto" noValidate>
      <h1 className="text-2xl font-bold mb-1">Únete al Programa</h1>
      <p className="text-sm text-text-secondary mb-6">
        Membresía VIP • {formatOfferWithTrial(config.monthly_price)}
      </p>

      {rawFrom === '/membresia' && (
        <div className="mb-5 rounded-xl border border-accent/40 bg-accent/10 p-3.5 text-accent text-sm">
          <p className="font-semibold">¡Regístrate para activar tus 7 días gratis!</p>
          <p className="text-text-secondary text-xs mt-1">
            Crea tu cuenta en 30 segundos. Luego podrás confirmar tu método de pago con Stripe sin costo alguno hoy.
          </p>
        </div>
      )}

      <Input
        label="Nombre completo"
        name="fullName"
        autoComplete="name"
        required
        value={fullName}
        error={nameError}
        onChange={(e) => {
          setFullName(e.target.value);
          if (authError) setAuthError(null);
        }}
        onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
        placeholder="Tu nombre y apellido"
      />

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
        placeholder="alumna@ejemplo.com"
      />

      <Input
        label="Contraseña"
        type="password"
        name="password"
        autoComplete="new-password"
        required
        minLength={6}
        value={password}
        error={passwordError}
        onChange={(e) => {
          setPassword(e.target.value);
          if (authError) setAuthError(null);
        }}
        onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
        placeholder="Mínimo 6 caracteres"
      />

      <div className="my-4">
        <label className="flex items-start gap-2.5 text-xs text-text-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            name="terms"
            required
            checked={acceptedTerms}
            onChange={(e) => {
              setAcceptedTerms(e.target.checked);
              setTouched((prev) => ({ ...prev, terms: true }));
              if (authError) setAuthError(null);
            }}
            className="mt-0.5 w-4 h-4 rounded border-border accent-accent shrink-0 cursor-pointer"
          />
          <span>
            Confirmo que he leído y acepto los{' '}
            <Link to="/terminos" target="_blank" className="text-accent underline hover:text-accent-hover font-medium">
              Términos del Servicio
            </Link>{' '}
            y la{' '}
            <Link to="/privacidad" target="_blank" className="text-accent underline hover:text-accent-hover font-medium">
              Política de Privacidad
            </Link>.
          </span>
        </label>
        {termsError && (
          <p role="alert" className="text-red-400 text-xs mt-1">
            {termsError}
          </p>
        )}
      </div>

      {/* Mensaje de estado informativo / éxito (role="status", verde esmeralda) */}
      {infoMessage && (
        <div role="status" className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-emerald-300 text-sm space-y-2">
          <p>{infoMessage}</p>
          <Link
            to="/login"
            state={{ from: rawFrom }}
            className="inline-block text-accent font-semibold underline text-xs hover:text-accent-hover"
          >
            Ir a Iniciar Sesión →
          </Link>
        </div>
      )}

      {/* Mensaje de alerta de error con acción de recuperación (role="alert", rojo) */}
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
        Probar 7 días gratis →
      </Button>

      <p className="text-sm text-text-secondary mt-4 text-center">
        ¿Ya eres alumna del programa?{' '}
        <Link to="/login" state={{ from: rawFrom }} className="text-accent font-semibold hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
