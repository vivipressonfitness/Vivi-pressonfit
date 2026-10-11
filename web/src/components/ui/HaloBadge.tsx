import type { HTMLAttributes } from 'react';

export type HaloBadgeVariant = 'free' | 'members' | 'active' | 'draft';

interface Props extends HTMLAttributes<HTMLSpanElement> {
  variant: HaloBadgeVariant;
}

const variants: Record<HaloBadgeVariant, string> = {
  free: 'border-whatsapp-green/50 bg-whatsapp-green/15 text-whatsapp-green shadow-[0_0_12px_rgba(34,197,94,0.12)]',
  members: 'border-white/25 bg-black/75 text-white shadow-[0_0_12px_rgba(255,255,255,0.1)]',
  active: 'border-accent/45 bg-accent/15 text-accent shadow-[0_0_12px_rgba(255,46,147,0.16)]',
  draft: 'border-border bg-surface text-text-secondary',
};

/** Compact status pill inspired by cult-ui HaloBadge, styled with ViviPreFit tokens. */
export function HaloBadge({ variant, className = '', children, ...props }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-sm ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
