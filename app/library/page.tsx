import { BookOpen } from '@/components/Site';
import { libraryCategories } from '@/lib/data';
import { TradingAcademy } from '@/components/Library/TradingAcademy';

export default function Page() {
  return (
    <main>
      <div className="pt-10">
        <TradingAcademy />
      </div>

      <section className="container">
        <div className="sectionhead">
          <div>
            <h2>Additional Free Resources</h2>
            <p>
              A curated library of legitimate, free-to-access external trading and market resources. TCT hosts
              files only when redistribution rights are confirmed; otherwise it links to the legitimate source.
            </p>
          </div>
        </div>
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
