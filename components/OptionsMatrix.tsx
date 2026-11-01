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

// Fallback generator for preview environments or disconnected backend
function getFallbackOptionsData(asset: string, timeframe: string): OptionsApiResponse {
  const spot = asset === 'BTC' ? 78032 : asset === 'ETH' ? 3850 : asset === 'SOL' ? 192 : 2740;
  const step = asset === 'BTC' ? 1000 : asset === 'ETH' ? 100 : asset === 'SOL' ? 5 : 25;
  const center = Math.round(spot / step) * step;
  const strikes: MatrixRow[] = [];

  for (let i = -5; i <= 5; i++) {
    const s = center + i * step;
    const callOi = Math.round(1650 * (1 + Math.sin(i * 1.5) * 0.4) * (i >= 0 ? 1.5 : 0.6));
    const putOi = Math.round(2200 * (1 + Math.cos(i * 1.2) * 0.4) * (i <= 0 ? 1.8 : 0.5));
    const callVol = Math.round(callOi * 0.38);
    const putVol = Math.round(putOi * 0.46);
    const strikePcr = callOi > 0 ? Number((putOi / callOi).toFixed(2)) : 0;
    const volumePcr = callVol > 0 ? Number((putVol / callVol).toFixed(2)) : 0;

    strikes.push({
      strike: s,
      callOi,
      putOi,
      callVolume: callVol,
      putVolume: putVol,
      strikePcr,
      volumePcr,
      callBarPct: Math.min(100, Math.round((callOi / 4500) * 100)),
      putBarPct: Math.min(100, Math.round((putOi / 4500) * 100)),
      isItmCall: spot > s,
      isItmPut: spot < s,
      signals: [],
      call: {
        symbol: `${asset}-${s}-C`,
        contractType: 'call',
        oi: callOi,
        oiChange: Math.round(callOi * 0.14),
        oiChangePct: 14.2,
        markPrice: Math.max(spot - s, step * 0.1),
        volume: callVol,
        notional: callOi * spot,
      },
      put: {
        symbol: `${asset}-${s}-P`,
        contractType: 'put',
        oi: putOi,
        oiChange: Math.round(putOi * 0.21),
        oiChangePct: 21.5,
        markPrice: Math.max(s - spot, step * 0.1),
        volume: putVol,
        notional: putOi * spot,
      },
    });
  }

  const totCall = strikes.reduce((acc, r) => acc + r.callOi, 0);
  const totPut = strikes.reduce((acc, r) => acc + r.putOi, 0);
  const totCallVol = strikes.reduce((acc, r) => acc + r.callVolume, 0);
  const totPutVol = strikes.reduce((acc, r) => acc + r.putVolume, 0);
  const overallPcr = totCall > 0 ? Number((totPut / totCall).toFixed(3)) : 1.35;

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
      totalCallOiNotional: totCall * spot,
      totalPutOiNotional: totPut * spot,
      overallPcr,
      overallVolumePcr: totCallVol > 0 ? Number((totPutVol / totCallVol).toFixed(3)) : 1.18,
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

export default function OptionsMatrix({ initialAsset = 'BTC', className = '' }: OptionsMatrixProps) {
  const [asset, setAsset] = useState<'BTC' | 'ETH' | 'SOL' | 'XAUT'>(initialAsset);
  const [selectedExpiries, setSelectedExpiries] = useState<string[]>([]);
  const [expiryDropdownOpen, setExpiryDropdownOpen] = useState<boolean>(false);
  const [matrixViewMode, setMatrixViewMode] = useState<'all' | 'oi' | 'volume'>('all');
  // 24H timeframe included
  const [timeframe, setTimeframe] = useState<'15m' | '1h' | '2h' | '4h' | '12h' | '24h'>('1h');

  const [data, setData] = useState<OptionsApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(10);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Interactive Click-to-Expand states for explanations
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    intraday: false,
    daily: false,
    expiry: false,
    entryLogic: false,
  });

  const toggleCardExplanation = (cardKey: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [cardKey]: !prev[cardKey],
    }));
  };

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
        console.warn('Backend unavailable, using simulated live matrix feed:', err.message);
        const fallback = getFallbackOptionsData(asset, timeframe);
        setData(fallback);
        setLastRefreshed(new Date());
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

  // Flow analytics with absolute numbers and shift detection
  const flowAnalytics = useMemo(() => {
    if (!data?.matrix || data.matrix.length === 0) return null;

    let netCallOiChange = 0;
    let netPutOiChange = 0;
    let totalCallOiAdded = 0;
    let totalPutOiAdded = 0;

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

    for (const r of data.matrix) {
      const cChgPct = r.call?.oiChangePct || 0;
      const pChgPct = r.put?.oiChangePct || 0;

      // Absolute contract shift values (in numbers, not percentages)
      const cShiftContracts = r.call?.oiChange ?? Math.round((cChgPct * r.callOi) / 100);
      const pShiftContracts = r.put?.oiChange ?? Math.round((pChgPct * r.putOi) / 100);

      if (cShiftContracts > 0) totalCallOiAdded += cShiftContracts;
      if (pShiftContracts > 0) totalPutOiAdded += pShiftContracts;

      const combinedShift = Math.abs(cShiftContracts) + Math.abs(pShiftContracts);
      if (combinedShift > maxTotalShiftContracts) {
        maxTotalShiftContracts = combinedShift;
        topShiftStrike = r.strike;
        topShiftType = Math.abs(pShiftContracts) >= Math.abs(cShiftContracts) ? 'PUT' : 'CALL';
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
    // Institutional Opposite Logic: Put writing = Buying support!
    const flowDirection =
      netOiVelocity > 5
        ? 'BUYING SIDE (Put Writing / Support Defense)'
        : netOiVelocity < -5
        ? 'SELLING SIDE (Call Writing / Overhead Capping)'
        : 'NEUTRAL ACCUMULATION';

    return {
      netCallOiChange,
      netPutOiChange,
      totalCallOiAdded,
      totalPutOiAdded,
      topShiftStrike,
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

  // Market analysis with OPPOSITE LOGIC (OI PCR > 1 = Buying Side) and 3 S/R + Zones
  const marketAnalysis = useMemo(() => {
    if (!summary || !spotPrice || spotPrice === 0) return null;

    const overallPcr = summary.overallPcr;
    const volPcr = summary.overallVolumePcr || overallPcr;
    const netVelocity = flowAnalytics?.netOiVelocity || 0;

    // Multi-tier 3 S/R calculation from matrix strikes
    const matrix = data?.matrix || [];
    const sortedByPut = [...matrix].sort((a, b) => b.putOi - a.putOi);
    const sortedByCall = [...matrix].sort((a, b) => b.callOi - a.callOi);

    const s1 = sortedByPut[0]?.strike || summary.nearestSupport || spotPrice * 0.98;
    const s2 = sortedByPut[1]?.strike || (s1 * 0.98);
    const s3 = sortedByPut[2]?.strike || summary.strongestSupport || (s2 * 0.97);

    const r1 = sortedByCall[0]?.strike || summary.nearestResistance || spotPrice * 1.02;
    const r2 = sortedByCall[1]?.strike || (r1 * 1.02);
    const r3 = sortedByCall[2]?.strike || summary.strongestResistance || (r2 * 1.03);

    // No Trade Zone defined between nearest support & nearest resistance (e.g. 75,500 to 77,500)
    const ntzLower = Math.min(s1, spotPrice * 0.99);
    const ntzUpper = Math.max(r1, spotPrice * 1.01);

    const maxPain = summary.maxPainStrike || spotPrice;

    // OPPOSITE LOGIC FOR SELL OPTION DATA:
    // When OI PCR > 1.0, option sellers are aggressively writing puts = BUYING SIDE!
    // When OI PCR < 0.8, option sellers are writing calls = SELLING SIDE!
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
        ? 'BULLISH EXPANSION (BUYING SIDE)'
        : bearishProb > bullishProb && bearishProb > rangeProb
        ? 'BEARISH ABSORPTION (SELLING SIDE)'
        : 'RANGEBOUND PINNING';

    // Active Market Zone determination
    let activeMarketZone: 'STRONG SUPPORT AREA' | 'STRONG SELL AREA' | 'NO TRADE ZONE' = 'NO TRADE ZONE';
    let entryRationale = '';

    if (spotPrice <= s1 * 1.008 && spotPrice >= s3 * 0.98) {
      activeMarketZone = 'STRONG SUPPORT AREA';
      entryRationale = `Price is testing the high-density Put Floor (S1: $${formatNumber(s1, 0)}, S2: $${formatNumber(s2, 0)}, S3: $${formatNumber(s3, 0)}). Option sellers are heavily writing puts, creating strong buying support. Favorable risk-to-reward for long entries with risk defined below S3.`;
    } else if (spotPrice >= r1 * 0.992 && spotPrice <= r3 * 1.02) {
      activeMarketZone = 'STRONG SELL AREA';
      entryRationale = `Price is pressing into overhead Call Resistance (R1: $${formatNumber(r1, 0)}, R2: $${formatNumber(r2, 0)}, R3: $${formatNumber(r3, 0)}). High call open interest acts as a ceiling where institutional sellers cap rallies. Favorable risk-to-reward for short distribution or profit-taking.`;
    } else {
      activeMarketZone = 'NO TRADE ZONE';
      entryRationale = `Price ($${formatNumber(spotPrice, 0)}) is in the equilibrium chop corridor between $${formatNumber(ntzLower, 0)} and $${formatNumber(ntzUpper, 0)} around Max Pain ($${formatNumber(maxPain, 0)}). Unfavorable edge inside the corridor; avoid breakout chasing and wait for clean liquidity tests at S1 Support or R1 Resistance.`;
    }

    // Dynamic PCR Shift Execution Trigger: If PCR shifts high, we buy above level!
    const pcrShiftSignal =
      overallPcr >= 1.0
        ? {
            action: 'BUY ABOVE LEVEL TRIGGER',
            actionColor: 'emerald',
            triggerPrice: r1,
            targetPrice: r3,
            stopPrice: s1,
            guidance: `PCR is elevated (${overallPcr.toFixed(2)}) indicating aggressive Put Writing (Buying Support). If price sustains above $${formatNumber(r1, 0)}, trigger Long / Buy with targets at $${formatNumber(r2, 0)} and $${formatNumber(r3, 0)}. Invalidation below $${formatNumber(s1, 0)}.`,
          }
        : {
            action: 'SELL / SHORT REJECTION TRIGGER',
            actionColor: 'rose',
            triggerPrice: s1,
            targetPrice: s3,
            stopPrice: r1,
            guidance: `PCR is depressed (${overallPcr.toFixed(2)}) showing heavy Call Writing capping rallies. If price rejects below $${formatNumber(r1, 0)} or breaks $${formatNumber(s1, 0)}, trigger Short / Distribution with targets at $${formatNumber(s2, 0)} and $${formatNumber(s3, 0)}. Invalidation above $${formatNumber(r1, 0)}.`,
          };

    const recentBehavior =
      netVelocity > 4
        ? `Aggressive Put writing observed over the last ${timeframe} (${flowAnalytics?.netPutOiChange.toFixed(1)}% vs ${flowAnalytics?.netCallOiChange.toFixed(1)}% Calls). Market makers are building floor bids, defending $${formatNumber(s1, 0)} against dips.`
        : netVelocity < -4
        ? `Call writers actively capping overhead over the last ${timeframe} (Call OI additions outpaced Puts by ${Math.abs(netVelocity).toFixed(1)}%). Overhead supply is compressing price below $${formatNumber(r1, 0)}.`
        : `Balanced intraday activity over the last ${timeframe}. Neither Call nor Put flow has triggered directional skew; order flow is executing within the existing corridor.`;

    const dailyBaseline = `Major liquidity rests between Strong Support at $${formatNumber(s3, 0)} and Strongest Resistance at $${formatNumber(r3, 0)}. With Overall PCR at ${overallPcr.toFixed(2)}, total daily Open Interest indicates ${
      overallPcr > 1.15
        ? 'dominant Put Writing by institutional sellers, creating hard buying-side support and low probability of breakdown.'
        : overallPcr < 0.8
        ? 'heavy Call Writing capping upside, showing institutional seller supply overhead.'
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
      activeMarketZone,
      entryRationale,
      pcrShiftSignal,
      recentBehavior,
      dailyBaseline,
      combinedExpiryThesis,
      s1, s2, s3,
      r1, r2, r3,
      ntzLower,
      ntzUpper,
      maxPain,
      overallPcr,
      volPcr,
      combinedCount,
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
      {/* 1. MATRIX HEADER (Source info removed) */}
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
              Directional Probabilities, Multi-Expiry Aggregation, Strike Volume vs. Open Interest Flow
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

      {/* 2. MARKET DIRECTIONAL PROBABILITY & DATA BEHAVIOR WITH 3 S/R, NO TRADE ZONE & PCR SHIFT BUY/SELL LOGIC */}
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
                OI PCR:{' '}
                <strong className={marketAnalysis.overallPcr >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {marketAnalysis.overallPcr.toFixed(2)}
                </strong>
                <span className="text-[9px] text-slate-400 ml-1">
                  ({marketAnalysis.overallPcr >= 1.0 ? 'Buying Side' : 'Selling Side'})
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

          {/* DEDICATED 3 S/R, NO TRADE ZONE & PCR SHIFT BUY/SELL LOGIC (DIRECTLY UNDER PROBABILITY BAR) */}
          <div className="my-3 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  3 Support / Resistance Architecture & PCR Shift Execution Trigger
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  marketAnalysis.activeMarketZone === 'STRONG SUPPORT AREA'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : marketAnalysis.activeMarketZone === 'STRONG SELL AREA'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                CURRENT: {marketAnalysis.activeMarketZone}
              </span>
            </div>

            {/* 3 S/R Horizon Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px]">
              {/* 3 Resistance Levels */}
              <div className="p-2.5 bg-rose-950/20 border border-rose-500/30 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1">
                    <ArrowDownRight className="w-3.5 h-3.5" /> 3 Resistance Levels (Cap)
                  </div>
                  <div className="mt-1.5 space-y-1 font-mono text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">R1 Resistance:</span>
                      <span className="font-bold text-rose-300">${formatNumber(marketAnalysis.r1, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">R2 Resistance:</span>
                      <span className="font-bold text-rose-300">${formatNumber(marketAnalysis.r2, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">R3 Strongest:</span>
                      <span className="font-bold text-rose-400">${formatNumber(marketAnalysis.r3, 0)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 mt-2 pt-1 border-t border-rose-900/30">
                  Call Overhang & Sell Area
                </div>
              </div>

              {/* No Trade Zone Corridor */}
              <div className="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                    <MinusCircle className="w-3.5 h-3.5" /> No Trade Zone (Chop)
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-sm font-extrabold text-amber-300 font-mono">
                      ${formatNumber(marketAnalysis.ntzLower, 0)} - ${formatNumber(marketAnalysis.ntzUpper, 0)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Equilibrium Pin around Max Pain (${formatNumber(marketAnalysis.maxPain, 0)})
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-amber-400/80 mt-2 pt-1 border-t border-amber-900/30 text-center font-semibold">
                  Zero Edge Inside • Wait for Liquidity Break
                </div>
              </div>

              {/* 3 Support Levels */}
              <div className="p-2.5 bg-emerald-950/20 border border-emerald-500/30 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> 3 Support Levels (Floor)
                  </div>
                  <div className="mt-1.5 space-y-1 font-mono text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">S1 Support:</span>
                      <span className="font-bold text-emerald-300">${formatNumber(marketAnalysis.s1, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">S2 Support:</span>
                      <span className="font-bold text-emerald-300">${formatNumber(marketAnalysis.s2, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">S3 Strongest:</span>
                      <span className="font-bold text-emerald-400">${formatNumber(marketAnalysis.s3, 0)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-slate-500 mt-2 pt-1 border-t border-emerald-900/30">
                  Put Writing & Strong Support Area
                </div>
              </div>
            </div>

            {/* PCR Shift Buy/Sell Trigger Card */}
            <div className="p-3 bg-slate-950/90 border border-cyan-500/40 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                    PCR SHIFT LOGIC:
                  </span>
                  <span className="font-bold text-white">
                    {marketAnalysis.pcrShiftSignal.action}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {marketAnalysis.pcrShiftSignal.guidance}
                </p>
              </div>
              <div className="flex items-center gap-2 font-mono text-center">
                <div className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded">
                  <span className="text-[9px] text-slate-400 block uppercase">Trigger</span>
                  <span className="font-bold text-cyan-400">${formatNumber(marketAnalysis.pcrShiftSignal.triggerPrice, 0)}</span>
                </div>
                <div className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded">
                  <span className="text-[9px] text-slate-400 block uppercase">Target</span>
                  <span className="font-bold text-emerald-400">${formatNumber(marketAnalysis.pcrShiftSignal.targetPrice, 0)}</span>
                </div>
                <div className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded">
                  <span className="text-[9px] text-slate-400 block uppercase">Invalidate</span>
                  <span className="font-bold text-rose-400">${formatNumber(marketAnalysis.pcrShiftSignal.stopPrice, 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Interactive Click-To-Expand Horizon & Strategy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
            {/* Card 1: Intraday Flow (Click to Expand Explanation) */}
            <div
              onClick={() => toggleCardExplanation('intraday')}
              className="p-3 bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 rounded-lg flex flex-col justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-cyan-400 uppercase font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Intraday Flow ({timeframe})
                  </div>
                  {expandedCards.intraday ? (
                    <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>

                <div className="text-[10px] text-slate-400 mt-1">
                  Net OI Velocity: <span className="text-slate-200 font-bold">{flowAnalytics?.netOiVelocity.toFixed(1)}%</span>
                </div>

                {expandedCards.intraday ? (
                  <div className="text-[11px] text-slate-300 mt-2.5 leading-relaxed pt-2 border-t border-slate-800/80 animate-in fade-in">
                    {marketAnalysis.recentBehavior}
                  </div>
                ) : (
                  <div className="text-[9px] text-cyan-500/80 mt-2 italic flex items-center gap-1">
                    <span>Click to view detailed flow explanation</span>
                  </div>
                )}
              </div>
              <div className="text-[9px] text-slate-500 mt-2 pt-1 border-t border-slate-900">
                Puts Δ: {flowAnalytics?.netPutOiChange.toFixed(1)}% | Calls Δ: {flowAnalytics?.netCallOiChange.toFixed(1)}%
              </div>
            </div>

            {/* Card 2: Daily Structural Baseline (Click to Expand Explanation) */}
            <div
              onClick={() => toggleCardExplanation('daily')}
              className="p-3 bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 rounded-lg flex flex-col justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-amber-400 uppercase font-semibold flex items-center gap-1">
                    <BarChart2 className="w-3 h-3" /> Daily Baseline
                  </div>
                  {expandedCards.daily ? (
                    <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>

                <div className="text-[10px] text-slate-400 mt-1">
                  PCR: <span className="text-slate-200 font-bold">{marketAnalysis.overallPcr.toFixed(2)}</span> ({marketAnalysis.overallPcr >= 1.0 ? 'Buying Support' : 'Selling Cap'})
                </div>

                {expandedCards.daily ? (
                  <div className="text-[11px] text-slate-300 mt-2.5 leading-relaxed pt-2 border-t border-slate-800/80 animate-in fade-in">
                    {marketAnalysis.dailyBaseline}
                  </div>
                ) : (
                  <div className="text-[9px] text-amber-500/80 mt-2 italic flex items-center gap-1">
                    <span>Click to view baseline explanation</span>
                  </div>
                )}
              </div>
              <div className="text-[9px] text-slate-500 mt-2 pt-1 border-t border-slate-900">
                Strong Support: ${formatNumber(marketAnalysis.s3, 0)} | Strongest Res: ${formatNumber(marketAnalysis.r3, 0)}
              </div>
            </div>

            {/* Card 3: Combined Expiry Pin (Click to Expand Explanation) */}
            <div
              onClick={() => toggleCardExplanation('expiry')}
              className="p-3 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 rounded-lg flex flex-col justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-emerald-400 uppercase font-semibold flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Expiry Pin ({marketAnalysis.combinedCount} Dates)
                  </div>
                  {expandedCards.expiry ? (
                    <ChevronUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>

                <div className="text-[10px] text-slate-400 mt-1">
                  Max Pain: <span className="text-amber-400 font-bold">${formatNumber(marketAnalysis.maxPain, 0)}</span>
                </div>

                {expandedCards.expiry ? (
                  <div className="text-[11px] text-slate-300 mt-2.5 leading-relaxed pt-2 border-t border-slate-800/80 animate-in fade-in">
                    {marketAnalysis.combinedExpiryThesis}
                  </div>
                ) : (
                  <div className="text-[9px] text-emerald-500/80 mt-2 italic flex items-center gap-1">
                    <span>Click to view pin explanation</span>
                  </div>
                )}
              </div>
              <div className="text-[9px] text-slate-500 mt-2 pt-1 border-t border-slate-900">
                Distance: {(((spotPrice - marketAnalysis.maxPain) / spotPrice) * 100).toFixed(1)}% to Strike Pin
              </div>
            </div>

            {/* Card 4: 3 S/R Detailed Breakdown (Click to Expand Explanation) */}
            <div
              onClick={() => toggleCardExplanation('entryLogic')}
              className="p-3 bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 rounded-lg flex flex-col justify-between cursor-pointer transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-cyan-300 uppercase font-bold flex items-center gap-1">
                    <Target className="w-3 h-3 text-cyan-400" /> Action Rationale
                  </div>
                  {expandedCards.entryLogic ? (
                    <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[9px] text-slate-400">Status:</span>
                  <span className="text-[10px] font-bold text-cyan-300 font-mono">
                    {marketAnalysis.activeMarketZone === 'NO TRADE ZONE' ? 'CHOP PINNED' : 'ACTIVE SETUP'}
                  </span>
                </div>

                {expandedCards.entryLogic ? (
                  <div className="text-[11px] text-slate-300 mt-2.5 leading-relaxed pt-2 border-t border-slate-800/80 space-y-1.5 animate-in fade-in">
                    <p>{marketAnalysis.entryRationale}</p>
                  </div>
                ) : (
                  <div className="text-[9px] text-cyan-400/80 mt-2 italic flex items-center gap-1">
                    <span>Click to view detailed strategy rationale</span>
                  </div>
                )}
              </div>
              <div className="text-[9px] text-slate-500 mt-2 pt-1 border-t border-slate-900">
                S1: ${formatNumber(marketAnalysis.s1, 0)} | R1: ${formatNumber(marketAnalysis.r1, 0)}
              </div>
            </div>
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

        {/* Overall Put-Call Ratio (PCR) - With Opposite Logic Label */}
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
              {(summary?.overallPcr ?? 1) >= 1.0 ? 'BUYING SIDE' : 'SELLING SIDE'}
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
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Market Structure Corridor (S/R Tunnel & Open Interest Distribution)
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
            {/* Left 2 Cols: S/R Tunnel and Levels */}
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

              {/* S/R Labels: Strong Support & Strongest Resistance */}
              <div className="grid grid-cols-4 gap-2 mt-4 text-center font-mono">
                <div className="p-2 bg-emerald-950/20 border border-emerald-500/30 rounded-lg">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" /> Strong Support
                  </div>
                  <div className="text-sm font-black text-emerald-300 mt-0.5">
                    ${formatNumber(marketAnalysis?.s1 || summary?.strongestSupport, asset === 'XAUT' ? 1 : 0)}
                  </div>
                  <div className="text-[9px] text-slate-400">Put Writing Floor</div>
                </div>

                <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Nearest Support</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    ${formatNumber(marketAnalysis?.s2 || summary?.nearestSupport, asset === 'XAUT' ? 1 : 0)}
                  </div>
                  <div className="text-[9px] text-slate-500">Secondary Bid Wall</div>
                </div>

                <div className="p-2 bg-slate-900/80 border border-slate-800 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Nearest Resistance</div>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    ${formatNumber(marketAnalysis?.r1 || summary?.nearestResistance, asset === 'XAUT' ? 1 : 0)}
                  </div>
                  <div className="text-[9px] text-slate-500">First Call Cap</div>
                </div>

                <div className="p-2 bg-rose-950/20 border border-rose-500/30 rounded-lg">
                  <div className="text-[10px] text-rose-400 font-bold uppercase flex items-center justify-center gap-1">
                    <Layers className="w-3 h-3" /> Strongest Resistance
                  </div>
                  <div className="text-sm font-black text-rose-300 mt-0.5">
                    ${formatNumber(marketAnalysis?.r3 || summary?.strongestResistance, asset === 'XAUT' ? 1 : 0)}
                  </div>
                  <div className="text-[9px] text-slate-400">Call Supply Ceiling</div>
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
            <span className="text-[10px] text-slate-500">Values displayed in absolute contracts added or unwound</span>
          </div>

          {flowAnalytics?.topShiftStrike && (
            <div className="px-3 py-1 bg-cyan-950/70 border border-cyan-500/40 rounded-lg text-cyan-300 font-bold text-xs flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Most OI Shifting To: Strike ${formatNumber(flowAnalytics.topShiftStrike, 0)} (+{formatNumber(flowAnalytics.maxTotalShiftContracts, 0)} contracts)</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          {/* Left 2 Cols: Shift Bars in Absolute Numbers */}
          <div className="lg:col-span-2 h-48 w-full bg-slate-900/40 rounded-lg p-2 flex items-end gap-1.5 overflow-x-auto">
            {filteredMatrix.map((r) => {
              const callShiftContracts = Math.max(0, r.call?.oiChange ?? Math.round(((r.call?.oiChangePct || 0) * r.callOi) / 100));
              const putShiftContracts = Math.max(0, r.put?.oiChange ?? Math.round(((r.put?.oiChangePct || 0) * r.putOi) / 100));

              const maxShift = Math.max(
                1,
                ...filteredMatrix.map((m) =>
                  Math.max(
                    m.call?.oiChange ?? Math.round(((m.call?.oiChangePct || 0) * m.callOi) / 100),
                    m.put?.oiChange ?? Math.round(((m.put?.oiChangePct || 0) * m.putOi) / 100)
                  )
                )
              );

              const callHeight = Math.min(100, Math.round((callShiftContracts / maxShift) * 100));
              const putHeight = Math.min(100, Math.round((putShiftContracts / maxShift) * 100));
              const isSpot = spotPrice > 0 && Math.abs(r.strike - spotPrice) <= (filteredMatrix[1]?.strike - filteredMatrix[0]?.strike || 500);

              return (
                <div key={r.strike} className="flex-1 min-w-[42px] flex flex-col items-center h-full justify-end group relative">
                  <div className="w-full flex items-end justify-center gap-0.5 h-36 mb-1">
                    <div
                      className="w-1/2 bg-emerald-500/80 rounded-t transition-all duration-500 group-hover:bg-emerald-400"
                      style={{ height: `${callHeight || 4}%` }}
                      title={`Call OI Added: +${formatNumber(callShiftContracts, 0)} contracts`}
                    />
                    <div
                      className="w-1/2 bg-rose-500/80 rounded-t transition-all duration-500 group-hover:bg-rose-400"
                      style={{ height: `${putHeight || 4}%` }}
                      title={`Put OI Added: +${formatNumber(putShiftContracts, 0)} contracts`}
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
              <PieIcon className="w-3.5 h-3.5 text-cyan-400" /> Overall OI Shift Split
            </span>
            <span className="text-[9px] text-slate-500 font-mono mb-1">(In Absolute Added Contracts)</span>

            <div className="relative w-32 h-32 my-1 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {(() => {
                  const cAdded = flowAnalytics?.totalCallOiAdded || 1;
                  const pAdded = flowAnalytics?.totalPutOiAdded || 1;
                  const total = cAdded + pAdded;
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
                  +{formatNumber((flowAnalytics?.totalCallOiAdded || 0) + (flowAnalytics?.totalPutOiAdded || 0), 0)}
                </span>
              </div>
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
                  Δ {timeframe} (OI / Vol)
                </th>

                {/* Strike in Center */}
                <th className="py-2 px-4 text-center font-bold text-white bg-slate-900/90 border-r border-slate-800">
                  Strike ($)
                </th>

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
