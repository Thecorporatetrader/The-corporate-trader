import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/Site';

export const metadata: Metadata = {
  title: 'Get Algo Access — The Corporate Trader',
  description: 'Your first TCT algo is free — contact us to get set up.',
};

export default function Page() {
  return (
    <main>
      <PageHero kicker="ALGO ACCESS" title="Get Algo Access">
        Your first TCT algo is free. Access is set up directly with our team rather than
        through an online form.
      </PageHero>
      <section className="container">
        <div className="twocol">
          <div className="card">
            <h2>Get your first algo free</h2>
            <p>
              Message TCT directly and we&apos;ll confirm eligibility and get your first algo set
              up — no MT5 details need to be submitted through this site.
            </p>
            <div className="actions">
              <Link className="btn primary" href="/contact">
                Contact Us
              </Link>
            </div>
          </div>
          <div className="card">
            <div className="eyebrow">TCT PRINCIPLE</div>
            <h2>Process over promises.</h2>
            <p>
              Clear tools, transparent access rules and risk-aware education. TCT does not
              present trading results as guaranteed outcomes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
