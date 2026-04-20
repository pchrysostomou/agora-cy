'use client';

import { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { Listing } from '@/lib/listings';
import { useAuth } from '@/lib/mock-auth';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Props {
  listing: Listing | null;
  onClose: () => void;
}

type Step = 'summary' | 'payment' | 'success';

interface PaymentData {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;       // total in cents (price + fee) — matches API response
  priceCents: number;
  feeCents: number;
}

function getMainImage(listing: Listing): string {
  if (!listing.listing_images?.length) return '';
  const primary = listing.listing_images.find((img) => img.is_primary);
  if (primary) return primary.url;
  return [...listing.listing_images].sort((a, b) => a.position - b.position)[0]?.url ?? '';
}

// ─── Inner payment form (needs Stripe context) ─────────────────────────────
function StripePaymentForm({
  paymentData,
  listing,
  buyerId,
  onSuccess,
  onBack,
}: {
  paymentData: PaymentData;
  listing: Listing;
  buyerId: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = (paymentData.amount / 100).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    // Confirm payment with Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Σφάλμα πληρωμής. Δοκίμασε ξανά.');
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      // Fire-and-forget: create order in DB
      // Even if this fails, the payment went through — always show success
      fetch('/api/checkout/confirm-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          listingId: listing.id,
          buyerId,
        }),
      }).catch((err) => console.error('[confirm-order]', err));

      onSuccess();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      <div style={{
        padding: '12px 14px', marginBottom: '20px',
        background: 'var(--color-surface-2)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Σύνολο</span>
        <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text)' }}>€{total}</span>
      </div>

      <PaymentElement
        options={{
          layout: 'accordion',
          defaultValues: {},
        }}
      />

      {error && (
        <div style={{
          margin: '14px 0 0',
          padding: '10px 14px',
          background: 'rgba(220,38,38,0.12)',
          border: '1px solid rgba(220,38,38,0.25)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-error)',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button type="button" onClick={onBack} className="btn-outline" style={{ flex: 1 }} disabled={loading}>
          <ArrowLeft size={15} /> Πίσω
        </button>
        <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading || !stripe}>
          {loading
            ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
            : `Πλήρωσε €${total}`}
        </button>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '6px', marginTop: '12px',
        color: 'var(--color-text-muted)', fontSize: '12px',
      }}>
        <Shield size={12} style={{ color: 'var(--color-teal)' }} />
        Ασφαλής πληρωμή μέσω Stripe
      </div>
    </form>
  );
}

