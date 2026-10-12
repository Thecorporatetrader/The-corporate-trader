import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { algorithms } from '@/lib/algorithms';
import { AlgorithmReport } from '@/components/AlgorithmReport';
import { GrowthCalculator, ShareResults } from '@/components/AlgorithmTools';
import '../../suite.css';

export function generateStaticParams() { return algorithms.map(a => ({ slug: a.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = algorithms.find(a => a.slug === slug);
  return { title: `${a?.name ?? 'Algorithm'} Results | The Corporate Trader`, description: 'Public performance summary, historical test conditions and theoretical lot-size risk illustration.', alternates: { canonical: `https://www.thecorporatetrader.com/algo/results/${slug}` } };
}
export default async function ResultsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = algorithms.find(a => a.slug === slug);
  if (!a) notFound();
  return <main className="algo-suite"><div className="suite-wrap result-page"><Link className="result-back" href={`/algo#${a.slug}-details`}>← Our algorithms</Link><span className="algo-kicker">PUBLIC PERFORMANCE SUMMARY</span><h1>{a.name} results</h1><p className="section-intro">{a.description}</p><AlgorithmReport algorithm={a} screenshot />{a.report && <section aria-label="MT5 HTML results"><h2>MT5 report</h2><p>Results from the uploaded HTML report, with trade records and private settings removed.</p><iframe className="html-report-frame" title={`${a.name} MT5 report summary`} src={`/reports/tct-${a.slug}-mt5.html`} sandbox="" loading="lazy" /></section>}<div className="suite-actions"><ShareResults slug={a.slug} name={a.name} /><Link className="algo-button secondary" href="/get-access">Ask about access</Link></div><GrowthCalculator algorithm={a} /><aside className="risk-disclosure"><h3>Historical evidence. No promised outcome.</h3><p>Backtests are simulations, not live trading records or guarantees. Trading can result in loss of capital. Changes in market conditions, leverage, margin, costs and execution may materially change results. The calculator does not establish whether an account can sustain a selected lot size.</p></aside></div></main>;
}
