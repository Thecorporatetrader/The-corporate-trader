'use client';
import { useState } from 'react';
import { Algorithm, money, scaleIllustration } from '@/lib/algorithms';

export function ShareResults({ slug, name }: { slug: string; name: string }) {
  const [message, setMessage] = useState('');
  const [fallback, setFallback] = useState('');
  async function share() {
    const url = new URL(`/algo/results/${slug}`, window.location.origin).href;
    try {
      if (navigator.share) { await navigator.share({ title: `${name} — MT5 summary`, url }); setMessage('Share dialog opened.'); return; }
    } catch (error) { if (error instanceof Error && error.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(url); setMessage('Results link copied.'); }
    catch { setFallback(url); setMessage('Copy the results link below.'); }
  }
  return <div className="share-results"><button type="button" className="algo-button secondary" onClick={share}>Share Results ↗</button><span role="status">{message}</span>{fallback && <input aria-label="Results link to copy" readOnly value={fallback} onFocus={e => e.target.select()} />}</div>;
}

export function GrowthCalculator({ algorithm }: { algorithm: Algorithm }) {
  const [lot, setLot] = useState('0.01');
  const [balance, setBalance] = useState('500');
  const [customNet, setCustomNet] = useState('');
  const [customDD, setCustomDD] = useState('');
  const report = algorithm.report;
  const result = (report || (customNet.trim() && customDD.trim())) && lot.trim() && balance.trim()
    ? scaleIllustration(report?.net ?? Number(customNet), report?.dollarDD ?? Number(customDD), Number(lot), Number(balance)) : null;
  return <section className="algo-calculator" aria-labelledby={`calculator-${algorithm.slug}`}>
    <div><span className="algo-kicker">EXPLORE THE ARITHMETIC</span><h3 id={`calculator-${algorithm.slug}`}>{algorithm.name} lot-size illustration</h3><p>Change the lot size to see how profit <em>and</em> dollar drawdown scale in a simple linear model.</p></div>
    {!report && <p className="algo-note">No published TCT Algo backtest is available. Enter your own 0.01-lot baseline to explore a hypothetical scenario; these inputs are not verified TCT results.</p>}
    <div className="calculator-inputs">
      <label htmlFor={`lot-${algorithm.slug}`}>Illustrative lot size<input id={`lot-${algorithm.slug}`} type="number" min="0.01" max="1" step="0.01" value={lot} onChange={e => setLot(e.target.value)} /></label>
      <label htmlFor={`balance-${algorithm.slug}`}>Scenario balance (USD)<input id={`balance-${algorithm.slug}`} type="number" min="1" max="100000000" step="any" value={balance} onChange={e => setBalance(e.target.value)} /></label>
      {!report && <><label htmlFor="custom-net">Your baseline net profit / loss (USD)<input id="custom-net" type="number" step="any" value={customNet} onChange={e => setCustomNet(e.target.value)} placeholder="Enter your baseline" /></label><label htmlFor="custom-dd">Your baseline max dollar equity drawdown<input id="custom-dd" type="number" min="0" step="any" value={customDD} onChange={e => setCustomDD(e.target.value)} placeholder="Enter your baseline" /></label></>}
    </div>
    <div aria-live="polite" aria-atomic="true">{result ? <dl className="calculator-output"><div><dt>Lot multiplier</dt><dd>{result.multiplier.toFixed(2)}×</dd></div><div><dt>Theoretical net profit / loss</dt><dd>{money(result.net)}</dd></div><div><dt>Theoretical ending balance</dt><dd>{money(result.endBalance)}</dd></div><div><dt>Scaled dollar equity drawdown</dt><dd>{money(result.drawdown)}</dd></div></dl> : <p className="algo-note">Enter valid values: lots from 0.01 to 1.00, a positive balance up to $100 million, and a non-negative baseline drawdown.</p>}</div>
    <p className="algo-note"><strong>Theoretical arithmetic only — not a backtest, forecast or guaranteed return.</strong> Multiplier = selected lot ÷ 0.01; net profit/loss and maximum dollar equity drawdown are multiplied by that factor. Ending balance = scenario balance + scaled net profit/loss. No compounding or new trades are simulated. Relative equity drawdown is not scaled.</p>
    <p className="algo-note">This does not prove that a $500 account can sustain higher lots. Margin, leverage, spread, commissions, slippage, liquidity, stop-outs and the sequence of gains and losses can change or prevent these outcomes. Historical drawdown is not a future loss limit. The lot range is an input limit, not a recommendation.</p>
  </section>;
}
