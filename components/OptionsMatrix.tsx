'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  RefreshCw,
  Search,
  Activity,
  Calendar,
  AlertTriangle,
  Shield,
  Layers,
  Compass,
  BarChart2,
  Check,
  Clock,
} from 'lucide-react';

interface OptionMetrics {
  symbol: string;
  contractType: 'call' | 'put';
  oi: number;
  oiChange: number;
  oiChangePct: number;
  markPrice: number;
  volume: number;
  volumeChangePct?: number;
  notional: number;
}

interface MatrixRow {
  strike: number;
  callOi: number;
  putOi: number;
  callVolume: number;
  putVolume: number;
  strikePcr: number;
  volumePcr: number;
  callBarPct: number;
  putBarPct: number;
  callVolBarPct?: number;
  putVolBarPct?: number;
  isItmCall: boolean;
  isItmPut: boolean;
  signals: string[];
  call: OptionMetrics | null;
  put: OptionMetrics | null;
}

interface OptionsSummary {
  totalCallOi: number;
  totalPutOi: number;
  totalCallVolume?: number;
  totalPutVolume?: number;
  totalCallOiNotional: number;
  totalPutOiNotional: number;
  overallPcr: number;
  overallVolumePcr?: number;
  sentiment: string;
  sentimentColor: 'emerald' | 'rose' | 'amber';
  pcrDescription: string;
  positionBuilding: string;
  maxPainStrike: number | null;
  nearestResistance: number | null;
  strongestResistance: number | null;
  nearestSupport: number | null;
  strongestSupport: number | null;
  contractsCount: number;
}

interface OptionsApiResponse {
  success: boolean;
  asset: string;
  underlyingSpotPrice: number;
  selectedExpiries?: string[];
  selectedExpiry?: string | null;
  availableExpiries: string[];
  summary: OptionsSummary;
  matrix: MatrixRow[];
  updatedAt: string;
  warning?: string;
  isStale?: boolean;
}

interface OptionsMatrixProps {
  initialAsset?: 'BTC' | 'ETH' | 'SOL' | 'XAUT';
  className?: string;
}

