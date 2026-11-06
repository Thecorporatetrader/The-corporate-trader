export type Tier = 'starter' | 'pro' | 'elite';
export type ParticipantStatus = 'active' | 'disqualified';

export interface Competition {
  id: string;
  title: string;
  startDate: string; // ISO
  endDate: string; // ISO
  isActive: boolean;
  registrationOpen: boolean;
  totalPrizePool: number;
}

/** One row of the public `competition_leaderboard` view */
export interface LeaderboardRow {
  id: string;
  handle: string;
  tier: Tier;
  percentGain: number;
  equity: number;
  lotsTraded: number;
  maxDrawdown: number;
  status: ParticipantStatus;
  volumeMet: boolean;
  overallRank: number;
  tierRank: number;
  lastSyncedAt: string | null;
}

export interface CompetitionStats {
  totalPrizePool: number;
  activeTraders: number;
  daysLeft: number | null; // null when no cycle is running
}

export interface CompetitionPageData {
  competition: Competition | null; // the running cycle (leaderboard)
  registrationCompetition: Competition | null; // the cycle people can sign up for
  stats: CompetitionStats;
  leaderboard: LeaderboardRow[];
  updatedAt: string | null;
  isDemo: boolean;
}

export interface TierConfig {
  id: Tier;
  name: string;
  balanceRange: string;
  minEquity: number;
  maxEquity: number | null; // exclusive upper bound
  minLots: number;
  maxDrawdown: number; // %
  prizes: string[];
}

/** Keep in sync with tier_min_lots / tier_max_drawdown / tier_for_equity in the SQL migration. */
export const TIERS: TierConfig[] = [
  {
    id: 'starter',
    name: 'Starter',
    balanceRange: '$100 – $499',
    minEquity: 100,
    maxEquity: 500,
    minLots: 1,
    maxDrawdown: 20,
    prizes: ['Cash multipliers', 'Free custom EAs'],
  },
  {
    id: 'pro',
    name: 'Pro',
    balanceRange: '$500 – $2,499',
    minEquity: 500,
    maxEquity: 2500,
    minLots: 3,
    maxDrawdown: 15,
    prizes: ['Higher cash rewards', 'Advanced EAs'],
  },
  {
    id: 'elite',
    name: 'Elite',
    balanceRange: '$2,500+',
    minEquity: 2500,
    maxEquity: null,
    minLots: 5,
    maxDrawdown: 10,
    prizes: ['Laptops', 'High-tier hardware'],
  },
];

export const TIER_BY_ID: Record<Tier, TierConfig> = Object.fromEntries(
  TIERS.map((t) => [t.id, t])
) as Record<Tier, TierConfig>;
