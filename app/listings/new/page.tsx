'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, ChevronLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/mock-auth';
import ImageUpload from '@/components/ImageUpload';
import { CATEGORIES, LOCATIONS, Category, Condition, Location } from '@/lib/mock-data';
import AuthModal from '@/components/AuthModal';
import { createListing } from '@/lib/listings';

type Step = 'photos' | 'details' | 'price';

const CONDITIONS: { value: Condition; label: string; desc: string }[] = [
  { value: 'new', label: 'Καινούργιο', desc: 'Αχρησιμοποίητο, με ετικέτες ή συσκευασία' },
  { value: 'like_new', label: 'Σαν καινούργιο', desc: 'Φορεμένο/χρησιμοποιημένο 1-2 φορές, χωρίς ίχνη χρήσης' },
  { value: 'good', label: 'Καλή κατάσταση', desc: 'Με ελάχιστα σημάδια χρήσης, πλήρως λειτουργικό' },
  { value: 'fair', label: 'Μέτρια κατάσταση', desc: 'Εμφανή σημάδια χρήσης, αλλά λειτουργεί κανονικά' },
];

const STEPS: { id: Step; label: string }[] = [
  { id: 'photos', label: 'Φωτογραφίες' },
  { id: 'details', label: 'Λεπτομέρειες' },
  { id: 'price', label: 'Τιμή & τοποθεσία' },
];

