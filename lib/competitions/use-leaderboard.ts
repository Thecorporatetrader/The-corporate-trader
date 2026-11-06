'use client';

import { useEffect, useState } from 'react';
import { createPublicClient } from './public-client';
import { LEADERBOARD_COLUMNS, mapLeaderboardRow } from './mappers';
import type { LeaderboardRow } from './types';

/**
 * Client hook: starts from the server-rendered rows and re-fetches the public leaderboard view
 * every `intervalMs` (default 60s). Pass live=false for demo data.
 */
export function useLeaderboard(opts: {
  competitionId: string | null;
  initialRows: LeaderboardRow[];
  live: boolean;
  intervalMs?: number;
}) {
  const { competitionId, initialRows, live, intervalMs = 60_000 } = opts;
  const [rows, setRows] = useState<LeaderboardRow[]>(initialRows);

  useEffect(() => {
    if (!live || !competitionId) return;
    let stopped = false;
    const supabase = createPublicClient();

    const load = async () => {
      const { data, error } = await supabase
        .from('competition_leaderboard')
        .select(LEADERBOARD_COLUMNS)
        .eq('competition_id', competitionId)
        .order('status', { ascending: true })
        .order('percent_gain', { ascending: false })
        .limit(500);
      if (!stopped && !error && data) setRows(data.map(mapLeaderboardRow));
    };

    const t = setInterval(load, intervalMs);
    return () => {
      stopped = true;
      clearInterval(t);
    };
  }, [competitionId, live, intervalMs]);

  return rows;
}
