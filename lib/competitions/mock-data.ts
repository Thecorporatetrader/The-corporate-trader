import type {
  Competition,
  CompetitionPageData,
  LeaderboardRow,
  ParticipantStatus,
  Tier,
} from './types';

/**
 * Dummy data so the page renders perfectly before Supabase is wired.
 * Shown only when Supabase env vars are missing or no competition exists yet
 * (the page displays a "Demo data" pill in that case).
 */

type Seed = [handle: string, tier: Tier, gain: number, equity: number, lots: number, dd: number, dq?: boolean];

const SEEDS: Seed[] = [
  ['GoldSniper_FX', 'elite', 31.8, 6124.4, 9.4, 6.2],
  ['LondonOpen', 'pro', 27.4, 1912.7, 5.1, 9.8],
  ['PipHarvester', 'starter', 24.9, 311.2, 2.6, 12.4],
  ['NightOwlTrades', 'elite', 19.6, 4388.1, 7.8, 7.9],
  ['RiskFirst_Ravi', 'pro', 17.3, 1203.9, 3.9, 5.4],
  ['SwingSage', 'starter', 15.2, 264.8, 1.7, 8.1],
  ['XAU_Whale', 'elite', 12.1, 11840.0, 6.2, 9.1],
  ['TrendRider', 'pro', 9.8, 842.5, 3.4, 11.2],
  ['ScalpMonk', 'starter', 8.4, 185.6, 4.2, 14.6],
  ['BreakoutBen', 'pro', 6.2, 1590.3, 2.1, 7.0],
  ['SteadyEddie', 'starter', 4.7, 131.4, 1.2, 4.3],
  ['MacroMaya', 'elite', 3.1, 3720.6, 5.6, 5.5],
  ['DrawdownDan', 'pro', -4.9, 612.8, 3.6, 16.3, true],
  ['OverLeveraged', 'starter', -12.6, 88.2, 2.0, 21.4, true],
];

function buildRows(): LeaderboardRow[] {
  const base = SEEDS.map(
    ([handle, tier, gain, equity, lots, dd, dq], i): LeaderboardRow => ({
      id: `demo-${i}`,
      handle,
      tier,
      percentGain: gain,
      equity,
      lotsTraded: lots,
      maxDrawdown: dd,
      status: (dq ? 'disqualified' : 'active') as ParticipantStatus,
      volumeMet: lots >= (tier === 'starter' ? 1 : tier === 'pro' ? 3 : 5),
      overallRank: 0,
      tierRank: 0,
      lastSyncedAt: null,
    })
  );

  // same ordering the SQL view uses: active first, then % gain desc
  const sorted = [...base].sort(
    (a, b) =>
      Number(b.status === 'active') - Number(a.status === 'active') || b.percentGain - a.percentGain
  );
  sorted.forEach((r, i) => (r.overallRank = i + 1));
  (['starter', 'pro', 'elite'] as Tier[]).forEach((t) =>
    sorted.filter((r) => r.tier === t).forEach((r, i) => (r.tierRank = i + 1))
  );
  return sorted;
}

export function getMockPageData(): CompetitionPageData {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1) - 1000);
  const nextStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const nextEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 1) - 1000);
  const month = (d: Date) => d.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

  const competition: Competition = {
    id: 'demo-current',
    title: `${month(start)} Championship`,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    isActive: true,
    registrationOpen: false,
    totalPrizePool: 5000,
  };
  const registrationCompetition: Competition = {
    id: 'demo-next',
    title: `${month(nextStart)} Championship`,
    startDate: nextStart.toISOString(),
    endDate: nextEnd.toISOString(),
    isActive: false,
    registrationOpen: true,
    totalPrizePool: 5000,
  };

  const leaderboard = buildRows();
  return {
    competition,
    registrationCompetition,
    stats: {
      totalPrizePool: competition.totalPrizePool,
      activeTraders: leaderboard.filter((r) => r.status === 'active').length,
      daysLeft: Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86_400_000)),
    },
    leaderboard,
    updatedAt: null,
    isDemo: true,
  };
}
