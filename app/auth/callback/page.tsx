'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const supabase = createClient();

    // The browser client automatically handles the PKCE code exchange
    // when it detects the code in the URL
    const handleCallback = async () => {
      try {
        // Check if there's already a valid session (implicit flow handled automatically)
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          setStatus('success');
          setTimeout(() => router.push('/'), 1000);
          return;
        }

        // Try PKCE code exchange manually
        const code = new URLSearchParams(window.location.search).get('code');
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Auth callback error:', error);
            setErrorMsg(error.message);
            setStatus('error');
            setTimeout(() => router.push('/'), 2000);
            return;
          }
          setStatus('success');
          setTimeout(() => router.push('/'), 800);
          return;
        }

        // No code, no session
        setStatus('error');
        setErrorMsg('Δεν βρέθηκε κωδικός επιβεβαίωσης.');
        setTimeout(() => router.push('/'), 2000);
      } catch (err) {
        console.error('Callback exception:', err);
        setStatus('error');
        setErrorMsg('Σφάλμα σύνδεσης. Δοκίμασε ξανά.');
        setTimeout(() => router.push('/'), 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg)',
      flexDirection: 'column', gap: '16px',
      textAlign: 'center', padding: '20px',
    }}>
      {status === 'loading' && (
        <>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--color-teal-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Loader2 size={28} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--color-teal)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '8px' }}>
              Σύνδεση σε εξέλιξη...
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Επαλήθευση λογαριασμού Google
            </p>
          </div>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'var(--color-teal-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'bounceIn 0.4s ease',
          }}>
            <CheckCircle size={28} style={{ color: 'var(--color-teal)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '8px' }}>
              Συνδέθηκες! 🎉
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Μεταφορά στην αρχική...
            </p>
          </div>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'rgba(220,38,38,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertCircle size={28} style={{ color: 'var(--color-error)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '8px' }}>
              Κάτι πήγε στραβά
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              {errorMsg || 'Δοκίμασε να συνδεθείς ξανά.'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
