import type { PlanStatus } from '../../types';

const map: Record<PlanStatus, { label: string; cls: string }> = {
  active:   { label: 'Activa',    cls: 'bg-emerald-500/15 text-emerald-400' },
  trial:    { label: 'Prueba',    cls: 'bg-sky-500/15 text-sky-400' },
  past_due: { label: 'Pago vencido', cls: 'bg-amber-500/15 text-amber-400' },
  canceled: { label: 'Cancelada', cls: 'bg-red-500/15 text-red-400' },
  inactive: { label: 'Sin membresía', cls: 'bg-neutral-500/15 text-neutral-400' },
};

export function MembershipBadge({ status }: { status: PlanStatus | null }) {
  const s = map[status ?? 'inactive'];
  return (
    <span className={`inline-block px-3 py-1 rounded-pill text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}
