'use client';

import Link from 'next/link';
import { ArrowUp, Mail, Phone } from 'lucide-react';
import { contact } from '@/lib/contact';
import { SocialLinks } from './SocialLinks';

interface FooterLink {
  label: string;
  href: string;
}

const exploreLinks: FooterLink[] = [
  { label: 'Homepage', href: '/' },
  { label: 'Trading Journal', href: '/journal' },
  { label: 'TCT Algo', href: '/algo' },
  { label: 'TCT Strategies & Indicators', href: '/strategies' },
  { label: 'Famous Strategies', href: '/#famous-strategies' },
  { label: 'Liquidity Strategy', href: '/liquidity' },
];

const resourceLinks: FooterLink[] = [
  { label: 'Library', href: '/library' },
  { label: 'Articles', href: '/articles' },
  { label: 'Post', href: '/post' },
  { label: 'Help', href: '/help' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Liquidity Algo', href: '/liquidity-algo' },
];

const connectLinks: FooterLink[] = [
  { label: 'Contact TCT', href: '/contact' },
];

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="footcol">
      <h3>{title}</h3>
      <ul>
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <footer className="sitefooter">
      <div className="container">
        <div className="footgrid">
          {/* Column 1 — brand */}
          <div className="footcol footbrand">
            <h3>The Corporate Trader</h3>
            <p className="foottag">Trade. Track. Improve. Automate.</p>
            <p>
              AI-configured trading journals, MT5 automation, customised algos, and practical
              market education — built around process over promises.
            </p>
          </div>

          {/* Columns 2 & 3 — site map */}
          <LinkColumn title="Explore" links={exploreLinks} />
          <LinkColumn title="Resources" links={resourceLinks} />

          {/* Column 4 — connect */}
          <div className="footcol">
            <h3>Connect with us</h3>
            <ul>
              {connectLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
            <div className="footcontact">
              <a href={contact.tel}>
                <Phone size={15} aria-hidden="true" />
                {contact.phoneDisplay}
              </a>
              <a href={contact.mailto}>
                <Mail size={15} aria-hidden="true" />
                {contact.email}
              </a>
            </div>
            <SocialLinks />
          </div>
        </div>

        <div className="footbar">
          <span>© {year} The Corporate Trader (TCT). All rights reserved.</span>
          <button type="button" className="totop" onClick={toTop}>
            Back to top <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}
