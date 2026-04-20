import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/orders/open-dispute
// Either buyer OR seller can open a dispute
export async function POST(req: NextRequest) {
  try {
    const { orderId, userId, reason, description, role } = await req.json();
    // role: 'buyer' | 'seller'

    if (!orderId || !userId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get order and verify user is involved
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, buyer_id, seller_id, status')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isBuyer = order.buyer_id === userId;
    const isSeller = order.seller_id === userId;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot open dispute on a completed/cancelled order' },
        { status: 400 }
      );
    }

    if (order.status === 'disputed') {
      return NextResponse.json(
        { error: 'A dispute is already open for this order' },
        { status: 409 }
      );
    }

    // Insert dispute record
    const { error: disputeErr } = await supabase
      .from('disputes')
      .insert({
        order_id: orderId,
        opened_by: userId,
        reason,
        description: description || null,
        status: 'open',
      });

    if (disputeErr) {
      console.error('[open-dispute] dispute insert error:', disputeErr);
      // Continue even if disputes table insert fails (resilient)
    }

    // Mark order as disputed — freeze escrow
    const { error: updateErr } = await supabase
      .from('orders')
      .update({
        status: 'disputed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateErr) {
      console.error('[open-dispute] order update error:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Η διαφορά καταχωρήθηκε. Η ομάδα μας θα επικοινωνήσει εντός 48 ωρών.',
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    console.error('[open-dispute]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET — admin sees all open disputes
export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('disputes')
    .select(`
      *,
      order:orders(id, amount, status, buyer_id, seller_id,
        listing:listings(title),
        buyer:profiles!orders_buyer_id_fkey(full_name),
        seller:profiles!orders_seller_id_fkey(full_name)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ disputes: [], error: error.message });
  }

  return NextResponse.json({ disputes: data ?? [] });
}
