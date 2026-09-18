import { PageHero } from '@/components/Site';

export default function Page() {
  return (
    <main>
      <PageHero kicker="EDUCATION" title="Liquidity Strategy">
        Learn the concepts behind liquidity-focused market analysis in a structured, practical
        format.
      </PageHero>
      <section className="container">
        <div className="twocol">
          <div className="card">
            <h2>Core curriculum</h2>
            <div className="list">
              <div className="row">Buy-side &amp; sell-side liquidity</div>
              <div className="row">Liquidity pools &amp; sweeps</div>
              <div className="row">BOS &amp; CHOCH</div>
              <div className="row">Displacement &amp; entry confirmation</div>
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
