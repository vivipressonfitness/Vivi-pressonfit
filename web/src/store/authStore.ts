import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

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
    set({ session: null, user: null, profile: null });
  },
}));

// Carga inicial de sesión + listener global (una sola vez, desde main.tsx)
export function initAuthListener() {
  const { setSession, setProfile } = useAuthStore.getState();

  supabase.auth.getSession().then(({ data }) => {
    setSession(data.session);
    useAuthStore.setState({ initializing: false });
    if (data.session?.user) loadProfile(data.session.user.id);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    if (session?.user) loadProfile(session.user.id);
    else setProfile(null);
  });
}

async function loadProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  useAuthStore.getState().setProfile(data as Profile | null);
}
