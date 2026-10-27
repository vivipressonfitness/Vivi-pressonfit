import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';

const HEADER_OFFSET = 96;

export function ScrollToHash() {
  const { hash, key } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (!hash) return;

    const id = decodeURIComponent(hash.slice(1));
    let frame = 0;
    let attempts = 0;

    const scroll = () => {
      const target = document.getElementById(id);
      if (target) {
        if (lenis) {
          lenis.scrollTo(target, { offset: -HEADER_OFFSET, duration: 1 });
        } else {
          const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
          window.scrollTo({ top, behavior: 'smooth' });
        }
        return;
      }
      if (attempts < 12) {
        attempts += 1;
        frame = requestAnimationFrame(scroll);
      }
    };

    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, [hash, key, lenis]);

  return null;
}
