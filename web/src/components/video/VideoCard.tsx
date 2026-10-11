import type { MembershipContent } from '../../types';
import { Card } from '../ui/Card';

interface Props {
  content: MembershipContent;
  onPlay: (content: MembershipContent) => void;
}

export function VideoCard({ content, onPlay }: Props) {
  const cycle = content.month_year ?? content.cycle_date;
  return (
    <Card className="flex flex-col gap-2 hover:border-accent/50 transition">
      {/* Superficie de marca en lugar de miniaturas inventadas */}
      <div
        aria-hidden
        className="aspect-video rounded-xl bg-gradient-to-br from-accent/25 via-accent/10 to-transparent border border-accent/20 grid place-items-center"
      >
        <span className="w-11 h-11 rounded-full bg-accent/20 border border-accent/40 grid place-items-center text-accent text-lg">
          ▶
        </span>
      </div>
      <span className="text-xs uppercase tracking-wide text-accent">{content.category}</span>
      <h4 className="font-semibold leading-snug">{content.title}</h4>
      {content.description && (
        <p className="text-sm text-text-secondary line-clamp-2">{content.description}</p>
      )}
      <div className="mt-auto pt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-text-secondary">{cycle}</span>
        <button
          onClick={() => onPlay(content)}
          aria-label={`Ver clase: ${content.title}`}
          className="btn-accent !px-4 !py-2 text-sm min-h-[44px]"
        >
          ▶ Ver clase
        </button>
      </div>
    </Card>
  );
}
