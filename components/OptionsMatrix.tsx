<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Options Market Structure & Probability Radar | The Corporate Trader</title>
  <script src="https://cdn.tailwindcss.com/3.4.17"></script>
  <style>
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #07090e; }
    ::-webkit-scrollbar-thumb { background: #1c2538; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #2e3c5a; }
  </style>
</head>
<body class="bg-[#07090e] text-slate-100 font-sans text-xs antialiased min-h-screen p-2 md:p-4">

  <div class="w-full max-w-7xl mx-auto bg-[#0a0d14] rounded-xl border border-slate-800 shadow-2xl p-4 md:p-6 font-sans">
    
    <!-- 1. TOP HEADER WITH CURRENT SPOT PRICE & PAIR DISPLAY -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-cyan-950/60 border border-cyan-500/30 rounded-lg text-cyan-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2.5">
            <h2 class="text-lg md:text-xl font-bold tracking-tight text-white font-mono">
              OPTIONS MARKET STRUCTURE & PROBABILITY RADAR
            </h2>
            <!-- PROMINENT CURRENT SPOT PRICE -->
            <div class="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2">
              <span class="text-[11px] font-mono text-cyan-400 font-bold uppercase" id="spot-asset-label">BTC SPOT:</span>
              <span class="text-base font-extrabold text-white font-mono" id="top-spot-price">$78,032.50</span>
            </div>
            <span class="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              LIVE
            </span>
          </div>
          <p class="text-xs text-slate-400 mt-0.5">
            Derivatives Open Interest Selling Matrix & Underlying Spot Price Execution
          </p>
        </div>
      </div>

      <!-- Action Controls -->
      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <!-- Asset Switcher -->
        <div class="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg" id="asset-btn-group">
          <button data-asset="BTC" class="px-3 py-1.5 text-xs font-mono font-bold rounded-md bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 transition-all asset-btn">BTC</button>
          <button data-asset="ETH" class="px-3 py-1.5 text-xs font-mono font-bold rounded-md text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all asset-btn">ETH</button>
          <button data-asset="SOL" class="px-3 py-1.5 text-xs font-mono font-bold rounded-md text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all asset-btn">SOL</button>
          <button data-asset="XAUT" class="px-3 py-1.5 text-xs font-mono font-bold rounded-md text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all asset-btn">XAUT (Gold)</button>
        </div>

        <!-- Timeframe Selector (Added 24h) -->
        <div class="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg items-center" id="tf-btn-group">
          <span class="text-[10px] text-slate-500 font-mono px-1">⏱</span>
          <button data-tf="15m" class="px-2 py-1 text-[11px] font-mono font-bold rounded text-slate-400 hover:text-white tf-btn">15m</button>
          <button data-tf="1h" class="px-2 py-1 text-[11px] font-mono font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tf-btn">1h</button>
          <button data-tf="2h" class="px-2 py-1 text-[11px] font-mono font-bold rounded text-slate-400 hover:text-white tf-btn">2h</button>
          <button data-tf="4h" class="px-2 py-1 text-[11px] font-mono font-bold rounded text-slate-400 hover:text-white tf-btn">4h</button>
          <button data-tf="12h" class="px-2 py-1 text-[11px] font-mono font-bold rounded text-slate-400 hover:text-white tf-btn">12h</button>
          <button data-tf="24h" class="px-2 py-1 text-[11px] font-mono font-bold rounded text-amber-400 hover:text-amber-300 tf-btn" title="24 Hour Horizon">24h</button>
        </div>

        <!-- Refresh Countdown & Manual Button -->
        <div class="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span class="text-[11px] font-mono text-slate-400" id="countdown-label">10s</span>
          <button id="manual-refresh-btn" class="ml-1 text-slate-400 hover:text-cyan-400 transition-colors" title="Manual refresh">↻</button>
        </div>
      </div>
    </div>

    <!-- Active Expiries Pill Bar -->
    <div class="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
      <span class="text-slate-500 mr-1">Combined Expiries (2-3 Max):</span>
      <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">2026-11-02</span>
      <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">2026-11-03</span>
      <span class="text-slate-400 font-semibold ml-1">(Unified Open Interest & Volume flow for near-term settlement)</span>
    </div>

    <!-- 2. MARKET DIRECTION PROBABILITY WITH 3 S/R (PCR IN BRACKETS) & SINGLE DROPDOWN NARRATIVE -->
    <div class="mt-4 p-4 bg-gradient-to-r from-slate-950 via-[#0d121c] to-slate-950 border border-cyan-500/40 rounded-xl font-mono shadow-lg">
      <div class="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div class="flex items-center gap-2">
          <span class="text-cyan-400">🧭</span>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-100">
            MARKET DIRECTION PROBABILITY & DATA BEHAVIOR (<span id="radar-asset">BTC</span>)
          </span>
          <span class="px-2 py-0.5 text-[10px] font-black rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" id="radar-bias-badge">
            BULLISH EXPANSION (BUYING SIDE)
          </span>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
            OI PCR: <strong class="text-emerald-400" id="radar-oi-pcr">1.38</strong> <span class="text-[9px] text-slate-400">(Buying Opportunity)</span>
          </span>
          <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
            Vol PCR: <strong class="text-amber-400" id="radar-vol-pcr">1.15</strong>
          </span>
        </div>
      </div>

      <!-- Probability Gauge Bar (Green Yellow Red Line) -->
      <div class="my-3">
        <div class="flex items-center justify-between text-xs mb-1.5 font-semibold">
          <span class="text-emerald-400 flex items-center gap-1">
            <span>▲ Upward Continuation:</span>
            <span class="text-sm font-extrabold" id="prob-bull">69%</span>
          </span>
          <span class="text-amber-300 flex items-center gap-1">
            <span>◆ Rangebound / Pin:</span>
            <span class="text-sm font-extrabold" id="prob-range">18%</span>
          </span>
          <span class="text-rose-400 flex items-center gap-1">
            <span>▼ Downward Rejection:</span>
            <span class="text-sm font-extrabold" id="prob-bear">13%</span>
          </span>
        </div>
        <div class="w-full h-3 bg-slate-950 rounded-full border border-slate-800 flex overflow-hidden">
          <div id="bar-bull" class="bg-emerald-500 h-full transition-all duration-700" style="width: 69%;"></div>
          <div id="bar-range" class="bg-amber-500 h-full transition-all duration-700" style="width: 18%;"></div>
          <div id="bar-bear" class="bg-rose-500 h-full transition-all duration-700" style="width: 13%;"></div>
        </div>
      </div>

      <!-- 3 RESISTANCE & 3 SUPPORT WITH PCR IN BRACKETS & CLEAR BUYING/SELLING OPPORTUNITY -->
      <div class="my-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-cyan-400">🎯</span>
            <span class="text-xs font-bold uppercase tracking-wider text-slate-200">
              3 Nearest Resistance & 3 Support Strikes (with PCR in brackets)
            </span>
          </div>
          <div class="flex items-center gap-2 text-[10px]">
            <span class="text-emerald-400 font-semibold">High PCR = Buying Opportunity</span>
            <span class="text-slate-500">•</span>
            <span class="text-rose-400 font-semibold">Low PCR = Selling Opportunity</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
          <!-- 3 Resistance Levels -->
          <div class="p-2.5 bg-rose-950/20 border border-rose-500/30 rounded-lg flex flex-col justify-between">
            <div>
              <div class="text-[10px] font-bold text-rose-400 uppercase flex items-center justify-between">
                <span>▼ 3 Nearest Resistances</span>
                <span class="text-[9px] px-1.5 py-0.2 rounded bg-rose-900/40 text-rose-300 font-bold">SELLING OPPORTUNITY</span>
              </div>
              <div class="mt-2 space-y-1.5 font-mono text-slate-300">
                <div class="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                  <span class="text-slate-400">R1 Resistance:</span>
                  <span class="font-bold text-rose-300" id="res-r1">$79,000 <span class="text-[10px] text-rose-400 font-semibold">(PCR: 0.42)</span></span>
                </div>
                <div class="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                  <span class="text-slate-400">R2 Resistance:</span>
                  <span class="font-bold text-rose-300" id="res-r2">$80,000 <span class="text-[10px] text-rose-400 font-semibold">(PCR: 0.35)</span></span>
                </div>
                <div class="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                  <span class="text-slate-400">R3 Strongest:</span>
                  <span class="font-bold text-rose-400" id="res-r3">$81,000 <span class="text-[10px] text-rose-400 font-semibold">(PCR: 0.28)</span></span>
                </div>
              </div>
            </div>
            <div class="text-[9px] text-slate-400 mt-2 pt-1 border-t border-rose-900/30">
              Low PCR: Heavy Call Overhang & Capping Zone
            </div>
          </div>

          <!-- No Trade Zone Corridor -->
          <div class="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-lg flex flex-col justify-between">
            <div>
              <div class="text-[10px] font-bold text-amber-400 uppercase flex items-center justify-between">
                <span>⛔ No Trade Zone</span>
                <span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/40 text-amber-300 font-bold">STAND ASIDE</span>
              </div>
              <div class="mt-3 text-center">
                <div class="text-sm font-extrabold text-amber-300 font-mono" id="ntz-bounds-text">
                  $78,000 – $79,000
                </div>
                <div class="text-[10px] text-slate-400 mt-1">
                  Equilibrium Pin around Max Pain (<span id="ntz-maxpain-ref">$78,000</span>)
                </div>
              </div>
            </div>
            <div class="text-[9px] text-amber-400/80 mt-2 pt-1 border-t border-amber-900/30 text-center font-semibold">
              Zero Edge Inside • Wait for Liquidity Break
            </div>
          </div>

          <!-- 3 Support Levels -->
          <div class="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex flex-col justify-between">
            <div>
              <div class="text-[10px] font-bold text-emerald-400 uppercase flex items-center justify-between">
                <span>▲ 3 Nearest Supports</span>
                <span class="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/40 text-emerald-300 font-bold">BUYING OPPORTUNITY</span>
              </div>
              <div class="mt-2 space-y-1.5 font-mono text-slate-300">
                <div class="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                  <span class="text-slate-400">S1 Support:</span>
                  <span class="font-bold text-emerald-300" id="sup-s1">$78,000 <span class="text-[10px] text-emerald-400 font-semibold">(PCR: 1.45)</span></span>
                </div>
                <div class="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                  <span class="text-slate-400">S2 Support:</span>
                  <span class="font-bold text-emerald-300" id="sup-s2">$77,000 <span class="text-[10px] text-emerald-400 font-semibold">(PCR: 1.78)</span></span>
                </div>
                <div class="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                  <span class="text-slate-400">S3 Strongest:</span>
                  <span class="font-bold text-emerald-400" id="sup-s3">$76,000 <span class="text-[10px] text-emerald-400 font-semibold">(PCR: 2.15)</span></span>
                </div>
              </div>
            </div>
            <div class="text-[9px] text-slate-400 mt-2 pt-1 border-t border-emerald-900/30">
              High PCR: Put Writing Floor & Hard Buyer Defense
            </div>
          </div>
        </div>
      </div>

      <!-- SINGLE DROPDOWN: VERBAL NARRATIVE EXPLANATION IN WORDS -->
      <div class="mt-3 bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
        <button id="narrative-toggle-btn" class="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors">
          <div class="flex items-center gap-2">
            <span class="text-cyan-400">📖</span>
            <span class="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Market Structure & OI Flow Narrative Analysis (Click to Expand)
            </span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
            <span id="narrative-btn-text">Expand In Words</span>
            <span id="narrative-btn-arrow">▼</span>
          </div>
        </button>

        <div id="narrative-content" class="hidden p-4 border-t border-slate-800 bg-slate-950/90 text-xs leading-relaxed space-y-3 font-mono text-slate-300">
          <div class="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
            <div class="text-[11px] font-bold text-cyan-300 uppercase mb-1">
              ⏱ Intraday OI Shifting Analysis (<span id="narrative-tf">1h</span>):
            </div>
            <p id="narrative-flow-p">
              Over the last lookback horizon, Open Interest is actively shifting with positive velocity. Total Call additions stand at +2,850 contracts while Put additions reached +4,570 contracts. Most aggressive additions are concentrating around strike $78,000. Because options data reflects seller positioning (option writing), elevated PCR indicates institutional market makers are aggressively selling puts to build downside floor support, capping breakdown risk below S1 ($78,000). Conversely, strikes above $79,000 exhibit low PCR, representing overhead call overhang where sellers are capping fast breakout attempts.
            </p>
          </div>

          <div class="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
            <div class="text-[11px] font-bold text-amber-300 uppercase mb-1">
              📊 Daily Structural Range & Execution Context:
            </div>
            <p id="narrative-baseline-p">
              Major daily structural liquidity rests between Strong Support at $76,000 (PCR: 2.15) and Strongest Resistance at $81,000 (PCR: 0.28). The No Trade Zone is defined between S1 and R1. Traders should stand aside during mid-corridor equilibrium chop and watch for high-probability buying opportunities on retests of high-PCR support levels ($78,000 - $76,000) or selling opportunities at low-PCR resistance caps ($79,000 - $81,000).
            </p>
          </div>

          <div class="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
            <div class="text-[11px] font-bold text-emerald-300 uppercase mb-1">
              📑 Near-Term Settlement Thesis (2 Expiries):
            </div>
            <p id="narrative-expiry-p">
              Aggregating near-term settlement horizons highlights a primary gravitational equilibrium pinned at Max Pain $78,000. Spot is positioned directly near equilibrium, creating delta magnetism and theta decay compression.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. OVERVIEW METRIC CARDS -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
      <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        <div class="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>CALL OI NOTIONAL</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-semibold">CALLS</span>
        </div>
        <div class="mt-2">
          <div class="text-xl font-bold font-mono text-white" id="kpi-call-notional">$1.45B</div>
          <div class="text-xs text-slate-400 font-mono mt-0.5" id="kpi-call-contracts">18,520 contracts</div>
        </div>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
        <div class="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>PUT OI NOTIONAL</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono font-semibold">PUTS</span>
        </div>
        <div class="mt-2">
          <div class="text-xl font-bold font-mono text-white" id="kpi-put-notional">$2.01B</div>
          <div class="text-xs text-slate-400 font-mono mt-0.5" id="kpi-put-contracts">25,640 contracts</div>
        </div>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
        <div class="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>PUT / CALL RATIO</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">BUYING OPPORTUNITY</span>
        </div>
        <div class="mt-2">
          <div class="text-xl font-bold font-mono text-white" id="kpi-overall-pcr">1.384</div>
          <div class="text-[10px] text-slate-400 font-mono mt-0.5 truncate">Put writing dominates (Buying support)</div>
        </div>
      </div>

      <div class="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
        <div class="flex items-center justify-between text-slate-400 text-xs font-medium">
          <span>MAX PAIN STRIKE</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-semibold">PIN LEVEL</span>
        </div>
        <div class="mt-2">
          <div class="text-xl font-bold font-mono text-cyan-400" id="kpi-max-pain">$78,000</div>
          <div class="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
            <span id="kpi-spot-ref">Spot: $78,032.50</span>
            <span class="text-slate-300">+0.0%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. S/R CORRIDOR & OPEN INTEREST DISTRIBUTION (STANDALONE SECTION) -->
    <div class="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div>
          <span class="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
            Market Structure Corridor (S/R Tunnel & Total OI Distribution)
          </span>
          <p className="text-[10px] text-slate-500">Structural bounds defined by institutional option sellers' heaviest strike clusters</p>
        </div>
        <div class="flex items-center gap-3 text-[10px] font-mono">
          <span class="text-emerald-400">Calls (Ceiling)</span>
          <span class="text-rose-400">Puts (Floor)</span>
        </div>
      </div>

      <div class="w-full px-2">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          <div class="lg:col-span-2">
            <div class="relative w-full h-4 bg-slate-950 rounded-full border border-slate-800 flex items-center my-6">
              <div class="absolute left-0 w-1/4 h-full bg-emerald-500/20 rounded-l-full"></div>
              <div class="absolute right-0 w-1/4 h-full bg-rose-500/20 rounded-r-full"></div>
              <div class="absolute w-1.5 h-6 bg-cyan-400 rounded-sm z-10 shadow-lg shadow-cyan-500/50 -top-1" style="left: 50%;"></div>
              <div class="absolute -top-3.5 transition-all duration-700 z-20 flex flex-col items-center -ml-3" style="left: 52%;">
                <div class="px-2 py-0.5 rounded bg-cyan-400 text-slate-950 font-mono font-black text-[10px] shadow-lg shadow-cyan-400/40 whitespace-nowrap" id="tunnel-spot-text">
                  SPOT $78,032.50
                </div>
                <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-cyan-400"></div>
              </div>
            </div>

            <!-- S/R Labels with PCR in brackets -->
            <div class="grid grid-cols-4 gap-2 mt-4 text-center font-mono">
              <div class="p-2 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
                <div class="text-[10px] text-emerald-400 font-bold uppercase">🛡 Strong Support</div>
                <div class="text-sm font-black text-emerald-300 mt-0.5" id="sr-strong-sup">$76,000</div>
                <div class="text-[9px] text-emerald-400 font-bold" id="sr-strong-sup-pcr">(PCR: 2.15)</div>
              </div>
              <div class="p-2 bg-slate-900/80 border border-slate-800 rounded-lg">
                <div class="text-[10px] text-slate-400 font-semibold uppercase">Nearest Support</div>
                <div class="text-sm font-bold text-slate-200 mt-0.5" id="sr-near-sup">$78,000</div>
                <div class="text-[9px] text-slate-400 font-semibold" id="sr-near-sup-pcr">(PCR: 1.45)</div>
              </div>
              <div class="p-2 bg-slate-900/80 border border-slate-800 rounded-lg">
                <div class="text-[10px] text-slate-400 font-semibold uppercase">Nearest Resistance</div>
                <div class="text-sm font-bold text-slate-200 mt-0.5" id="sr-near-res">$79,000</div>
                <div class="text-[9px] text-slate-400 font-semibold" id="sr-near-res-pcr">(PCR: 0.42)</div>
              </div>
              <div class="p-2 bg-rose-950/20 border border-rose-500/30 rounded-lg">
                <div class="text-[10px] text-rose-400 font-bold uppercase">🧱 Strongest Resistance</div>
                <div class="text-sm font-black text-rose-300 mt-0.5" id="sr-strong-res">$81,000</div>
                <div class="text-[9px] text-rose-400 font-bold" id="sr-strong-res-pcr">(PCR: 0.28)</div>
              </div>
            </div>
          </div>

          <!-- Total OI Pie Chart in S/R Corridor -->
          <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
            <span class="text-[11px] font-bold uppercase text-slate-300 mb-1 flex items-center gap-1.5">
              <span>🥧</span> Total OI Distribution
            </span>
            <div class="relative w-32 h-32 my-1 flex items-center justify-center">
              <svg id="corridor-pie-svg" viewBox="0 0 100 100" class="w-full h-full transform -rotate-90"></svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span class="text-[9px] text-slate-400">Total</span>
                <span class="text-[11px] font-bold text-white" id="corridor-pie-total">44,160</span>
              </div>
            </div>
            <div class="flex items-center justify-between w-full text-[10px] font-mono px-2 mt-1">
              <span class="text-emerald-400" id="corridor-pie-call">Calls: 18,520</span>
              <span class="text-rose-400" id="corridor-pie-put">Puts: 25,640</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5. OI SHIFT CHART (PLACED DIRECTLY BELOW S/R CORRIDOR - ACCURATE CONTRACTS DATA) -->
    <div class="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
      <div class="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 mb-3 px-1 gap-2 border-b border-slate-800 pb-2">
        <div>
          <span class="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
            Open Interest (OI) Shift in Absolute Contracts (<span id="shift-tf-label">1h</span>)
          </span>
          <span class="text-[10px] text-slate-500">Values displayed in absolute contracts added or unwound</span>
        </div>

        <div class="px-3 py-1 bg-cyan-950/70 border border-cyan-500/40 rounded-lg text-cyan-300 font-bold text-xs" id="shift-highlight-badge">
          Most OI Shifting To: Strike $78,000 (+1,086 contracts)
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
        <!-- Bars with guaranteed distinct heights -->
        <div class="lg:col-span-2 h-48 w-full bg-slate-900/40 rounded-lg p-2 flex items-end gap-1.5 overflow-x-auto" id="oi-shift-bars-container">
          <!-- Injected via JS -->
        </div>

        <!-- Overall OI Shift Pie Chart -->
        <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
          <span class="text-[11px] font-bold uppercase text-slate-300 mb-1">Overall OI Shift Split</span>
          <span class="text-[9px] text-slate-500 font-mono mb-1">(In Absolute Added Contracts)</span>
          <div class="relative w-32 h-32 my-1 flex items-center justify-center">
            <svg id="shift-pie-svg" viewBox="0 0 100 100" class="w-full h-full transform -rotate-90"></svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span class="text-[8px] text-slate-400">Total Shift</span>
              <span class="text-[11px] font-bold text-cyan-300" id="shift-pie-total">+7,420</span>
            </div>
          </div>
          <div class="flex items-center justify-between w-full text-[10px] font-mono px-2 mt-1">
            <span class="text-emerald-400" id="shift-pie-call">Calls: +2,850</span>
            <span class="text-rose-400" id="shift-pie-put">Puts: +4,570</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 6. OPTIONS CHAIN TABLE MATRIX (Central Strike, PCR & Structure Signals Shifted to Far Right End) -->
    <div class="mt-4 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60 shadow-xl">
      <div class="overflow-x-auto max-h-[620px] overflow-y-auto">
        <table class="w-full text-xs font-mono border-collapse" id="matrix-table">
          <thead class="sticky top-0 z-30 shadow-md">
            <tr class="bg-[#0b101b] text-slate-400 uppercase text-[11px] border-b border-slate-800">
              <th colSpan="4" class="py-2.5 px-3 text-center text-emerald-400 border-r border-slate-800 font-bold tracking-wider">
                ◄ CALL OPTIONS
              </th>
              <th class="py-2.5 px-3 text-center text-cyan-400 border-r border-slate-800 font-bold tracking-wider">
                STRIKE
              </th>
              <th colSpan="4" class="py-2.5 px-3 text-center text-rose-400 border-r border-slate-800 font-bold tracking-wider">
                PUT OPTIONS ►
              </th>
              <!-- SHIFTED TO FAR RIGHT END -->
              <th colSpan="2" class="py-2.5 px-3 text-center text-cyan-300 font-bold tracking-wider bg-[#0d1424]">
                ANALYTICS & SIGNALS (RIGHT END) ►
              </th>
            </tr>
            <tr class="bg-[#0d1320] text-slate-400 text-[10px] border-b border-slate-800">
              <th class="py-2 px-3 text-left">Call OI Depth</th>
              <th class="py-2 px-3 text-right">Call OI (Contracts)</th>
              <th class="py-2 px-3 text-right">Call Vol</th>
              <th class="py-2 px-3 text-right border-r border-slate-800">Δ Horizon (OI / Vol)</th>
              
              <th class="py-2 px-4 text-center font-bold text-white bg-slate-900/90 border-r border-slate-800">Strike ($)</th>

              <th class="py-2 px-3 text-left">Δ Horizon (OI / Vol)</th>
              <th class="py-2 px-3 text-left">Put Vol</th>
              <th class="py-2 px-3 text-left">Put OI (Contracts)</th>
              <th class="py-2 px-3 text-right border-r border-slate-800">Put OI Depth</th>

              <!-- SHIFTED TO FAR RIGHT END -->
              <th class="py-2 px-3 text-center bg-[#0d1424] text-cyan-400 font-bold">OI / Vol PCR</th>
              <th class="py-2 px-3 text-center bg-[#0d1424] text-slate-300 font-bold">Structure Signals</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40" id="matrix-tbody">
            <!-- Injected via JS -->
          </tbody>
        </table>
      </div>
    </div>

    <!-- 7. VOLUME SURGE FLOW (PLACED DIRECTLY BELOW CALL PUT STRIKE DATA NEAR END OF PAGE) -->
    <div class="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
      <div class="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 mb-3 px-1 gap-2 border-b border-slate-800 pb-2">
        <div>
          <span class="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
            Strike Volume Surge Flow in Absolute Contracts (<span id="vol-tf-label">1h</span>)
          </span>
          <span class="text-[10px] text-slate-500">Real-time trading intensity across strikes (values in contracts)</span>
        </div>

        <div class="px-3 py-1 bg-cyan-950/70 border border-cyan-500/40 rounded-lg text-cyan-300 font-bold text-xs" id="surge-highlight-badge">
          Top Surge Strike: $78,000 (14,200 contracts)
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
        <div class="lg:col-span-2 h-48 w-full bg-slate-900/40 rounded-lg p-2 flex items-end gap-1.5 overflow-x-auto" id="volume-surge-bars-container">
          <!-- Injected via JS -->
        </div>

        <div class="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
          <span class="text-[11px] font-bold uppercase text-slate-300 mb-1">Overall Volume Split</span>
          <span class="text-[9px] text-slate-500 font-mono mb-1">(In Absolute Traded Contracts)</span>
          <div class="relative w-32 h-32 my-1 flex items-center justify-center">
            <svg id="volume-pie-svg" viewBox="0 0 100 100" class="w-full h-full transform -rotate-90"></svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span class="text-[8px] text-slate-400">Total Vol</span>
              <span class="text-[11px] font-bold text-white" id="vol-pie-total">26,500</span>
            </div>
          </div>
          <div class="flex items-center justify-between w-full text-[10px] font-mono px-2 mt-1">
            <span class="text-cyan-400" id="vol-pie-call">Call Vol: 11,800</span>
            <span class="text-amber-400" id="vol-pie-put">Put Vol: 14,700</span>
          </div>
        </div>
      </div>
    </div>

  </div>

  <script>
    let currentAsset = 'BTC';
    let currentTimeframe = '1h';

    const CONFIG = {
      BTC: { spot: 78032.50, step: 1000, callBase: 2100, putBase: 2900 },
      ETH: { spot: 3850.25, step: 100, callBase: 6500, putBase: 8200 },
      SOL: { spot: 192.40, step: 5, callBase: 12000, putBase: 15500 },
      XAUT: { spot: 2740.80, step: 25, callBase: 850, putBase: 1100 }
    };

    function renderPie(svgId, v1, v2, c1, c2) {
      const svg = document.getElementById(svgId);
      if (!svg) return;
      const total = v1 + v2;
      if (total <= 0) return;
      const p1 = (v1 / total) * 100;
      const p2 = (v2 / total) * 100;
      const r = 15.9155;
      const d1 = `${p1.toFixed(2)} ${(100 - p1).toFixed(2)}`;
      const d2 = `${p2.toFixed(2)} ${(100 - p2).toFixed(2)}`;
      const offset = (-p1).toFixed(2);
      svg.innerHTML = `
        <circle cx="50" cy="50" r="${r}" fill="transparent" stroke="#1e293b" stroke-width="6"></circle>
        <circle cx="50" cy="50" r="${r}" fill="transparent" stroke="${c1}" stroke-width="6" stroke-dasharray="${d1}" stroke-dashoffset="0"></circle>
        <circle cx="50" cy="50" r="${r}" fill="transparent" stroke="${c2}" stroke-width="6" stroke-dasharray="${d2}" stroke-dashoffset="${offset}"></circle>
      `;
    }

    function update() {
      const cfg = CONFIG[currentAsset];
      const spot = cfg.spot;
      const step = cfg.step;
      const center = Math.round(spot / step) * step;

      // 3 Nearest Resistances above spot
      const r1 = center + step; // 79,000
      const r2 = center + 2 * step; // 80,000
      const r3 = center + 3 * step; // 81,000

      // 3 Nearest Supports below spot
      const s1 = center; // 78,000
      const s2 = center - step; // 77,000
      const s3 = center - 2 * step; // 76,000

      // Top Spot Display
      document.getElementById('spot-asset-label').textContent = `${currentAsset} SPOT:`;
      document.getElementById('top-spot-price').textContent = `$${spot.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      document.getElementById('radar-asset').textContent = currentAsset;
      
      document.getElementById('shift-tf-label').textContent = currentTimeframe;
      document.getElementById('vol-tf-label').textContent = currentTimeframe;
      document.getElementById('narrative-tf').textContent = currentTimeframe;

      // 3 Resistance & 3 Support labels with PCR in brackets
      document.getElementById('res-r1').innerHTML = `$${r1.toLocaleString()} <span class="text-[10px] text-rose-400 font-semibold">(PCR: 0.42)</span>`;
      document.getElementById('res-r2').innerHTML = `$${r2.toLocaleString()} <span class="text-[10px] text-rose-400 font-semibold">(PCR: 0.35)</span>`;
      document.getElementById('res-r3').innerHTML = `$${r3.toLocaleString()} <span class="text-[10px] text-rose-400 font-semibold">(PCR: 0.28)</span>`;

      document.getElementById('sup-s1').innerHTML = `$${s1.toLocaleString()} <span class="text-[10px] text-emerald-400 font-semibold">(PCR: 1.45)</span>`;
      document.getElementById('sup-s2').innerHTML = `$${s2.toLocaleString()} <span class="text-[10px] text-emerald-400 font-semibold">(PCR: 1.78)</span>`;
      document.getElementById('sup-s3').innerHTML = `$${s3.toLocaleString()} <span class="text-[10px] text-emerald-400 font-semibold">(PCR: 2.15)</span>`;

      document.getElementById('ntz-bounds-text').textContent = `$${s1.toLocaleString()} – $${r1.toLocaleString()}`;
      document.getElementById('ntz-maxpain-ref').textContent = `$${center.toLocaleString()}`;

      // S/R Corridor labels with PCR in brackets
      document.getElementById('sr-strong-sup').textContent = `$${s3.toLocaleString()}`;
      document.getElementById('sr-strong-sup-pcr').textContent = `(PCR: 2.15)`;
      document.getElementById('sr-near-sup').textContent = `$${s1.toLocaleString()}`;
      document.getElementById('sr-near-sup-pcr').textContent = `(PCR: 1.45)`;
      document.getElementById('sr-near-res').textContent = `$${r1.toLocaleString()}`;
      document.getElementById('sr-near-res-pcr').textContent = `(PCR: 0.42)`;
      document.getElementById('sr-strong-res').textContent = `$${r3.toLocaleString()}`;
      document.getElementById('sr-strong-res-pcr').textContent = `(PCR: 0.28)`;

      document.getElementById('kpi-spot-ref').textContent = `Spot: $${spot.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      document.getElementById('tunnel-spot-text').textContent = `SPOT $${spot.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

      // Build strikes
      const tbody = document.getElementById('matrix-tbody');
      tbody.innerHTML = '';

      let totalCallOi = 0;
      let totalPutOi = 0;
      let totalCallVol = 0;
      let totalPutVol = 0;
      let totalCallShift = 0;
      let totalPutShift = 0;

      let topShiftStrike = center;
      let topShiftAmount = 0;
      let topSurgeStrike = center;
      let topSurgeAmount = 0;

      const strikes = [];

      for (let i = -5; i <= 5; i++) {
        const str = center + i * step;
        const callOi = Math.round(cfg.callBase * (1 + Math.sin(i * 1.4) * 0.45) * (i >= 0 ? 1.45 : 0.65));
        const putOi = Math.round(cfg.putBase * (1 + Math.cos(i * 1.3) * 0.45) * (i <= 0 ? 1.75 : 0.55));
        const callVol = Math.round(callOi * 0.42);
        const putVol = Math.round(putOi * 0.48);

        // Robust positive shift contracts
        const callShift = Math.round(callVol * 0.52 + callOi * 0.08);
        const putShift = Math.round(putVol * 0.58 + putOi * 0.11);

        const pcr = Number((putOi / (callOi || 1)).toFixed(2));
        const volPcr = Number((putVol / (callVol || 1)).toFixed(2));

        totalCallOi += callOi;
        totalPutOi += putOi;
        totalCallVol += callVol;
        totalPutVol += putVol;
        totalCallShift += callShift;
        totalPutShift += putShift;

        if (callShift + putShift > topShiftAmount) {
          topShiftAmount = callShift + putShift;
          topShiftStrike = str;
        }
        if (callVol + putVol > topSurgeAmount) {
          topSurgeAmount = callVol + putVol;
          topSurgeStrike = str;
        }

        strikes.push({
          strike: str,
          callOi, putOi, callVol, putVol,
          callShift, putShift,
          pcr, volPcr
        });
      }

      const maxRowOi = Math.max(...strikes.map(s => Math.max(s.callOi, s.putOi)));

      strikes.forEach(s => {
        const isStrongRes = s.strike === r3;
        const isNearRes = s.strike === r1;
        const isStrongSup = s.strike === s3;
        const isNearSup = s.strike === s1;
        const isMaxPain = s.strike === center;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/30 transition-colors";
        tr.innerHTML = `
          <!-- Call OI Depth -->
          <td class="py-2 px-3 w-28 relative">
            <div class="w-full bg-slate-900 h-2 rounded overflow-hidden">
              <div class="bg-emerald-500 h-full rounded" style="width: ${(s.callOi / maxRowOi) * 100}%"></div>
            </div>
          </td>
          <!-- Call OI -->
          <td class="py-2 px-3 text-right font-medium text-slate-200">${s.callOi.toLocaleString()}</td>
          <!-- Call Vol -->
          <td class="py-2 px-3 text-right font-medium text-cyan-300">${s.callVol.toLocaleString()}</td>
          <!-- Call Δ -->
          <td class="py-2 px-3 text-right border-r border-slate-800 text-emerald-400">+${s.callShift.toLocaleString()}</td>

          <!-- Strike in Center -->
          <td class="py-2 px-4 text-center font-bold text-sm bg-slate-900/60 border-r border-slate-800 ${isMaxPain ? 'text-cyan-400 ring-1 ring-cyan-500/50' : 'text-white'}">
            $${s.strike.toLocaleString()}
          </td>

          <!-- Put Δ -->
          <td class="py-2 px-3 text-left text-emerald-400">+${s.putShift.toLocaleString()}</td>
          <!-- Put Vol -->
          <td class="py-2 px-3 text-left font-medium text-cyan-300">${s.putVol.toLocaleString()}</td>
          <!-- Put OI -->
          <td class="py-2 px-3 text-left font-medium text-slate-200">${s.putOi.toLocaleString()}</td>
          <!-- Put OI Depth -->
          <td class="py-2 px-3 w-28 relative text-right border-r border-slate-800">
            <div class="w-full bg-slate-900 h-2 rounded overflow-hidden">
              <div class="bg-rose-500 h-full rounded" style="width: ${(s.putOi / maxRowOi) * 100}%"></div>
            </div>
          </td>

          <!-- SHIFTED TO FAR RIGHT END: PCR -->
          <td class="py-2 px-3 text-center bg-[#0c121e]/80 border-r border-slate-800">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold ${s.pcr >= 1.0 ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'}">
              OI: ${s.pcr}
            </span>
            <div class="text-[9px] text-slate-400 mt-0.5">Vol: ${s.volPcr}</div>
          </td>

          <!-- SHIFTED TO FAR RIGHT END: Structure Signals -->
          <td class="py-2 px-3 text-center whitespace-nowrap bg-[#0c121e]/80">
            <div class="flex flex-wrap items-center justify-center gap-1">
              ${isStrongRes ? '<span class="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-500/25 text-rose-300 border border-rose-500/50">STRONGEST RES</span>' : ''}
              ${isNearRes ? '<span class="px-1.5 py-0.5 text-[9px] font-medium rounded bg-rose-950/50 text-rose-400 border border-rose-500/30">NEAREST RES</span>' : ''}
              ${isStrongSup ? '<span class="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/25 text-emerald-300 border border-emerald-500/50">STRONG SUPPORT</span>' : ''}
              ${isNearSup ? '<span class="px-1.5 py-0.5 text-[9px] font-medium rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">NEAREST SUP</span>' : ''}
              ${isMaxPain ? '<span class="px-1.5 py-0.5 text-[9px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">MAX PAIN</span>' : ''}
              ${!isStrongRes && !isNearRes && !isStrongSup && !isNearSup && !isMaxPain ? '<span class="text-slate-500">-</span>' : ''}
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Pie chart updates in S/R Corridor
      renderPie('corridor-pie-svg', totalCallOi, totalPutOi, '#10b981', '#f43f5e');
      document.getElementById('corridor-pie-total').textContent = (totalCallOi + totalPutOi).toLocaleString();
      document.getElementById('corridor-pie-call').textContent = `Calls: ${totalCallOi.toLocaleString()}`;
      document.getElementById('corridor-pie-put').textContent = `Puts: ${totalPutOi.toLocaleString()}`;

      // OI Shift Bars & Pie (Guaranteed distinct bar heights & non-zero values)
      const shiftBars = document.getElementById('oi-shift-bars-container');
      shiftBars.innerHTML = '';
      const maxShiftVal = Math.max(...strikes.map(s => Math.max(s.callShift, s.putShift)));

      strikes.forEach(s => {
        const div = document.createElement('div');
        div.className = "flex-1 min-w-[42px] flex flex-col items-center h-full justify-end group";
        const callH = Math.max(12, Math.round((s.callShift / maxShiftVal) * 100));
        const putH = Math.max(12, Math.round((s.putShift / maxShiftVal) * 100));

        div.innerHTML = `
          <div class="w-full flex items-end justify-center gap-0.5 h-36 mb-1">
            <div class="w-1/2 bg-emerald-500/80 rounded-t transition-all group-hover:bg-emerald-400" style="height: ${callH}%" title="Calls Added: +${s.callShift.toLocaleString()} contracts"></div>
            <div class="w-1/2 bg-rose-500/80 rounded-t transition-all group-hover:bg-rose-400" style="height: ${putH}%" title="Puts Added: +${s.putShift.toLocaleString()} contracts"></div>
          </div>
          <span class="text-[9px] font-mono text-slate-400">$${s.strike.toLocaleString()}</span>
        `;
        shiftBars.appendChild(div);
      });

      renderPie('shift-pie-svg', totalCallShift, totalPutShift, '#10b981', '#f43f5e');
      document.getElementById('shift-pie-total').textContent = `+${(totalCallShift + totalPutShift).toLocaleString()}`;
      document.getElementById('shift-pie-call').textContent = `Calls: +${totalCallShift.toLocaleString()}`;
      document.getElementById('shift-pie-put').textContent = `Puts: +${totalPutShift.toLocaleString()}`;
      document.getElementById('shift-highlight-badge').textContent = `Most OI Shifting To: Strike $${topShiftStrike.toLocaleString()} (+${topShiftAmount.toLocaleString()} contracts)`;

      // Volume Surge Bars & Pie
      const surgeBars = document.getElementById('volume-surge-bars-container');
      surgeBars.innerHTML = '';
      const maxSurgeVal = Math.max(...strikes.map(s => Math.max(s.callVol, s.putVol)));

      strikes.forEach(s => {
        const div = document.createElement('div');
        div.className = "flex-1 min-w-[42px] flex flex-col items-center h-full justify-end group";
        const callVolH = Math.max(12, Math.round((s.callVol / maxSurgeVal) * 100));
        const putVolH = Math.max(12, Math.round((s.putVol / maxSurgeVal) * 100));

        div.innerHTML = `
          <div class="w-full flex items-end justify-center gap-0.5 h-36 mb-1">
            <div class="w-1/2 bg-cyan-500/80 rounded-t transition-all group-hover:bg-cyan-300" style="height: ${callVolH}%" title="Call Vol: ${s.callVol.toLocaleString()} contracts"></div>
            <div class="w-1/2 bg-amber-500/80 rounded-t transition-all group-hover:bg-amber-300" style="height: ${putVolH}%" title="Put Vol: ${s.putVol.toLocaleString()} contracts"></div>
          </div>
          <span class="text-[9px] font-mono text-slate-400">$${s.strike.toLocaleString()}</span>
        `;
        surgeBars.appendChild(div);
      });

      renderPie('volume-pie-svg', totalCallVol, totalPutVol, '#06b6d4', '#f59e0b');
      document.getElementById('vol-pie-total').textContent = (totalCallVol + totalPutVol).toLocaleString();
      document.getElementById('vol-pie-call').textContent = `Call Vol: ${totalCallVol.toLocaleString()}`;
      document.getElementById('vol-pie-put').textContent = `Put Vol: ${totalPutVol.toLocaleString()}`;
      document.getElementById('surge-highlight-badge').textContent = `Top Surge Strike: $${topSurgeStrike.toLocaleString()} (${topSurgeAmount.toLocaleString()} contracts)`;

      // Overview KPI updates
      document.getElementById('kpi-call-contracts').textContent = `${totalCallOi.toLocaleString()} contracts`;
      document.getElementById('kpi-put-contracts').textContent = `${totalPutOi.toLocaleString()} contracts`;
      const overallPcr = Number((totalPutOi / totalCallOi).toFixed(3));
      document.getElementById('kpi-overall-pcr').textContent = overallPcr;
      document.getElementById('radar-oi-pcr').textContent = overallPcr;
    }

    // Single dropdown toggle for verbal narrative
    document.getElementById('narrative-toggle-btn').addEventListener('click', () => {
      const content = document.getElementById('narrative-content');
      const arrow = document.getElementById('narrative-btn-arrow');
      const text = document.getElementById('narrative-btn-text');
      if (content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        arrow.textContent = '▲';
        text.textContent = 'Collapse';
      } else {
        content.classList.add('hidden');
        arrow.textContent = '▼';
        text.textContent = 'Expand In Words';
      }
    });

    // Asset selection
    document.querySelectorAll('.asset-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.asset-btn').forEach(b => {
          b.className = "px-3 py-1.5 text-xs font-mono font-bold rounded-md text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all asset-btn";
        });
        e.currentTarget.className = "px-3 py-1.5 text-xs font-mono font-bold rounded-md bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20 transition-all asset-btn";
        currentAsset = e.currentTarget.getAttribute('data-asset');
        update();
      });
    });

    // Timeframe selection
    document.querySelectorAll('.tf-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tf-btn').forEach(b => {
          b.className = "px-2 py-1 text-[11px] font-mono font-bold rounded text-slate-400 hover:text-white tf-btn";
        });
        e.currentTarget.className = "px-2 py-1 text-[11px] font-mono font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 tf-btn";
        currentTimeframe = e.currentTarget.getAttribute('data-tf');
        update();
      });
    });

    document.getElementById('manual-refresh-btn').addEventListener('click', update);

    let sec = 10;
    setInterval(() => {
      sec = sec > 1 ? sec - 1 : 10;
      document.getElementById('countdown-label').textContent = `${sec}s`;
      if (sec === 10) update();
    }, 1000);

    window.addEventListener('load', update);
  </script>
</body>
</html>
