import type { ReactNode } from 'react';

interface Props {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  id: string;
}

/** Accessible expandable card adapted to ViviPreFit's existing surface and accent tokens. */
export function ExpandableCard({ title, expanded, onToggle, children, id }: Props) {
  const panelId = `${id}-panel`;
  return (
    <section className={`overflow-hidden rounded-2xl border bg-raised transition-colors ${expanded ? 'border-accent/50' : 'border-border hover:border-accent/40'}`}>
      <h3>
        <button
          type="button"
          id={`${id}-title`}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-4 p-5 text-left text-base font-semibold text-text-primary md:text-lg"
        >
          {title}
          <span aria-hidden="true" className={`text-xl leading-none text-accent transition-transform ${expanded ? 'rotate-45' : ''}`}>
            +
          </span>
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={`${id}-title`} hidden={!expanded}>
        <p className="px-5 pb-5 text-sm leading-relaxed text-text-secondary">
          {children}
        </p>
      </div>
    </section>
  );
}
