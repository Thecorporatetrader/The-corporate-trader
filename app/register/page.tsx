import Link from 'next/link';
import { PageHero } from '@/components/Site';
import { PhoneField } from '@/components/PhoneField';

export default function Page() {
  return (
    <main>
      <PageHero kicker="ACCOUNT" title="Create your TCT account">
        Your website account is for TCT services such as algo verification and licensing. Android
        journal trades are not stored here.
      </PageHero>
      <section className="container">
        <div className="twocol">
          <div className="card">
            <h2>Create account</h2>
            <label className="fieldlabel">Full name</label>
            <input className="input" placeholder="Full name" />
            <label className="fieldlabel">Email</label>
            <input className="input" placeholder="Email" />
            <PhoneField label="Mobile number" />
            <label className="fieldlabel">Password</label>
            <input className="input" type="password" placeholder="Password" />
            <Link className="btn primary" href="/dashboard">
              Create account
            </Link>
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
