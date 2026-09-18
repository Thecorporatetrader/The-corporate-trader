import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TCT Algo — The Corporate Trader',
  description:
    'TCT Algo automates entries, exits and trade management with discipline. Get your first algo free — the fully automatic Liquidity Algo is coming soon.',
};

export default function Page() {
  return (
    <main>
      {/* HERO — text left, free-algo callout right */}
      <div className="pagehero container heroflex">
        <div className="herotext">
          <div className="eyebrow">MT5 AUTOMATION</div>
          <h1>TCT Algo — Trade Without Fear or Greed</h1>
          <p>
            A private MT5 Expert Advisor distributed through controlled account verification and
            server-side license checks.
          </p>
        </div>
        <div className="herocta">
          <h3>Get your first algo free</h3>
          <p>No cost for your first TCT algo. Reach out and we&apos;ll set up access.</p>
          <Link className="btn primary" href="/contact">
            Get Your First Algo Free
          </Link>
        </div>
      </div>

      {/* FEAR / GREED PERSUASIVE SECTION */}
      <section className="container">
        <div className="card">
          <p>
            Most traders lose money not because of bad setups, but because of lack of
            discipline, fear, greed, and premature exits.
          </p>
          <p>
            They stare at charts, second-guess every move, and freeze when it&apos;s time to
            exit. They don&apos;t know when to stop, when to trail, or when to trust their plan —
            emotions take over, and logic disappears.
          </p>
          <p style={{ fontWeight: 700 }}>Your algo changes that.</p>
          <p>
            It trades with precision, discipline, and automation — no panic, no overthinking.
          </p>
          <div className="list">
            <div className="row">
              <b>Fear doesn&apos;t exist here.</b>
              <br />
              The system executes calmly, even when the market spikes.
            </div>
            <div className="row">
              <b>Greed is controlled.</b>
              <br />
              Every trade follows rules, not impulses.
            </div>
            <div className="row">
              <b>Freedom is real.</b>
              <br />
              Go out, sleep, live your life — the algo manages entries, stop losses, and
              trailing stops automatically.
            </div>
          </div>
          <p style={{ marginTop: 18 }}>Let the machine handle the chaos. You handle your peace.</p>
        </div>
      </section>

      {/* UPCOMING ALGO ONLY */}
      <section className="container">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">COMING SOON</div>
            <h2>Fully Automatic Liquidity Algo</h2>
          </div>
          <p>
            Our next-generation EA, built around fully automated liquidity-based execution —
            detection, entries and trade management handled by the system.
          </p>
        </div>
        <div className="card">
          <span className="pill">COMING SOON</span>
          <p style={{ marginTop: 14 }}>
            Register now for ₹999 to reserve your place on the early list; the algo is expected
            to launch at ₹49,999.
          </p>
          <div className="actions">
            <Link className="btn primary" href="/liquidity-algo">
              Register Interest — ₹999
            </Link>
            <Link className="btn ghost" href="/contact">
              Contact Us
            </Link>
          </div>
        </div>
        <div className="notice" style={{ marginTop: 22 }}>
          <b>No live payment collection yet.</b> Registration and pricing details above are
          informational. This site does not process payments — to reserve a spot on the
          Liquidity Algo waitlist, use the Contact Us link and a member of TCT will guide you
          through the next step.
        </div>
      </section>

      {/* CUSTOM ALGO DEVELOPMENT */}
      <section className="container" id="custom">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">BUILT FOR YOU</div>
            <h2>Custom Algo Development</h2>
          </div>
          <p>
            Already trade a defined strategy? We turn your rules into a licensed MT5 EA — instead
            of adapting your trading to fit our algo.
          </p>
        </div>
        <div className="twocol">
          <div className="card">
            <h2>How it works</h2>
            <div className="list">
              <div className="row">
                <b>1 · You provide the inputs</b>
                <br />
                Your entry logic, filters, stop-loss and take-profit rules, position sizing and
                any risk limits you already trade by.
              </div>
              <div className="row">
                <b>2 · We build and test it</b>
                <br />
                Your rules are implemented as an MT5 EA and checked for correct, consistent
                execution of exactly what you specified.
              </div>
              <div className="row">
                <b>3 · Licensed delivery</b>
                <br />
                You receive the compiled EA (.ex5) under the same account verification and
                licensing model as TCT Algo. Source stays private.
              </div>
            </div>
            <div className="actions">
              <Link className="btn primary" href="/contact">
                Discuss a custom build
              </Link>
            </div>
          </div>
          <div className="card">
            <div className="eyebrow">IMPORTANT</div>
            <h2>We automate your rules — not an outcome.</h2>
            <p>
              A custom EA executes the strategy you give us with discipline and consistency. It
              does not add an edge that wasn&apos;t already in your rules, and TCT does not
              guarantee performance for custom or pre-built algos. Trading involves risk of loss.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
