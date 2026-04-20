'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/mock-auth';
import { X, Eye, EyeOff, Loader2, Mail, CheckCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register';
}

// Google "G" SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

type ModalStep = 'auth' | 'verify-email';

export default function AuthModal({ open, onClose, defaultTab = 'login' }: Props) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [step, setStep] = useState<ModalStep>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { login, register, loginWithGoogle } = useAuth();

  if (!open) return null;

  const resetForm = () => {
    setEmail(''); setPassword(''); setFullName('');
    setError(''); setShowPassword(false); setStep('auth');
  };

  const switchTab = (t: 'login' | 'register') => { setTab(t); resetForm(); };

  const handleClose = () => { resetForm(); onClose(); };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');
    const result = await loginWithGoogle();
    // Google redirects, so we only handle error case
    if (result.error) {
      setError(result.error);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (tab === 'register' && !acceptedTerms) {
      setError('Πρέπει να αποδεχτείς τους Όρους Χρήσης και την Πολιτική Απορρήτου.');
      return;
    }

    setLoading(true);

    if (tab === 'login') {
      const result = await login(email, password);
      setLoading(false);
      if (result.error) { setError(result.error); }
      else { resetForm(); onClose(); }
    } else {
      const result = await register(fullName, email, password);
      setLoading(false);
      if (result.error) { setError(result.error); }
      else { setStep('verify-email'); }
    }
  };

  // ── Step: Email verification sent ──────────────────
  if (step === 'verify-email') {
    return (
      <div className="overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
        <div className="modal" style={{ maxWidth: '420px' }}>
          <div style={{ padding: '32px 24px 28px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--color-teal-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Mail size={28} style={{ color: 'var(--color-teal)' }} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '12px' }}>
              Επιβεβαίωσε το email σου
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
              Στείλαμε email επιβεβαίωσης στο <strong style={{ color: 'var(--color-text)' }}>{email}</strong>.
              Κλικ στον σύνδεσμο και ο λογαριασμός σου θα ενεργοποιηθεί αμέσως.
            </p>
            <div style={{
              padding: '14px', background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-lg)', marginBottom: '20px',
              border: '1px solid var(--color-border)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <CheckCircle size={14} style={{ color: 'var(--color-teal)', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Έλεγξε τα spam / ανεπιθύμητα</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={14} style={{ color: 'var(--color-teal)', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Ο σύνδεσμος ισχύει για 24 ώρες</span>
              </div>
            </div>
            <button onClick={handleClose} className="btn-primary" style={{ width: '100%' }}>
              Εντάξει, κατάλαβα
            </button>
            <button
              onClick={() => { setStep('auth'); setTab('login'); }}
              className="btn-ghost"
              style={{ width: '100%', marginTop: '8px', fontSize: '13px' }}
            >
              Έχω ήδη επιβεβαιώσει → Σύνδεση
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Step: Auth form ──────────────────────────────
  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal" style={{ maxWidth: '420px' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '24px 24px 0',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <div style={{
                width: '24px', height: '24px',
                background: 'var(--color-teal)', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: '12px' }}>A</span>
              </div>
              <span style={{ fontWeight: 800, color: 'var(--color-text)' }}>
                Agora<span style={{ color: 'var(--color-teal)' }}>.cy</span>
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)' }}>
              {tab === 'login' ? 'Καλώς ήρθες πίσω!' : 'Δημιούργησε λογαριασμό'}
            </h2>
          </div>
          <button onClick={handleClose} className="btn-ghost btn-sm" style={{ padding: '8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Google OAuth button */}
        <div style={{ padding: '20px 24px 0' }}>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              padding: '11px 16px',
              background: 'var(--color-surface)',
              border: '1.5px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px', fontWeight: 600,
              color: 'var(--color-text)',
              cursor: 'pointer', transition: 'all var(--transition)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-teal)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(9,177,186,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {googleLoading
              ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
              : <GoogleIcon />}
            {tab === 'login' ? 'Σύνδεση με Google' : 'Εγγραφή με Google'}
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>ή</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px',
          margin: '0 24px',
          background: 'var(--color-gray-100)',
          borderRadius: 'var(--radius-md)',
          padding: '4px',
        }}>
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              style={{
                flex: 1, padding: '8px', border: 'none',
                borderRadius: 'var(--radius-sm)', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', transition: 'all var(--transition)',
                background: tab === t ? 'var(--color-surface)' : 'transparent',
                color: tab === t ? 'var(--color-text)' : 'var(--color-text-muted)',
                boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {t === 'login' ? 'Σύνδεση' : 'Εγγραφή'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '16px 24px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {tab === 'register' && (
              <div className="form-group">
                <label className="label">Ονοματεπώνυμο</label>
                <input
                  type="text" className="input"
                  placeholder="π.χ. Μαρία Νικολάου"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required autoFocus
                />
              </div>
            )}

            <div className="form-group">
              <label className="label">Email</label>
              <input
                type="email" className="input"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required autoFocus={tab === 'login'}
              />
            </div>

            <div className="form-group">
              <label className="label">Κωδικός πρόσβασης</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input" placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: 'var(--color-text-muted)', cursor: 'pointer', padding: '2px',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(220,38,38,0.12)',
                border: '1px solid rgba(220,38,38,0.25)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-error)', fontSize: '13px', fontWeight: 500,
              }}>
                {error}
              </div>
            )}

            {/* Terms checkbox — register only */}
            {tab === 'register' && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  style={{ marginTop: '2px', accentColor: 'var(--color-teal)', width: '16px', height: '16px', flexShrink: 0 }}
                />
                <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Αποδέχομαι τους{' '}
                  <a href="/terms" target="_blank" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>Όρους Χρήσης</a>
                  {' '}και την{' '}
                  <a href="/gdpr" target="_blank" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>Πολιτική Απορρήτου</a>
                  {' '}της Agora.cy.
                </span>
              </label>
            )}

            <button type="submit" className="btn-primary btn-lg" disabled={loading || (tab === 'register' && !acceptedTerms)} style={{ marginTop: '4px' }}>
              {loading
                ? <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} />
                : tab === 'login' ? 'Σύνδεση' : 'Δημιουργία λογαριασμού'}
            </button>


          </div>
        </form>
      </div>
    </div>
  );
}
