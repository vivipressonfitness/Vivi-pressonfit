import { supabase } from './supabase';
import type { BunnyTokenResponse } from '../types';

// El token firmado SIEMPRE se pide a la Edge Function bunny-token
// (nunca firmar en el cliente: BUNNY_STREAM_TOKEN_KEY es secreta).
// Usamos fetch directo porque functions.invoke() oculta el cuerpo JSON
// cuando la función responde con código no-2xx.
export async function requestBunnyToken(videoId: string): Promise<BunnyTokenResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('Sesión requerida para reproducir videos');

  const functionsBase = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, '') + '/functions/v1';
  const res = await fetch(`${functionsBase}/bunny-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    },
    body: JSON.stringify({ videoId }),
  });

  const json = (await res.json().catch(() => ({}))) as Partial<BunnyTokenResponse> & {
    error?: string;
  };
  if (!res.ok || !json.hlsUrl) {
    throw new Error(json.error ?? `Bunny token falló (HTTP ${res.status})`);
  }
  return json as BunnyTokenResponse;
}
