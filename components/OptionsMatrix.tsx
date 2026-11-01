'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  RefreshCw,
  Search,
  Activity,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface OptionMetrics {
  symbol: string;
  contractType: 'call' | 'put';
  oi: number;
  oiChange: number;
  oiChangePct: number;
  markPrice: number;
  volume: number;
  notional: number;
}

interface MatrixRow {
  strike: number;
  callOi: number;
  putOi: number;
  strikePcr: number;
  callBarPct: number;
  putBarPct: number;
  isItmCall: boolean;
  isItmPut: boolean;
  signals: string[];
  call: OptionMetrics | null;
  put: OptionMetrics | null;
}

interface OptionsSummary {
  totalCallOi: number;
  totalPutOi: number;
  totalCallOiNotional: number;
  totalPutOiNotional: number;
  overallPcr: number;
  sentiment: string;
  sentimentColor: 'emerald' | 'rose' | 'amber';
  maxPainStrike: number | null;
  callWallStrike: number | null;
  putSupportStrike: number | null;
  contractsCount: number;
}

interface OptionsApiResponse {
  success: boolean;
  asset: string;
  underlyingSpotPrice: number;
  selectedExpiry: string | null;
  availableExpiries: string[];
  summary: OptionsSummary;
  matrix: MatrixRow[];
  updatedAt: string;
  warning?: string;
  isStale?: boolean;
}

interface OptionsMatrixProps {
  initialAsset?: 'BTC' | 'ETH' | 'SOL';
  className?: string;
}

