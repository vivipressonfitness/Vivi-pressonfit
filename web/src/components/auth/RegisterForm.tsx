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
  const [phone, setPhone] = useState('');
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
        options: { data: { full_name: fullName, phone_number: phone } },
      });
      if (signUpError) throw signUpError;
      if (!data.session) {
        setError('Revisa tu correo para confirmar la cuenta antes de continuar.');
        return;
      }
      // Upsert del perfil (RLS permite insert sobre su propio id por trigger/handle_new_user)
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user!.id,
        email,
        full_name: fullName,
        phone_number: phone,
      });
      if (profileError) console.warn('Perfil no creado aún:', profileError.message);
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
      <Input label="WhatsApp (opcional)" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
