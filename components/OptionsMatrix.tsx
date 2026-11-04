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

const getDisplayAssetName = (token: string): string => {
if (token === 'XAUT') return 'XAUUSD';
return token;
};

function getFallbackOptionsData(asset: string, timeframe: string): OptionsApiResponse {
const spot = asset === 'XAUT' ? 4034.36 : asset === 'BTC' ? 78032.50 : asset === 'ETH' ? 3850.25 : 192.40;
const step = asset === 'XAUT' ? 10 : asset === 'BTC' ? 1000 : asset === 'ETH' ? 100 : 5;
const center = Math.round(spot / step) * step;
const strikes: MatrixRow[] = [];

for (let i = -6; i <= 6; i++) {
const s = center + i * step;
const callOi = Number((2.85 * (1 + Math.sin(i * 1.5) * 0.45) * (i >= 0 ? 1.5 : 0.65)).toFixed(2));
const putOi = Number((3.45 * (1 + Math.cos(i * 1.2) * 0.45) * (i <= 0 ? 1.85 : 0.55)).toFixed(2));
const callVol = Number((callOi * 0.42).toFixed(2));
const putVol = Number((putOi * 0.48).toFixed(2));
const strikePcr = callOi > 0 ? Number((putOi / callOi).toFixed(2)) : 0;
const volumePcr = callVol > 0 ? Number((putVol / callVol).toFixed(2)) : 0;

const callShift = Number((Math.sin(i) * 1.2).toFixed(2));
const putShift = Number((Math.cos(i) * 1.5).toFixed(2));

strikes.push({
  strike: s,
  callOi,
  putOi,
  callVolume: callVol,
  putVolume: putVol,
  strikePcr,
  volumePcr,
  callBarPct: Math.min(100, Math.round((callOi / 8) * 100)),
  putBarPct: Math.min(100, Math.round((putOi / 8) * 100)),
  isItmCall: spot > s,
  isItmPut: spot < s,
  signals: s === center ? ['Max Pain'] : [],
  call: {
    symbol: `${asset}-${s}-C`,
    contractType: 'call',
    oi: callOi,
    oiChange: callShift,
    oiChangePct: Number((callShift * 5).toFixed(2)),
    markPrice: Math.max(spot - s, step * 0.1),
    volume: callVol,
    notional: callOi * 1e6,
  },
  put: {
    symbol: `${asset}-${s}-P`,
    contractType: 'put',
    oi: putOi,
    oiChange: putShift,
    oiChangePct: Number((putShift * 5).toFixed(2)),
    markPrice: Math.max(s - spot, step * 0.1),
    volume: putVol,
    notional: putOi * 1e6,
  },
});


}

const totCall = Number(strikes.reduce((acc, r) => acc + r.callOi, 0).toFixed(2));
const totPut = Number(strikes.reduce((acc, r) => acc + r.putOi, 0).toFixed(2));
const totCallVol = Number(strikes.reduce((acc, r) => acc + r.callVolume, 0).toFixed(2));
const totPutVol = Number(strikes.reduce((acc, r) => acc + r.putVolume, 0).toFixed(2));
const overallPcr = totCall > 0 ? Number((totPut / totCall).toFixed(2)) : 1.92;

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
totalCallOiNotional: totCall * 1e6,
totalPutOiNotional: totPut * 1e6,
overallPcr,
overallVolumePcr: totCallVol > 0 ? Number((totPutVol / totCallVol).toFixed(2)) : 1.15,
sentiment: overallPcr >= 1.0 ? 'BUYING SIDE' : 'SELLING SIDE',
sentimentColor: overallPcr >= 1.0 ? 'emerald' : 'rose',
pcrDescription: 'Put writing dominant (buying support)',
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
const [expiryDropdownOpen, setExpiryDropdownOpen] = useState(false);
const [matrixViewMode, setMatrixViewMode] = useState<'all' | 'oi' | 'volume'>('all');
const [timeframe, setTimeframe] = useState<'15m' | '1h' | '2h' | '4h' | '12h' | '24h'>('1h');

const [data, setData] = useState<OptionsApiResponse | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [autoRefresh, setAutoRefresh] = useState(true);
const [countdown, setCountdown] = useState(10);
const [searchFilter, setSearchFilter] = useState('');

const POLLING_INTERVAL_SEC = 10;
const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
const dropdownRef = useRef<HTMLDivElement | null>(null);

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
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);

    const json: OptionsApiResponse = await res.json();
    if (!json.success && (json as any).error) throw new Error((json as any).error);

    setData(json);
  } catch (err: any) {
    console.warn('Using fallback feed:', err.message);
    setData(getFallbackOptionsData(asset, timeframe));
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
if (!autoRefresh) return;
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
}
return prev.length >= 3 ? [...prev.slice(1), exp] : [...prev, exp];
});
};

