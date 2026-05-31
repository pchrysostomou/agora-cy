'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Plus, Menu, X, User, LogOut, Package, ChevronDown, MessageCircle, Bell, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/lib/mock-auth';
import { useTheme } from '@/lib/theme';
import AuthModal from './AuthModal';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [prevPathname, setPrevPathname] = useState(pathname);
  const [prevUserId, setPrevUserId] = useState(user?.id);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMenuOpen(false);
  }

  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    if (!user?.id) {
      setUnreadCount(0);
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Unread message count — real-time
  useEffect(() => {
    if (!user?.id) return;
    const sb = createClient();
    let mounted = true;

    // Fetch count helper using async/await (avoids PromiseLike .catch() issue)
    const fetchCount = async () => {
      try {
        const { count, error } = await sb
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('read', false);
        if (!error && mounted) setUnreadCount(count ?? 0);
      } catch {
        // Network error — non-critical, ignore silently
      }
    };

    fetchCount();

    // Real-time — use userId in channel name to avoid conflicts
    const channelName = `navbar-unread-${user.id}`;
    const channel = sb
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `receiver_id=eq.${user.id}`,
      }, () => { fetchCount(); });

    // Subscribe with error handling
    try {
      channel.subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          console.warn('[Navbar] Realtime channel error — unread count will not update live.');
        }
      });
    } catch {
      // Realtime not available — non-critical
    }

    return () => {
      mounted = false;
      sb.removeChannel(channel);
    };
  }, [user?.id]);


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/listings?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <>
      <header
        className="navbar-glass"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 40, height: '64px',
          transition: 'box-shadow var(--transition)',
          boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
        }}
      >
        <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: '12px' }}>

          {/* Logo */}
          <Link href="/" style={{ flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '32px', height: '32px',
                background: 'linear-gradient(135deg, var(--color-teal), var(--color-teal-dark))',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(9,177,186,0.35)',
              }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: '16px' }}>A</span>
              </div>
              <span style={{
                fontWeight: 800, fontSize: '20px', color: 'var(--color-text)',
                letterSpacing: '-0.5px',
              }}>
                Agora<span style={{ color: 'var(--color-teal)' }}>.cy</span>
              </span>
            </div>
          </Link>

          {/* Search — desktop */}
          <form onSubmit={handleSearch} className="desktop-search" style={{ flex: 1, maxWidth: '480px', display: 'none' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{
                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)', pointerEvents: 'none',
              }} />
              <input
                type="search"
                placeholder="Αναζήτηση αγγελιών..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px 9px 36px',
                  border: '1.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '14px', color: 'var(--color-text)',
                  background: 'var(--color-surface-2)',
                  outline: 'none', transition: 'all var(--transition)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-teal)';
                  e.target.style.background = 'var(--color-surface)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(9,177,186,0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.background = 'var(--color-surface-2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </form>

          {/* Right side */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Nav links — desktop */}
            <nav style={{ display: 'none' }} className="desktop-nav">
              <Link href="/listings" style={{
                fontSize: '14px', fontWeight: 500,
                color: pathname === '/listings' ? 'var(--color-teal)' : 'var(--color-text-muted)',
                padding: '6px 12px', borderRadius: 'var(--radius-full)',
                transition: 'all var(--transition)',
              }}>
                Αγγελίες
              </Link>
              <Link href="/how-it-works" style={{
                fontSize: '14px', fontWeight: 500,
                color: 'var(--color-text-muted)',
                padding: '6px 12px', borderRadius: 'var(--radius-full)',
                transition: 'all var(--transition)',
              }}>
                Πώς λειτουργεί
              </Link>
            </nav>

            {/* 🌓 Dark/Light toggle */}
            <button
              onClick={toggle}
              className="btn-theme"
              aria-label={theme === 'dark' ? 'Εναλλαγή σε φωτεινό θέμα' : 'Εναλλαγή σε σκοτεινό θέμα'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark'
                ? <Sun size={16} style={{ color: '#f59e0b' }} />
                : <Moon size={16} />}
            </button>

            {user ? (
              <>
                {/* Sell button */}
                <Link href="/listings/new" className="btn-primary btn-sm" style={{ gap: '4px' }}>
                  <Plus size={15} />
                  <span className="desktop-only">Πούλησε</span>
                </Link>

                {/* Notifications / Messages */}
                <Link
                  href="/messages"
                  className="btn-ghost btn-sm"
                  style={{ padding: '8px', position: 'relative' }}
                  title="Μηνύματα"
                >
                  <MessageCircle size={18} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: '3px', right: '3px',
                      width: '16px', height: '16px',
                      background: 'var(--color-teal)',
                      color: '#fff', fontSize: '10px', fontWeight: 700,
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1,
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User dropdown */}
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '5px 10px 5px 6px',
                      border: '1.5px solid var(--color-border)',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--color-surface)',
                      cursor: 'pointer', transition: 'all var(--transition)',
                    }}
                  >
                    <img src={user.avatar} alt={user.username} width={28} height={28}
                      style={{ borderRadius: '50%', background: 'var(--color-gray-100)' }} />
                    <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
                  </button>

                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      boxShadow: 'var(--shadow-lg)',
                      minWidth: '200px', overflow: 'hidden',
                      animation: 'slideUp 0.15s ease',
                    }}>
                      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                        <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text)' }}>{user.fullName}</p>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>@{user.username}</p>
                      </div>
                      <div style={{ padding: '6px' }}>
                        <DropdownItem href="/profile/me" icon={<User size={15} />} label="Το προφίλ μου" onClick={() => setDropdownOpen(false)} />
                        <DropdownItem href="/messages" icon={<MessageCircle size={15} />} label={`Μηνύματα${unreadCount > 0 ? ` (${unreadCount})` : ''}`} onClick={() => setDropdownOpen(false)} />
                        <DropdownItem href="/listings/new" icon={<Package size={15} />} label="Οι αγγελίες μου" onClick={() => setDropdownOpen(false)} />
                        <hr style={{ margin: '6px 0', border: 'none', borderTop: '1px solid var(--color-border)' }} />
                        <button
                          onClick={() => { logout(); setDropdownOpen(false); }}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '9px 12px', borderRadius: 'var(--radius-md)',
                            border: 'none', background: 'none', fontSize: '14px',
                            color: 'var(--color-error)', cursor: 'pointer',
                            transition: 'background var(--transition)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(220,38,38,0.08)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                        >
                          <LogOut size={15} /> Αποσύνδεση
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button onClick={() => setAuthOpen(true)} className="btn-ghost btn-sm desktop-only-flex" style={{ display: 'none' }}>
                  Σύνδεση
                </button>
                <button onClick={() => setAuthOpen(true)} className="btn-primary btn-sm">
                  Εγγραφή
                </button>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="btn-ghost btn-sm mobile-menu-btn"
              style={{ padding: '8px', display: 'none' }}
              aria-label="Μενού"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 39, top: '64px' }}
        />
      )}

      {/* Mobile menu drawer */}
      <div style={{
        position: 'fixed', top: '64px', left: 0, right: 0,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)',
        padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        zIndex: 39,
        transform: menuOpen ? 'translateY(0)' : 'translateY(-110%)',
        opacity: menuOpen ? 1 : 0,
        transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease',
      }} className="mobile-drawer">

        {/* Mobile search */}
        <form onSubmit={handleSearch}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="search"
              placeholder="Αναζήτηση..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input"
              style={{ paddingLeft: '36px', fontSize: '16px' /* prevents iOS zoom */ }}
            />
          </div>
        </form>

        <Link href="/listings" className="btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--color-text)' }}>Αγγελίες</Link>
        <Link href="/how-it-works" className="btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--color-text)' }}>Πώς λειτουργεί</Link>

        <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

        {/* Dark mode toggle in mobile menu */}
        <button
          onClick={toggle}
          className="btn-ghost"
          style={{ justifyContent: 'flex-start', gap: '10px', color: 'var(--color-text)' }}
        >
          {theme === 'dark'
            ? <><Sun size={18} style={{ color: '#f59e0b' }} /> Φωτεινό θέμα</>
            : <><Moon size={18} /> Σκοτεινό θέμα</>}
        </button>

        {!user ? (
          <button onClick={() => { setAuthOpen(true); setMenuOpen(false); }} className="btn-primary">
            Σύνδεση / Εγγραφή
          </button>
        ) : (
          <>
            <Link href="/listings/new" className="btn-primary" style={{ textAlign: 'center' }}>
              + Νέα αγγελία
            </Link>
            <Link href="/profile/me" className="btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--color-text)' }}>
              Το προφίλ μου
            </Link>
            <button onClick={logout} className="btn-ghost" style={{ justifyContent: 'flex-start', color: 'var(--color-error)' }}>
              Αποσύνδεση
            </button>
          </>
        )}
      </div>

      {/* Responsive styles */}
      <style jsx global>{`
        @media (min-width: 768px) {
          .desktop-search { display: block !important; }
          .desktop-nav { display: flex !important; align-items: center; }
          .desktop-only { display: inline !important; }
          .desktop-only-flex { display: inline-flex !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-drawer { display: none !important; }
        }
        @media (max-width: 767px) {
          .desktop-only { display: none !important; }
          .desktop-only-flex { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

function DropdownItem({ href, icon, label, onClick }: {
  href: string; icon: React.ReactNode; label: string; onClick: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '9px 12px', borderRadius: 'var(--radius-md)',
      fontSize: '14px', color: 'var(--color-text-2)',
      transition: 'background var(--transition)',
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-gray-100)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
    >
      {icon}{label}
    </Link>
  );
}
