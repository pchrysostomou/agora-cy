'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, RefreshCw, Copy, ExternalLink } from 'lucide-react';

interface Payout {
  id: string;
  amount: number;
  platform_fee: number;
  payout_status: 'pending' | 'paid_out';
  delivered_at: string;
  paid_out_at: string | null;
  paid_out_note: string | null;
  seller: { id: string; full_name: string; iban: string | null; bank_name: string | null; bank_holder_name: string | null } | null;
  buyer: { id: string; full_name: string } | null;
  listing: { id: string; title: string } | null;
}

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || '';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);

  const load = async (s = secret) => {
    setLoading(true);
    const res = await fetch('/api/admin/payouts', {
      headers: { 'x-admin-secret': s },
    });
    if (res.ok) {
      const data = await res.json();
      setPayouts(data);
      setAuthed(true);
    }
    setLoading(false);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    load(secret);
  };

  const handleMarkPaid = async (orderId: string) => {
    setMarkingId(orderId);
    const res = await fetch('/api/admin/payouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': secret,
      },
      body: JSON.stringify({ orderId, note }),
    });
    if (res.ok) {
      setPayouts((prev) =>
        prev.map((p) =>
          p.id === orderId
            ? { ...p, payout_status: 'paid_out', paid_out_at: new Date().toISOString(), paid_out_note: note }
            : p
        )
      );
      setNote('');
      setConfirmId(null);
    }
    setMarkingId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const pending = payouts.filter((p) => p.payout_status === 'pending');
  const completed = payouts.filter((p) => p.payout_status === 'paid_out');
  const totalPending = pending.reduce((sum, p) => sum + (p.amount - p.platform_fee), 0);

  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)', padding: '20px',
      }}>
        <div className="card" style={{ maxWidth: '360px', width: '100%', padding: '32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: 'var(--color-text)' }}>
            Admin — Payouts
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            Εισάγαγε το admin secret key
          </p>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              className="input"
              placeholder="Admin secret..."
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn-primary">Σύνδεση</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-text)' }}>Admin — Payouts</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
            {pending.length} pending · Σύνολο προς πληρωμή: <strong style={{ color: 'var(--color-teal)' }}>€{totalPending.toFixed(2)}</strong>
          </p>
        </div>
        <button onClick={() => load()} className="btn-ghost btn-sm" disabled={loading}>
          <RefreshCw size={14} style={{ animation: loading ? 'spin 0.7s linear infinite' : undefined }} />
          Ανανέωση
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <SummaryCard icon={<Clock size={20} style={{ color: '#f59e0b' }} />} label="Pending Payouts" value={pending.length} color="rgba(245,158,11,0.1)" />
        <SummaryCard icon={<CheckCircle size={20} style={{ color: '#10b981' }} />} label="Completed" value={completed.length} color="rgba(16,185,129,0.1)" />
        <SummaryCard icon="€" label="Ποσό προς πληρωμή" value={`€${totalPending.toFixed(2)}`} color="rgba(9,177,186,0.08)" isAmount />
      </div>

      {/* Pending payouts */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '12px' }}>
        🕐 Εκκρεμείς Πληρωμές
      </h2>

      {pending.length === 0 ? (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <CheckCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
          <p>Δεν υπάρχουν εκκρεμείς πληρωμές</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {pending.map((payout) => (
            <PayoutRow
              key={payout.id}
              payout={payout}
              isPending
              onCopy={copyToClipboard}
              onMarkPaid={() => setConfirmId(payout.id)}
            />
          ))}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '12px' }}>
            ✅ Ολοκληρωμένες Πληρωμές
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {completed.map((payout) => (
              <PayoutRow key={payout.id} payout={payout} isPending={false} onCopy={copyToClipboard} onMarkPaid={() => {}} />
            ))}
          </div>
        </>
      )}

      {/* Confirm modal */}
      {confirmId && (
        <div className="overlay" onClick={() => setConfirmId(null)}>
          <div className="modal" style={{ maxWidth: '400px', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text)' }}>
              Επιβεβαίωση Πληρωμής
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              Βεβαιώσου ότι έχεις κάνει το bank transfer πριν το χαρακτηρίσεις ως ολοκληρωμένο.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                className="input"
                placeholder="Σημείωση (π.χ. SEPA reference, ημερομηνία)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setConfirmId(null)} className="btn-outline" style={{ flex: 1 }}>Ακύρωση</button>
                <button
                  onClick={() => handleMarkPaid(confirmId)}
                  disabled={!!markingId}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  {markingId ? 'Αποθήκευση...' : 'Σήμανση ως Πληρωμένο ✓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PayoutRow({
  payout, isPending, onCopy, onMarkPaid,
}: {
  payout: Payout;
  isPending: boolean;
  onCopy: (text: string) => void;
  onMarkPaid: () => void;
}) {
  const sellerAmount = payout.amount - payout.platform_fee;

  return (
    <div className="card" style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        {/* Left: seller + listing info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <strong style={{ color: 'var(--color-text)', fontSize: '15px' }}>
              {payout.seller?.full_name ?? '—'}
            </strong>
            <span style={{
              padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: 700,
              background: isPending ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.12)',
              color: isPending ? '#f59e0b' : '#10b981',
            }}>
              {isPending ? 'PENDING' : 'PAID'}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            {payout.listing?.title ?? 'Αγγελία'} · Αγοραστής: {payout.buyer?.full_name ?? '—'}
          </p>

          {/* IBAN box */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '6px 12px', background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
          }}>
            {payout.seller?.iban ? (
              <>
                <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--color-text)', letterSpacing: '0.05em' }}>
                  {payout.seller.iban.replace(/(.{4})/g, '$1 ').trim()}
                </span>
                <button
                  onClick={() => onCopy(payout.seller!.iban!)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-teal)', padding: '2px' }}
                  title="Copy IBAN"
                >
                  <Copy size={13} />
                </button>
              </>
            ) : (
              <span style={{ fontSize: '13px', color: 'var(--color-error)' }}>
                ⚠️ Δεν έχει ορίσει IBAN
              </span>
            )}
          </div>
          {payout.seller?.bank_name && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              {payout.seller.bank_name} · {payout.seller.bank_holder_name}
            </p>
          )}
          {!isPending && payout.paid_out_note && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              📝 {payout.paid_out_note}
            </p>
          )}
        </div>

        {/* Right: amount + action */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>
            €{sellerAmount.toFixed(2)}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            (πλήρης: €{payout.amount.toFixed(2)} - fee: €{payout.platform_fee.toFixed(2)})
          </span>
          {isPending && (
            <button onClick={onMarkPaid} className="btn-primary btn-sm" style={{ marginTop: '4px' }}>
              <CheckCircle size={13} /> Σημείωσε ως Πληρωμένο
            </button>
          )}
          {!isPending && (
            <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
              ✓ {payout.paid_out_at ? new Date(payout.paid_out_at).toLocaleDateString('el-CY') : 'Ολοκληρώθηκε'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color, isAmount }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  isAmount?: boolean;
}) {
  return (
    <div className="card" style={{ padding: '20px', background: color, border: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        {typeof icon === 'string'
          ? <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-teal)' }}>{icon}</span>
          : icon}
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</span>
      </div>
      <p style={{ fontSize: isAmount ? '24px' : '28px', fontWeight: 800, color: 'var(--color-text)' }}>{value}</p>
    </div>
  );
}
