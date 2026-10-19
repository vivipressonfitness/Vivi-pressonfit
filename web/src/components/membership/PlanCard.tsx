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
    <Card className="max-w-sm mx-auto border-accent/40 text-center sm:text-left">
      <div className="flex items-center justify-between gap-2 mb-1">
        <h3 className="font-bold text-xl">Membresía Mensual</h3>
        <span className="bg-accent/20 text-accent text-xs font-bold px-2.5 py-0.5 rounded-full uppercase">
          7 días gratis
        </span>
      </div>
      <p className="text-4xl font-extrabold text-accent my-4">
        USD {price}
        <span className="text-base font-medium text-text-secondary"> /mes</span>
      </p>
      <ul className="space-y-2 text-sm text-text-secondary mb-6 text-left">
        {benefits.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="text-accent">✓</span> {b}
          </li>
        ))}
      </ul>
      <Button loading={loading} onClick={onSubscribe} className="w-full">
        Comenzar prueba gratis de 7 días
      </Button>
      <p className="text-xs text-text-secondary text-center mt-2.5">
        $0.00 hoy. Cancela cuando quieras antes de los 7 días sin costo. Cobro internacional en USD procesado con Stripe.
      </p>
    </Card>
  );
}
