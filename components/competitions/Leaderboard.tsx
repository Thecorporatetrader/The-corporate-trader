'use client';

import { useEffect, useMemo, useState } from 'react';
import { Medal, TrendingUp, Zap } from 'lucide-react';
import { useLeaderboard } from '@/lib/competitions/use-leaderboard';
import { TIER_BY_ID, type LeaderboardRow, type Tier } from '@/lib/competitions/types';

type TabKey = 'all' | Tier;

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'All Tiers' },
  { key: 'starter', label: 'Starter' },
  { key: 'pro', label: 'Pro' },
  { key: 'elite', label: 'Elite' },
];

const TIER_CHIP: Record<Tier, string> = {
  starter: 'bg-zinc-800 text-zinc-300 ring-zinc-700',
  pro: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  elite: 'bg-amber-500/10 text-amber-300 ring-amber-500/30',
};

const MEDAL = ['text-amber-300', 'text-zinc-300', 'text-orange-400'];

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

interface Props {
  competitionId: string | null;
  initialRows: LeaderboardRow[];
  isDemo: boolean;
  updatedAt: string | null;
}

export default function Leaderboard({ competitionId, initialRows, isDemo, updatedAt }: Props) {
  const [tab, setTab] = useState<TabKey>('all');
  const rows = useLeaderboard({ competitionId, initialRows, live: !isDemo && !!competitionId });

  // format on the client only, so server/client timezones can't cause a hydration mismatch
  const [syncLabel, setSyncLabel] = useState<string | null>(null);
  useEffect(() => {
    const latest = rows.map((r) => r.lastSyncedAt).filter((v): v is string => !!v).sort().pop() ?? updatedAt;
    setSyncLabel(latest ? new Date(latest).toLocaleString() : null);
  }, [rows, updatedAt]);

  const counts = useMemo(
    () => ({
      all: rows.length,
      starter: rows.filter((r) => r.tier === 'starter').length,
      pro: rows.filter((r) => r.tier === 'pro').length,
      elite: rows.filter((r) => r.tier === 'elite').length,
    }),
    [rows]
  );

  const visible = useMemo(() => {
    const rankOf = (r: LeaderboardRow) => (tab === 'all' ? r.overallRank : r.tierRank);
    return rows
      .filter((r) => tab === 'all' || r.tier === tab)
      .map((r) => ({ ...r, shownRank: rankOf(r) }))
      .sort((a, b) => a.shownRank - b.shownRank);
  }, [rows, tab]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-xl shadow-black/30">
      {/* toolbar */}
      <div className="flex flex-col gap-4 border-b border-zinc-800 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div role="tablist" aria-label="Filter by tier" className="flex flex-wrap gap-2">
          {TABS.map((t) => {
            const selected = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                  selected
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                    : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {t.label}
                <span
                  className={`rounded-md px-1.5 text-xs ${
                    selected ? 'bg-zinc-950/20 text-zinc-950' : 'bg-zinc-900 text-zinc-400'
                  }`}
                >
                  {counts[t.key]}
                </span>
              </button>
            );
          })}
        </div>

        <span className="inline-flex items-center gap-2 self-start rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 sm:self-auto">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          Ranked by Percentage Gain (%)
        </span>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium sm:px-5">Rank</th>
              <th className="px-4 py-3 font-medium">Trader</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 text-right font-medium">Gain (%)</th>
              <th className="px-4 py-3 text-right font-medium">Equity ($)</th>
              <th className="px-4 py-3 text-right font-medium">Lots Traded</th>
              <th className="px-4 py-3 text-right font-medium">Max DD (%)</th>
              <th className="px-4 py-3 font-medium sm:pr-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/70">
            {visible.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-14 text-center text-zinc-500">
                  No traders on the board yet. Rankings appear after the first sync of the cycle.
                </td>
              </tr>
            )}

            {visible.map((r) => {
              const dq = r.status === 'disqualified';
              const cfg = TIER_BY_ID[r.tier];
              const nearLimit = !dq && r.maxDrawdown >= cfg.maxDrawdown * 0.8;
              return (
                <tr key={r.id} className={`transition hover:bg-zinc-800/40 ${dq ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3.5 sm:px-5">
                    {dq ? (
                      <span className="text-zinc-600">—</span>
                    ) : r.shownRank <= 3 ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                        <Medal className={`h-5 w-5 ${MEDAL[r.shownRank - 1]}`} aria-hidden />
                        {r.shownRank}
                      </span>
                    ) : (
                      <span className="pl-0.5 font-medium text-zinc-300">{r.shownRank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-white">{r.handle}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${TIER_CHIP[r.tier]}`}
                    >
                      {r.tier}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3.5 text-right font-semibold tabular-nums ${
                      r.percentGain >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {r.percentGain >= 0 ? '+' : ''}
                    {r.percentGain.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-zinc-200">{usd.format(r.equity)}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums">
                    <span className="inline-flex items-center justify-end gap-1.5 text-zinc-200">
                      {r.volumeMet && (
                        <Zap
                          className="h-3.5 w-3.5 text-emerald-400"
                          aria-label={`Minimum volume of ${cfg.minLots} lots met`}
                        />
                      )}
                      {r.lotsTraded.toFixed(1)}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3.5 text-right tabular-nums ${
                      dq ? 'text-rose-400' : nearLimit ? 'text-amber-400' : 'text-zinc-300'
                    }`}
                  >
                    {r.maxDrawdown.toFixed(1)}%
                    <span className="ml-1 text-xs text-zinc-600">/ {cfg.maxDrawdown}</span>
                  </td>
                  <td className="px-4 py-3.5 sm:pr-5">
                    {dq ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 ring-1 ring-inset ring-rose-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                        Disqualified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 px-4 py-3 text-xs text-zinc-500 sm:px-5">
        <span className="inline-flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> = minimum trading volume met (prize and lucky-draw
          eligible)
        </span>
        <span>
          {isDemo ? 'Demo data — not real traders' : syncLabel ? `Last synced ${syncLabel}` : 'Updates every few minutes'}
        </span>
      </div>
    </div>
  );
}
