import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Props {
  price?: number; // viene de landing_config si está disponible
  onSubscribe: () => void;
  loading?: boolean;
}

export function PlanCard({ price = 40, onSubscribe, loading }: Props) {
  const benefits = [
    'Programa de entrenamiento mensual completo',
    'Videos privados en HD (Bunny Stream)',
    'Guías de estilo de vida saludable',
    'Soporte directo por WhatsApp',
    'Cancela cuando quieras',
  ];
  return (
    <Card className="max-w-sm mx-auto border-accent/40">
      <h3 className="font-bold text-xl mb-1">Membresía Mensual</h3>
      <p className="text-4xl font-extrabold text-accent my-4">
        $us. {price}
        <span className="text-base font-medium text-text-secondary"> /mes</span>
      </p>
      <ul className="space-y-2 text-sm text-text-secondary mb-6">
        {benefits.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-accent">✓</span> {b}
          </li>
        ))}
      </ul>
      <Button loading={loading} onClick={onSubscribe} className="w-full">
        Suscribirme $us. {price} / mes
      </Button>
    </Card>
  );
}
