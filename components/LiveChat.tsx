'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Mail, ExternalLink } from 'lucide-react';

interface Message {
  id: number;
  from: 'bot' | 'user';
  text: string;
  options?: string[];
  link?: { label: string; href: string };
}

// ── FAQ Knowledge Base ──────────────────────────────────────
const FAQ: { keywords: string[]; answer: string; link?: { label: string; href: string } }[] = [
  {
    keywords: ['αγορα', 'αγοραζ', 'πως αγορ', 'buy', 'αγοράσω', 'αγοράζω'],
    answer: 'Για να αγοράσεις: 1️⃣ Βρες αγγελία → 2️⃣ Πάτα «Αγορά τώρα» → 3️⃣ Πλήρωσε με κάρτα → 4️⃣ Επιβεβαίωσε παραλαβή. Τα χρήματά σου κρατούνται σε escrow μέχρι να επιβεβαιώσεις.',
    link: { label: 'Πώς Λειτουργεί', href: '/how-it-works' },
  },
  {
    keywords: ['πουλ', 'πωλ', 'sell', 'αγγελια', 'αγγελία', 'δημοσιευ'],
    answer: 'Για να πουλήσεις: 1️⃣ Σύνδεση → 2️⃣ «+ Νέα Αγγελία» → 3️⃣ Συμπλήρωσε τίτλο, τιμή, φωτογραφίες → 4️⃣ Δημοσίευσε! Δωρεάν για άτομα.',
    link: { label: 'Δημιούργησε Αγγελία', href: '/listings/new' },
  },
  {
    keywords: ['escrow', 'χρηματα', 'χρήματα', 'ασφαλεια', 'ασφάλεια', 'προστασια'],
    answer: 'Το escrow σημαίνει ότι τα χρήματά σου κρατούνται ασφαλή από την Agora.cy μέχρι να επιβεβαιώσεις ότι έλαβες το αντικείμενο. Ο πωλητής πληρώνεται μόνο μετά από εσένα.',
    link: { label: 'Μάθε για την Ασφάλεια', href: '/safety' },
  },
  {
    keywords: ['πληρωμ', 'πληρώ', 'καρτα', 'κάρτα', 'stripe', 'visa', 'mastercard'],
    answer: 'Δεχόμαστε Visa, Mastercard, AMEX και όλες τις κάρτες μέσω Stripe. Οι πληρωμές είναι 100% κρυπτογραφημένες. Δεν αποθηκεύουμε στοιχεία κάρτας.',
  },
  {
    keywords: ['iban', 'τραπεζα', 'τράπεζα', 'πληρωθ', 'λεφτα πωλητ', 'πως παιρν'],
    answer: 'Ως πωλητής, βάζεις το IBAN σου στο προφίλ σου. Μετά την επιβεβαίωση παραλαβής, η Agora.cy κάνει SEPA transfer στον τραπεζικό σου λογαριασμό εντός 2-3 εργάσιμων.',
  },
  {
    keywords: ['μηνυμα', 'μήνυμα', 'επικοινων', 'chat', 'συνομιλ', 'πωλητη'],
    answer: 'Μπορείς να στείλεις μήνυμα στον πωλητή απευθείας από τη σελίδα της αγγελίας (κουμπί «Στείλε μήνυμα»). Τα μηνύματα βρίσκονται στο εικονίδιο 💬 στο navbar.',
  },
  {
    keywords: ['επιστροφ', 'refund', 'ακυρ', 'cancel', 'problem', 'προβλημα', 'πρόβλημα'],
    answer: 'Αν έχεις πρόβλημα με αγορά: 1️⃣ Μην επιβεβαιώσεις παραλαβή ακόμα 2️⃣ Άνοιξε διαφορά από το προφίλ σου 3️⃣ Η ομάδα μας εξετάζει εντός 48 ωρών. Για επείγοντα: support@agora.cy',
    link: { label: 'Ασφάλεια & Διαφορές', href: '/safety' },
  },
  {
    keywords: ['λογαριασμ', 'εγγραφ', 'εγγραφή', 'register', 'signup', 'δημιουργ'],
    answer: 'Η εγγραφή είναι δωρεάν! Πάτα «Σύνδεση» → «Δημιουργία λογαριασμού» → Συμπλήρωσε email/κωδικό ή σύνδεσε Google.',
  },
  {
    keywords: ['google', 'oauth', 'κωδικο', 'κωδικό', 'password', 'ξεχασ'],
    answer: 'Αν ξέχασες τον κωδικό σου: Πάτα «Σύνδεση» → «Ξέχασα τον κωδικό» → Θα λάβεις email επαναφοράς.',
  },
  {
    keywords: ['gdpr', 'προσωπικ', 'δεδομεν', 'απορρητ', 'απόρρητο', 'privacy'],
    answer: 'Η Agora.cy συμμορφώνεται πλήρως με τον GDPR. Μπορείς να ζητήσεις εξαγωγή ή διαγραφή των δεδομένων σου οποτεδήποτε.',
    link: { label: 'Πολιτική GDPR', href: '/gdpr' },
  },
  {
    keywords: ['ορους', 'όρους', 'terms', 'νομικ'],
    answer: 'Οι πλήρεις Όροι Χρήσης της Agora.cy καλύπτουν συναλλαγές, ευθύνες, διαφορές και πολλά άλλα.',
    link: { label: 'Διάβασε τους Όρους', href: '/terms' },
  },
  {
    keywords: ['προωθ', 'promoted', 'featured', 'αναδειξ'],
    answer: 'Οι «Προωθημένες» αγγελίες εμφανίζονται πρώτες στα αποτελέσματα. Σύντομα θα διαθέσουμε σχέδιο προώθησης. Μείνε συντονισμένος!',
  },
  {
    keywords: ['αξιολογ', 'rating', 'review', 'βαθμολ'],
    answer: 'Μετά από κάθε ολοκληρωμένη αγορά, τόσο ο αγοραστής όσο και ο πωλητής μπορούν να αξιολογήσουν ο ένας τον άλλον (1-5 αστέρια + σχόλιο).',
  },
];

