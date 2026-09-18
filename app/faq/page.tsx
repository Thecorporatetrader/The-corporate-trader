import { PageHero } from '@/components/Site';

export default function Page() {
  return (
    <main>
      <PageHero kicker="SUPPORT" title="Frequently Asked Questions">
        Straight answers about TCT products, journal storage and algo access.
      </PageHero>
      <section className="container">
        <div className="twocol">
          <div className="card">
            <h2>Common questions</h2>
            <div className="list">
              <div className="row">
                <b>Is the Journal available on the website?</b>
                <br />
                No. The trading journal is an Android app. The website is its product and
                download page.
              </div>
              <div className="row">
                <b>Where is journal data stored?</b>
                <br />
                Locally on the Android device.
              </div>
              <div className="row">
                <b>Do I receive EA source code?</b>
                <br />
                No. Approved users receive the compiled EA.
              </div>
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
