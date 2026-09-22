import { PageHero } from '@/components/Site';
import { AccountForm } from '@/components/AccountForm';
export default function Page() {
  return <main><PageHero kicker="ACCOUNT" title="Create your TCT account">Verify your email to access TCT services. Your private Android trading journal remains on your device.</PageHero>
    <section className="container"><div className="twocol"><AccountForm register /><div className="card"><div className="eyebrow">TCT PRINCIPLE</div><h2>Process over promises.</h2><p>Creating an account does not activate a premium subscription. Algo access is verified separately by our team.</p></div></div></section></main>;
}

