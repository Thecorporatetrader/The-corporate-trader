import { PageHero } from '@/components/Site';

interface VerificationRow {
  user: string;
  mt5: string;
  status: 'Pending' | 'Verified';
}

const verificationQueue: VerificationRow[] = [
  { user: 'Demo User', mt5: '*******42', status: 'Pending' },
  { user: 'Sample Trader', mt5: '*******19', status: 'Verified' },
];

export default function Page() {
  return (
    <main>
      <PageHero kicker="ADMIN" title="TCT Control Center">
        Prototype admin interface for users, MT5 verification, licenses, products, content and
        audit activity.
      </PageHero>
      <section className="container">
        <div className="statbar">
          <div className="stat">
            <strong>128</strong>
            <span>Total users</span>
          </div>
          <div className="stat">
            <strong>34</strong>
            <span>Verified MT5</span>
          </div>
          <div className="stat">
            <strong>27</strong>
            <span>Active licenses</span>
          </div>
          <div className="stat">
            <strong>8</strong>
            <span>Pending reviews</span>
          </div>
        </div>
        <div className="card" style={{ marginTop: 24 }}>
          <h2>Verification queue</h2>
          <table className="table">
            <thead>
              <tr>
                <th>USER</th>
                <th>MT5</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {verificationQueue.map((row) => (
                <tr key={row.user}>
                  <td>{row.user}</td>
                  <td>{row.mt5}</td>
                  <td className={row.status === 'Pending' ? 'warn' : 'good'}>{row.status}</td>
                  <td>{row.status === 'Pending' ? 'Review' : 'Manage'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
