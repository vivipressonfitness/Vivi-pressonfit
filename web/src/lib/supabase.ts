import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  throw new Error('Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (ver web/.env.example)');
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
