export type MediaItem = {
  id: string;
  type: 'image' | 'video';
  src: string; // relative to public folder, e.g. '/media/placeholder-1.webp'
  alt?: string;
};

