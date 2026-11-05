/**
 * Next.js App Router API Route: /api/options
 * Target path in repo: app/api/options/route.ts
 *
 * Data source: Delta Exchange India PUBLIC endpoint (no API key needed)
 *   GET /v2/tickers?contract_types=call_options,put_options&underlying_asset_symbols=XAUT
 *
 * Field mapping:
 *   oi_value_usd      -> Open Interest ($)   (what Delta's Options Analytics charts)
 *   oi_contracts / oi -> OI in contracts     (used for Max Pain)
 *   turnover_usd      -> Volume ($)
 *   oi_change_usd_6h  -> OI change over last 6h ($)  (fallback until history exists)
 *   spot_price        -> underlying spot
 *   strike_price      -> strike
 *
 * Add ?debug=1 to the URL to see the raw ticker fields Delta returns.
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_URL = process.env.DELTA_API_BASE_URL || 'https://api.india.delta.exchange';
const M = 1_000_000;

const TF_MS: Record<string, number> = {
  '15m': 15 * 60_000,
  '1h': 60 * 60_000,
  '2h': 2 * 60 * 60_000,
  '4h': 4 * 60 * 60_000,
  '12h': 12 * 60 * 60_000,
  '24h': 24 * 60 * 60_000,
};

interface OptionMetrics {
  symbol: string;
  contractType: 'call' | 'put';
  oi: number; // $M
  oiChange: number; // $M
  oiChangePct: number;
  markPrice: number;
  volume: number; // $M
  notional: number; // $
}

interface Leg {
  oiUsd: number;
  oiContracts: number;
  volUsd: number;
  changeUsd: number;
  prevUsd: number;
  markPrice: number;
  symbols: string[];
}

/* ---------------- caches ---------------- */

const tickerCache: Record<string, { ts: number; tickers: any[] }> = {};
const TICKER_TTL_MS = 5000;

// OI snapshot history per asset, used to compute Δ for 15m/1h/2h/4h/12h/24h.
// Lives in server memory: resets on cold start / serverless. Until enough
// history exists we fall back to Delta's own 6h OI change field.
interface Snapshot {
  ts: number;
  oi: Record<string, number>;
}
const history: Record<string, Snapshot[]> = {};
const SNAPSHOT_EVERY_MS = 60_000;
const HISTORY_KEEP_MS = 25 * 60 * 60_000;

/* ---------------- helpers ---------------- */

const num = (v: any): number => {
  const n = typeof v === 'string' ? parseFloat(v) : Number(v);
  return Number.isFinite(n) ? n : 0;
};
const round = (n: number, d = 2) => Number(n.toFixed(d));

/** C-XAUT-4020-041126 -> 2026-11-04 */
function parseExpiryFromSymbol(symbol: string): string | null {
  const raw = symbol.split('-')[3];
  if (raw && raw.length === 6 && /^\d+$/.test(raw)) {
    return `20${raw.slice(4, 6)}-${raw.slice(2, 4)}-${raw.slice(0, 2)}`;
  }
  return null;
}

function expiryOf(t: any): string | null {
  return parseExpiryFromSymbol(t.symbol || '') || (t.settlement_time ? String(t.settlement_time).split('T')[0] : null);
}

function calculateMaxPain(rows: { strike: number; callContracts: number; putContracts: number }[]): number | null {
  if (!rows.length) return null;
  let best: number | null = null;
  let min = Infinity;
  for (const { strike: price } of rows) {
    let loss = 0;
    for (const r of rows) {
      if (price > r.strike) loss += (price - r.strike) * r.callContracts;
      if (price < r.strike) loss += (r.strike - price) * r.putContracts;
    }
    if (loss < min) {
      min = loss;
      best = price;
    }
  }
  return best;
}

