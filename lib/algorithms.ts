export const testConditions = '1 Jan–11 Oct 2026 · $500 initial balance · fixed 0.01 lot · USD';
export const algorithms = [
  { slug: 'quant', name: 'TCT FUSION', tag: 'CONTINUOUS MT5 AUTOMATION', mode: 'Automated strategy', description: 'Let TCT FUSION monitor the market and manage trades automatically. Keep your MT5 setup running 24/7, with trading during available market sessions. Explore its promising historical backtest results below; future returns are not guaranteed.', features: ['Continuous monitoring while MT5 is connected', 'Automated entries and position management', 'Historical MT5 results available to review'], report: { net: 961.61, trades: 546, wins: 71.79, pf: 2.42, relativeDD: 4.72, dollarDD: 27.62 }, image: '/images/results/quant.png' },
  { slug: 'scalp', name: 'TCT Scalp', tag: 'M1 / M5 AUTOMATION', mode: 'Automated strategy', description: 'Short-timeframe automation for M1 and M5 workflows, with rule-based entries and automated position management.', features: ['M1 / M5 trading workflow', 'Automated entries and management', 'Execution-sensitive, frequent trading'], report: { net: 1883.35, trades: 10350, wins: 62.22, pf: 1.16, relativeDD: 18.99, dollarDD: 104.56 }, image: '/images/results/scalp.png' },
  { slug: 'algo', name: 'TCT Algo', tag: 'YOUR ENTRY. AUTOMATED MANAGEMENT.', mode: 'Trader-directed strategy', description: 'You analyse the market and select the Buy or Sell entry level. TCT Algo handles configured execution and position management.', features: ['User-selected Buy / Sell level', 'Stop loss & multiple take profits', 'Order count & lot / risk settings', 'Breakeven & trailing stops'], report: null, image: null },
] as const;
export type Algorithm = typeof algorithms[number];
export function money(value: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value); }
export function scaleIllustration(net: number, drawdown: number, lot: number, balance: number) {
  if (![net, drawdown, lot, balance].every(Number.isFinite) || lot < 0.01 || lot > 1 || balance <= 0 || balance > 100000000 || drawdown < 0) return null;
  const multiplier = lot / 0.01;
  return { multiplier, net: net * multiplier, drawdown: drawdown * multiplier, endBalance: balance + net * multiplier };
}