export default function OptionsMatrix({ initialAsset = 'BTC', className = '' }: OptionsMatrixProps) {
  const [asset, setAsset] = useState<'BTC' | 'ETH' | 'SOL' | 'XAUT'>(initialAsset);
  const [selectedExpiries, setSelectedExpiries] = useState<string[]>([]);
  const [expiryDropdownOpen, setExpiryDropdownOpen] = useState<boolean>(false);
  const [matrixViewMode, setMatrixViewMode] = useState<'all' | 'oi' | 'volume'>('all');
  const [timeframe, setTimeframe] = useState<'15m' | '1h' | '2h' | '4h' | '12h'>('1h');
  const [activeDiagram, setActiveDiagram] = useState<'corridor' | 'oi-shift' | 'volume-surge' | 'pcr-curve'>('corridor');

  const [data, setData] = useState<OptionsApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(10);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const POLLING_INTERVAL_SEC = 10;
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Auto-select nearest 2 expiries by default
  useEffect(() => {
    if (data?.availableExpiries && data.availableExpiries.length > 0 && selectedExpiries.length === 0) {
      setSelectedExpiries(data.availableExpiries.slice(0, 2));
    }
  }, [data?.availableExpiries, selectedExpiries.length]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExpiryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          asset,
          timeframe,
          ...(selectedExpiries.length > 0 ? { expiry: selectedExpiries.slice(0, 3).join(',') } : {}),
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
      } catch (err: any) {
        console.error('Options Matrix Error:', err);
        setError(err.message || 'Unable to sync options matrix');
      } finally {
        if (!isBackground) setLoading(false);
        setCountdown(POLLING_INTERVAL_SEC);
      }
    },
    [asset, selectedExpiries, timeframe]
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

  const toggleExpiry = (exp: string) => {
    setSelectedExpiries((prev) => {
      if (prev.includes(exp)) {
        const next = prev.filter((item) => item !== exp);
        return next.length === 0 && data?.availableExpiries?.length ? [data.availableExpiries[0]] : next;
      } else {
        if (prev.length >= 3) {
          return [...prev.slice(1), exp];
        }
        return [...prev, exp];
      }
    });
  };

  const selectTopThreeExpiries = () => {
    if (data?.availableExpiries) {
      setSelectedExpiries(data.availableExpiries.slice(0, 3));
    }
  };

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

  const flowAnalytics = useMemo(() => {
    if (!data?.matrix || data.matrix.length === 0) return null;

    let netCallOiChange = 0;
    let netPutOiChange = 0;
    let topCallAdditionStrike: number | null = null;
    let topPutAdditionStrike: number | null = null;
    let topCallVolumeStrike: number | null = null;
    let topPutVolumeStrike: number | null = null;
    let maxCallChg = -Infinity;
    let maxPutChg = -Infinity;
    let maxCallVol = -Infinity;
    let maxPutVol = -Infinity;

    for (const r of data.matrix) {
      const cChg = r.call?.oiChangePct || 0;
      const pChg = r.put?.oiChangePct || 0;
      const cVol = r.callVolume || 0;
      const pVol = r.putVolume || 0;

      netCallOiChange += cChg;
      netPutOiChange += pChg;

      if (cChg > maxCallChg) {
        maxCallChg = cChg;
        topCallAdditionStrike = r.strike;
      }
      if (pChg > maxPutChg) {
        maxPutChg = pChg;
        topPutAdditionStrike = r.strike;
      }
      if (cVol > maxCallVol) {
        maxCallVol = cVol;
        topCallVolumeStrike = r.strike;
      }
      if (pVol > maxPutVol) {
        maxPutVol = pVol;
        topPutVolumeStrike = r.strike;
      }
    }

    const netOiVelocity = netPutOiChange - netCallOiChange;
    const flowDirection =
      netOiVelocity > 5
        ? 'BULLISH FLOW (Put Writing / Support Defense)'
        : netOiVelocity < -5
        ? 'BEARISH FLOW (Call Writing / Overhead Capping)'
        : 'NEUTRAL ACCUMULATION';

    return {
      netCallOiChange,
      netPutOiChange,
      topCallAdditionStrike,
      topPutAdditionStrike,
      topCallVolumeStrike,
      topPutVolumeStrike,
      flowDirection,
      netOiVelocity,
    };
  }, [data?.matrix]);

  const marketAnalysis = useMemo(() => {
    if (!summary || !spotPrice || spotPrice === 0) return null;

    const overallPcr = summary.overallPcr;
    const volPcr = summary.overallVolumePcr || overallPcr;
    const netVelocity = flowAnalytics?.netOiVelocity || 0;
    const nearestSup = summary.nearestSupport || spotPrice * 0.98;
    const nearestRes = summary.nearestResistance || spotPrice * 1.02;
    const strongestSup = summary.strongestSupport || spotPrice * 0.95;
    const strongestRes = summary.strongestResistance || spotPrice * 1.05;
    const maxPain = summary.maxPainStrike || spotPrice;

    let bullishProb = 33;
    let bearishProb = 33;
    let rangeProb = 34;

    if (overallPcr < 0.70) {
      bullishProb += 28;
      bearishProb -= 18;
      rangeProb -= 10;
    } else if (overallPcr > 1.25) {
      bearishProb += 28;
      bullishProb -= 18;
      rangeProb -= 10;
    } else {
      rangeProb += 25;
      bullishProb -= 12;
      bearishProb -= 13;
    }

    if (netVelocity > 5) {
      bullishProb += 12;
      bearishProb -= 8;
      rangeProb -= 4;
    } else if (netVelocity < -5) {
      bearishProb += 12;
      bullishProb -= 8;
      rangeProb -= 4;
    }

    if (volPcr > 1.1) {
      bullishProb += 6;
      bearishProb -= 4;
      rangeProb -= 2;
    } else if (volPcr < 0.7) {
      bearishProb += 6;
      bullishProb -= 4;
      rangeProb -= 2;
    }

    const totalRaw = Math.max(1, bullishProb + bearishProb + rangeProb);
    bullishProb = Math.round((bullishProb / totalRaw) * 100);
    bearishProb = Math.round((bearishProb / totalRaw) * 100);
    rangeProb = 100 - (bullishProb + bearishProb);

    const primaryDirection =
      bullishProb > bearishProb && bullishProb > rangeProb
        ? 'BULLISH EXPANSION'
        : bearishProb > bullishProb && bearishProb > rangeProb
        ? 'BEARISH ABSORPTION'
        : 'RANGEBOUND PINNING';

    const recentBehavior =
      netVelocity > 4
        ? `Aggressive Put writing observed over the last ${timeframe} (${flowAnalytics?.netPutOiChange.toFixed(1)}% vs ${flowAnalytics?.netCallOiChange.toFixed(1)}% Calls). Market makers are building floor bids, defending $${formatNumber(nearestSup, 0)} against dips.`
        : netVelocity < -4
        ? `Call writers actively capping overhead over the last ${timeframe} (Call OI additions outpaced Puts by ${Math.abs(netVelocity).toFixed(1)}%). Overhead supply is compressing price below $${formatNumber(nearestRes, 0)}.`
        : `Balanced intraday activity over the last ${timeframe}. Neither Call nor Put flow has triggered directional skew; order flow is executing within the existing corridor.`;

    const dailyBaseline = `Major liquidity rests between Put Floor at $${formatNumber(strongestSup, 0)} and Call Ceiling at $${formatNumber(strongestRes, 0)}. With Overall PCR at ${overallPcr.toFixed(2)}, total daily Open Interest indicates ${
      overallPcr < 0.8
        ? 'underlying institutional preference for upward expansion with low demand for protective put structures.'
        : overallPcr > 1.2
        ? 'heavy downside insurance buying, showing institutional positioning for defensive hedging.'
        : 'neutral positioning with dealer gamma balanced across equidistant wings.'
    }`;

    const combinedCount = selectedExpiries.length;
    const combinedExpiryThesis = `Aggregating ${combinedCount} near-term expirations highlights a primary gravitational pin at Max Pain $${formatNumber(maxPain, 0)}. Spot ($${formatNumber(spotPrice, 0)}) is positioned ${
      spotPrice > maxPain
        ? `+${(((spotPrice - maxPain) / spotPrice) * 100).toFixed(1)}% above Max Pain, suggesting gravitational pull or theta decay pressure toward the strike before settlements.`
        : spotPrice < maxPain
        ? `-${(((maxPain - spotPrice) / spotPrice) * 100).toFixed(1)}% below Max Pain, indicating positive dealer delta push toward the strike into expiry.`
        : 'directly at the Max Pain strike equilibrium.'
    }`;

    return {
      bullishProb,
      bearishProb,
      rangeProb,
      primaryDirection,
      recentBehavior,
      dailyBaseline,
      combinedExpiryThesis,
      nearestSup,
      nearestRes,
      strongestSup,
      strongestRes,
      maxPain,
      overallPcr,
      volPcr,
      combinedCount,
    };
  }, [summary, spotPrice, flowAnalytics, timeframe, selectedExpiries]);

  const tunnelPosition = useMemo(() => {
    const minBound = summary?.strongestSupport || spotPrice * 0.95;
    const maxBound = summary?.strongestResistance || spotPrice * 1.05;
    if (maxBound <= minBound) return 50;
    const pos = ((spotPrice - minBound) / (maxBound - minBound)) * 100;
    return Math.max(4, Math.min(96, Math.round(pos)));
  }, [summary?.strongestSupport, summary?.strongestResistance, spotPrice]);

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
                OPTIONS MARKET STRUCTURE & PROBABILITY RADAR
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
              Directional Probabilities, Multi-Expiry Aggregation, Strike Volume vs. Open Interest Flow via Delta Exchange Feed
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Asset Switcher */}
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg">
            {(['BTC', 'ETH', 'SOL', 'XAUT'] as const).map((token) => (
              <button
                key={token}
                onClick={() => {
                  setAsset(token);
                  setSelectedExpiries([]);
                }}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-md transition-all ${
                  asset === token
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {token === 'XAUT' ? 'XAUT (Gold)' : token}
              </button>
            ))}
          </div>

          {/* Timeframe Selector */}
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg items-center">
            <span className="text-[10px] text-slate-500 font-mono px-1 flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-cyan-400" />
            </span>
            {(['15m', '1h', '2h', '4h', '12h'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-[11px] font-mono font-bold rounded transition-all ${
                  timeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Track shifts over the last ${tf}`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Multi-Expiry Selector Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setExpiryDropdownOpen(!expiryDropdownOpen)}
              className="flex items-center gap-2 bg-slate-900 text-slate-200 text-xs font-mono border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {selectedExpiries.length === 0
                  ? 'Select Expiry'
                  : selectedExpiries.length === 1
                  ? `EXP: ${selectedExpiries[0]}`
                  : `Combined ${selectedExpiries.length} Expiries (Max 3)`}
              </span>
              <span className="text-slate-500 text-[10px]">▼</span>
            </button>

            {expiryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-lg shadow-2xl p-2 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                  <span>Combine Near-Term (Max 3):</span>
                  <button
                    onClick={selectTopThreeExpiries}
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    Next 3 Dates
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {data?.availableExpiries && data.availableExpiries.length > 0 ? (
                    data.availableExpiries.map((exp) => {
                      const isSelected = selectedExpiries.includes(exp);
                      return (
                        <button
                          key={exp}
                          onClick={() => toggleExpiry(exp)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono transition-colors ${
                            isSelected
                              ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/40'
                              : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                          }`}
                        >
                          <span>{exp}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-500 p-2">No expiries found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Matrix View Toggle */}
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg">
            {(['all', 'oi', 'volume'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setMatrixViewMode(mode)}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase font-semibold rounded ${
                  matrixViewMode === mode
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'all' ? 'Combined' : mode.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Refresh Controls */}
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

      {/* Active Expiries Pill Bar */}
      {selectedExpiries.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <span className="text-slate-500 mr-1">Combined Expiries (2-3 Max):</span>
          {selectedExpiries.map((exp) => (
            <span
              key={exp}
              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 flex items-center gap-1"
            >
              {exp}
              {selectedExpiries.length > 1 && (
                <button
                  onClick={() => toggleExpiry(exp)}
                  className="hover:text-rose-400 ml-0.5"
                >
                  ×
                </button>
              )}
            </span>
          ))}
          <span className="text-slate-400 font-semibold ml-1">
            (Unified Open Interest & Volume flow for near-term settlement)
          </span>
        </div>
      )}

      {/* 1. MARKET DIRECTIONAL PROBABILITY & STRUCTURAL HORIZONS */}
      {marketAnalysis && (
        <div className="mt-4 p-4 bg-gradient-to-r from-slate-950 via-[#0d121c] to-slate-950 border border-cyan-500/40 rounded-xl font-mono shadow-lg">
          {/* Top Probability Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
                MARKET DIRECTION PROBABILITY & DATA BEHAVIOR ({asset})
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-black rounded ${
                  marketAnalysis.primaryDirection.includes('BULLISH')
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : marketAnalysis.primaryDirection.includes('BEARISH')
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {marketAnalysis.primaryDirection}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                OI PCR: <strong className="text-cyan-400">{marketAnalysis.overallPcr.toFixed(2)}</strong>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                Vol PCR: <strong className="text-amber-400">{marketAnalysis.volPcr.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          {/* Probability Gauge Bar */}
          <div className="my-3">
            <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
              <span className="text-emerald-400 flex items-center gap-1">
                <span>▲ Upward Continuation:</span>
                <span className="text-sm font-extrabold">{marketAnalysis.bullishProb}%</span>
              </span>
              <span className="text-amber-300 flex items-center gap-1">
                <span>◆ Rangebound / Pin:</span>
                <span className="text-sm font-extrabold">{marketAnalysis.rangeProb}%</span>
              </span>
              <span className="text-rose-400 flex items-center gap-1">
                <span>▼ Downward Rejection:</span>
                <span className="text-sm font-extrabold">{marketAnalysis.bearishProb}%</span>
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full border border-slate-800 flex overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-700"
                style={{ width: `${marketAnalysis.bullishProb}%` }}
                title={`Bullish: ${marketAnalysis.bullishProb}%`}
              />
              <div
                className="bg-amber-500 h-full transition-all duration-700"
                style={{ width: `${marketAnalysis.rangeProb}%` }}
                title={`Rangebound: ${marketAnalysis.rangeProb}%`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-700"
                style={{ width: `${marketAnalysis.bearishProb}%` }}
                title={`Bearish: ${marketAnalysis.bearishProb}%`}
              />
            </div>
          </div>

          {/* 3 Horizon Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-cyan-400 uppercase font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Intraday Flow (Last {timeframe})
                </div>
                <div className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  {marketAnalysis.recentBehavior}
                </div>
              </div>
              <div className="text-[9px] text-slate-500 mt-2 pt-1 border-t border-slate-900">
                Source: Real-time Delta contract addition rate
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-amber-400 uppercase font-semibold flex items-center gap-1">
                  <BarChart2 className="w-3 h-3" /> Daily Structural Baseline
                </div>
                <div className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  {marketAnalysis.dailyBaseline}
                </div>
              </div>
              <div className="text-[9px] text-slate-500 mt-2 pt-1 border-t border-slate-900">
                Levels: Floor ${formatNumber(marketAnalysis.strongestSup, 0)} | Wall ${formatNumber(marketAnalysis.strongestRes, 0)}
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-emerald-400 uppercase font-semibold flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Combined Expiry Pin ({marketAnalysis.combinedCount} Dates)
                </div>
                <div className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  {marketAnalysis.combinedExpiryThesis}
                </div>
              </div>
              <div className="text-[9px] text-slate-500 mt-2 pt-1 border-t border-slate-900">
                Max Pain: ${formatNumber(marketAnalysis.maxPain, 0)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. OVERVIEW METRIC CARDS */}
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
              (summary?.overallPcr ?? 1) < 0.8
                ? 'bg-emerald-500'
                : (summary?.overallPcr ?? 1) > 1.15
                ? 'bg-rose-500'
                : 'bg-amber-500'
            }`}
          />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>PUT / CALL RATIO</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                (summary?.overallPcr ?? 1) < 0.8
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : (summary?.overallPcr ?? 1) > 1.15
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
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 leading-tight truncate">
              {summary?.pcrDescription || 'Balanced distribution'}
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
              ${formatNumber(summary?.maxPainStrike, asset === 'XAUT' ? 1 : 0)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center justify-between">
              <span>Spot: ${formatNumber(spotPrice, asset === 'XAUT' ? 1 : 0)}</span>
              {summary?.maxPainStrike && spotPrice ? (
                <span className="text-slate-300">
                  {(((summary.maxPainStrike - spotPrice) / spotPrice) * 100).toFixed(1)}%
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE DIAGRAMS HUB */}
      <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800/80 gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              {activeDiagram === 'corridor' && 'Market Structure Corridor (S/R Tunnel)'}
              {activeDiagram === 'oi-shift' && `Recent Open Interest Shift (${timeframe})`}
              {activeDiagram === 'volume-surge' && `Strike Volume Surge Flow (${timeframe})`}
              {activeDiagram === 'pcr-curve' && 'Strike-Level PCR Curve & S/R Pinning'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Horizon: {timeframe}
            </span>
          </div>

          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveDiagram('corridor')}
              className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded transition-all ${
                activeDiagram === 'corridor'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              S/R Corridor
            </button>
            <button
              onClick={() => setActiveDiagram('oi-shift')}
              className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded transition-all ${
                activeDiagram === 'oi-shift'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              OI Shift
            </button>
            <button
              onClick={() => setActiveDiagram('volume-surge')}
              className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded transition-all ${
                activeDiagram === 'volume-surge'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Volume Surge
            </button>
            <button
              onClick={() => setActiveDiagram('pcr-curve')}
              className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded transition-all ${
                activeDiagram === 'pcr-curve'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Strike PCR Curve
            </button>
          </div>
        </div>

        {/* VIEW 1: CORRIDOR S/R TUNNEL */}
        {activeDiagram === 'corridor' && (
          <div className="w-full px-2">
            <div className="relative w-full h-4 bg-slate-950 rounded-full border border-slate-800 flex items-center my-6">
              <div className="absolute left-0 w-1/4 h-full bg-rose-500/20 rounded-l-full" />
              <div className="absolute right-0 w-1/4 h-full bg-emerald-500/20 rounded-r-full" />
              {summary?.maxPainStrike && (
                <div
                  className="absolute w-1.5 h-6 bg-cyan-400 rounded-sm z-10 shadow-lg shadow-cyan-500/50 -top-1"
                  style={{ left: '50%' }}
                  title={`Max Pain: $${formatNumber(summary.maxPainStrike, 0)}`}
                />
              )}
              <div
                className="absolute -top-3.5 transition-all duration-700 z-20 flex flex-col items-center -ml-3"
                style={{ left: `${tunnelPosition}%` }}
              >
                <div className="px-2 py-0.5 rounded bg-cyan-400 text-slate-950 font-mono font-black text-[10px] shadow-lg shadow-cyan-400/40 whitespace-nowrap">
                  SPOT ${formatNumber(spotPrice, 0)}
                </div>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-cyan-400" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-4 text-center font-mono">
              <div className="p-2 bg-rose-950/20 border border-rose-500/30 rounded-lg">
                <div className="text-[10px] text-rose-400 font-bold uppercase flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" /> Strongest Floor (PCR)
                </div>
                <div className="text-sm font-black text-rose-300 mt-0.5">
                  ${formatNumber(summary?.strongestSupport, asset === 'XAUT' ? 1 : 0)}
                </div>
                <div className="text-[9px] text-slate-500">Max Put PCR Inflow</div>
              </div>

              <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Nearest Support (PCR)</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">
                  ${formatNumber(summary?.nearestSupport, asset === 'XAUT' ? 1 : 0)}
                </div>
                <div className="text-[9px] text-slate-500">First Put Bid Cluster</div>
              </div>

              <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Nearest Resistance (PCR)</div>
                <div className="text-sm font-bold text-slate-200 mt-0.5">
                  ${formatNumber(summary?.nearestResistance, asset === 'XAUT' ? 1 : 0)}
                </div>
                <div className="text-[9px] text-slate-500">First Call Cap</div>
              </div>

              <div className="p-2 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
                <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center justify-center gap-1">
                  <Layers className="w-3 h-3" /> Strongest Ceiling (PCR)
                </div>
                <div className="text-sm font-black text-emerald-300 mt-0.5">
                  ${formatNumber(summary?.strongestResistance, asset === 'XAUT' ? 1 : 0)}
                </div>
                <div className="text-[9px] text-slate-500">Min PCR / Heavy Call Wall</div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: OI SHIFT */}
        {activeDiagram === 'oi-shift' && (
          <div className="w-full">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Call OI Additions
              </span>
              <span className="text-slate-500">
                Strike Distribution across {timeframe} Lookback
              </span>
              <span className="text-rose-400 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block" /> Put OI Additions
              </span>
            </div>
            <div className="h-44 w-full bg-slate-900/40 rounded-lg p-2 flex items-end gap-1.5 overflow-x-auto">
              {filteredMatrix.map((r) => {
                const callChg = Math.max(0, r.call?.oiChangePct || 0);
                const putChg = Math.max(0, r.put?.oiChangePct || 0);
                const maxChg = Math.max(1, ...filteredMatrix.map(m => Math.max(m.call?.oiChangePct || 0, m.put?.oiChangePct || 0)));
                const callHeight = Math.min(100, Math.round((callChg / maxChg) * 100));
                const putHeight = Math.min(100, Math.round((putChg / maxChg) * 100));
                const isSpot = spotPrice > 0 && Math.abs(r.strike - spotPrice) <= (filteredMatrix[1]?.strike - filteredMatrix[0]?.strike || 500);

                return (
                  <div key={r.strike} className="flex-1 min-w-[36px] flex flex-col items-center h-full justify-end group relative">
                    <div className="w-full flex items-end justify-center gap-0.5 h-32 mb-1">
                      <div
                        className="w-1/2 bg-emerald-500/80 rounded-t transition-all duration-500 group-hover:bg-emerald-400"
                        style={{ height: `${callHeight || 4}%` }}
                        title={`Call OI Δ: +${callChg.toFixed(1)}%`}
                      />
                      <div
                        className="w-1/2 bg-rose-500/80 rounded-t transition-all duration-500 group-hover:bg-rose-400"
                        style={{ height: `${putHeight || 4}%` }}
                        title={`Put OI Δ: +${putChg.toFixed(1)}%`}
                      />
                    </div>
                    <span className={`text-[9px] font-mono whitespace-nowrap ${isSpot ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                      ${formatNumber(r.strike, 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 3: VOLUME SURGE */}
        {activeDiagram === 'volume-surge' && (
          <div className="w-full">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
              <span className="text-cyan-400">Call Volume Flow</span>
              <span className="text-slate-500">Normalized Trading Intensity ({timeframe})</span>
              <span className="text-amber-400">Put Volume Flow</span>
            </div>
            <div className="h-44 w-full bg-slate-900/40 rounded-lg p-2 flex items-end gap-1.5 overflow-x-auto">
              {filteredMatrix.map((r) => {
                const maxVol = Math.max(1, ...filteredMatrix.map(m => Math.max(m.callVolume, m.putVolume)));
                const callHeight = Math.min(100, Math.round((r.callVolume / maxVol) * 100));
                const putHeight = Math.min(100, Math.round((r.putVolume / maxVol) * 100));
                const isSpot = spotPrice > 0 && Math.abs(r.strike - spotPrice) <= (filteredMatrix[1]?.strike - filteredMatrix[0]?.strike || 500);

                return (
                  <div key={r.strike} className="flex-1 min-w-[36px] flex flex-col items-center h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-0.5 h-32 mb-1">
                      <div
                        className="w-1/2 bg-cyan-500/80 rounded-t transition-all duration-500 group-hover:bg-cyan-300"
                        style={{ height: `${callHeight || 4}%` }}
                        title={`Call Vol: ${r.callVolume}`}
                      />
                      <div
                        className="w-1/2 bg-amber-500/80 rounded-t transition-all duration-500 group-hover:bg-amber-300"
                        style={{ height: `${putHeight || 4}%` }}
                        title={`Put Vol: ${r.putVolume}`}
                      />
                    </div>
                    <span className={`text-[9px] font-mono whitespace-nowrap ${isSpot ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                      ${formatNumber(r.strike, 0)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 4: PCR CURVE */}
        {activeDiagram === 'pcr-curve' && (
          <div className="w-full">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
              <span className="text-rose-400 font-semibold">▲ High PCR (&gt;1.4): Put Support Floor</span>
              <span className="text-slate-500">Strike-Level PCR Curve with S/R Pinning</span>
              <span className="text-emerald-400 font-semibold">▼ Low PCR (&lt;0.6): Call Resistance Wall</span>
            </div>
            <div className="h-44 w-full bg-slate-900/40 rounded-lg p-2 relative flex items-center justify-center">
              {filteredMatrix.length > 1 ? (
                <svg className="w-full h-36" viewBox={`0 0 ${filteredMatrix.length * 50} 100`} preserveAspectRatio="none">
                  <line x1="0" y1="50" x2={filteredMatrix.length * 50} y2="50" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
                  <polyline
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="2.5"
                    points={filteredMatrix
                      .map((r, i) => {
                        const x = i * 50 + 25;
                        const clampedPcr = Math.min(2.5, Math.max(0, r.strikePcr));
                        const y = 85 - (clampedPcr / 2.5) * 70;
                        return `${x},${y.toFixed(1)}`;
                      })
                      .join(' ')}
                  />
                  {filteredMatrix.map((r, i) => {
                    const x = i * 50 + 25;
                    const clampedPcr = Math.min(2.5, Math.max(0, r.strikePcr));
                    const y = 85 - (clampedPcr / 2.5) * 70;
                    const isStrongestRes = r.strike === summary?.strongestResistance;
                    const isStrongestSup = r.strike === summary?.strongestSupport;

                    return (
                      <g key={r.strike}>
                        <circle
                          cx={x}
                          cy={y}
                          r={isStrongestRes || isStrongestSup ? 5 : 3}
                          fill={isStrongestRes ? '#10b981' : isStrongestSup ? '#f43f5e' : '#22d3ee'}
                        />
                        {isStrongestRes && (
                          <text x={x} y={y - 8} fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                            STRONG RES (${r.strike})
                          </text>
                        )}
                        {isStrongestSup && (
                          <text x={x} y={y + 16} fill="#f43f5e" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                            STRONG SUP (${r.strike})
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="text-xs text-slate-500 font-mono">Insufficient strike points for curve rendering</div>
              )}
            </div>
            <div className="flex justify-between px-2 mt-1 text-[9px] font-mono text-slate-500">
              <span>Low Strikes (Oversold Puts)</span>
              <span>At-The-Money (Equilibrium)</span>
              <span>High Strikes (Overbought Calls)</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. OPTIONS CHAIN TABLE MATRIX */}
      <div className="mt-4 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60 shadow-xl">
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead className="sticky top-0 z-30 shadow-md">
              <tr className="bg-[#0b101b] text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <th
                  colSpan={matrixViewMode === 'all' ? 4 : 3}
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
                  colSpan={matrixViewMode === 'all' ? 4 : 3}
                  className="py-2.5 px-3 text-center text-rose-400 font-bold tracking-wider"
                >
                  PUT OPTIONS (BEARISH) ►
                </th>
              </tr>
              <tr className="bg-[#0d1320] text-slate-400 text-[10px] border-b border-slate-800">
                {(matrixViewMode === 'all' || matrixViewMode === 'oi') && (
                  <th className="py-2 px-3 text-left">Call OI Depth</th>
                )}
                {(matrixViewMode === 'all' || matrixViewMode === 'oi') && (
                  <th className="py-2 px-3 text-right">Call OI (Contracts)</th>
                )}
                {(matrixViewMode === 'all' || matrixViewMode === 'volume') && (
                  <th className="py-2 px-3 text-right">Call Vol</th>
                )}
                <th className="py-2 px-3 text-right border-r border-slate-800">
                  Δ {timeframe} (OI / Vol)
                </th>

                <th className="py-2 px-2 text-center">Structure Signals</th>
                <th className="py-2 px-4 text-center font-bold text-white bg-slate-900/90">Strike ($)</th>
                <th className="py-2 px-2 text-center border-r border-slate-800">OI / Vol PCR</th>

                <th className="py-2 px-3 text-left">
                  Δ {timeframe} (OI / Vol)
                </th>
                {(matrixViewMode === 'all' || matrixViewMode === 'volume') && (
                  <th className="py-2 px-3 text-left">Put Vol</th>
                )}
                {(matrixViewMode === 'all' || matrixViewMode === 'oi') && (
                  <th className="py-2 px-3 text-left">Put OI (Contracts)</th>
                )}
                {(matrixViewMode === 'all' || matrixViewMode === 'oi') && (
                  <th className="py-2 px-3 text-right">Put OI Depth</th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/40">
              {loading && (!data?.matrix || data.matrix.length === 0) ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                      <span>Loading options contracts & volume for {asset}...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMatrix.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No active options contracts found for {asset} on selected expiries.
                  </td>
                </tr>
              ) : (
                filteredMatrix.map((row, idx) => {
                  const isStrongestRes = row.strike === summary?.strongestResistance;
                  const isNearestRes = row.strike === summary?.nearestResistance;
                  const isStrongestSup = row.strike === summary?.strongestSupport;
                  const isNearestSup = row.strike === summary?.nearestSupport;
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
                            colSpan={11}
                            className="py-1 px-4 text-center text-cyan-300 font-bold text-[11px] tracking-wide"
                          >
                            ─── SPOT PRICE LEVEL: ${formatNumber(spotPrice, asset === 'XAUT' ? 2 : 0)} ───
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
                        {(matrixViewMode === 'all' || matrixViewMode === 'oi') && (
                          <td className="py-2 px-3 w-28 relative">
                            <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded transition-all duration-500"
                                style={{ width: `${row.callBarPct}%` }}
                              />
                            </div>
                          </td>
                        )}

                        {(matrixViewMode === 'all' || matrixViewMode === 'oi') && (
                          <td className="py-2 px-3 text-right font-medium text-slate-200">
                            {formatNumber(row.callOi, 1)}
                          </td>
                        )}

                        {(matrixViewMode === 'all' || matrixViewMode === 'volume') && (
                          <td className="py-2 px-3 text-right font-medium text-cyan-300">
                            {formatNumber(row.callVolume, 1)}
                          </td>
                        )}

                        <td className="py-2 px-3 text-right border-r border-slate-800">
                          <div className={(row.call?.oiChangePct || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {formatPercentChange(row.call?.oiChangePct)}
                          </div>
                          {row.call?.volumeChangePct !== undefined && (
                            <div className="text-[9px] text-slate-500">
                              Vol: {formatPercentChange(row.call.volumeChangePct)}
                            </div>
                          )}
                        </td>

                        <td className="py-2 px-2 text-center whitespace-nowrap">
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            {isStrongestRes && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/25 text-emerald-300 border border-emerald-500/50">
                                CALL WALL
                              </span>
                            )}
                            {isNearestRes && !isStrongestRes && (
                              <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
                                NEAREST RES
                              </span>
                            )}
                            {isStrongestSup && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-500/25 text-rose-300 border border-rose-500/50">
                                PUT FLOOR
                              </span>
                            )}
                            {isNearestSup && !isStrongestSup && (
                              <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-rose-950/50 text-rose-400 border border-rose-500/30">
                                NEAREST SUP
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
                          ${formatNumber(row.strike, asset === 'XAUT' ? 1 : 0)}
                        </td>

                        <td className="py-2 px-2 text-center text-slate-300 border-r border-slate-800">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              row.strikePcr > 1.4
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : row.strikePcr < 0.6
                                ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                                : 'bg-cyan-500/10 text-cyan-300'
                            }`}
                          >
                            OI: {row.strikePcr}
                          </span>
                          <div className="text-[9px] text-slate-500 mt-0.5">
                            Vol: {row.volumePcr}
                          </div>
                        </td>

                        <td className="py-2 px-3 text-left">
                          <div className={(row.put?.oiChangePct || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {formatPercentChange(row.put?.oiChangePct)}
                          </div>
                          {row.put?.volumeChangePct !== undefined && (
                            <div className="text-[9px] text-slate-500">
                              Vol: {formatPercentChange(row.put.volumeChangePct)}
                            </div>
                          )}
                        </td>

                        {(matrixViewMode === 'all' || matrixViewMode === 'volume') && (
                          <td className="py-2 px-3 text-left font-medium text-cyan-300">
                            {formatNumber(row.putVolume, 1)}
                          </td>
                        )}

                        {(matrixViewMode === 'all' || matrixViewMode === 'oi') && (
                          <td className="py-2 px-3 text-left font-medium text-slate-200">
                            {formatNumber(row.putOi, 1)}
                          </td>
                        )}

                        {(matrixViewMode === 'all' || matrixViewMode === 'oi') && (
                          <td className="py-2 px-3 w-28 relative text-right">
                            <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                              <div
                                className="bg-rose-500 h-full rounded transition-all duration-500"
                                style={{ width: `${row.putBarPct}%` }}
                              />
                            </div>
                          </td>
                        )}
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
