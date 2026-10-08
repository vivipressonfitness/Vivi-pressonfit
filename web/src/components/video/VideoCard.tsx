import type { MembershipContent } from '../../types';
import { Card } from '../ui/Card';

interface Props {
  content: MembershipContent;
  onPlay: (content: MembershipContent) => void;
}

export function VideoCard({ content, onPlay }: Props) {
  return (
    <Card className="flex flex-col gap-2 hover:border-accent/50 transition">
      <span className="text-xs uppercase tracking-wide text-accent">{content.category}</span>
      <h4 className="font-semibold leading-snug">{content.title}</h4>
      {content.description && (
        <p className="text-sm text-text-secondary line-clamp-2">{content.description}</p>
      )}
      <div className="mt-auto pt-2 flex items-center justify-between">
        <span className="text-xs text-text-secondary">{content.month_year ?? content.cycle_date}</span>
        <button
          onClick={() => onPlay(content)}
          className="btn-accent !px-4 !py-2 text-sm"
        >
          ▶ Ver
        </button>
      </div>
    </Card>
  );
}
