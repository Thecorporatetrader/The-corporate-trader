'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Activity,
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  RefreshCw,
  Search,
  Wifi,
  WifiOff,
} from 'lucide-react';

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

type OptionsApiResponse = {
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
  isStale?: boolean;
  warning?: string;
};

interface OptionsMatrixProps {
  initialAsset?: 'BTC' | 'ETH' | 'SOL' | 'XAUT';
  className?: string;
}

const ASSETS = ['XAUT', 'BTC', 'ETH', 'SOL'] as const;

const REFRESH_SECONDS = 15;
const MAX_EXPIRIES = 5;

const displayAsset = (asset: string) =>
  asset === 'XAUT' ? 'XAUUSD' : asset;

function formatUsd(value: number | null | undefined): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return '—';
  }

  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

function formatPrice(value: number | null | undefined): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return '—';
  }

  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPcr(value: number | null | undefined): string {
  return value === null || value === undefined
    ? '—'
    : value.toFixed(2);
}

function formatExpiry(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function shortNumber(value: number | null | undefined): string {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return '—';
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value);
}

function MetricCard({
  title,
  value,
  subtitle,
  accent = 'cyan',
}: {
  title: string;
  value: string;
  subtitle: string;
  accent?: 'cyan' | 'green' | 'red' | 'amber';
}) {
  const accentClasses = {
    cyan: 'text-cyan-300 border-cyan-500/20',
    green: 'text-emerald-300 border-emerald-500/20',
    red: 'text-rose-300 border-rose-500/20',
    amber: 'text-amber-300 border-amber-500/20',
  };

  return (
    <div
      className={`rounded-xl border bg-slate-900/70 p-4 ${accentClasses[accent]}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-2 font-mono text-xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-[11px] text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

export default function OptionsMatrix({
  initialAsset = 'XAUT',
  className = '',
}: OptionsMatrixProps) {
  const [asset, setAsset] = useState<(typeof ASSETS)[number]>(
    initialAsset,
  );

  const [selectedExpiries, setSelectedExpiries] = useState<string[]>(
    [],
  );

  const [data, setData] = useState<OptionsApiResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const [expiryOpen, setExpiryOpen] = useState(false);
  const [search, setSearch] = useState('');

  const [autoRefresh, setAutoRefresh] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_SECONDS);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Keep the latest data available without making fetchData depend on it.
  const dataRef = useRef<OptionsApiResponse | null>(null);

  // Prevent old requests from overwriting newer asset/expiry selections.
  const requestIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(
    async (background = false) => {
      const requestId = ++requestIdRef.current;

      // Cancel any previous request.
      abortControllerRef.current?.abort();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      if (background) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const params = new URLSearchParams({ asset });

        if (selectedExpiries.length > 0) {
          params.set('expiry', selectedExpiries.join(','));
        }

        const response = await fetch(
          `/api/options?${params.toString()}`,
          {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
          },
        );

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(
            json.error ||
              `Options request failed (${response.status})`,
          );
        }

        // Ignore an old response if a newer request has started.
        if (requestId !== requestIdRef.current) return;

        const result = json as OptionsApiResponse;

        dataRef.current = result;
        setData(result);

        setWarning(result.warning ?? null);
        setLastUpdated(new Date(result.updatedAt));

        // Adopt the nearest expiry returned by the backend on first load.
        if (
          selectedExpiries.length === 0 &&
          result.selectedExpiries.length > 0
        ) {
          setSelectedExpiries(result.selectedExpiries);
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === 'AbortError'
        ) {
          return;
        }

        if (requestId !== requestIdRef.current) return;

        const message =
          err instanceof Error
            ? err.message
            : 'Unable to load options data.';

        setError(message);

        // Retain the last successful snapshot if one exists.
        if (dataRef.current) {
          setWarning(
            'Refresh failed. Showing the last successful snapshot.',
          );
        }
      } finally {
        // Only the latest request may change loading indicators.
        if (requestId === requestIdRef.current) {
          setLoading(false);
          setRefreshing(false);
          setSecondsLeft(REFRESH_SECONDS);
        }
      }
    },
    [asset, selectedExpiries],
  );

  // Fetch whenever the asset or expiry selection changes.
  useEffect(() => {
    void fetchData(false);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  // Abort any pending request when the component unmounts.
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Stable auto-refresh timer. It resets when the selected query changes.
  useEffect(() => {
    if (!autoRefresh) {
      setSecondsLeft(REFRESH_SECONDS);
      return;
    }

    const countdown = window.setInterval(() => {
      setSecondsLeft((current) =>
        current <= 1 ? REFRESH_SECONDS : current - 1,
      );
    }, 1000);

    const refresh = window.setInterval(() => {
      void fetchData(true);
    }, REFRESH_SECONDS * 1000);

    return () => {
      window.clearInterval(countdown);
      window.clearInterval(refresh);
    };
  }, [autoRefresh, fetchData]);

  const changeAsset = (
    nextAsset: (typeof ASSETS)[number],
  ) => {
    if (nextAsset === asset) return;

    // Immediately invalidate the current request.
    requestIdRef.current += 1;
    abortControllerRef.current?.abort();

    setAsset(nextAsset);
    setSelectedExpiries([]);

    dataRef.current = null;
    setData(null);

    setError(null);
    setWarning(null);
    setLastUpdated(null);

    setSearch('');
    setExpiryOpen(false);
    setLoading(true);
    setSecondsLeft(REFRESH_SECONDS);
  };

  const toggleExpiry = (expiry: string) => {
    setSelectedExpiries((current) => {
      if (current.includes(expiry)) {
        const next = current.filter(
          (item) => item !== expiry,
        );

        // Do not allow an empty selection when expiries are available.
        if (
          next.length === 0 &&
          data?.availableExpiries.length
        ) {
          return [data.availableExpiries[0]];
        }

        return next;
      }

      if (current.length >= MAX_EXPIRIES) {
        return current;
      }

      return [...current, expiry].sort();
    });
  };

  const selectNearestExpiry = () => {
    const nearest = data?.availableExpiries[0];

    if (nearest) {
      setSelectedExpiries([nearest]);
    }

    setExpiryOpen(false);
  };

  const selectAllVisibleExpiries = () => {
    if (!data) return;

    setSelectedExpiries(
      data.availableExpiries.slice(0, MAX_EXPIRIES),
    );

    setExpiryOpen(false);
  };

  const filteredRows = useMemo(() => {
    if (!data) return [];

    const query = search.trim();

    if (!query) return data.matrix;

    return data.matrix.filter((row) =>
      String(row.strike).includes(query),
    );
  }, [data, search]);

  const maxOi = useMemo(() => {
    if (!data) return 0;

    return Math.max(
      0,
      ...data.matrix.flatMap((row) => [
        row.callOiUsd ?? 0,
        row.putOiUsd ?? 0,
      ]),
    );
  }, [data]);

  const maxVolume = useMemo(() => {
    if (!data) return 0;

    return Math.max(
      0,
      ...data.matrix.flatMap((row) => [
        row.callVolumeUsd ?? 0,
        row.putVolumeUsd ?? 0,
      ]),
    );
  }, [data]);

  const summary = data?.summary;
  const spot = data?.underlyingSpotPrice ?? null;

  const sentiment =
    summary?.overallOiPcr === null ||
    summary?.overallOiPcr === undefined
      ? 'Unavailable'
      : summary.overallOiPcr > 1
        ? 'Put-side OI higher'
        : summary.overallOiPcr < 1
          ? 'Call-side OI higher'
          : 'Balanced';

  const selectedExpiryLabel =
    selectedExpiries.length === 0
      ? 'Loading expiry…'
      : selectedExpiries.length === 1
        ? formatExpiry(selectedExpiries[0])
        : `${selectedExpiries.length} expiries combined`;

  const topOiRows = useMemo(() => {
    if (!data) return [];

    return data.matrix
      .slice()
      .sort(
        (a, b) =>
          (b.callOiUsd ?? 0) +
          (b.putOiUsd ?? 0) -
          ((a.callOiUsd ?? 0) + (a.putOiUsd ?? 0)),
      )
      .slice(0, 8);
  }, [data]);

  const topVolumeRows = useMemo(() => {
    if (!data) return [];

    return data.matrix
      .slice()
      .sort(
        (a, b) =>
          (b.callVolumeUsd ?? 0) +
          (b.putVolumeUsd ?? 0) -
          ((a.callVolumeUsd ?? 0) + (a.putVolumeUsd ?? 0)),
      )
      .slice(0, 8);
  }, [data]);

  return (
    <div
      className={`w-full rounded-2xl border border-slate-800 bg-[#080d17] p-4 text-slate-100 shadow-2xl md:p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-2.5 text-cyan-300">
              <Activity className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-wide text-white md:text-xl">
                OPTIONS MARKET STRUCTURE
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Delta Exchange · Open interest and turnover in USD
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                {displayAsset(asset)} spot
              </p>

              <p className="mt-0.5 font-mono text-lg font-bold text-white">
                {spot === null ? '—' : `$${formatPrice(spot)}`}
              </p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                Selected expiry
              </p>

              <p className="mt-0.5 text-sm font-semibold text-slate-200">
                {selectedExpiryLabel}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {error ? (
                <WifiOff className="h-3.5 w-3.5 text-rose-400" />
              ) : (
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
              )}

              <span
                className={
                  error ? 'text-rose-300' : 'text-emerald-300'
                }
              >
                {error
                  ? 'Feed issue'
                  : data?.isStale
                    ? 'Cached snapshot'
                    : 'Delta feed'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchData(false)}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500/50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                loading || refreshing ? 'animate-spin' : ''
              }`}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setAutoRefresh((value) => !value)}
            className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
              autoRefresh
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-slate-700 bg-slate-900 text-slate-400'
            }`}
          >
            Auto refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>

          <span className="font-mono text-[11px] text-slate-500">
            {autoRefresh ? `${secondsLeft}s` : 'Paused'}
          </span>
        </div>
      </div>

      {/* Asset and expiry controls */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-1">
          {ASSETS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => changeAsset(item)}
              className={`rounded-md px-3 py-2 text-xs font-bold transition ${
                asset === item
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {displayAsset(item)}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setExpiryOpen((value) => !value)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-cyan-500/50"
          >
            <CalendarDays className="h-4 w-4 text-cyan-300" />
            {selectedExpiryLabel}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {expiryOpen && (
            <div className="absolute left-0 top-full z-30 mt-2 max-h-80 w-72 overflow-y-auto rounded-xl border border-slate-700 bg-[#101827] p-3 shadow-2xl">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-white">
                  Select expiry
                </p>

                <button
                  type="button"
                  onClick={selectNearestExpiry}
                  className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Nearest only
                </button>
              </div>

              <p className="mb-2 text-[10px] text-slate-500">
                Select up to {MAX_EXPIRIES} expiries to combine.
              </p>

              {data?.availableExpiries.map((expiry) => {
                const checked = selectedExpiries.includes(expiry);

                const disabled =
                  !checked &&
                  selectedExpiries.length >= MAX_EXPIRIES;

                return (
                  <button
                    key={expiry}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleExpiry(expiry)}
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>{formatExpiry(expiry)}</span>

                    {checked && (
                      <Check className="h-4 w-4 text-cyan-300" />
                    )}
                  </button>
                );
              })}

              <div className="mt-3 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  onClick={selectAllVisibleExpiries}
                  className="w-full rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
                >
                  Combine nearest {MAX_EXPIRIES} expiries
                </button>

                <button
                  type="button"
                  onClick={() => setExpiryOpen(false)}
                  className="mt-2 w-full rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Clock3 className="h-3.5 w-3.5" />
          Current ticker/session data
        </div>
      </div>

      {/* Warnings and errors */}
      {(warning || error) && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{warning || error}</span>
        </div>
      )}

      {/* Summary cards */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Call open interest"
          value={formatUsd(summary?.totalCallOiUsd)}
          subtitle="USD value · Delta oi_value_usd"
          accent="cyan"
        />

        <MetricCard
          title="Put open interest"
          value={formatUsd(summary?.totalPutOiUsd)}
          subtitle="USD value · Delta oi_value_usd"
          accent="red"
        />

        <MetricCard
          title="Call volume"
          value={formatUsd(summary?.totalCallVolumeUsd)}
          subtitle="USD turnover · Delta turnover_usd"
          accent="green"
        />

        <MetricCard
          title="Put volume"
          value={formatUsd(summary?.totalPutVolumeUsd)}
          subtitle="USD turnover · Delta turnover_usd"
          accent="amber"
        />
      </div>

      {/* PCR and market coverage */}
      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Open interest PCR
          </p>

          <p className="mt-2 font-mono text-2xl font-bold text-white">
            {formatPcr(summary?.overallOiPcr)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {sentiment}
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Volume PCR
          </p>

          <p className="mt-2 font-mono text-2xl font-bold text-white">
            {formatPcr(summary?.overallVolumePcr)}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Put USD turnover ÷ call USD turnover
          </p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-500">
            Market coverage
          </p>

          <p className="mt-2 font-mono text-2xl font-bold text-white">
            {summary?.strikesCount ?? '—'}

            <span className="ml-2 text-sm font-normal text-slate-500">
              strikes
            </span>
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {summary?.contractsCount ?? '—'} option contracts
          </p>
        </div>
      </div>

      {/* USD comparison bars */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Open interest */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Open interest by strike
            </h3>

            <span className="text-[10px] text-slate-500">
              USD
            </span>
          </div>

          <div className="mb-3 flex gap-4 text-[10px] text-slate-400">
            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-cyan-400" />
              Calls
            </span>

            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-fuchsia-400" />
              Puts
            </span>
          </div>

          <div className="space-y-4">
            {topOiRows.map((row) => (
              <div key={row.strike} className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-mono text-slate-300">
                    {formatPrice(row.strike)}
                  </span>

                  <span className="font-mono text-slate-500">
                    {shortNumber(
                      (row.callOiUsd ?? 0) +
                        (row.putOiUsd ?? 0),
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{
                        width: `${
                          maxOi
                            ? ((row.callOiUsd ?? 0) / maxOi) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-fuchsia-400"
                      style={{
                        width: `${
                          maxOi
                            ? ((row.putOiUsd ?? 0) / maxOi) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {data && topOiRows.length === 0 && (
              <p className="text-xs text-slate-500">
                No open-interest data available.
              </p>
            )}
          </div>
        </div>

        {/* Volume */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">
              Volume by strike
            </h3>

            <span className="text-[10px] text-slate-500">
              USD turnover
            </span>
          </div>

          <div className="mb-3 flex gap-4 text-[10px] text-slate-400">
            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-cyan-400" />
              Calls
            </span>

            <span>
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-fuchsia-400" />
              Puts
            </span>
          </div>

          <div className="space-y-4">
            {topVolumeRows.map((row) => (
              <div key={row.strike} className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="font-mono text-slate-300">
                    {formatPrice(row.strike)}
                  </span>

                  <span className="font-mono text-slate-500">
                    {shortNumber(
                      (row.callVolumeUsd ?? 0) +
                        (row.putVolumeUsd ?? 0),
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-cyan-400"
                      style={{
                        width: `${
                          maxVolume
                            ? ((row.callVolumeUsd ?? 0) /
                                maxVolume) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-fuchsia-400"
                      style={{
                        width: `${
                          maxVolume
                            ? ((row.putVolumeUsd ?? 0) /
                                maxVolume) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {data && topVolumeRows.length === 0 && (
              <p className="text-xs text-slate-500">
                No volume data available.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Strike matrix */}
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-800">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-white">
              Options strike matrix
            </h3>

            <p className="mt-1 text-[11px] text-slate-500">
              All displayed OI and volume values are in USD
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search strike..."
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-500 sm:w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-right text-xs">
            <thead className="bg-slate-950 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">
                  Strike
                </th>

                <th className="px-4 py-3 text-cyan-300">
                  Call OI USD
                </th>

                <th className="px-4 py-3 text-fuchsia-300">
                  Put OI USD
                </th>

                <th className="px-4 py-3 text-cyan-300">
                  Call volume USD
                </th>

                <th className="px-4 py-3 text-fuchsia-300">
                  Put volume USD
                </th>

                <th className="px-4 py-3">
                  OI PCR
                </th>

                <th className="px-4 py-3">
                  Volume PCR
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => {
                const isAtm =
                  spot !== null &&
                  Math.abs(row.strike - spot) <=
                    Math.max(1, spot * 0.002);

                return (
                  <tr
                    key={row.strike}
                    className={`border-t border-slate-800/80 hover:bg-slate-800/40 ${
                      isAtm ? 'bg-cyan-500/5' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-left font-mono font-bold text-white">
                      {formatPrice(row.strike)}

                      {isAtm && (
                        <span className="ml-2 rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] text-cyan-300">
                          NEAR SPOT
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono text-cyan-200">
                      {formatUsd(row.callOiUsd)}
                    </td>

                    <td className="px-4 py-3 font-mono text-fuchsia-200">
                      {formatUsd(row.putOiUsd)}
                    </td>

                    <td className="px-4 py-3 font-mono text-cyan-200">
                      {formatUsd(row.callVolumeUsd)}
                    </td>

                    <td className="px-4 py-3 font-mono text-fuchsia-200">
                      {formatUsd(row.putVolumeUsd)}
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-300">
                      {formatPcr(row.oiPcr)}
                    </td>

                    <td className="px-4 py-3 font-mono text-slate-300">
                      {formatPcr(row.volumePcr)}
                    </td>
                  </tr>
                );
              })}

              {filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    {loading
                      ? 'Loading option chain…'
                      : 'No strikes match this search.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex flex-col justify-between gap-2 text-[10px] text-slate-500 sm:flex-row">
        <p>
          Source: Delta Exchange public ticker API · USD values only
        </p>

        <p>
          {lastUpdated
            ? `Updated ${lastUpdated.toLocaleTimeString()}`
            : 'Waiting for first update'}

          {' · '}

          {data?.isMultiExpiry
            ? 'Multi-expiry aggregate'
            : 'Single expiry'}
        </p>
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-600">
        OI is Delta&apos;s USD open-interest value. Volume is
        Delta&apos;s USD turnover value. These are current
        ticker/session values, not a historical 15-minute, 1-hour,
        or 24-hour change series. Missing source values are shown
        as dashes and are not estimated. PCR describes the ratio
        of put-side to call-side values; it is not a standalone
        bullish or bearish trading signal.
      </p>
    </div>
  );
}
