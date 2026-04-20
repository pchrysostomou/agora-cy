import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Όροι Χρήσης | Agora.cy',
  description: 'Όροι και Προϋποθέσεις Χρήσης της πλατφόρμας Agora.cy.',
};

export default function TermsPage() {
  return (
    <main className="container" style={{ paddingTop: '48px', paddingBottom: '80px', maxWidth: '760px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text)', marginBottom: '8px' }}>
        Όροι & Προϋποθέσεις Χρήσης
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '40px' }}>
        Τελευταία ενημέρωση: 20 Απριλίου 2026
      </p>

      <TermsSection title="1. Γενικά">
        <p>Η πλατφόρμα Agora.cy («Πλατφόρμα») είναι ηλεκτρονική αγορά που διαχειρίζεται η εταιρεία Agora.cy Ltd, εγγεγραμμένη στην Κυπριακή Δημοκρατία. Με τη χρήση της Πλατφόρμας, αποδέχεσαι πλήρως τους παρόντες Όρους Χρήσης.</p>
      </TermsSection>

      <TermsSection title="2. Δικαίωμα Χρήσης">
        <ul>
          <li>Πρέπει να είσαι τουλάχιστον 18 ετών</li>
          <li>Πρέπει να παρέχεις ακριβή και αληθή στοιχεία</li>
          <li>Κάθε χρήστης μπορεί να έχει έναν μόνο λογαριασμό</li>
          <li>Απαγορεύεται η χρήση bots ή αυτοματοποιημένων συστημάτων</li>
        </ul>
      </TermsSection>

      <TermsSection title="3. Αγγελίες & Περιεχόμενο">
        <p>Ο χρήστης φέρει αποκλειστική ευθύνη για το περιεχόμενο των αγγελιών του. Απαγορεύεται αυστηρά:</p>
        <ul>
          <li>Πώληση παράνομων αντικειμένων ή ουσιών</li>
          <li>Παραπλανητικές ή ψευδείς αγγελίες</li>
          <li>Αντίγραφα / piracy λογισμικού, μουσικής, ταινιών</li>
          <li>Αντικείμενα που παραβιάζουν δικαιώματα πνευματικής ιδιοκτησίας</li>
          <li>Όπλα, νάρκες, εκρηκτικά</li>
          <li>Ζωντανά ζώα χωρίς τα απαραίτητα πιστοποιητικά</li>
        </ul>
      </TermsSection>

      <TermsSection title="4. Συναλλαγές & Escrow">
        <ul>
          <li>Όλες οι πληρωμές διενεργούνται αποκλειστικά μέσω της Πλατφόρμας</li>
          <li>Τα χρήματα κρατούνται σε escrow μέχρι επιβεβαίωση παραλαβής</li>
          <li>Η Agora.cy λαμβάνει προμήθεια 5% επί της αξίας κάθε συναλλαγής</li>
          <li>Η Agora.cy δεν φέρει ευθύνη για τυχόν διαφορές μεταξύ αγοραστή και πωλητή που προκύπτουν εκτός πλατφόρμας</li>
        </ul>
      </TermsSection>

      <TermsSection title="5. Διαφορές & Επιστροφές">
        <ul>
          <li>Ο αγοραστής έχει 3 ημέρες από την παραλαβή για να αναφέρει πρόβλημα</li>
          <li>Αν δεν επιβεβαιωθεί παραλαβή εντός 14 ημερών, τα χρήματα αποδεσμεύονται αυτόματα</li>
          <li>Διαφορές εξετάζονται εντός 5 εργάσιμων ημερών</li>
          <li>Η απόφαση της Agora.cy είναι οριστική σε περιπτώσεις διαφοράς</li>
        </ul>
      </TermsSection>

      <TermsSection title="6. Απαγορευμένες Ενέργειες">
        <ul>
          <li>Παρακαμπτήριο πληρωμών εκτός Πλατφόρμας</li>
          <li>Παρενόχληση ή απειλές άλλων χρηστών</li>
          <li>Δημοσίευση spam ή διαφημίσεων τρίτων χωρίς άδεια</li>
          <li>Hacking ή προσπάθεια παραβίασης της ασφάλειας</li>
        </ul>
      </TermsSection>

      <TermsSection title="7. Αναστολή & Τερματισμός">
        <p>Η Agora.cy διατηρεί το δικαίωμα να αναστείλει ή να τερματίσει λογαριασμό που παραβιάζει τους παρόντες όρους, χωρίς προηγούμενη ειδοποίηση, σε περιπτώσεις σοβαρής παράβασης.</p>
      </TermsSection>

      <TermsSection title="8. Ευθύνη">
        <p>Η Agora.cy παρέχει την Πλατφόρμα «ως έχει» και δεν εγγυάται αδιάλειπτη ή άψογη λειτουργία. Δεν φέρουμε ευθύνη για ζημίες που προκύπτουν από τη χρήση ή αδυναμία χρήσης της Πλατφόρμας πέραν της αξίας της εκάστοτε συναλλαγής.</p>
      </TermsSection>

      <TermsSection title="9. Εφαρμοστέο Δίκαιο">
        <p>Οι παρόντες Όροι διέπονται από το δίκαιο της Κυπριακής Δημοκρατίας. Για οποιαδήποτε διαφορά αρμόδια είναι τα δικαστήρια της Λευκωσίας.</p>
      </TermsSection>

      <TermsSection title="10. Επικοινωνία">
        <p>Για ερωτήσεις σχετικά με τους Όρους Χρήσης: <a href="mailto:legal@agora.cy" style={{ color: 'var(--color-teal)', fontWeight: 600 }}>legal@agora.cy</a></p>
      </TermsSection>
    </main>
  );
}

function TermsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid var(--color-border)' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '12px' }}>{title}</h2>
      <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
        {children}
      </div>
      <style>{`
        .container li { margin-bottom: 4px; }
        .container ul { padding-left: 20px; }
      `}</style>
    </div>
  );
}
