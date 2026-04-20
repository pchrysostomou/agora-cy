import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret || webhookSecret === 'whsec_placeholder') {
    // Webhook secret not configured — skip validation in dev
    console.warn('[webhook] No webhook secret configured, skipping signature check');
    return NextResponse.json({ received: true });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('[webhook] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('[webhook] Event:', event.type);

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as any;
      // Update order status if it was inserted
      await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('stripe_payment_intent', pi.id);
      break;
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as any;
      await supabase
        .from('orders')
        .update({ status: 'canceled' })
        .eq('stripe_payment_intent', pi.id);
      // Restore listing to active
      const listing_id = pi.metadata?.listing_id;
      if (listing_id) {
        await supabase.from('listings').update({ status: 'active' }).eq('id', listing_id);
      }
      break;
    }

    case 'account.updated': {
      // Seller completed Connect onboarding
      const account = event.data.object as any;
      if (account.charges_enabled) {
        await supabase
          .from('profiles')
          .update({ stripe_account_id: account.id })
          .eq('stripe_account_id', account.id);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
