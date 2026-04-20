import type { Metadata } from 'next';
import { Shield, Database, Eye, UserCheck, Trash2, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GDPR & Προστασία Δεδομένων | Agora.cy',
  description: 'Πολιτική απορρήτου και προστασία προσωπικών δεδομένων σύμφωνα με τον GDPR για χρήστες της Agora.cy.',
};

export default function GdprPage() {
  return (
    <main className="container" style={{ paddingTop: '48px', paddingBottom: '80px', maxWidth: '760px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '12px' }}>
          GDPR & Προστασία Δεδομένων
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
          Τελευταία ενημέρωση: 20 Απριλίου 2026
        </p>
        <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
          Η Agora.cy Ltd δεσμεύεται να προστατεύει τα προσωπικά σου δεδομένα σύμφωνα με τον Κανονισμό (ΕΕ) 2016/679 (GDPR) και την Κυπριακή νομοθεσία για την προστασία δεδομένων.
        </p>
      </div>

      <GdprSection icon={<Database size={20} />} title="Τι Δεδομένα Συλλέγουμε">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '10px 12px', background: 'var(--color-surface-2)', color: 'var(--color-text)', borderRadius: 'var(--radius-sm) 0 0 0' }}>Δεδομένο</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', background: 'var(--color-surface-2)', color: 'var(--color-text)' }}>Σκοπός</th>
              <th style={{ textAlign: 'left', padding: '10px 12px', background: 'var(--color-surface-2)', color: 'var(--color-text)', borderRadius: '0 var(--radius-sm) 0 0' }}>Βάση</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Email, Όνομα', 'Δημιουργία λογαριασμού & επικοινωνία', 'Σύμβαση'],
              ['Δεδομένα πληρωμής', 'Επεξεργασία συναλλαγών μέσω Stripe', 'Σύμβαση'],
              ['IBAN', 'Αποπληρωμή πωλητών', 'Σύμβαση'],
              ['Φωτογραφίες αγγελιών', 'Δημοσίευση αγγελιών', 'Σύμβαση'],
              ['Τοποθεσία', 'Φιλτράρισμα αγγελιών βάσει περιοχής', 'Έννομο συμφέρον'],
              ['Cookies επίδοσης', 'Βελτίωση της εμπειρίας', 'Συγκατάθεση'],
              ['Logs δραστηριότητας', 'Ασφάλεια & πρόληψη απάτης', 'Έννομο συμφέρον'],
            ].map(([data, purpose, basis], i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '10px 12px', color: 'var(--color-text)', fontWeight: 600 }}>{data}</td>
                <td style={{ padding: '10px 12px', color: 'var(--color-text-muted)' }}>{purpose}</td>
                <td style={{ padding: '10px 12px', color: 'var(--color-text-muted)' }}>{basis}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GdprSection>

      <GdprSection icon={<Eye size={20} />} title="Πού Μοιραζόμαστε τα Δεδομένα">
        <ul style={{ paddingLeft: '20px', lineHeight: 2, color: 'var(--color-text-muted)', fontSize: '14px' }}>
          <li><strong style={{ color: 'var(--color-text)' }}>Stripe Inc.</strong> — Επεξεργασία πληρωμών (ΗΠΑ, Privacy Shield)</li>
          <li><strong style={{ color: 'var(--color-text)' }}>Supabase Inc.</strong> — Βάση δεδομένων και authentication (ΕΕ servers)</li>
          <li><strong style={{ color: 'var(--color-text)' }}>Vercel Inc.</strong> — Hosting (ΕΕ servers)</li>
          <li>Δεν πουλάμε δεδομένα σε τρίτους</li>
          <li>Κοινοποίηση σε αρχές μόνο βάσει νόμου</li>
        </ul>
      </GdprSection>

      <GdprSection icon={<UserCheck size={20} />} title="Τα Δικαιώματά Σου (GDPR)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { right: 'Πρόσβαση', desc: 'Δικαίωμα να δεις τα δεδομένα σου' },
            { right: 'Διόρθωση', desc: 'Διόρθωση λανθασμένων στοιχείων' },
            { right: 'Διαγραφή', desc: '«Δικαίωμα στη λήθη»' },
            { right: 'Περιορισμός', desc: 'Περιορισμός επεξεργασίας' },
            { right: 'Φορητότητα', desc: 'Εξαγωγή δεδομένων σε JSON' },
            { right: 'Εναντίωση', desc: 'Άρνηση επεξεργασίας' },
          ].map(({ right, desc }) => (
            <div key={right} style={{ padding: '14px', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontWeight: 700, color: 'var(--color-teal)', fontSize: '13px', marginBottom: '4px' }}>{right}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
          Για άσκηση δικαιωμάτων: <a href="mailto:gdpr@agora.cy" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>gdpr@agora.cy</a>. Απάντηση εντός 30 ημερών όπως ορίζει ο GDPR.
        </p>
      </GdprSection>

      <GdprSection icon={<Trash2 size={20} />} title="Διατήρηση & Διαγραφή Δεδομένων">
        <ul style={{ paddingLeft: '20px', lineHeight: 2, color: 'var(--color-text-muted)', fontSize: '14px' }}>
          <li>Δεδομένα λογαριασμού: όσο ο λογαριασμός είναι ενεργός</li>
          <li>Δεδομένα συναλλαγών: 7 χρόνια (φορολογική υποχρέωση)</li>
          <li>Logs ασφαλείας: 90 ημέρες</li>
          <li>Μετά τη διαγραφή λογαριασμού: anonymization εντός 30 ημερών</li>
        </ul>
      </GdprSection>

      <GdprSection icon={<Shield size={20} />} title="Cookies">
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
          Χρησιμοποιούμε απαραίτητα cookies για τη λειτουργία της πλατφόρμας (session, auth). Δεν χρησιμοποιούμε cookies παρακολούθησης ή διαφήμισης χωρίς τη συγκατάθεσή σου.
        </p>
      </GdprSection>

      <GdprSection icon={<Mail size={20} />} title="Υπεύθυνος Επεξεργασίας">
        <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.9 }}>
          <p><strong style={{ color: 'var(--color-text)' }}>Agora.cy Ltd</strong></p>
          <p>Λεωφόρος Αρχιεπισκόπου Μακαρίου Γ΄ 123, 2220 Λευκωσία</p>
          <p>Email: <a href="mailto:gdpr@agora.cy" style={{ color: 'var(--color-teal)' }}>gdpr@agora.cy</a></p>
          <p>Τηλ: <a href="tel:+35799000001" style={{ color: 'var(--color-teal)' }}>+357 99 000 001</a></p>
          <p style={{ marginTop: '8px' }}>Εποπτική αρχή: <a href="https://www.dataprotection.gov.cy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-teal)' }}>Επίτροπος Προστασίας Δεδομένων Κύπρου</a></p>
        </div>
      </GdprSection>
    </main>
  );
}

function GdprSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '36px', paddingBottom: '36px', borderBottom: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ color: 'var(--color-teal)' }}>{icon}</span>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
