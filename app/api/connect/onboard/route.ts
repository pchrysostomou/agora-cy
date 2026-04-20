import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Create a Stripe Connect Express account and return onboarding URL
export async function POST(req: NextRequest) {
  try {
    const { userId, email, returnUrl } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'Missing userId or email' }, { status: 400 });
    }

    // Check if seller already has an account
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();

    let accountId = profile?.stripe_account_id;

    if (!accountId) {
      // Create new Express account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'CY',
        email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: { supabase_user_id: userId },
      });

      accountId = account.id;

      // Save to Supabase
      await supabase
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', userId);
    }

    // Create account link for onboarding
    const origin = returnUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/connect/refresh`,
      return_url: `${origin}/connect/return`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url, accountId });
  } catch (err: any) {
    console.error('[connect/onboard]', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
