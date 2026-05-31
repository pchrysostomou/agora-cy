'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Grid, List, ArrowUpDown, SlidersHorizontal, X } from 'lucide-react';
import { Category, Condition, Location } from '@/lib/mock-data';
import ListingCard from '@/components/ListingCard';
import FilterSidebar, { Filters } from '@/components/FilterSidebar';
import CheckoutModal from '@/components/CheckoutModal';
import { getListings, type Listing } from '@/lib/listings';
import { Suspense } from 'react';

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popular';

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Νεότερα',
  price_asc: 'Τιμή: Χαμηλή → Υψηλή',
  price_desc: 'Τιμή: Υψηλή → Χαμηλή',
  popular: 'Δημοφιλέστερα',
};

function sortListings(listings: Listing[], sort: SortOption): Listing[] {
  return [...listings].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    if (sort === 'popular') return b.views - a.views;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

function ListingsContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [inputValue, setInputValue] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<Filters>({
    category: (searchParams.get('category') as Category) || undefined,
  });
  const [sort, setSort] = useState<SortOption>('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [checkoutListing, setCheckoutListing] = useState<Listing | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [prevQuery, setPrevQuery] = useState(query);
  const [prevFilters, setPrevFilters] = useState(filters);

  if (query !== prevQuery || filters !== prevFilters) {
    setPrevQuery(query);
    setPrevFilters(filters);
    setLoading(true);
  }

  useEffect(() => {
    getListings({
      category: filters.category,
      condition: filters.condition,
      location: filters.location,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      query: query || undefined,
    }, 200)
      .then((data) => { setAllListings(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [query, filters]);

  const results = sortListings(allListings, sort);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
  };

  const resetFilters = () => setFilters({});

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px' }}>
          Αγγελίες
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Ανακάλυψε χιλιάδες μεταχειρισμένα αντικείμενα στην Κύπρο
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px', position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <Search size={17} style={{
            position: 'absolute', left: '14px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--color-gray-400)', pointerEvents: 'none',
          }} />
          <input
            type="search"
            placeholder="Αναζήτηση στις αγγελίες..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="input"
            style={{ paddingLeft: '42px', paddingRight: '100px', fontSize: '15px', padding: '12px 100px 12px 42px' }}
          />
          <button
            type="submit"
            className="btn-primary btn-sm"
            style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)' }}
          >
            Αναζήτηση
          </button>
        </div>
      </form>

      {/* Sort + View toggle + Mobile filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        {/* Mobile filters toggle */}
        <button
          onClick={() => setMobileFiltersOpen((o) => !o)}
          className="btn-outline btn-sm"
          style={{ display: 'none' }}
          id="mobile-filter-btn"
        >
          <SlidersHorizontal size={15} />
          Φίλτρα
        </button>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
          <ArrowUpDown size={14} style={{ color: 'var(--color-gray-400)' }} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            style={{
              padding: '7px 12px',
              border: '1.5px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              color: 'var(--color-text-2)',
              background: 'var(--color-surface)',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <option key={key} value={key}>{SORT_LABELS[key]}</option>
            ))}
          </select>
        </div>

        {/* View toggle */}
        <div style={{
          display: 'flex',
          border: '1.5px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          {(['grid', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: '7px 10px',
                border: 'none',
                background: view === v ? 'var(--color-teal)' : 'var(--color-surface)',
                color: view === v ? '#fff' : 'var(--color-text-muted)',
                cursor: 'pointer',
                transition: 'all var(--transition)',
              }}
            >
              {v === 'grid' ? <Grid size={15} /> : <List size={15} />}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter chips */}
      {(query || filters.category || filters.location || filters.condition || filters.minPrice || filters.maxPrice) && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {query && (
            <Chip label={`"${query}"`} onRemove={() => { setQuery(''); setInputValue(''); }} />
          )}
          {filters.category && (
            <Chip label={filters.category} onRemove={() => setFilters((f) => ({ ...f, category: undefined }))} />
          )}
          {filters.location && (
            <Chip label={filters.location} onRemove={() => setFilters((f) => ({ ...f, location: undefined }))} />
          )}
          {filters.condition && (
            <Chip label={filters.condition} onRemove={() => setFilters((f) => ({ ...f, condition: undefined }))} />
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <Chip
              label={`€${filters.minPrice ?? 0} – €${filters.maxPrice ?? '∞'}`}
              onRemove={() => setFilters((f) => ({ ...f, minPrice: undefined, maxPrice: undefined }))}
            />
          )}
        </div>
      )}

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Sidebar */}
        <div style={{ display: 'block' }} className="filter-sidebar-wrapper">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            resultCount={results.length}
          />
        </div>

        {/* Results */}
        <div>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '16px' }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ background: 'var(--color-gray-100)', borderRadius: 'var(--radius-lg)', height: '280px', animation: 'pulse 1.5s ease infinite' }} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px',
              color: 'var(--color-text-muted)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontWeight: 700, marginBottom: '8px', color: 'var(--color-text)' }}>
                Δεν βρέθηκαν αγγελίες
              </h3>
              <p style={{ marginBottom: '20px' }}>Δοκίμασε διαφορετικούς όρους αναζήτησης ή αφαίρεσε κάποια φίλτρα.</p>
              <button onClick={() => { setQuery(''); setInputValue(''); resetFilters(); }} className="btn-outline btn-sm">
                Καθαρισμός φίλτρων
              </button>
            </div>
          ) : (
            <div style={
              view === 'grid'
                ? {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
                    gap: '16px',
                  }
                : { display: 'flex', flexDirection: 'column', gap: '12px' }
            }>
              {results.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onBuyClick={setCheckoutListing}
                  view={view}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CheckoutModal listing={checkoutListing} onClose={() => setCheckoutListing(null)} />

      <style jsx global>{`
        @media (max-width: 768px) {
          .filter-sidebar-wrapper { display: none !important; }
          #mobile-filter-btn { display: inline-flex !important; }
          div[style*="grid-template-columns: 260px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense>
      <ListingsContent />
    </Suspense>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      background: 'var(--color-teal-light)',
      color: 'var(--color-teal-dark)',
      borderRadius: 'var(--radius-full)',
      fontSize: '13px',
      fontWeight: 600,
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', padding: '1px' }}
      >
        <X size={12} />
      </button>
    </span>
  );
}
