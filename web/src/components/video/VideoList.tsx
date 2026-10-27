import type { MembershipContent } from '../../types';
import { VideoCard } from './VideoCard';

interface Props {
  videos: MembershipContent[];
  loading: boolean;
  error: string | null;
  onPlay: (content: MembershipContent) => void;
}

export function VideoList({ videos, loading, error, onPlay }: Props) {
  if (loading) return <p role="status" className="text-text-secondary py-10 text-center">Cargando catálogo…</p>;
  if (error) return <p role="alert" className="text-red-400 py-10 text-center">{error}</p>;
  if (videos.length === 0)
    return (
      <p role="status" className="text-text-secondary py-10 text-center">
        No encontramos clases con esa búsqueda o filtros. Prueba con otros términos o limpia los filtros.
      </p>
    );

  return (
    <section aria-labelledby="videos-catalog-title">
      <h2 id="videos-catalog-title" className="sr-only">Catálogo de clases</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <VideoCard key={v.id} content={v} onPlay={onPlay} />
        ))}
      </div>
    </section>
  );
}
