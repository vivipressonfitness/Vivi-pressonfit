export type MediaItem = {
  id: string;
  type: 'image' | 'video';
  src: string;
  alt?: string;
  bunnyVideoId?: string;
  thumbnail?: string;
};
