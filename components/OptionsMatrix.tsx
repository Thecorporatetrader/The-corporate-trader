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

// DEFAULT ASSET SET TO XAUT (DISPLAYED AS XAUUSD)
export default function OptionsMatrix({ initialAsset = 'XAUT', className = '' }: OptionsMatrixProps) {
  const [asset, setAsset] = useState<'BTC' | 'ETH' | 'SOL' | 'XAUT'>(initialAsset);
  const [selectedExpiries, setSelectedExpiries] = useState<string[]>([]);
  const [expiryDropdownOpen, setExpiryDropdownOpen] = useState<boolean>(false);
  const [matrixViewMode, setMatrixViewMode] = useState<'all' | 'oi' | 'volume'>('all');
  const [timeframe, setTimeframe] = useState<'15m' | '1h' | '2h' | '4h' | '12h' | '24h'>('1h');

  // Single dropdown toggle for all verbal narrative explanations
  const [narrativeOpen, setNarrativeOpen] = useState<boolean>(false);

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

  // Auto-select the nearest expiry by default
  useEffect(() => {
    if (data?.availableExpiries && data.availableExpiries.length > 0 && selectedExpiries.length === 0) {
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
        if (!json?.success || !Array.isArray(json.matrix)) {
          throw new Error((json as any)?.error || 'Options API returned an invalid response.');
        }

        setData(json);
        setLastRefreshed(new Date());
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unable to load options data.';
        console.error('Options feed request failed:', message);
        setError(message);
        // Never replace a failed live request with synthetic market data.
        // Keep the last successful response visible, if one exists.
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
    if (num === null || num === undefined || !Number.isFinite(Number(num))) return '—';
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatPercentChange = (val: number | undefined | null) => {
    if (val === null || val === undefined || !Number.isFinite(Number(val))) return '—';
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

  // OI flow uses only the API's observed OI change. Volume is not a proxy for OI change.
  // Positive and negative OI changes are shown as contract changes, not buyer/seller activity.
  const flowAnalytics = useMemo(() => {
    if (!data?.matrix?.length) return null;

    const rowsWithShifts = data.matrix.map((row) => {
      const callChange = Number.isFinite(Number(row.call?.oiChange)) ? Number(row.call?.oiChange) : 0;
      const putChange = Number.isFinite(Number(row.put?.oiChange)) ? Number(row.put?.oiChange) : 0;
      return {
        ...row,
        derivedCallShift: callChange,
        derivedPutShift: putChange,
      };
    });

    let netCallOiChange = 0;
    let netPutOiChange = 0;
    let totalCallOiAdded = 0;
    let totalPutOiAdded = 0;
    let totalCallOiReduced = 0;
    let totalPutOiReduced = 0;
    let topCallAdditionStrike: number | null = null;
    let topPutAdditionStrike: number | null = null;
    let topCallVolumeStrike: number | null = null;
    let topPutVolumeStrike: number | null = null;
    let maxCallChange = 0;
    let maxPutChange = 0;
    let maxCallVol = -1;
    let maxPutVol = -1;
    let topShiftStrike: number | null = null;
    let maxTotalShiftContracts = 0;
    let topShiftType: 'CALL' | 'PUT' = 'PUT';

    for (const row of rowsWithShifts) {
      const callChange = row.derivedCallShift;
      const putChange = row.derivedPutShift;
      const callVol = Number(row.callVolume) || 0;
      const putVol = Number(row.putVolume) || 0;

      netCallOiChange += callChange;
      netPutOiChange += putChange;
      totalCallOiAdded += Math.max(0, callChange);
      totalPutOiAdded += Math.max(0, putChange);
      totalCallOiReduced += Math.abs(Math.min(0, callChange));
      totalPutOiReduced += Math.abs(Math.min(0, putChange));

      const combinedAbsoluteChange = Math.abs(callChange) + Math.abs(putChange);
      if (combinedAbsoluteChange > maxTotalShiftContracts) {
        maxTotalShiftContracts = combinedAbsoluteChange;
        topShiftStrike = row.strike;
        topShiftType = Math.abs(putChange) >= Math.abs(callChange) ? 'PUT' : 'CALL';
      }

      if (callChange > maxCallChange) {
        maxCallChange = callChange;
        topCallAdditionStrike = row.strike;
      }
      if (putChange > maxPutChange) {
        maxPutChange = putChange;
        topPutAdditionStrike = row.strike;
      }
      if (callVol > maxCallVol) {
        maxCallVol = callVol;
        topCallVolumeStrike = row.strike;
      }
      if (putVol > maxPutVol) {
        maxPutVol = putVol;
        topPutVolumeStrike = row.strike;
      }
    }

    return {
      rowsWithShifts,
      netCallOiChange,
      netPutOiChange,
      totalCallOiAdded,
      totalPutOiAdded,
      totalCallOiReduced,
      totalPutOiReduced,
      topShiftStrike,
      maxTotalShiftContracts,
      topShiftType,
      topCallAdditionStrike,
      topPutAdditionStrike,
      topCallVolumeStrike,
      topPutVolumeStrike,
      hasOiChangeData: rowsWithShifts.some((row) => row.call?.oiChange !== undefined || row.put?.oiChange !== undefined),
    };
  }, [data?.matrix]);

  // Options-derived context only. OI/PCR cannot identify whether buyers or writers initiated trades.
  const marketAnalysis = useMemo(() => {
    if (!summary || !spotPrice || !data?.matrix?.length) return null;

    const matrix = data.matrix;
    const overallPcr = Number(summary.overallPcr) || 0;
    const volPcr = summary.overallVolumePcr == null ? null : Number(summary.overallVolumePcr);

    const resistanceStrikes = matrix
      .filter((row) => row.strike > spotPrice)
      .sort((a, b) => a.strike - b.strike);
    const supportStrikes = matrix
      .filter((row) => row.strike < spotPrice)
      .sort((a, b) => b.strike - a.strike);

    const strongestResistanceRow = resistanceStrikes.reduce<MatrixRow | null>(
      (best, row) => !best || row.callOi > best.callOi ? row : best,
      null
    );
    const strongestSupportRow = supportStrikes.reduce<MatrixRow | null>(
      (best, row) => !best || row.putOi > best.putOi ? row : best,
      null
    );

    const r1 = resistanceStrikes[0] ?? null;
    const r2 = resistanceStrikes[1] ?? null;
    const r3 = resistanceStrikes[2] ?? null;
    const s1 = supportStrikes[0] ?? null;
    const s2 = supportStrikes[1] ?? null;
    const s3 = supportStrikes[2] ?? null;

    const pcrContext =
      overallPcr > 1.15 ? 'PUT OI HEAVIER' :
      overallPcr < 0.85 ? 'CALL OI HEAVIER' :
      'OI MIXED / BALANCED';

    const verbalFlowNarrative = flowAnalytics
      ? `For the selected ${timeframe} window, the API reports net call OI change of ${flowAnalytics.netCallOiChange >= 0 ? '+' : ''}${formatNumber(flowAnalytics.netCallOiChange, 0)} contracts and net put OI change of ${flowAnalytics.netPutOiChange >= 0 ? '+' : ''}${formatNumber(flowAnalytics.netPutOiChange, 0)} contracts. Positive changes mean reported OI increased; negative changes mean it decreased. OI change and volume do not reveal whether buyers or writers initiated the positions. The largest absolute combined OI change is at ${flowAnalytics.topShiftStrike == null ? 'not available' : `$${formatNumber(flowAnalytics.topShiftStrike, 0)}`}.`
      : 'OI change data is not available from the current response.';

    const verbalBaselineNarrative =
      `The nearest listed strikes above spot are potential call-OI concentration areas, while the nearest listed strikes below spot are potential put-OI concentration areas. These are reference levels from the selected options data, not confirmed technical support or resistance. Confirm price reaction on the XAUUSD spot chart before considering a trade.`;

    const maxPain = summary.maxPainStrike ?? null;
    const verbalExpiryNarrative = maxPain == null
      ? 'Max Pain is not available for the current response. Max Pain is an options-chain calculation, not a reliable forecast or a guaranteed price target.'
      : `The API reports Max Pain at $${formatNumber(maxPain, 0)}. Spot is $${formatNumber(spotPrice, 2)}. Treat Max Pain only as an expiry-related reference; it does not predict that price will move toward it.`;

    return {
      r1: r1?.strike ?? null,
      r1Pcr: r1?.strikePcr ?? null,
      r2: r2?.strike ?? null,
      r2Pcr: r2?.strikePcr ?? null,
      r3: r3?.strike ?? null,
      r3Pcr: r3?.strikePcr ?? null,
      s1: s1?.strike ?? null,
      s1Pcr: s1?.strikePcr ?? null,
      s2: s2?.strike ?? null,
      s2Pcr: s2?.strikePcr ?? null,
      s3: s3?.strike ?? null,
      s3Pcr: s3?.strikePcr ?? null,
      strongSupportStrike: strongestSupportRow?.strike ?? null,
      strongSupportPcr: strongestSupportRow?.strikePcr ?? null,
      strongestResStrike: strongestResistanceRow?.strike ?? null,
      strongestResPcr: strongestResistanceRow?.strikePcr ?? null,
      ntzLower: s1?.strike ?? null,
      ntzUpper: r1?.strike ?? null,
      maxPain,
      overallPcr,
      volPcr,
      pcrContext,
      verbalFlowNarrative,
      verbalBaselineNarrative,
      verbalExpiryNarrative,
    };
  }, [summary, spotPrice, flowAnalytics, timeframe, data?.matrix]);

  const tunnelPosition = useMemo(() => {
    const lower = marketAnalysis?.s3 ?? marketAnalysis?.s1;
    const upper = marketAnalysis?.r3 ?? marketAnalysis?.r1;
    if (lower == null || upper == null || upper <= lower) return 50;
    const position = ((spotPrice - lower) / (upper - lower)) * 100;
    return Math.max(4, Math.min(96, Math.round(position)));
  }, [marketAnalysis?.s3, marketAnalysis?.r3, marketAnalysis?.s1, marketAnalysis?.r1, spotPrice]);

  return (
    <div
      className={`w-full bg-[#0a0d14] text-slate-100 rounded-xl border border-slate-800 shadow-2xl p-4 md:p-6 font-sans ${className}`}
    >
      {/* 1. TOP HEADER WITH CURRENT SPOT PRICE, PAIR DISPLAY (XAUUSD AS DEFAULT) & OPTIONS FEED BADGE (DELTA FEED NAME REMOVED) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/30 rounded-lg text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-white font-mono">
                OPTIONS MARKET STRUCTURE & POSITIONING RADAR
              </h2>
              {/* CURRENT SPOT PRICE AT TOP */}
              <div className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                  {getDisplayAssetName(asset)} SPOT:
                </span>
                <span className="text-base font-extrabold text-white font-mono">
                  ${formatNumber(spotPrice, asset === 'XAUT' ? 2 : 2)}
                </span>
              </div>
              {/* OPTIONS FEED BADGE (DELTA EXCHANGE FEED REMOVED) */}
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                OPTIONS FEED
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Options OI and volume context for XAUUSD spot analysis
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Asset Switcher: XAUUSD (Gold) First by Default */}
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

          {/* Timeframe Selector (Added 24h) */}
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

      {error && (
        <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-950/20 px-3 py-2 text-xs text-rose-300">
          Options feed error: {error}. {data ? 'Showing the last successful response; values may be stale.' : 'No live options data is available.'}
        </div>
      )}
      {data?.warning && (
        <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-300">
          Feed warning: {data.warning}
        </div>
      )}
      {data?.isStale && (
        <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-300">
          The API has marked this options snapshot as stale. Do not use it as a live trading signal.
        </div>
      )}

      {/* Active Expiries Pill Bar */}
      {selectedExpiries.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <span className="text-slate-500 mr-1">Selected Expiries (single expiry recommended; max 3):</span>
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
            (Expiry-specific OI and volume context)
          </span>
        </div>
      )}

      {/* 2. OPTIONS POSITIONING CONTEXT AND POTENTIAL OI REFERENCE LEVELS */}
      {marketAnalysis && (
        <div className="mt-4 p-4 bg-gradient-to-r from-slate-950 via-[#0d121c] to-slate-950 border border-cyan-500/40 rounded-xl font-mono shadow-lg">
          {/* Options positioning header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
                OPTIONS POSITIONING CONTEXT ({getDisplayAssetName(asset)})
              </span>
              <span
                className={`px-2 py-0.5 text-[10px] font-black rounded ${
                  marketAnalysis.pcrContext.includes('PUT')
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : marketAnalysis.pcrContext.includes('CALL')
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {marketAnalysis.pcrContext}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                OI PCR:{' '}
                <strong className={marketAnalysis.overallPcr >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {formatNumber(marketAnalysis.overallPcr, 2)}
                </strong>
                <span className="text-[9px] text-slate-400 ml-1">
                  ({marketAnalysis.overallPcr >= 1.15 ? 'Put OI heavier' : marketAnalysis.overallPcr < 0.85 ? 'Call OI heavier' : 'Mixed OI'})
                </span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                Vol PCR: <strong className="text-amber-400">{formatNumber(marketAnalysis.volPcr, 2)}</strong>
              </span>
            </div>
          </div>

          {/* Options context is descriptive, not a directional trade probability. */}
          <div className="my-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
              <div className="text-[10px] uppercase text-slate-500">Options OI context</div>
              <div className="mt-1 font-bold text-cyan-300">{marketAnalysis.pcrContext}</div>
              <div className="mt-1 text-[10px] text-slate-400">PCR describes the put/call OI balance; it is not a BUY/SELL signal.</div>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
              <div className="text-[10px] uppercase text-slate-500">Spot chart confirmation</div>
              <div className="mt-1 font-bold text-amber-300">NOT CONNECTED</div>
              <div className="mt-1 text-[10px] text-slate-400">No OHLC candle feed is provided to this component, so technical direction cannot be confirmed here.</div>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-3">
              <div className="text-[10px] uppercase text-amber-400">Execution decision</div>
              <div className="mt-1 font-bold text-amber-300">WAIT — NO TRADE SIGNAL</div>
              <div className="mt-1 text-[10px] text-slate-400">Use the OI levels as context and wait for spot-chart confirmation.</div>
            </div>
          </div>

          {/* 3 RESISTANCE & 3 SUPPORT ARCHITECTURE (SHOWING PCR IN BRACKETS & BUY/SELL OPPORTUNITIES) */}
          <div className="my-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Nearest 3 Resistance & 3 Support Strikes (with PCR in brackets)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-emerald-400 font-semibold">Higher PCR = More Put OI</span>
                <span className="text-slate-500">•</span>
                <span className="text-rose-400 font-semibold">Lower PCR = More Call OI</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
              {/* 3 Resistance Levels (Lower PCR = More Call OI) */}
              <div className="p-2.5 bg-rose-950/20 border border-rose-500/30 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ArrowDownRight className="w-3.5 h-3.5" /> 3 Nearest Strikes Above Spot
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-900/40 text-rose-300">CALL OI CONCENTRATION</span>
                  </div>
                  <div className="mt-2 space-y-1.5 font-mono text-slate-300">
                    <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                      <span className="text-slate-400">R1 Above Spot:</span>
                      <span className="font-bold text-rose-300">
                        ${formatNumber(marketAnalysis.r1, 0)} <span className="text-[10px] text-rose-400 font-semibold">(PCR: {formatNumber(marketAnalysis.r1Pcr, 2)})</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                      <span className="text-slate-400">R2 Above Spot:</span>
                      <span className="font-bold text-rose-300">
                        ${formatNumber(marketAnalysis.r2, 0)} <span className="text-[10px] text-rose-400 font-semibold">(PCR: {formatNumber(marketAnalysis.r2Pcr, 2)})</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                      <span className="text-slate-400">R3 Above Spot:</span>
                      <span className="font-bold text-rose-400">
                        ${formatNumber(marketAnalysis.r3, 0)} <span className="text-[10px] text-rose-400 font-semibold">(PCR: {formatNumber(marketAnalysis.r3Pcr, 2)})</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 mt-2 pt-1 border-t border-rose-900/30">
                  Call OI concentration is a reference zone, not confirmed resistance
                </div>
              </div>

              {/* Options Reference Corridor Corridor */}
              <div className="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MinusCircle className="w-3.5 h-3.5" /> Options Reference Corridor
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/40 text-amber-300">REFERENCE ONLY</span>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-sm font-extrabold text-amber-300 font-mono">
                      ${formatNumber(marketAnalysis.ntzLower, 0)} – ${formatNumber(marketAnalysis.ntzUpper, 0)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Reported Max Pain: <strong className="text-slate-200">${formatNumber(marketAnalysis.maxPain, 0)}</strong>
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-amber-400/80 mt-2 pt-1 border-t border-amber-900/30 text-center font-semibold">
                  No trade decision is derived from this options corridor
                </div>
              </div>

              {/* 3 Support Levels (Higher PCR = More Put OI) */}
              <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> 3 Nearest Strikes Below Spot
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/40 text-emerald-300">PUT OI CONCENTRATION</span>
                  </div>
                  <div className="mt-2 space-y-1.5 font-mono text-slate-300">
                    <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                      <span className="text-slate-400">S1 Below Spot:</span>
                      <span className="font-bold text-emerald-300">
                        ${formatNumber(marketAnalysis.s1, 0)} <span className="text-[10px] text-emerald-400 font-semibold">(PCR: {formatNumber(marketAnalysis.s1Pcr, 2)})</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                      <span className="text-slate-400">S2 Below Spot:</span>
                      <span className="font-bold text-emerald-300">
                        ${formatNumber(marketAnalysis.s2, 0)} <span className="text-[10px] text-emerald-400 font-semibold">(PCR: {formatNumber(marketAnalysis.s2Pcr, 2)})</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                      <span className="text-slate-400">S3 Below Spot:</span>
                      <span className="font-bold text-emerald-400">
                        ${formatNumber(marketAnalysis.s3, 0)} <span className="text-[10px] text-emerald-400 font-semibold">(PCR: {formatNumber(marketAnalysis.s3Pcr, 2)})</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 mt-2 pt-1 border-t border-emerald-900/30">
                  Put OI concentration is a reference zone, not confirmed support
                </div>
              </div>
            </div>
          </div>

          {/* SINGLE DROPDOWN: CONSOLIDATED VERBAL NARRATIVE EXPLAINING HOW OI IS CHANGING & SHIFTING */}
          <div className="mt-3 bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setNarrativeOpen(!narrativeOpen)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                  Market Structure & OI Flow Narrative Breakdown (Click to {narrativeOpen ? 'Hide' : 'Expand'})
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono">
                <span>{narrativeOpen ? 'Collapse' : 'Expand In Words'}</span>
                {narrativeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {narrativeOpen && (
              <div className="p-4 border-t border-slate-800 bg-slate-950/90 text-xs leading-relaxed space-y-3 font-mono text-slate-300 animate-in fade-in">
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] font-bold text-cyan-300 uppercase mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> Intraday OI Shifting Analysis ({timeframe}):
                  </div>
                  <p>{marketAnalysis.verbalFlowNarrative}</p>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] font-bold text-amber-300 uppercase mb-1 flex items-center gap-1.5">
                    <BarChart2 className="w-3.5 h-3.5 text-amber-400" /> Daily Structural Range & Execution Context:
                  </div>
                  <p>{marketAnalysis.verbalBaselineNarrative}</p>
                </div>

                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800/80">
                  <div className="text-[11px] font-bold text-emerald-300 uppercase mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" /> Near-Term Settlement Thesis ({selectedExpiries.length} Expiries):
                  </div>
                  <p>{marketAnalysis.verbalExpiryNarrative}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. OVERVIEW METRIC CARDS */}
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
              (summary?.overallPcr ?? 1) >= 1.0
                ? 'bg-emerald-500'
                : 'bg-rose-500'
            }`}
          />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>PUT / CALL RATIO</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                (summary?.overallPcr ?? 1) >= 1.0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {(summary?.overallPcr ?? 1) >= 1.0 ? 'PUT OI CONCENTRATION' : 'CALL OI CONCENTRATION'}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-white">
              {summary?.overallPcr ? Number(summary.overallPcr).toFixed(3) : '0.000'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 leading-tight truncate">
              {(summary?.overallPcr ?? 1) >= 1.0
                ? 'Put OI is higher than call OI'
                : 'Call OI is higher than put OI'}
            </div>
          </div>
        </div>

        {/* Max Pain Strike */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>MAX PAIN STRIKE</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-semibold">
              EXPIRY REFERENCE
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

      {/* 4. S/R CORRIDOR & OPEN INTEREST DISTRIBUTION (STANDALONE SECTION) */}
      <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Options OI Reference Corridor & Total OI Distribution
            </span>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Potential OI concentration zones from the selected options chain
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="text-emerald-400">Call OI concentration</span>
            <span className="text-rose-400">Put OI concentration</span>
          </div>
        </div>

        <div className="w-full px-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
            {/* Left 2 Cols: S/R Tunnel and Levels with PCR in brackets */}
            <div className="lg:col-span-2">
              <div className="relative w-full h-4 bg-slate-950 rounded-full border border-slate-800 flex items-center my-6">
                <div className="absolute left-0 w-1/4 h-full bg-emerald-500/20 rounded-l-full" />
                <div className="absolute right-0 w-1/4 h-full bg-rose-500/20 rounded-r-full" />
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

              {/* S/R Labels: Largest Put OI Below Spot & Largest Call OI Above Spot with PCR in brackets */}
              <div className="grid grid-cols-4 gap-2 mt-4 text-center font-mono">
                <div className="p-2 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" /> Largest Put OI Below Spot
                  </div>
                  <div className="text-sm font-black text-emerald-300 mt-0.5">
                    ${formatNumber(marketAnalysis?.strongSupportStrike, asset === 'XAUT' ? 1 : 0)}
                  </div>
                  <div className="text-[9px] text-emerald-400 font-bold">
                    (PCR: {formatNumber(marketAnalysis?.strongSupportPcr, 2)})
                  </div>
                </div>

                <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Nearest Strike Below Spot</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    ${formatNumber(marketAnalysis?.s1, asset === 'XAUT' ? 1 : 0)}
                  </div>
                  <div className="text-[9px] text-slate-400 font-semibold">
                    (PCR: {formatNumber(marketAnalysis?.s1Pcr, 2)})
                  </div>
                </div>

                <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Nearest Strike Above Spot</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    ${formatNumber(marketAnalysis?.r1, asset === 'XAUT' ? 1 : 0)}
                  </div>
                  <div className="text-[9px] text-slate-400 font-semibold">
                    (PCR: {formatNumber(marketAnalysis?.r1Pcr, 2)})
                  </div>
                </div>

                <div className="p-2 bg-rose-950/20 border border-rose-500/30 rounded-lg">
                  <div className="text-[10px] text-rose-400 font-bold uppercase flex items-center justify-center gap-1">
                    <Layers className="w-3 h-3" /> Largest Call OI Above Spot
                  </div>
                  <div className="text-sm font-black text-rose-300 mt-0.5">
                    ${formatNumber(marketAnalysis?.strongestResStrike, asset === 'XAUT' ? 1 : 0)}
                  </div>
                  <div className="text-[9px] text-rose-400 font-bold">
                    (PCR: {formatNumber(marketAnalysis?.strongestResPcr, 2)})
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Total OI Pie Chart in S/R Corridor */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold uppercase text-slate-300 mb-1 flex items-center gap-1.5">
                <PieIcon className="w-3.5 h-3.5 text-cyan-400" /> Total OI Distribution
              </span>

              {summary && (summary.totalCallOi + summary.totalPutOi > 0) ? (
                <div className="relative w-32 h-32 my-1 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {(() => {
                      const total = summary.totalCallOi + summary.totalPutOi;
                      const pCall = (summary.totalCallOi / total) * 100;
                      const pPut = (summary.totalPutOi / total) * 100;
                      const r = 15.9155;
                      const dashCall = `${pCall.toFixed(2)} ${(100 - pCall).toFixed(2)}`;
                      const dashPut = `${pPut.toFixed(2)} ${(100 - pPut).toFixed(2)}`;
                      const offsetPut = (-pCall).toFixed(2);
                      return (
                        <>
                          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#1e293b" strokeWidth="6" />
                          <circle
                            cx="50"
                            cy="50"
                            r={r}
                            fill="transparent"
                            stroke="#10b981"
                            strokeWidth="6"
                            strokeDasharray={dashCall}
                            strokeDashoffset="0"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r={r}
                            fill="transparent"
                            stroke="#f43f5e"
                            strokeWidth="6"
                            strokeDasharray={dashPut}
                            strokeDashoffset={offsetPut}
                          />
                        </>
                      );
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                    <span className="text-[9px] text-slate-400">Total</span>
                    <span className="text-[11px] font-bold text-white">
                      {formatNumber(summary.totalCallOi + summary.totalPutOi, 0)}
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between w-full text-[10px] font-mono px-2 mt-1">
                <div className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded bg-emerald-500" />
                  <span>Calls: {formatNumber(summary?.totalCallOi, 0)}</span>
                </div>
                <div className="flex items-center gap-1 text-rose-400">
                  <span className="w-2 h-2 rounded bg-rose-500" />
                  <span>Puts: {formatNumber(summary?.totalPutOi, 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. OI SHIFT CHART (PLACED DIRECTLY BELOW S/R CORRIDOR) */}
      <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 mb-3 px-1 gap-2 border-b border-slate-800 pb-2">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Open Interest (OI) Shift in Absolute Contracts ({timeframe})
            </span>
            <span className="text-[10px] text-slate-500">Bars show absolute size; hover to see signed OI change (increase or decrease)</span>
          </div>

          {flowAnalytics?.topShiftStrike && (
            <div className="px-3 py-1 bg-cyan-950/70 border border-cyan-500/40 rounded-lg text-cyan-300 font-bold text-xs flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Largest absolute OI change at: Strike ${formatNumber(flowAnalytics.topShiftStrike, 0)} (${formatNumber(flowAnalytics.maxTotalShiftContracts, 0)} contracts absolute change)</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          {/* Left 2 Cols: Shift Bars with Guaranteed Non-Zero Heights */}
          <div className="lg:col-span-2 h-48 w-full bg-slate-900/40 rounded-lg p-2 flex items-end gap-1.5 overflow-x-auto">
            {flowAnalytics?.rowsWithShifts?.map((r) => {
              const maxShift = Math.max(
                1,
                ...flowAnalytics.rowsWithShifts.map((m) => Math.max(Math.abs(m.derivedCallShift), Math.abs(m.derivedPutShift)))
              );

              const callHeight = Math.min(100, Math.max(0, Math.round((Math.abs(r.derivedCallShift) / maxShift) * 100)));
              const putHeight = Math.min(100, Math.max(0, Math.round((Math.abs(r.derivedPutShift) / maxShift) * 100)));
              const isSpot = spotPrice > 0 && Math.abs(r.strike - spotPrice) <= (filteredMatrix[1]?.strike - filteredMatrix[0]?.strike || 500);

              return (
                <div key={r.strike} className="flex-1 min-w-[42px] flex flex-col items-center h-full justify-end group relative">
                  <div className="w-full flex items-end justify-center gap-0.5 h-36 mb-1">
                    <div
                      className="w-1/2 bg-emerald-500/80 rounded-t transition-all duration-500 group-hover:bg-emerald-400"
                      style={{ height: `${callHeight}%` }}
                      title={`Call OI change: ${r.derivedCallShift > 0 ? '+' : ''}${formatNumber(r.derivedCallShift, 0)} contracts`}
                    />
                    <div
                      className="w-1/2 bg-rose-500/80 rounded-t transition-all duration-500 group-hover:bg-rose-400"
                      style={{ height: `${putHeight}%` }}
                      title={`Put OI change: ${r.derivedPutShift > 0 ? '+' : ''}${formatNumber(r.derivedPutShift, 0)} contracts`}
                    />
                  </div>
                  <span className={`text-[9px] font-mono whitespace-nowrap ${isSpot ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                    ${formatNumber(r.strike, 0)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right 1 Col: Overall Shift Pie Chart in Numbers */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold uppercase text-slate-300 mb-1 flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-cyan-400" /> Positive OI Change Split
            </span>
            <span className="text-[9px] text-slate-500 font-mono mb-1">(Positive OI changes only; decreases excluded from this split)</span>

            <div className="relative w-32 h-32 my-1 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {(() => {
                  const cAdded = flowAnalytics?.totalCallOiAdded ?? 0;
                  const pAdded = flowAnalytics?.totalPutOiAdded ?? 0;
                  const total = Math.max(1, cAdded + pAdded);
                  const pCall = (cAdded / total) * 100;
                  const pPut = (pAdded / total) * 100;
                  const r = 15.9155;
                  const dashCall = `${pCall.toFixed(2)} ${(100 - pCall).toFixed(2)}`;
                  const dashPut = `${pPut.toFixed(2)} ${(100 - pPut).toFixed(2)}`;
                  const offsetPut = (-pCall).toFixed(2);
                  return (
                    <>
                      <circle cx="50" cy="50" r={r} fill="transparent" stroke="#1e293b" strokeWidth="6" />
                      <circle
                        cx="50"
                        cy="50"
                        r={r}
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="6"
                        strokeDasharray={dashCall}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={r}
                        fill="transparent"
                        stroke="#f43f5e"
                        strokeWidth="6"
                        strokeDasharray={dashPut}
                        strokeDashoffset={offsetPut}
                      />
                    </>
                  );
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[8px] text-slate-400">Positive OI change</span>
                <span className="text-[11px] font-bold text-cyan-300">
                  +{formatNumber((flowAnalytics?.totalCallOiAdded ?? 0) + (flowAnalytics?.totalPutOiAdded ?? 0), 0)}
                </span>
              </div>
            </div>

            <div className="w-full px-2 mt-1 text-[9px] text-slate-400 font-mono text-center">
              OI reductions — Calls: {formatNumber(flowAnalytics?.totalCallOiReduced, 0)} contracts · Puts: {formatNumber(flowAnalytics?.totalPutOiReduced, 0)} contracts
            </div>
            <div className="flex items-center justify-between w-full text-[10px] font-mono px-2 mt-1">
              <div className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded bg-emerald-500" />
                <span>Calls: +{formatNumber(flowAnalytics?.totalCallOiAdded, 0)}</span>
              </div>
              <div className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded bg-rose-500" />
                <span>Puts: +{formatNumber(flowAnalytics?.totalPutOiAdded, 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. OPTIONS CHAIN TABLE MATRIX (Structure Signal & PCR Column Shifted to Far Right End) */}
      <div className="mt-4 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/60 shadow-xl">
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full text-xs font-mono border-collapse">
            <thead className="sticky top-0 z-30 shadow-md">
              <tr className="bg-[#0b101b] text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <th
                  colSpan={matrixViewMode === 'all' ? 4 : 3}
                  className="py-2.5 px-3 text-center text-emerald-400 border-r border-slate-800 font-bold tracking-wider"
                >
                  ◄ CALL OPTIONS
                </th>
                <th
                  className="py-2.5 px-3 text-center text-cyan-400 border-r border-slate-800 font-bold tracking-wider"
                >
                  STRIKE
                </th>
                <th
                  colSpan={matrixViewMode === 'all' ? 4 : 3}
                  className="py-2.5 px-3 text-center text-rose-400 border-r border-slate-800 font-bold tracking-wider"
                >
                  PUT OPTIONS ►
                </th>
                {/* SHIFTED TO RIGHT END */}
                <th
                  colSpan={2}
                  className="py-2.5 px-3 text-center text-cyan-300 font-bold tracking-wider bg-[#0d1424]"
                >
                  ANALYTICS & SIGNALS (RIGHT END) ►
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
                  OI Change % / Volume Change %
                </th>

                {/* Strike in Center */}
                <th className="py-2 px-4 text-center font-bold text-white bg-slate-900/90 border-r border-slate-800">
                  Strike ($)
                </th>

                <th className="py-2 px-3 text-left">
                  OI Change % / Volume Change %
                </th>
                {(matrixViewMode === 'all' || matrixViewMode === 'volume') && (
                  <th className="py-2 px-3 text-left">Put Vol</th>
                )}
                {(matrixViewMode === 'all' || matrixViewMode === 'oi') && (
                  <th className="py-2 px-3 text-left">Put OI (Contracts)</th>
                )}
                {(matrixViewMode === 'all' || matrixViewMode === 'oi') && (
                  <th className="py-2 px-3 text-right border-r border-slate-800">Put OI Depth</th>
                )}

                {/* SHIFTED TO RIGHT END */}
                <th className="py-2 px-3 text-center bg-[#0d1424] text-cyan-400 font-bold">OI / Vol PCR</th>
                <th className="py-2 px-3 text-center bg-[#0d1424] text-slate-300 font-bold">Structure Signals</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/40">
              {loading && (!data?.matrix || data.matrix.length === 0) ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                      <span>Loading options contracts & volume for {getDisplayAssetName(asset)}...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMatrix.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No active options contracts found for {getDisplayAssetName(asset)} on selected expiries.
                  </td>
                </tr>
              ) : (
                filteredMatrix.map((row, idx) => {
                  const isStrongestRes = row.strike === marketAnalysis?.strongestResStrike;
                  const isNearestRes = row.strike === marketAnalysis?.r1;
                  const isStrongestSup = row.strike === marketAnalysis?.strongSupportStrike;
                  const isNearestSup = row.strike === marketAnalysis?.s1;
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
                            ─── SPOT PRICE LEVEL: ${formatNumber(spotPrice, asset === 'XAUT' ? 2 : 2)} ───
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

                        {/* Strike in Center */}
                        <td
                          className={`py-2 px-4 text-center font-bold text-sm bg-slate-900/60 border-r border-slate-800 ${
                            row.strike === summary?.maxPainStrike
                              ? 'text-cyan-400 ring-1 ring-cyan-500/50'
                              : 'text-white'
                          }`}
                        >
                          ${formatNumber(row.strike, asset === 'XAUT' ? 1 : 0)}
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
                          <td className="py-2 px-3 w-28 relative text-right border-r border-slate-800">
                            <div className="w-full bg-slate-900 h-2 rounded overflow-hidden">
                              <div
                                className="bg-rose-500 h-full rounded transition-all duration-500"
                                style={{ width: `${row.putBarPct}%` }}
                              />
                            </div>
                          </td>
                        )}

                        {/* SHIFTED TO RIGHT END: OI / Vol PCR */}
                        <td className="py-2 px-3 text-center text-slate-300 bg-[#0c121e]/80 border-r border-slate-800">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              row.strikePcr >= 1.0
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            OI: {row.strikePcr}
                          </span>
                          <div className="text-[9px] text-slate-400 mt-0.5">
                            Vol: {row.volumePcr}
                          </div>
                        </td>

                        {/* SHIFTED TO RIGHT END: Structure Signals */}
                        <td className="py-2 px-3 text-center whitespace-nowrap bg-[#0c121e]/80">
                          <div className="flex flex-wrap items-center justify-center gap-1">
                            {isStrongestRes && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-500/25 text-rose-300 border border-rose-500/50">
                                STRONGEST RES
                              </span>
                            )}
                            {isNearestRes && !isStrongestRes && (
                              <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-rose-950/50 text-rose-400 border border-rose-500/30">
                                NEAREST RES
                              </span>
                            )}
                            {isStrongestSup && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-emerald-500/25 text-emerald-300 border border-emerald-500/50">
                                STRONG SUPPORT
                              </span>
                            )}
                            {isNearestSup && !isStrongestSup && (
                              <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
                                NEAREST SUP
                              </span>
                            )}
                            {isMaxPain && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                                MAX PAIN
                              </span>
                            )}
                            {!isStrongestRes && !isNearestRes && !isStrongestSup && !isNearestSup && !isMaxPain && (
                              <span className="text-[10px] text-slate-500">-</span>
                            )}
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

      {/* 7. VOLUME SURGE FLOW (PLACED DIRECTLY BELOW CALL PUT STRIKE DATA NEAR END OF PAGE) */}
      <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 mb-3 px-1 gap-2 border-b border-slate-800 pb-2">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Strike Volume Surge Flow in Absolute Contracts ({timeframe})
            </span>
            <span className="text-[10px] text-slate-500">Real-time trade intensity across strikes (values in contracts)</span>
          </div>

          {flowAnalytics?.topCallVolumeStrike && (
            <div className="px-3 py-1 bg-cyan-950/70 border border-cyan-500/40 rounded-lg text-cyan-300 font-bold text-xs flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Top Surge Strike: ${formatNumber(flowAnalytics.topCallVolumeStrike, 0)}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          {/* Left 2 Cols: Volume Bars in Absolute Numbers */}
          <div className="lg:col-span-2 h-48 w-full bg-slate-900/40 rounded-lg p-2 flex items-end gap-1.5 overflow-x-auto">
            {filteredMatrix.map((r) => {
              const maxVol = Math.max(1, ...filteredMatrix.map((m) => Math.max(m.callVolume, m.putVolume)));
              const callHeight = Math.min(100, Math.round((r.callVolume / maxVol) * 100));
              const putHeight = Math.min(100, Math.round((r.putVolume / maxVol) * 100));
              const isSpot = spotPrice > 0 && Math.abs(r.strike - spotPrice) <= (filteredMatrix[1]?.strike - filteredMatrix[0]?.strike || 500);

              return (
                <div key={r.strike} className="flex-1 min-w-[42px] flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-0.5 h-36 mb-1">
                    <div
                      className="w-1/2 bg-cyan-500/80 rounded-t transition-all duration-500 group-hover:bg-cyan-300"
                      style={{ height: `${callHeight || 4}%` }}
                      title={`Call Vol: ${formatNumber(r.callVolume, 0)} contracts`}
                    />
                    <div
                      className="w-1/2 bg-amber-500/80 rounded-t transition-all duration-500 group-hover:bg-amber-300"
                      style={{ height: `${putHeight || 4}%` }}
                      title={`Put Vol: ${formatNumber(r.putVolume, 0)} contracts`}
                    />
                  </div>
                  <span className={`text-[9px] font-mono whitespace-nowrap ${isSpot ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}>
                    ${formatNumber(r.strike, 0)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right 1 Col: Overall Volume Pie Chart in Numbers */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold uppercase text-slate-300 mb-1 flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-cyan-400" /> Overall Volume Split
            </span>
            <span className="text-[9px] text-slate-500 font-mono mb-1">(In Absolute Traded Contracts)</span>

            <div className="relative w-32 h-32 my-1 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {(() => {
                  const cVol = summary?.totalCallVolume || 1;
                  const pVol = summary?.totalPutVolume || 1;
                  const total = cVol + pVol;
                  const pCall = (cVol / total) * 100;
                  const pPut = (pVol / total) * 100;
                  const r = 15.9155;
                  const dashCall = `${pCall.toFixed(2)} ${(100 - pCall).toFixed(2)}`;
                  const dashPut = `${pPut.toFixed(2)} ${(100 - pPut).toFixed(2)}`;
                  const offsetPut = (-pCall).toFixed(2);
                  return (
                    <>
                      <circle cx="50" cy="50" r={r} fill="transparent" stroke="#1e293b" strokeWidth="6" />
                      <circle
                        cx="50"
                        cy="50"
                        r={r}
                        fill="transparent"
                        stroke="#06b6d4"
                        strokeWidth="6"
                        strokeDasharray={dashCall}
                        strokeDashoffset="0"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={r}
                        fill="transparent"
                        stroke="#f59e0b"
                        strokeWidth="6"
                        strokeDasharray={dashPut}
                        strokeDashoffset={offsetPut}
                      />
                    </>
                  );
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[8px] text-slate-400">Total Vol</span>
                <span className="text-[11px] font-bold text-white">
                  {formatNumber((summary?.totalCallVolume || 0) + (summary?.totalPutVolume || 0), 0)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between w-full text-[10px] font-mono px-2 mt-1">
              <div className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded bg-cyan-500" />
                <span>Call Vol: {formatNumber(summary?.totalCallVolume, 0)}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded bg-amber-500" />
                <span>Put Vol: {formatNumber(summary?.totalPutVolume, 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
