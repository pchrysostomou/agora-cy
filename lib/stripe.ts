import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY env var');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-03-25.dahlia',
  typescript: true,
});

/** Platform fee: 5% of item price (charged to buyer) */
export function calcFees(priceEuros: number) {
  const priceCents = Math.round(priceEuros * 100);
  const feeCents = Math.round(priceEuros * 0.05 * 100);
  return { priceCents, feeCents, totalCents: priceCents + feeCents };
}
