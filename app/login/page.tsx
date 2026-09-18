import Link from 'next/link';
import { PageHero } from '@/components/Site';
import { PhoneField } from '@/components/PhoneField';

export default function Page() {
  return (
    <main>
      <PageHero kicker="ACCOUNT" title="Welcome back">
        Sign in to manage your TCT algo access and MT5 verification.
      </PageHero>
      <section className="container">
        <div className="twocol">
          <div className="card">
            <h2>Sign in</h2>
            <label className="fieldlabel">Email</label>
            <input className="input" placeholder="Email" />
            <PhoneField label="Mobile number" />
            <label className="fieldlabel">Password</label>
            <input className="input" type="password" placeholder="Password" />
            <Link className="btn primary" href="/dashboard">
              Sign in
            </Link>
            <p>
              New to TCT?{' '}
              <Link className="good" href="/register">
                Create account
              </Link>
            </p>
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
