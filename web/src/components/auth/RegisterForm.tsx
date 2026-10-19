import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useLandingConfig } from '../../hooks/useLandingConfig';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

// Registro: crea la cuenta en Supabase Auth + perfil básico.
// El cobro real ocurre después vía Stripe Checkout (página Membresía).
export function RegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | undefined)?.from;
  const { config } = useLandingConfig();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!acceptedTerms) {
      setError('Debes aceptar los Términos del Servicio y la Política de Privacidad para continuar');
      return;
    }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: fullName.trim() } },
      });

      if (signUpError) {
        if (signUpError.message.toLowerCase().includes('already registered') || signUpError.status === 422) {
          setError('Este correo ya está registrado en el programa (como suscriptor o miembro VIP). Por favor inicia sesión con tu contraseña.');
          return;
        }
        throw signUpError;
      }

      // Supabase devuelve data.user con identities vacío [] si el correo YA existía previamente
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setError('Este correo ya está registrado en el programa (como suscriptor en prueba o miembro VIP). Por favor inicia sesión con tu contraseña.');
        return;
      }

      // Diagnóstico del perfil: el trigger handle_new_user debe crearlo automáticamente.
      let profileOk = false;
      if (data.user) {
        for (const wait of [0, 400, 900]) {
          if (wait) await new Promise((r) => setTimeout(r, wait));
          const { data: prof } = await supabase.from('profiles').select('id').eq('id', data.user.id).maybeSingle();
          if (prof) { profileOk = true; break; }
        }
      }

      if (!data.session) {
        setError(
          profileOk
            ? 'Cuenta creada con éxito. Si no inicia sesión automáticamente, revisa tu correo o inicia sesión.'
            : 'Casi listo: tu cuenta fue creada. Inicia sesión para acceder a tu membresía.'
        );
        return;
      }

      if (!profileOk) {
        setError(
          'La cuenta se creó pero no se generó tu perfil de miembro. Vuelve a intentar en unos segundos o contacta a soporte.'
        );
        setLoading(false);
        return;
      }

      const target = from || '/membresia';
      navigate(target, { state: { justRegistered: true } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo completar el registro';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('user already exists')) {
        setError('Este correo ya está registrado en el programa (como suscriptor en prueba o miembro VIP). Por favor inicia sesión.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-surface max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-1">Únete al Programa</h1>
      <p className="text-sm text-text-secondary mb-6">Membresía Mensual • USD {config.monthly_price || 40}/mes (7 días gratis)</p>

      {from === '/membresia' && (
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
        onChange={(e) => setFullName(e.target.value)}
      />
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
        autoComplete="new-password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label className="flex items-start gap-2.5 text-xs text-text-secondary cursor-pointer my-4 select-none">
        <input
          type="checkbox"
          name="terms"
          required
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
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

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <Button loading={loading} type="submit" className="w-full">Comenzar 7 días de prueba gratis</Button>
      <p className="text-sm text-text-secondary mt-4 text-center">
        ¿Ya eres alumna del programa?{' '}
        <Link to="/login" state={{ from }} className="text-accent font-semibold hover:underline">Inicia sesión</Link>
      </p>
    </form>
  );
}
