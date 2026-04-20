import { NextRequest, NextResponse } from 'next/server';
import { stripe, calcFees } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { listingId, buyerId } = await req.json();

    if (!listingId || !buyerId) {
      return NextResponse.json({ error: 'Missing listingId or buyerId' }, { status: 400 });
    }

    // Fetch listing + seller profile
    const { data: listing, error: listErr } = await supabase
      .from('listings')
      .select('id, title, price, status, seller_id, profiles!listings_seller_id_fkey(stripe_account_id)')
      .eq('id', listingId)
      .single();

    if (listErr || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.status !== 'active') {
      return NextResponse.json({ error: 'Listing is no longer available' }, { status: 409 });
    }

    if (listing.seller_id === buyerId) {
      return NextResponse.json({ error: 'Cannot buy your own listing' }, { status: 400 });
    }

    const { priceCents, feeCents, totalCents } = calcFees(Number(listing.price));
    const sellerProfile = Array.isArray(listing.profiles) ? listing.profiles[0] : listing.profiles as any;
    const sellerStripeId = sellerProfile?.stripe_account_id as string | null;

    // Build PaymentIntent options
    // If seller has Stripe Connect account, use transfer_data for direct payment
    const piParams: Parameters<typeof stripe.paymentIntents.create>[0] = {
      amount: totalCents,
      currency: 'eur',
      metadata: {
        listing_id: listingId,
        buyer_id: buyerId,
        seller_id: listing.seller_id,
        price_cents: String(priceCents),
        fee_cents: String(feeCents),
      },
      description: `Agora.cy — ${listing.title}`,
      automatic_payment_methods: { enabled: true },
    };

    // Only add transfer_data if seller has a connected account
    if (sellerStripeId) {
      piParams.application_fee_amount = feeCents;
      piParams.transfer_data = { destination: sellerStripeId };
    }

    const paymentIntent = await stripe.paymentIntents.create(piParams);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalCents,
      priceCents,
      feeCents,
    });
  } catch (err: any) {
    console.error('[create-payment-intent]', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
