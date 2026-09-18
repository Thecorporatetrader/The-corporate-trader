'use client';

import { useEffect, useRef } from 'react';

const symbols = [
  { title: 'Gold (XAUUSD)', proName: 'OANDA:XAUUSD' },
  { title: 'Silver (XAGUSD)', proName: 'OANDA:XAGUSD' },
  { title: 'Bitcoin', proName: 'BINANCE:BTCUSDT' },
  { title: 'Ethereum', proName: 'BINANCE:ETHUSDT' },
  { title: 'US Oil (WTI)', proName: 'OANDA:WTICOUSD' },
];

function TickerTape({ items }: { items: typeof symbols }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    const mount = document.createElement('div');
    mount.className = 'tradingview-widget-container';
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    mount.appendChild(widget);
    host.appendChild(mount);
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.textContent = JSON.stringify({ symbols: items, showSymbolLogo: false, isTransparent: true, displayMode: 'regular', colorTheme: 'dark', locale: 'en', largeChartUrl: `${window.location.origin}/markets` });
    mount.appendChild(script);
    return () => mount.remove();
  }, [items]);

  return <div className="market-watch-widget" ref={container} />;
}

export default function MarketTicker() {
  return <section className="market-watch market-watch-single" aria-label="Market quotes from TradingView">
    <div className="market-watch-label"><span className="live-dot" />MARKET WATCH</div>
    <TickerTape items={symbols} />
  </section>;
}
