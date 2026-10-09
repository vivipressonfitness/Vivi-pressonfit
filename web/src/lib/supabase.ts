import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL ?? 'https://tu-proyecto.supabase.co').trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? 'tu-anon-key-publica').trim();
const isConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('TU-PROYECTO') &&
  !import.meta.env.VITE_SUPABASE_ANON_KEY.includes('tu-anon-key-publica')
);

if (!isConfigured) {
  console.warn('Supabase no configurado: crea web/.env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY para habilitar login y datos reales.');
}

// IMPORTANTE: solo la ANON KEY. La autorización real vive en RLS;
// SERVICE_ROLE_KEY jamás debe llegar al navegador.
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // necesario si se añaden magic links / OAuth
  },
  global: { headers: { 'x-client-info': 'viviprefit-web@2.0.0' } },
});
