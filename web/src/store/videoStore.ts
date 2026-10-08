import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { MembershipContent } from '../types';

interface VideoState {
  videos: MembershipContent[];
  loading: boolean;
  error: string | null;
  fetchVideos: () => Promise<void>;
}

export const useVideoStore = create<VideoState>((set) => ({
  videos: [],
  loading: false,
  error: null,

  // RLS filtra automáticamente: solo miembros con acceso ven contenido publicado
  fetchVideos: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('membership_content')
      .select('*')
      .eq('is_published', true)
      .order('cycle_date', { ascending: false });

    if (error) set({ loading: false, error: error.message });
    else set({ videos: (data ?? []) as MembershipContent[], loading: false });
  },
}));
