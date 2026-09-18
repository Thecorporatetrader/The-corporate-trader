import { googlePlayUrl } from '@/lib/journal';

export default function Page() {
  return (
    <main>
      <header className="pagehero container">
        <div className="eyebrow">ANDROID APP</div>
        <div className="journal-title-row">
          <h1>TCT Trading Journal</h1>
          {googlePlayUrl ? (
            <a className="btn primary journal-play" href={googlePlayUrl} target="_blank" rel="noopener noreferrer">
              Get it on Google Play
            </a>
          ) : (
            <div className="journal-play-pending">
              <button className="btn primary journal-play" type="button" disabled aria-describedby="journal-play-status">
                Get it on Google Play
              </button>
              <span id="journal-play-status">Coming soon</span>
            </div>
          )}
        </div>
        <p>
          Most journals just store numbers. TCT lets AI do the reviewing—giving you a clear
          overview of all your trades, highlighting patterns, and helping you understand where
          to improve.
        </p>
      </header>

      {/* HOW IT WORKS */}
      <section className="container">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">HOW IT WORKS</div>
            <h2>Three steps, every trade.</h2>
          </div>
        </div>
        <div className="grid">
          <div className="card">
            <span className="pill">STEP 1</span>
            <h3>Log the plan</h3>
            <p>
              Asset, side, entry price, lot size, and your planned stop loss and TP1/TP2/TP3 —
              before the trade plays out.
            </p>
          </div>
          <div className="card">
            <span className="pill">STEP 2</span>
            <h3>Log the outcome</h3>
            <p>
              Actual stop loss and take-profit hit, exit price, and the resulting profit or loss
              — after the trade closes.
            </p>
          </div>
          <div className="card">
            <span className="pill">STEP 3</span>
            <h3>TCT rates it</h3>
            <p>
              The app compares what you planned against what actually happened and assigns a
              single overall rating — no manual scoring required.
            </p>
          </div>
        </div>
      </section>

      {/* WHY A RATING BEATS RAW NUMBERS */}
      <section className="container">
        <div className="sectionhead">
          <div>
            <div className="eyebrow">WHY THIS BEATS A NORMAL JOURNAL</div>
            <h2>At 20 trades, a spreadsheet works. At 1,000, it doesn&apos;t.</h2>
          </div>
          <p>
            A normal journal gives you rows of numbers. Reading back through 20 of them to find a
            pattern is manageable. Reading back through 1,000 to find where your discipline
            actually breaks down is not — so most traders never do it, and the same mistakes
            repeat unnoticed.
          </p>
        </div>
        <div className="twocol">
          <div className="card">
            <h2>One rating, any sample size</h2>
            <p>
              TCT turns every trade into a single comparable score instead of a row you have to
              re-read. Look at your average rating over any window — this week, this month, this
              year — and you know immediately whether your execution is holding up or slipping,
              without opening a single spreadsheet.
            </p>
          </div>
          <div className="card">
            <div className="eyebrow">THE KEY DIFFERENCE</div>
            <h2>Two &quot;losses&quot; are not the same trade.</h2>
            <p>
              A plain win/loss journal records both as the same red number. TCT&apos;s rating
              tells them apart — because the gap between them is exactly what improves your
              trading, not just your P&amp;L.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES + DATA */}
      <section className="container">
        <div className="twocol">
          <div className="card">
            <h2>Full trade breakdown</h2>
            <div className="list">
              <div className="row">
                <b>Trade Journal</b>
                <br />
                Entry, side, lot size, planned and actual SL/TP, strategy tags and notes.
              </div>
              <div className="row">
                <b>Performance &amp; Ratings</b>
                <br />
                Win rate, average profit/loss, biggest win/loss, risk/reward and overall rating
                trend.
              </div>
              <div className="row">
                <b>Data &amp; Backup</b>
                <br />
                Export your complete journal before uninstalling or changing phones. Import/restore
                is planned for the production app.
              </div>
            </div>
            <div className="actions">
              <span className="btn primary">Google Play · Coming Soon</span>
            </div>
          </div>
          <div className="card">
            <div className="eyebrow">TCT PRINCIPLE</div>
            <h2>Your journal. Your device.</h2>
            <p>
              All journal data is stored locally on your Android device — never on TCT servers.
              TCT does not require cloud storage for journal records, and does not present trading
              results as guaranteed outcomes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
