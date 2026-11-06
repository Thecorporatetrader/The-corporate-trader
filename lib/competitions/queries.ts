import 'server-only';
import { createPublicClient } from './public-client';
import { COMPETITION_COLUMNS, LEADERBOARD_COLUMNS, mapCompetition, mapLeaderboardRow } from './mappers';
import { getMockPageData } from './mock-data';
import type { CompetitionPageData, LeaderboardRow, Tier } from './types';

/**
 * Leaderboard for one competition, sorted by percent_gain DESC (disqualified traders last),
 * optionally filtered by tier. Reads the public `competition_leaderboard` view.
 */
export async function getLeaderboard(opts: {
  competitionId: string;
  tier?: Tier | 'all';
  limit?: number;
}): Promise<LeaderboardRow[]> {
  const supabase = createPublicClient();
  let q = supabase
    .from('competition_leaderboard')
    .select(LEADERBOARD_COLUMNS)
    .eq('competition_id', opts.competitionId)
    .order('status', { ascending: true }) // 'active' < 'disqualified'
    .order('percent_gain', { ascending: false })
    .limit(opts.limit ?? 500);

  if (opts.tier && opts.tier !== 'all') q = q.eq('tier', opts.tier);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(mapLeaderboardRow);
}

/** Everything the /competitions page needs, in one call. Falls back to demo data. */
export async function getCompetitionPageData(): Promise<CompetitionPageData> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return getMockPageData();
  }

  try {
    const supabase = createPublicClient();
    const nowIso = new Date().toISOString();

    const [activeRes, upcomingRes] = await Promise.all([
      supabase
        .from('competitions')
        .select(COMPETITION_COLUMNS)
        .eq('is_active', true)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('competitions')
        .select(COMPETITION_COLUMNS)
        .eq('registration_open', true)
        .gt('end_date', nowIso)
        .order('start_date', { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);
    if (activeRes.error) throw activeRes.error;
    if (upcomingRes.error) throw upcomingRes.error;

    const competition = activeRes.data ? mapCompetition(activeRes.data) : null;
    const registrationCompetition = upcomingRes.data ? mapCompetition(upcomingRes.data) : null;

    // Nothing created yet in the database -> show the demo layout
    if (!competition && !registrationCompetition) return getMockPageData();

    let leaderboard: LeaderboardRow[] = [];
    let activeTraders = 0;
    if (competition) {
      leaderboard = await getLeaderboard({ competitionId: competition.id });
      const { count } = await supabase
        .from('competition_leaderboard')
        .select('id', { count: 'exact', head: true })
        .eq('competition_id', competition.id)
        .eq('status', 'active');
      activeTraders = count ?? 0;
    }

    const headline = competition ?? registrationCompetition!;
    const daysLeft = competition
      ? Math.max(0, Math.ceil((new Date(competition.endDate).getTime() - Date.now()) / 86_400_000))
      : null;

    const synced = leaderboard.map((r) => r.lastSyncedAt).filter((v): v is string => !!v);
    const updatedAt = synced.length ? synced.reduce((a, b) => (a > b ? a : b)) : null;

    return {
      competition,
      registrationCompetition,
      stats: { totalPrizePool: headline.totalPrizePool, activeTraders, daysLeft },
      leaderboard,
      updatedAt,
      isDemo: false,
    };
  } catch (err) {
    console.error('[competitions] failed to load, showing demo data:', err);
    return getMockPageData();
  }
}
