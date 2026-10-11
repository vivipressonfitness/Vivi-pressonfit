import { useMemo } from 'react';
import { Card } from '../ui/Card';

interface MemberCreatedAt {
  created_at: string;
  is_admin: boolean;
}

interface Point {
  label: string;
  value: number;
}

export function AnalyticsChart({ members }: { members: MemberCreatedAt[] }) {
  const points = useMemo<Point[]>(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) =>
      new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1)),
    );
    const counts = new Map<string, number>(months.map((month) => [
      `${month.getUTCFullYear()}-${month.getUTCMonth()}`,
      0,
    ] as const));

    members.filter((member) => !member.is_admin).forEach((member) => {
      const createdAt = new Date(member.created_at);
      if (Number.isNaN(createdAt.getTime())) return;
      const key = `${createdAt.getUTCFullYear()}-${createdAt.getUTCMonth()}`;
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return months.map((month) => ({
      label: new Intl.DateTimeFormat('es-BO', { month: 'short' }).format(month),
      value: counts.get(`${month.getUTCFullYear()}-${month.getUTCMonth()}`) ?? 0,
    }));
  }, [members]);

  const width = 640;
  const plotTop = 24;
  const plotBottom = 158;
  const maxValue = Math.max(1, ...points.map((point) => point.value));
  const coords = points.map((point, index) => ({
    ...point,
    x: 32 + (index * (width - 64)) / (points.length - 1),
    y: plotBottom - (point.value / maxValue) * (plotBottom - plotTop),
  }));
  const line = coords.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <Card>
      <div className="mb-2">
        <h2 className="font-bold text-lg text-text-primary">Altas de miembros</h2>
        <p className="text-sm text-text-secondary">Nuevos perfiles por mes · últimos 6 meses</p>
      </div>
      {members.filter((member) => !member.is_admin).length === 0 ? (
        <p className="py-8 text-center text-sm text-text-secondary">Aún no hay altas de miembros para mostrar.</p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${width} 204`}
            role="img"
            aria-label={`Altas de miembros en los últimos seis meses: ${points.map((point) => `${point.label}, ${point.value}`).join('; ')}`}
            className="h-auto w-full overflow-visible text-accent"
          >
            {[0, 1, 2, 3].map((step) => {
              const y = plotTop + (step * (plotBottom - plotTop)) / 3;
              return <line key={step} x1="24" x2={width - 24} y1={y} y2={y} stroke="currentColor" opacity="0.12" />;
            })}
            <polyline
              points={line}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {coords.map((point) => (
              <g key={point.label}>
                <circle cx={point.x} cy={point.y} r="5" fill="currentColor" stroke="var(--surface)" strokeWidth="3">
                  <title>{point.label}: {point.value} altas</title>
                </circle>
                <text x={point.x} y="190" textAnchor="middle" className="text-text-secondary" fill="currentColor">
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
          <ul className="sr-only">
            {points.map((point) => <li key={point.label}>{point.label}: {point.value} altas</li>)}
          </ul>
        </>
      )}
    </Card>
  );
}
