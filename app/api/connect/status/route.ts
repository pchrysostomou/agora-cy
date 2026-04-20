import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();

    const accountId = profile?.stripe_account_id;
    if (!accountId) {
      return NextResponse.json({ connected: false, verified: false });
    }

    // Check account status with Stripe
    const account = await stripe.accounts.retrieve(accountId);
    const verified =
      account.charges_enabled &&
      account.details_submitted &&
      !account.requirements?.currently_due?.length;

    return NextResponse.json({
      connected: true,
      verified: !!verified,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
      accountId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
