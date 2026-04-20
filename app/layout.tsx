import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import LiveChat from '@/components/LiveChat';
import { ThemeProvider } from '@/lib/theme';

const inter = Inter({
  subsets: ['latin', 'greek'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Agora.cy — Αγόρασε & Πούλησε στην Κύπρο',
    template: '%s | Agora.cy',
  },
  description:
    'Η μεγαλύτερη αγορά μεταχειρισμένων αντικειμένων στην Κύπρο. Αγγελίες, άμεσες αγορές, και ασφαλείς πληρωμές.',
  keywords: ['αγγελίες', 'κύπρος', 'μεταχειρισμένα', 'marketplace', 'agora'],
  openGraph: {
    title: 'Agora.cy',
    description: 'Αγόρασε & Πούλησε στην Κύπρο',
    locale: 'el_CY',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('agora-theme');
              var p = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              if ((t || p) === 'dark') document.documentElement.classList.add('dark');
            } catch(e) {}
          })();
        `}} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <Navbar />
          <main style={{ minHeight: 'calc(100vh - 64px)', paddingTop: '64px' }}>
            {children}
          </main>
          <LiveChat />
          <footer style={{
            borderTop: '1px solid var(--color-border)',
            padding: '32px 0',
            marginTop: '64px',
            background: 'var(--color-surface-2)',
          }}>
            <div className="container" style={{
              display: 'flex', flexWrap: 'wrap', gap: '16px',
              justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <span style={{ fontWeight: 700, color: 'var(--color-teal)', fontSize: '18px' }}>
                  Agora.cy
                </span>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '4px' }}>
                  © 2026 Agora.cy — Όλα τα δικαιώματα διατηρούνται.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {[
                  ['Πώς λειτουργεί', '/how-it-works'],
                  ['Ασφάλεια', '/safety'],
                  ['Επικοινωνία', '/contact'],
                  ['Όροι Χρήσης', '/terms'],
                  ['GDPR', '/gdpr'],
                ].map(([label, href]) => (
                  <a key={href} href={href} className="footer-link">{label}</a>
                ))}
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