function getBotResponse(input: string): { answer: string; link?: { label: string; href: string } } {
  const normalized = input.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .trim();

  for (const faq of FAQ) {
    if (faq.keywords.some((kw) => normalized.includes(kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
      return { answer: faq.answer, link: faq.link };
    }
  }

  return {
    answer: 'Δεν βρήκα απάντηση για αυτό. Μπορείτε να στείλετε email στο **support@agora.cy** και η ομάδα μας θα σας απαντήσει εντός 24 ωρών.',
    link: { label: 'Σελίδα Επικοινωνίας', href: '/contact' },
  };
}

const QUICK_QUESTIONS = [
  'Πώς αγοράζω;',
  'Πώς πουλάω;',
  'Τι είναι το escrow;',
  'Πώς πληρώνω;',
  'Έχω πρόβλημα με αγορά',
];

let msgId = 0;

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: ++msgId,
      from: 'bot',
      text: 'Γεια! 👋 Είμαι ο βοηθός της Agora.cy. Πώς μπορώ να σε βοηθήσω;',
      options: QUICK_QUESTIONS,
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const addBotMessage = (text: string, link?: { label: string; href: string }, options?: string[]) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: ++msgId, from: 'bot', text, link, options }]);
      if (!open) setUnread((n) => n + 1);
    }, 800 + Math.random() * 400);
  };

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: ++msgId, from: 'user', text }]);
    setInput('');

    const { answer, link } = getBotResponse(text);

    // After answering, sometimes offer quick questions again
    const showOptions = Math.random() > 0.5;
    addBotMessage(answer, link, showOptions ? QUICK_QUESTIONS : undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* Floating bubble */}
      <button
        id="live-chat-button"
        onClick={() => { setOpen((o) => !o); setMinimized(false); }}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--color-teal)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(9,177,186,0.5)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(9,177,186,0.7)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(9,177,186,0.5)';
        }}
        aria-label="Live chat"
      >
        {open
          ? <X size={22} color="#fff" />
          : <MessageCircle size={22} color="#fff" />}
        {!open && unread > 0 && (
          <span style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#ef4444', color: '#fff',
            borderRadius: '50%', width: '18px', height: '18px',
            fontSize: '11px', fontWeight: 800, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && !minimized && (
        <div style={{
          position: 'fixed', bottom: '90px', right: '24px', zIndex: 9998,
          width: '340px', maxHeight: '500px',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column',
          animation: 'chatAppear 0.25s ease',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '14px 16px',
            background: 'var(--color-teal)',
          }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: '#fff', fontSize: '14px', marginBottom: '1px' }}>Agora Assistant</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                Online τώρα
              </p>
            </div>
            <button onClick={() => setMinimized(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', padding: '4px', display: 'flex' }}>
              <Minimize2 size={15} />
            </button>
            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', padding: '4px', display: 'flex' }}>
              <X size={15} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.from === 'user' ? 'flex-end' : 'flex-start', gap: '6px' }}>
                <div style={{
                  maxWidth: '80%', padding: '9px 13px',
                  borderRadius: msg.from === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                  background: msg.from === 'user' ? 'var(--color-teal)' : 'var(--color-surface-2)',
                  color: msg.from === 'user' ? '#fff' : 'var(--color-text)',
                  fontSize: '13px', lineHeight: 1.5,
                  border: msg.from === 'bot' ? '1px solid var(--color-border)' : 'none',
                }}>
                  {msg.text.split('**').map((part, i) =>
                    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                  )}
                </div>
                {/* Link button */}
                {msg.link && (
                  <a href={msg.link.href} style={{ fontSize: '12px', color: 'var(--color-teal)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', padding: '4px 0' }}>
                    <ExternalLink size={11} /> {msg.link.label}
                  </a>
                )}
                {/* Quick options */}
                {msg.options && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
                    {msg.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => send(opt)}
                        style={{
                          fontSize: '11px', padding: '4px 10px',
                          background: 'var(--color-surface)',
                          border: '1px solid var(--color-teal)',
                          borderRadius: '999px', cursor: 'pointer',
                          color: 'var(--color-teal)', fontWeight: 600,
                          transition: 'all 0.15s',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '8px 12px', background: 'var(--color-surface-2)', borderRadius: '14px 14px 14px 2px', width: 'fit-content', border: '1px solid var(--color-border)' }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-teal)', display: 'inline-block', animation: `bounce 0.8s ${i * 0.2}s infinite` }} />
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Email shortcut */}
          <div style={{ padding: '6px 12px', background: 'var(--color-surface-2)', borderTop: '1px solid var(--color-border)' }}>
            <a href="mailto:support@agora.cy" style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
              <Mail size={11} /> Τεχνικό πρόβλημα; <strong style={{ color: 'var(--color-teal)' }}>support@agora.cy</strong>
            </a>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', padding: '10px 12px', gap: '8px', borderTop: '1px solid var(--color-border)' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Γράψε την ερώτησή σου..."
              className="input"
              style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              style={{
                background: 'var(--color-teal)', border: 'none', borderRadius: 'var(--radius-md)',
                width: '36px', height: '36px', flexShrink: 0, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: input.trim() ? 1 : 0.5, transition: 'opacity 0.2s',
              }}
            >
              <Send size={14} color="#fff" />
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes chatAppear {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