async function getOptionTickers(asset: string): Promise<any[]> {
  const cached = tickerCache[asset];
  if (cached && Date.now() - cached.ts < TICKER_TTL_MS) return cached.tickers;

  const url = `${BASE_URL}/v2/tickers?contract_types=call_options,put_options&underlying_asset_symbols=${asset}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'TheCorporateTrader-OptionsMatrix/1.0' },
    cache: 'no-store',
  });

  if (res.status === 429) {
    if (cached) return cached.tickers;
    throw Object.assign(new Error('Delta Exchange rate limit reached (429).'), { status: 429 });
  }
  if (!res.ok) throw new Error(`Delta Exchange HTTP ${res.status}`);

  const json = await res.json();
  const tickers: any[] = Array.isArray(json.result) ? json.result : [];
  tickerCache[asset] = { ts: Date.now(), tickers };
  return tickers;
}

function recordSnapshot(asset: string, tickers: any[]) {
  const now = Date.now();
  const list = (history[asset] ||= []);
  const last = list[list.length - 1];
  if (last && now - last.ts < SNAPSHOT_EVERY_MS) return;
  const oi: Record<string, number> = {};
  for (const t of tickers) if (t.symbol) oi[t.symbol] = num(t.oi_value_usd);
  list.push({ ts: now, oi });
  while (list.length && now - list[0].ts > HISTORY_KEEP_MS) list.shift();
}

/** newest snapshot at least tfMs old, or null if history is too short */
function findBaseline(asset: string, tfMs: number): Snapshot | null {
  const target = Date.now() - tfMs;
  let found: Snapshot | null = null;
  for (const s of history[asset] || []) {
    if (s.ts <= target) found = s;
    else break;
  }
  return found;
}

/* ---------------- handler ---------------- */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const asset = (searchParams.get('asset') || 'BTC').toUpperCase();
  const timeframe = (searchParams.get('timeframe') || '1h').toLowerCase();
  const rawExpiry = searchParams.get('expiry');
  const debug = searchParams.get('debug') === '1';

  try {
    const tickers = await getOptionTickers(asset);

    const options = tickers.filter((t: any) => {
      const sym: string = t.symbol || '';
      const isCall = t.contract_type === 'call_options' || sym.startsWith('C-');
      const isPut = t.contract_type === 'put_options' || sym.startsWith('P-');
      if (!isCall && !isPut) return false;
      const underlying = t.underlying_asset_symbol || t.underlying_asset?.symbol;
      return underlying ? underlying === asset : sym.includes(`-${asset}-`);
    });

    if (debug) {
      return NextResponse.json({
        count: options.length,
        sampleCall: options.find((t) => String(t.contract_type).startsWith('call')) ?? null,
        samplePut: options.find((t) => String(t.contract_type).startsWith('put')) ?? null,
      });
    }

    if (options.length === 0) {
      return NextResponse.json(
        { success: false, error: `Delta returned no option tickers for ${asset}.` },
        { status: 502 }
      );
    }

    recordSnapshot(asset, options);

    /* expiries */
    const expirySet = new Set<string>();
    for (const t of options) {
      const e = expiryOf(t);
      if (e) expirySet.add(e);
    }
    const availableExpiries = Array.from(expirySet).sort();

    const requested = rawExpiry
      ? rawExpiry.split(',').map((s) => s.trim()).filter((s) => availableExpiries.includes(s)).slice(0, 3)
      : [];
    // Delta's analytics page shows ONE expiry at a time -> default to nearest
    const activeExpiries = requested.length ? requested : availableExpiries.slice(0, 1);

    const selected = options.filter((t) => {
      const e = expiryOf(t);
      return !!e && activeExpiries.includes(e);
    });

    /* spot */
    let spot = 0;
    for (const t of selected.length ? selected : options) {
      const s = num(t.spot_price ?? t.underlying_spot_price);
      if (s > 0) {
        spot = s;
        break;
      }
    }

    /* spot fallback: options tickers sometimes omit spot_price */
    if (!spot) {
      for (const sym of [`${asset}USD`, `${asset}USDT`]) {
        try {
          const r = await fetch(`${BASE_URL}/v2/tickers/${sym}`, { cache: 'no-store' });
          if (!r.ok) continue;
          const j = await r.json();
          const p = num(j?.result?.spot_price ?? j?.result?.mark_price);
          if (p > 0) {
            spot = p;
            break;
          }
        } catch {
          /* try next symbol */
        }
      }
    }

    /* Δ baseline */
    const baseline = findBaseline(asset, TF_MS[timeframe] ?? TF_MS['1h']);
    const oiChangeBasis = baseline ? timeframe : '6h';

    /* aggregate by strike */
    const map = new Map<number, { call: Leg | null; put: Leg | null }>();

    for (const t of selected) {
      const strike = num(t.strike_price ?? t.strike);
      if (!strike) continue;
      const isCall = t.contract_type === 'call_options' || (t.symbol || '').startsWith('C-');

      const contracts = num(t.oi_contracts ?? t.oi);
      let oiUsd = num(t.oi_value_usd);
      if (!oiUsd && t.contract_value) oiUsd = contracts * num(t.contract_value) * (spot || strike);

      const volUsd = num(t.turnover_usd ?? t.turnover);

      let changeUsd: number;
      let prevUsd: number;
      if (baseline) {
        prevUsd = baseline.oi[t.symbol] ?? 0;
        changeUsd = oiUsd - prevUsd;
      } else {
        changeUsd = num(t.oi_change_usd_6h);
        prevUsd = oiUsd - changeUsd;
      }

      const row = map.get(strike) || { call: null, put: null };
      const key = isCall ? 'call' : 'put';
      const leg: Leg = row[key] || {
        oiUsd: 0,
        oiContracts: 0,
        volUsd: 0,
        changeUsd: 0,
        prevUsd: 0,
        markPrice: num(t.mark_price),
        symbols: [],
      };
      leg.oiUsd += oiUsd;
      leg.oiContracts += contracts;
      leg.volUsd += volUsd;
      leg.changeUsd += changeUsd;
      leg.prevUsd += prevUsd;
      leg.symbols.push(t.symbol);
      row[key] = leg;
      map.set(strike, row);
    }

    const strikes = Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
    if (!spot && strikes.length) spot = strikes[Math.floor(strikes.length / 2)][0];

    const toMetrics = (leg: Leg | null, type: 'call' | 'put', strike: number): OptionMetrics | null =>
      leg
        ? {
            symbol: leg.symbols[0] || `${type}-${strike}`,
            contractType: type,
            oi: round(leg.oiUsd / M),
            oiChange: round(leg.changeUsd / M),
            oiChangePct: leg.prevUsd > 0 ? round((leg.changeUsd / leg.prevUsd) * 100, 1) : 0,
            markPrice: leg.markPrice,
            volume: round(leg.volUsd / M),
            notional: leg.oiUsd,
          }
        : null;

    let totalCallUsd = 0;
    let totalPutUsd = 0;
    let totalCallVolUsd = 0;
    let totalPutVolUsd = 0;
    let maxCall = 0;
    let maxPut = 0;

    const base = strikes.map(([strike, r]) => {
      const callUsd = r.call?.oiUsd ?? 0;
      const putUsd = r.put?.oiUsd ?? 0;
      totalCallUsd += callUsd;
      totalPutUsd += putUsd;
      totalCallVolUsd += r.call?.volUsd ?? 0;
      totalPutVolUsd += r.put?.volUsd ?? 0;
      maxCall = Math.max(maxCall, callUsd);
      maxPut = Math.max(maxPut, putUsd);
      return {
        strike,
        callUsd,
        putUsd,
        callVolUsd: r.call?.volUsd ?? 0,
        putVolUsd: r.put?.volUsd ?? 0,
        callContracts: r.call?.oiContracts ?? 0,
        putContracts: r.put?.oiContracts ?? 0,
        call: toMetrics(r.call, 'call', strike),
        put: toMetrics(r.put, 'put', strike),
      };
    });

    const maxPainStrike = calculateMaxPain(base);

    const above = base.filter((r) => r.strike >= spot);
    const below = base.filter((r) => r.strike < spot);
    const top = (rows: typeof base, k: 'callUsd' | 'putUsd') =>
      rows.reduce<(typeof base)[number] | null>((b, r) => (!b || r[k] > b[k] ? r : b), null);
    const strongestResistance = top(above, 'callUsd')?.strike ?? null;
    const strongestSupport = top(below, 'putUsd')?.strike ?? null;

    let maxCallVol = 0;
    let maxPutVol = 0;
    for (const r of base) {
      maxCallVol = Math.max(maxCallVol, r.callVolUsd);
      maxPutVol = Math.max(maxPutVol, r.putVolUsd);
    }

    const matrix = base.map((r) => {
      const signals: string[] = [];
      if (r.strike === maxPainStrike) signals.push('Max Pain');
      if (r.strike === strongestResistance) signals.push('Call Wall');
      if (r.strike === strongestSupport) signals.push('Put Wall');
      return {
        strike: r.strike,
        callOi: round(r.callUsd / M),
        putOi: round(r.putUsd / M),
        callVolume: round(r.callVolUsd / M),
        putVolume: round(r.putVolUsd / M),
        strikePcr: r.callUsd > 0 ? round(r.putUsd / r.callUsd) : r.putUsd > 0 ? 99.9 : 0,
        volumePcr: r.callVolUsd > 0 ? round(r.putVolUsd / r.callVolUsd) : 0,
        callBarPct: maxCall > 0 ? Math.round((r.callUsd / maxCall) * 100) : 0,
        putBarPct: maxPut > 0 ? Math.round((r.putUsd / maxPut) * 100) : 0,
        callVolBarPct: maxCallVol > 0 ? Math.round((r.callVolUsd / maxCallVol) * 100) : 0,
        putVolBarPct: maxPutVol > 0 ? Math.round((r.putVolUsd / maxPutVol) * 100) : 0,
        isItmCall: spot > r.strike,
        isItmPut: spot < r.strike,
        signals,
        call: r.call,
        put: r.put,
      };
    });

    const overallPcr = totalCallUsd > 0 ? round(totalPutUsd / totalCallUsd, 2) : 0;
    const overallVolumePcr = totalCallVolUsd > 0 ? round(totalPutVolUsd / totalCallVolUsd, 2) : 0;

    return NextResponse.json(
      {
        success: true,
        asset,
        underlyingSpotPrice: spot,
        timeframe,
        oiChangeBasis,
        selectedExpiries: activeExpiries,
        availableExpiries,
        summary: {
          totalCallOi: round(totalCallUsd / M),
          totalPutOi: round(totalPutUsd / M),
          totalCallVolume: round(totalCallVolUsd / M),
          totalPutVolume: round(totalPutVolUsd / M),
          totalCallOiNotional: totalCallUsd,
          totalPutOiNotional: totalPutUsd,
          overallPcr,
          overallVolumePcr,
          sentiment: overallPcr >= 1 ? 'BUYING SIDE' : 'SELLING SIDE',
          sentimentColor: overallPcr >= 1 ? 'emerald' : 'rose',
          pcrDescription:
            overallPcr >= 1 ? 'Put writing dominant (buying support)' : 'Call writing dominant (capping upside)',
          positionBuilding: '',
          maxPainStrike,
          nearestResistance: above[0]?.strike ?? null,
          strongestResistance,
          nearestSupport: below[below.length - 1]?.strike ?? null,
          strongestSupport,
          contractsCount: selected.length,
        },
        matrix,
        updatedAt: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error: any) {
    console.error('Options Matrix Route Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch options data' },
      { status: error.status || 500 }
    );
  }
}
