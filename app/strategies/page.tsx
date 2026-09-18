import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/Site';

export const metadata: Metadata = {
  title: 'TCT Strategies — The Corporate Trader',
  description:
    'The strategy frameworks behind TCT: liquidity-based market structure, risk-first execution and journal-driven review.',
};

export default function Page() {
  return (
    <main>
      <PageHero kicker={'TCT STRATEGIES & INDICATORS'} title={'Explore TCT Strategies & Indicators'}>
        The strategy frameworks our tools are built around — how a setup is defined, how risk is
        sized, and how every trade gets reviewed afterwards.
      </PageHero>

      <section className="container">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">FRAMEWORKS</div>
            <h2>Three layers, one process.</h2>
          </div>
          <p>
            A strategy is not just an entry. TCT treats structure, risk and review as one loop —
            each layer feeding the next.
          </p>
        </div>
        <div className="grid">
          <div className="card">
            <span className="pill">STRUCTURE</span>
            <h3>Liquidity-based structure</h3>
            <p>
              Reading buy-side and sell-side liquidity, sweeps, break of structure, change of
              character and displacement before a setup is considered valid.
            </p>
            <Link className="good" href="/liquidity">
              Liquidity Strategy →
            </Link>
          </div>
          <div className="card">
            <span className="pill">RISK</span>
            <h3>Risk-first execution</h3>
            <p>
              Position size derived from a fixed risk budget and invalidation level, so a losing
              trade costs a planned amount rather than an emotional one.
            </p>
            <Link className="good" href="/articles">
              Related articles →
            </Link>
          </div>
          <div className="card">
            <span className="pill">REVIEW</span>
            <h3>Journal-driven review</h3>
            <p>
              Every trade rated against the plan that was written before entry, so patterns
              surface from your own data instead of memory.
            </p>
            <Link className="good" href="/journal">
              TCT Journal →
            </Link>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="card twocol">
          <div>
            <div className="eyebrow">AUTOMATION</div>
            <h2>From strategy to algo</h2>
            <p>
              Once a strategy has explicit entry, exit and risk rules, it can be automated. TCT
              builds those rules into a licensed MT5 Expert Advisor — either our own algo or one
              developed to your inputs.
            </p>
            <div className="actions">
              <Link className="btn primary" href="/algo">
                Explore TCT Algo
              </Link>
              <Link className="btn ghost" href="/contact">
                Connect with us to Get Algo Access
              </Link>
            </div>
          </div>
          <div className="notice">
            <b>No guaranteed outcomes.</b>
            <br />
            <br />
            TCT strategy material is educational. We do not sell signals, publish verified track
            records on this site, or present any framework as a guaranteed outcome.
          </div>
        </div>
      </section>

      <section className="container">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">CONTEXT</div>
            <h2>Historical strategies</h2>
          </div>
          <Link href="/#famous-strategies">Famous Strategies →</Link>
        </div>
        <div className="card">
          <p style={{ margin: 0 }}>
            For historical context on how well-known traders formalised their own rules, see the
            Famous Strategies section on the homepage. Those are third-party approaches included
            as education only — they are not TCT products.
          </p>
        </div>
      </section>
    </main>
  );
}
