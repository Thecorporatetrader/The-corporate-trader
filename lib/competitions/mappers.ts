import type { Competition, LeaderboardRow, ParticipantStatus, Tier } from './types';

/** Columns we read from the public view (never select('*') from the base table). */
export const LEADERBOARD_COLUMNS =
  'id, competition_id, display_handle, tier, percent_gain, current_equity, lots_traded, max_drawdown, status, volume_met, overall_rank, tier_rank, last_synced_at';

export const COMPETITION_COLUMNS =
  'id, title, start_date, end_date, is_active, registration_open, total_prize_pool';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapCompetition(r: any): Competition {
  return {
    id: r.id,
    title: r.title,
    startDate: r.start_date,
    endDate: r.end_date,
    isActive: !!r.is_active,
    registrationOpen: !!r.registration_open,
    totalPrizePool: Number(r.total_prize_pool ?? 0),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapLeaderboardRow(r: any): LeaderboardRow {
  return {
    id: r.id,
    handle: r.display_handle,
    tier: r.tier as Tier,
    percentGain: Number(r.percent_gain ?? 0),
    equity: Number(r.current_equity ?? 0),
    lotsTraded: Number(r.lots_traded ?? 0),
    maxDrawdown: Number(r.max_drawdown ?? 0),
    status: r.status as ParticipantStatus,
    volumeMet: !!r.volume_met,
    overallRank: Number(r.overall_rank ?? 0),
    tierRank: Number(r.tier_rank ?? 0),
    lastSyncedAt: r.last_synced_at ?? null,
  };
}
