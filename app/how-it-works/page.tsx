'use client';

import Link from 'next/link';



export default function HowItWorksPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-teal-50) 0%, var(--color-bg) 100%)',
        padding: '64px 0',
        textAlign: 'center',
      }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 900, color: 'var(--color-text)', marginBottom: '16px' }}>
            Αγορά & πώληση<br />
            <span style={{ color: 'var(--color-teal)' }}>εύκολα και ασφαλώς</span>
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--color-text-muted)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            Το Agora.cy κάνει τις αγοραπωλησίες απλές, γρήγορες και ασφαλείς για όλους στην Κύπρο.
          </p>
        </div>
      </section>

      {/* For Sellers */}
      <section className="section">
        <div className="container">
          <h2 style={{ fontSize: '28px', fontWeight: 800, textAlign: 'center', marginBottom: '12px', color: 'var(--color-text)' }}>
            Ως Πωλητής
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '48px' }}>
            Πούλα οτιδήποτε δεν χρειάζεσαι — δωρεάν και γρήγορα.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[
              { step: '01', icon: '📸', title: 'Φωτογράφισε', desc: 'Βγάλε μερικές φωτογραφίες με το κινητό σου. Καλές φωτογραφίες πωλούν 3x πιο γρήγορα.' },
              { step: '02', icon: '✍️', title: 'Γράψε αγγελία', desc: 'Τίτλος, περιγραφή, τιμή, τοποθεσία. Σε 2 λεπτά είσαι online.' },
              { step: '03', icon: '💬', title: 'Επικοινώνησε', desc: 'Λαμβάνεις μηνύματα από ενδιαφερόμενους αγοραστές απευθείας στο app.' },
              { step: '04', icon: '💳', title: 'Πληρώσου', desc: 'Αφού ο αγοραστής επιβεβαιώσει παραλαβή, τα χρήματα πηγαίνουν απευθείας σε σένα.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    background: 'var(--color-teal)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: '13px', flexShrink: 0,
                  }}>{step}</div>
                  <span style={{ fontSize: '24px' }}>{icon}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: 'var(--color-text)' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Buyers */}
      <section className="section" style={{ background: 'var(--color-surface-2)' }}>
        <div className="container">
          <h2 style={{ fontSize: '28px', fontWeight: 800, textAlign: 'center', marginBottom: '12px', color: 'var(--color-text)' }}>
            Ως Αγοραστής
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '48px' }}>
            Βρες ό,τι ψάχνεις σε χαμηλή τιμή, με πλήρη προστασία.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
            {[
              { step: '01', icon: '🔍', title: 'Αναζήτησε', desc: 'Χρησιμοποίησε την αναζήτηση ή τα φίλτρα για να βρεις αυτό που ψάχνεις.' },
              { step: '02', icon: '💬', title: 'Ρώτα τον πωλητή', desc: 'Στείλε μήνυμα για ερωτήσεις, επιπλέον φωτογραφίες ή διαπραγμάτευση τιμής.' },
              { step: '03', icon: '🔒', title: 'Αγόρασε με ασφάλεια', desc: 'Πλήρωσε μέσω Stripe. Τα χρήματά σου κρατούνται σε escrow μέχρι παράδοση.' },
              { step: '04', icon: '✅', title: 'Επιβεβαίωσε παραλαβή', desc: 'Ελέγχεις το αντικείμενο και πατάς "Παρέλαβα". Αν κάτι πάει στραβά, επιστρέφεις χρήματα.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{
                    width: '36px', height: '36px',
                    background: 'var(--color-teal)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 800, fontSize: '13px', flexShrink: 0,
                  }}>{step}</div>
                  <span style={{ fontSize: '24px' }}>{icon}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px', color: 'var(--color-text)' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fees */}
      <section className="section">
        <div className="container" style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, textAlign: 'center', marginBottom: '40px', color: 'var(--color-text)' }}>
            Τιμολόγηση
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { who: 'Πωλητής', fee: 'ΔΩΡΕΑΝ', desc: '0% χρέωση για πωλητές. Ανέβασε αγγελίες χωρίς κόστος.' },
              { who: 'Αγοραστής', fee: '5%', desc: 'Προστασία αγοραστή. Καλύπτει fraud protection και buyer guarantee.' },
              { who: 'Promoted listing', fee: '€2-5', desc: 'Προαιρετικό. Boost αγγελίας για 7 μέρες για μεγαλύτερη ορατότητα.' },
            ].map(({ who, fee, desc }) => (
              <div key={who} className="card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  minWidth: '70px',
                  textAlign: 'center',
                  fontSize: '22px',
                  fontWeight: 900,
                  color: 'var(--color-teal)',
                }}>
                  {fee}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px', color: 'var(--color-text)' }}>{who}</p>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--color-teal)', padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
            Έτοιμος να ξεκινήσεις;
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '16px', marginBottom: '32px' }}>
            Εγγραφή σε 30 δευτερόλεπτα. Η πρώτη αγγελία σε 2 λεπτά.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/listings/new" style={{
              padding: '14px 28px',
              background: 'var(--color-surface)',
              color: 'var(--color-teal)',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '16px',
              transition: 'transform var(--transition)',
            }}>
              Πούλησε τώρα
            </Link>
            <Link href="/listings" style={{
              padding: '14px 28px',
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: '2px solid rgba(255,255,255,0.4)',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: '16px',
            }}>
              Δες αγγελίες
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
