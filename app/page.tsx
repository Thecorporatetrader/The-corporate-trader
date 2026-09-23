import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen } from '@/components/Site';
import CommunitySection from '@/components/CommunitySection';
import MarketTicker from '@/components/MarketTicker';
import { products, articles, famousStrategies } from '@/lib/data';

export default function Home() {
  return (
    <main>
      <MarketTicker />
      <header className="hero container">
        <div className="hero-orb hero-orb-one" aria-hidden="true" />
        <div className="hero-orb hero-orb-two" aria-hidden="true" />
        <div className="hero-content">
        <div className="eyebrow reveal-up">THE CORPORATE TRADER · TCT</div>
        <h1 className="hero-title reveal-up reveal-delay-1">
          We help traders
          <br />
          become <span className="text-cyan">disciplined professionals.</span>
        </h1>
        <p className="reveal-up reveal-delay-2">
          Build a more disciplined trading routine with a private trading journal,
          MT5 automation, custom algorithms, and practical market education.
        </p>
        <div className="actions reveal-up reveal-delay-3">
          <Link className="btn primary" href="/journal">
            Explore TCT Journal <ArrowRight size={17} />
          </Link>
          <Link className="btn ghost" href="/algo">
            Explore TCT Algo
          </Link>
        </div></div>
        <div className="hero-comparison-image">
          <Image src="/images/disciplined-vs-reactive.png" width={1037} height={565}
            alt="Disciplined System: Rules, Risk, Review. Reactive Trading: Chase, Doubt, Reset."
            priority unoptimized sizes="(max-width: 850px) 92vw, 56vw" />
        </div>
      </header>

      {/* WHO WE ARE */}
      <section className="container">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">WHO WE ARE</div>
            <h2>Built by traders, for disciplined traders.</h2>
          </div>
          <p>
            The Corporate Trader (TCT) brings together trading tools and practical education
            to help you plan, manage risk, and learn from every trade. We don&apos;t sell signals
            or promise guaranteed profits. Our focus is a consistent, informed process.
          </p>
        </div>
        <div className="card">
          <p style={{ margin: 0 }}>
            Set your rules, track your decisions, and review your progress. Our MT5 tools,
            trading journal, and learning resources support each step, with one guiding
            principle: <b>process over promises</b>.
          </p>
        </div>
      </section>

      <CommunitySection />

      {/* WHAT WE PROVIDE */}
      <section className="container">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">WHAT WE PROVIDE</div>
            <h2>Four ways we help you trade better.</h2>
          </div>
          <p>
            Explore MT5 tools, turn your own rules into an algorithm, review your trades,
            or build your knowledge with free learning resources.
          </p>
        </div>
        <div className="grid-4">
          {products.map(({ icon: Icon, title, text, href, tag }) => (
            <Link className="card product-card" href={href} key={title}>
              <Icon className="icon" />
              <div className="pill" style={{ display: 'inline-block', marginTop: 16 }}>
                {tag}
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className="good">Explore →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* FAMOUS STRATEGIES — linked from the main navigation */}
      <section className="container" id="famous-strategies">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">FAMOUS STRATEGIES</div>
            <h2>Strategies that made traders famous.</h2>
          </div>
          <p>
            Publicly documented approaches used by well-known traders. We include them as
            historical context for how a repeatable process is built — not as systems TCT sells,
            teaches or recommends.
          </p>
        </div>
        <div className="grid">
          {famousStrategies.map((s) => (
            <Link className="card strategycard" href={`/famous-strategies/${s.slug}`} key={s.slug}>
              <span className="pill">{s.era}</span>
              <h3>{s.name}</h3>
              <div className="strategytrader">{s.trader}</div>
              <p>{s.summary}</p>
              <div className="strategyprinciple">{s.principle}</div>
              <span className="good strategycta">Read the full guide →</span>
            </Link>
          ))}
        </div>
        <div className="notice" style={{ marginTop: 22 }}>
          <b>Educational reference only.</b> These summaries describe publicly known trading
          approaches. Past performance of any strategy or trader does not indicate future
          results.
        </div>
      </section>

      <section className="container">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">LATEST FROM TCT</div>
            <h2>Articles &amp; insights.</h2>
          </div>
          <Link href="/articles">View all →</Link>
        </div>
        <div className="grid">
          {articles.map((a) => (
            <div className="card" key={a.title}>
              <BookOpen className="icon" />
              <span className="pill">{a.category}</span>
              <h3>{a.title}</h3>
              <p>{a.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="card upcoming-algo">
          <div>
            <div className="eyebrow">COMING NEXT</div>
            <h2>Fully Automated TCT Algo</h2>
            <p>
              An upgraded version of our current algo strategy, designed to automate entries,
              exits, take profit, stop loss, and trailing stops according to predefined rules.
              Join the waitlist for launch updates.
            </p>
            <Link className="btn primary" href="/liquidity-algo">
              Join Waitlist
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
