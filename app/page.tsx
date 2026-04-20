'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, ArrowRight, Shield, Zap, Star } from 'lucide-react';
import { CATEGORIES, CATEGORY_ICONS, Category } from '@/lib/mock-data';
import ListingCard from '@/components/ListingCard';
import CheckoutModal from '@/components/CheckoutModal';
import { getListings, type Listing } from '@/lib/listings';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [checkoutListing, setCheckoutListing] = useState<Listing | null>(null);
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);

  useEffect(() => {
    getListings({}, 8).then(setFeaturedListings).catch(() => setFeaturedListings([]));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/listings?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-teal-50) 0%, var(--color-bg) 50%, var(--color-surface-2) 100%)',
        padding: '64px 0 80px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-80px',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(9,177,186,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-60px',
          left: '-60px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(9,177,186,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: 'var(--color-teal-light)',
            borderRadius: 'var(--radius-full)',
            marginBottom: '20px',
          }}>
            <Star size={12} style={{ color: 'var(--color-teal)' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-teal-dark)' }}>
              Το νέο marketplace της Κύπρου
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(32px, 6vw, 60px)',
            fontWeight: 900,
            color: 'var(--color-text)',
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
            marginBottom: '20px',
          }}>
            Αγόρασε & Πούλησε<br />
            <span style={{ color: 'var(--color-teal)' }}>στην Κύπρο</span>
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'var(--color-text-muted)',
            maxWidth: '520px',
            margin: '0 auto 40px',
            lineHeight: 1.6,
          }}>
            Χιλιάδες μεταχειρισμένα αντικείμενα σε μία πλατφόρμα.
            Ασφαλείς πληρωμές, προστασία αγοραστή, τοπική αγορά.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ maxWidth: '580px', margin: '0 auto 32px' }}>
            <div style={{
              display: 'flex',
              background: 'var(--color-surface)',
              border: '2px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-full)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              transition: 'border-color var(--transition)',
            }}
              onFocus={() => {}}
            >
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{
                  position: 'absolute',
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-gray-400)',
                  pointerEvents: 'none',
                }} />
                <input
                  type="search"
                  placeholder="π.χ. iPhone 13, ποδήλατο, καναπές..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 16px 16px 52px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '16px',
                    color: 'var(--color-text)',
                    background: 'transparent',
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                style={{ borderRadius: '0 999px 999px 0', padding: '16px 28px', fontSize: '15px' }}
              >
                Αναζήτηση
              </button>
            </div>
          </form>

          {/* Quick searches */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['iPhone', 'Ποδήλατο', 'PlayStation', 'IKEA', 'Nike'].map((term) => (
              <Link
                key={term}
                href={`/listings?q=${encodeURIComponent(term)}`}
                style={{
                  padding: '6px 14px',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                  transition: 'all var(--transition)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-teal)';
                  e.currentTarget.style.color = 'var(--color-teal)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                }}
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <section style={{
        background: 'var(--color-surface-2)',
        borderTop: '1px solid var(--color-border)',
        borderBottom: '1px solid var(--color-border)',
        padding: '20px 0',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0',
            textAlign: 'center',
          }}>
            {[
              { value: '2,400+', label: 'Αγγελίες' },
              { value: '5,800+', label: 'Χρήστες' },
              { value: '1,200+', label: 'Συναλλαγές' },
            ].map(({ value, label }) => (
              <div key={label} style={{ padding: '16px' }}>
                <p style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: 'var(--color-teal)', marginBottom: '2px' }}>{value}</p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: 'var(--color-text)' }}>
              Κατηγορίες
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: '12px',
          }}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/listings?category=${encodeURIComponent(cat)}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 8px',
                  background: 'var(--color-surface)',
                  border: '1.5px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  textAlign: 'center',
                  transition: 'all var(--transition)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-teal)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-gray-200)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <span style={{ fontSize: '28px' }}>{CATEGORY_ICONS[cat as Category]}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-2)', lineHeight: 1.2 }}>
                  {cat}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Listings ────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--color-surface-2)', paddingTop: '40px', paddingBottom: '40px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px' }}>
                Τελευταίες αγγελίες
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Ανακάλυψε τι πουλιέται τώρα</p>
            </div>
            <Link
              href="/listings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--color-teal)',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'gap var(--transition)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.gap = '8px')}
              onMouseLeave={(e) => (e.currentTarget.style.gap = '4px')}
            >
              Δες όλες <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            {featuredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onBuyClick={setCheckoutListing}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <h2 style={{
            fontSize: 'clamp(22px, 3vw, 30px)',
            fontWeight: 800,
            textAlign: 'center',
            marginBottom: '48px',
            color: 'var(--color-text)',
          }}>
            Πώς λειτουργεί
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px',
          }}>
            {[
              {
                icon: '📸',
                step: '01',
                title: 'Ανέβασε αγγελία',
                desc: 'Φωτογράφισε, γράψε περιγραφή, βάλε τιμή. Σε λιγότερο από 2 λεπτά.',
              },
              {
                icon: '💬',
                step: '02',
                title: 'Επικοινώνησε',
                desc: 'Ο αγοραστής σου στέλνει μήνυμα. Συμφωνείτε για συνάντηση ή αποστολή.',
              },
              {
                icon: '💳',
                step: '03',
                title: 'Πούλησε με ασφάλεια',
                desc: 'Ασφαλής πληρωμή με escrow. Παίρνεις τα χρήματα μόλις παραδοθεί.',
              },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="card" style={{ padding: '28px', textAlign: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  background: 'var(--color-teal-light)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: '28px',
                }}>
                  {icon}
                </div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-teal)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  Βήμα {step}
                </span>
                <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '8px 0', color: 'var(--color-text)' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust signals ────────────────────────────────────── */}
      <section style={{ background: 'var(--color-teal)', padding: '40px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            textAlign: 'center',
          }}>
            {[
              { icon: <Shield size={24} />, title: 'Προστασία αγοραστή', desc: 'Επιστροφή χρημάτων αν κάτι πάει στραβά' },
              { icon: <Zap size={24} />, title: 'Γρήγορες πληρωμές', desc: 'Πληρώνεσαι σε 2-3 εργάσιμες' },
              { icon: <Star size={24} />, title: 'Αξιολογήσεις χρηστών', desc: 'Δες ποιος είναι αξιόπιστος πριν αγοράσεις' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ color: '#fff' }}>
                <div style={{ opacity: 0.8, marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>{title}</h3>
                <p style={{ fontSize: '13px', opacity: 0.85, lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 800, marginBottom: '16px', color: 'var(--color-text)' }}>
            Έτοιμος να ξεκινήσεις;
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '16px', marginBottom: '32px' }}>
            Εγγραφή δωρεάν. Ανέβασε την πρώτη σου αγγελία σε 2 λεπτά.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/listings/new" className="btn-primary btn-lg">
              Πούλησε τώρα
            </Link>
            <Link href="/listings" className="btn-outline btn-lg">
              Εξερεύνησε αγγελίες
            </Link>
          </div>
        </div>
      </section>

      <CheckoutModal listing={checkoutListing} onClose={() => setCheckoutListing(null)} />
    </>
  );
}
