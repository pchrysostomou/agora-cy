'use client';

import Link from 'next/link';
import { MapPin, Eye, Zap } from 'lucide-react';
import type { Listing } from '@/lib/listings';

export const CONDITION_LABELS: Record<string, string> = {
  new: 'Καινούργιο',
  like_new: 'Σαν καινούργιο',
  good: 'Καλή κατάσταση',
  fair: 'Μέτρια κατάσταση',
};

function getMainImage(listing: Listing): string {
  if (!listing.listing_images?.length) {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80';
  }
  const primary = listing.listing_images.find((img) => img.is_primary);
  if (primary) return primary.url;
  const sorted = [...listing.listing_images].sort((a, b) => a.position - b.position);
  return sorted[0]?.url ?? '';
}

interface Props {
  listing: Listing;
  onBuyClick?: (listing: Listing) => void;
  view?: 'grid' | 'list';
}

export default function ListingCard({ listing, onBuyClick, view = 'grid' }: Props) {
  const isSold = listing.status === 'sold';
  const imageUrl = getMainImage(listing);
  const imageCount = listing.listing_images?.length ?? 0;

  if (view === 'list') {
    return (
      <div
        className="card-hover"
        style={{
          display: 'flex',
          gap: '16px',
          padding: '16px',
          opacity: isSold ? 0.7 : 1,
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={imageUrl}
            alt={listing.title}
            style={{
              width: '120px',
              height: '120px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-gray-100)',
            }}
          />
          {isSold && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.45)',
              borderRadius: 'var(--radius-md)',
            }}>
              <span className="badge-sold">Πουλήθηκε</span>
            </div>
          )}
          {listing.promoted && !isSold && (
            <div style={{ position: 'absolute', top: '6px', left: '6px' }}>
              <span className="badge-promoted" style={{ fontSize: '10px', padding: '2px 7px' }}>
                ★ Προωθημένο
              </span>
            </div>
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <Link href={`/listings/${listing.id}`}>
              <h3 style={{
                fontSize: '15px', fontWeight: 600,
                color: 'var(--color-text)', lineHeight: 1.3,
              }}>
                {listing.title}
              </h3>
            </Link>
            <span style={{
              fontSize: '18px', fontWeight: 700,
              color: 'var(--color-teal)', flexShrink: 0,
            }}>
              €{listing.price}
            </span>
          </div>

          <p style={{
            fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {listing.description}
          </p>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
            <span className="badge-gray">{CONDITION_LABELS[listing.condition]}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-gray-400)', fontSize: '12px' }}>
              <MapPin size={11} /> {listing.location}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--color-gray-400)', fontSize: '12px' }}>
              <Eye size={11} /> {listing.views}
            </span>
          </div>
        </div>

        {!isSold && onBuyClick && (
          <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <button onClick={() => onBuyClick(listing)} className="btn-primary btn-sm">
              Αγορά
            </button>
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <div className="card-hover" style={{ overflow: 'hidden', opacity: isSold ? 0.75 : 1 }}>
      {/* Image */}
      <Link href={`/listings/${listing.id}`} style={{ display: 'block', position: 'relative' }}>
        <div style={{ position: 'relative', paddingBottom: '100%', overflow: 'hidden', background: 'var(--color-gray-100)' }}>
          <img
            src={imageUrl}
            alt={listing.title}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.35s ease',
            }}
            onMouseEnter={(e) => !isSold && ((e.target as HTMLImageElement).style.transform = 'scale(1.06)')}
            onMouseLeave={(e) => ((e.target as HTMLImageElement).style.transform = 'scale(1)')}
          />

          {isSold && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.4)',
            }}>
              <span className="badge-sold" style={{ fontSize: '14px', padding: '6px 16px' }}>Πουλήθηκε</span>
            </div>
          )}
          {listing.promoted && !isSold && (
            <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
              <span className="badge-promoted" style={{ fontSize: '10px', padding: '2px 8px' }}>★ Προωθημένο</span>
            </div>
          )}
          {imageCount > 1 && (
            <div style={{
              position: 'absolute', bottom: '8px', right: '8px',
              background: 'rgba(0,0,0,0.6)', color: '#fff',
              fontSize: '11px', fontWeight: 600,
              padding: '2px 7px', borderRadius: 'var(--radius-full)',
            }}>
              +{imageCount - 1}
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            fontSize: '18px', fontWeight: 700,
            color: isSold ? 'var(--color-gray-400)' : 'var(--color-gray-900)',
          }}>
            €{listing.price}
          </span>
          <span className="badge-gray" style={{ fontSize: '11px' }}>
            {CONDITION_LABELS[listing.condition]}
          </span>
        </div>

        <Link href={`/listings/${listing.id}`}>
          <h3 style={{
            fontSize: '14px', fontWeight: 500,
            color: 'var(--color-text)', lineHeight: 1.3, marginBottom: '8px',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {listing.title}
          </h3>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-gray-400)' }}>
            <MapPin size={11} />
            <span style={{ fontSize: '12px' }}>{listing.location}</span>
          </div>
          {!isSold && onBuyClick && (
            <button
              onClick={() => onBuyClick(listing)}
              style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                padding: '5px 11px',
                background: 'var(--color-teal)', color: '#fff',
                border: 'none', borderRadius: 'var(--radius-full)',
                fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', transition: 'all var(--transition)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-teal-dark)';
                e.currentTarget.style.transform = 'scale(1.03)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-teal)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Zap size={11} />
              Αγορά
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
