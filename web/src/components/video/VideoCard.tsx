import type { MembershipContent } from '../../types';
import { Card } from '../ui/Card';

interface Props {
  content: MembershipContent;
  onPlay: (content: MembershipContent) => void;
}

export function VideoCard({ content, onPlay }: Props) {
  const cycle = content.month_year ?? content.cycle_date;
  const showCategoryBadge =
    content.category &&
    content.category.trim().toLowerCase() !== content.title.trim().toLowerCase();

  const thumbUrl =
    content.thumbnail_url ||
    (content.bunny_video_id
      ? `https://vz-797766.b-cdn.net/${content.bunny_video_id}/thumbnail.jpg`
      : null);

  return (
    <Card className="flex flex-col gap-2 hover:border-accent/60 transition group cursor-pointer shadow-sm hover:shadow-md">
      {/* Portada / Miniatura con invitación visual a reproducir */}
      <div
        onClick={() => onPlay(content)}
        className="relative aspect-video rounded-xl bg-gradient-to-br from-accent/25 via-accent/10 to-transparent border border-accent/20 grid place-items-center overflow-hidden"
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={content.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // Si falla la imagen, ocultarla y dejar el fondo degradado de marca
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : null}

        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors grid place-items-center">
          <span className="w-12 h-12 rounded-full bg-accent/90 group-hover:bg-accent text-background grid place-items-center text-lg shadow-lg group-hover:scale-110 transition-transform">
            ▶
          </span>
        </div>

        {/* Badge sutil flotante */}
        <div className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-accent font-semibold flex items-center gap-1.5 border border-white/10">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
          </span>
          <span>Probar video</span>
        </div>
      </div>

      {showCategoryBadge && (
        <span className="text-xs uppercase tracking-wide text-accent font-semibold pt-1">
          {content.category}
        </span>
      )}
      <h3 className="font-semibold leading-snug group-hover:text-accent transition-colors">
        {content.title}
      </h3>
      {content.description && (
        <p className="text-sm text-text-secondary line-clamp-2">{content.description}</p>
      )}

      <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-border/40">
        <span className="text-xs text-text-secondary font-mono">{cycle}</span>
        <button
          type="button"
          onClick={() => onPlay(content)}
          aria-label={`Ver clase: ${content.title}`}
          className="btn-accent !px-4 !py-2 text-sm min-h-[42px] inline-flex items-center gap-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <span>▶ Ver clase</span>
        </button>
      </div>
    </Card>
  );
}
