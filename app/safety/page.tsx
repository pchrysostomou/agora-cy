import type { Metadata } from 'next';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle, Phone, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Ασφάλεια | Agora.cy',
  description: 'Μάθε πώς η Agora.cy σε προστατεύει. Συμβουλές ασφαλούς αγοράς και πώλησης, escrow σύστημα και προστασία δεδομένων.',
};

export default function SafetyPage() {
  return (
    <main className="container" style={{ paddingTop: '48px', paddingBottom: '80px', maxWidth: '760px' }}>
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(9,177,186,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} style={{ color: 'var(--color-teal)' }} />
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text)' }}>Ασφάλεια</h1>
        </div>
        <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
          Η ασφάλεια σου είναι η πρώτη μας προτεραιότητα. Εδώ θα βρεις όλα όσα κάνουμε για να σε προστατεύουμε, καθώς και συμβουλές για ασφαλείς συναλλαγές.
        </p>
      </div>

      <Section icon={<Lock size={20} />} title="Escrow — Προστασία Πληρωμών">
        <p>Το σύστημα escrow της Agora.cy διασφαλίζει ότι τα χρήματά σου είναι πάντα ασφαλή:</p>
        <Steps items={[
          'Ο αγοραστής πληρώνει με κάρτα μέσω Stripe',
          'Τα χρήματα κρατούνται σε escrow — δεν πάνε στον πωλητή ακόμα',
          'Ο αγοραστής λαμβάνει το αντικείμενο και επιβεβαιώνει παραλαβή',
          'Μόνο τότε τα χρήματα αποδεσμεύονται στον πωλητή',
        ]} />
        <Info>Αν δεν λάβεις το αντικείμενο, μπορείς να ανοίξεις διαφορά και να επιστρέψουμε τα χρήματά σου.</Info>
      </Section>

      <Section icon={<Eye size={20} />} title="Επαλήθευση Χρηστών">
        <ul style={{ paddingLeft: '20px', lineHeight: 2, color: 'var(--color-text-muted)' }}>
          <li>Όλοι οι χρήστες επαληθεύονται μέσω email ή Google</li>
          <li>Τα badges «Verified» σημαίνουν επαληθευμένο email</li>
          <li>Βαθμολογίες και αξιολογήσεις από πραγματικές αγορές</li>
          <li>Αναφορά ύποπτων χρηστών μέσω του κουμπιού «Αναφορά»</li>
        </ul>
      </Section>

      <Section icon={<AlertTriangle size={20} />} title="Προειδοποιήσεις — Τι να Αποφεύγεις">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            'Ποτέ μην πληρώνεις εκτός της πλατφόρμας (bank transfer, crypto, PayPal Friends)',
            'Μην στέλνεις χρήματα πριν δεις το αντικείμενο (για τοπικές συναντήσεις)',
            'Να συναντάς πάντα σε δημόσιο χώρο — καφετέρια, εμπορικό κέντρο',
            'Μην μοιράζεσαι προσωπικά στοιχεία (ΑΜΚΑ, τραπεζικά στοιχεία) με πωλητές',
            'Αν κάτι μοιάζει «πολύ καλό για να είναι αληθινό» — πιθανώς δεν είναι',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 'var(--radius-md)' }}>
              <AlertTriangle size={15} style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<CheckCircle size={20} />} title="Συμβουλές Ασφαλούς Αγοράς">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            'Διάβασε πάντα τις αξιολογήσεις του πωλητή πριν αγοράσεις',
            'Ζήτα επιπλέον φωτογραφίες ή βίντεο αν έχεις απορίες',
            'Έλεγξε το αντικείμενο πριν επιβεβαιώσεις παραλαβή',
            'Χρησιμοποίησε πάντα την ενσωματωμένη συνομιλία για επικοινωνία',
            'Αν υπάρχει πρόβλημα, άνοιξε αμέσως διαφορά μέσω της πλατφόρμας',
          ].map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px', background: 'rgba(9,177,186,0.06)', border: '1px solid rgba(9,177,186,0.15)', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle size={15} style={{ color: 'var(--color-teal)', flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section icon={<Phone size={20} />} title="Αναφορά Περιστατικού">
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '14px', lineHeight: 1.6 }}>
          Αν αντιμετωπίσεις απάτη ή ύποπτη συμπεριφορά, επικοινώνησε μαζί μας άμεσα:
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <a href="mailto:safety@agora.cy" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-teal)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            <Mail size={15} /> safety@agora.cy
          </a>
          <a href="tel:+35799000001" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-teal)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            <Phone size={15} /> +357 99 000 001
          </a>
        </div>
      </Section>
    </main>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '36px', paddingBottom: '36px', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ color: 'var(--color-teal)' }}>{icon}</span>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text)' }}>{title}</h2>
      </div>
      <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol style={{ paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', margin: '12px 0' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ minWidth: '24px', height: '24px', background: 'var(--color-teal)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
          <span style={{ color: 'var(--color-text)', padding: '2px 0' }}>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function Info({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: '12px', padding: '12px 16px', background: 'rgba(9,177,186,0.08)', border: '1px solid rgba(9,177,186,0.2)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--color-teal-dark)', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
      <Shield size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
      <span>{children}</span>
    </div>
  );
}
