import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div className="relative bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
