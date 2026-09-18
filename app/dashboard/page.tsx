import { PageHero } from '@/components/Site';

export default function Page() {
  return (
    <main>
      <PageHero kicker="USER DASHBOARD" title="Your TCT Account">
        Manage MT5 verification, EA access and licenses. Trading Journal data is not stored in
        this dashboard.
      </PageHero>
      <section className="container">
        <div className="grid">
          <div className="card">
            <span className="pill">MT5 ACCOUNT</span>
            <h3>Account *******42</h3>
            <p>Broker server: Demo Server</p>
            <b className="warn">Verification pending</b>
          </div>
          <div className="card">
            <span className="pill">TCT ALGO</span>
            <h3>License</h3>
            <p>License becomes available after account approval.</p>
            <b>Not active</b>
          </div>
          <div className="card">
            <span className="pill">ANDROID JOURNAL</span>
            <h3>TCT Trading Journal</h3>
            <p>Your journal remains on your Android device.</p>
            <b className="good">Google Play · Coming Soon</b>
          </div>
        </div>
      </section>
    </main>
  );
}