// ─── Main modal ─────────────────────────────────────────────────────────────
export default function CheckoutModal({ listing, onClose }: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('summary');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [intentError, setIntentError] = useState('');
  const [confetti, setConfetti] = useState<{ x: number; y: number; color: string; id: number }[]>([]);

  const CONFETTI_COLORS = ['#09B1BA', '#f59e0b', '#ec4899', '#8b5cf6', '#10b981'];

  if (!listing) return null;

  const sellerName = listing.profiles?.full_name ?? 'Πωλητής';
  const sellerVerified = listing.profiles?.verified ?? false;
  const imageUrl = getMainImage(listing);
  const fee = +(listing.price * 0.05).toFixed(2);
  const total = +(listing.price + fee).toFixed(2);

  const handleContinueToPayment = async () => {
    setLoadingIntent(true);
    setIntentError('');

    try {
      const res = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          buyerId: user?.id || 'mock-buyer',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setIntentError(data.error || 'Σφάλμα σύνδεσης με Stripe');
        setLoadingIntent(false);
        return;
      }

      setPaymentData(data);
      setStep('payment');
    } catch (err) {
      setIntentError('Σφάλμα δικτύου. Δοκίμασε ξανά.');
    }
    setLoadingIntent(false);
  };

  const handleSuccess = () => {
    const pieces = Array.from({ length: 35 }, (_, i) => ({
      id: i, x: Math.random() * 100, y: Math.random() * 60,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    }));
    setConfetti(pieces);
    setStep('success');
  };

  const handleClose = () => {
    setStep('summary');
    setPaymentData(null);
    setConfetti([]);
    setIntentError('');
    onClose();
  };

  const stripeOptions = paymentData ? {
    clientSecret: paymentData.clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#09B1BA',
        colorBackground: 'var(--color-surface)',
        colorText: '#111827',
        colorDanger: '#dc2626',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '8px',
      },
    },
  } : null;

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}
      style={{ alignItems: 'flex-start', paddingTop: '5vh', paddingBottom: '5vh' }}
    >
      <div className="modal" style={{ maxWidth: '440px', width: '100%', position: 'relative', overflow: 'visible', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>

        {/* Confetti */}
        {confetti.map((p) => (
          <div key={p.id} style={{
            position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
            width: '8px', height: '8px', borderRadius: '2px',
            background: p.color,
            animation: 'confettiFall 1.5s ease forwards',
            animationDelay: `${Math.random() * 0.5}s`,
            zIndex: 10, pointerEvents: 'none',
          }} />
        ))}

        {/* Header — sticky */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          position: 'sticky', top: 0, zIndex: 2,
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>
            {step === 'summary' && 'Σύνοψη αγοράς'}
            {step === 'payment' && 'Πληρωμή'}
            {step === 'success' && 'Αγορά ολοκληρώθηκε!'}
          </h2>
          <button onClick={handleClose} className="btn-ghost btn-sm" style={{ padding: '8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>

        {/* Step: Summary */}
        {step === 'summary' && (
          <div style={{ padding: '20px' }}>
            <div style={{
              display: 'flex', gap: '14px', padding: '14px',
              background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', marginBottom: '20px',
            }}>
              {imageUrl && (
                <img src={imageUrl} alt={listing.title} style={{
                  width: '72px', height: '72px', objectFit: 'cover',
                  borderRadius: 'var(--radius-md)', flexShrink: 0,
                }} />
              )}
              <div>
                <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px', color: 'var(--color-text)' }}>{listing.title}</p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Πωλητής: {sellerName}</p>
                {sellerVerified && (
                  <span className="badge-teal" style={{ fontSize: '11px', marginTop: '4px' }}>✓ Επαληθεύτηκε</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <PriceLine label="Τιμή αντικειμένου" value={`€${listing.price}`} />
              <PriceLine
                label={<span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Shield size={13} style={{ color: 'var(--color-teal)' }} />
                  Προστασία αγοραστή (5%)
                </span>}
                value={`€${fee}`}
                sub="Escrow — αποδεσμεύεται μόλις παραλάβεις"
              />
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '10px' }}>
                <PriceLine label="Σύνολο" value={`€${total}`} bold />
              </div>
            </div>

            <div style={{
              padding: '12px',
              background: 'var(--color-teal-50)',
              border: '1px solid rgba(9,177,186,0.2)',
              borderRadius: 'var(--radius-md)', marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <Shield size={16} style={{ color: 'var(--color-teal)', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '13px', color: 'var(--color-teal-dark)', lineHeight: 1.5 }}>
                  Τα χρήματά σου κρατούνται σε escrow. Θα αποδεσμευτούν μόλις επιβεβαιώσεις παραλαβή.
                </p>
              </div>
            </div>

            {intentError && (
              <div style={{
                padding: '10px 14px', marginBottom: '14px',
                background: 'rgba(220,38,38,0.12)',
                border: '1px solid rgba(220,38,38,0.25)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-error)', fontSize: '13px',
              }}>
                {intentError}
              </div>
            )}

            <button
              onClick={handleContinueToPayment}
              className="btn-primary btn-lg"
              style={{ width: '100%' }}
              disabled={loadingIntent}
            >
              {loadingIntent
                ? <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} />
                : 'Συνέχεια στην πληρωμή →'}
            </button>
          </div>
        )}

        {/* Step: Payment — Stripe Payment Element */}
        {step === 'payment' && paymentData && stripeOptions && (
          <Elements stripe={stripePromise} options={stripeOptions}>
            <StripePaymentForm
              paymentData={paymentData}
              listing={listing}
              buyerId={user?.id || 'mock-buyer'}
              onSuccess={handleSuccess}
              onBack={() => setStep('summary')}
            />
          </Elements>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div style={{ padding: '32px 24px 28px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '72px', height: '72px',
              background: 'var(--color-teal-light)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'bounceIn 0.5s ease',
            }}>
              <CheckCircle size={36} style={{ color: 'var(--color-teal)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: 'var(--color-text)' }}>Η αγορά ολοκληρώθηκε! 🎉</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.5 }}>
                Πληρώσατε <strong>€{total}</strong>. Ο πωλητής θα επικοινωνήσει μαζί σου σύντομα.
                Τα χρήματα κρατούνται σε escrow μέχρι να επιβεβαιώσεις παραλαβή.
              </p>
            </div>
            <div style={{ width: '100%', padding: '14px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-lg)', textAlign: 'left' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>🔒 Τα χρήματά σου είναι ασφαλή</p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '6px' }}>📦 Ο πωλητής έχει 3 μέρες για αποστολή</p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>✅ Επιβεβαίωσε παραλαβή για να ολοκληρωθεί η πληρωμή</p>
            </div>
            <button onClick={handleClose} className="btn-primary" style={{ width: '100%' }}>Κλείσιμο</button>
          </div>
        )}
        </div>{/* end scrollable body */}
      </div>
    </div>
  );
}

function PriceLine({ label, value, sub, bold }: { label: React.ReactNode; value: string; sub?: string; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '14px', fontWeight: bold ? 700 : 400, color: 'var(--color-text-2)' }}>{label}</p>
        {sub && <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{sub}</p>}
      </div>
      <span style={{ fontSize: '14px', fontWeight: bold ? 700 : 500, color: bold ? 'var(--color-text)' : 'var(--color-text-2)' }}>
        {value}
      </span>
    </div>
  );
}
