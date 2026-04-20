import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/orders/mark-shipped
// Seller marks order as shipped with optional tracking number
export async function POST(req: NextRequest) {
  try {
    const { orderId, sellerId, trackingNumber, courier } = await req.json();

    if (!orderId || !sellerId) {
      return NextResponse.json({ error: 'Missing orderId or sellerId' }, { status: 400 });
    }

    // Verify the order belongs to this seller and is in 'paid' status
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('id, seller_id, status')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.seller_id !== sellerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: `Cannot mark as shipped. Current status: ${order.status}` },
        { status: 400 }
      );
    }

    // Update order to shipped
    const updateData: Record<string, unknown> = {
      status: 'shipped',
      updated_at: new Date().toISOString(),
    };

    // Add tracking columns if they exist (from MASTER-MIGRATION)
    if (trackingNumber) updateData.tracking_number = trackingNumber;
    if (courier) updateData.courier = courier;

    // Try to set shipped_at (column added in migration)
    try {
      updateData.shipped_at = new Date().toISOString();
    } catch { /* column may not exist yet */ }

    const { error: updateErr } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (updateErr) {
      // If error contains column reference, retry without optional columns
      if (updateErr.message?.includes('column')) {
        const { error: retryErr } = await supabase
          .from('orders')
          .update({ status: 'shipped', updated_at: new Date().toISOString() })
          .eq('id', orderId);
        if (retryErr) {
          return NextResponse.json({ error: retryErr.message }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      status: 'shipped',
      message: trackingNumber
        ? `Αποστολή καταχωρήθηκε. Tracking: ${trackingNumber}`
        : 'Αποστολή καταχωρήθηκε.',
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    console.error('[mark-shipped]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
