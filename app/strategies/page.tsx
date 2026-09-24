import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/Site';

export const metadata: Metadata = {
  title: 'TCT Strategies & Indicators — The Corporate Trader',
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <main>
      <PageHero kicker="THE CORPORATE TRADER" title="TCT Strategies & Indicators">
        We don’t currently offer standalone TCT strategies or indicators. Explore our existing tools or visit the library to learn more.
      </PageHero>
      <section className="container">
        <div className="actions">
          <Link className="btn primary" href="/library">Explore the Library</Link>
          <Link className="btn ghost" href="/">Back to Home</Link>
        </div>
      </section>
    </main>
  );
}
