import { useState } from 'react';
import { useVideos } from '../hooks/useVideos';
import { VideoList } from '../components/video/VideoList';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { Modal } from '../components/ui/Modal';
import type { MembershipContent } from '../types';

export default function Videos() {
  const { videos, loading, error } = useVideos();
  const [selected, setSelected] = useState<MembershipContent | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold">Videos del programa</h1>

      <VideoList videos={videos} loading={loading} error={error} onPlay={setSelected} />

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title}>
        {selected?.bunny_video_id && (
          <VideoPlayer bunnyVideoId={selected.bunny_video_id} title={selected.title} />
        )}
      </Modal>
    </div>
  );
}
