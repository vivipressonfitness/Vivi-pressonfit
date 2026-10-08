import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useMembershipStore, hasActiveAccess } from '../store/membershipStore';

// Sincroniza el store de membresía desde el perfil (mantenido por stripe-webhook)
export function useMembership() {
  const profile = useAuthStore((s) => s.profile);
  const initializing = useAuthStore((s) => s.initializing);
  const setFromProfile = useMembershipStore((s) => s.setFromProfile);
  const reset = useMembershipStore((s) => s.reset);

  useEffect(() => {
    if (initializing) return;
    if (profile) setFromProfile(profile);
    else reset();
  }, [profile, initializing, setFromProfile, reset]);

  const state = useMembershipStore();
  return { ...state, hasAccess: hasActiveAccess(state.status) };
}
