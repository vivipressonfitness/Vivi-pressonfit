import { useState } from 'react';
import { useVideos } from '../hooks/useVideos';
import { VideoList } from '../components/video/VideoList';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { Modal } from '../components/ui/Modal';
import type { MembershipContent } from '../types';

export default function Videos() {
  const { allContent, loading, error } = useVideos();
  const [selected, setSelected] = useState<MembershipContent | null>(null);

  const handlePlay = (content: MembershipContent) => {
    if (content.bunny_video_id) setSelected(content);
    else if (content.content_url) window.open(content.content_url, '_blank');
    else setSelected(content);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Videos del programa</h1>

      <VideoList videos={allContent} loading={loading} error={error} onPlay={handlePlay} />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title}>
        {selected?.bunny_video_id ? (
          <VideoPlayer bunnyVideoId={selected.bunny_video_id} title={selected.title} />
        ) : (
          <div className="py-6">
            <p className="text-text-secondary">No hay un reproductor disponible para este contenido.</p>
            {selected?.content_url && (
              <div className="mt-4">
                <a href={selected.content_url} target="_blank" rel="noreferrer" className="btn-accent">
                  Abrir enlace
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
