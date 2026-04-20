import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock, MessageSquare, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Επικοινωνία | Agora.cy',
  description: 'Επικοινώνησε με την ομάδα της Agora.cy. Είμαστε εδώ για να σε βοηθήσουμε.',
};

export default function ContactPage() {
  return (
    <main className="container" style={{ paddingTop: '48px', paddingBottom: '80px', maxWidth: '760px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '12px' }}>Επικοινωνία</h1>
        <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
          Η ομάδα μας είναι εδώ για να σε βοηθήσει. Επικοινώνησε μαζί μας με οποιονδήποτε τρόπο προτιμάς.
        </p>
      </div>

      {/* Contact cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
        <ContactCard
          icon={<Mail size={22} style={{ color: 'var(--color-teal)' }} />}
          title="Email"
          primary="support@agora.cy"
          secondary="Απάντηση εντός 24 ωρών"
          href="mailto:support@agora.cy"
        />
        <ContactCard
          icon={<Phone size={22} style={{ color: 'var(--color-teal)' }} />}
          title="Τηλέφωνο"
          primary="+357 99 000 001"
          secondary="Δευ–Παρ, 09:00–18:00"
          href="tel:+35799000001"
        />
        <ContactCard
          icon={<MessageSquare size={22} style={{ color: 'var(--color-teal)' }} />}
          title="Live Chat"
          primary="Διαθέσιμο σύντομα"
          secondary="Εντός της εφαρμογής"
          href="#"
        />
      </div>

      {/* Office */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <MapPin size={20} style={{ color: 'var(--color-teal)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '6px' }}>Γραφεία</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.7 }}>
              Agora.cy Ltd<br />
              Λεωφόρος Αρχιεπισκόπου Μακαρίου Γ΄ 123<br />
              2220 Λευκωσία, Κύπρος
            </p>
          </div>
        </div>
      </div>

      {/* Office hours */}
      <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <Clock size={20} style={{ color: 'var(--color-teal)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ width: '100%' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '12px' }}>Ώρες Εξυπηρέτησης</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { day: 'Δευτέρα – Παρασκευή', hours: '09:00 – 18:00' },
                { day: 'Σάββατο', hours: '10:00 – 14:00' },
                { day: 'Κυριακή', hours: 'Κλειστά' },
              ].map(({ day, hours }) => (
                <div key={day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{day}</span>
                  <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ shortcut */}
      <div style={{ padding: '20px', background: 'rgba(9,177,186,0.06)', border: '1px solid rgba(9,177,186,0.2)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <HelpCircle size={20} style={{ color: 'var(--color-teal)', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' }}>Πριν επικοινωνήσεις</p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Δες τη σελίδα <a href="/how-it-works" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>Πώς Λειτουργεί</a> ή την <a href="/safety" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>Ασφάλεια</a> — μπορεί να βρεις τη λύση εκεί.
          </p>
        </div>
      </div>
    </main>
  );
}

function ContactCard({ icon, title, primary, secondary, href }: { icon: React.ReactNode; title: string; primary: string; secondary: string; href: string }) {
  return (
    <a href={href} className="card" style={{ padding: '20px', textDecoration: 'none', display: 'block' }}>
      <div style={{ marginBottom: '12px' }}>{icon}</div>
      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{title}</p>
      <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>{primary}</p>
      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{secondary}</p>
    </a>
  );
}

