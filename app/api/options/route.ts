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
  TTL_MS: 10000,
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
  const productsPath = '/v2/products';
  const productsQuery = '?states=live';

  const productsSignature = apiSecret
    ? generateSignature(apiSecret, 'GET', timestamp, productsPath, productsQuery)
    : '';

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'TheCorporateTrader-OptionsMatrix/1.0',
    ...(apiKey && productsSignature
      ? {
          'api-key': apiKey,
          timestamp,
          signature: productsSignature,
        }
      : {}),
  };

  try {
    const productsRes = await fetch(`${BASE_URL}${productsPath}${productsQuery}`, {
      method: 'GET',
      headers,
      next: { revalidate: 10 },
    });

    if (productsRes.status === 429) {
      if (memoryCache.data[cacheKey]) {
        return NextResponse.json(
          {
            ...memoryCache.data[cacheKey],
            rateLimited: true,
            warning: 'Delta Exchange rate limit reached; displaying stale snapshot',
          },
          { headers: { 'X-Cache': 'STALE-429' } }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Delta Exchange API rate limit reached (429).' },
        { status: 429 }
      );
    }

    if (!productsRes.ok) {
      throw new Error(`Delta API Products Error: ${productsRes.status} ${productsRes.statusText}`);
    }

    const productsData = await productsRes.json();
    const rawProducts = Array.isArray(productsData.result) ? productsData.result : [];

    let tickersMap: Record<string, any> = {};
    let underlyingSpotPrice = 0;

    try {
      const tickersPath = '/v2/tickers';
      const tickersTimestamp = Math.floor(Date.now() / 1000).toString();
      const tickersSignature = apiSecret
        ? generateSignature(apiSecret, 'GET', tickersTimestamp, tickersPath)
        : '';

      const tickerHeaders: Record<string, string> = {
        ...headers,
        timestamp: tickersTimestamp,
        ...(tickersSignature ? { signature: tickersSignature } : {}),
      };

      const tickersRes = await fetch(`${BASE_URL}${tickersPath}`, {
        method: 'GET',
        headers: tickerHeaders,
      });

      if (tickersRes.ok) {
        const tickersData = await tickersRes.json();
        const rawTickers = Array.isArray(tickersData.result) ? tickersData.result : [];
        for (const t of rawTickers) {
          if (t.symbol) tickersMap[t.symbol] = t;
          if (
            (t.symbol === `${asset}USD` || t.symbol === `${asset}_USDT` || t.symbol === `.${asset}USD`) &&
            t.mark_price
          ) {
            underlyingSpotPrice = parseFloat(t.mark_price) || underlyingSpotPrice;
          }
        }
      }
    } catch {
      // Graceful fallback to products payload
    }

    const optionsProducts = rawProducts.filter((p: any) => {
      const symbol = p.symbol || '';
      const isCall = p.contract_type === 'call_options' || symbol.startsWith('C-');
      const isPut = p.contract_type === 'put_options' || symbol.startsWith('P-');
      if (!isCall && !isPut) return false;

      return (
        symbol.includes(`-${asset}-`) ||
        (p.underlying_asset && p.underlying_asset.symbol === asset)
      );
    });

    const expirySet = new Set<string>();
    for (const p of optionsProducts) {
      if (p.settlement_time) {
        expirySet.add(p.settlement_time.split('T')[0]);
      } else {
        const parts = p.symbol.split('-');
        if (parts.length >= 4) expirySet.add(parts[3]);
      }
    }

    const availableExpiries = Array.from(expirySet).sort();
    const activeExpiry = selectedExpiry || availableExpiries[0] || null;

    const filteredOptions = optionsProducts.filter((p: any) => {
      if (!activeExpiry) return true;
      if (p.settlement_time && p.settlement_time.startsWith(activeExpiry)) return true;
      const parts = p.symbol.split('-');
      return parts.length >= 4 && parts[3] === activeExpiry;
    });

    const strikesMap: Record<number, { strike: number; call: OptionMetrics | null; put: OptionMetrics | null }> = {};

    for (const p of filteredOptions) {
      const strike = parseFloat(p.strike_price);
      if (isNaN(strike)) continue;

      if (!strikesMap[strike]) {
        strikesMap[strike] = { strike, call: null, put: null };
      }

      const isCall = p.contract_type === 'call_options' || p.symbol.startsWith('C-');
      const ticker = tickersMap[p.symbol] || {};

      const oi = parseFloat(ticker.open_interest || p.open_interest || 0);
      const oiChange = parseFloat(ticker.oi_change_usd_24h || ticker.oi_change_24h || 0);
      const oiChangePct = parseFloat(ticker.oi_change_24h_percent || 0);
      const markPrice = parseFloat(ticker.mark_price || p.strike_price || 0);
      const volume = parseFloat(ticker.volume_24h || ticker.volume || 0);
      const contractValue = parseFloat(p.contract_value || 1);
      const notional = oi * strike * contractValue;

      const payload: OptionMetrics = {
        symbol: p.symbol,
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
    let callWallStrike: number | null = null;
    let putSupportStrike: number | null = null;

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
        callWallStrike = row.strike;
      }
      if (putOi > maxPutOi) {
        maxPutOi = putOi;
        putSupportStrike = row.strike;
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

    const maxPainStrike = calculateMaxPain(strikesData);
    const overallPcr = totalCallOi > 0 ? parseFloat((totalPutOi / totalCallOi).toFixed(3)) : 0;

    let sentiment = 'Neutral';
    let sentimentColor: 'emerald' | 'rose' | 'amber' = 'amber';
    if (overallPcr < 0.7) {
      sentiment = 'Bullish Bias';
      sentimentColor = 'emerald';
    } else if (overallPcr > 1.1) {
      sentiment = 'Bearish Bias';
      sentimentColor = 'rose';
    }

    const matrix = strikesData.map((row) => {
      const signals: string[] = [];
      if (row.strike === callWallStrike && maxCallOi > 0) signals.push('Call Wall');
      if (row.strike === putSupportStrike && maxPutOi > 0) signals.push('Put Support');
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
      underlyingSpotPrice:
        underlyingSpotPrice || (strikesList.length > 0 ? strikesList[Math.floor(strikesList.length / 2)].strike : 0),
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
        maxPainStrike,
        callWallStrike,
        putSupportStrike,
        contractsCount: filteredOptions.length,
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
      {
        success: false,
        error: error.message || 'Failed to fetch options matrix data',
      },
      { status: 500 }
    );
  }
}
