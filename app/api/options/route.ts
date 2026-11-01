/**
 * Next.js App Router API Route: /api/options
 * Target Path in Repo: app/api/options/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

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

interface StrikeRow {
  strike: number;
  callOi: number;
  putOi: number;
  strikePcr: number;
  call: OptionMetrics | null;
  put: OptionMetrics | null;
}

const memoryCache: {
  data: Record<string, any>;
  timestamp: Record<string, number>;
  TTL_MS: number;
} = {
  data: {},
  timestamp: {},
  TTL_MS: 8000,
};

function generateSignature(
  secret: string,
  method: string,
  timestamp: string,
  path: string,
  queryString: string = '',
  payload: string = ''
): string {
  if (!secret) return '';
  const message = `${method}${timestamp}${path}${queryString}${payload}`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

function calculateMaxPain(strikesData: StrikeRow[]): number | null {
  if (!strikesData || strikesData.length === 0) return null;

  let minTotalLoss = Infinity;
  let maxPainStrike: number | null = null;
  const strikePrices = strikesData.map((d) => d.strike);

  for (const assumedPrice of strikePrices) {
    let totalLoss = 0;

    for (const item of strikesData) {
      const strike = item.strike;
      if (assumedPrice > strike) {
        totalLoss += (assumedPrice - strike) * (item.callOi || 0);
      }
      if (assumedPrice < strike) {
        totalLoss += (strike - assumedPrice) * (item.putOi || 0);
      }
    }

    if (totalLoss < minTotalLoss) {
      minTotalLoss = totalLoss;
      maxPainStrike = assumedPrice;
    }
  }

  return maxPainStrike;
}

function parseExpiryFromSymbol(symbol: string): string | null {
  const parts = symbol.split('-');
  if (parts.length >= 4) {
    const raw = parts[3];
    if (raw.length === 6 && /^\d+$/.test(raw)) {
      const day = raw.slice(0, 2);
      const month = raw.slice(2, 4);
      const year = `20${raw.slice(4, 6)}`;
      return `${year}-${month}-${day}`;
    }
    return raw;
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const asset = (searchParams.get('asset') || 'BTC').toUpperCase();
  const selectedExpiry = searchParams.get('expiry') || null;
  const cacheKey = `${asset}_${selectedExpiry || 'all'}`;

  const now = Date.now();
  if (memoryCache.data[cacheKey] && now - (memoryCache.timestamp[cacheKey] || 0) < memoryCache.TTL_MS) {
    return NextResponse.json(memoryCache.data[cacheKey], {
      headers: { 'X-Cache': 'HIT' },
    });
  }

  const BASE_URL = process.env.DELTA_API_BASE_URL || 'https://api.india.delta.exchange';
  const apiKey = process.env.DELTA_API_KEY || 'By2YALvdoXAcqSXCfgpJq6YTakpHFD';
  const apiSecret = process.env.DELTA_API_SECRET || '9xMK3nZbkNRZwuSk2zYldxCWejBimfGFZILW3eGeythcQp6fAl9Un0u8lyVW';

  const timestamp = Math.floor(Date.now() / 1000).toString();

  // Query options contracts directly for BTC, ETH, SOL, XAUT
  const tickersPath = '/v2/tickers';
  const tickersQuery = `?contract_types=call_options,put_options&underlying_asset_symbols=${asset}`;
  const tickersSignature = apiSecret
    ? generateSignature(apiSecret, 'GET', timestamp, tickersPath, tickersQuery)
    : '';

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'TheCorporateTrader-OptionsMatrix/1.0',
    ...(apiKey && tickersSignature
      ? {
          'api-key': apiKey,
          timestamp,
          signature: tickersSignature,
        }
      : {}),
  };

  try {
    let rawTickers: any[] = [];
    let underlyingSpotPrice = 0;

    const tickersRes = await fetch(`${BASE_URL}${tickersPath}${tickersQuery}`, {
      method: 'GET',
      headers,
      next: { revalidate: 8 },
    });

    if (tickersRes.status === 429) {
      if (memoryCache.data[cacheKey]) {
        return NextResponse.json(
          {
            ...memoryCache.data[cacheKey],
            rateLimited: true,
            warning: 'Delta Exchange rate limit reached; displaying cached snapshot',
          },
          { headers: { 'X-Cache': 'STALE-429' } }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Delta Exchange API rate limit reached (429).' },
        { status: 429 }
      );
    }

    if (tickersRes.ok) {
      const tickersData = await tickersRes.json();
      rawTickers = Array.isArray(tickersData.result) ? tickersData.result : [];
    }

    // Fetch Spot Price
    try {
      const spotRes = await fetch(`${BASE_URL}/v2/tickers/${asset}USD`, { headers });
      if (spotRes.ok) {
        const spotData = await spotRes.json();
        if (spotData.result?.mark_price) {
          underlyingSpotPrice = parseFloat(spotData.result.mark_price) || 0;
        } else if (spotData.result?.spot_price) {
          underlyingSpotPrice = parseFloat(spotData.result.spot_price) || 0;
        }
      }
    } catch {
      // Fallback below
    }

    // Fallback to products if tickers returned empty
    let rawProducts: any[] = [];
    if (rawTickers.length === 0) {
      try {
        const prodPath = '/v2/products';
        const prodQuery = '?states=live';
        const prodSig = apiSecret ? generateSignature(apiSecret, 'GET', timestamp, prodPath, prodQuery) : '';
        const prodHeaders: Record<string, string> = {
          ...headers,
          ...(prodSig ? { signature: prodSig } : {}),
        };
        const prodRes = await fetch(`${BASE_URL}${prodPath}${prodQuery}`, { headers: prodHeaders });
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          rawProducts = Array.isArray(prodData.result) ? prodData.result : [];
        }
      } catch {
        // Continue
      }
    }

    const tickerMapBySymbol: Record<string, any> = {};
    for (const t of rawTickers) {
      if (t.symbol) tickerMapBySymbol[t.symbol] = t;
      if (!underlyingSpotPrice && t.spot_price) {
        underlyingSpotPrice = parseFloat(t.spot_price) || 0;
      }
    }

    const allOptionItems: any[] = rawTickers.length > 0 ? rawTickers : rawProducts;
    const filteredOptions = allOptionItems.filter((item: any) => {
      const symbol = item.symbol || '';
      const isCall = item.contract_type === 'call_options' || symbol.startsWith('C-');
      const isPut = item.contract_type === 'put_options' || symbol.startsWith('P-');
      if (!isCall && !isPut) return false;

      const matchesSymbol = symbol.includes(`-${asset}-`) || symbol.startsWith(`C-${asset}-`) || symbol.startsWith(`P-${asset}-`);
      const matchesUnderlying = item.underlying_asset?.symbol === asset || item.underlying_asset_symbol === asset;
      return matchesSymbol || matchesUnderlying;
    });

    const expirySet = new Set<string>();
    for (const item of filteredOptions) {
      const dateFromSymbol = parseExpiryFromSymbol(item.symbol || '');
      if (dateFromSymbol) {
        expirySet.add(dateFromSymbol);
      } else if (item.settlement_time) {
        expirySet.add(item.settlement_time.split('T')[0]);
      }
    }

    const availableExpiries = Array.from(expirySet).sort();
    const activeExpiry = selectedExpiry || availableExpiries[0] || null;

    const expiryOptions = filteredOptions.filter((item: any) => {
      if (!activeExpiry) return true;
      const dateFromSymbol = parseExpiryFromSymbol(item.symbol || '');
      if (dateFromSymbol === activeExpiry) return true;
      if (item.settlement_time && item.settlement_time.startsWith(activeExpiry)) return true;
      return false;
    });

    const strikesMap: Record<number, { strike: number; call: OptionMetrics | null; put: OptionMetrics | null }> = {};

    for (const item of expiryOptions) {
      const strike = parseFloat(item.strike_price);
      if (isNaN(strike)) continue;

      if (!strikesMap[strike]) {
        strikesMap[strike] = { strike, call: null, put: null };
      }

      const isCall = item.contract_type === 'call_options' || item.symbol.startsWith('C-');
      const t = tickerMapBySymbol[item.symbol] || item;

      // Extract real OI numbers
      const rawOi = t.oi ?? t.open_interest ?? t.oi_contracts ?? 0;
      const oi = typeof rawOi === 'string' ? parseFloat(rawOi) || 0 : Number(rawOi) || 0;
      const oiChange = parseFloat(t.oi_change_usd_24h ?? t.oi_change_24h ?? 0);
      const oiChangePct = parseFloat(t.oi_change_24h_percent ?? t.ltp_change_24h ?? 0);
      const markPrice = parseFloat(t.mark_price ?? t.close ?? 0);
      const volume = parseFloat(t.volume ?? t.volume_24h ?? 0);
      const notional = parseFloat(t.oi_value_usd ?? 0) || (oi * strike * (parseFloat(item.contract_value) || 1));

      const payload: OptionMetrics = {
        symbol: item.symbol,
        contractType: isCall ? 'call' : 'put',
        oi,
        oiChange,
        oiChangePct,
        markPrice,
        volume,
        notional,
      };

      if (isCall) {
        strikesMap[strike].call = payload;
      } else {
        strikesMap[strike].put = payload;
      }
    }

    const strikesList = Object.values(strikesMap).sort((a, b) => a.strike - b.strike);

    let totalCallOi = 0;
    let totalPutOi = 0;
    let totalCallOiNotional = 0;
    let totalPutOiNotional = 0;
    let maxCallOi = 0;
    let maxPutOi = 0;
    let strongestResistance: number | null = null;
    let strongestSupport: number | null = null;

    const strikesData: StrikeRow[] = strikesList.map((row) => {
      const callOi = row.call ? row.call.oi : 0;
      const putOi = row.put ? row.put.oi : 0;
      const callNotional = row.call ? row.call.notional : 0;
      const putNotional = row.put ? row.put.notional : 0;

      totalCallOi += callOi;
      totalPutOi += putOi;
      totalCallOiNotional += callNotional;
      totalPutOiNotional += putNotional;

      if (callOi > maxCallOi) {
        maxCallOi = callOi;
        strongestResistance = row.strike;
      }
      if (putOi > maxPutOi) {
        maxPutOi = putOi;
        strongestSupport = row.strike;
      }

      const strikePcr = callOi > 0 ? parseFloat((putOi / callOi).toFixed(2)) : putOi > 0 ? 99.9 : 0;

      return {
        strike: row.strike,
        callOi,
        putOi,
        strikePcr,
        call: row.call,
        put: row.put,
      };
    });

    if (!underlyingSpotPrice && strikesList.length > 0) {
      underlyingSpotPrice = strikesList[Math.floor(strikesList.length / 2)].strike;
    }

    // Nearest Resistance (Lowest strike > Spot with Call OI)
    let nearestResistance: number | null = null;
    let nearestResOi = 0;
    const strikesAboveSpot = strikesData.filter((r) => r.strike > underlyingSpotPrice);
    for (const r of strikesAboveSpot) {
      if (r.callOi > nearestResOi && r.callOi > 0) {
        nearestResOi = r.callOi;
        nearestResistance = r.strike;
      }
    }
    if (!nearestResistance && strikesAboveSpot.length > 0) {
      nearestResistance = strikesAboveSpot[0].strike;
    }

    // Nearest Support (Highest strike < Spot with Put OI)
    let nearestSupport: number | null = null;
    let nearestSupOi = 0;
    const strikesBelowSpot = strikesData.filter((r) => r.strike < underlyingSpotPrice).reverse();
    for (const r of strikesBelowSpot) {
      if (r.putOi > nearestSupOi && r.putOi > 0) {
        nearestSupOi = r.putOi;
        nearestSupport = r.strike;
      }
    }
    if (!nearestSupport && strikesBelowSpot.length > 0) {
      nearestSupport = strikesBelowSpot[0].strike;
    }

    const maxPainStrike = calculateMaxPain(strikesData);
    const overallPcr = totalCallOi > 0 ? parseFloat((totalPutOi / totalCallOi).toFixed(3)) : 0;

    let sentiment = 'Neutral';
    let sentimentColor: 'emerald' | 'rose' | 'amber' = 'amber';
    let pcrDescription = 'Balanced call and put distribution across strikes';

    if (totalCallOi === 0 && totalPutOi === 0) {
      sentiment = 'No Open Interest';
      sentimentColor = 'amber';
      pcrDescription = 'No active contracts open on this expiry yet';
    } else if (overallPcr < 0.60) {
      sentiment = 'Strong Bullish Bias';
      sentimentColor = 'emerald';
      pcrDescription = 'Aggressive call dominance; low downside protection buying';
    } else if (overallPcr <= 0.80) {
      sentiment = 'Moderate Bullish Bias';
      sentimentColor = 'emerald';
      pcrDescription = 'Healthy call buying with modest hedging activity';
    } else if (overallPcr <= 1.10) {
      sentiment = 'Neutral / Rangebound';
      sentimentColor = 'amber';
      pcrDescription = 'Even distribution between call ceilings and put floors';
    } else if (overallPcr <= 1.35) {
      sentiment = 'Moderate Bearish Bias';
      sentimentColor = 'rose';
      pcrDescription = 'Elevated put accumulation; downside hedging active';
    } else {
      sentiment = 'Strong Bearish Bias';
      sentimentColor = 'rose';
      pcrDescription = 'Heavy put concentration; market pricing elevated risk';
    }

    // Position Building Flow
    let positionBuilding = 'Neutral Flow';
    if (totalCallOi > totalPutOi * 1.3) {
      positionBuilding = 'Call Dominant (Overhead Resistance Building)';
    } else if (totalPutOi > totalCallOi * 1.3) {
      positionBuilding = 'Put Dominant (Support Floor Accumulation)';
    } else if (totalCallOi > totalPutOi) {
      positionBuilding = 'Mild Call Addition';
    } else if (totalPutOi > totalCallOi) {
      positionBuilding = 'Mild Put Addition';
    }

    const matrix = strikesData.map((row) => {
      const signals: string[] = [];
      if (row.strike === strongestResistance && maxCallOi > 0) signals.push('Major Resistance (Call Wall)');
      else if (row.strike === nearestResistance) signals.push('Nearest Resistance');

      if (row.strike === strongestSupport && maxPutOi > 0) signals.push('Major Support (Put Floor)');
      else if (row.strike === nearestSupport) signals.push('Nearest Support');

      if (row.strike === maxPainStrike) signals.push('Max Pain');

      const callBarPct = maxCallOi > 0 ? Math.min(100, Math.round((row.callOi / maxCallOi) * 100)) : 0;
      const putBarPct = maxPutOi > 0 ? Math.min(100, Math.round((row.putOi / maxPutOi) * 100)) : 0;

      const isItmCall = underlyingSpotPrice > 0 && row.strike < underlyingSpotPrice;
      const isItmPut = underlyingSpotPrice > 0 && row.strike > underlyingSpotPrice;

      return {
        ...row,
        callBarPct,
        putBarPct,
        isItmCall,
        isItmPut,
        signals,
      };
    });

    const responsePayload = {
      success: true,
      asset,
      underlyingSpotPrice,
      selectedExpiry: activeExpiry,
      availableExpiries,
      summary: {
        totalCallOi,
        totalPutOi,
        totalCallOiNotional,
        totalPutOiNotional,
        overallPcr,
        sentiment,
        sentimentColor,
        pcrDescription,
        positionBuilding,
        maxPainStrike,
        nearestResistance,
        strongestResistance,
        nearestSupport,
        strongestSupport,
        contractsCount: expiryOptions.length,
      },
      matrix,
      updatedAt: new Date().toISOString(),
    };

    memoryCache.data[cacheKey] = responsePayload;
    memoryCache.timestamp[cacheKey] = now;

    return NextResponse.json(responsePayload, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error: any) {
    console.error('Options Matrix Route Error:', error);

    if (memoryCache.data[cacheKey]) {
      return NextResponse.json(
        {
          ...memoryCache.data[cacheKey],
          warning: 'Serving cached snapshot due to network issue',
          isStale: true,
        },
        { headers: { 'X-Cache': 'STALE-FALLBACK' } }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch options matrix data' },
      { status: 500 }
    );
  }
}
