'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabase';

/** Site links stay in the navigation row; account actions sit beside the brand. */
export const navItems = [
  { label: 'Homepage', href: '/' },
  { label: 'Trading Journal', href: '/journal' },
  { label: 'TCT Algo', href: '/algo' },
  { label: 'TCT Strategies & Indicators', href: '/strategies' },
  { label: 'Famous Strategies', href: '/#famous-strategies' },
  { label: 'Library', href: '/library' },
  { label: 'Post', href: '/post' },
  { label: 'Articles', href: '/articles' },
] as const;

export const helpItem = { label: 'Help', href: '/help' };

export function Nav() {
  const { user, loading } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Allow Esc to dismiss the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isActive = (href: string) => {
    if (href.startsWith('/#')) return false;
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="nav" id="top" aria-label="Main navigation">
      <div className="container navin">
        <div className="navtop">
          <div className="brandblock">
            <Link className="brand" href="/" aria-label="The Corporate Trader — home">
              THE CORPORATE <span>TRADER</span>
            </Link>
            <p className="brandtagline">Trade. Track. Improve. Automate.</p>
          </div>
          <div className="account-actions" aria-label="Account">
            {!loading && !user && <>
            <Link className="btn ghost" href="/login" onClick={() => setOpen(false)}>Log In</Link>
            <Link className="btn primary" href="/register" onClick={() => setOpen(false)}>Create Account</Link>
            </>}
            {user && <><Link className="btn ghost" href="/dashboard">My account</Link><button className="btn ghost" onClick={async () => { await supabase?.auth.signOut(); }}>Sign out</button></>}
          </div>
        </div>

        {/* Desktop links */}
        <div className="links">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={isActive(item.href) ? 'navlink active' : 'navlink'}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={helpItem.href}
            className={isActive(helpItem.href) ? 'navlink active' : 'navlink'}
          >
            {helpItem.label}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="navtoggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer — site navigation; account actions remain above */}
      <div
        id="mobile-menu"
        className={open ? 'mobilemenu open' : 'mobilemenu'}
        hidden={!open}
      >
        <div className="mobilemenu-inner">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={isActive(item.href) ? 'mobilelink active' : 'mobilelink'}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={helpItem.href}
            className={isActive(helpItem.href) ? 'mobilelink active' : 'mobilelink'}
            onClick={() => setOpen(false)}
          >
            {helpItem.label}
          </Link>
        </div>
      </div>
    </nav>
  );
}
