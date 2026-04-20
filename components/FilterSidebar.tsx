'use client';

import { CATEGORIES, CATEGORY_ICONS, LOCATIONS, Category, Condition, Location } from '@/lib/mock-data';
import { SlidersHorizontal, X } from 'lucide-react';

export interface Filters {
  category?: Category;
  location?: Location;
  condition?: Condition;
  minPrice?: number;
  maxPrice?: number;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onReset: () => void;
  resultCount: number;
}

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'new', label: 'Καινούργιο' },
  { value: 'like_new', label: 'Σαν καινούργιο' },
  { value: 'good', label: 'Καλή κατάσταση' },
  { value: 'fair', label: 'Μέτρια κατάσταση' },
];

const hasActiveFilters = (f: Filters) =>
  !!(f.category || f.location || f.condition || f.minPrice || f.maxPrice);

export default function FilterSidebar({ filters, onChange, onReset, resultCount }: Props) {
  const active = hasActiveFilters(filters);

  return (
    <aside style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      position: 'sticky',
      top: '80px',
      color: 'var(--color-text)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={16} style={{ color: 'var(--color-teal)' }} />
          <span style={{ fontWeight: 700, fontSize: '15px' }}>Φίλτρα</span>
          {active && (
            <span style={{
              background: 'var(--color-teal)',
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
              padding: '1px 7px',
              borderRadius: 'var(--radius-full)',
            }}>
              On
            </span>
          )}
        </div>
        {active && (
          <button
            onClick={onReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: 'var(--color-error)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 6px',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <X size={12} />
            Καθαρισμός
          </button>
        )}
      </div>

      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
        {resultCount} αγγελίες
      </p>

      {/* Category */}
      <Section title="Κατηγορία">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onChange({ ...filters, category: filters.category === cat ? undefined : cat })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: filters.category === cat ? 'var(--color-teal-light)' : 'transparent',
                color: filters.category === cat ? 'var(--color-teal-dark)' : 'var(--color-text-2)',
                fontSize: '14px',
                fontWeight: filters.category === cat ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all var(--transition)',
              }}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              {cat}
            </button>
          ))}
        </div>
      </Section>

      <Divider />

      {/* Price range */}
      <Section title="Τιμή (€)">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Από</label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={filters.minPrice ?? ''}
              onChange={(e) => onChange({ ...filters, minPrice: e.target.value ? +e.target.value : undefined })}
              className="input"
              style={{ fontSize: '13px', padding: '8px 10px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Έως</label>
            <input
              type="number"
              min={0}
              placeholder="∞"
              value={filters.maxPrice ?? ''}
              onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? +e.target.value : undefined })}
              className="input"
              style={{ fontSize: '13px', padding: '8px 10px' }}
            />
          </div>
        </div>
        {/* Quick presets */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
          {[
            { label: '< €50', max: 50 },
            { label: '€50-200', min: 50, max: 200 },
            { label: '> €200', min: 200 },
          ].map(({ label, min, max }) => (
            <button
              key={label}
              onClick={() => onChange({ ...filters, minPrice: min, maxPrice: max })}
              style={{
                padding: '4px 10px',
                border: '1px solid var(--color-gray-200)',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface)',
                fontSize: '12px',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                transition: 'all var(--transition)',
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
              {label}
            </button>
          ))}
        </div>
      </Section>

      <Divider />

      {/* Condition */}
      <Section title="Κατάσταση">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {CONDITIONS.map(({ value, label }) => {
            const selected = filters.condition === value;
            return (
              <button
                key={value}
                onClick={() => onChange({ ...filters, condition: filters.condition === value ? undefined : value })}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 10px', borderRadius: 'var(--radius-md)',
                  border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
                  background: selected ? 'var(--color-teal-light)' : 'transparent',
                  color: selected ? 'var(--color-teal-dark)' : 'var(--color-text-2)',
                  fontSize: '14px', fontWeight: selected ? 600 : 400,
                  transition: 'all var(--transition)',
                }}
              >
                {/* Custom radio indicator */}
                <span style={{
                  width: '16px', height: '16px', borderRadius: '50%', flexShrink: 0,
                  border: selected
                    ? '2px solid var(--color-teal)'
                    : '1.5px solid var(--color-text-muted)',
                  background: selected ? 'var(--color-teal)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all var(--transition)',
                  opacity: selected ? 1 : 0.45,
                }}>
                  {selected && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#fff' }} />}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      <Divider />

      {/* Location */}
      <Section title="Τοποθεσία">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => onChange({ ...filters, location: filters.location === loc ? undefined : loc })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: filters.location === loc ? 'var(--color-teal-light)' : 'transparent',
                color: filters.location === loc ? 'var(--color-teal-dark)' : 'var(--color-text-2)',
                fontSize: '14px',
                fontWeight: filters.location === loc ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all var(--transition)',
              }}
            >
              <span>📍 {loc}</span>
              {filters.location === loc && <span style={{ fontSize: '12px' }}>✓</span>}
            </button>
          ))}
        </div>
      </Section>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <h3 style={{
        fontSize: '13px',
        fontWeight: 700,
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: '12px',
      }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '16px 0' }} />;
}
