import { PageHero, BookOpen } from '@/components/Site';
import { libraryCategories } from '@/lib/data';

export default function Page() {
  return (
    <main>
      <PageHero kicker="FREE LEARNING" title="Trading Library">
        A curated library of legitimate free-to-access trading and market resources. TCT should
        host files only when redistribution rights are confirmed; otherwise it links to the
        legitimate source.
      </PageHero>
      <section className="container">
        <div className="grid">
          {libraryCategories.map((b) => (
            <div className="card" key={b.title}>
              <BookOpen className="icon" />
              <h3>{b.title}</h3>
              <p>{b.description}</p>
              <span className="good">Browse resources →</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
