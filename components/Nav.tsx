'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Bot, BookOpen, Smartphone, Settings2, Menu, X } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabase';
import { GoogleIcon } from './GoogleIcon';

/** Site links stay in the navigation row; account actions sit beside the brand. */
export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Market Watch', href: '/post' },
] as const;

export const helpItem = { label: 'Help', href: '/help' };


const productItems = [
  { label: 'TCT Algo', href: '/algo', description: 'Rule-based trade management for MT5', icon: Bot },
  { label: 'Strategies & Indicators', href: '/strategies', description: 'Explore tools for your trading process', icon: BookOpen },
  { label: 'Trading Journal', href: '/journal', description: 'Track, review, and learn from your trades', icon: Smartphone },
  { label: 'Build Your Own Algo', href: '/algo#custom-algo-section', description: 'Turn your strategy rules into automation', icon: Settings2 },
];

const learnItems = [
  { label: 'Library', href: '/library', description: 'Build your knowledge with free resources', icon: BookOpen },
  { label: 'Famous Strategies', href: '/#famous-strategies', description: 'Explore approaches from well-known traders', icon: Bot },
  { label: 'Articles', href: '/articles', description: 'Practical insights for a disciplined process', icon: BookOpen },
];

function NavDropdown({ title, items, mobile = false, onNavigate }: { title: string; items: typeof productItems; mobile?: boolean; onNavigate?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const active = items.some((item) => item.href === pathname);
  const panelId = `${mobile ? 'mobile' : 'desktop'}-${title.toLowerCase()}`;

  useEffect(() => { setExpanded(false); }, [pathname]);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setExpanded(false);
    };
    const breakpoint = window.matchMedia('(min-width: 851px)');
    const resize = () => setExpanded(false);
    document.addEventListener('pointerdown', close);
    breakpoint.addEventListener('change', resize);
    return () => {
      document.removeEventListener('pointerdown', close);
      breakpoint.removeEventListener('change', resize);
    };
  }, []);

  return <div ref={root} className={mobile ? 'products-menu products-mobile' : 'products-menu'}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setExpanded(false); }}
    onKeyDown={(event) => {
      if (event.key === 'Escape' && expanded) {
        event.stopPropagation(); setExpanded(false); trigger.current?.focus();
      }
    }}>
    <button ref={trigger} type="button" className={active ? 'products-trigger active' : 'products-trigger'}
      aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpanded((value) => !value)}>
      {title} <ChevronDown size={16} aria-hidden="true" />
    </button>
    <div id={panelId} className="products-panel" hidden={!expanded}>
      {items.map(({ label, href, description, icon: Icon }) => <Link key={href} href={href}
        className="product-nav-link" aria-current={href === pathname ? 'page' : undefined}
        onClick={() => { setExpanded(false); onNavigate?.(); }}>
        <Icon size={20} aria-hidden="true" />
        <span><strong>{label}</strong><small>{description}</small></span>
      </Link>)}
    </div>
  </div>;
}

