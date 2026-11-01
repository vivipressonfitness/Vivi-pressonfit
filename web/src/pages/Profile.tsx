import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PasswordStrength } from '../components/ui/PasswordStrength';
import { formatAuthError } from '../lib/authErrors';

export default function Profile() {
  const profile = useAuthStore((s) => s.profile);
  const setProfile = useAuthStore((s) => s.setProfile);
  const { changePassword } = useAuth();

  // 1. Estado y validación de Datos Personales (F-16)
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [dataTouched, setDataTouched] = useState(false);
  const [dataSaving, setDataSaving] = useState(false);
  const [dataMsg, setDataMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // 2. Estado y validación de Cambio de Contraseña (F-16)
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passTouched, setPassTouched] = useState({ newPass: false, confirmPass: false });
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Validaciones inline
  const nameError = dataTouched && fullName.trim().length < 2
    ? 'El nombre debe contener al menos 2 caracteres'
    : undefined;

  const newPassError = passTouched.newPass && newPass.length < 8
    ? 'La contraseña debe tener al menos 8 caracteres'
    : undefined;

  const confirmPassError = passTouched.confirmPass && confirmPass !== newPass
    ? 'Las contraseñas no coinciden'
    : undefined;

  async function saveData(e: FormEvent) {
    e.preventDefault();
    setDataTouched(true);

    if (fullName.trim().length < 2) return;

    setDataSaving(true);
    setDataMsg(null);

    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', profile!.id)
      .select()
      .maybeSingle();

    if (error) {
      setDataMsg({ ok: false, text: formatAuthError(error) });
    } else {
      setProfile(data);
      setDataMsg({ ok: true, text: 'Tus datos personales se han guardado correctamente.' });
    }
    setDataSaving(false);
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setPassTouched({ newPass: true, confirmPass: true });

    if (newPass.length < 8 || newPass !== confirmPass) {
      return;
    }

    setPassSaving(true);
    setPassMsg(null);

    try {
      await changePassword(newPass);
      setNewPass('');
      setConfirmPass('');
      setPassTouched({ newPass: false, confirmPass: false });
      setPassMsg({ ok: true, text: 'Tu contraseña ha sido actualizada con éxito.' });
    } catch (err) {
      setPassMsg({ ok: false, text: formatAuthError(err) });
    } finally {
      setPassSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-3xl font-extrabold text-text-primary">Mi Perfil</h1>
        <p className="text-sm text-text-secondary mt-1">
          Gestiona tu información de cuenta y seguridad de acceso.
        </p>
      </div>

      {/* 1. FORMULARIO: DATOS PERSONALES */}
      <Card>
        <h2 className="font-heading font-bold text-lg text-text-primary mb-4">Datos personales</h2>

        {dataMsg && (
          <div
            role={dataMsg.ok ? 'status' : 'alert'}
            className={`p-3.5 rounded-xl border text-sm mb-4 ${
              dataMsg.ok
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {dataMsg.text}
          </div>
        )}

        <form onSubmit={saveData} noValidate>
          <Input
            label="Nombre completo"
            name="fullName"
            autoComplete="name"
            required
            value={fullName}
            error={nameError}
            onChange={(e) => {
              setFullName(e.target.value);
              if (dataMsg) setDataMsg(null);
            }}
            onBlur={() => setDataTouched(true)}
            placeholder="Tu nombre y apellido"
          />

          <Input
            label="Email de la cuenta"
            value={profile?.email ?? ''}
            disabled
            helperText="El correo electrónico está vinculado a tu acceso y no se puede modificar desde aquí."
          />

          <Button loading={dataSaving} type="submit">
            Guardar datos personales
          </Button>
        </form>
      </Card>

      {/* 2. FORMULARIO: CAMBIO DE CONTRASEÑA */}
      <Card>
        <h2 className="font-heading font-bold text-lg text-text-primary mb-4">Seguridad: Cambiar contraseña</h2>

        {passMsg && (
          <div
            role={passMsg.ok ? 'status' : 'alert'}
            className={`p-3.5 rounded-xl border text-sm mb-4 ${
              passMsg.ok
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {passMsg.text}
          </div>
        )}

        <form onSubmit={savePassword} noValidate>
          <div>
            <Input
              label="Nueva contraseña (mínimo 8 caracteres)"
              type="password"
              name="newPassword"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPass}
              error={newPassError}
              onChange={(e) => {
                setNewPass(e.target.value);
                if (passMsg) setPassMsg(null);
              }}
              onBlur={() => setPassTouched((prev) => ({ ...prev, newPass: true }))}
              placeholder="Introduce tu nueva contraseña"
            />
            {newPass && <PasswordStrength password={newPass} />}
          </div>

          <div className="mt-4">
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPass}
              error={confirmPassError}
              onChange={(e) => {
                setConfirmPass(e.target.value);
                if (passMsg) setPassMsg(null);
              }}
              onBlur={() => setPassTouched((prev) => ({ ...prev, confirmPass: true }))}
              placeholder="Repite la nueva contraseña"
            />
          </div>

          <Button variant="outline" loading={passSaving} type="submit">
            Actualizar contraseña
          </Button>
        </form>
      </Card>
    </div>
  );
}
