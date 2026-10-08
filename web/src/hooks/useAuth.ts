import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, session, profile, initializing } = useAuthStore();

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    await useAuthStore.getState().signOut();
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }, []);

  return { user, session, profile, initializing, signIn, signOut, changePassword };
}
