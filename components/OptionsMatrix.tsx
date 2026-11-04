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
  ChevronDown,
  ChevronUp,
  Target,
  PieChart as PieIcon,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MinusCircle,
  TrendingDown,
  BookOpen,
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

// Helper to display XAUUSD instead of XAUT to users
const getDisplayAssetName = (token: string): string => {
  if (token === 'XAUT') return 'XAUUSD';
  return token;
};

// Robust fallback data generator when API is offline or testing
function getFallbackOptionsData(asset: string, timeframe: string): OptionsApiResponse {
  const spot = asset === 'XAUT' ? 2740.80 : asset === 'BTC' ? 78032.50 : asset === 'ETH' ? 3850.25 : 192.40;
  const step = asset === 'XAUT' ? 25 : asset === 'BTC' ? 1000 : asset === 'ETH' ? 100 : 5;
  const center = Math.round(spot / step) * step;
  const strikes: MatrixRow[] = [];

  for (let i = -6; i <= 6; i++) {
    const s = center + i * step;
    const callOi = Number((1.85 * (1 + Math.sin(i * 1.5) * 0.45) * (i >= 0 ? 1.5 : 0.65)).toFixed(2));
    const putOi = Number((2.35 * (1 + Math.cos(i * 1.2) * 0.45) * (i <= 0 ? 1.85 : 0.55)).toFixed(2));
    const callVol = Number((callOi * 0.42).toFixed(2));
    const putVol = Number((putOi * 0.48).toFixed(2));
    const strikePcr = callOi > 0 ? Number((putOi / callOi).toFixed(2)) : 0;
    const volumePcr = callVol > 0 ? Number((putVol / callVol).toFixed(2)) : 0;

    const callShift = Number((callVol * 0.15).toFixed(2));
    const putShift = Number((putVol * 0.18).toFixed(2));

    strikes.push({
      strike: s,
      callOi,
      putOi,
      callVolume: callVol,
      putVolume: putVol,
      strikePcr,
      volumePcr,
      callBarPct: Math.min(100, Math.round((callOi / 4.5) * 100)),
      putBarPct: Math.min(100, Math.round((putOi / 4.5) * 100)),
      isItmCall: spot > s,
      isItmPut: spot < s,
      signals: [],
      call: {
        symbol: `${asset}-${s}-C`,
        contractType: 'call',
        oi: callOi,
        oiChange: callShift,
        oiChangePct: Number(((callShift / (callOi || 1)) * 100).toFixed(1)),
        markPrice: Math.max(spot - s, step * 0.1),
        volume: callVol,
        notional: callOi * 1_000_000,
      },
      put: {
        symbol: `${asset}-${s}-P`,
        contractType: 'put',
        oi: putOi,
        oiChange: putShift,
        oiChangePct: Number(((putShift / (putOi || 1)) * 100).toFixed(1)),
        markPrice: Math.max(s - spot, step * 0.1),
        volume: putVol,
        notional: putOi * 1_000_000,
      },
    });
  }

  const totCall = Number(strikes.reduce((acc, r) => acc + r.callOi, 0).toFixed(2));
  const totPut = Number(strikes.reduce((acc, r) => acc + r.putOi, 0).toFixed(2));
  const totCallVol = Number(strikes.reduce((acc, r) => acc + r.callVolume, 0).toFixed(2));
  const totPutVol = Number(strikes.reduce((acc, r) => acc + r.putVolume, 0).toFixed(2));
  const overallPcr = totCall > 0 ? Number((totPut / totCall).toFixed(3)) : 1.38;

  return {
    success: true,
    asset,
    underlyingSpotPrice: spot,
    availableExpiries: ['2026-11-02', '2026-11-03', '2026-11-07', '2026-11-28'],
    selectedExpiries: ['2026-11-02', '2026-11-03'],
    updatedAt: new Date().toISOString(),
    summary: {
      totalCallOi: totCall,
      totalPutOi: totPut,
      totalCallVolume: totCallVol,
      totalPutVolume: totPutVol,
      totalCallOiNotional: totCall * 1_000_000,
      totalPutOiNotional: totPut * 1_000_000,
      overallPcr,
      overallVolumePcr: totCallVol > 0 ? Number((totPutVol / totCallVol).toFixed(3)) : 1.15,
      sentiment: overallPcr >= 1.0 ? 'BUYING SIDE' : 'SELLING SIDE',
      sentimentColor: overallPcr >= 1.0 ? 'emerald' : 'rose',
      pcrDescription: overallPcr >= 1.0 ? 'Put writing dominant (buying support)' : 'Call writing dominant (capping upside)',
      positionBuilding: 'Active liquidity buildup',
      maxPainStrike: center,
      nearestSupport: center - step,
      strongestSupport: center - 3 * step,
      nearestResistance: center + step,
      strongestResistance: center + 3 * step,
      contractsCount: strikes.length * 2,
    },
    matrix: strikes,
  };
}

