import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/orders/confirm-delivery
// Buyer confirms receipt → order marked as delivered → admin handles IBAN payout
export async function POST(req: NextRequest) {
  try {
    const { orderId, buyerId } = await req.json();

    if (!orderId || !buyerId) {
      return NextResponse.json({ error: 'Missing orderId or buyerId' }, { status: 400 });
    }

    // Get order (only base schema columns)
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, buyer_id, seller_id, listing_id, status, amount')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.buyer_id !== buyerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: `Order is already ${order.status}` },
        { status: 400 }
      );
    }

    // Update status using only base schema columns (always exists)
    const baseUpdate: Record<string, unknown> = {
      status: 'delivered',
      updated_at: new Date().toISOString(),
    };

    // Optionally add new columns if they exist (after session7-iban.sql is run)
    // These fail silently if columns don't exist yet
    const { error: updateErr } = await supabase
      .from('orders')
      .update(baseUpdate)
      .eq('id', orderId);

    if (updateErr) {
      console.error('[confirm-delivery]', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Try to update payout_status (only if column exists, ignore error)
    try {
      await supabase
        .from('orders')
        .update({ payout_status: 'pending' })
        .eq('id', orderId);
    } catch {
      // Column doesn't exist yet — run session7-iban.sql to enable full tracking
    }

    // Mark listing as sold
    if (order.listing_id) {
      await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', order.listing_id);
    }

    return NextResponse.json({ success: true, status: 'delivered' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    console.error('[confirm-delivery]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
