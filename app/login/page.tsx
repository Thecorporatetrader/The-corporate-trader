import { PageHero } from '@/components/Site';
import { AccountForm } from '@/components/AccountForm';
export default async function Page({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const params = await searchParams;
  const initialNotice = params.registered === '1'
    ? 'Please verify your email using the link in your inbox, then log in.'
    : '';
  return <main><PageHero kicker="ACCOUNT" title="Welcome back">Sign in with your verified email or full mobile number.</PageHero>
    <section className="container"><div className="twocol"><AccountForm initialNotice={initialNotice} /><div className="card"><div className="eyebrow">TCT PRINCIPLE</div><h2>Process over promises.</h2><p>Clear tools, transparent access rules and risk-aware education.</p></div></div></section></main>;
}
