import type { Metadata } from 'next';
import OptionsMatrix from '@/components/OptionsMatrix';

export const metadata: Metadata = {
  title: 'Live Crypto Options Matrix & Analytics — The Corporate Trader',
  description:
    'Institutional-grade crypto options analytics, Open Interest distribution, Put-Call Ratio (PCR) sentiment, and volatility walls for BTC, ETH, SOL, and XAUT.',
};

export const dynamic = 'force-dynamic';

export default function OptionsPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#07090e] text-slate-100 flex flex-col">
      {/* 1. FIXED TOP HEADER: Pinned permanently at top */}
      <header className="border-b border-slate-800/80 bg-[#090d15]/95 backdrop-blur px-4 py-3 shrink-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/80" />
            <h1 className="text-sm md:text-base font-bold font-mono tracking-tight text-white">
              THE CORPORATE TRADER <span className="text-cyan-400">/ OPTIONS MATRIX</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="hidden sm:inline">TCT</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
              REAL-TIME
            </span>
          </div>
        </div>
      </header>

      {/* 2. DEDICATED SCROLLING CONTAINER: Only below content scrolls */}
      <div className="flex-1 w-full overflow-y-auto p-3 sm:p-5 lg:p-6 custom-scrollbar">
        <div className="max-w-7xl mx-auto pb-12">
          <OptionsMatrix initialAsset="BTC" className="w-full" />
        </div>
      </div>
    </main>
  );
}