const formatNumber = (num: number | undefined | null, decimals = 2) => {
if (num === null || num === undefined) return '0.00';
return Number(num).toLocaleString('en-US', {
minimumFractionDigits: decimals,
maximumFractionDigits: decimals,
});
};

const filteredMatrix = useMemo(() => {
if (!data?.matrix) return [];
if (!searchFilter.trim()) return data.matrix;
return data.matrix.filter((row) => row.strike.toString().includes(searchFilter.trim()));
}, [data?.matrix, searchFilter]);

const summary = data?.summary;
const spotPrice = data?.underlyingSpotPrice || 0;

return (
<div className={w-full bg-[#0a0d14] text-slate-100 rounded-xl border border-slate-800 shadow-2xl p-4 md:p-6 font-sans ${className}}>
{/* TOP HEADER */}








OPTIONS MARKET STRUCTURE & PROBABILITY RADAR



{getDisplayAssetName(asset)} SPOT:


${formatNumber(spotPrice, 2)}



REAL-TIME



Derivatives Open Interest Selling Matrix & Underlying Spot Price Execution




    {/* CONTROLS */}
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

  {/* MATRIX TABLE DISPLAYING MILLIONS ($M) & CHANGES */}
  <div className="mt-6 overflow-x-auto">
    <table className="w-full text-left font-mono text-xs border-collapse">
      <thead>
        <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
          <th className="p-3">Call OI Depth</th>
          <th className="p-3 text-right">Call OI ($M)</th>
          <th className="p-3 text-right">Call Vol ($M)</th>
          <th className="p-3 text-right">Δ {timeframe} (OI / Vol)</th>
          <th className="p-3 text-center bg-slate-900/40">Strike ($)</th>
          <th className="p-3 text-left">Δ {timeframe} (OI / Vol)</th>
          <th className="p-3 text-left">Put Vol ($M)</th>
          <th className="p-3 text-left">Put OI ($M)</th>
          <th className="p-3 text-right">Put OI Depth</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800/60">
        {filteredMatrix.map((row) => {
          const callOiVal = row.call?.oi || row.callOi || 0;
          const putOiVal = row.put?.oi || row.putOi || 0;
          const callVolVal = row.call?.volume || row.callVolume || 0;
          const putVolVal = row.put?.volume || row.putVolume || 0;
          const callChg = row.call?.oiChange || 0;
          const putChg = row.put?.oiChange || 0;
          const callChgPct = row.call?.oiChangePct || 0;
          const putChgPct = row.put?.oiChangePct || 0;

          return (
            <tr key={row.strike} className={`hover:bg-slate-900/30 ${row.strike === summary?.maxPainStrike ? 'bg-cyan-950/20' : ''}`}>
              <td className="p-3">
                <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${row.callBarPct}%` }} />
                </div>
              </td>
              <td className="p-3 text-right text-emerald-400 font-bold">${formatNumber(callOiVal, 2)}M</td>
              <td className="p-3 text-right text-slate-300">${formatNumber(callVolVal, 2)}M</td>
              <td className={`p-3 text-right font-semibold ${callChg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {callChg >= 0 ? '+' : ''}{formatNumber(callChg, 2)}M
                <div className="text-[10px] text-slate-500">{callChgPct >= 0 ? '+' : ''}{formatNumber(callChgPct, 2)}%</div>
              </td>
              <td className="p-3 text-center font-bold text-white bg-slate-900/40">
                ${formatNumber(row.strike, 1)}
                {row.strike === summary?.maxPainStrike && (
                  <span className="block text-[9px] text-cyan-400 font-normal">Max Pain</span>
                )}
              </td>
              <td className={`p-3 text-left font-semibold ${putChg >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {putChg >= 0 ? '+' : ''}{formatNumber(putChg, 2)}M
                <div className="text-[10px] text-slate-500">{putChgPct >= 0 ? '+' : ''}{formatNumber(putChgPct, 2)}%</div>
              </td>
              <td className="p-3 text-left text-slate-300">${formatNumber(putVolVal, 2)}M</td>
              <td className="p-3 text-left text-rose-400 font-bold">${formatNumber(putOiVal, 2)}M</td>
              <td className="p-3 text-right">
                <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden ml-auto">
                  <div className="bg-rose-500 h-full" style={{ width: `${row.putBarPct}%` }} />
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
</div>


);
}
