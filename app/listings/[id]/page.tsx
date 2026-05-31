'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin, Eye, Heart, Share2, Shield, Star, ChevronLeft, ChevronRight, MessageCircle, Zap,
  CheckCircle, Clock, Loader2
} from 'lucide-react';
import { CONDITION_LABELS } from '@/lib/mock-data';
import ListingCard from '@/components/ListingCard';
import CheckoutModal from '@/components/CheckoutModal';
import MessageModal from '@/components/MessageModal';
import { getListingById, getListingsByUser, getImages, type Listing } from '@/lib/listings';

export default function ListingDetailPage() {
  const params = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [sellerListings, setSellerListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    getListingById(id).then((data) => {
      setListing(data);
      setLoading(false);
      if (data) {
        getListingsByUser(data.seller_id, 'active').then((others) =>
          setSellerListings(others.filter((l) => l.id !== id).slice(0, 4))
        );
      }
    });
  }, [params.id]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--color-teal)', margin: '0 auto' }} />
      </div>
    );
  }

  if (!listing) return (
    <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
      <h2>Η αγγελία δεν βρέθηκε</h2>
      <Link href="/listings" className="btn-primary" style={{ marginTop: '20px', display: 'inline-flex' }}>Πίσω στις αγγελίες</Link>
    </div>
  );

  const images = getImages(listing);
  const seller = listing.profiles;
  const sellerName = seller?.full_name ?? 'Πωλητής';
  const sellerAvatar = seller?.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${listing.seller_id}`;
  const sellerUsername = seller?.username ?? '';
  const sellerRating = seller?.rating ?? 0;
  const sellerReviewCount = seller?.review_count ?? 0;
  const sellerLocation = seller?.location ?? listing.location;
  const sellerVerified = seller?.verified ?? false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sellerMemberSince = (seller as any)?.created_at ? formatDate((seller as any).created_at) : '';

  const isSold = listing.status === 'sold';
  const buyerProtectionFee = +(listing.price * 0.05).toFixed(2);

  const prevPhoto = () => setPhotoIdx((i) => (i - 1 + images.length) % images.length);
  const nextPhoto = () => setPhotoIdx((i) => (i + 1) % images.length);

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      {/* Breadcrumb */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
        <Link href="/" style={{ color: 'var(--color-text-muted)' }}>Αρχική</Link>
        <span>/</span>
        <Link href="/listings" style={{ color: 'var(--color-text-muted)' }}>Αγγελίες</Link>
        <span>/</span>
        <Link href={`/listings?category=${listing.category}`} style={{ color: 'var(--color-text-muted)' }}>{listing.category}</Link>
        <span>/</span>
        <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{listing.title.slice(0, 30)}...</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }} className="listing-grid">
        {/* Left col */}
        <div>
          {/* Photo gallery */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              background: 'var(--color-gray-100)',
              aspectRatio: '4/3',
            }}>
              <img
                src={images[photoIdx]}
                alt={listing.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s ease' }}
              />

              {isSold && (
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.5)',
                }}>
                  <span className="badge-sold" style={{ fontSize: '18px', padding: '10px 24px' }}>Πουλήθηκε</span>
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button onClick={prevPhoto} style={arrowBtn('left')}><ChevronLeft size={20} /></button>
                  <button onClick={nextPhoto} style={arrowBtn('right')}><ChevronRight size={20} /></button>
                  <div style={{
                    position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', gap: '6px',
                  }}>
                    {images.map((_, i) => (
                      <button key={i} onClick={() => setPhotoIdx(i)} style={{
                        width: i === photoIdx ? '20px' : '8px', height: '8px', borderRadius: '4px',
                        background: i === photoIdx ? '#fff' : 'rgba(255,255,255,0.5)',
                        border: 'none', cursor: 'pointer', transition: 'all var(--transition)', padding: 0,
                      }} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setPhotoIdx(i)} style={{
                  width: '72px', height: '72px',
                  border: i === photoIdx ? '2.5px solid var(--color-teal)' : '2px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius-md)', overflow: 'hidden',
                  cursor: 'pointer', padding: 0, flexShrink: 0, transition: 'border-color var(--transition)',
                }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}

          {/* Title & details */}
          <h1 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '12px', lineHeight: 1.2 }}>
            {listing.title}
          </h1>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <span className="badge-gray">{CONDITION_LABELS[listing.condition]}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              <MapPin size={13} />{listing.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              <Eye size={13} />{listing.views} προβολές
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              <Clock size={13} />{formatDate(listing.created_at)}
            </span>
          </div>

          {/* Description */}
          <div className="card" style={{ padding: '20px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--color-text)' }}>Περιγραφή</h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {listing.description}
            </p>
          </div>

          {/* Category */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginRight: '8px' }}>Κατηγορία:</span>
            <Link href={`/listings?category=${listing.category}`} style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '4px 12px', background: 'var(--color-teal-light)',
              color: 'var(--color-teal-dark)', borderRadius: 'var(--radius-full)',
              fontSize: '13px', fontWeight: 600,
            }}>
              {listing.category}
            </Link>
          </div>

          {/* Seller listings */}
          {sellerListings.length > 0 && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-text)' }}>
                Άλλες αγγελίες από τον πωλητή
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px' }}>
                {sellerListings.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right col — sticky purchase card */}
        <div style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Price card */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '36px', fontWeight: 900, color: 'var(--color-text)' }}>€{listing.price}</span>
              {listing.promoted && (
                <span className="badge-promoted" style={{ marginLeft: '10px', verticalAlign: 'middle' }}>★ Προωθημένο</span>
              )}
            </div>

            <div style={{ padding: '12px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--color-text-muted)' }}>
                <span>Τιμή αντικειμένου</span><span>€{listing.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--color-text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={12} style={{ color: 'var(--color-teal)' }} /> Προστασία αγοραστή
                </span>
                <span>€{buyerProtectionFee}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--color-gray-200)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>Σύνολο</span><span>€{(listing.price + buyerProtectionFee).toFixed(2)}</span>
              </div>
            </div>

            {isSold ? (
              <div style={{ padding: '14px', background: 'var(--color-gray-100)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                Αυτό το αντικείμενο έχει πουληθεί
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => setCheckoutOpen(true)} className="btn-primary btn-lg" style={{ width: '100%', gap: '6px' }}>
                  <Zap size={17} /> Αγορά τώρα
                </button>
                <button
                  onClick={() => setMessageOpen(true)}
                  className="btn-outline btn-lg"
                  style={{ width: '100%', gap: '6px' }}
                >
                  <MessageCircle size={17} /> Στείλε μήνυμα
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={() => setWishlisted((w) => !w)} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)', cursor: 'pointer', fontSize: '13px',
                color: wishlisted ? '#ec4899' : 'var(--color-gray-500)', transition: 'all var(--transition)',
              }}>
                <Heart size={14} fill={wishlisted ? '#ec4899' : 'none'} />
                {wishlisted ? 'Αποθηκεύτηκε' : 'Αποθήκευση'}
              </button>
              <button style={{
                padding: '8px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px',
              }}>
                <Share2 size={14} /> Κοινοποίηση
              </button>
            </div>
          </div>

          {/* Seller card */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <img src={sellerAvatar} alt={sellerName} width={48} height={48}
                style={{ borderRadius: '50%', background: 'var(--color-gray-100)' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <p style={{ fontWeight: 700, fontSize: '15px' }}>{sellerName}</p>
                  {sellerVerified && <CheckCircle size={15} style={{ color: 'var(--color-teal)' }} />}
                </div>
                {sellerUsername && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>@{sellerUsername}</p>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '14px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b' }}>
                  <Star size={14} fill="#f59e0b" />
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>{Number(sellerRating).toFixed(1)}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{sellerReviewCount} αξιολογήσεις</p>
              </div>
              <div style={{ width: '1px', background: 'var(--color-gray-200)' }} />
              <div>
                <p style={{ fontWeight: 600, fontSize: '14px' }}>{sellerLocation}</p>
                {sellerMemberSince && <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Μέλος από {sellerMemberSince}</p>}
              </div>
            </div>

            <Link href={`/profile/${listing.seller_id}`} className="btn-outline btn-sm" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              Δες το προφίλ
            </Link>
          </div>

          {/* Safety info */}
          <div style={{ padding: '14px', background: 'var(--color-teal-50)', border: '1px solid rgba(9,177,186,0.2)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <Shield size={16} style={{ color: 'var(--color-teal)', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-teal-dark)', marginBottom: '4px' }}>Ασφαλής αγορά</p>
                <p style={{ fontSize: '12px', color: 'var(--color-teal-dark)', opacity: 0.8, lineHeight: 1.5 }}>
                  Τα χρήματά σου κρατούνται σε escrow και αποδεσμεύονται μόλις επιβεβαιώσεις παραλαβή.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal listing={checkoutOpen ? listing : null} onClose={() => setCheckoutOpen(false)} />

      <style jsx global>{`
        @media (max-width: 900px) {
          .listing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <CheckoutModal listing={checkoutOpen ? listing : null} onClose={() => setCheckoutOpen(false)} />
      <MessageModal
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
        listingPrice={listing.price}
        listingImage={images[0]}
        sellerId={listing.seller_id}
        sellerName={sellerName}
        sellerAvatar={sellerAvatar}
      />
    </div>
  );
}

function arrowBtn(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute', top: '50%', [side]: '12px',
    transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)',
    border: 'none', borderRadius: '50%', width: '38px', height: '38px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: 'var(--shadow-md)', transition: 'all var(--transition)',
  };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('el-CY', { day: 'numeric', month: 'long', year: 'numeric' });
}