export function Nav() {
  const { user, loading } = useSession();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const googleInFlight = useRef(false);

  async function continueWithGoogle() {
    if (googleInFlight.current) return;
    setGoogleError('');
    const client = supabase;
    if (!client) {
      setGoogleError('Account services are unavailable. Please try again later.');
      return;
    }
    googleInFlight.current = true;
    setGoogleBusy(true);
    setOpen(false);
    try {
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/auth/callback' },
      });
      if (error) throw error;
    } catch {
      setGoogleError('Unable to continue with Google. Please try again or use Log In.');
      googleInFlight.current = false;
      setGoogleBusy(false);
    }
  }

  // Restore the button when returning with the browser Back button.
  useEffect(() => {
    const reset = () => {
      googleInFlight.current = false;
      setGoogleBusy(false);
    };
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);


  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // A drawer opened on mobile must not keep desktop scrolling locked.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 851px)');
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

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
      <style>{`
        .nav-brand { display: flex; align-items: center; gap: 12px; }
        .nav-logo { width: 64px; height: 64px; flex-shrink: 0; border-radius: 50%; object-fit: contain; }
        .nav-brand-copy { min-width: 0; }
        .nav-brand .brand { display: block; }
        @media (max-width: 540px) {
          .nav-brand { gap: 9px; }
          .nav-logo { width: 44px; height: 44px; }
          .nav-brand .brand { font-size: 12px; letter-spacing: .04em; }
          .nav-brand .brandtagline { font-size: 9px; letter-spacing: 0; }
        }
        .products-menu { position: relative; }
        .products-trigger { display: flex; align-items: center; gap: 7px; min-height: 44px; padding: 8px 0; color: #a9bdcf; background: transparent; border: 0; cursor: pointer; font: inherit; }
        .products-trigger:hover, .products-trigger.active, .products-trigger[aria-expanded="true"] { color: #00f0ff; }
        .products-trigger[aria-expanded="true"] svg { transform: rotate(180deg); }
        .products-panel { position: absolute; top: calc(100% + 8px); left: -16px; width: 360px; max-width: calc(100vw - 32px); padding: 8px; background: #0c1724; border: 1px solid #254157; border-radius: 16px; box-shadow: 0 20px 50px #0006; z-index: 40; }
        .product-nav-link { display: flex; align-items: center; gap: 14px; padding: 14px 12px; border-radius: 10px; }
        .product-nav-link:hover, .product-nav-link:focus-visible { background: #14283a; }
        .product-nav-link > svg { flex-shrink: 0; color: #00d4ed; }
        .product-nav-link strong { display: block; color: #edf7ff; font-size: 14px; font-weight: 700; }
        .product-nav-link small { display: block; color: #9eb4c8; font-size: 12px; line-height: 1.5; margin-top: 4px; }
        .products-mobile .products-trigger { width: 100%; justify-content: space-between; padding: 14px 12px; font-size: 16px; font-weight: 600; border-bottom: 1px solid #1e3042; }
        .products-mobile .products-panel { position: static; width: 100%; max-width: none; margin: 6px 0; box-shadow: none; }
        .nav .navtop { flex-wrap: wrap; }
        .nav .account-actions { flex-wrap: wrap; max-width: 100%; }
        .nav .account-actions .nav-google {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 9px; background: #fff; color: #1f2937; border: 1px solid #dadce0;
          white-space: nowrap; min-height: 40px;
        }
        .nav .account-actions .nav-google:hover { background: #f3f6fa; }
        .nav .nav-google svg { width: 18px; height: 18px; flex-shrink: 0; }
        .nav .nav-google:disabled { opacity: .7; cursor: wait; }
        .nav .nav-google-error { width: 100%; margin: 10px 0 0; color: #ffb4b4; font-size: 13px; }
        @media (max-width: 850px) {
          .nav .account-actions { width: 100%; gap: 8px; }
          .nav .account-actions .nav-google { font-size: 12px; padding: 9px 12px; }
        }
      `}</style>
      <div className="container navin">
        <div className="navtop">
          <div className="brandblock">
            <Link className="nav-brand" href="/" aria-label="The Corporate Trader — home">
              <Image className="nav-logo" src="/images/tct-logo.png" alt="" width={64} height={64} sizes="(max-width: 540px) 44px, 64px" priority />
              <span className="nav-brand-copy">
                <span className="brand">THE CORPORATE <span>TRADER</span></span>
                <span className="brandtagline" style={{ display: 'block' }}>Trade. Track. Improve. Automate.</span>
              </span>
            </Link>
          </div>
          <div className="account-actions" aria-label="Account">
            {!loading && !user && <>
            <Link className="btn ghost" href="/login" onClick={() => setOpen(false)}>Log In</Link>
            <Link className="btn primary" href="/register" onClick={() => setOpen(false)}>Create Account</Link>
            <button
              type="button"
              className="btn nav-google"
              onClick={continueWithGoogle}
              disabled={googleBusy}
              aria-busy={googleBusy}
              aria-describedby={googleError ? 'nav-google-error' : undefined}
            >
              <GoogleIcon />
              {googleBusy ? 'Redirecting…' : 'Continue with Google'}
            </button>
            </>}
            {user && <><Link className="btn ghost" href="/dashboard">My account</Link><button className="btn ghost" onClick={async () => { await supabase?.auth.signOut(); }}>Sign out</button></>}
          </div>
        </div>

        {!loading && !user && googleError && (
          <p id="nav-google-error" className="nav-google-error" role="alert">{googleError}</p>
        )}

        {/* Desktop links */}
        <div className="links">
          <Link href="/" className={isActive('/') ? 'navlink active' : 'navlink'} aria-current={isActive('/') ? 'page' : undefined}>Home</Link>
          <NavDropdown title="Products" items={productItems} />
          <NavDropdown title="Learn" items={learnItems} />
          {navItems.slice(1).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
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
          <Link href="/" className={isActive('/') ? 'mobilelink active' : 'mobilelink'} onClick={() => setOpen(false)}>Home</Link>
          {open && <>
            <NavDropdown title="Products" items={productItems} mobile onNavigate={() => setOpen(false)} />
            <NavDropdown title="Learn" items={learnItems} mobile onNavigate={() => setOpen(false)} />
          </>}
          {navItems.slice(1).map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
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
