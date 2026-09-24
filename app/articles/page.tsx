import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/Site';

export const metadata: Metadata = {
  title: 'Articles — The Corporate Trader',
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <main>
      <PageHero kicker="THE CORPORATE TRADER" title="Articles">
        We haven’t published any articles yet. You can explore the learning resources in our library.
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