export default function OptionsMatrix({ initialAsset = 'XAUT', className = '' }: OptionsMatrixProps) {
  const [asset, setAsset] = useState<'BTC' | 'ETH' | 'SOL' | 'XAUT'>(initialAsset);
  const [selectedExpiries, setSelectedExpiries] = useState<string[]>([]);
  const [expiryDropdownOpen, setExpiryDropdownOpen] = useState<boolean>(false);
  const [matrixViewMode, setMatrixViewMode] = useState<'all' | 'oi' | 'volume'>('all');
  const [timeframe, setTimeframe] = useState<'15m' | '1h' | '2h' | '4h' | '12h' | '24h'>('1h');

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

  useEffect(() => {
    if (data?.availableExpiries && data.availableExpiries.length > 0 && selectedExpiries.length === 0) {
      // Delta's analytics page shows a single (nearest) expiry by default
      setSelectedExpiries(data.availableExpiries.slice(0, 1));
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
          setError('Rate limit reached (429). Retrying on next cycle...');
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
        // Never show simulated numbers as if they were live Delta data.
        console.warn('Options feed error:', err.message);
        setError(err.message || 'Failed to load options data');
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

  const formatNumber = (num: number | undefined | null, decimals = 2) => {
    if (num === null || num === undefined) return '0';
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const summary = data?.summary;
  const spotPrice = data?.underlyingSpotPrice || 0;

  const flowAnalytics = useMemo(() => {
    if (!data?.matrix || data.matrix.length === 0) return null;
    let netCallOiChange = 0;
    let netPutOiChange = 0;
    let totalCallOiAdded = 0;
    let totalPutOiAdded = 0;

    for (const r of data.matrix) {
      totalCallOiAdded += r.call?.oiChange || 0;
      totalPutOiAdded += r.put?.oiChange || 0;
      netCallOiChange += r.call?.oiChangePct || 0;
      netPutOiChange += r.put?.oiChangePct || 0;
    }

    const netOiVelocity = netPutOiChange - netCallOiChange;
    return {
      totalCallOiAdded: totalCallOiAdded || 2.85,
      totalPutOiAdded: totalPutOiAdded || 4.57,
      netOiVelocity,
    };
  }, [data?.matrix]);

  const marketAnalysis = useMemo(() => {
    if (!summary || !spotPrice || spotPrice === 0) return null;
    const overallPcr = summary.overallPcr;
    const matrix = data?.matrix || [];
    
    const resistanceStrikes = matrix.filter((r) => r.strike >= spotPrice).sort((a, b) => a.strike - b.strike);
    const supportStrikes = matrix.filter((r) => r.strike < spotPrice).sort((a, b) => b.strike - a.strike);

    const r1 = resistanceStrikes[0]?.strike || (spotPrice * 1.01);
    const s1 = supportStrikes[0]?.strike || (spotPrice * 0.99);
    const maxPain = summary.maxPainStrike || spotPrice;

    return {
      primaryDirection: overallPcr >= 1.0 ? 'BULLISH EXPANSION (BUYING SIDE)' : 'BEARISH ABSORPTION (SELLING SIDE)',
      r1,
      s1,
      maxPain,
      overallPcr,
    };
  }, [summary, spotPrice, data?.matrix]);

  return (
    <div className={`w-full bg-[#0a0d14] text-slate-100 rounded-xl border border-slate-800 shadow-2xl p-4 md:p-6 font-sans ${className}`}>
      {/* 1. TOP HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                OPTIONS MARKET STRUCTURE & PROBABILITY RADAR
              </h2>
              <div className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                  {getDisplayAssetName(asset)} SPOT:
                </span>
                <span className="text-base font-extrabold text-white font-mono">
                  ${formatNumber(spotPrice, asset === 'XAUT' ? 2 : 2)}
                </span>
              </div>
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                REAL-TIME
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Derivatives Open Interest Selling Matrix & Underlying Spot Price Execution ($M Notional Scale)
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg">
            {(['XAUT', 'BTC', 'ETH', 'SOL'] as const).map((token) => (
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
                {token === 'XAUT' ? 'XAUUSD' : token}
              </button>
            ))}
          </div>

          <div className="inline-flex p-1 bg-slate-900 border border-slate-800 rounded-lg items-center">
            <span className="text-[10px] text-slate-500 font-mono px-1 flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-cyan-400" />
            </span>
            {(['15m', '1h', '2h', '4h', '12h', '24h'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-[11px] font-mono font-bold rounded transition-all ${
                  timeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. MARKET DIRECTIONAL PROBABILITY BANNER */}
      {marketAnalysis && (
        <div className="mt-4 p-4 bg-gradient-to-r from-slate-950 via-[#0d121c] to-slate-950 border border-cyan-500/40 rounded-xl font-mono shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
                MARKET DIRECTION PROBABILITY & DATA BEHAVIOR ({getDisplayAssetName(asset)})
              </span>
              <span className="px-2 py-0.5 text-[10px] font-black rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {marketAnalysis.primaryDirection}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Expiry selector + error banner */}
      <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-xs">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setExpiryDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
          >
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Expiry: {selectedExpiries.length ? selectedExpiries.join(', ') : '—'}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {expiryDropdownOpen && (
            <div className="absolute z-20 mt-1 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1">
              {(data?.availableExpiries || []).map((exp) => (
                <button
                  key={exp}
                  onClick={() => toggleExpiry(exp)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-800 rounded"
                >
                  <span>{exp}</span>
                  {selectedExpiries.includes(exp) && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
        {error && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" /> {error}
          </span>
        )}
      </div>

      {/* 3. MATRIX TABLE */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
              <th className="py-2.5 px-3">Call OI Depth</th>
              <th className="py-2.5 px-3">Call OI ($M)</th>
              <th className="py-2.5 px-3">Call Vol ($M)</th>
              <th className="py-2.5 px-3">Call OI Δ {(data as any)?.oiChangeBasis || timeframe}</th>
              <th className="py-2.5 px-3 text-center">Strike ($)</th>
              <th className="py-2.5 px-3">Put OI Δ {(data as any)?.oiChangeBasis || timeframe}</th>
              <th className="py-2.5 px-3">Put Vol ($M)</th>
              <th className="py-2.5 px-3">Put OI ($M)</th>
              <th className="py-2.5 px-3">Put OI Depth</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {data?.matrix && data.matrix.length > 0 ? (
              data.matrix.map((row) => {
                // Draw the spot line once: just before the first strike at/above spot
                const idx = data.matrix.indexOf(row);
                const isSpotRow =
                  spotPrice > 0 &&
                  row.strike >= spotPrice &&
                  (idx === 0 ? true : data.matrix[idx - 1].strike < spotPrice);
                return (
                  <React.Fragment key={row.strike}>
                    {isSpotRow && (
                      <tr>
                        <td colSpan={9} className="py-2 text-center bg-cyan-950/30 border-y border-cyan-500/40 text-cyan-300 text-[11px] font-bold">
                          --- SPOT PRICE LEVEL: ${formatNumber(spotPrice, 2)} ---
                        </td>
                      </tr>
                    )}
                    <tr className="hover:bg-slate-900/40 transition-colors">
                      {/* Call Depth */}
                      <td className="py-2.5 px-3">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full" style={{ width: `${row.callBarPct}%` }} />
                        </div>
                      </td>
                      {/* Call OI ($M) */}
                      <td className="py-2.5 px-3 font-bold text-white">
                        {row.callOi > 0 ? `${row.callOi.toFixed(2)}M` : '0.00'}
                      </td>
                      {/* Call Volume */}
                      <td className="py-2.5 px-3 text-slate-300">
                        {row.callVolume > 0 ? `${row.callVolume.toFixed(2)}M` : '0.00'}
                      </td>
                      {/* Call OI Change */}
                      <td className="py-2.5 px-3">
                        <span className={`font-semibold ${(row.call?.oiChange || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {(row.call?.oiChange || 0) >= 0 ? '+' : ''}{row.call?.oiChange?.toFixed(2) || '0.00'}M
                        </span>
                        <div className="text-[10px] text-slate-500">
                          OI Δ: {(row.call?.oiChangePct || 0).toFixed(2)}%
                        </div>
                      </td>

                      {/* Strike */}
                      <td className="py-2.5 px-3 text-center font-extrabold text-cyan-300 bg-slate-900/60">
                        ${formatNumber(row.strike, 1)}
                      </td>

                      {/* Put OI Change */}
                      <td className="py-2.5 px-3">
                        <span className={`font-semibold ${(row.put?.oiChange || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {(row.put?.oiChange || 0) >= 0 ? '+' : ''}{row.put?.oiChange?.toFixed(2) || '0.00'}M
                        </span>
                        <div className="text-[10px] text-slate-500">
                          OI Δ: {(row.put?.oiChangePct || 0).toFixed(2)}%
                        </div>
                      </td>
                      {/* Put Volume */}
                      <td className="py-2.5 px-3 text-slate-300">
                        {row.putVolume > 0 ? `${row.putVolume.toFixed(2)}M` : '0.00'}
                      </td>
                      {/* Put OI ($M) */}
                      <td className="py-2.5 px-3 font-bold text-white">
                        {row.putOi > 0 ? `${row.putOi.toFixed(2)}M` : '0.00'}
                      </td>
                      {/* Put Depth */}
                      <td className="py-2.5 px-3">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full" style={{ width: `${row.putBarPct}%` }} />
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-6 text-slate-500">
                  {loading ? 'Loading options matrix structure...' : 'No option strikes available.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. TOTALS (same figures Delta shows under its chart) */}
      {summary && (
        <div className="mt-3 flex flex-wrap justify-end gap-x-5 gap-y-1 font-mono text-xs text-slate-300 border-t border-slate-800 pt-3">
          <span>Tot. Calls <b className="text-emerald-400">${formatNumber(summary.totalCallOi)}M</b></span>
          <span>Tot. Puts <b className="text-rose-400">${formatNumber(summary.totalPutOi)}M</b></span>
          <span>PCR <b className="text-white">{formatNumber(summary.overallPcr)}</b></span>
          <span>Max Pain <b className="text-cyan-300">{summary.maxPainStrike ?? '—'}</b></span>
        </div>
      )}
    </div>
  );
}
