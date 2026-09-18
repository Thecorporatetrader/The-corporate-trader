import Link from 'next/link';
import type { Metadata } from 'next';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { PageHero } from '@/components/Site';
import { SocialLinks } from '@/components/SocialLinks';
import { contact } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Help — The Corporate Trader',
  description:
    'Help centre for TCT: where to start, how algo access works, journal support and how to reach us.',
};

export default function Page() {
  return (
    <main>
      <PageHero kicker="HELP" title="Help Centre">
        Find the right page fast, understand how access works, and see what is still being
        built.
      </PageHero>

      <section className="container">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">START HERE</div>
            <h2>Common tasks.</h2>
          </div>
          <p>Most questions are answered by one of these four routes.</p>
        </div>
        <div className="grid-4">
          <Link className="card" href="/contact">
            <span className="pill">ALGO</span>
            <h3>Get algo access — free</h3>
            <p>Your first TCT algo is free. Message us directly and we&apos;ll set it up.</p>
            <span className="good">Open →</span>
          </Link>
          <Link className="card" href="/journal">
            <span className="pill">JOURNAL</span>
            <h3>Journal help</h3>
            <p>What the Android journal does and where your trade data is stored.</p>
            <span className="good">Open →</span>
          </Link>
          <Link className="card" href="/faq">
            <span className="pill">FAQ</span>
            <h3>Read the FAQ</h3>
            <p>Short answers on products, storage, licensing and source code.</p>
            <span className="good">Open →</span>
          </Link>
          <Link className="card" href="/contact">
            <span className="pill">CONTACT</span>
            <h3>Message TCT</h3>
            <p>Send a question if the FAQ does not cover your situation.</p>
            <span className="good">Open →</span>
          </Link>
        </div>
      </section>

      <section className="container">
        <div className="twocol">
          <div className="card">
            <h2>Troubleshooting</h2>
            <div className="list">
              <div className="row">
                <b>My login does not work</b>
                <br />
                Accounts are not active on this build. The login and register screens are
                interface only until the authentication backend is connected.
              </div>
              <div className="row">
                <b>How do I get algo access?</b>
                <br />
                There is no MT5-detail form to submit. Your first algo is free — contact TCT
                directly on WhatsApp, phone or email using the details on this page, and access
                is set up from there.
              </div>
              <div className="row">
                <b>I cannot find the journal on the website</b>
                <br />
                It is an Android application, not a web app. The website is its product page.
              </div>
              <div className="row">
                <b>Where is the EA source code?</b>
                <br />
                It is not distributed. Approved users receive the compiled Expert Advisor only.
              </div>
            </div>
          </div>
          <div className="card">
            <div className="eyebrow">CONTACT</div>
            <h2>Reaching us</h2>
            <div className="contactrows">
              <a href={contact.tel}>
                <Phone size={17} aria-hidden="true" />
                {contact.phoneDisplay}
              </a>
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={17} aria-hidden="true" />
                WhatsApp — {contact.phoneDisplay}
              </a>
              <a href={contact.mailto}>
                <Mail size={17} aria-hidden="true" />
                {contact.email}
              </a>
            </div>
            <p style={{ marginTop: 20 }}>Follow TCT:</p>
            <SocialLinks />
            <Link className="btn ghost" href="/contact" style={{ marginTop: 20 }}>
              Open contact page
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
