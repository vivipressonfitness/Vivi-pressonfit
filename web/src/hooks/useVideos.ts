import { useEffect } from 'react';
import { useVideoStore } from '../store/videoStore';

export function useVideos() {
  const { videos, loading, error, fetchVideos } = useVideoStore();

  useEffect(() => {
    void fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playable = videos.filter((v) => !!v.bunny_video_id);
  return { videos: playable, allContent: videos, loading, error, refetch: fetchVideos };
}