export default function NewListingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [step, setStep] = useState<Step>('photos');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Form state
  const [images, setImages] = useState<string[]>([]);  // preview URLs
  const imageFilesRef = useRef<File[]>([]);             // actual File objects
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [condition, setCondition] = useState<Condition | ''>('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState<Location | ''>('');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!loading && !user) setAuthOpen(true);
  }, [loading, user]);

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const canProceedPhotos = images.length > 0;
  const canProceedDetails = title.trim().length >= 5 && description.trim().length >= 10 && category && condition;
  const canProceedPrice = price && +price > 0 && location;

  const goNext = () => {
    const next = STEPS[stepIndex + 1];
    if (next) setStep(next.id);
  };

  const goPrev = () => {
    const prev = STEPS[stepIndex - 1];
    if (prev) setStep(prev.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { setAuthOpen(true); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      await createListing(
        {
          seller_id: user.id,
          title,
          description,
          category,
          condition: condition as Condition,
          price: +price,
          location,
          status: 'active',
          promoted: false,
          views: 0,
        },
        imageFilesRef.current,
      );
      setDone(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Σφάλμα κατά τη δημοσίευση. Δοκίμασε ξανά.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="container" style={{ paddingTop: '64px', paddingBottom: '64px', maxWidth: '520px', textAlign: 'center' }}>
        <div style={{
          width: '80px', height: '80px',
          background: 'var(--color-teal-light)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          animation: 'bounceIn 0.5s ease',
        }}>
          <CheckCircle size={40} style={{ color: 'var(--color-teal)' }} />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px' }}>Η αγγελία δημοσιεύτηκε! 🎉</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '32px' }}>
          Η αγγελία σου για <strong>"{title}"</strong> είναι τώρα ορατή σε όλους τους χρήστες του Agora.cy.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => { setDone(false); setImages([]); setTitle(''); setDescription(''); setCategory(''); setCondition(''); setPrice(''); setLocation(''); setStep('photos'); }}
            className="btn-outline"
          >
            Νέα αγγελία
          </button>
          <button onClick={() => router.push('/listings')} className="btn-primary">
            Δες τις αγγελίες
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '64px', maxWidth: '700px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => router.back()}
            className="btn-ghost btn-sm"
            style={{ marginBottom: '16px', padding: '6px 10px' }}
          >
            <ArrowLeft size={16} /> Πίσω
          </button>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: 'var(--color-text)' }}>
            Νέα αγγελία
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Πούλησε οτιδήποτε δε χρειάζεσαι πλέον</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '40px' }}>
          {STEPS.map(({ id, label }, i) => {
            const current = id === step;
            const done = stepIndex > i;
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    borderRadius: '50%',
                    background: done ? 'var(--color-teal)' : current ? 'var(--color-teal)' : 'var(--color-gray-200)',
                    color: done || current ? '#fff' : 'var(--color-gray-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '14px',
                    transition: 'all var(--transition)',
                  }}>
                    {done ? <CheckCircle size={18} /> : i + 1}
                  </div>
                  <span style={{
                    fontSize: '12px', fontWeight: current ? 700 : 500,
                    color: current ? 'var(--color-teal)' : done ? 'var(--color-gray-600)' : 'var(--color-gray-400)',
                    whiteSpace: 'nowrap',
                  }}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    background: done ? 'var(--color-teal)' : 'var(--color-gray-200)',
                    margin: '0 8px',
                    marginBottom: '22px',
                    transition: 'background var(--transition)',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>

            {/* Step 1: Photos */}
            {step === 'photos' && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>📸 Φωτογραφίες</h2>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                  Καλές φωτογραφίες αυξάνουν σημαντικά τις πωλήσεις. Πρόσθεσε τουλάχιστον 1.
                </p>
                <ImageUpload
                  images={images}
                  onChange={(previews, files) => {
                    setImages(previews);
                    imageFilesRef.current = files;
                  }}
                />
              </div>
            )}

            {/* Step 2: Details */}
            {step === 'details' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>📝 Λεπτομέρειες</h2>

                <div className="form-group">
                  <label className="label">
                    Τίτλος αγγελίας <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="π.χ. iPhone 13 Pro 256GB - Sierra Blue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                    required
                  />
                  <p style={{ fontSize: '12px', color: 'var(--color-gray-400)', marginTop: '4px' }}>
                    {title.length}/100 χαρακτήρες
                  </p>
                </div>

                <div className="form-group">
                  <label className="label">
                    Περιγραφή <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <textarea
                    className="input"
                    placeholder="Περιέγραψε το αντικείμενο: κατάσταση, ιστορικό, λόγος πώλησης, τι περιλαμβάνεται..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    style={{ resize: 'vertical', minHeight: '120px' }}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="label">
                    Κατηγορία <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="input"
                    required
                  >
                    <option value="">Επίλεξε κατηγορία...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="label">
                    Κατάσταση αντικειμένου <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {CONDITIONS.map(({ value, label, desc }) => (
                      <label
                        key={value}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px 14px',
                          border: `1.5px solid ${condition === value ? 'var(--color-teal)' : 'var(--color-gray-200)'}`,
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          background: condition === value ? 'var(--color-teal-50)' : 'var(--color-surface)',
                          transition: 'all var(--transition)',
                        }}
                      >
                        <input
                          type="radio"
                          name="condition"
                          value={value}
                          checked={condition === value}
                          onChange={() => setCondition(value)}
                          style={{ accentColor: 'var(--color-teal)', marginTop: '2px', flexShrink: 0 }}
                        />
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>{label}</p>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Price & location */}
            {step === 'price' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700 }}>💰 Τιμή & τοποθεσία</h2>

                <div className="form-group">
                  <label className="label">
                    Τιμή (€) <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute', left: '14px', top: '50%',
                      transform: 'translateY(-50%)',
                      fontWeight: 700, fontSize: '16px',
                      color: 'var(--color-text-muted)',
                      pointerEvents: 'none',
                    }}>€</span>
                    <input
                      type="number"
                      min={1}
                      max={99999}
                      placeholder="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="input"
                      style={{ paddingLeft: '30px', fontSize: '20px', fontWeight: 700 }}
                      required
                    />
                  </div>
                  {price && +price > 0 && (
                    <div style={{
                      marginTop: '10px',
                      padding: '12px',
                      background: 'var(--color-surface-2)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '13px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                        <span>Τιμή αντικειμένου</span>
                        <span>€{price}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                        <span>Προστασία αγοραστή (5%)</span>
                        <span>€{(+price * 0.05).toFixed(2)}</span>
                      </div>
                      <hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)', margin: '8px 0' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>Ο αγοραστής πληρώνει</span>
                        <span style={{ color: 'var(--color-teal)' }}>€{(+price * 1.05).toFixed(2)}</span>
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--color-gray-400)', marginTop: '6px' }}>
                        Εσύ λαμβάνεις €{price} χωρίς χρέωση.
                      </p>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="label">
                    Τοποθεσία <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
                    {LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(loc)}
                        style={{
                          padding: '10px 14px',
                          border: `1.5px solid ${location === loc ? 'var(--color-teal)' : 'var(--color-gray-200)'}`,
                          borderRadius: 'var(--radius-md)',
                          background: location === loc ? 'var(--color-teal-50)' : 'var(--color-surface)',
                          color: location === loc ? 'var(--color-teal-dark)' : 'var(--color-gray-700)',
                          fontWeight: location === loc ? 700 : 500,
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all var(--transition)',
                          textAlign: 'left',
                        }}
                      >
                        📍 {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            {stepIndex > 0 ? (
              <button type="button" onClick={goPrev} className="btn-outline">
                <ChevronLeft size={16} /> Πίσω
              </button>
            ) : (
              <div />
            )}

            {step !== 'price' ? (
              <button
                type="button"
                onClick={goNext}
                className="btn-primary"
                disabled={
                  (step === 'photos' && !canProceedPhotos) ||
                  (step === 'details' && !canProceedDetails)
                }
              >
                Συνέχεια <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary btn-lg"
                disabled={!canProceedPrice || submitting}
              >
                {submitting ? (
                  <Loader2 size={18} style={{ animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  'Δημοσίευση αγγελίας 🚀'
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      <AuthModal open={authOpen} onClose={() => { setAuthOpen(false); if (!user) router.push('/'); }} />
    </>
  );
}
