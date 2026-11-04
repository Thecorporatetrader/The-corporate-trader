import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type DeltaTicker = {
  symbol?: string;
  contract_type?: string;
  strike_price?: string | number;
  oi?: string | number;
  oi_value?: string | number;
  oi_value_symbol?: string;
  oi_value_usd?: string | number;
  volume?: string | number;
  turnover?: string | number;
  turnover_symbol?: string;
  turnover_usd?: string | number;
  mark_price?: string | number;
  spot_price?: string | number;
  timestamp?: number;
  settlement_time?: string;
  expiry_date?: string;
};

type OptionSide = {
  symbol: string;
  oiUsd: number | null;
  volumeUsd: number | null;
  oiContracts: number | null;
  markPrice: number | null;
};

type MatrixRow = {
  strike: number;
  callOiUsd: number | null;
  putOiUsd: number | null;
  callVolumeUsd: number | null;
  putVolumeUsd: number | null;
  oiPcr: number | null;
  volumePcr: number | null;
  call: OptionSide | null;
  put: OptionSide | null;
};

type ApiPayload = {
  success: boolean;
  asset: string;
  underlyingSpotPrice: number | null;
  availableExpiries: string[];
  selectedExpiries: string[];
  isMultiExpiry: boolean;
  dataBasis: {
    openInterest: string;
    volume: string;
    period: string;
    timeframeChangesAvailable: false;
  };
  summary: {
    totalCallOiUsd: number | null;
    totalPutOiUsd: number | null;
    totalCallVolumeUsd: number | null;
    totalPutVolumeUsd: number | null;
    overallOiPcr: number | null;
    overallVolumePcr: number | null;
    contractsCount: number;
    strikesCount: number;
  };
  matrix: MatrixRow[];
  updatedAt: string;
};

const CACHE_TTL_MS = 8_000;
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_MULTI_EXPIRIES = 5;

const cache = new Map<
  string,
  { timestamp: number; payload: ApiPayload }
>();