export default function OptionsMatrix({ initialAsset = 'BTC', className = '' }: OptionsMatrixProps) {
  const [asset, setAsset] = useState<'BTC' | 'ETH' | 'SOL'>(initialAsset);
  const [selectedExpiry, setSelectedExpiry] = useState<string>('');
  const [data, setData] = useState<OptionsApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(12);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const POLLING_INTERVAL_SEC = 12;
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          asset,
          ...(selectedExpiry ? { expiry: selectedExpiry } : {}),
        });

        const res = await fetch(`/api/options?${queryParams.toString()}`);

        if (res.status === 429) {
          setError('Delta Exchange API rate limit reached (429). Retrying on next cycle...');
          return;
        }

        if (!res.ok) {
          throw new Error(`Options feed HTTP error: ${res.status}`);
        }

        const json: OptionsApiResponse = await res.json();
        if (!json.success && (json as any).error) {
          throw new Error((json as any).error);
        }

        setData(json);
        setLastRefreshed(new Date());

        if (!selectedExpiry && json.availableExpiries && json.availableExpiries.length > 0) {
          setSelectedExpiry(json.selectedExpiry || json.availableExpiries[0]);
        }
      } catch (err: any) {
        console.error('Options Matrix Error:', err);
        setError(err.message || 'Unable to sync options matrix');
      } finally {
        if (!isBackground) setLoading(false);
        setCountdown(POLLING_INTERVAL_SEC);
      }
    },
    [asset, selectedExpiry]
  );

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      return;
    }

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : POLLING_INTERVAL_SEC));
    }, 1000);

    pollTimerRef.current = setInterval(() => {
      fetchData(true);
    }, POLLING_INTERVAL_SEC * 1000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [autoRefresh, fetchData]);

  const formatUSD = (num: number | undefined | null) => {
    if (!num && num !== 0) return '$0';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
    return `$${num.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (num: number | undefined | null, decimals = 2) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatPercentChange = (val: number | undefined | null) => {
    if (val === null || val === undefined) return '0.00%';
    const num = Number(val);
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  const filteredMatrix = useMemo(() => {
    if (!data?.matrix) return [];
    if (!searchFilter.trim()) return data.matrix;
    return data.matrix.filter((row) =>
      row.strike.toString().includes(searchFilter.trim())
    );
  }, [data?.matrix, searchFilter]);

  const summary = data?.summary;
  const spotPrice = data?.underlyingSpotPrice || 0;

  return (
    <div
      className={`w-full bg-[#0a0d14] text-slate-100 rounded-xl border border-slate-800 shadow-2xl p-4 md:p-6 font-sans ${className}`}
    >
      {/* Matrix Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                OPTIONS MARKET STRUCTURE MATRIX
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE
              </span>
              {data?.isStale && (
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  CACHED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Open Interest Distribution, PCR Sentiment & Volatility Walls via Delta Exchange India
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Asset Pills */}
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg">
            {(['BTC', 'ETH', 'SOL'] as const).map((token) => (
              <button
                key={token}
                onClick={() => {
                  setAsset(token);
                  setSelectedExpiry('');
                }}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all ${
                  asset === token
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {token}
              </button>
            ))}
          </div>

          {/* Expiry Selector */}
          <div className="relative">
            <select
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
              className="bg-slate-900 text-slate-200 text-xs font-mono border border-slate-800 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
            >
              {data?.availableExpiries && data.availableExpiries.length > 0 ? (
                data.availableExpiries.map((exp) => (
                  <option key={exp} value={exp}>
                    EXP: {exp}
                  </option>
                ))
              ) : (
                <option value="">No Expiry Data</option>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Polling & Refresh */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`w-2 h-2 rounded-full transition-all ${
                autoRefresh ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              }`}
              title={autoRefresh ? 'Auto-refresh active' : 'Auto-refresh paused'}
            />
            <span className="text-[11px] font-mono text-slate-400">
              {autoRefresh ? `${countdown}s` : 'PAUSED'}
            </span>
            <button
              onClick={() => fetchData(false)}
              disabled={loading}
              className="ml-1 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Manual refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Warning/Error Banner */}
      {error && (
        <div className="mt-3 p-3 bg-rose-950/40 border border-rose-500/30 rounded-lg flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchData(false)}
            className="px-2 py-0.5 bg-rose-900/60 hover:bg-rose-800 rounded font-semibold text-[11px] transition-colors"
          >
            Retry Now
          </button>
        </div>
      )}

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {/* Total Call OI */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>CALL OI NOTIONAL</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-semibold">
              CALLS
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-white">
              {formatUSD(summary?.totalCallOiNotional)}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {formatNumber(summary?.totalCallOi, 1)} contracts
            </div>
          </div>
        </div>

        {/* Total Put OI */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>PUT OI NOTIONAL</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono font-semibold">
              PUTS
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-white">
              {formatUSD(summary?.totalPutOiNotional)}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {formatNumber(summary?.totalPutOi, 1)} contracts
            </div>
          </div>
        </div>

        {/* Overall Put-Call Ratio (PCR) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between relative overflow-hidden">
          <div
            className={`absolute top-0 left-0 w-1 h-full ${
              (summary?.overallPcr ?? 1) < 0.7
                ? 'bg-emerald-500'
                : (summary?.overallPcr ?? 1) > 1.1
                ? 'bg-rose-500'
                : 'bg-amber-500'
            }`}
          />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>PUT / CALL RATIO</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                (summary?.overallPcr ?? 1) < 0.7
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : (summary?.overallPcr ?? 1) > 1.1
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {summary?.sentiment || 'NEUTRAL'}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-white">
              {summary?.overallPcr ? Number(summary.overallPcr).toFixed(3) : '0.000'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
              <span>Sentiment Bias:</span>
              <span className="text-slate-200 font-semibold">{summary?.sentiment}</span>
            </div>
          </div>
        </div>

        {/* Max Pain Strike */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>MAX PAIN STRIKE</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-semibold">
              PIN LEVEL
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-cyan-400">
              ${formatNumber(summary?.maxPainStrike, 0)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
              <span>Spot: ${formatNumber(spotPrice, 0)}</span>
              {summary?.maxPainStrike && spotPrice ? (
                <span className="text-slate-300">
                  {(((summary.maxPainStrike - spotPrice) / spotPrice) * 100).toFixed(1)}%
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Structure Key Levels Banner */}
      <div className="mt-3 py-2 px-3.5 bg-slate-900/60 border border-slate-800/80 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Call Wall (Resistance):</span>
            <span className="text-emerald-300 font-bold">
              ${formatNumber(summary?.callWallStrike, 0)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-slate-400">Put Support (Floor):</span>
            <span className="text-rose-300 font-bold">
              ${formatNumber(summary?.putSupportStrike, 0)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Strike..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 pl-6 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 w-32"
            />
            <Search className="w-3 h-3 text-slate-500 absolute left-1.5 top-1.5 pointer-events-none" />
          </div>
          {lastRefreshed && (
            <span className="text-[10px] text-slate-500">
              Synced: {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Options Chain Table Matrix */}
      <div className="mt-4 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60">
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <th
                  colSpan={3}
                  className="py-2.5 px-3 text-center text-emerald-400 border-r border-slate-800 font-bold tracking-wider"
                >
                  ◄ CALL OPTIONS (BULLISH)
                </th>
                <th
                  colSpan={3}
                  className="py-2.5 px-3 text-center text-cyan-400 border-r border-slate-800 font-bold tracking-wider"
                >
                  MARKET STRUCTURE & STRIKE
                </th>
                <th
                  colSpan={3}
                  className="py-2.5 px-3 text-center text-rose-400 font-bold tracking-wider"
                >
                  PUT OPTIONS (BEARISH) ►
                </th>
              </tr>
              <tr className="bg-slate-900/50 text-slate-400 text-[10px] border-b border-slate-800">
                <th className="py-2 px-3 text-left">Call OI Depth</th>
                <th className="py-2 px-3 text-right">Call OI (Contracts)</th>
                <th className="py-2 px-3 text-right border-r border-slate-800">24h OI Chg</th>

                <th className="py-2 px-2 text-center">Structure Signals</th>
                <th className="py-2 px-4 text-center font-bold text-white bg-slate-900/80">Strike ($)</th>
                <th className="py-2 px-2 text-center border-r border-slate-800">Strike PCR</th>

                <th className="py-2 px-3 text-left">24h OI Chg</th>
                <th className="py-2 px-3 text-left">Put OI (Contracts)</th>
                <th className="py-2 px-3 text-right">Put OI Depth</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/40">
              {loading && (!data?.matrix || data.matrix.length === 0) ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                      <span>Loading options contracts for {asset}...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMatrix.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No active options contracts found for {asset} on {selectedExpiry || 'selected date'}.
                  </td>
                </tr>
              ) : (
                filteredMatrix.map((row, idx) => {
                  const isCallWall = row.strike === summary?.callWallStrike;
                  const isPutSupport = row.strike === summary?.putSupportStrike;
                  const isMaxPain = row.strike === summary?.maxPainStrike;
                  const isSpotNearest =
                    spotPrice > 0 &&
                    filteredMatrix[idx - 1] &&
                    row.strike >= spotPrice &&
                    filteredMatrix[idx - 1].strike < spotPrice;

                  return (
                    <React.Fragment key={row.strike}>
                      {isSpotNearest && (
                        <tr className="bg-cyan-500/10 border-y-2 border-cyan-400/60">
                          <td
                            colSpan={9}
                            className="py-1 px-4 text-center text-cyan-300 font-bold text-[11px] tracking-wide"
                          >
                            ─── SPOT PRICE LEVEL: ${formatNumber(spotPrice, 2)} ───
                          </td>
                        </tr>
                      )}

                      <tr
                        className={`transition-colors hover:bg-slate-800/30 ${
                          row.isItmCall && row.isItmPut
                            ? 'bg-slate-900/40'
                            : row.isItmCall
                            ? 'bg-emerald-950/15'
                            : row.isItmPut
                            ? 'bg-rose-950/15'
                            : ''
                        }`}
                      >
                        <td className="py-2 px-3 w-32 relative">
                          <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded transition-all duration-500"
                              style={{ width: `${row.callBarPct}%` }}
                            />
                          </div>
                        </td>

                        <td className="py-2 px-3 text-right font-medium text-slate-200">
                          {formatNumber(row.callOi, 1)}
                        </td>

                        <td
                          className={`py-2 px-3 text-right border-r border-slate-800 ${
                            (row.call?.oiChangePct || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatPercentChange(row.call?.oiChangePct)}
                        </td>

                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {isCallWall && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                CALL WALL
                              </span>
                            )}
                            {isPutSupport && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                PUT SUPPORT
                              </span>
                            )}
                            {isMaxPain && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                MAX PAIN
                              </span>
                            )}
                          </div>
                        </td>

                        <td
                          className={`py-2 px-4 text-center font-bold text-sm bg-slate-900/60 ${
                            row.strike === summary?.maxPainStrike
                              ? 'text-cyan-400 ring-1 ring-cyan-500/50'
                              : 'text-white'
                          }`}
                        >
                          ${formatNumber(row.strike, 0)}
                        </td>

                        <td className="py-2 px-2 text-center text-slate-300 border-r border-slate-800">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              row.strikePcr > 1.5
                                ? 'bg-rose-500/10 text-rose-400'
                                : row.strikePcr < 0.6
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {row.strikePcr}
                          </span>
                        </td>

                        <td
                          className={`py-2 px-3 text-left ${
                            (row.put?.oiChangePct || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatPercentChange(row.put?.oiChangePct)}
                        </td>

                        <td className="py-2 px-3 text-left font-medium text-slate-200">
                          {formatNumber(row.putOi, 1)}
                        </td>

                        <td className="py-2 px-3 w-32 relative text-right">
                          <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                            <div
                              className="bg-rose-500 h-full rounded transition-all duration-500"
                              style={{ width: `${row.putBarPct}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer & Legend */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-emerald-950/60 border border-emerald-500/40" />
            <span>Call ITM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-2 rounded bg-rose-950/60 border border-rose-500/40" />
            <span>Put ITM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
            <span>Call Wall (Resistance)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500" />
            <span>Put Support (Floor)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
            <span>Max Pain Strike</span>
          </div>
        </div>

        <div className="text-slate-500">
          Feed: Delta Exchange REST v2 | Polling: 12s | Server-Side Proxy
        </div>
      </div>
    </div>
  );
}
