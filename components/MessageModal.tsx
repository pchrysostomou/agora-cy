'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, Loader2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/mock-auth';
import {
  getMessages,
  sendMessage,
  subscribeToMessages,
  markConversationRead,
  type Message,
} from '@/lib/messages';

interface Props {
  open: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
}

export default function MessageModal({
  open, onClose,
  listingId, listingTitle, listingPrice, listingImage,
  sellerId, sellerName, sellerAvatar,
}: Props) {
  const { user, getAccessToken } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string>('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOwnListing = user?.id === sellerId;

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Load messages + subscribe to realtime
  useEffect(() => {
    if (!open || !user) return;

    let currentToken = '';
    setLoading(true);
    setError('');

    getAccessToken().then(async (t) => {
      currentToken = t ?? '';
      setToken(currentToken);

      const msgs = await getMessages(listingId, user.id, sellerId, currentToken);
      setMessages(msgs);
      setLoading(false);
      markConversationRead(listingId, user.id, currentToken);
    });

    // Real-time subscription (uses anon key for realtime channel)
    const unsubscribe = subscribeToMessages(
      listingId,
      user.id,
      sellerId,
      (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        if (newMsg.receiver_id === user.id) {
          getAccessToken().then((t) =>
            markConversationRead(listingId, user.id, t ?? '')
          );
        }
      },
      '' // realtime uses anon key internally
    );

    return unsubscribe;
  }, [open, user, listingId, sellerId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user || sending) return;

    setSending(true);
    const accessToken = token || (await getAccessToken()) || '';

    // Optimistic update
    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      listing_id: listingId,
      order_id: null,
      sender_id: user.id,
      receiver_id: sellerId,
      content: input.trim(),
      read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    const sentText = input.trim();
    setInput('');

    const result = await sendMessage(
      { listingId, senderId: user.id, receiverId: sellerId, content: sentText },
      accessToken
    );

    if (!result) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setInput(sentText);
      setError('Αποτυχία αποστολής. Δοκίμασε ξανά.');
    } else {
      // Replace optimistic with real message
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? result : m))
      );
    }

    setSending(false);
  };

  if (!open) return null;

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ alignItems: 'flex-start', paddingTop: '5vh', paddingBottom: '5vh' }}
    >
      <div className="modal" style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '16px 20px', borderBottom: '1px solid var(--color-border)',
          flexShrink: 0,
        }}>
          {listingImage && (
            <img src={listingImage} alt={listingTitle} style={{
              width: '40px', height: '40px', objectFit: 'cover',
              borderRadius: 'var(--radius-md)', flexShrink: 0,
            }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {listingTitle}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {isOwnListing ? 'Η αγγελία σου' : `Πωλητής: ${sellerName}`} · €{listingPrice}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost btn-sm" style={{ padding: '8px', flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>

        {/* Messages area */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px 20px',
          display: 'flex', flexDirection: 'column', gap: '8px',
          minHeight: '200px',
        }}>
          {isOwnListing && (
            <div style={{
              textAlign: 'center', padding: '12px',
              background: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px', color: 'var(--color-text-muted)',
            }}>
              Αυτή είναι η δική σου αγγελία. Εδώ θα βλέπεις μηνύματα αγοραστών.
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-muted)' }}>
              <Loader2 size={20} style={{ animation: 'spin 0.7s linear infinite', margin: 'auto' }} />
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <MessageCircle size={32} style={{ color: 'var(--color-text-muted)', margin: '0 auto 8px' }} />
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                Δεν υπάρχουν μηνύματα ακόμα.
              </p>
              {!isOwnListing && (
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  Στείλε μήνυμα για να ρωτήσεις τον πωλητή!
                </p>
              )}
            </div>
          )}

          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: isMine ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: '8px',
              }}>
                {!isMine && sellerAvatar && (
                  <img src={sellerAvatar} alt={sellerName} style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    flexShrink: 0, border: '2px solid var(--color-border)',
                  }} />
                )}
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: isMine
                    ? 'var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)'
                    : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px',
                  background: isMine ? 'var(--color-teal)' : 'var(--color-surface-2)',
                  color: isMine ? '#fff' : 'var(--color-text)',
                  fontSize: '14px', lineHeight: 1.5,
                  border: isMine ? 'none' : '1px solid var(--color-border)',
                  opacity: msg.id.startsWith('optimistic-') ? 0.7 : 1,
                  transition: 'opacity 0.2s',
                }}>
                  {msg.content}
                  <div style={{
                    fontSize: '11px', marginTop: '4px',
                    color: isMine ? 'rgba(255,255,255,0.7)' : 'var(--color-text-muted)',
                    textAlign: 'right',
                  }}>
                    {new Date(msg.created_at).toLocaleTimeString('el-CY', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '8px 20px',
            background: 'rgba(220,38,38,0.12)',
            color: 'var(--color-error)',
            fontSize: '13px', textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} style={{
          display: 'flex', gap: '10px', padding: '12px 16px',
          borderTop: '1px solid var(--color-border)', flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isOwnListing ? 'Απαντήστε στον αγοραστή...' : 'Στείλτε μήνυμα στον πωλητή...'}
            className="input"
            style={{ flex: 1, fontSize: '14px' }}
            disabled={sending}
            maxLength={1000}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '10px 16px', flexShrink: 0 }}
            disabled={!input.trim() || sending}
          >
            {sending
              ? <Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} />
              : <Send size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
