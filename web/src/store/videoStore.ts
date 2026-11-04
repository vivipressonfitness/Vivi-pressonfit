import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { MembershipContent } from '../types';

interface VideoState {
  videos: MembershipContent[];
  loading: boolean;
  error: string | null;
  fetchVideos: () => Promise<void>;
}

const TARGET_PRIVATE_VIDEO_ID = 'fec9d91b-cccc-4f1c-9729-2e91a53f33b4';

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
      .order('title', { ascending: true });

    if (error) {
      set({ loading: false, error: error.message });
      return;
    }

    const rawList = (data ?? []) as MembershipContent[];

    // En el portal de miembros SOLO deben verse las 4 clases privadas completas de suscriptoras
    // (las muestras con "(Gratis)" o teasers pertenecen a la Landing pública).
    const filtered = rawList.filter((item) => {
      const t = item.title.toLowerCase();
      if (t.includes('(gratis)') || t.includes('muestra de')) return false;
      return true;
    });

    const mapped = filtered.map((item) => {
      const lower = item.title.toLowerCase();
      let thumb = item.thumbnail_url;
      if (!thumb) {
        if (lower.includes('gap')) thumb = '/landing/thumb-gap.jpg';
        else if (lower.includes('cardio')) thumb = '/landing/thumb-cardio.jpg';
        else thumb = '/landing/thumb-fullbody.jpg';
      }

      return {
        ...item,
        // Asignar el ID privado oficial de Bunny Stream para las clases de suscriptoras
        bunny_video_id: TARGET_PRIVATE_VIDEO_ID,
        thumbnail_url: thumb,
        title: item.title.replace(/\s*\(gratis\)\s*/gi, '').trim(),
      };
    });

    set({ videos: mapped, loading: false });
  },
}));