function toNumber(value: unknown): number | null {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    (typeof value === 'string' && value.trim() === '')
  ) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function positiveNumber(value: unknown): number | null {
  const parsed = toNumber(value);
  return parsed !== null && parsed > 0 ? parsed : null;
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function parseExpiry(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;

  const input = value.trim();

  // ISO date or ISO timestamp.
  const isoMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoMatch) {
    const isoDate = `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    return isValidIsoDate(isoDate) ? isoDate : null;
  }

  // Delta option symbol suffix: DDMMYY.
  const compactMatch = input.match(/(?:^|-)(\d{2})(\d{2})(\d{2})$/);

  if (compactMatch) {
    const [, day, month, year] = compactMatch;
    const isoDate = `20${year}-${month}-${day}`;

    return isValidIsoDate(isoDate) ? isoDate : null;
  }

  // YYYYMMDD.
  const ymdMatch = input.match(/(?:^|-)(\d{4})(\d{2})(\d{2})$/);

  if (ymdMatch) {
    const [, year, month, day] = ymdMatch;
    const isoDate = `${year}-${month}-${day}`;

    return isValidIsoDate(isoDate) ? isoDate : null;
  }

  return null;
}

function getTickerExpiry(ticker: DeltaTicker): string | null {
  return (
    parseExpiry(ticker.expiry_date) ??
    parseExpiry(ticker.settlement_time) ??
    parseExpiry(ticker.symbol)
  );
}

function getOptionType(
  ticker: DeltaTicker,
): 'call' | 'put' | null {
  const type = ticker.contract_type?.toLowerCase();
  const symbol = ticker.symbol ?? '';

  if (type === 'call_options' || symbol.startsWith('C-')) {
    return 'call';
  }

  if (type === 'put_options' || symbol.startsWith('P-')) {
    return 'put';
  }

  return null;
}

/**
 * Use Delta's USD-denominated OI value.
 * Never estimate OI USD from contracts multiplied by strike.
 */
function getOiUsd(ticker: DeltaTicker): number | null {
  const directUsd = toNumber(ticker.oi_value_usd);

  if (directUsd !== null) return directUsd;

  if (ticker.oi_value_symbol?.toUpperCase() === 'USD') {
    return toNumber(ticker.oi_value);
  }

  return null;
}

/**
 * Use Delta's USD-denominated turnover.
 * Never estimate USD turnover from contracts multiplied by premium.
 */
function getVolumeUsd(ticker: DeltaTicker): number | null {
  const directUsd = toNumber(ticker.turnover_usd);

  if (directUsd !== null) return directUsd;

  if (ticker.turnover_symbol?.toUpperCase() === 'USD') {
    return toNumber(ticker.turnover);
  }

  return null;
}

function sumKnown(values: Array<number | null>): number | null {
  const known = values.filter(
    (value): value is number => value !== null,
  );

  if (known.length === 0) return null;

  return known.reduce((total, value) => total + value, 0);
}

function ratio(
  numerator: number | null,
  denominator: number | null,
): number | null {
  if (
    numerator === null ||
    denominator === null ||
    denominator === 0
  ) {
    return null;
  }

  return Number((numerator / denominator).toFixed(3));
}

function expiryToDeltaFormat(isoDate: string): string {
  if (!isValidIsoDate(isoDate)) {
    throw new Error('Invalid expiry date.');
  }

  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
}

async function fetchDeltaTickers(
  baseUrl: string,
  asset: string,
  expiry?: string,
): Promise<DeltaTicker[]> {
  const url = new URL('/v2/tickers', baseUrl);

  url.searchParams.set(
    'contract_types',
    'call_options,put_options',
  );

  url.searchParams.set('underlying_asset_symbols', asset);

  if (expiry) {
    url.searchParams.set(
      'expiry_date',
      expiryToDeltaFormat(expiry),
    );
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const error = new Error(
      `Delta API returned HTTP ${response.status}`,
    );

    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  const json = await response.json();

  if (!json?.success || !Array.isArray(json.result)) {
    throw new Error('Delta returned an invalid ticker response.');
  }

  return json.result as DeltaTicker[];
}

function buildMatrix(tickers: DeltaTicker[]): {
  matrix: MatrixRow[];
  spotPrice: number | null;
  contractsCount: number;
} {
  const byStrike = new Map<
    number,
    { calls: OptionSide[]; puts: OptionSide[] }
  >();

  const seenSymbols = new Set<string>();

  let spotPrice: number | null = null;
  let contractsCount = 0;

  for (const ticker of tickers) {
    const symbol = ticker.symbol ?? '';

    if (!symbol || seenSymbols.has(symbol)) continue;

    seenSymbols.add(symbol);

    const optionType = getOptionType(ticker);

    if (!optionType) continue;

    const strike = positiveNumber(ticker.strike_price);

    if (strike === null) continue;

    // Keep searching until a valid spot price is found.
    if (spotPrice === null) {
      spotPrice = positiveNumber(ticker.spot_price);
    }

    const side: OptionSide = {
      symbol,
      oiUsd: getOiUsd(ticker),
      volumeUsd: getVolumeUsd(ticker),
      oiContracts: toNumber(ticker.oi),
      markPrice: positiveNumber(ticker.mark_price),
    };

    if (!byStrike.has(strike)) {
      byStrike.set(strike, { calls: [], puts: [] });
    }

    const bucket = byStrike.get(strike)!;

    if (optionType === 'call') {
      bucket.calls.push(side);
    } else {
      bucket.puts.push(side);
    }

    contractsCount += 1;
  }

  const matrix: MatrixRow[] = Array.from(byStrike.entries())
    .map(([strike, sides]) => {
      const callOiUsd = sumKnown(
        sides.calls.map((item) => item.oiUsd),
      );

      const putOiUsd = sumKnown(
        sides.puts.map((item) => item.oiUsd),
      );

      const callVolumeUsd = sumKnown(
        sides.calls.map((item) => item.volumeUsd),
      );

      const putVolumeUsd = sumKnown(
        sides.puts.map((item) => item.volumeUsd),
      );

      const call: OptionSide | null =
        sides.calls.length > 0
          ? {
              symbol: sides.calls
                .map((item) => item.symbol)
                .join(', '),
              oiUsd: callOiUsd,
              volumeUsd: callVolumeUsd,
              oiContracts: sumKnown(
                sides.calls.map((item) => item.oiContracts),
              ),
              markPrice: sides.calls[0].markPrice,
            }
          : null;

      const put: OptionSide | null =
        sides.puts.length > 0
          ? {
              symbol: sides.puts
                .map((item) => item.symbol)
                .join(', '),
              oiUsd: putOiUsd,
              volumeUsd: putVolumeUsd,
              oiContracts: sumKnown(
                sides.puts.map((item) => item.oiContracts),
              ),
              markPrice: sides.puts[0].markPrice,
            }
          : null;

      return {
        strike,
        callOiUsd,
        putOiUsd,
        callVolumeUsd,
        putVolumeUsd,
        oiPcr: ratio(putOiUsd, callOiUsd),
        volumePcr: ratio(putVolumeUsd, callVolumeUsd),
        call,
        put,
      };
    })
    .sort((a, b) => a.strike - b.strike);

  return {
    matrix,
    spotPrice,
    contractsCount,
  };
}

function makePayload(
  asset: string,
  selectedExpiries: string[],
  availableExpiries: string[],
  tickers: DeltaTicker[],
): ApiPayload {
  const { matrix, spotPrice, contractsCount } =
    buildMatrix(tickers);

  const totalCallOiUsd = sumKnown(
    matrix.map((row) => row.callOiUsd),
  );

  const totalPutOiUsd = sumKnown(
    matrix.map((row) => row.putOiUsd),
  );

  const totalCallVolumeUsd = sumKnown(
    matrix.map((row) => row.callVolumeUsd),
  );

  const totalPutVolumeUsd = sumKnown(
    matrix.map((row) => row.putVolumeUsd),
  );

  return {
    success: true,
    asset,
    underlyingSpotPrice: spotPrice,
    availableExpiries,
    selectedExpiries,
    isMultiExpiry: selectedExpiries.length > 1,

    dataBasis: {
      openInterest: 'USD open-interest value (Delta oi_value_usd)',
      volume: 'USD turnover (Delta turnover_usd)',
      period:
        'Current Delta ticker/session values; not an intraday historical window',
      timeframeChangesAvailable: false,
    },

    summary: {
      totalCallOiUsd,
      totalPutOiUsd,
      totalCallVolumeUsd,
      totalPutVolumeUsd,
      overallOiPcr: ratio(totalPutOiUsd, totalCallOiUsd),
      overallVolumePcr: ratio(
        totalPutVolumeUsd,
        totalCallVolumeUsd,
      ),
      contractsCount,
      strikesCount: matrix.length,
    },

    matrix,
    updatedAt: new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const asset = (params.get('asset') || 'BTC').toUpperCase();

  const allowedAssets = new Set(['BTC', 'ETH', 'SOL', 'XAUT']);

  if (!allowedAssets.has(asset)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unsupported underlying asset.',
      },
      { status: 400 },
    );
  }

  const rawExpiry = params.get('expiry');

  const requestedExpiries = rawExpiry
    ? [
        ...new Set(
          rawExpiry
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      ].sort()
    : [];

  if (
    requestedExpiries.some((value) => !isValidIsoDate(value)) ||
    requestedExpiries.length > MAX_MULTI_EXPIRIES
  ) {
    return NextResponse.json(
      {
        success: false,
        error: `Choose up to ${MAX_MULTI_EXPIRIES} valid expiry dates.`,
      },
      { status: 400 },
    );
  }

  const cacheKey =
    `${asset}:${requestedExpiries.join(',') || 'nearest'}`;

  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.payload, {
      headers: {
        'X-Cache': 'HIT',
        'Cache-Control': 'no-store',
      },
    });
  }

  const baseUrl = (
    process.env.DELTA_API_BASE_URL ||
    'https://api.india.delta.exchange'
  ).replace(/\/+$/, '');

  try {
    // First fetch: discover available expiries.
    const allTickers = await fetchDeltaTickers(baseUrl, asset);

    const today = new Date().toISOString().slice(0, 10);

    const availableExpiries = [
      ...new Set(
        allTickers
          .map(getTickerExpiry)
          .filter(
            (expiry): expiry is string =>
              expiry !== null && expiry >= today,
          ),
      ),
    ].sort();

    if (availableExpiries.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Delta returned no active option expiries for ${asset}.`,
          asset,
        },
        { status: 404 },
      );
    }

    // Default to nearest expiry.
    const selectedExpiries =
      requestedExpiries.length > 0
        ? requestedExpiries
        : [availableExpiries[0]];

    const unavailable = selectedExpiries.filter(
      (expiry) => !availableExpiries.includes(expiry),
    );

    if (unavailable.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Expiry not available for ${asset}: ` +
            unavailable.join(', '),
          availableExpiries,
        },
        { status: 400 },
      );
    }

    // Fetch each selected expiry separately.
    const selectedTickerGroups = await Promise.all(
      selectedExpiries.map((expiry) =>
        fetchDeltaTickers(baseUrl, asset, expiry),
      ),
    );

    // Keep only the exact selected expiries and remove duplicate symbols.
    const seenSymbols = new Set<string>();

    const selectedTickers = selectedTickerGroups
      .flat()
      .filter((ticker) => {
        const tickerExpiry = getTickerExpiry(ticker);
        const symbol = ticker.symbol ?? '';

        if (
          !tickerExpiry ||
          !selectedExpiries.includes(tickerExpiry) ||
          !symbol ||
          seenSymbols.has(symbol)
        ) {
          return false;
        }

        seenSymbols.add(symbol);
        return true;
      });

    if (selectedTickers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No option ticker data returned for the selected expiry.',
          availableExpiries,
          selectedExpiries,
        },
        { status: 404 },
      );
    }

    const payload = makePayload(
      asset,
      selectedExpiries,
      availableExpiries,
      selectedTickers,
    );

    cache.set(cacheKey, {
      timestamp: Date.now(),
      payload,
    });

    // Keep the in-memory cache bounded.
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value;

      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }

    return NextResponse.json(payload, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    const status = (
      error as Error & { status?: number }
    ).status;

    const stale = cache.get(cacheKey);

    // Serve a known successful snapshot during temporary API/network failure.
    if (stale) {
      return NextResponse.json(
        {
          ...stale.payload,
          isStale: true,
          warning:
            'Delta is temporarily unavailable. Showing the last successful snapshot.',
        },
        {
          headers: {
            'X-Cache': 'STALE',
            'Cache-Control': 'no-store',
          },
        },
      );
    }

    console.error('[TCT Options API]', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load Delta options data.',
      },
      {
        status: status === 429 ? 429 : 502,
        headers: { 'Cache-Control': 'no-store' },
      },
    );
  }
}
