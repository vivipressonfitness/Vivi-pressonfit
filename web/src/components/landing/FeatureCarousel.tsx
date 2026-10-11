import { useRef, type ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
}

/** Touch-friendly feature row on small screens; keeps the full grid on desktop. */
export function FeatureCarousel({ label, children }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);

  const move = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.round(track.clientWidth * 0.85),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };

  return (
    <div>
      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        aria-roledescription="carrusel"
        tabIndex={0}
        className="grid auto-cols-[85%] grid-flow-col snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent md:grid-flow-row md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-4"
      >
        {children}
      </div>
      <div className="mt-2 flex justify-end gap-2 md:hidden">
        <button
          type="button"
          onClick={() => move(-1)}
          aria-label={`Ver elementos anteriores: ${label}`}
          className="flex size-10 items-center justify-center rounded-full border border-border text-text-primary transition hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span aria-hidden="true">←</span>
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label={`Ver elementos siguientes: ${label}`}
          className="flex size-10 items-center justify-center rounded-full border border-border text-text-primary transition hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}
