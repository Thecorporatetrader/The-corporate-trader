import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/Site';

export const metadata: Metadata = {
  title: 'TCT Liquidity Algo — Coming Soon',
  description:
    'Register interest in the fully automatic TCT Liquidity Algo, launching at ₹49,999 with early registration at ₹999.',
};

export default function Page() {
  return (
    <main>
      <PageHero kicker="COMING SOON" title="Fully Automatic Liquidity Algo">
        An upcoming MT5 EA built around fully automated liquidity-based execution — detection,
        entries and trade management handled by the system.
      </PageHero>
      <section className="container">
        <div className="twocol">
          <div className="card">
            <span className="pill">EARLY REGISTRATION</span>
            <h2 style={{ marginTop: 12 }}>Join the early list</h2>
            <p>
              Register now for <b>₹999</b> to reserve your place on the early list. The Liquidity
              Algo is expected to launch at <b>₹49,999</b>. Your current TCT Algo (the first
              algo) stays free either way.
            </p>
            <input className="input" placeholder="Email address" />
            <div className="actions">
              <button className="btn primary">Join Waitlist</button>
              <Link className="btn ghost" href="/contact">
                Contact Us
              </Link>
            </div>
            <div className="notice" style={{ marginTop: 18 }}>
              <b>No live payment collection yet.</b> This form does not take payment — it is not
              connected to a backend. To actually register and pay the ₹999 early-list amount,
              use the Contact Us link and TCT will confirm the next step directly.
            </div>
          </div>
          <div className="card">
            <div className="eyebrow">TCT PRINCIPLE</div>
            <h2>Process over promises.</h2>
            <p>
              Clear tools, transparent access rules and risk-aware education. TCT does not
              present trading results as guaranteed outcomes. Pricing and launch timing may
              change before release.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
