import type { ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';
import { useLenis } from 'lenis/react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Ancho máximo del panel. Usa "max-w-4xl" para el reproductor de video. */
  size?: 'md' | 'lg';
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, video[controls], iframe, [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();
  const lenis = useLenis();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Bloquear el scroll de fondo (incluido el scroll suave de Lenis).
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    return () => {
      document.body.style.overflow = previousOverflow;
      lenis?.start();
    };
  }, [open, lenis]);

  // Cerrar con Escape y devolver el foco al elemento original.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      // Trampa simple de foco con Tab dentro del panel.
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
        ).filter((el) => el.offsetParent !== null || el === document.activeElement);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;
        const outside = !panelRef.current.contains(active);
        if (e.shiftKey && (active === first || active === panelRef.current || outside)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || outside)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKey);
    // Mover el foco al panel al abrir (tras el render).
    const raf = requestAnimationFrame(() => {
      const target =
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ?? panelRef.current;
      target?.focus();
    });
    return () => {
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(raf);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : 'Diálogo'}
        tabIndex={-1}
        className={`relative bg-surface border border-border rounded-2xl p-6 w-full ${
          size === 'lg' ? 'max-w-4xl' : 'max-w-md'
        } shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent`}
      >
        <div className="flex items-start justify-between gap-4">
          {title ? (
            <h2 id={titleId} className="text-lg font-bold mb-4 pr-8">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="shrink-0 -mr-1 -mt-1 grid place-items-center w-10 h-10 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
