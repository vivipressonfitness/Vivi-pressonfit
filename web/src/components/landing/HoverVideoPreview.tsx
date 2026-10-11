import { useEffect, useRef, useState } from 'react';

interface Props {
  src: string;
  poster?: string | null;
  alt: string;
}

/** Muted, lazy hover preview. Touch users keep the explicit modal playback flow. */
export function HoverVideoPreview({ src, poster, alt }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReduceMotion(motionPreference.matches);
    updateMotionPreference();
    motionPreference.addEventListener('change', updateMotionPreference);

    const node = videoRef.current?.parentElement;
    if (!node || !('IntersectionObserver' in window)) {
      setInView(true);
      return () => motionPreference.removeEventListener('change', updateMotionPreference);
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: '100px',
      threshold: 0.1,
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      motionPreference.removeEventListener('change', updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hovered && inView && !reduceMotion) {
      void video.play().catch(() => setFailed(true));
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [hovered, inView, reduceMotion]);

  if (failed) return null;
  return (
    <video
      ref={videoRef}
      src={inView ? src : undefined}
      poster={poster ?? undefined}
      muted
      loop
      playsInline
      preload="none"
      aria-label={`Vista previa de ${alt}`}
      tabIndex={-1}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') setHovered(false);
      }}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}
