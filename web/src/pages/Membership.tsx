import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useStripe } from '../hooks/useStripe';
import { useMembership } from '../hooks/useMembership';
import { useLandingConfig } from '../hooks/useLandingConfig';
import { useMembershipStore } from '../store/membershipStore';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { StatusCard } from '../components/membership/StatusCard';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { formatAuthError } from '../lib/authErrors';
import { formatPrice, formatMonthlyRate } from '../lib/offer';

// Página de MEMBRESÍA — Checkout de 2 columnas de alta conversión (CRO).
// F-08: Un CTA por estado, bloqueo durante hidratación, exclusión de admin.
export default function Membership() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const initializing = useAuthStore((s) => s.initializing);
  const { signIn } = useAuth();
  const { startCheckout, loading: stripeLoading, error: stripeError } = useStripe();
  const { status } = useMembership();
  const membershipLoading = useMembershipStore((s) => s.loading);
  const stripeSubscriptionId = useMembershipStore((s) => s.stripeSubscriptionId);
  const trialEndDate = useMembershipStore((s) => s.trialEndDate);
  const { config } = useLandingConfig();

  // Estados para el formulario inline (cuando !user)
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formInfo, setFormInfo] = useState<string | null>(null);

  const incluye = [
    { title: 'Clases completas bajo demanda', desc: 'GAP, Full Body, Cardio HIIT y Fuerza de 30 a 45 min, sin límite de reproducciones.' },
    { title: 'Rutinas de fuerza 3x por semana', desc: 'Estructuradas para entrenar en casa o gimnasio, con pesos sugeridos y descansos.' },
    { title: 'Guías de nutrición mensuales', desc: 'Educación alimentaria práctica en PDF: recetas, distribución de comidas y tips.' },
    { title: 'Soporte directo por WhatsApp', desc: 'Canal oficial con tu coach para resolver dudas de técnica, postura y progresión.' },
    { title: 'Contenido nuevo cada ciclo', desc: 'Renovación mensual: siempre hay clases, desafíos y material fresco disponible.' },
  ];

  // F-08: Determinar el estado concreto de la usuaria para renderizar el CTA correcto
  const hasStripeSubscription = /^sub_[A-Za-z0-9]+$/.test(stripeSubscriptionId ?? '');

  // Si la usuaria ya tiene una membresía activa o en período de prueba gestionable
  const isManaging =
    Boolean(user) &&
    (status === 'active' || status === 'past_due' || status === 'trial') &&
    hasStripeSubscription;

  // F-08: Admin sin membresía no necesita comprar
  const isAdminWithoutMembership =
    Boolean(user) && Boolean(profile?.is_admin) && !isManaging;

  // F-08: Fecha exacta de cobro legible
  const trialCobro = (() => {
    if (!trialEndDate) return null;
    try {
      return new Date(trialEndDate).toLocaleDateString('es-AR', {
        day: 'numeric', month: 'long', year: 'numeric',
      });
    } catch {
      return null;
    }
  })();

  // Manejo de Registro Inline directo hacia Stripe Checkout
  async function handleInlineRegister(e: FormEvent) {
    e.preventDefault();
    if (!acceptedTerms) {
      setFormError('Debes aceptar los Términos del Servicio y la Política de Privacidad');
      return;
    }
    if (password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setFormLoading(true);
    setFormError(null);
    setFormInfo(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: fullName.trim() } },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already registered') || signUpError.status === 422) {
          setFormError('Este correo ya está registrado. Inicia sesión para activar tu membresía.');
          setAuthMode('login');
          return;
        }
        throw signUpError;
      }

      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setFormError('Este correo ya está registrado. Inicia sesión con tu contraseña.');
        setAuthMode('login');
        return;
      }

      // Si inició sesión automáticamente, lanzamos Stripe de inmediato
      if (data.session) {
        await startCheckout();
      } else {
        setFormInfo('¡Cuenta creada con éxito! Inicia sesión para continuar al checkout de Stripe.');
        setAuthMode('login');
      }
    } catch (err) {
      setFormError(formatAuthError(err));
    } finally {
      setFormLoading(false);
    }
  }

  // Manejo de Login Inline directo hacia Stripe Checkout
  async function handleInlineLogin(e: FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormInfo(null);

    try {
      await signIn(email.trim().toLowerCase(), password);
      // Tras login exitoso, lanzamos Stripe Checkout directamente
      await startCheckout();
    } catch (err) {
      setFormError(formatAuthError(err));
    } finally {
      setFormLoading(false);
    }
  }

  // F-08: Renderizar la columna 2 (CTA) según el estado concreto de la usuaria
  function renderCheckoutColumn() {
    // — Estado: Hidratando perfil/membresía —
    if (initializing || (user && membershipLoading)) {
      return (
        <div className="card-surface p-6 sm:p-8 border border-border space-y-4">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-white/10 rounded w-1/3" />
            <div className="h-6 bg-white/10 rounded w-2/3" />
            <div className="h-3 bg-white/10 rounded w-full" />
            <div className="h-3 bg-white/10 rounded w-4/5" />
            <div className="h-12 bg-white/10 rounded-xl w-full" />
          </div>
          <p className="text-xs text-text-secondary text-center">Verificando tu cuenta…</p>
        </div>
      );
    }

    // — Estado: Admin sin membresía —
    if (isAdminWithoutMembership) {
      return (
        <div className="card-surface p-6 sm:p-8 border border-accent/40 space-y-5">
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-accent font-bold">Administradora</span>
            <h3 className="text-xl font-bold text-white">
              Hola, {profile?.full_name || user?.email?.split('@')[0]}
            </h3>
            <p className="text-xs text-text-secondary">
              Tu cuenta tiene acceso de administradora al contenido completo y al panel de gestión. No necesitas una suscripción de pago.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/admin"
              className="btn-accent text-center !py-3 font-bold flex-1 inline-flex items-center justify-center min-h-[48px]"
            >
              Ir al Panel de Admin
            </Link>
            <Link
              to="/dashboard"
              className="text-center text-sm font-semibold text-accent border border-accent/30 rounded-xl px-4 py-3 hover:bg-accent/10 transition-colors flex-1 inline-flex items-center justify-center min-h-[48px]"
            >
              Ver Dashboard
            </Link>
          </div>
        </div>
      );
    }

    // — Estado: Usuaria con sesión y estado conocido —
    if (user && status) {
      // Trial con suscripción de Stripe → gestionable
      if (status === 'trial' && hasStripeSubscription) {
        return (
          <div className="card-surface p-6 sm:p-8 border border-sky-500/40 space-y-5">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-sky-400 font-bold">Prueba Gratuita Activa</span>
              <h3 className="text-xl font-bold text-white">
                Hola, {profile?.full_name || user.email?.split('@')[0]}
              </h3>
              <p className="text-xs text-text-secondary">
                Ya estás disfrutando la prueba gratuita con acceso completo a todo el contenido.
              </p>
            </div>

            <StatusCard />

            {trialCobro && (
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-xs text-text-secondary leading-relaxed">
                <p>
                  <strong className="text-sky-400">Tu primer cobro será el {trialCobro}.</strong>{' '}
                  Si prefieres no continuar, cancela antes de esa fecha desde el portal de Stripe y no se realizará ningún cargo.
                </p>
              </div>
            )}

            <Link
              to="/dashboard"
              className="btn-accent w-full text-center !py-3.5 text-base font-bold shadow-lg shadow-accent/30 inline-flex items-center justify-center min-h-[48px]"
            >
              Ir a entrenar →
            </Link>
          </div>
        );
      }

      // Trial sin suscripción de Stripe → debe completar checkout
      if (status === 'trial' && !hasStripeSubscription) {
        return (
          <div className="card-surface p-6 sm:p-8 border border-accent/40 shadow-2xl relative overflow-hidden space-y-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-accent font-bold">Completa tu suscripción</span>
              <h3 className="text-xl font-bold text-white">
                Hola, {profile?.full_name || user.email?.split('@')[0]}
              </h3>
              <p className="text-xs text-text-secondary">
                Estás en la prueba gratuita. Registra tu método de pago para conservar el acceso completo cuando finalice.
              </p>
            </div>

            <StatusCard />

            {stripeError && <p role="alert" className="text-red-400 text-xs text-center">{stripeError}</p>}

            <Button
              loading={stripeLoading}
              onClick={startCheckout}
              className="w-full !py-3.5 text-base font-bold shadow-lg shadow-accent/30"
            >
              Registrar método de pago →
            </Button>

            <p className="text-xs text-text-secondary text-center leading-relaxed">
              $0.00 hoy. Al terminar tu prueba se renovará a {formatMonthlyRate(config.monthly_price)}. Cancela cuando quieras.
            </p>
          </div>
        );
      }

      // Activa o pago vencido con suscripción → ya gestionable (no se llega aquí normalmente, pero por seguridad)
      if ((status === 'active' || status === 'past_due') && hasStripeSubscription) {
        // Este caso lo cubre isManaging → renderizado arriba como vista de gestión
        return null;
      }

      // Cancelada → reactivación
      if (status === 'canceled') {
        return (
          <div className="card-surface p-6 sm:p-8 border border-accent/40 shadow-2xl relative overflow-hidden space-y-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-red-400 font-bold">Suscripción Cancelada</span>
              <h3 className="text-xl font-bold text-white">
                Hola, {profile?.full_name || user.email?.split('@')[0]}
              </h3>
              <p className="text-xs text-text-secondary">
                Tu suscripción fue cancelada. Reactiva tu membresía para volver a acceder a todo el contenido.
              </p>
            </div>

            <StatusCard />

            {stripeError && <p role="alert" className="text-red-400 text-xs text-center">{stripeError}</p>}

            <Button
              loading={stripeLoading}
              onClick={startCheckout}
              className="w-full !py-3.5 text-base font-bold shadow-lg shadow-accent/30"
            >
              Reactivar membresía — {formatMonthlyRate(config.monthly_price)} →
            </Button>

            <p className="text-xs text-text-secondary text-center leading-relaxed">
              Se creará una nueva suscripción con 7 días de prueba sin costo.
            </p>
          </div>
        );
      }

      // Expirada → nueva suscripción
      if (status === 'expired') {
        return (
          <div className="card-surface p-6 sm:p-8 border border-accent/40 shadow-2xl relative overflow-hidden space-y-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Prueba Finalizada</span>
              <h3 className="text-xl font-bold text-white">
                Hola, {profile?.full_name || user.email?.split('@')[0]}
              </h3>
              <p className="text-xs text-text-secondary">
                Tu período de prueba terminó. Suscríbete para seguir entrenando con todo el contenido del ciclo actual.
              </p>
            </div>

            <StatusCard />

            {stripeError && <p role="alert" className="text-red-400 text-xs text-center">{stripeError}</p>}

            <Button
              loading={stripeLoading}
              onClick={startCheckout}
              className="w-full !py-3.5 text-base font-bold shadow-lg shadow-accent/30"
            >
              Suscribirme ahora — {formatMonthlyRate(config.monthly_price)} →
            </Button>

            <p className="text-xs text-text-secondary text-center leading-relaxed">
              Incluye 7 días de prueba sin costo. Cancela cuando quieras.
            </p>
          </div>
        );
      }

      // Inactive con sesión → primer checkout (paso final)
      return (
        <div className="card-surface p-6 sm:p-8 border border-accent/40 shadow-2xl relative overflow-hidden space-y-5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-accent font-bold">Paso Final</span>
            <h3 className="text-xl font-bold text-white">
              Hola, {profile?.full_name || user.email?.split('@')[0]}
            </h3>
            <p className="text-xs text-text-secondary">
              Tu cuenta está lista. Confirma tu método de pago con Stripe para comenzar tus 7 días gratis.
            </p>
          </div>

          <StatusCard />

          {stripeError && <p role="alert" className="text-red-400 text-xs text-center">{stripeError}</p>}

          <Button
            loading={stripeLoading}
            onClick={startCheckout}
            className="w-full !py-3.5 text-base font-bold shadow-lg shadow-accent/30"
          >
            Probar 7 días gratis →
          </Button>

          <p className="text-xs text-text-secondary text-center leading-relaxed">
            $0.00 hoy. Al terminar los 7 días se renovará a {formatMonthlyRate(config.monthly_price)}. Cancela cuando quieras.
          </p>
        </div>
      );
    }

    // — Sin sesión: formulario de registro/login inline —
    return (
      <div className="card-surface p-6 sm:p-8 border border-accent/40 shadow-2xl relative overflow-hidden space-y-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

        {/* Selector de modo (Registro vs Login) */}
        <div className="flex border border-border rounded-xl p-1 bg-background/50" role="group" aria-label="Tipo de acceso">
          <button
            type="button"
            aria-pressed={authMode === 'register'}
            onClick={() => { setAuthMode('register'); setFormError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMode === 'register'
                ? 'bg-accent text-background shadow-md'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Nueva Alumna
          </button>
          <button
            type="button"
            aria-pressed={authMode === 'login'}
            onClick={() => { setAuthMode('login'); setFormError(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              authMode === 'login'
                ? 'bg-accent text-background shadow-md'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Ya tengo cuenta
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white">
            {authMode === 'register' ? 'Activa tus 7 días gratis' : 'Ingresa a tu cuenta'}
          </h3>
          <p className="text-xs text-text-secondary">
            {authMode === 'register'
              ? 'Crea tu cuenta y continúa a la pasarela segura de Stripe.'
              : 'Inicia sesión con tu correo y contraseña.'}
          </p>
        </div>

        {formInfo && (
          <div role="status" className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs">
            {formInfo}
          </div>
        )}

        {authMode === 'register' ? (
          /* Formulario de Registro Inline */
          <form onSubmit={handleInlineRegister} className="space-y-4">
            <Input
              label="Nombre completo"
              name="fullName"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu nombre y apellido"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />

            <label className="flex items-start gap-2.5 text-xs text-text-secondary cursor-pointer pt-1 select-none">
              <input
                type="checkbox"
                name="terms"
                required
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border accent-accent shrink-0 cursor-pointer"
              />
              <span>
                Acepto los{' '}
                <Link to="/terminos" target="_blank" className="text-accent underline font-medium">
                  Términos
                </Link>{' '}
                y la{' '}
                <Link to="/privacidad" target="_blank" className="text-accent underline font-medium">
                  Privacidad
                </Link>.
              </span>
            </label>

            {formError && <p role="alert" className="text-red-400 text-xs">{formError}</p>}
            {stripeError && <p role="alert" className="text-red-400 text-xs">{stripeError}</p>}

            <Button
              loading={formLoading || stripeLoading}
              type="submit"
              className="w-full !py-3.5 text-base font-bold shadow-lg shadow-accent/30"
            >
              Probar 7 días gratis →
            </Button>

            <p className="text-xs text-text-secondary text-center leading-relaxed">
              $0.00 cobrados hoy. Stripe validará tu tarjeta de forma segura sin coste durante 7 días.
            </p>
          </form>
        ) : (
          /* Formulario de Login Inline */
          <form onSubmit={handleInlineLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
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

            <div className="flex justify-end -mt-2">
              <Link to="/recuperar" className="text-xs text-text-secondary hover:text-accent transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {formError && <p role="alert" className="text-red-400 text-xs">{formError}</p>}
            {stripeError && <p role="alert" className="text-red-400 text-xs">{stripeError}</p>}

            <Button
              loading={formLoading || stripeLoading}
              type="submit"
              className="w-full !py-3.5 text-base font-bold shadow-lg shadow-accent/30"
            >
              Iniciar Sesión y Continuar →
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Vista simplificada para miembros que ya gestionan su plan */}
      {isManaging ? (
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-1 text-left">
            <span className="inline-block bg-accent/10 border border-accent/30 text-accent px-4 py-1.5 rounded-full font-semibold tracking-widest uppercase text-xs">
              Mi Plan
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">
              Gestión de tu Membresía
            </h1>
            <p className="text-text-secondary">
              Revisa el estado de tu cuenta o actualiza tu método de pago con Stripe.
            </p>
          </div>

          <StatusCard />

          <Card id="incluye">
            <h2 className="font-bold text-lg mb-4 text-white">Beneficios incluidos en tu membresía</h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {incluye.map(({ title, desc }) => (
                <li key={title} className="flex gap-3 items-start">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-accent/15 text-accent flex items-center justify-center text-sm font-bold">
                    ✓
                  </span>
                  <div>
                    <p className="font-semibold text-text-primary">{title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <div className="text-center text-sm text-text-secondary pt-4">
            <Link to="/dashboard" className="text-accent hover:underline font-semibold">
              ← Ir a mi Dashboard de entrenamientos
            </Link>
          </div>
        </div>
      ) : (
        /* VISTA CHECKOUT EN 2 COLUMNAS (Para visitantes y alumnas sin membresía activa) */
        <div className="space-y-8">
          {/* Header Superior */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/30 text-accent px-4 py-1.5 rounded-full font-semibold tracking-widest uppercase text-xs shadow-sm">
              <span>✦</span> Membresía VIP • 7 Días de Prueba Gratis
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Todo lo que viste gratis, ahora <span className="text-accent">completo</span>
            </h1>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              Únete hoy con 7 días de prueba sin costo. Accede al catálogo completo de clases, rutinas de fuerza 3x por semana y guías mensuales de nutrición.
            </p>
          </div>

          {/* Cuadrícula de 2 Columnas */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* COLUMNA 1: Resumen de Valor, Garantía y Comparativa (7 columnas) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Tarjeta de Resumen de la Oferta */}
              <div className="card-surface p-6 sm:p-8 space-y-6 border border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
                  <div>
                    <h2 className="text-xl font-bold text-white">Programa Integral VIVIPRESSONFIT</h2>
                    <p className="text-xs text-text-secondary mt-0.5">Acceso ilimitado mensual renovado cada ciclo</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-3xl font-black text-accent tracking-tight">
                      {formatPrice(config.monthly_price)}
                    </span>
                    <span className="text-xs text-text-secondary block">/mes (tras los 7 días gratis)</span>
                  </div>
                </div>

                {/* Lista de beneficios */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-accent">Lo que obtienes inmediatamente:</h3>
                  <ul className="space-y-3.5">
                    {incluye.map(({ title, desc }) => (
                      <li key={title} className="flex gap-3 items-start">
                        <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </span>
                        <div>
                          <strong className="text-sm text-text-primary font-semibold block">{title}</strong>
                          <span className="text-xs text-text-secondary leading-relaxed">{desc}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Garantía de Transparencia y Cancelación */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-1.5 text-xs text-text-secondary leading-relaxed">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8Z" />
                    </svg>
                    <span>Garantía de Cancelación en 1 Clic</span>
                  </div>
                  <p>
                    <strong>$0.00 a pagar hoy.</strong> Tendrás 7 días para disfrutar la plataforma. Si antes de que finalice la prueba decides que no es para ti, cancelas desde tu perfil y no se realizará ningún cargo.
                  </p>
                </div>
              </div>

              {/* Comparativa Adelanto vs. Membresía */}
              <div className="card-surface p-6 sm:p-7 space-y-4 border border-border">
                <h3 className="text-base font-bold text-white">Adelanto gratuito vs. Membresía completa</h3>
                <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                  <div className="space-y-2 p-3 rounded-xl bg-white/[0.02] border border-border/40">
                    <p className="font-bold text-text-secondary uppercase tracking-wider text-xs">Portal Público</p>
                    <ul className="space-y-1.5 text-text-secondary">
                      <li className="flex items-center gap-1.5"><span className="text-emerald-400">✓</span> Muestras de 1-2 min</li>
                      <li className="flex items-center gap-1.5"><span className="text-red-400">✗</span> Sin rutinas completas</li>
                      <li className="flex items-center gap-1.5"><span className="text-red-400">✗</span> Sin guías de nutrición</li>
                      <li className="flex items-center gap-1.5"><span className="text-red-400">✗</span> Sin soporte por WhatsApp</li>
                    </ul>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl bg-accent/10 border border-accent/30">
                    <p className="font-bold text-accent uppercase tracking-wider text-xs">Membresía VIP</p>
                    <ul className="space-y-1.5 text-text-primary">
                      <li className="flex items-center gap-1.5"><span className="text-accent font-bold">✓</span> Clases completas HD</li>
                      <li className="flex items-center gap-1.5"><span className="text-accent font-bold">✓</span> Rutinas de fuerza 3x</li>
                      <li className="flex items-center gap-1.5"><span className="text-accent font-bold">✓</span> Guías en PDF del mes</li>
                      <li className="flex items-center gap-1.5"><span className="text-accent font-bold">✓</span> WhatsApp directo de Vivi</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMNA 2: CTA contextual por estado de la usuaria (5 columnas) */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start space-y-4">
              {renderCheckoutColumn()}

              {/* Medios de Pago y Seguridad */}
              <div className="flex items-center justify-center gap-3 text-xs text-text-secondary pt-1">
                <span>🔒 Pagos cifrados con Stripe</span>
                <span>•</span>
                <span>Cancela cuando quieras</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-text-secondary pt-8">
            <Link to="/" className="hover:text-accent transition-colors">
              ← Volver al portal de inicio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
