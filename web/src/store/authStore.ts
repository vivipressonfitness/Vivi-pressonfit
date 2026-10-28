import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';
import { useMembershipStore } from './membershipStore';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  initializing: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  profile: null,
  initializing: true,

  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),

  signOut: async () => {
    await supabase.auth.signOut();
    useMembershipStore.getState().reset();
    set({ session: null, user: null, profile: null });
  },
}));

// Carga inicial de sesión + listener global (espera perfil antes de quitar estado initializing)
export function initAuthListener() {
  const { setSession, setProfile } = useAuthStore.getState();

  supabase.auth.getSession().then(async ({ data }) => {
    setSession(data.session);
    if (data.session?.user) {
      await loadProfile(data.session.user.id);
    }
    useAuthStore.setState({ initializing: false });
  });

  supabase.auth.onAuthStateChange(async (_event, session) => {
    setSession(session);
    if (session?.user) {
      await loadProfile(session.user.id);
    } else {
      setProfile(null);
      useMembershipStore.getState().reset();
    }
  });
}

async function loadProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  if (error) {
    console.warn('No se pudo cargar el perfil del usuario:', error.message);
    useAuthStore.getState().setProfile(null);
    useMembershipStore.getState().reset();
    return;
  }

  const prof = (data ?? null) as Profile | null;
  useAuthStore.getState().setProfile(prof);
  useMembershipStore.getState().setFromProfile(prof);
}
