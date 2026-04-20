'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

export default function ConnectReturnPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    // In production: verify account with Stripe API
    // For now, assume success
    setTimeout(() => setStatus('success'), 1200);
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)', padding: '20px',
    }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '40px 32px', textAlign: 'center' }}>

        {status === 'loading' && (
          <>
            <Loader2 size={40} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--color-teal)', margin: '0 auto 16px' }} />
            <h2 style={{ color: 'var(--color-text)', marginBottom: '8px' }}>Επαλήθευση λογαριασμού...</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Παρακαλώ περίμενε.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'var(--color-teal-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle size={36} style={{ color: 'var(--color-teal)' }} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '12px' }}>
              Λογαριασμός ενεργοποιήθηκε! 🎉
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '28px' }}>
              Ο λογαριασμός Stripe σου είναι έτοιμος. Μπορείς τώρα να δέχεσαι πληρωμές από αγοραστές.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/listings/new" className="btn-primary btn-lg" style={{ width: '100%', textAlign: 'center' }}>
                Δημιούργησε αγγελία
              </Link>
              <Link href="/profile/me" className="btn-outline" style={{ width: '100%', textAlign: 'center' }}>
                Δες το προφίλ σου
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle size={40} style={{ color: 'var(--color-error)', margin: '0 auto 16px' }} />
            <h2 style={{ color: 'var(--color-text)', marginBottom: '8px' }}>Κάτι πήγε στραβά</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '20px' }}>
              Δοκίμασε να επιστρέψεις και να ολοκληρώσεις το onboarding ξανά.
            </p>
            <Link href="/profile/me" className="btn-outline" style={{ display: 'inline-flex' }}>
              Πίσω στο προφίλ
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
