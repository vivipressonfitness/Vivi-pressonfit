import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { getAuthErrorDetails } from '../../lib/authErrors';
import type { AuthErrorDetails } from '../../lib/authErrors';
import { supabase } from '../../lib/supabase';

interface SavedTestAccount {
  email: string;
  password: string;
  number: number;
}

// F-09: Formulario de Login robusto con validación inline, acceso rápido de prueba correlativo y recuerdo de credenciales
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
  const [rememberMe, setRememberMe] = useState(true);
  const [savedTestAccount, setSavedTestAccount] = useState<SavedTestAccount | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [authError, setAuthError] = useState<AuthErrorDetails | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar credenciales recordadas o cuenta de prueba guardada al iniciar
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vivifit_remember_login');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.password) setPassword(parsed.password);
        if (typeof parsed.rememberMe === 'boolean') setRememberMe(parsed.rememberMe);
      }
    } catch {}

    try {
      const savedTest = localStorage.getItem('vivifit_saved_test_account');
      if (savedTest) {
        setSavedTestAccount(JSON.parse(savedTest));
      }
    } catch {}
  }, []);

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

  // Lógica del botón automático 1-Click Tester
  async function handleQuickTestLogin(forceNew = false) {
    setTestLoading(true);
    setAuthError(null);

    try {
      let targetEmail = '';
      let targetPassword = 'TestVivi2026!';
      let targetNumber = 1;

      // Si ya tiene una cuenta guardada en este navegador y no forzó "asignarme otra":
      if (savedTestAccount && !forceNew) {
        targetEmail = savedTestAccount.email;
        targetPassword = savedTestAccount.password || 'TestVivi2026!';
        targetNumber = savedTestAccount.number || 1;
      } else {
        // Reclamar correlativo atómico en Supabase RPC
        let claimed = false;
        try {
          const { data: rpcData, error: rpcErr } = await supabase.rpc('claim_next_test_account');
          if (!rpcErr && rpcData && typeof rpcData === 'object') {
            const res = rpcData as { number?: number; email?: string; password?: string };
            targetNumber = res.number || 1;
            targetEmail = res.email || `miembro${String(targetNumber).padStart(2, '0')}@test.vivipressonfit.com`;
            targetPassword = res.password || 'TestVivi2026!';
            claimed = true;
          }
        } catch {
          claimed = false;
        }

        // Fallback local si la función RPC aún no se ha ejecutado en Supabase SQL Editor:
        if (!claimed) {
          const localSeq = parseInt(localStorage.getItem('vivifit_local_test_seq') || '0', 10);
          const nextSeq = (localSeq % 30) + 1;
          localStorage.setItem('vivifit_local_test_seq', String(nextSeq));
          targetNumber = nextSeq;
          targetEmail = `miembro${String(nextSeq).padStart(2, '0')}@test.vivipressonfit.com`;
          targetPassword = 'TestVivi2026!';
        }
      }

      // Recordar en localStorage
      const testObj: SavedTestAccount = {
        email: targetEmail,
        password: targetPassword,
        number: targetNumber,
      };
      localStorage.setItem('vivifit_saved_test_account', JSON.stringify(testObj));
      localStorage.setItem(
        'vivifit_remember_login',
        JSON.stringify({ email: targetEmail, password: targetPassword, rememberMe: true })
      );
      setSavedTestAccount(testObj);
      setEmail(targetEmail);
      setPassword(targetPassword);

      // Intentar inicio de sesión
      try {
        await signIn(targetEmail, targetPassword);
      } catch (signErr) {
        // Si la cuenta aún no existía en auth.users (ej: cuenta > 30 sin RPC activo):
        const { error: signUpErr } = await supabase.auth.signUp({
          email: targetEmail,
          password: targetPassword,
          options: {
            data: { full_name: `Alumna Test ${String(targetNumber).padStart(2, '0')}` },
          },
        });
        if (signUpErr) throw signErr;
        await signIn(targetEmail, targetPassword);

        // Auto-activar suscripción en profiles
        const { data: usr } = await supabase.auth.getUser();
        if (usr?.user?.id) {
          await supabase.from('profiles').update({ plan_status: 'active' }).eq('id', usr.user.id);
        }
      }

      const { reloadProfile } = useAuthStore.getState();
      const prof = await reloadProfile();
      const destination =
        rawFrom && !rawFrom.startsWith('/login') && !rawFrom.startsWith('/registro')
          ? rawFrom
          : prof?.is_admin
          ? '/admin'
          : '/dashboard';

      navigate(destination, { replace: true });
    } catch (err) {
      setAuthError(getAuthErrorDetails(err));
    } finally {
      setTestLoading(false);
    }
  }

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

      // Guardar o eliminar credenciales según checkbox "Recordar mis datos"
      if (rememberMe) {
        localStorage.setItem(
          'vivifit_remember_login',
          JSON.stringify({ email: email.trim(), password, rememberMe: true })
        );
      } else {
        localStorage.removeItem('vivifit_remember_login');
      }

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
      <p className="text-sm text-text-secondary mb-5">Accede a tu contenido del mes</p>

      {/* SECCIÓN ACCESO RÁPIDO DE TESTER (CORRELATIVO 01-30+) */}
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-background to-accent/10 border border-purple-500/30 shadow-inner space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">🧪</span>
            <div>
              <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Modo Tester / Pruebas de Tráfico
              </p>
              <p className="text-[11px] text-text-secondary">
                {savedTestAccount
                  ? `Tienes asignada la cuenta Alumna ${String(savedTestAccount.number).padStart(2, '0')}`
                  : 'Asignación automática correlativa (01 al 30+)'}
              </p>
            </div>
          </div>
          {savedTestAccount && (
            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
              #{String(savedTestAccount.number).padStart(2, '0')}
            </span>
          )}
        </div>

        {savedTestAccount ? (
          <div className="space-y-2">
            <button
              type="button"
              disabled={testLoading || loading}
              onClick={() => handleQuickTestLogin(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {testLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Ingresando con {savedTestAccount.email}…</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>1-Click: Entrar como {savedTestAccount.email}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-text-secondary truncate max-w-[210px]">
                🔑 Clave recordada: <code className="text-accent font-mono">TestVivi2026!</code>
              </span>
              <button
                type="button"
                disabled={testLoading || loading}
                onClick={() => handleQuickTestLogin(true)}
                className="text-purple-300 hover:text-white underline font-semibold transition cursor-pointer"
              >
                🔄 Asignarme otra cuenta
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={testLoading || loading}
            onClick={() => handleQuickTestLogin(false)}
            className="w-full bg-gradient-to-r from-purple-600 to-accent hover:from-purple-500 hover:to-accent-hover text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {testLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Asignando cuenta correlativa y entrando…</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Acceso Rápido 1-Click (Tester Automático)</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="relative flex py-2 items-center mb-4">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-3 text-[11px] text-text-secondary uppercase tracking-wider font-semibold">
          o ingresa con tus credenciales
        </span>
        <div className="flex-grow border-t border-border"></div>
      </div>

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

      <div className="flex items-center justify-between -mt-2 mb-4 text-xs">
        <label className="flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-border bg-surface text-accent focus:ring-accent accent-accent"
          />
          <span>Recordar mis datos</span>
        </label>

        <Link
          to="/recuperar"
          className="text-text-secondary hover:text-accent transition-colors"
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
