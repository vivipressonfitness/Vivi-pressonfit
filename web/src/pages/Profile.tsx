import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function Profile() {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { changePassword } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone_number ?? '');
  const [newPass, setNewPass] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveData(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone_number: phone })
      .eq('id', profile!.id)
      .select()
      .maybeSingle();
    if (error) setMsg({ ok: false, text: error.message });
    else { setProfile(data); setMsg({ ok: true, text: 'Datos actualizados' }); }
    setSaving(false);
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      await changePassword(newPass);
      setNewPass('');
      setMsg({ ok: true, text: 'Contraseña cambiada' });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Error' });
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-3xl font-extrabold">Mi Perfil</h1>
      {msg && (
        <p className={`text-sm ${msg.ok ? 'text-accent' : 'text-red-400'}`}>{msg.text}</p>
      )}

      <Card>
        <h2 className="font-bold mb-4">Datos personales</h2>
        <form onSubmit={saveData}>
          <Input label="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="WhatsApp" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Input label="Email (no editable)" value={profile?.email ?? ''} disabled />
          <Button loading={saving} type="submit">Guardar datos</Button>
        </form>
      </Card>

      <Card>
        <h2 className="font-bold mb-4">Cambiar contraseña</h2>
        <form onSubmit={savePassword}>
          <Input
            label="Nueva contraseña"
            type="password"
            minLength={6}
            required
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          <Button variant="outline" loading={saving} type="submit">Cambiar contraseña</Button>
        </form>
      </Card>

      {/* Historial de pagos: requiere tabla invoices sincronizada por webhook (opcional). */}
    </div>
  );
}
