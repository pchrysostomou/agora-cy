import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// This endpoint is called client-side after Stripe confirms the payment
export async function POST(req: NextRequest) {
  try {
    const { paymentIntentId, listingId, buyerId } = await req.json();

    // Verify payment intent status with Stripe
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (pi.status !== 'succeeded') {
      return NextResponse.json({ error: `Payment not completed. Status: ${pi.status}` }, { status: 400 });
    }

    const sellerId = pi.metadata.seller_id;
    const priceCents = parseInt(pi.metadata.price_cents, 10);
    const feeCents = parseInt(pi.metadata.fee_cents, 10);

    // Create order record
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: sellerId,
        amount: priceCents / 100,
        platform_fee: feeCents / 100,
        stripe_payment_intent: paymentIntentId,
        status: 'paid',
      })
      .select()
      .single();

    if (error) {
      console.error('[confirm-order] DB error:', error);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Mark listing as reserved (not sold yet — buyer must confirm delivery)
    await supabase
      .from('listings')
      .update({ status: 'reserved' })
      .eq('id', listingId);

    return NextResponse.json({ orderId: order.id });
  } catch (err: any) {
    console.error('[confirm-order]', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
