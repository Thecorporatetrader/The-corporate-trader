import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/Site';
import { StrategyExampleChart } from '@/components/StrategyExampleChart';
import { famousStrategies } from '@/lib/data';
import { famousStrategyDetails, getStrategyDetail, type StrategyExample } from '@/lib/famousStrategiesDetail';

type Params = { slug: string };

// Only slugs present in the detail data are built; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return Object.keys(famousStrategyDetails).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const strategy = famousStrategies.find((s) => s.slug === slug);
  if (!strategy || !getStrategyDetail(slug)) return { title: 'Strategy not found \u2014 The Corporate Trader' };
  return {
    title: `${strategy.name} \u2014 Famous Strategies \u2014 The Corporate Trader`,
    description: `${strategy.name} (${strategy.trader}): how it works, rules, risk management, illustrative examples, limitations and common mistakes. Educational reference only.`,
  };
}

function Rows({ items, check = false }: { items: string[]; check?: boolean }) {
  return (
    <div className="list">
      {items.map((item, i) => (
        <div className="row" key={i}>{check ? '\u2610 ' : ''}{item}</div>
      ))}
    </div>
  );
}

function ExampleCard({ kind, example }: { kind: 'success' | 'fail'; example: StrategyExample }) {
  const color = kind === 'success' ? '#00d084' : '#ff4d6d';
  return (
    <div className="card">
      <span className="pill" style={{ color, borderColor: color }}>{kind === 'success' ? 'SUCCESSFUL EXAMPLE' : 'FAILED EXAMPLE'}</span>
      <h3>{example.title}</h3>
      <div className="strategychart">
        <StrategyExampleChart
          variant={kind}
          title={example.title}
          entryLabel={example.chart.entryLabel}
          exitLabel={example.chart.exitLabel}
          stopLabel={example.chart.stopLabel}
          stopHonoured={example.chart.stopHonoured}
        />
      </div>
      <p>{example.scenario}</p>
      <div className="list">
        <div className="row"><b>Entry</b><br />{example.entryNote}</div>
        <div className="row"><b>Exit</b><br />{example.exitNote}</div>
        <div className="row"><b>Stop-loss</b><br />{example.stopNote}</div>
        <div className="row" style={{ borderColor: color }}><b style={{ color }}>Lesson</b><br />{example.lesson}</div>
      </div>
    </div>
  );
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const strategy = famousStrategies.find((s) => s.slug === slug);
  const detail = getStrategyDetail(slug);
  if (!strategy || !detail) notFound();

  const rulebook = detail.classification === 'rulebook';
  const term = rulebook ? 'rules' : 'guidelines';

  return (
    <main className="strategydetail">
      <PageHero kicker="FAMOUS STRATEGIES" title={strategy.name}>
        {strategy.trader} · {strategy.era}. {strategy.summary}
      </PageHero>

      <section className="container">
        <p><Link className="good" href="/#famous-strategies">← All famous strategies</Link></p>
        <div className="notice" role="note">
          <b>{rulebook ? 'Classification: published rulebook.' : 'Classification: philosophy and principles.'}</b> {detail.classificationNote}{' '}
          {rulebook
            ? 'The entry, exit and stop-loss sections below describe documented rules.'
            : 'The entry, exit and stop-loss sections below are interpretive guidelines drawn from the trader\u2019s public principles, not a rigid published rulebook.'}
        </div>
        <div className="twocol" style={{ marginTop: 22 }}>
          <div className="card">
            <div className="eyebrow">ORIGIN</div>
            <h2>Where it comes from</h2>
            <p>{detail.origin}</p>
            <h3>Core principles</h3>
            <Rows items={detail.corePrinciples} />
          </div>
          <div className="card">
            <div className="eyebrow">AT A GLANCE</div>
            <span className="pill">{rulebook ? 'RULEBOOK' : 'PHILOSOPHY'}</span>
            <h3>{strategy.trader}</h3>
            <div className="strategytrader">{strategy.era}</div>
            <p>{rulebook
              ? 'Well documented and publishable as a rule set. You can write it down, test it and follow it step by step.'
              : 'A set of broad principles rather than a single published system. Two people can apply it differently, so define your own written version before testing.'}</p>
            <div className="strategyprinciple">{strategy.principle}</div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">HOW IT WORKS</div>
            <h2>The method in plain terms.</h2>
          </div>
          <p>{rulebook ? 'A documented rule set, summarised for education.' : 'An interpretation of public principles, not an official rulebook.'}</p>
        </div>
        <div className="card">
          {detail.howItWorks.map((paragraph, i) => <p key={i} style={i === 0 ? { marginTop: 0 } : undefined}>{paragraph}</p>)}
        </div>
        <div className="grid" style={{ marginTop: 18 }}>
          <div className="card"><div className="eyebrow">ENTRY</div><h3>Entry {term}</h3><Rows items={detail.entryRules} /></div>
          <div className="card"><div className="eyebrow">EXIT</div><h3>Exit {term}</h3><Rows items={detail.exitRules} /></div>
          <div className="card"><div className="eyebrow">PROTECTION</div><h3>Stop-loss {term}</h3><Rows items={detail.stopLossRules} /></div>
        </div>
        <div className="card" style={{ marginTop: 18 }}>
          <div className="eyebrow">RISK</div>
          <h3>Risk management</h3>
          <Rows items={detail.riskManagement} />
        </div>
      </section>

      <section className="container">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">WORKED EXAMPLES</div>
            <h2>One that worked, one that failed.</h2>
          </div>
          <p>Both charts are schematic drawings of the idea. They are illustrative scenarios, not recorded trades or real market data.</p>
        </div>
        <div className="examplegrid">
          <ExampleCard kind="success" example={detail.successfulExample} />
          <ExampleCard kind="fail" example={detail.failedExample} />
        </div>
      </section>

      <section className="container">
        <div className="examplegrid">
          <div className="card"><div className="eyebrow">WHEN IT FITS</div><h3>Suitable market conditions</h3><Rows items={detail.suitableConditions} /></div>
          <div className="card"><div className="eyebrow">WHERE IT STRUGGLES</div><h3>Limitations</h3><Rows items={detail.limitations} /></div>
        </div>
        <div className="examplegrid" style={{ marginTop: 18 }}>
          <div className="card"><div className="eyebrow">AVOID</div><h3>Common mistakes</h3><Rows items={detail.commonMistakes} /></div>
          <div className="card"><div className="eyebrow">PRACTICE</div><h3>Practice checklist</h3><Rows items={detail.practiceChecklist} check /></div>
        </div>
      </section>

      <section className="container">
        <div className="twocol">
          <div className="card">
            <h2>Frequently asked questions</h2>
            <div className="list">
              {detail.faqs.map((faq, i) => (
                <div className="row" key={i}>
                  <b>{faq.question}</b>
                  <br />
                  {faq.answer}
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="eyebrow">SOURCES</div>
            <h2>Where to read more.</h2>
            <p>Plain-text references for further reading. Check specifics against the original material before relying on them.</p>
            <Rows items={detail.sources} />
          </div>
        </div>
        <div className="notice" style={{ marginTop: 22 }}>
          <b>Educational reference only.</b> TCT does not teach, sell or recommend this strategy. Descriptions are summaries of publicly
          known approaches, the examples are illustrative, and past performance of any trader or system does not indicate future results.
          Trading involves risk of loss.
        </div>
      </section>
    </main>
  );
}
