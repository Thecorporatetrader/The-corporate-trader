import Link from 'next/link';
import type { Metadata } from 'next';
import { PageHero } from '@/components/Site';

export const metadata: Metadata = {
  title: 'Post — The Corporate Trader',
  description:
    'TCT posts: short market notes and product updates. The posting system is not connected yet.',
};

export default function Page() {
  return (
    <main>
      <PageHero kicker="POSTS" title="TCT Posts">
        Short-form market notes, product updates and desk commentary from The Corporate Trader.
      </PageHero>

      <section className="container">
        <div className="twocol">
          <div className="card">
            <h2>No posts published yet</h2>
            <p>
              This page is live, but the posting system has no content behind it. TCT has not
              published any posts so far, and nothing is shown here in placeholder form — when
              posts go live, they will appear in this feed with a date and author.
            </p>
            <p>
              In the meantime, our longer written material is on the Articles page and our
              curated reading lists are in the Library.
            </p>
            <div className="actions">
              <Link className="btn primary" href="/articles">
                Read articles
              </Link>
              <Link className="btn ghost" href="/library">
                Browse library
              </Link>
            </div>
          </div>
          <div className="card">
            <div className="eyebrow">STATUS</div>
            <h2>What is still missing</h2>
            <div className="list">
              <div className="row">
                <b>Publishing backend</b>
                <br />
                No CMS or database is connected, so posts cannot be created or stored yet.
              </div>
              <div className="row">
                <b>Author accounts</b>
                <br />
                Posting requires authenticated TCT accounts, which are not active on this build.
              </div>
              <div className="row">
                <b>Comments and reactions</b>
                <br />
                Not built. These need a backend and moderation before they can be offered.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
