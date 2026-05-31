'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Package, Star, Settings, LogOut, CheckCircle,
  MapPin, Edit, CreditCard, Loader2, ShieldCheck, AlertTriangle,
  TrendingUp, ShoppingBag, Clock, Truck, Send, X as XIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/mock-auth';
import ListingCard from '@/components/ListingCard';
import CheckoutModal from '@/components/CheckoutModal';
import { getListingsByUser, type Listing } from '@/lib/listings';
import { createClient } from '@/lib/supabase/client';

type Tab = 'active' | 'sold' | 'purchases' | 'earnings';

interface Order {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  platform_fee: number;
  status: 'paid' | 'shipped' | 'delivered' | 'disputed' | 'cancelled';
  stripe_payment_intent: string;
  tracking_number?: string;
  courier?: string;
  created_at: string;
  listing?: { title: string; price: number };
}

interface StripeStatus {
  connected: boolean;
  verified: boolean;
  chargesEnabled?: boolean;
}

export default function MyProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('active');
  const [checkoutListing, setCheckoutListing] = useState<Listing | null>(null);
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [soldListings, setSoldListings] = useState<Listing[]>([]);
  const [purchases, setPurchases] = useState<Order[]>([]);
  const [sales, setSales] = useState<Order[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [confirmingDelivery, setConfirmingDelivery] = useState<string | null>(null);
  const [markingShipped, setMarkingShipped] = useState<string | null>(null);
  const [shipModal, setShipModal] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [courierInput, setCourierInput] = useState('');
  const [disputeModal, setDisputeModal] = useState<{ order: Order; role: 'buyer'|'seller' } | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [toast, setToast] = useState<string>('');

  const [prevUserId, setPrevUserId] = useState(user?.id);

  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    setListingsLoading(true);
  }

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user?.id) return;
    const sb = createClient();
    Promise.all([
      getListingsByUser(user.id, 'active'),
      getListingsByUser(user.id, 'sold'),
      // Purchases (buyer)
      sb.from('orders')
        .select('*, listing:listings(title, price)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false }),
      // Sales (seller)
      sb.from('orders')
        .select('*, listing:listings(title, price)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false }),
    ]).then(([actives, solds, purchasesRes, salesRes]) => {
      setActiveListings(actives);
      setSoldListings(solds);
      setPurchases(purchasesRes.data ?? []);
      setSales(salesRes.data ?? []);
      setListingsLoading(false);
    });

    // Check Stripe Connect status
    fetch(`/api/connect/status?userId=${user.id}`)
      .then((r) => r.json())
      .then((data) => setStripeStatus(data))
      .catch(() => setStripeStatus({ connected: false, verified: false }));
  }, [user?.id]);

  const handleStripeConnect = async () => {
    if (!user) return;
    setConnectLoading(true);
    setConnectError('');
    try {
      const res = await fetch('/api/connect/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          returnUrl: window.location.origin,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        // Show the actual error from Stripe/API
        setConnectError(data.error || 'Σφάλμα σύνδεσης Stripe. Δοκίμασε λίγο αργότερα.');
        setConnectLoading(false);
      }
    } catch (err) {
      setConnectError('Σφάλμα δικτύου. Έλεγξε τη σύνδεσή σου.');
      setConnectLoading(false);
    }
  };

  const handleConfirmDelivery = async (orderId: string) => {
    if (!user) return;
    setConfirmingDelivery(orderId);
    try {
      const res = await fetch('/api/orders/confirm-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, buyerId: user.id }),
      });
      if (res.ok) {
        setPurchases((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'delivered' } : o))
        );
        showToast('✅ Παραλαβή επιβεβαιώθηκε! Τα χρήματα αποδεσμεύτηκαν.');
      } else {
        const d = await res.json();
        showToast('❌ ' + (d.error || 'Σφάλμα'));
      }
    } finally {
      setConfirmingDelivery(null);
    }
  };

  const handleMarkShipped = async () => {
    if (!user || !shipModal) return;
    setMarkingShipped(shipModal.id);
    try {
      const res = await fetch('/api/orders/mark-shipped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: shipModal.id,
          sellerId: user.id,
          trackingNumber: trackingInput || undefined,
          courier: courierInput || undefined,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        setSales((prev) =>
          prev.map((o) => (o.id === shipModal.id
            ? { ...o, status: 'shipped', tracking_number: trackingInput, courier: courierInput }
            : o))
        );
        setShipModal(null);
        setTrackingInput(''); setCourierInput('');
        showToast('📦 Αποστολή καταχωρήθηκε! Ο αγοραστής ειδοποιήθηκε.');
      } else {
        showToast('❌ ' + (d.error || 'Σφάλμα'));
      }
    } finally {
      setMarkingShipped(null);
    }
  };

  const handleOpenDispute = async () => {
    if (!user || !disputeModal || !disputeReason) return;
    setSubmittingDispute(true);
    try {
      const res = await fetch('/api/orders/open-dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: disputeModal.order.id,
          userId: user.id,
          reason: disputeReason,
          description: disputeDesc,
          role: disputeModal.role,
        }),
      });
      const d = await res.json();
      if (res.ok) {
        const updater = (prev: Order[]) =>
          prev.map((o) => (o.id === disputeModal!.order.id ? { ...o, status: 'disputed' as const } : o));
        setPurchases(updater); setSales(updater);
        setDisputeModal(null); setDisputeReason(''); setDisputeDesc('');
        showToast('⚖️ Διαφορά υποβλήθηκε. Η ομάδα μας θα επικοινωνήσει εντός 48ωρών.');
      } else {
        showToast('❌ ' + (d.error || 'Σφάλμα'));
      }
    } finally {
      setSubmittingDispute(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '80px' }}>
        <Loader2 size={32} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--color-teal)' }} />
      </div>
    );
  }

  const totalEarnings = sales
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.amount - o.platform_fee), 0);

  const pendingEarnings = sales
    .filter((o) => o.status === 'paid' || o.status === 'shipped')
    .reduce((sum, o) => sum + (o.amount - o.platform_fee), 0);

  const displayedListings = tab === 'active' ? activeListings : soldListings;

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>

      {/* ── Toast ────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '90px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', padding: '12px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          fontSize: '14px', fontWeight: 600, color: 'var(--color-text)',
          zIndex: 9999, animation: 'chatAppear 0.25s ease',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          {toast}
        </div>
      )}

      {/* ── Ship Modal ───────────────────────────────────── */}
      {shipModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>📦 Σήμανση ως Απεσταλμένο</h2>
              <button onClick={() => { setShipModal(null); setTrackingInput(''); setCourierInput(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><XIcon size={18} /></button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              <strong style={{ color: 'var(--color-text)' }}>{shipModal.listing?.title}</strong> · €{shipModal.amount.toFixed(2)}
            </p>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="label">Αριθμός Tracking (προαιρετικό)</label>
              <input className="input" value={trackingInput} onChange={e => setTrackingInput(e.target.value)} placeholder="π.χ. EE123456789GR" />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="label">Courier (προαιρετικό)</label>
              <input className="input" value={courierInput} onChange={e => setCourierInput(e.target.value)} placeholder="π.χ. ACS, ELTA, DHL" />
            </div>
            <div style={{ background: 'rgba(9,177,186,0.08)', border: '1px solid var(--color-teal-light)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '20px', fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              💡 Ο αγοραστής θα μπορεί να δει τα στοιχεία αποστολής και θα επιβεβαιώσει παραλαβή. Αν δεν επιβεβαιώσει εντός 14 ημερών, μπορείς να ανοίξεις διαφορά.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShipModal(null); setTrackingInput(''); setCourierInput(''); }} className="btn-ghost" style={{ flex: 1 }}>Ακύρωση</button>
              <button onClick={handleMarkShipped} className="btn-primary" style={{ flex: 1 }} disabled={markingShipped === shipModal.id}>
                {markingShipped === shipModal.id ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : <><Truck size={14} /> Αποστολή καταχωρήθηκε</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dispute Modal ────────────────────────────────── */}
      {disputeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-error)' }}>⚖️ Άνοιξε Διαφορά</h2>
              <button onClick={() => { setDisputeModal(null); setDisputeReason(''); setDisputeDesc(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><XIcon size={18} /></button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              {disputeModal.order.listing?.title} · €{disputeModal.order.amount.toFixed(2)}
            </p>
            <div style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: '16px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
              ⚠️ Τα χρήματα θα παγώσουν σε escrow μέχρι να επιλυθεί η διαφορά. Η ομάδα μας θα επικοινωνήσει εντός <strong>48 ωρών</strong> στο email σου.
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="label">Λόγος διαφοράς *</label>
              <select className="input" value={disputeReason} onChange={e => setDisputeReason(e.target.value)}>
                <option value="">-- Επίλεξε --</option>
                {disputeModal.role === 'buyer' ? <>
                  <option value="not_received">Δεν έλαβα το αντικείμενο</option>
                  <option value="not_as_described">Δεν είναι όπως περιγράφηκε</option>
                  <option value="damaged">Έφτασε χαλασμένο</option>
                  <option value="wrong_item">Έλαβα λάθος αντικείμενο</option>
                </> : <>
                  <option value="buyer_not_confirming">Ο αγοραστής δεν επιβεβαιώνει παραλαβή</option>
                  <option value="buyer_fraud">Ύποπτη συμπεριφορά αγοραστή</option>
                  <option value="other">Άλλο</option>
                </>}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="label">Περιγραφή (προαιρετικό)</label>
              <textarea className="input" value={disputeDesc} onChange={e => setDisputeDesc(e.target.value)} placeholder="Περίγραψε το πρόβλημα με λεπτομέρεια..." style={{ height: '80px', resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setDisputeModal(null); setDisputeReason(''); setDisputeDesc(''); }} className="btn-ghost" style={{ flex: 1 }}>Ακύρωση</button>
              <button onClick={handleOpenDispute} disabled={!disputeReason || submittingDispute} className="btn-primary" style={{ flex: 1, background: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                {submittingDispute ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> : <><AlertTriangle size={14} /> Υποβολή Διαφοράς</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={user.avatar}
              alt={user.fullName}
              width={80} height={80}
              style={{ borderRadius: '50%', background: 'var(--color-gray-100)', border: '3px solid var(--color-teal-light)' }}
            />
            <button style={{
              position: 'absolute', bottom: 0, right: 0,
              width: '24px', height: '24px',
              background: 'var(--color-teal)', border: '2px solid var(--color-surface)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff',
            }}>
              <Edit size={11} />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>{user.fullName}</h1>
              <span className="badge-teal">Verified</span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '8px' }}>@{user.username}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              <MapPin size={13} style={{ color: 'var(--color-teal)' }} />{user.location}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
            <button className="btn-ghost btn-sm"><Settings size={15} /> Ρυθμίσεις</button>
            <button onClick={logout} className="btn-ghost btn-sm" style={{ color: 'var(--color-error)' }}>
              <LogOut size={15} /> Αποσύνδεση
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0',
          marginTop: '24px', borderTop: '1px solid var(--color-border)', paddingTop: '20px',
        }}>
          <Stat icon={<Package size={18} />} value={listingsLoading ? '…' : activeListings.length} label="Ενεργές" />
          <Stat icon={<CheckCircle size={18} />} value={listingsLoading ? '…' : soldListings.length} label="Πωλήσεις" />
          <Stat icon={<Star size={18} />} value="4.9" label="Βαθμολογία" />
          <Stat icon={<MapPin size={18} />} value={purchases.length} label="Αγορές" />
        </div>
      </div>

      {/* ── Stripe Connect Banner ─────────────────────────── */}
      {stripeStatus !== null && !stripeStatus.verified && (
        <div style={{
          background: stripeStatus.connected
            ? 'rgba(245,158,11,0.08)'
            : 'rgba(9,177,186,0.06)',
          border: `1px solid ${stripeStatus.connected ? 'rgba(245,158,11,0.3)' : 'rgba(9,177,186,0.25)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {stripeStatus.connected
                  ? <AlertTriangle size={16} style={{ color: '#f59e0b' }} />
                  : <CreditCard size={16} style={{ color: 'var(--color-teal)' }} />}
                <strong style={{ fontSize: '14px', color: 'var(--color-text)' }}>
                  {stripeStatus.connected ? 'Ολοκλήρωσε το Stripe onboarding' : 'Δέξου πληρωμές ως πωλητής'}
                </strong>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                {stripeStatus.connected
                  ? 'Ο λογαριασμός σου χρειάζεται επιπλέον στοιχεία.'
                  : 'Σύνδεσε Stripe για να λαμβάνεις χρήματα από αγοραστές.'}
              </p>
            </div>
            <button
              onClick={handleStripeConnect}
              disabled={connectLoading}
              className="btn-primary btn-sm"
              style={{ flexShrink: 0 }}
            >
              {connectLoading
                ? <><Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} /> Φόρτωση...</>
                : <><CreditCard size={14} />{stripeStatus.connected ? 'Συνέχισε' : 'Σύνδεσε Stripe'}</>}
            </button>
          </div>
          {/* Error message */}
          {connectError && (
            <div style={{
              marginTop: '12px', padding: '10px 14px',
              background: 'rgba(220,38,38,0.1)',
              border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px', color: 'var(--color-error)',
            }}>
              ⚠️ {connectError}
            </div>
          )}
        </div>
      )}

      {stripeStatus?.verified && (
        <div style={{
          background: 'rgba(16,185,129,0.07)',
          border: '1px solid rgba(16,185,129,0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 20px',
          marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <ShieldCheck size={16} style={{ color: '#10b981' }} />
          <span style={{ fontSize: '13px', color: 'var(--color-text)', fontWeight: 600 }}>
            Stripe Connect ενεργό — μπορείς να λαμβάνεις πληρωμές
          </span>
        </div>
      )}

      {/* ── CTA + Tabs ───────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{
          display: 'flex', gap: '4px', background: 'var(--color-surface-2)',
          borderRadius: 'var(--radius-md)', padding: '4px', width: 'fit-content',
        }}>
          {([
            { id: 'active', label: `Αγγελίες (${activeListings.length})`, icon: <Package size={13} /> },
            { id: 'sold', label: `Πωλήθηκαν (${soldListings.length})`, icon: <CheckCircle size={13} /> },
            { id: 'purchases', label: `Αγορές (${purchases.length})`, icon: <ShoppingBag size={13} /> },
            { id: 'earnings', label: 'Κέρδη', icon: <TrendingUp size={13} /> },
          ] as { id: Tab; label: string; icon: React.ReactNode }[]).map(({ id, label, icon }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '7px 14px', border: 'none', borderRadius: 'var(--radius-sm)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all var(--transition)',
              background: tab === id ? 'var(--color-surface)' : 'transparent',
              color: tab === id ? 'var(--color-text)' : 'var(--color-text-muted)',
              boxShadow: tab === id ? 'var(--shadow-sm)' : 'none',
              whiteSpace: 'nowrap',
            }}>
              {icon}{label}
            </button>
          ))}
        </div>

        <Link href="/listings/new" className="btn-primary btn-sm" style={{ gap: '5px' }}>
          <Plus size={15} /> Νέα αγγελία
        </Link>
      </div>

      {/* ── Tab Content ──────────────────────────────────── */}

      {/* Active & Sold listings */}
      {(tab === 'active' || tab === 'sold') && (
        listingsLoading ? (
          <SkeletonGrid />
        ) : displayedListings.length === 0 ? (
          <EmptyState
            icon={<Package size={40} />}
            title={tab === 'active' ? 'Δεν έχεις ενεργές αγγελίες' : 'Καμία πώληση ακόμα'}
            cta={tab === 'active' ? { label: 'Δημιούργησε την πρώτη σου', href: '/listings/new' } : undefined}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {displayedListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onBuyClick={setCheckoutListing} />
            ))}
          </div>
        )
      )}

      {/* Purchases tab */}
      {tab === 'purchases' && (
        listingsLoading ? <SkeletonGrid rows={3} /> :
        purchases.length === 0 ? (
          <EmptyState icon={<ShoppingBag size={40} />} title="Δεν έχεις κάνει αγορές ακόμα" cta={{ label: 'Εξερεύνησε αγγελίες', href: '/listings' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {purchases.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                isBuyer={true}
                onConfirmDelivery={handleConfirmDelivery}
                confirming={confirmingDelivery === order.id}
                onDispute={(o, role) => setDisputeModal({ order: o, role })}
              />
            ))}
          </div>
        )
      )}

      {/* Earnings tab */}
      {tab === 'earnings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Earnings summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '8px' }}>
            <EarningsCard
              icon={<CheckCircle size={20} style={{ color: '#10b981' }} />}
              label="Ολοκληρωμένα"
              amount={totalEarnings}
              color="rgba(16,185,129,0.1)"
            />
            <EarningsCard
              icon={<Clock size={20} style={{ color: '#f59e0b' }} />}
              label="Σε αναμονή (escrow)"
              amount={pendingEarnings}
              color="rgba(245,158,11,0.1)"
            />
            <EarningsCard
              icon={<Package size={20} style={{ color: 'var(--color-teal)' }} />}
              label="Συνολικές πωλήσεις"
              amount={sales.reduce((s, o) => s + o.amount, 0)}
              color="rgba(9,177,186,0.08)"
            />
          </div>

          {/* Sales orders list */}
          {sales.length === 0 ? (
            <EmptyState icon={<TrendingUp size={40} />} title="Δεν έχεις πωλήσεις ακόμα" />
          ) : (
            sales.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                isBuyer={false}
                onConfirmDelivery={() => {}}
                confirming={false}
                onShip={(o) => setShipModal(o)}
                onDispute={(o, role) => setDisputeModal({ order: o, role })}
              />
            ))
          )}
        </div>
      )}

      <CheckoutModal listing={checkoutListing} onClose={() => setCheckoutListing(null)} />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 8px' }}>
      <div style={{ color: 'var(--color-teal)', display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>{icon}</div>
      <p style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text)' }}>{value}</p>
      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{label}</p>
    </div>
  );
}

function SkeletonGrid({ rows = 4 }: { rows?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ background: 'var(--color-gray-100)', borderRadius: 'var(--radius-lg)', height: '220px', animation: 'pulse 1.5s ease infinite' }} />
      ))}
    </div>
  );
}

function EmptyState({ icon, title, cta }: { icon: React.ReactNode; title: string; cta?: { label: string; href: string } }) {
  return (
    <div style={{ textAlign: 'center', padding: '52px 20px', color: 'var(--color-gray-400)' }}>
      <div style={{ opacity: 0.4, display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>{icon}</div>
      <p style={{ fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '16px' }}>{title}</p>
      {cta && (
        <Link href={cta.href} className="btn-primary btn-sm" style={{ display: 'inline-flex' }}>{cta.label}</Link>
      )}
    </div>
  );
}

function EarningsCard({ icon, label, amount, color }: { icon: React.ReactNode; label: string; amount: number; color: string }) {
  return (
    <div className="card" style={{ padding: '20px', background: color, border: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        {icon}
        <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{label}</span>
      </div>
      <p style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text)' }}>€{amount.toFixed(2)}</p>
    </div>
  );
}

function OrderRow({
  order, isBuyer, onConfirmDelivery, confirming, onShip, onDispute,
}: {
  order: Order;
  isBuyer: boolean;
  onConfirmDelivery: (id: string) => void;
  confirming: boolean;
  onShip?: (order: Order) => void;
  onDispute?: (order: Order, role: 'buyer' | 'seller') => void;
}) {
  const statusColors: Record<string, string> = {
    paid:      'rgba(245,158,11,0.15)',
    shipped:   'rgba(59,130,246,0.15)',
    delivered: 'rgba(16,185,129,0.12)',
    disputed:  'rgba(239,68,68,0.12)',
    cancelled: 'rgba(100,116,139,0.12)',
  };
  const statusLabels: Record<string, string> = {
    paid:      '⏳ Εκκρεμεί',
    shipped:   '📦 Απεστάλη',
    delivered: '✅ Παραδόθηκε',
    disputed:  '⚖️ Υπό Διαφορά',
    cancelled: '❌ Ακυρώθηκε',
  };
  const statusTextColors: Record<string, string> = {
    paid:      '#f59e0b',
    shipped:   '#3b82f6',
    delivered: '#10b981',
    disputed:  '#ef4444',
    cancelled: '#64748b',
  };

  return (
    <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
          background: statusColors[order.status] ?? 'var(--color-surface-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px',
        }}>
          {order.status === 'delivered' ? '✅' : order.status === 'shipped' ? '📦'
            : order.status === 'disputed' ? '⚖️' : order.status === 'cancelled' ? '❌' : '⏳'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: '14px', marginBottom: '2px' }}>
            {order.listing?.title ?? 'Αγγελία'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            {new Date(order.created_at).toLocaleDateString('el-CY', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}<span style={{ fontWeight: 600, color: 'var(--color-text)' }}>€{order.amount.toFixed(2)}</span>
          </p>
          {order.status === 'shipped' && order.tracking_number && (
            <p style={{ fontSize: '11px', color: 'var(--color-teal)', marginTop: '2px', fontWeight: 600 }}>
              🔍 Tracking: {order.tracking_number}{order.courier ? ` (${order.courier})` : ''}
            </p>
          )}
        </div>
        <span style={{
          padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 700,
          background: statusColors[order.status], color: statusTextColors[order.status] ?? 'var(--color-text-muted)',
          whiteSpace: 'nowrap',
        }}>
          {statusLabels[order.status]}
        </span>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingLeft: '60px' }}>
        {/* BUYER: confirm delivery */}
        {isBuyer && (order.status === 'paid' || order.status === 'shipped') && (
          <button onClick={() => onConfirmDelivery(order.id)} disabled={confirming} className="btn-primary btn-sm" style={{ fontSize: '12px' }}>
            {confirming ? <Loader2 size={12} style={{ animation: 'spin 0.7s linear infinite' }} /> : <CheckCircle size={12} />}
            Επιβεβαίωσε παραλαβή
          </button>
        )}
        {/* BUYER: open dispute after shipment */}
        {isBuyer && order.status === 'shipped' && (
          <button onClick={() => onDispute?.(order, 'buyer')} className="btn-ghost btn-sm" style={{ fontSize: '12px', color: 'var(--color-error)', borderColor: 'rgba(220,38,38,0.3)' }}>
            <AlertTriangle size={12} /> Πρόβλημα;
          </button>
        )}
        {/* SELLER: mark shipped */}
        {!isBuyer && order.status === 'paid' && (
          <button onClick={() => onShip?.(order)} className="btn-primary btn-sm" style={{ fontSize: '12px' }}>
            <Send size={12} /> Σήμανση Αποστολής
          </button>
        )}
        {/* SELLER: dispute if buyer not confirming */}
        {!isBuyer && order.status === 'shipped' && (
          <button onClick={() => onDispute?.(order, 'seller')} className="btn-ghost btn-sm" style={{ fontSize: '12px', color: 'var(--color-error)', borderColor: 'rgba(220,38,38,0.3)' }}>
            <AlertTriangle size={12} /> Δεν επιβεβαιώνει;
          </button>
        )}
        {/* Disputed — info message */}
        {order.status === 'disputed' && (
          <span style={{ fontSize: '12px', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} /> Η ομάδα υποστήριξης επεξεργάζεται τη διαφορά.
          </span>
        )}
      </div>
    </div>
  );
}


