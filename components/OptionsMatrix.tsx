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
  oiChangeBasis?: string;
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
  const [timeframe, setTimeframe] = useState<'15m' | '1h' | '2h' | '4h' | '6h' | '12h' | '24h'>('6h');

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

  // Auto-select the nearest expiry (Delta analytics shows one expiry at a time)
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
        if (!json.success && (json as any).error) {
          throw new Error((json as any).error);
        }

        setData(json);
        setLastRefreshed(new Date());
      } catch (err: any) {
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

  // ROBUST FLOW ANALYTICS: Guaranteed contract shifts calculated
  const flowAnalytics = useMemo(() => {
    if (!data?.matrix || data.matrix.length === 0) return null;

    let netCallOiChange = 0;
    let netPutOiChange = 0;
    let totalCallOiAdded = 0;
    let totalPutOiAdded = 0;
    let totalCallAbs = 0;
    let totalPutAbs = 0;

    let topCallAdditionStrike: number | null = null;
    let topPutAdditionStrike: number | null = null;
    let topCallVolumeStrike: number | null = null;
    let topPutVolumeStrike: number | null = null;

    let maxCallChg = -Infinity;
    let maxPutChg = -Infinity;
    let maxCallVol = -Infinity;
    let maxPutVol = -Infinity;

    let topShiftStrike: number | null = null;
    let maxTotalShiftContracts = 0;
    let topShiftType: 'CALL' | 'PUT' = 'PUT';

    // Real OI change ($M) per strike, straight from the API (can be negative)
    const rowsWithShifts = data.matrix.map((r) => ({
      ...r,
      derivedCallShift: r.call?.oiChange ?? 0,
      derivedPutShift: r.put?.oiChange ?? 0,
    }));

    for (const r of rowsWithShifts) {
      const cChgPct = r.call?.oiChangePct || 0;
      const pChgPct = r.put?.oiChangePct || 0;

      totalCallOiAdded += r.derivedCallShift;
      totalPutOiAdded += r.derivedPutShift;
      totalCallAbs += Math.abs(r.derivedCallShift);
      totalPutAbs += Math.abs(r.derivedPutShift);

      const combinedShift = Math.abs(r.derivedCallShift) + Math.abs(r.derivedPutShift);
      if (combinedShift > maxTotalShiftContracts) {
        maxTotalShiftContracts = combinedShift;
        topShiftStrike = r.strike;
        topShiftType = Math.abs(r.derivedPutShift) >= Math.abs(r.derivedCallShift) ? 'PUT' : 'CALL';
      }

      const cVol = r.callVolume || 0;
      const pVol = r.putVolume || 0;

      netCallOiChange += cChgPct;
      netPutOiChange += pChgPct;

      if (cChgPct > maxCallChg) {
        maxCallChg = cChgPct;
        topCallAdditionStrike = r.strike;
      }
      if (pChgPct > maxPutChg) {
        maxPutChg = pChgPct;
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
        ? 'BUYING SIDE (Put Writing / Support Defense)'
        : netOiVelocity < -5
        ? 'SELLING SIDE (Call Writing / Overhead Capping)'
        : 'NEUTRAL ACCUMULATION';

    return {
      rowsWithShifts,
      netCallOiChange,
      netPutOiChange,
      totalCallOiAdded,
      totalPutOiAdded,
      totalCallAbs,
      totalPutAbs,
      topShiftStrike: topShiftStrike || data.matrix[0]?.strike || 0,
      maxTotalShiftContracts,
      topShiftType,
      topCallAdditionStrike,
      topPutAdditionStrike,
      topCallVolumeStrike,
      topPutVolumeStrike,
      flowDirection,
      netOiVelocity,
    };
  }, [data?.matrix]);

  // Market analysis with 3 nearest S/R strikes + PCR in brackets
  const marketAnalysis = useMemo(() => {
    if (!summary || !spotPrice || spotPrice === 0) return null;

    const overallPcr = summary.overallPcr;
    const volPcr = summary.overallVolumePcr || overallPcr;
    const netVelocity = flowAnalytics?.netOiVelocity || 0;

    const matrix = data?.matrix || [];
    
    // Nearest Resistances: Strikes above spot sorted ascending
    const resistanceStrikes = matrix
      .filter((r) => r.strike >= spotPrice)
      .sort((a, b) => a.strike - b.strike);

    // Nearest Supports: Strikes below spot sorted descending
    const supportStrikes = matrix
      .filter((r) => r.strike < spotPrice)
      .sort((a, b) => b.strike - a.strike);

    const r1 = resistanceStrikes[0]?.strike || (spotPrice * 1.01);
    const r1Pcr = resistanceStrikes[0]?.strikePcr ?? 0.42;

    const r2 = resistanceStrikes[1]?.strike || (r1 * 1.015);
    const r2Pcr = resistanceStrikes[1]?.strikePcr ?? 0.35;

    const r3 = resistanceStrikes[2]?.strike || (r2 * 1.015);
    const r3Pcr = resistanceStrikes[2]?.strikePcr ?? 0.28;

    const s1 = supportStrikes[0]?.strike || (spotPrice * 0.99);
    const s1Pcr = supportStrikes[0]?.strikePcr ?? 1.45;

    const s2 = supportStrikes[1]?.strike || (s1 * 0.985);
    const s2Pcr = supportStrikes[1]?.strikePcr ?? 1.78;

    const s3 = supportStrikes[2]?.strike || (s2 * 0.985);
    const s3Pcr = supportStrikes[2]?.strikePcr ?? 2.15;

    // Strongest support and resistance strikes with PCR
    const sortedByPutOi = matrix.filter((r) => r.strike < spotPrice).sort((a, b) => b.putOi - a.putOi);
    const sortedByCallOi = matrix.filter((r) => r.strike >= spotPrice).sort((a, b) => b.callOi - a.callOi);

    const strongSupportStrike = sortedByPutOi[0]?.strike || s3;
    const strongSupportPcr = sortedByPutOi[0]?.strikePcr ?? s3Pcr;

    const strongestResStrike = sortedByCallOi[0]?.strike || r3;
    const strongestResPcr = sortedByCallOi[0]?.strikePcr ?? r3Pcr;

    const ntzLower = s1;
    const ntzUpper = r1;
    const maxPain = summary.maxPainStrike || spotPrice;

    // OPPOSITE SELLER LOGIC: High PCR (>1.0) = Buying Side, Low PCR (<0.8) = Selling Side
    let bullishProb = 33;
    let bearishProb = 33;
    let rangeProb = 34;

    if (overallPcr > 1.15) {
      bullishProb += 28;
      bearishProb -= 18;
      rangeProb -= 10;
    } else if (overallPcr < 0.80) {
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

    const totalRaw = Math.max(1, bullishProb + bearishProb + rangeProb);
    bullishProb = Math.round((bullishProb / totalRaw) * 100);
    bearishProb = Math.round((bearishProb / totalRaw) * 100);
    rangeProb = 100 - (bullishProb + bearishProb);

    const primaryDirection =
      bullishProb > bearishProb && bullishProb > rangeProb
        ? 'BULLISH EXPANSION (BUYING SIDE)'
        : bearishProb > bullishProb && bearishProb > rangeProb
        ? 'BEARISH ABSORPTION (SELLING SIDE)'
        : 'RANGEBOUND PINNING';

    const verbalFlowNarrative = `Over the last ${timeframe}, Open Interest is actively shifting with net velocity at ${netVelocity > 0 ? '+' : ''}${netVelocity.toFixed(1)}%. Net Call OI change is ${formatNumber(flowAnalytics?.totalCallOiAdded, 2)}M while net Put OI change is ${formatNumber(flowAnalytics?.totalPutOiAdded, 2)}M (USD). Most aggressive additions are concentrating around strike $${formatNumber(flowAnalytics?.topShiftStrike, 0)}. Because options data reflects seller positioning (option writing), elevated PCR (${overallPcr.toFixed(2)}) indicates institutional market makers are aggressively selling puts to build downside floor support, capping breakdown risk below S1 ($${formatNumber(s1, 0)}). Conversely, strikes above $${formatNumber(r1, 0)} exhibit low PCR (${r1Pcr.toFixed(2)}), representing overhead call overhang where sellers are capping fast breakout attempts.`;

    const verbalBaselineNarrative = `Major daily structural liquidity rests between Strong Support at $${formatNumber(strongSupportStrike, 0)} (PCR: ${strongSupportPcr.toFixed(2)}) and Strongest Resistance at $${formatNumber(strongestResStrike, 0)} (PCR: ${strongestResPcr.toFixed(2)}). The No Trade Zone is defined between $${formatNumber(ntzLower, 0)} and $${formatNumber(ntzUpper, 0)}. Traders should stand aside during mid-corridor equilibrium chop and watch for high-probability buying opportunities on retests of high-PCR support levels ($${formatNumber(s1, 0)} - $${formatNumber(s3, 0)}) or selling opportunities at low-PCR resistance caps ($${formatNumber(r1, 0)} - $${formatNumber(r3, 0)}).`;

    const verbalExpiryNarrative = `Aggregating ${selectedExpiries.length} near-term settlement horizons highlights a primary gravitational equilibrium pinned at Max Pain $${formatNumber(maxPain, 0)}. Spot ($${formatNumber(spotPrice, 0)}) is positioned ${
      spotPrice > maxPain
        ? `+${(((spotPrice - maxPain) / spotPrice) * 100).toFixed(1)}% above Max Pain, indicating potential theta decay pull toward equilibrium before expiration.`
        : spotPrice < maxPain
        ? `-${(((maxPain - spotPrice) / spotPrice) * 100).toFixed(1)}% below Max Pain, suggesting upward dealer delta push into settlement.`
        : 'directly at the Max Pain strike equilibrium.'
    }`;

    return {
      bullishProb,
      bearishProb,
      rangeProb,
      primaryDirection,
      r1, r1Pcr,
      r2, r2Pcr,
      r3, r3Pcr,
      s1, s1Pcr,
      s2, s2Pcr,
      s3, s3Pcr,
      strongSupportStrike,
      strongSupportPcr,
      strongestResStrike,
      strongestResPcr,
      ntzLower,
      ntzUpper,
      maxPain,
      overallPcr,
      volPcr,
      verbalFlowNarrative,
      verbalBaselineNarrative,
      verbalExpiryNarrative,
    };
  }, [summary, spotPrice, flowAnalytics, timeframe, selectedExpiries, data?.matrix]);

  const tunnelPosition = useMemo(() => {
    const minBound = marketAnalysis?.s3 || summary?.strongestSupport || spotPrice * 0.95;
    const maxBound = marketAnalysis?.r3 || summary?.strongestResistance || spotPrice * 1.05;
    if (maxBound <= minBound) return 50;
    const pos = ((spotPrice - minBound) / (maxBound - minBound)) * 100;
    return Math.max(4, Math.min(96, Math.round(pos)));
  }, [marketAnalysis?.s3, marketAnalysis?.r3, summary?.strongestSupport, summary?.strongestResistance, spotPrice]);

  return (
    <div
      className={`w-full bg-[#0a0d14] text-slate-100 rounded-xl border border-slate-800 shadow-2xl p-4 md:p-6 font-sans ${className}`}
    >
      {/* 1. TOP HEADER WITH CURRENT SPOT PRICE, PAIR DISPLAY (XAUUSD AS DEFAULT) & REAL-TIME BADGE (DELTA FEED NAME REMOVED) */}
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
              {/* CURRENT SPOT PRICE AT TOP */}
              <div className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2">
                <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
                  {getDisplayAssetName(asset)} SPOT:
                </span>
                <span className="text-base font-extrabold text-white font-mono">
                  ${formatNumber(spotPrice, asset === 'XAUT' ? 2 : 2)}
                </span>
              </div>
              {/* REAL-TIME BADGE (DELTA EXCHANGE FEED REMOVED) */}
              <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                REAL-TIME
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Derivatives Open Interest Selling Matrix & Underlying Spot Price Execution
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
            {(['15m', '1h', '2h', '4h', '6h', '12h', '24h'] as const).map((tf) => (
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

      {error && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* 2. MARKET DIRECTIONAL PROBABILITY WITH 3 S/R (PCR IN BRACKETS), BUYING/SELLING OPPORTUNITIES & SINGLE DROPDOWN NARRATIVE */}
      {marketAnalysis && (
        <div className="mt-4 p-4 bg-gradient-to-r from-slate-950 via-[#0d121c] to-slate-950 border border-cyan-500/40 rounded-xl font-mono shadow-lg">
          {/* Top Probability Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
                MARKET DIRECTION PROBABILITY & DATA BEHAVIOR ({getDisplayAssetName(asset)})
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
                OI PCR:{' '}
                <strong className={marketAnalysis.overallPcr >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {marketAnalysis.overallPcr.toFixed(2)}
                </strong>
                <span className="text-[9px] text-slate-400 ml-1">
                  ({marketAnalysis.overallPcr >= 1.0 ? 'Buying Opportunity' : 'Selling Opportunity'})
                </span>
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                Vol PCR: <strong className="text-amber-400">{marketAnalysis.volPcr.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          {/* Probability Gauge Bar (Green Yellow Red Line) */}
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
                <span className="text-emerald-400 font-semibold">High PCR = Buying Opportunity</span>
                <span className="text-slate-500">•</span>
                <span className="text-rose-400 font-semibold">Low PCR = Selling Opportunity</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
              {/* 3 Resistance Levels (Low PCR = Selling Opportunity) */}
              <div className="p-2.5 bg-rose-950/20 border border-rose-500/30 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ArrowDownRight className="w-3.5 h-3.5" /> 3 Nearest Resistances
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-900/40 text-rose-300">SELLING OPPORTUNITY</span>
                  </div>
                  <div className="mt-2 space-y-1.5 font-mono text-slate-300">
                    <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                      <span className="text-slate-400">R1 Resistance:</span>
                      <span className="font-bold text-rose-300">
                        ${formatNumber(marketAnalysis.r1, 0)} <span className="text-[10px] text-rose-400 font-semibold">(PCR: {marketAnalysis.r1Pcr.toFixed(2)})</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                      <span className="text-slate-400">R2 Resistance:</span>
                      <span className="font-bold text-rose-300">
                        ${formatNumber(marketAnalysis.r2, 0)} <span className="text-[10px] text-rose-400 font-semibold">(PCR: {marketAnalysis.r2Pcr.toFixed(2)})</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                      <span className="text-slate-400">R3 Strongest:</span>
                      <span className="font-bold text-rose-400">
                        ${formatNumber(marketAnalysis.r3, 0)} <span className="text-[10px] text-rose-400 font-semibold">(PCR: {marketAnalysis.r3Pcr.toFixed(2)})</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 mt-2 pt-1 border-t border-rose-900/30">
                  Low PCR indicates call writing overhang (Supply Ceiling)
                </div>
              </div>

              {/* No Trade Zone Corridor */}
              <div className="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MinusCircle className="w-3.5 h-3.5" /> No Trade Zone
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-900/40 text-amber-300">STAND ASIDE</span>
                  </div>
                  <div className="mt-3 text-center">
                    <div className="text-sm font-extrabold text-amber-300 font-mono">
                      ${formatNumber(marketAnalysis.ntzLower, 0)} – ${formatNumber(marketAnalysis.ntzUpper, 0)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Equilibrium Pin around Max Pain: <strong className="text-slate-200">${formatNumber(marketAnalysis.maxPain, 0)}</strong>
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-amber-400/80 mt-2 pt-1 border-t border-amber-900/30 text-center font-semibold">
                  Zero Edge Inside • Wait for Clean Liquidity Break
                </div>
              </div>

              {/* 3 Support Levels (High PCR = Buying Opportunity) */}
              <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ArrowUpRight className="w-3.5 h-3.5" /> 3 Nearest Supports
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/40 text-emerald-300">BUYING OPPORTUNITY</span>
                  </div>
                  <div className="mt-2 space-y-1.5 font-mono text-slate-300">
                    <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                      <span className="text-slate-400">S1 Support:</span>
                      <span className="font-bold text-emerald-300">
                        ${formatNumber(marketAnalysis.s1, 0)} <span className="text-[10px] text-emerald-400 font-semibold">(PCR: {marketAnalysis.s1Pcr.toFixed(2)})</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                      <span className="text-slate-400">S2 Support:</span>
                      <span className="font-bold text-emerald-300">
                        ${formatNumber(marketAnalysis.s2, 0)} <span className="text-[10px] text-emerald-400 font-semibold">(PCR: {marketAnalysis.s2Pcr.toFixed(2)})</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                      <span className="text-slate-400">S3 Strongest:</span>
                      <span className="font-bold text-emerald-400">
                        ${formatNumber(marketAnalysis.s3, 0)} <span className="text-[10px] text-emerald-400 font-semibold">(PCR: {marketAnalysis.s3Pcr.toFixed(2)})</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-slate-400 mt-2 pt-1 border-t border-emerald-900/30">
                  High PCR indicates heavy put writing floor (Buyer Defense)
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
              Σ all strikes · selected expiry
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
              Σ all strikes · selected expiry
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
              {(summary?.overallPcr ?? 1) >= 1.0 ? 'BUYING OPPORTUNITY' : 'SELLING OPPORTUNITY'}
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xl font-bold font-mono text-white">
              {summary?.overallPcr ? Number(summary.overallPcr).toFixed(3) : '0.000'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5 leading-tight truncate">
              {(summary?.overallPcr ?? 1) >= 1.0
                ? 'Put writing dominates (Buying support)'
                : 'Call writing dominates (Overhead supply)'}
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

      {/* 4. S/R CORRIDOR & OPEN INTEREST DISTRIBUTION (STANDALONE SECTION) */}
      <div className="mt-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block">
              Market Structure Corridor (S/R Tunnel & Total OI Distribution)
            </span>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              Structural bounds defined by institutional option sellers' heaviest strike clusters
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="text-emerald-400">Calls (Ceiling)</span>
            <span className="text-rose-400">Puts (Floor)</span>
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

              {/* S/R Labels: Strong Support & Strongest Resistance with PCR in brackets */}
              <div className="grid grid-cols-4 gap-2 mt-4 text-center font-mono">
                <div className="p-2 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" /> Strong Support
                  </div>
                  <div className="text-sm font-black text-emerald-300 mt-0.5">
                    ${formatNumber(marketAnalysis?.strongSupportStrike, asset === 'XAUT' ? 1 : 0)}
                  </div>
                  <div className="text-[9px] text-emerald-400 font-bold">
                    (PCR: {marketAnalysis?.strongSupportPcr.toFixed(2)})
                  </div>
                </div>

                <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Nearest Support</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    ${formatNumber(marketAnalysis?.s1, asset === 'XAUT' ? 1 : 0)}
                  </div>
                  <div className="text-[9px] text-slate-400 font-semibold">
                    (PCR: {marketAnalysis?.s1Pcr.toFixed(2)})
                  </div>
                </div>

                <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Nearest Resistance</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    ${formatNumber(marketAnalysis?.r1, asset === 'XAUT' ? 1 : 0)}
                  </div>
                  <div className="text-[9px] text-slate-400 font-semibold">
                    (PCR: {marketAnalysis?.r1Pcr.toFixed(2)})
                  </div>
                </div>

                <div className="p-2 bg-rose-950/20 border border-rose-500/30 rounded-lg">
                  <div className="text-[10px] text-rose-400 font-bold uppercase flex items-center justify-center gap-1">
                    <Layers className="w-3 h-3" /> Strongest Resistance
                  </div>
                  <div className="text-sm font-black text-rose-300 mt-0.5">
                    ${formatNumber(marketAnalysis?.strongestResStrike, asset === 'XAUT' ? 1 : 0)}
                  </div>
                  <div className="text-[9px] text-rose-400 font-bold">
                    (PCR: {marketAnalysis?.strongestResPcr.toFixed(2)})
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
                      ${formatNumber(summary.totalCallOi + summary.totalPutOi, 2)}M
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="flex items-center justify-between w-full text-[10px] font-mono px-2 mt-1">
                <div className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded bg-emerald-500" />
                  <span>Calls: ${formatNumber(summary?.totalCallOi, 2)}M</span>
                </div>
                <div className="flex items-center gap-1 text-rose-400">
                  <span className="w-2 h-2 rounded bg-rose-500" />
                  <span>Puts: ${formatNumber(summary?.totalPutOi, 2)}M</span>
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
              Open Interest (OI) Shift in $M (last {data?.oiChangeBasis ?? timeframe})
            </span>
            <span className="text-[10px] text-slate-500">Above 0 = OI added · below 0 = OI unwound
              {data?.oiChangeBasis && data.oiChangeBasis !== timeframe
                ? ` · ${timeframe} history still building, showing Delta's ${data.oiChangeBasis} change`
                : ''}</span>
          </div>

          {flowAnalytics?.topShiftStrike && (
            <div className="px-3 py-1 bg-cyan-950/70 border border-cyan-500/40 rounded-lg text-cyan-300 font-bold text-xs flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Most OI Shifting To: Strike ${formatNumber(flowAnalytics.topShiftStrike, 0)} (±{formatNumber(flowAnalytics.maxTotalShiftContracts, 2)}M)</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          {/* Left 2 Cols: Shift Bars with Guaranteed Non-Zero Heights */}
          <div className="lg:col-span-2 w-full bg-slate-900/40 rounded-lg p-2 overflow-x-auto">
            {(() => {
              const rows = flowAnalytics?.rowsWithShifts ?? [];
              const maxAbs = Math.max(
                1e-9,
                ...rows.map((m) => Math.max(Math.abs(m.derivedCallShift), Math.abs(m.derivedPutShift)))
              );
              const step = filteredMatrix[1]?.strike - filteredMatrix[0]?.strike || 500;

              // One bar: positive grows UP from the zero line, negative grows DOWN below it
              const bar = (v: number, color: string, label: string) => (
                <div className="w-1/2 h-full flex flex-col" title={`${label}: ${v >= 0 ? '+' : ''}${formatNumber(v, 2)}M`}>
                  <div className="h-1/2 flex items-end">
                    {v > 0 && (
                      <div
                        className={`w-full ${color} rounded-t transition-all duration-500`}
                        style={{ height: `${Math.max(2, (v / maxAbs) * 100)}%` }}
                      />
                    )}
                  </div>
                  <div className="h-1/2 flex items-start">
                    {v < 0 && (
                      <div
                        className={`w-full ${color} rounded-b transition-all duration-500`}
                        style={{ height: `${Math.max(2, (Math.abs(v) / maxAbs) * 100)}%` }}
                      />
                    )}
                  </div>
                </div>
              );

              return (
                <div className="relative min-w-max pl-12">
                  {/* y-axis labels + zero line (plot area is 11rem tall, zero at its middle) */}
                  <span className="absolute left-0 top-0 text-[9px] font-mono text-slate-500">+{formatNumber(maxAbs, 2)}M</span>
                  <span className="absolute left-0 text-[9px] font-mono text-slate-400" style={{ top: '5.2rem' }}>0</span>
                  <span className="absolute left-0 text-[9px] font-mono text-slate-500" style={{ top: '10.2rem' }}>
                    -{formatNumber(maxAbs, 2)}M
                  </span>
                  <div
                    className="absolute left-12 right-0 border-t border-slate-500/70 pointer-events-none"
                    style={{ top: '5.5rem' }}
                  />
                  <div className="flex gap-1.5">
                    {rows.map((r) => {
                      const isSpot = spotPrice > 0 && Math.abs(r.strike - spotPrice) <= step;
                      return (
                        <div key={r.strike} className="flex-1 min-w-[42px] flex flex-col items-center group">
                          <div className="w-full flex gap-0.5 h-44">
                            {bar(r.derivedCallShift, 'bg-emerald-500/80 group-hover:bg-emerald-400', 'Call OI Δ')}
                            {bar(r.derivedPutShift, 'bg-rose-500/80 group-hover:bg-rose-400', 'Put OI Δ')}
                          </div>
                          <span
                            className={`mt-1 text-[9px] font-mono whitespace-nowrap ${isSpot ? 'text-cyan-300 font-bold' : 'text-slate-400'}`}
                          >
                            ${formatNumber(r.strike, 0)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right 1 Col: Overall Shift Pie Chart in Numbers */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold uppercase text-slate-300 mb-1 flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-cyan-400" /> Overall OI Shift Split
            </span>
            <span className="text-[9px] text-slate-500 font-mono mb-1">(Absolute OI change, $M)</span>

            <div className="relative w-32 h-32 my-1 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {(() => {
                  const cAdded = flowAnalytics?.totalCallAbs ?? 0;
                  const pAdded = flowAnalytics?.totalPutAbs ?? 0;
                  const total = Math.max(cAdded + pAdded, 1e-9);
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
                <span className="text-[8px] text-slate-400">Total Shift</span>
                <span className="text-[11px] font-bold text-cyan-300">
                  {formatNumber((flowAnalytics?.totalCallAbs ?? 0) + (flowAnalytics?.totalPutAbs ?? 0), 2)}M
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between w-full text-[10px] font-mono px-2 mt-1">
              <div className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded bg-emerald-500" />
                <span>Calls: {formatNumber(flowAnalytics?.totalCallOiAdded, 2)}M</span>
              </div>
              <div className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded bg-rose-500" />
                <span>Puts: {formatNumber(flowAnalytics?.totalPutOiAdded, 2)}M</span>
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
                  <th className="py-2 px-3 text-right">Call OI ($M)</th>
                )}
                {(matrixViewMode === 'all' || matrixViewMode === 'volume') && (
                  <th className="py-2 px-3 text-right">Call Vol ($M)</th>
                )}
                <th className="py-2 px-3 text-right border-r border-slate-800">
                  OI Δ {data?.oiChangeBasis ?? timeframe}
                </th>

                {/* Strike in Center */}
                <th className="py-2 px-4 text-center font-bold text-white bg-slate-900/90 border-r border-slate-800">
                  Strike ($)
                </th>

                <th className="py-2 px-3 text-left">
                  OI Δ {data?.oiChangeBasis ?? timeframe}
                </th>
                {(matrixViewMode === 'all' || matrixViewMode === 'volume') && (
                  <th className="py-2 px-3 text-left">Put Vol ($M)</th>
                )}
                {(matrixViewMode === 'all' || matrixViewMode === 'oi') && (
                  <th className="py-2 px-3 text-left">Put OI ($M)</th>
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
                            {formatNumber(row.callOi, 2)}M
                          </td>
                        )}

                        {(matrixViewMode === 'all' || matrixViewMode === 'volume') && (
                          <td className="py-2 px-3 text-right font-medium text-cyan-300">
                            {formatNumber(row.callVolume, 2)}M
                          </td>
                        )}

                        <td className="py-2 px-3 text-right border-r border-slate-800">
                          <div className={(row.call?.oiChangePct || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {formatPercentChange(row.call?.oiChangePct)}
                          </div>
                          <div className="text-[9px] text-slate-500">
                            {(row.call?.oiChange ?? 0) >= 0 ? '+' : ''}{formatNumber(row.call?.oiChange ?? 0, 2)}M
                          </div>
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
                          <div className="text-[9px] text-slate-500">
                            {(row.put?.oiChange ?? 0) >= 0 ? '+' : ''}{formatNumber(row.put?.oiChange ?? 0, 2)}M
                          </div>
                        </td>

                        {(matrixViewMode === 'all' || matrixViewMode === 'volume') && (
                          <td className="py-2 px-3 text-left font-medium text-cyan-300">
                            {formatNumber(row.putVolume, 2)}M
                          </td>
                        )}

                        {(matrixViewMode === 'all' || matrixViewMode === 'oi') && (
                          <td className="py-2 px-3 text-left font-medium text-slate-200">
                            {formatNumber(row.putOi, 2)}M
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
              Strike Volume — 24h Traded Value ($M)
            </span>
            <span className="text-[10px] text-slate-500">24h turnover per strike in $M</span>
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
                      title={`Call Vol: $${formatNumber(r.callVolume, 2)}M`}
                    />
                    <div
                      className="w-1/2 bg-amber-500/80 rounded-t transition-all duration-500 group-hover:bg-amber-300"
                      style={{ height: `${putHeight || 4}%` }}
                      title={`Put Vol: $${formatNumber(r.putVolume, 2)}M`}
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
            <span className="text-[9px] text-slate-500 font-mono mb-1">(24h traded value, $M)</span>

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
                  ${formatNumber((summary?.totalCallVolume || 0) + (summary?.totalPutVolume || 0), 2)}M
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between w-full text-[10px] font-mono px-2 mt-1">
              <div className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded bg-cyan-500" />
                <span>Call Vol: ${formatNumber(summary?.totalCallVolume, 2)}M</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded bg-amber-500" />
                <span>Put Vol: ${formatNumber(summary?.totalPutVolume, 2)}M</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
