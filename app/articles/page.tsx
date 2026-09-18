import { PageHero } from '@/components/Site';
import { articles, moreArticles } from '@/lib/data';

export default function Page() {
  const all = [...articles, ...moreArticles];

  return (
    <main>
      <PageHero kicker="TCT INSIGHTS" title="Articles">
        Original educational content from The Corporate Trader covering trading process,
        liquidity, risk and automation.
      </PageHero>
      <section className="container">
        <div className="grid">
          {all.map((a) => (
            <article className="card" key={a.title}>
              <span className="pill">{a.category}</span>
              <h3>{a.title}</h3>
              <p>{a.description}</p>
              <span className="good">Read article →</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
