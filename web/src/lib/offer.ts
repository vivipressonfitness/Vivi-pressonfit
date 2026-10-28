/**
 * Fuente única de verdad para la oferta comercial de VIVIPRESSONFIT (F-11).
 * Centraliza precio, moneda, días de prueba, periodicidad y utilidades de formateo.
 */

export interface CommercialOffer {
  monthlyPrice: number;
  currency: string;
  currencySymbol: string;
  period: string;
  trialDays: number;
  taxInclusive: boolean;
}

export const BASE_OFFER: Readonly<CommercialOffer> = {
  monthlyPrice: 40,
  currency: 'USD',
  currencySymbol: '$',
  period: 'mes',
  trialDays: 7,
  taxInclusive: true,
};

/**
 * Obtiene el precio mensual actual con validación y fallback seguro a BASE_OFFER.
 */
export function getOfferPrice(configuredPrice?: number | null): number {
  if (typeof configuredPrice === 'number' && configuredPrice > 0) {
    return configuredPrice;
  }
  return BASE_OFFER.monthlyPrice;
}

/**
 * Formatea el precio simple: "USD 40"
 */
export function formatPrice(price?: number | null): string {
  const p = getOfferPrice(price);
  return `${BASE_OFFER.currency} ${p}`;
}

/**
 * Formatea la cuota mensual recurrente: "USD 40/mes"
 */
export function formatMonthlyRate(price?: number | null): string {
  const p = getOfferPrice(price);
  return `${BASE_OFFER.currency} ${p}/${BASE_OFFER.period}`;
}

/**
 * Formatea el resumen de la oferta con período de prueba:
 * "7 días de prueba gratis • Luego USD 40/mes"
 */
export function formatOfferWithTrial(price?: number | null): string {
  const p = getOfferPrice(price);
  return `${BASE_OFFER.trialDays} días de prueba gratis • Luego ${BASE_OFFER.currency} ${p}/${BASE_OFFER.period}`;
}

/**
 * Formatea el texto de llamada a la acción con precio:
 * "Probar 7 días gratis — USD 40/mes"
 */
export function formatTrialCta(price?: number | null): string {
  const p = getOfferPrice(price);
  return `Probar ${BASE_OFFER.trialDays} días gratis — ${BASE_OFFER.currency} ${p}/${BASE_OFFER.period}`;
}

