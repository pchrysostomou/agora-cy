import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// PUT /api/profile/update-bank — save seller IBAN + bank details
export async function PUT(req: NextRequest) {
  try {
    const { userId, iban, bankName, bankHolderName } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Basic IBAN format validation
    if (iban) {
      const cleanIban = iban.replace(/\s/g, '').toUpperCase();
      if (!/^[A-Z]{2}\d{2}[A-Z0-9]{4,}$/.test(cleanIban)) {
        return NextResponse.json({ error: 'Μη έγκυρο IBAN' }, { status: 400 });
      }
    }

    const updatePayload: Record<string, string | null> = {
      updated_at: new Date().toISOString(),
    };

    if (iban !== undefined) updatePayload.iban = iban?.replace(/\s/g, '').toUpperCase() || null;
    if (bankName !== undefined) updatePayload.bank_name = bankName || null;
    if (bankHolderName !== undefined) updatePayload.bank_holder_name = bankHolderName || null;

    const { error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId);

    if (error) {
      // If columns don't exist yet (migration not run), give helpful message
      if (error.message.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Η βάση δεδομένων χρειάζεται ενημέρωση. Εκτέλεσε session7-iban.sql στο Supabase.' },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET /api/profile/update-bank?userId=xxx — fetch current bank details
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    // Try full query with IBAN columns
    let iban: string | null = null;
    let bankName: string | null = null;
    let bankHolderName: string | null = null;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('iban, bank_name, bank_holder_name')
        .eq('id', userId)
        .maybeSingle();

      iban = data?.iban ?? null;
      bankName = data?.bank_name ?? null;
      bankHolderName = data?.bank_holder_name ?? null;
    } catch {
      // Columns don't exist yet — return empty (migration not run)
    }

    return NextResponse.json({ iban, bank_name: bankName, bank_holder_name: bankHolderName });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
