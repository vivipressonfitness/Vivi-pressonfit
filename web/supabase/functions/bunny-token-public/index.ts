// Edge Function: bunny-token-public  (Deno)
// ─────────────────────────────────────────────────────────────────────────────
// Token HLS firmado de Bunny Stream para videos PROMOCIONALES FREE del landing.
// NO verifica sesión ni membresía: solo firma tokens para los video IDs que el
// admin haya marcado como públicos en landing_config.clases_items[].bunny_video_id.
// La clave secreta BUNNY_STREAM_TOKEN_KEY nunca llega al navegador.
//
// DESPLIEGUE (solo colocar credenciales):
//   supabase functions deploy bunny-token-public --no-verify-jwt
//   Secrets compartidos con bunny-token:
//     BUNNY_INTEGRATION_ID / BUNNY_STREAM_API_KEY / BUNNY_STREAM_TOKEN_KEY
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TOKEN_TTL_SECONDS = 7200;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { videoId } = (await req.json().catch(() => ({}))) as { videoId?: string };
    if (!videoId) return json({ error: 'Falta videoId' }, 400);

    // 1) Allowlist: el video DEBE estar publicado como free en landing_config.
    //    Usamos la anon key + RLS pública (landing_config_select_public).
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );
    const { data: row, error: cfgError } = await supabase
      .from('landing_config')
      .select('value')
      .eq('key', 'clases_items')
      .maybeSingle();
    if (cfgError) return json({ error: 'No se pudo leer la config publica' }, 500);

    let items: Array<{ bunny_video_id?: string }> = [];
    const raw = row?.value;
    if (typeof raw === 'string') {
      try { items = JSON.parse(raw); } catch { items = []; }
    } else if (Array.isArray(raw)) {
      items = raw as Array<{ bunny_video_id?: string }>;
    }
    const allowed = items.some((it) => it?.bunny_video_id === videoId);
    if (!allowed) return json({ error: 'Video no publico' }, 403);

    // 2) Secretos de Bunny
    const integrationId = Deno.env.get('BUNNY_INTEGRATION_ID');
    const streamApiKey = Deno.env.get('BUNNY_STREAM_API_KEY');
    const tokenKey = Deno.env.get('BUNNY_STREAM_TOKEN_KEY');
    if (!integrationId || !streamApiKey || !tokenKey) {
      return json({ error: 'Bunny no esta configurado (faltan secrets)' }, 500);
    }

    // 3) Guid del video
    const res = await fetch(
      `https://api.bunny.net/library/${integrationId}/video/${videoId}`,
      { headers: { AccessKey: streamApiKey } },
    );
    if (!res.ok) return json({ error: `Video no encontrado en Bunny (HTTP ${res.status})` }, 404);
    const video = (await res.json()) as { Guid?: string };
    const guid = video.Guid ?? videoId;

    // 4) Token firmado SHA-256 "{guid}-{expiry}-{tokenKey}"
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
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
