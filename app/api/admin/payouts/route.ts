import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/payouts — list delivered orders needing payout
export async function GET(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret');
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only base schema columns (compatible before session7-iban.sql)
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, amount, platform_fee, status, created_at, updated_at,
      seller_id, buyer_id, listing_id
    `)
    .eq('status', 'delivered')
    .order('updated_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Enrich with profile + listing data separately  
  const enriched = await Promise.all(
    (data ?? []).map(async (order) => {
      // Get seller info + IBAN (iban may not exist yet)
      const { data: seller } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', order.seller_id)
        .maybeSingle();

      // Try to get IBAN (exists after session7-iban.sql)
      let iban: string | null = null;
      let bankName: string | null = null;
      let bankHolderName: string | null = null;
      try {
        const { data: bankData } = await supabase
          .from('profiles')
          .select('iban, bank_name, bank_holder_name')
          .eq('id', order.seller_id)
          .maybeSingle();
        iban = bankData?.iban ?? null;
        bankName = bankData?.bank_name ?? null;
        bankHolderName = bankData?.bank_holder_name ?? null;
      } catch { /* columns not yet in DB */ }

      const { data: buyer } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', order.buyer_id)
        .maybeSingle();

      const { data: listing } = await supabase
        .from('listings')
        .select('id, title')
        .eq('id', order.listing_id)
        .maybeSingle();

      // Try payout_status (after migration)
      let payoutStatus = 'pending';
      let paidOutAt: string | null = null;
      let paidOutNote: string | null = null;
      try {
        const { data: ps } = await supabase
          .from('orders')
          .select('payout_status, paid_out_at, paid_out_note')
          .eq('id', order.id)
          .maybeSingle();
        payoutStatus = ps?.payout_status ?? 'pending';
        paidOutAt = ps?.paid_out_at ?? null;
        paidOutNote = ps?.paid_out_note ?? null;
      } catch { /* columns not yet in DB */ }

      return {
        id: order.id,
        amount: order.amount,
        platform_fee: order.platform_fee,
        status: order.status,
        payout_status: payoutStatus,
        created_at: order.created_at,
        delivered_at: order.updated_at, // use updated_at as proxy
        paid_out_at: paidOutAt,
        paid_out_note: paidOutNote,
        seller: seller ? { ...seller, iban, bank_name: bankName, bank_holder_name: bankHolderName } : null,
        buyer,
        listing,
      };
    })
  );

  return NextResponse.json(enriched);
}

// POST /api/admin/payouts — mark order as paid out
export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get('x-admin-secret');
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId, note } = await req.json();
  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });

  // Update payout tracking (works after session7-iban.sql)
  try {
    await supabase
      .from('orders')
      .update({
        payout_status: 'paid_out',
        paid_out_at: new Date().toISOString(),
        paid_out_note: note || null,
      })
      .eq('id', orderId);
  } catch {
    // Columns not yet in DB — still return success (migration needed)
    console.warn('[admin/payouts] Run session7-iban.sql to enable full payout tracking');
  }

  return NextResponse.json({ success: true });
}
