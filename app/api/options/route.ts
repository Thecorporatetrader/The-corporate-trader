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
  volumeChangePct?: number;
  notional: number;
}

interface StrikeRow {
  strike: number;
  callOi: number;
  putOi: number;
  callVolume: number;
  putVolume: number;
  strikePcr: number;
  volumePcr: number;
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
  const rawExpiryParam = searchParams.get('expiry') || null;
  const timeframe = (searchParams.get('timeframe') || '1h').toLowerCase();
  const cacheKey = `${asset}_${rawExpiryParam || 'all'}_${timeframe}`;

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

    const spotSymbolsToTry = [`${asset}USD`, asset, asset === 'XAUT' ? 'XAUUSD' : ''];
    for (const spotSym of spotSymbolsToTry) {
      if (!spotSym) continue;
      try {
        const spotRes = await fetch(`${BASE_URL}/v2/tickers/${spotSym}`, { headers });
        if (spotRes.ok) {
          const spotData = await spotRes.json();
          const resObj = spotData.result;
          if (resObj?.mark_price) {
            underlyingSpotPrice = parseFloat(resObj.mark_price) || 0;
            break;
          } else if (resObj?.spot_price) {
            underlyingSpotPrice = parseFloat(resObj.spot_price) || 0;
            break;
          } else if (resObj?.close) {
            underlyingSpotPrice = parseFloat(resObj.close) || 0;
            break;
          }
        }
      } catch {
        // Try next symbol
      }
    }

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
        // Continue with available data
      }
    }

    const tickerMapBySymbol: Record<string, any> = {};
    for (const t of rawTickers) {
      if (t.symbol) tickerMapBySymbol[t.symbol] = t;
      if (!underlyingSpotPrice && (t.spot_price || t.underlying_spot_price)) {
        underlyingSpotPrice = parseFloat(t.spot_price || t.underlying_spot_price) || 0;
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
    const requestedExpiries = rawExpiryParam ? rawExpiryParam.split(',').map((s) => s.trim()) : [];
    const isAllSelected = requestedExpiries.includes('all') || requestedExpiries.length === 0;
    const activeExpiries = isAllSelected ? availableExpiries.slice(0, 2) : requestedExpiries;

    const expiryOptions = filteredOptions.filter((item: any) => {
      if (requestedExpiries.includes('all') || requestedExpiries.length === 0) return true;
      const dateFromSymbol = parseExpiryFromSymbol(item.symbol || '');
      const settlement = item.settlement_time ? item.settlement_time.split('T')[0] : null;
      return activeExpiries.some((exp) => dateFromSymbol === exp || settlement === exp);
    });

    const strikesMap: Record<number, { strike: number; call: OptionMetrics | null; put: OptionMetrics | null }> = {};

    for (const item of expiryOptions) {
      const strike = parseFloat(item.strike_price || item.strike);
      if (isNaN(strike)) continue;

      if (!strikesMap[strike]) {
        strikesMap[strike] = { strike, call: null, put: null };
      }

      const isCall = item.contract_type === 'call_options' || item.symbol.startsWith('C-');
      const t = tickerMapBySymbol[item.symbol] || item;

      const rawOi = t.oi ?? t.open_interest ?? t.oi_contracts ?? 0;
      const contractCount = typeof rawOi === 'string' ? parseFloat(rawOi) || 0 : Number(rawOi) || 0;
      
      const markPrice = parseFloat(t.mark_price ?? t.close ?? t.ltp ?? 0);
      const contractValue = parseFloat(item.contract_value) || (asset === 'XAUT' ? 0.01 : 1);

      // Accurate Notional in USD calculation matching Delta Exchange analytics ($M scale)
      const notionalRaw = parseFloat(t.oi_value_usd ?? t.notional_value ?? 0) || (contractCount * strike * contractValue);
      const oiInMillions = notionalRaw > 0 ? Number((notionalRaw / 1_000_000).toFixed(2)) : Number(((contractCount * markPrice * contractValue) / 1_000_000).toFixed(2));

      // Correctly capture absolute or percentage OI change in USD Millions (allowing negative values for exiting contracts)
      const oiChangeUsd = parseFloat(t.oi_change_usd_24h ?? t.oi_change_24h ?? t.change_usd_24h ?? 0);
      const oiChange = oiChangeUsd !== 0 ? Number((oiChangeUsd / 1_000_000).toFixed(2)) : parseFloat(t.oi_change_24h_percent ?? 0);
      const oiChangePct = parseFloat(t.oi_change_24h_percent ?? t.oi_change_percentage ?? 0);
      
      const volume = parseFloat(t.volume ?? t.volume_24h ?? t.turnover ?? 0);
      const volumeInMillions = volume > 1000 ? Number((volume / 1_000_000).toFixed(2)) : Number((volume / 1000).toFixed(2));
      const volumeChangePct = parseFloat(t.turnover_change_24h ?? 0);

      const payload: OptionMetrics = {
        symbol: item.symbol,
        contractType: isCall ? 'call' : 'put',
        oi: oiInMillions,
        oiChange,
        oiChangePct,
        markPrice,
        volume: volumeInMillions,
        volumeChangePct,
        notional: notionalRaw,
      };

      if (isCall) {
        if (!strikesMap[strike].call) {
          strikesMap[strike].call = payload;
        } else {
          strikesMap[strike].call.oi += oiInMillions;
          strikesMap[strike].call.volume += payload.volume;
          strikesMap[strike].call.notional += notionalRaw;
        }
      } else {
        if (!strikesMap[strike].put) {
          strikesMap[strike].put = payload;
        } else {
          strikesMap[strike].put.oi += oiInMillions;
          strikesMap[strike].put.volume += payload.volume;
          strikesMap[strike].put.notional += notionalRaw;
        }
      }
    }

    const strikesList = Object.values(strikesMap).sort((a, b) => a.strike - b.strike);

    let totalCallOi = 0;
    let totalPutOi = 0;
    let totalCallVolume = 0;
    let totalPutVolume = 0;
    let totalCallOiNotional = 0;
    let totalPutOiNotional = 0;
    let maxCallOi = 0;
    let maxPutOi = 0;
    let maxCallVolume = 0;
    let maxPutVolume = 0;

    const strikesData: StrikeRow[] = strikesList.map((row) => {
      const callOi = row.call ? row.call.oi : 0;
      const putOi = row.put ? row.put.oi : 0;
      const callVolume = row.call ? row.call.volume : 0;
      const putVolume = row.put ? row.put.volume : 0;
      const callNotional = row.call ? row.call.notional : 0;
      const putNotional = row.put ? row.put.notional : 0;

      totalCallOi += callOi;
      totalPutOi += putOi;
      totalCallVolume += callVolume;
      totalPutVolume += putVolume;
      totalCallOiNotional += callNotional;
      totalPutOiNotional += putNotional;

      if (callOi > maxCallOi) maxCallOi = callOi;
      if (putOi > maxPutOi) maxPutOi = putOi;
      if (callVolume > maxCallVolume) maxCallVolume = callVolume;
      if (putVolume > maxPutVolume) maxPutVolume = putVolume;

      const strikePcr = callOi > 0 ? parseFloat((putOi / callOi).toFixed(2)) : putOi > 0 ? 99.9 : 0;
      const volumePcr = callVolume > 0 ? parseFloat((putVolume / callVolume).toFixed(2)) : 0;

      return {
        strike: row.strike,
        callOi,
        putOi,
        callVolume,
        putVolume,
        strikePcr,
        volumePcr,
        call: row.call,
        put: row.put,
      };
    });

    if (!underlyingSpotPrice && strikesList.length > 0) {
      underlyingSpotPrice = strikesList[Math.floor(strikesList.length / 2)].strike;
    }

    const strikesAboveSpot = strikesData.filter((r) => r.strike >= underlyingSpotPrice);
    const strikesBelowSpot = strikesData.filter((r) => r.strike < underlyingSpotPrice).reverse();

    let pcrStrongestResistance: number | null = strikesAboveSpot[0]?.strike || null;
    let pcrNearestResistance: number | null = strikesAboveSpot[0]?.strike || null;
    let pcrStrongestSupport: number | null = strikesBelowSpot[0]?.strike || null;
    let pcrNearestSupport: number | null = strikesBelowSpot[0]?.strike || null;

    const maxPainStrike = calculateMaxPain(strikesData);
    const overallPcr = totalCallOi > 0 ? parseFloat((totalPutOi / totalCallOi).toFixed(3)) : 1.0;
    const overallVolumePcr = totalCallVolume > 0 ? parseFloat((totalPutVolume / totalCallVolume).toFixed(3)) : 1.0;

    const sentiment = overallPcr >= 1.0 ? 'BUYING SIDE' : 'SELLING SIDE';
    const sentimentColor = overallPcr >= 1.0 ? 'emerald' : 'rose';
    const pcrDescription = overallPcr >= 1.0 ? 'Put writing dominant (buying support)' : 'Call writing dominant (capping upside)';
    const positionBuilding = 'Active liquidity buildup';

    const matrix = strikesData.map((row) => {
      const signals: string[] = [];
      if (row.strike === maxPainStrike) signals.push('Max Pain');

      const callBarPct = maxCallOi > 0 ? Math.min(100, Math.round((row.callOi / maxCallOi) * 100)) : 0;
      const putBarPct = maxPutOi > 0 ? Math.min(100, Math.round((row.putOi / maxPutOi) * 100)) : 0;
      const callVolBarPct = maxCallVolume > 0 ? Math.min(100, Math.round((row.callVolume / maxCallVolume) * 100)) : 0;
      const putVolBarPct = maxPutVolume > 0 ? Math.min(100, Math.round((row.putVolume / maxPutVolume) * 100)) : 0;

      const isItmCall = underlyingSpotPrice > 0 && row.strike < underlyingSpotPrice;
      const isItmPut = underlyingSpotPrice > 0 && row.strike > underlyingSpotPrice;

      return {
        ...row,
        callBarPct,
        putBarPct,
        callVolBarPct,
        putVolBarPct,
        isItmCall,
        isItmPut,
        signals,
      };
    });

    const responsePayload = {
      success: true,
      asset,
      underlyingSpotPrice,
      timeframe,
      selectedExpiries: activeExpiries,
      availableExpiries,
      summary: {
        totalCallOi,
        totalPutOi,
        totalCallVolume,
        totalPutVolume,
        totalCallOiNotional,
        totalPutOiNotional,
        overallPcr,
        overallVolumePcr,
        sentiment,
        sentimentColor,
        pcrDescription,
        positionBuilding,
        maxPainStrike,
        nearestResistance: pcrNearestResistance,
        strongestResistance: pcrStrongestResistance,
        nearestSupport: pcrNearestSupport,
        strongestSupport: pcrStrongestSupport,
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
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch options matrix data' },
      { status: 500 }
    );
  }
}
