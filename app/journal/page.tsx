// The-corporate-trader-main/app/journal/page.tsx
'use client';

import React from 'react';

export default function JournalPage() {
  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-16 text-gray-900">
      
      {/* Header Section */}
      <div className="text-center space-y-4">
        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Mobile Trading Intelligence
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight">Inside The Corporate Trader App</h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Transform your raw data into professional-grade analytics. Designed specifically for Android, our mobile app gives you complete visibility over your edge, risk metrics, and session performance.
        </p>
      </div>

      {/* Google Play Store Banner */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-blue-950 text-white p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-900/50">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-block bg-blue-600 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Android App Release
          </div>
          <h2 className="text-3xl font-bold">Get Ready to Trade Smarter on Mobile</h2>
          <p className="text-blue-200 text-sm md:text-base max-w-lg">
            Track executions, inspect cumulative performance trajectories, and review your trading psychology directly from your pocket.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="px-6 py-4 bg-gray-900 text-gray-200 font-medium rounded-2xl border border-gray-700 shadow-xl flex items-center gap-4 hover:border-blue-500 transition cursor-not-allowed">
            <svg className="w-8 h-8 fill-blue-500" viewBox="0 0 24 24">
              <path d="M3.609 1.814L13.792 12 3.61 22.186a1.5 1.5 0 0 1-2.454-1.145V2.959a1.5 1.5 0 0 1 2.453-1.145zM15.207 13.414l2.293 2.293-11.5 6.635a1.5 1.5 0 0 0 2.212 1.312l11.085-6.398-4.09-4.842zm0-2.828L19.3 5.744a1.5 1.5 0 0 0-2.213-1.312l-11.085 6.398 4.09 4.842 5.115-5.258z" />
            </svg>
            <div className="text-left">
              <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">Google Play Store</div>
              <div className="text-lg font-bold tracking-tight text-white">Coming Soon</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Showcase Grid */}
      <div className="space-y-12">
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold">Powerful Analytics Engine</h2>
          <p className="text-gray-600 text-sm">Every core metric you need to evaluate long-term profitability and risk exposure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Core Metrics */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-lg">📊</div>
            <h3 className="text-lg font-semibold">Granular Execution Metrics</h3>
            <p className="text-sm text-gray-600">
              Instantly monitor your Net Result, Win Rate, Profit Factor, Expectancy per Trade, and Max Drawdown across all logged operations.
            </p>
          </div>

          {/* Card 2: Session & Day Breakdown */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg">⏰</div>
            <h3 className="text-lg font-semibold">Session & Day Performance</h3>
            <p className="text-sm text-gray-600">
              Pinpoint exactly when you perform best by analyzing profitability across the London / New York Overlap, standard market sessions, and specific weekdays.
            </p>
          </div>

          {/* Card 3: Tag & Strategy Analysis */}
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4 hover:shadow-md transition">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg">🏷️</div>
            <h3 className="text-lg font-semibold">Tag & Setup Breakdowns</h3>
            <p className="text-sm text-gray-600">
              Evaluate specific trade categories like #News, #Breakout, and #Reversal to see which strategies generate your highest cumulative returns.
            </p>
          </div>

        </div>
      </div>

      {/* Intelligence & Rating Highlights */}
      <div className="bg-gray-50 p-8 rounded-3xl border space-y-8">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Psychology & Insights</span>
          <h2 className="text-2xl font-bold mt-1">Automated Trading Insights & Ratings</h2>
          <p className="text-gray-600 text-sm">The app doesn't just store data; it actively coaches your trading discipline.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              💡 Automated Trading Insights
            </h4>
            <p className="text-sm text-gray-600">
              Receive smart summaries highlighting your strongest session performance, winning instruments, and average loss profiles automatically generated after every batch of logs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              ⭐ Performance Rating Matrix
            </h4>
            <p className="text-sm text-gray-600">
              Score your Risk-to-Reward (R/R), Risk Exposure, and Execution Discipline with structured star ratings to maintain strict risk parameters.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
