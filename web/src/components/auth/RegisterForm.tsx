import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

// Registro: crea la cuenta en Supabase Auth + perfil básico.
// El cobro real ocurre después vía Stripe Checkout (página Membresía).
export function RegisterForm() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setLoading(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (signUpError) throw signUpError;

      // Diagnóstico del perfil: el trigger handle_new_user debe crearlo automáticamente.
      // Si no existe, es porque el trigger/function no está desplegado en Supabase o falló.
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
            ? 'Revisa tu correo para confirmar la cuenta antes de continuar.'
            : 'Casi listo: revisa tu correo para confirmar la cuenta. (Si tras confirmar no entra, avisa a la administradora: falta el trigger handle_new_user en Supabase.)'
        );
        return;
      }
      if (!profileOk) {
        setError(
          'La cuenta se creó pero no se generó tu perfil de miembro. Vuelve a intentar en unos segundos; si persiste, contacta a la administradora (falta ejecutar web/supabase/schema.sql en Supabase).'
        );
        setLoading(false);
        return;
      }
      // El perfil lo crea automáticamente el trigger handle_new_user (trial 3 días).
      // No se hace upsert manual: la RLS de INSERT solo permite auth.uid()=id y
      // columnas como phone_number no existen en la tabla real.
      navigate('/membresia', { state: { justRegistered: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar el registro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card-surface max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-1">Únete al Programa</h2>
      <p className="text-sm text-text-secondary mb-6">Membresía Mensual • $us. 40.-/mes</p>
      <Input label="Nombre completo" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input label="Contraseña" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
      <Button loading={loading} type="submit" className="w-full">Suscribirme por $us. 40 / mes</Button>
      <p className="text-sm text-text-secondary mt-4 text-center">
        ¿Ya eres alumna del programa?{' '}
        <Link to="/login" className="text-accent font-semibold hover:underline">Inicia sesión</Link>
      </p>
    </form>
  );
}
