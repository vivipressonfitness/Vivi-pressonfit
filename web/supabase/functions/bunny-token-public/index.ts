// @ts-nocheck
// deno-lint-ignore-file
/* eslint-disable */
// Edge Function: bunny-token-public  (Deno)
// ─────────────────────────────────────────────────────────────────────────────
// Token firmado de Bunny Stream para videos PROMOCIONALES FREE del landing.
// NO requiere sesión de usuario: solo firma tokens para los video IDs que
// estén autorizados en landing_config (preview_clases / clases_items) o
// en membership_content con show_in_landing = true.
// La clave secreta BUNNY_STREAM_TOKEN_KEY NUNCA llega al navegador.
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

    // 1) Allowlist: verificar que el video está autorizado como público
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
    );

    // Revisar landing_config (preview_clases, clases_items, carousel_bunny_videos)
    const { data: cfgRows } = await supabase
      .from('landing_config')
      .select('key, value')
      .in('key', ['preview_clases', 'clases_items', 'carousel_bunny_videos']);

    let allowed = false;
    for (const row of cfgRows ?? []) {
      const raw = row.value;
      let items: Array<{ bunny_video_id?: string; videoId?: string }> = [];
      if (typeof raw === 'string') {
        try { items = JSON.parse(raw); } catch { items = []; }
      } else if (Array.isArray(raw)) {
        items = raw as Array<{ bunny_video_id?: string; videoId?: string }>;
      }
      if (items.some((it) => it?.bunny_video_id === videoId || it?.videoId === videoId)) {
        allowed = true;
        break;
      }
    }

    // Si no está en landing_config, revisar membership_content con show_in_landing
    if (!allowed) {
      const { data: mcRow } = await supabase
        .from('membership_content')
        .select('id')
        .eq('bunny_video_id', videoId)
        .eq('show_in_landing', true)
        .maybeSingle();
      if (mcRow) allowed = true;
    }

    if (!allowed) return json({ error: 'Video no autorizado como público' }, 403);

    // 2) Secretos de Bunny
    const integrationId = Deno.env.get('BUNNY_INTEGRATION_ID');
    const streamApiKey = Deno.env.get('BUNNY_STREAM_API_KEY');
    const tokenKey = Deno.env.get('BUNNY_STREAM_TOKEN_KEY');
    if (!integrationId || !streamApiKey || !tokenKey) {
      return json({ error: 'Bunny no está configurado (faltan secrets)' }, 500);
    }

    // 3) Guid del video
    let guid = videoId;
    try {
      const res = await fetch(
        `https://video.bunnycdn.com/library/${integrationId}/videos/${videoId}`,
        { headers: { AccessKey: streamApiKey } },
      );
      if (res.ok) {
        const video = (await res.json()) as { guid?: string; Guid?: string };
        guid = video.guid ?? video.Guid ?? videoId;
      }
    } catch {
      // Si la API no responde pero ya tenemos el guid, continuamos
    }

    // 4) Token firmado SHA-256 según especificación oficial de Bunny Stream:
    // SHA256_HEX(tokenKey + guid + expiry)
    const expiry = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
    const digest = await sha256Hex(`${tokenKey}${guid}${expiry}`);

    const embedUrl = `https://player.mediadelivery.net/embed/${integrationId}/${guid}?token=${digest}&expires=${expiry}`;
    const hlsUrl = embedUrl;

    return json({ hlsUrl, embedUrl, expiresAt: expiry * 1000 }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Error interno' }, 500);
  }
});

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
