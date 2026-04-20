'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/mock-auth';
import { MessageCircle, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { getConversations } from '@/lib/messages';

interface Conversation {
  id: string;
  listing_id: string | null;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender: { username: string; full_name: string; avatar_url: string } | null;
  receiver: { username: string; full_name: string; avatar_url: string } | null;
  listing: { id: string; title: string; price: number } | null;
}

export default function MessagesPage() {
  const { user, loading: authLoading, getAccessToken } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    getAccessToken().then((token) => {
      getConversations(user.id, token ?? '').then((data) => {
        setConversations(data as unknown as Conversation[]);
        setLoading(false);
      });
    });
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 0.7s linear infinite', color: 'var(--color-teal)' }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <MessageCircle size={48} style={{ color: 'var(--color-text-muted)' }} />
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)' }}>Συνδέσου για να δεις τα μηνύματά σου</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>Χρειάζεσαι λογαριασμό για να επικοινωνείς με πωλητές.</p>
        <Link href="/" className="btn-primary">Πήγαινε στην αρχική</Link>
      </div>
    );
  }

  const filtered = conversations.filter((c) => {
    const other = c.sender_id === user.id ? c.receiver : c.sender;
    const otherName = other?.full_name ?? other?.username ?? '';
    const listingTitle = c.listing?.title ?? '';
    return (
      otherName.toLowerCase().includes(search.toLowerCase()) ||
      listingTitle.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '64px', maxWidth: '700px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px' }}>
        Μηνύματα
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
        {conversations.length > 0
          ? `${conversations.length} συνομιλία${conversations.length !== 1 ? 'ίες' : ''}`
          : 'Δεν υπάρχουν μηνύματα ακόμα'}
      </p>

      {/* Search */}
      {conversations.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={16} style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)', pointerEvents: 'none',
          }} />
          <input
            className="input"
            style={{ paddingLeft: '36px' }}
            placeholder="Αναζήτηση συνομιλίας..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Conversation list */}
      {filtered.length === 0 && conversations.length > 0 && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '32px' }}>
          Δεν βρέθηκαν αποτελέσματα.
        </p>
      )}

      {conversations.length === 0 && (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <MessageCircle size={40} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
            Δεν έχεις στείλει ή λάβει κανένα μήνυμα ακόμα.
          </p>
          <Link href="/listings" className="btn-primary" style={{ marginTop: '16px', display: 'inline-flex' }}>
            Βρες αγγελίες
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {filtered.map((conv) => {
          const isMe = conv.sender_id === user.id;
          const other = isMe ? conv.receiver : conv.sender;
          const otherName = other?.full_name ?? other?.username ?? 'Χρήστης';
          const otherAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${isMe ? conv.receiver_id : conv.sender_id}`;
          const isUnread = !conv.read && conv.receiver_id === user.id;

          return (
            <Link
              key={conv.id}
              href={`/listings/${conv.listing_id}`}
              className="card-hover"
              style={{
                display: 'flex', gap: '14px', padding: '16px',
                textDecoration: 'none',
                borderLeft: isUnread ? '3px solid var(--color-teal)' : '3px solid transparent',
              }}
            >
              <img
                src={otherAvatar}
                alt={otherName}
                width={48} height={48}
                style={{ borderRadius: '50%', flexShrink: 0, border: '2px solid var(--color-border)' }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <p style={{
                    fontWeight: isUnread ? 700 : 600,
                    fontSize: '15px', color: 'var(--color-text)',
                  }}>
                    {otherName}
                    {isUnread && (
                      <span style={{
                        display: 'inline-block', width: '8px', height: '8px',
                        background: 'var(--color-teal)', borderRadius: '50%',
                        marginLeft: '8px', verticalAlign: 'middle',
                      }} />
                    )}
                  </p>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', flexShrink: 0, marginLeft: '8px' }}>
                    {new Date(conv.created_at).toLocaleDateString('el-CY', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                {conv.listing && (
                  <p style={{ fontSize: '12px', color: 'var(--color-teal)', marginBottom: '4px', fontWeight: 600 }}>
                    {conv.listing.title} · €{conv.listing.price}
                  </p>
                )}
                <p style={{
                  fontSize: '14px', color: 'var(--color-text-muted)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontWeight: isUnread ? 600 : 400,
                }}>
                  {isMe && 'Εσύ: '}{conv.content}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
