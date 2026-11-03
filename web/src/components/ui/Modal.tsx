import type { ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';
import { useLenis } from 'lenis/react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Ancho máximo del panel. Usa "max-w-4xl" para el formulario de contenidos o reproductor. */
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

  // Bloquear de forma estricta el scroll de fondo (incluido Lenis y html/body)
  useEffect(() => {
    if (!open) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    lenis?.stop();

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      lenis?.start();
    };
  }, [open, lenis]);

  // Cerrar con Escape y atrapar el foco dentro del diálogo (WAI-ARIA)
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      // Trampa de foco con Tab dentro del panel
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden overscroll-contain"
      data-lenis-prevent
    >
      {/* Fondo oscuro backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor del Diálogo con scroll interno independiente */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : 'Diálogo'}
        tabIndex={-1}
        data-lenis-prevent
        className={`relative bg-surface border border-border rounded-3xl p-5 sm:p-6 w-full ${
          size === 'lg' ? 'max-w-4xl' : 'max-w-md'
        } max-h-[92vh] flex flex-col shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-accent overscroll-contain z-10`}
      >
        {/* Cabecera del Modal fija al tope */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-border/60 shrink-0">
          {title ? (
            <h2 id={titleId} className="text-base sm:text-lg font-bold text-text-primary pr-4 line-clamp-1">
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="shrink-0 -mr-1.5 -mt-1.5 grid place-items-center w-9 h-9 rounded-full text-text-secondary hover:text-text-primary hover:bg-white/10 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            ✕
          </button>
        </div>

        {/* Cuerpo del Modal con scroll vertical propio y sin propagación al fondo */}
        <div
          className="overflow-y-auto overscroll-contain flex-1 pr-1.5 pt-3 scrollbar-thin scrollbar-thumb-border"
          data-lenis-prevent
        >
          {children}
        </div>
      </div>
    </div>
  );
}
