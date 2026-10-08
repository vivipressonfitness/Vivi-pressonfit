// Edge Function: bunny-token  (Deno)
// ─────────────────────────────────────────────────────────────────────────────
// Genera el token HLS firmado de Bunny Stream para reproducir un video.
// La clave secreta BUNNY_STREAM_TOKEN_KEY NUNCA llega al navegador: vive solo
// en los "Environment secrets" de Supabase Functions.
//
// DESPLIEGUE (solo colocar credenciales, nada más):
//   1) supabase functions deploy bunny-token
//      (o Studio → Edge Functions → New → pegar este archivo)
//   2) Secrets (CLI o Studio → Settings → Edge Functions → Secrets):
//         BUNNY_INTEGRATION_ID=tu-integration-id \
//         BUNNY_STREAM_API_KEY=tu-api-key-de-bunny \
//         BUNNY_STREAM_TOKEN_KEY=tu-clave-secreta-de-firmado-token
//
// El frontend ya llama a esta función desde src/lib/bunny.ts.
// ─────────────────────────────────────────────────────────────────────────────
// deno-lint-ignore-file no-explicit-any
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TTL del token: 2 horas (el reproductor renueva automáticamente si vence).
const TOKEN_TTL_SECONDS = 7200;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    // 1) Verificar sesión del usuario (el cliente envía su access_token de Supabase).
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return json({ error: 'No autorizado' }, 401);
    }

    // 2) Verificar acceso real de membresía (misma regla que la RLS de membership_content).
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_status, trial_end_date, is_admin')
      .eq('id', userData.user.id)
      .single();

    const trialOk =
      profile?.plan_status === 'trial' &&
      profile?.trial_end_date &&
      new Date(profile.trial_end_date).getTime() > Date.now();
    const hasAccess = !!profile?.is_admin ||
      profile?.plan_status === 'active' ||
      profile?.plan_status === 'past_due' ||
      !!trialOk;
    if (!hasAccess) {
      return json({ error: 'Membresía no activa' }, 403);
    }

    // 3) Leer secretos de Bunny (configurados en Supabase, nunca en el cliente).
    const integrationId = Deno.env.get('BUNNY_INTEGRATION_ID');
    const streamApiKey = Deno.env.get('BUNNY_STREAM_API_KEY');
    const tokenKey = Deno.env.get('BUNNY_STREAM_TOKEN_KEY');
    if (!integrationId || !streamApiKey || !tokenKey) {
      return json({ error: 'Bunny no está configurado (faltan secrets en la función)' }, 500);
    }

    const { videoId } = (await req.json().catch(() => ({}))) as { videoId?: string };
    if (!videoId) return json({ error: 'Falta videoId' }, 400);

    // 4) Obtener la guía del video desde la API de Bunny.
    const res = await fetch(
      `https://api.bunny.net/library/${integrationId}/video/${videoId}`,
      { headers: { AccessKey: streamApiKey } },
    );
    if (!res.ok) {
      return json({ error: `Video no encontrado en Bunny (HTTP ${res.status})` }, 404);
    }
    const video = (await res.json()) as { Guid?: string };
    const guid = video.Guid ?? videoId;

    // 5) Firmar token SHA-256: hash de "{guid}-{expiry}-{tokenKey}" (formato Bunny).
    const expiry = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    const digest = await sha256Hex(`${guid}-${expiry}-${tokenKey}`);

    const hlsUrl =
      `https://bunnystream.com/manifest/${guid}/${guid}_f.mp4.m3u8?token=${digest}&expires=${expiry}`;
    return json({ hlsUrl, expiresAt: expiry * 1000 }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Error interno' }, 500);
  }
});

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
