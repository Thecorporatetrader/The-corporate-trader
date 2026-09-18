'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const markets = [
  { symbol: 'OANDA:XAUUSD', name: 'Gold (XAUUSD)' },
  { symbol: 'OANDA:XAGUSD', name: 'Silver (XAGUSD)' },
  { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin (BTC/USDT)' },
  { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum (ETH/USDT)' },
  { symbol: 'OANDA:WTICOUSD', name: 'US Oil (WTI)' },
];

export default function MarketsPage() {
  const [symbol, setSymbol] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('tvwidgetsymbol');
    setSymbol(markets.find((market) => market.symbol === requested)?.symbol ?? markets[0].symbol);
  }, []);

  useEffect(() => {
    if (!symbol || !host.current) return;
    setFailed(false);
    const mount = document.createElement('div');
    mount.className = 'tradingview-widget-container';
    mount.style.height = '100%';
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    widget.style.height = '100%';
    mount.appendChild(widget);
    host.current.appendChild(mount);
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.textContent = JSON.stringify({
      autosize: true, symbol, interval: '60', timezone: 'Asia/Kolkata',
      theme: 'dark', style: '1', locale: 'en', allow_symbol_change: false,
      hide_side_toolbar: false, calendar: false, support_host: 'https://www.tradingview.com',
    });
    script.onerror = () => setFailed(true);
    mount.appendChild(script);
    return () => { script.onerror = null; mount.remove(); };
  }, [symbol]);

  const selected = markets.find((market) => market.symbol === symbol);
  return <main className="container markets-page">
    <Link className="good" href="/">← Back to homepage</Link>
    <h1>{selected?.name ?? 'Market chart'}</h1>
    <label htmlFor="market-select">Choose an instrument</label>
    <select id="market-select" className="input" value={symbol ?? markets[0].symbol}
      onChange={(event) => {
        const next = event.target.value;
        setSymbol(next);
        window.history.replaceState(null, '', `/markets?tvwidgetsymbol=${encodeURIComponent(next)}`);
      }}>
      {markets.map((market) => <option key={market.symbol} value={market.symbol}>{market.name}</option>)}
    </select>
    {failed && <p role="alert">The chart could not load. Please check your connection and reload this page.</p>}
    <div className="market-detail-chart" ref={host} aria-label={`${selected?.name ?? 'Market'} price chart`} />
    <p className="text-muted">Charts by <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">TradingView</a>. Quotes depend on the data provider and market hours.</p>
  </main>;
}
