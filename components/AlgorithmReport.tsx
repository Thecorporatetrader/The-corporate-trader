import { Algorithm, money, testConditions } from '@/lib/algorithms';

export function AlgorithmReport({ algorithm, screenshot = false }: { algorithm: Algorithm; screenshot?: boolean }) {
  const r = algorithm.report;
  if (!r) return <div className="algo-report"><span className="algo-kicker">PERFORMANCE STATUS</span><h3>No published backtest</h3><p>TCT Algo depends on the entry levels selected by its user. Quant and Scalp results do not represent TCT Algo performance. Use the calculator with your own baseline for a hypothetical illustration.</p></div>;
  return <div className="algo-report"><span className="algo-kicker">HISTORICAL MT5 BACKTEST · NOT LIVE RETURNS</span><p>{testConditions}</p><dl className="report-metrics">
    <div><dt>Net profit</dt><dd>+{money(r.net)}</dd></div><div><dt>Total trades</dt><dd>{r.trades.toLocaleString('en-US')}</dd></div><div><dt>Winning trades</dt><dd>{r.wins}%</dd></div><div><dt>Profit factor</dt><dd>{r.pf.toFixed(2)}</dd></div><div><dt>Relative equity drawdown</dt><dd>{r.relativeDD}%</dd></div><div><dt>Max dollar equity drawdown</dt><dd>{money(r.dollarDD)}</dd></div>
  </dl><p className="algo-note">Summary values checked against the supplied MT5 HTML report. Both supplied tests use an M1 test period. Product naming follows TCT’s supplied report mapping. These are historical simulations, not independently audited live results.</p>
  {algorithm.slug === 'quant' && <p className="algo-note">Drawdown definitions matter: the largest relative equity drawdown was 4.72% ($24.59); the largest dollar equity drawdown was $27.62 (2.78%). These are separate peak-to-trough measurements.</p>}
  <div className="suite-actions"><a className="algo-button secondary" href={`/reports/tct-${algorithm.slug}-mt5.html`} target="_blank" rel="noopener noreferrer">Open MT5 HTML results</a><a className="algo-button secondary" href={`/reports/tct-${algorithm.slug}-mt5.html`} download>Download results summary</a></div>
  {screenshot && <figure className="report-screenshot"><a href={algorithm.image} target="_blank" rel="noopener noreferrer"><img src={algorithm.image} alt={`${algorithm.name}: user-supplied MT5 summary charts showing entries and profit/loss by hour, weekday and month`} width={algorithm.slug === 'quant' ? 1907 : 1861} height={algorithm.slug === 'quant' ? 641 : 498} /></a><figcaption>Original user-supplied summary screenshot. Select the image to inspect at full size.</figcaption></figure>}
  </div>;
}
