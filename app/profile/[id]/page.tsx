'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, CheckCircle, Package, MessageCircle, Calendar, Loader2 } from 'lucide-react';
import ListingCard from '@/components/ListingCard';
import { getListingsByUser, type Listing } from '@/lib/listings';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  rating: number;
  review_count: number;
  location: string;
  verified: boolean;
  bio: string;
  created_at: string;
}

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeListings, setActiveListings] = useState<Listing[]>([]);
  const [soldListings, setSoldListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      getListingsByUser(userId, 'active'),
      getListingsByUser(userId, 'sold'),
    ]).then(([{ data }, actives, solds]) => {
      setProfile(data);
      setActiveListings(actives);
      setSoldListings(solds);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--color-teal)', margin: '0 auto' }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <h2>Ο χρήστης δεν βρέθηκε</h2>
        <Link href="/listings" className="btn-primary" style={{ marginTop: '20px', display: 'inline-flex' }}>Πίσω</Link>
      </div>
    );
  }

  const avatarUrl = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`;
  const memberSince = new Date(profile.created_at).toLocaleDateString('el-CY', { month: 'long', year: 'numeric' });

  const mockReviews = [
    { id: 1, name: 'Μαρία Κ.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=r1', score: 5, comment: 'Εξαιρετικός πωλητής! Γρήγορη αποστολή και ακριβής περιγραφή.', date: 'Νοέμβριος 2024' },
    { id: 2, name: 'Νίκος Π.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=r2', score: 4, comment: 'Καλή συναλλαγή, αξιόπιστος χρήστης.', date: 'Νοέμβριος 2024' },
    { id: 3, name: 'Ελένη Χ.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=r3', score: 5, comment: 'Παραδόθηκε σε τέλεια κατάσταση. Σύστηση!', date: 'Οκτώβριος 2024' },
  ];

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '64px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', alignItems: 'start' }} className="profile-grid">
        {/* LEFT — Profile card */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <div className="card" style={{ padding: '28px', textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
              <img src={avatarUrl} alt={profile.full_name} width={96} height={96}
                style={{ borderRadius: '50%', background: 'var(--color-gray-100)', border: '4px solid var(--color-teal-light)' }} />
              {profile.verified && (
                <div style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: 'var(--color-teal)', borderRadius: '50%',
                  width: '26px', height: '26px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff',
                }}>
                  <CheckCircle size={14} style={{ color: '#fff' }} />
                </div>
              )}
            </div>

            <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '4px' }}>
              {profile.full_name}
            </h1>
            {profile.username && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '12px' }}>@{profile.username}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '16px' }}>
              <div className="stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.round(profile.rating || 0) ? '#f59e0b' : 'none'} stroke="#f59e0b" />
                ))}
              </div>
              <span style={{ fontWeight: 700, fontSize: '15px' }}>{Number(profile.rating || 0).toFixed(1)}</span>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>({profile.review_count || 0})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {profile.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  <MapPin size={14} style={{ color: 'var(--color-teal)' }} />{profile.location}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                <Calendar size={14} style={{ color: 'var(--color-teal)' }} />Μέλος από {memberSince}
              </div>
            </div>

            {profile.bio && (
              <p style={{
                fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6,
                padding: '12px', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)',
                textAlign: 'left', marginBottom: '20px',
              }}>{profile.bio}</p>
            )}

            <button className="btn-primary" style={{ width: '100%', gap: '6px' }}>
              <MessageCircle size={15} /> Επικοινωνία
            </button>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
              <Stat value={activeListings.length} label="Ενεργές αγγελίες" />
              <Stat value={soldListings.length} label="Πωλήσεις" />
            </div>
          </div>
        </div>

        {/* RIGHT — Listings & reviews */}
        <div>
          <section style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)' }}>
                Ενεργές αγγελίες
                <span style={{ marginLeft: '8px', background: 'var(--color-teal)', color: '#fff', fontSize: '12px', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                  {activeListings.length}
                </span>
              </h2>
            </div>

            {activeListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gray-400)' }}>
                <Package size={32} style={{ margin: '0 auto 12px' }} />
                <p>Δεν υπάρχουν ενεργές αγγελίες</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: '16px' }}>
                {activeListings.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '20px' }}>
              Αξιολογήσεις
              <span style={{ marginLeft: '8px', background: 'var(--color-gray-100)', color: 'var(--color-text-muted)', fontSize: '12px', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                {profile.review_count || 0}
              </span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mockReviews.map((r) => (
                <div key={r.id} className="card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                    <img src={r.avatar} alt={r.name} width={40} height={40} style={{ borderRadius: '50%', background: 'var(--color-gray-100)', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <p style={{ fontWeight: 600, fontSize: '14px' }}>{r.name}</p>
                        <span style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>{r.date}</span>
                      </div>
                      <div className="stars" style={{ marginTop: '3px' }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={13} fill={i < r.score ? '#f59e0b' : 'none'} stroke="#f59e0b" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-2)', lineHeight: 1.5 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '12px 8px' }}>
      <p style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text)' }}>{value}</p>
      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{label}</p>
    </div>
  );
}
