// The-corporate-trader-main/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 overflow-x-hidden selection:bg-blue-600 selection:text-white">
      
      {/* =========================================================================
          SECTION 1 — HERO
          ========================================================================= */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              The Corporate Trader Ecosystem
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              THE CORPORATE TRADER
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-blue-400 tracking-tight">
              Trade. Track. Improve. Automate.
            </p>

            <div className="space-y-4 text-gray-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0">
              <p className="font-medium text-gray-200">
                Trading technology built around process — not promises.
              </p>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
                TCT provides trading tools, automation, analytics and educational resources designed to help traders structure their process from planning and execution to review and improvement.
              </p>
            </div>

            {/* Philosophy quote */}
            <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 text-xs sm:text-sm text-gray-300 max-w-xl mx-auto lg:mx-0 border-l-4 border-l-blue-500">
              <span className="font-semibold text-white block mb-1">Core Trading Philosophy:</span>
              You make the trading decision. TCT helps execute the plan, analyse the result and automate repeatable processes.
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link 
                href="#products" 
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition text-center text-sm"
              >
                Explore TCT Products
              </Link>
              <Link 
                href="/library" 
                className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800 font-bold rounded-2xl transition text-center text-sm"
              >
                Start with TCT Library
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl relative">
              <div className="absolute -top-3 -right-3 bg-blue-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest shadow">
                Trading Tech
              </div>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">TCT_ENGINE_V2.4</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400">Execution Engine</span>
                    <span className="text-emerald-400 font-bold">ONLINE</span>
                  </div>
                  <div className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400">Analytics Processor</span>
                    <span className="text-blue-400 font-bold">SYNCED</span>
                  </div>
                  <div className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                    <span className="text-gray-400">Risk Validation</span>
                    <span className="text-amber-400 font-bold">ACTIVE</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800/60 text-center">
                  <p className="text-xs text-gray-500">Structured Workflow & Performance Intelligence</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — TCT ECOSYSTEM
          ========================================================================= */}
      <section className="py-16 bg-gray-900/50 border-y border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Workflow Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">ONE TRADING ECOSYSTEM</h2>
            <p className="text-gray-400 text-sm sm:text-base">
              From planning the trade to analysing the result and automating repeatable processes, TCT connects the trading workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {[
              { step: "01", title: "PLAN", desc: "Define setup criteria" },
              { step: "02", title: "EXECUTE", desc: "Structured trade entry" },
              { step: "03", title: "TRACK", desc: "Log executions" },
              { step: "04", title: "ANALYSE", desc: "Review metrics & edges" },
              { step: "05", title: "UNDERSTAND", desc: "Behavior & sessions" },
              { step: "06", title: "IMPROVE", desc: "Refine discipline" },
              { step: "07", title: "AUTOMATE", desc: "Systemise execution" },
            ].map((item, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl flex flex-col justify-between space-y-2 text-center relative">
                <span className="text-[10px] font-mono text-blue-500 font-bold">{item.step}</span>
                <h3 className="font-bold text-white text-sm tracking-wide">{item.title}</h3>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3 — TCT PRODUCTS
          ========================================================================= */}
      <section id="products" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Core Offerings</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">TCT PRODUCTS</h2>
          <p className="text-gray-400 text-sm sm:text-base">Professional trading tools engineered for discipline and automation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Product 1: Trading Journal */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-gray-700 transition">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AVAILABLE
                </span>
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-white">TCT TRADING JOURNAL</h3>
              <p className="text-sm font-medium text-gray-300">Turn trading history into useful performance intelligence.</p>
              <p className="text-xs text-gray-400">Track, analyse and understand trading performance using structured journal data and analytics.</p>
              
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Granular Execution Metrics</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Session & Day Performance</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Automated Trading Insights</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Android App Intelligence</div>
              </div>
            </div>

            <Link href="/journal" className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-center text-sm transition">
              Explore Trading Journal
            </Link>
          </div>

          {/* Product 2: TCT Algo */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-gray-700 transition">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  AVAILABLE
                </span>
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-white">TCT ALGO</h3>
              <p className="text-sm font-medium text-blue-400">You choose the trade. TCT manages the execution.</p>
              <p className="text-xs text-gray-400">TCT Algo helps traders automate configured execution and position-management processes after the trader selects the trading level.</p>
              
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Multiple Take Profit targets</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Stop Loss & Risk control</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Automated Breakeven</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Trailing Stop management</div>
              </div>
            </div>

            <Link href="/algo" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-center text-sm transition">
              Explore TCT Algo
            </Link>
          </div>

          {/* Product 3: TCT Auto */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-gray-700 transition relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  COMING SOON
                </span>
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-white">TCT AUTO</h3>
              <p className="text-sm font-medium text-amber-400">From market analysis to structured execution.</p>
              <p className="text-xs text-gray-400">TCT Auto is the next-generation automation system being developed to analyse configured market conditions and identify candidate trading levels.</p>
              
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Liquidity Analysis</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Supply & Demand zones</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Market Structure detection</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Risk Validation rules</div>
              </div>
            </div>

            <Link href="/algo" className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl text-center text-sm transition">
              Explore TCT Auto
            </Link>
          </div>

          {/* Product 4: Build Your Own Algo */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-gray-700 transition">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  CUSTOM BUILD
                </span>
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-bold text-white">BUILD YOUR OWN ALGO</h3>
              <p className="text-sm font-medium text-purple-400">Your strategy. Your rules. Built into automation.</p>
              <p className="text-xs text-gray-400">Submit your requirements and TCT can review whether your repeatable strategy can be converted into an automated system.</p>
              
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Indian Markets & Stocks</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Forex MT5 automation</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Technical feasibility review</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Custom strategy logic</div>
              </div>
            </div>

            <Link href="/algo" className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-center text-sm transition">
              Submit Algo Requirements
            </Link>
          </div>

          {/* Product 5: TCT Library */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-gray-700 transition">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  AVAILABLE
                </span>
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-bold text-white">TCT LIBRARY</h3>
              <p className="text-sm font-medium text-emerald-400">Explore educational resources and trading documentation.</p>
              <p className="text-xs text-gray-400">Access curated educational materials, guides, trading documentation, and reference references in the library.</p>
              
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Educational guides & documentation</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Structured reference materials</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Trading concept explainers</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Resource downloads</div>
              </div>
            </div>

            <Link href="/library" className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-center text-sm transition">
              Explore Library
            </Link>
          </div>

          {/* Product 6: TCT Assistant */}
          <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:border-gray-700 transition">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  COMING SOON
                </span>
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-bold text-white">TCT ASSISTANT</h3>
              <p className="text-sm font-medium text-amber-400">Help across the TCT ecosystem.</p>
              <p className="text-xs text-gray-400">TCT Assistant is being designed to help users understand TCT products, education, account access and platform usage.</p>
              
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Product guidance</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Platform usage support</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Ecosystem navigation</div>
                <div className="text-xs text-gray-300 flex items-center gap-2">✓ Quick answers</div>
              </div>
            </div>

            <button disabled className="w-full py-3 bg-gray-800/50 text-gray-500 font-bold rounded-xl text-center text-sm cursor-not-allowed">
              Coming Soon
            </button>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4 — THREE AUTOMATION PATHS
          ========================================================================= */}
      <section className="py-20 bg-gray-900/50 border-y border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Automation Paths</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">CHOOSE THE AUTOMATION THAT FITS YOUR PROCESS</h2>
            <p className="text-gray-400 text-sm sm:text-base">Three distinct automation options tailored to your trading style.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Option 1 */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-blue-400 font-bold">OPTION 01</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">AVAILABLE</span>
                </div>
                <h3 className="text-2xl font-bold text-white">TCT ALGO</h3>
                <p className="text-sm font-semibold text-blue-400">I already know my trading level.</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  The trader analyses the market and chooses the entry level. TCT Algo manages configured execution and trade management.
                </p>
              </div>
              <Link href="/algo" className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-center text-sm transition">
                Explore TCT Algo
              </Link>
            </div>

            {/* Option 2 */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-amber-400 font-bold">OPTION 02</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">COMING SOON</span>
                </div>
                <h3 className="text-2xl font-bold text-white">TCT AUTO</h3>
                <p className="text-sm font-semibold text-amber-400">I want automated structured market analysis.</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  The system is being developed to identify candidate levels according to configured market conditions and rules.
                </p>
              </div>
              <Link href="/algo" className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-center text-sm transition">
                Explore TCT Auto
              </Link>
            </div>

            {/* Option 3 */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-purple-400 font-bold">OPTION 03</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">CUSTOM BUILD</span>
                </div>
                <h3 className="text-2xl font-bold text-white">BUILD YOUR OWN ALGO</h3>
                <p className="text-sm font-semibold text-purple-400">I already have my own strategy.</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Submit the strategy rules and TCT will review the technical feasibility for custom automation.
                </p>
              </div>
              <Link href="/algo" className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl text-center text-sm transition">
                Submit Requirements
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5 — WHY TCT (BUILT AROUND PROCESS)
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Philosophy</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">BUILT AROUND PROCESS</h2>
          <p className="text-gray-400 text-sm sm:text-base">Why professional traders rely on structured technology.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Structured Execution",
              desc: "Turn predefined trading decisions into repeatable execution processes without emotional interference."
            },
            {
              title: "Performance Review",
              desc: "Use trading journal data and granular metrics to understand historical performance and edge."
            },
            {
              title: "Automation",
              desc: "Automate repeatable execution and strategy rules where technically feasible."
            },
            {
              title: "Educational Library",
              desc: "Explore guides, reference files, and educational materials through the TCT Library."
            },
            {
              title: "Risk Awareness",
              desc: "Trading tools should support disciplined risk processes, not promise unrealistic outcomes."
            },
            {
              title: "Connected Ecosystem",
              desc: "Move smoothly from learning and planning to execution, tracking and improvement within one ecosystem."
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-sm">
                0{idx+1}
              </div>
              <h3 className="font-bold text-white text-lg">{item.title}</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

      </section>

      {/* =========================================================================
          SECTION 6 — HOW THE TCT ECOSYSTEM CONNECTS
          ========================================================================= */}
      <section className="py-16 bg-gray-900/50 border-y border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Connected Journey</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">HOW THE TCT ECOSYSTEM CONNECTS</h2>
            <p className="text-gray-400 text-sm">Seamless workflow integration across every phase of your trading journey.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-2">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Phase 1</span>
              <h3 className="font-bold text-white">LEARN</h3>
              <p className="text-xs text-gray-400">TCT Library</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-2">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Phase 2</span>
              <h3 className="font-bold text-white">EXECUTE</h3>
              <p className="text-xs text-gray-400">TCT Algo</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-2">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Phase 3</span>
              <h3 className="font-bold text-white">TRACK & ANALYSE</h3>
              <p className="text-xs text-gray-400">TCT Trading Journal</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl space-y-2">
              <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">Phase 4</span>
              <h3 className="font-bold text-white">AUTOMATE</h3>
              <p className="text-xs text-gray-400">TCT Auto / Build Your Own Algo</p>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 7 — LIBRARY PREVIEW
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Library & Resources</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">EXPLORE THE TCT LIBRARY</h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Access curated educational documentation, trading guides, concept explainers, and reference resources.
            </p>
          </div>
          <Link href="/library" className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl border border-gray-800 text-sm transition whitespace-nowrap">
            Open TCT Library
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            "Trading Guides",
            "Documentation",
            "Concept Explainers",
            "Reference Files",
            "Risk Frameworks",
            "Automation Specs"
          ].map((cat, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 p-4 rounded-2xl text-center space-y-1">
              <span className="text-lg">📁</span>
              <h3 className="font-bold text-white text-xs sm:text-sm">{cat}</h3>
            </div>
          ))}
        </div>

      </section>

      {/* =========================================================================
          SECTION 8 — MARKET WATCH PREVIEW
          ========================================================================= */}
      <section className="py-16 bg-gray-900/30 border-y border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Live Markets</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">MARKET WATCH</h2>
            <p className="text-gray-400 text-sm">
              Follow important economic and market information in one place to stay informed during sessions.
            </p>
          </div>
          <div>
            <Link href="/market-watch" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm transition shadow-lg shadow-blue-600/20">
              Open Market Watch
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9 — ARTICLES / LEARNING PREVIEW
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Insights & Articles</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">LATEST FROM TCT</h2>
            <p className="text-gray-400 text-sm sm:text-base">Read our latest articles on trading mechanics, automation, and risk management.</p>
          </div>
          <Link href="/articles" className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl border border-gray-800 text-sm transition whitespace-nowrap">
            View All Articles
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Structuring Your Daily Trading Process",
              desc: "How professional traders build repeatable routines from pre-market preparation to post-session review.",
              date: "Latest"
            },
            {
              title: "Understanding Order Execution and Risk",
              desc: "A technical breakdown of position management, stop loss parameters, and multiple take profit targets.",
              date: "Featured"
            },
            {
              title: "Introduction to Algorithmic Trade Management",
              desc: "Exploring how automated tools assist in managing execution without removing trader decision-making.",
              date: "Guide"
            }
          ].map((art, idx) => (
            <div key={idx} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <span className="text-xs font-mono text-blue-400 font-bold">{art.date}</span>
                <h3 className="font-bold text-white text-lg">{art.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{art.desc}</p>
              </div>
              <Link href="/articles" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Read Article →
              </Link>
            </div>
          ))}
        </div>

      </section>

      {/* =========================================================================
          SECTION 10 — FINAL CTA
          ========================================================================= */}
      <section className="py-20 bg-gradient-to-br from-blue-950 via-gray-900 to-gray-950 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          <div className="space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">BUILD A BETTER TRADING PROCESS</h2>
            <p className="text-gray-300 text-base sm:text-lg">Choose the tools that match the way you trade.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#products" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 text-sm transition">
              Explore Products
            </Link>
            <Link href="/library" className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-700 font-bold rounded-2xl text-sm transition">
              Explore Library
            </Link>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 11 — RISK / RESPONSIBILITY MESSAGE
          ========================================================================= */}
      <section className="py-8 bg-gray-950 border-t border-gray-900 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs text-gray-500 leading-relaxed">
            TCT provides trading technology, analytics, automation and educational tools. Trading involves risk, and no TCT product guarantees trading outcomes or profitability.
          </p>
        </div>
      </section>

    </div>
  );
}
