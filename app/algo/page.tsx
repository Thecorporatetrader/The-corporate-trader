// The-corporate-trader-main/app/algo/page.tsx
'use client';

import React, { useState } from 'react';

export default function TCTAlgoPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    market: 'Forex',
    platform: 'MT5',
    broker: '',
    instruments: '',
    timeframe: '',
    buyEntryRules: '',
    sellEntryRules: '',
    entryFilters: '',
    stopLossRules: '',
    takeProfitRules: '',
    positionSizing: '',
    maxRisk: '',
    breakevenRules: '',
    trailingRules: '',
    partialExitRules: '',
    tradingSession: '',
    reentryRules: '',
    maxDailyTrades: '',
    maxDailyLoss: '',
    newsBehaviour: '',
    exampleSetup: '',
    additionalNotes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you! Your custom algo requirements have been submitted for technical review.');
    setIsFormOpen(false);
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-20 text-gray-900">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          TCT ALGO SUITE
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Three Paths to Automated Trading</h1>
        <p className="text-gray-600 text-lg">
          Whether you want to manage your own entries, wait for automated system detection, or turn your custom strategy into code—The Corporate Trader provides the ideal solution.
        </p>
      </div>

      {/* THREE PRODUCTS OVERVIEW GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Product 1 Summary Card */}
        <div className="bg-white p-8 rounded-3xl border border-blue-200 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Available Now
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-gray-900">TCT ALGO</h2>
            <p className="text-sm font-semibold text-blue-600">You choose the trade. TCT manages the execution.</p>
            <p className="text-sm text-gray-600">
              Trader chooses the trading level and TCT automatically handles execution and management rules.
            </p>
          </div>
          <a href="#tct-algo-section" className="w-full py-3 bg-blue-600 text-white rounded-xl text-center font-bold text-sm hover:bg-blue-700 transition">
            View TCT Algo
          </a>
        </div>

        {/* Product 2 Summary Card */}
        <div className="bg-white p-8 rounded-3xl border border-amber-200 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Coming Soon
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-gray-900">TCT AUTO</h2>
            <p className="text-sm font-semibold text-amber-600">Automated structured market analysis and execution.</p>
            <p className="text-sm text-gray-600">
              System will identify candidate levels based on liquidity, supply/demand, and market structure.
            </p>
          </div>
          <a href="#tct-auto-section" className="w-full py-3 bg-gray-900 text-white rounded-xl text-center font-bold text-sm hover:bg-gray-800 transition">
            Explore TCT Auto
          </a>
        </div>

        {/* Product 3 Summary Card */}
        <div className="bg-white p-8 rounded-3xl border border-emerald-200 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            Custom Build
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-gray-900">BUILD YOUR OWN ALGO</h2>
            <p className="text-sm font-semibold text-emerald-600">Your strategy. Your rules. Built into automation.</p>
            <p className="text-sm text-gray-600">
              Submit your rules and TCT will review automation requirements for Indian markets and forex.
            </p>
          </div>
          <a href="#custom-algo-section" className="w-full py-3 bg-emerald-600 text-white rounded-xl text-center font-bold text-sm hover:bg-emerald-700 transition">
            Submit My Requirements
          </a>
        </div>

      </div>

      <hr className="border-gray-200" />

      {/* --- SECTION 1: CURRENT TCT ALGO --- */}
      <section id="tct-algo-section" className="bg-white p-8 md:p-12 rounded-3xl border shadow-sm space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Available Now
            </div>
            <h2 className="text-3xl font-extrabold">You choose the trade. TCT manages the execution.</h2>
            <p className="text-gray-500 font-medium">MT5 Trade Execution & Management Automation</p>
          </div>
          <div className="bg-blue-600 text-white font-bold px-5 py-2 rounded-xl text-sm shadow">
            AVAILABLE NOW
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-50 p-6 md:p-8 rounded-2xl border">
          <div className="space-y-4">
            <h3 className="text-xl font-bold">How It Works</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              The trader performs the market analysis and chooses the Buy/Sell trading level. TCT Algo then manages the configured execution and trade-management process.
            </p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-xs font-medium space-y-1">
              <span className="font-bold uppercase tracking-wide block">Important Clarification:</span>
              TCT Algo does not independently predict market direction or select your trading level. The trading decision remains with the trader.
            </div>
          </div>

          {/* Workflow List */}
          <div className="space-y-2 text-sm font-semibold">
            {[
              "USER ANALYSES MARKET",
              "USER SELECTS BUY / SELL LEVEL",
              "CONFIGURE ORDERS & RISK",
              "TCT ALGO MONITORS LEVEL",
              "TRADE EXECUTION",
              "TAKE-PROFIT MANAGEMENT",
              "BREAKEVEN",
              "TRAILING / POSITION MANAGEMENT"
            ].map((step, idx, arr) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-full bg-white border px-4 py-2.5 rounded-xl shadow-xs text-center text-gray-800">
                  {step}
                </div>
                {idx < arr.length - 1 && <span className="text-blue-600 font-bold my-0.5">↓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Supported Features */}
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900">Supported Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Buy/Sell Level",
              "Stop Loss",
              "Number of Orders",
              "Multiple Take Profits",
              "Lot/Risk Settings",
              "Breakeven",
              "Trailing Stop",
              "Position Management"
            ].map((feat, idx) => (
              <div key={idx} className="bg-blue-50/50 border border-blue-100 p-3 rounded-xl text-sm font-medium text-blue-900 flex items-center gap-2">
                <span className="text-blue-600">✓</span> {feat}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 2: TCT AUTO — UPCOMING ALGO --- */}
      <section id="tct-auto-section" className="bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 text-white p-8 md:p-12 rounded-3xl shadow-xl space-y-10 border border-indigo-900">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-block bg-amber-500 text-gray-950 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Coming Soon
            </div>
            <h2 className="text-3xl font-extrabold">From market analysis to structured execution.</h2>
            <p className="text-indigo-200 font-medium">TCT AUTO — Upcoming Next-Generation Automation</p>
          </div>
          <div className="bg-amber-500 text-gray-950 font-bold px-5 py-2 rounded-xl text-sm shadow">
            COMING SOON
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-800/50 p-6 md:p-8 rounded-2xl border border-gray-700">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Automated Market Intelligence</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              TCT Auto is the next-generation automation system currently under development. Unlike the current TCT Algo, where the trader provides the trading level, TCT Auto is being developed to analyse configured market conditions and identify potential candidate trading levels automatically.
            </p>
            <p className="text-xs text-amber-300 font-medium bg-amber-950/40 p-3 rounded-xl border border-amber-800/50">
              Note: Focused on structured market analysis, candidate trading levels, potential setups, and configured conditions. No guarantees or 100% accuracy claims.
            </p>
          </div>

          {/* High-level workflow */}
          <div className="space-y-1 text-xs font-bold text-gray-200">
            {[
              "MARKET DATA",
              "LIQUIDITY ANALYSIS",
              "SUPPLY / DEMAND ANALYSIS",
              "MARKET STRUCTURE",
              "CANDIDATE LEVEL",
              "ENTRY CONDITIONS",
              "RISK VALIDATION",
              "EXECUTION",
              "POSITION MANAGEMENT"
            ].map((step, idx, arr) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-full bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg text-center text-indigo-200">
                  {step}
                </div>
                {idx < arr.length - 1 && <span className="text-amber-400 text-xs my-0.5">↓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Concepts list */}
        <div className="space-y-4">
          <h4 className="font-bold text-white">Underlying System Concepts</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Liquidity",
              "Liquidity Sweeps",
              "Supply Zones",
              "Demand Zones",
              "Market Structure",
              "Price Reaction",
              "Confirmation Rules",
              "Risk Management"
            ].map((concept, idx) => (
              <div key={idx} className="bg-gray-800 border border-gray-700 p-3 rounded-xl text-sm font-medium text-gray-200 flex items-center gap-2">
                <span className="text-amber-400">✦</span> {concept}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 3: BUILD YOUR OWN ALGO --- */}
      <section id="custom-algo-section" className="bg-white p-8 md:p-12 rounded-3xl border shadow-sm space-y-12">
        <div className="space-y-3 max-w-3xl">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Custom Development
          </span>
          <h2 className="text-3xl font-extrabold">BUILD YOUR OWN ALGO</h2>
          <p className="text-emerald-700 font-semibold text-lg">Your strategy. Your rules. Built into automation.</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Already have your own trading strategy? Submit your complete trading requirements to TCT. We will review the strategy and determine whether the trading rules can be converted into an automated trading system.
          </p>
        </div>

        {/* Markets Supported */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-emerald-50/40 p-6 rounded-2xl border border-emerald-100 space-y-3">
            <h3 className="font-bold text-gray-900 text-lg">🇮🇳 Indian Markets</h3>
            <p className="text-sm text-gray-600">
              Examples can include Indian Stocks, Indian market trading strategies, and broker/API automation where technically supported.
            </p>
          </div>
          <div className="bg-blue-50/40 p-6 rounded-2xl border border-blue-100 space-y-3">
            <h3 className="font-bold text-gray-900 text-lg">💱 Forex Market</h3>
            <p className="text-sm text-gray-600">
              Examples can include Forex pairs, MT5 automation, Expert Advisors, trade execution systems, and strategy automation.
            </p>
          </div>
        </div>

        <div className="bg-gray-50 border p-4 rounded-xl text-xs text-gray-600 text-center font-medium">
          Custom automation for Indian markets and forex is subject to strategy logic, platform, broker/API availability and technical feasibility.
        </div>

        {/* Development Process */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold">Custom Algo Development Process</h3>
          <div className="grid grid-cols-3 md:grid-cols-9 gap-2 text-center text-xs font-bold">
            {[
              "SUBMIT REQUIREMENTS",
              "TECHNICAL REVIEW",
              "REQUIREMENT DISCUSSION",
              "SCOPE",
              "PROTOTYPE",
              "BACKTEST",
              "DEMO TESTING",
              "DELIVERY",
              "SUPPORT"
            ].map((step, idx) => (
              <div key={idx} className="bg-white border p-3 rounded-xl shadow-xs flex flex-col justify-center items-center">
                <span className="text-[10px] text-emerald-600 mb-1">0{idx+1}</span>
                <span className="text-[11px] text-gray-800 leading-tight">{step}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 italic text-center">
            Not every discretionary trading strategy can be fully automated. Each requirement is reviewed for technical feasibility before development begins.
          </p>
        </div>

        {/* Requirement Form Button / Trigger */}
        <div className="text-center pt-6">
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition text-base"
          >
            {isFormOpen ? 'Close Requirement Form' : 'SUBMIT YOUR ALGO REQUIREMENTS'}
          </button>
        </div>

        {/* CUSTOM ALGO REQUIREMENT FORM (Expandable) */}
        {isFormOpen && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 md:p-10 rounded-3xl border space-y-8 animate-fadeIn">
            <div className="border-b pb-4">
              <h3 className="text-2xl font-bold">Custom Algo Requirement Form</h3>
              <p className="text-sm text-gray-600">Provide your exact specifications so our team can evaluate technical feasibility.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Name</label>
                <input required type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Your Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Email</label>
                <input required type="email" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="name@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Mobile</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="+1..." value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Market</label>
                <select className="w-full bg-white border p-3 rounded-xl text-sm" value={formData.market} onChange={e => setFormData({...formData, market: e.target.value})}>
                  <option value="Forex">Forex Market</option>
                  <option value="Indian Stocks">Indian Stock Market</option>
                  <option value="Both">Both / Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Platform</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="e.g. MT5, TradingView, Broker API" value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Broker</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Your Broker Name" value={formData.broker} onChange={e => setFormData({...formData, broker: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Instruments / Symbols</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="e.g. XAUUSD, EURUSD, NIFTY" value={formData.instruments} onChange={e => setFormData({...formData, instruments: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Timeframe</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="e.g. 5m, 15m, 1h" value={formData.timeframe} onChange={e => setFormData({...formData, timeframe: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Buy Entry Rules</label>
                <textarea rows={3} className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Describe exact buy triggers..." value={formData.buyEntryRules} onChange={e => setFormData({...formData, buyEntryRules: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Sell Entry Rules</label>
                <textarea rows={3} className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Describe exact sell triggers..." value={formData.sellEntryRules} onChange={e => setFormData({...formData, sellEntryRules: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Entry Filters</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Trend filter, session filter..." value={formData.entryFilters} onChange={e => setFormData({...formData, entryFilters: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Stop Loss Rules</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Fixed pips, structure SL..." value={formData.stopLossRules} onChange={e => setFormData({...formData, stopLossRules: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Take Profit Rules</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Fixed R:R, multi-TP..." value={formData.takeProfitRules} onChange={e => setFormData({...formData, takeProfitRules: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Position Sizing</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Fixed lot, % risk..." value={formData.positionSizing} onChange={e => setFormData({...formData, positionSizing: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Maximum Risk</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Max risk per trade / day" value={formData.maxRisk} onChange={e => setFormData({...formData, maxRisk: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Breakeven Rules</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Move to BE at X pips" value={formData.breakevenRules} onChange={e => setFormData({...formData, breakevenRules: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Trailing Rules</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Trailing stop parameters" value={formData.trailingRules} onChange={e => setFormData({...formData, trailingRules: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Partial Exit Rules</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Close X% at target 1" value={formData.partialExitRules} onChange={e => setFormData({...formData, partialExitRules: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Trading Session</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="London, NY, Asian..." value={formData.tradingSession} onChange={e => setFormData({...formData, tradingSession: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Re-entry Rules</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Allow re-entry after SL?" value={formData.reentryRules} onChange={e => setFormData({...formData, reentryRules: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Maximum Daily Trades</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="e.g. Max 3 trades/day" value={formData.maxDailyTrades} onChange={e => setFormData({...formData, maxDailyTrades: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Maximum Daily Loss</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Daily drawdown cutoff" value={formData.maxDailyLoss} onChange={e => setFormData({...formData, maxDailyLoss: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">News Behaviour</label>
                <input type="text" className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Stop trading during high impact news?" value={formData.newsBehaviour} onChange={e => setFormData({...formData, newsBehaviour: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase">Upload Strategy Document</label>
                <input type="file" className="w-full bg-white border p-3 rounded-xl text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Example Setup & Additional Notes</label>
              <textarea rows={4} className="w-full bg-white border p-3 rounded-xl text-sm" placeholder="Provide any additional details or context regarding your setup..." value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} />
            </div>

            <div className="text-center pt-4">
              <button type="submit" className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-xl transition">
                Submit Strategy Requirements
              </button>
            </div>
          </form>
        )}
      </section>

      {/* --- FINAL SECTION — WHICH AUTOMATION DO YOU NEED? --- */}
      <section className="bg-gray-900 text-white p-8 md:p-14 rounded-3xl space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold tracking-tight">Which automation do you need?</h2>
          <p className="text-gray-400 text-sm">Choose the solution that aligns with your trading workflow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Choice 1 */}
          <div className="bg-gray-800/80 border border-gray-700 p-8 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-blue-400 text-xs font-bold uppercase tracking-wider">Option 01</span>
              <h3 className="text-xl font-bold">TCT ALGO</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Trader chooses the trade and TCT manages execution.
              </p>
            </div>
            <a href="#tct-algo-section" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-center font-bold rounded-xl text-sm transition">
              Get TCT Algo
            </a>
          </div>

          {/* Choice 2 */}
          <div className="bg-gray-800/80 border border-gray-700 p-8 rounded-2xl flex flex-col justify-between space-y-6 relative">
            <div className="absolute top-4 right-4 bg-amber-500 text-gray-950 text-[10px] font-bold px-2.5 py-1 rounded-full">
              COMING SOON
            </div>
            <div className="space-y-3">
              <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Option 02</span>
              <h3 className="text-xl font-bold">TCT AUTO</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Automated structured market analysis and execution.
              </p>
            </div>
            <a href="#tct-auto-section" className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-950 text-center font-bold rounded-xl text-sm transition">
              Explore TCT Auto
            </a>
          </div>

          {/* Choice 3 */}
          <div className="bg-gray-800/80 border border-gray-700 p-8 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Option 03</span>
              <h3 className="text-xl font-bold">BUILD YOUR OWN ALGO</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                Submit the rules and TCT will review the automation requirements.
              </p>
            </div>
            <a href="#custom-algo-section" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-center font-bold rounded-xl text-sm transition">
              Submit My Requirements
            </a>
          </div>

        </div>
      </section>

    </div>
  );
}
