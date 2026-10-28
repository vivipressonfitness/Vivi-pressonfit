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
  profileLoading: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: Profile | null) => void;
  signOut: () => Promise<void>;
  reloadProfile: () => Promise<Profile | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  initializing: true,
  profileLoading: false,

  setSession: (session) => set({ session, user: session?.user ?? null }),
  setProfile: (profile) => set({ profile }),

  signOut: async () => {
    await supabase.auth.signOut();
    useMembershipStore.getState().reset();
    set({ session: null, user: null, profile: null, profileLoading: false });
  },

  reloadProfile: async () => {
    const currentUserId = get().user?.id;
    if (!currentUserId) return null;
    set({ profileLoading: true });
    try {
      return await loadProfile(currentUserId);
    } finally {
      set({ profileLoading: false });
    }
  },
}));

// Carga inicial de sesión + listener global (F-09: hidrata sesión y perfil con reintentos antes de habilitar rutas)
export function initAuthListener() {
  const { setSession, setProfile } = useAuthStore.getState();

  supabase.auth.getSession().then(async ({ data }) => {
    setSession(data.session);
    if (data.session?.user) {
      useAuthStore.setState({ profileLoading: true });
      await loadProfile(data.session.user.id);
      useAuthStore.setState({ profileLoading: false });
    }
    useAuthStore.setState({ initializing: false });
  });

  supabase.auth.onAuthStateChange(async (_event, session) => {
    setSession(session);
    if (session?.user) {
      useAuthStore.setState({ profileLoading: true });
      await loadProfile(session.user.id);
      useAuthStore.setState({ profileLoading: false });
    } else {
      setProfile(null);
      useMembershipStore.getState().reset();
      useAuthStore.setState({ profileLoading: false });
    }
  });
}

// Carga de perfil con tolerancia a latencia del trigger de creación (handle_new_user)
async function loadProfile(userId: string, retries = 2): Promise<Profile | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn(`[auth] Reintento ${attempt + 1} falló al consultar perfil:`, error.message);
      } else if (data) {
        const prof = data as Profile;
        useAuthStore.getState().setProfile(prof);
        useMembershipStore.getState().setFromProfile(prof);
        return prof;
      }
    } catch (err) {
      console.warn(`[auth] Error inesperado en carga de perfil:`, err);
    }

    if (attempt < retries) {
      await new Promise((res) => setTimeout(res, 350 * (attempt + 1)));
    }
  }

  // Si tras reintentos no hay registro aún, mantener perfil en null de forma segura
  useAuthStore.getState().setProfile(null);
  useMembershipStore.getState().reset();
  return null;
}
