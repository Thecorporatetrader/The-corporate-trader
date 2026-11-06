/**
 * GET/POST /api/competitions/sync     (call every ~5 minutes)
 * Header:  Authorization: Bearer <CRON_SECRET>
 *
 * What it does
 *   1. flips competitions.is_active when start/end dates pass
 *   2. for every ACTIVE participant: reads equity (+ lots / deposits) from MetaApi and writes
 *      current_equity, peak_equity, max_drawdown, lots_traded
 *   3. captures the baseline (starting_equity, baseline_lots, baseline_deposits) on the first sync after the cycle starts
 *   4. disqualifies on: max drawdown breach, deposit/withdrawal during the cycle, equity outside tier range
 *   5. refreshes lucky_draw_entries
 *   6. removes MetaApi accounts of competitions that ended > 24h ago (stops billing)
 */
import { NextRequest, NextResponse } from 'next/server';
import { serverClients } from '@/lib/server';
import { getAccountInformation, getMetrics, removeAccount } from '@/lib/metaapi';
import { TIER_BY_ID, type Tier } from '@/lib/competitions/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const CONCURRENCY = 5;
const round2 = (n: number) => Math.round(n * 100) / 100;

interface ParticipantRow {
  id: string;
  competition_id: string;
  tier: Tier;
  metaapi_account_id: string;
  starting_equity: number | string;
  peak_equity: number | string;
  max_drawdown: number | string;
  baseline_lots: number | string;
  baseline_deposits: number | string;
  lots_traded: number | string;
}

type Outcome = 'updated' | 'skipped' | 'disqualified';

async function processOne(admin: ReturnType<typeof serverClients>['admin'], p: ParticipantRow): Promise<Outcome> {
  const accountId = p.metaapi_account_id;
  const [info, metrics] = await Promise.all([
    getAccountInformation(accountId),
    getMetrics(accountId).catch(() => null), // may be null while MetaApi is still calculating
  ]);

  const equity = Number(info.equity);
  if (!Number.isFinite(equity) || equity <= 0) return 'skipped';

  const tier = TIER_BY_ID[p.tier];
  const now = new Date().toISOString();
  const startingEquity = Number(p.starting_equity);

  // ---- first sync after the cycle starts: capture the baseline ----
  if (startingEquity === 0) {
    if (!metrics) return 'skipped'; // need lots + deposits baseline, retry next run
    const inTier = equity >= tier.minEquity && (tier.maxEquity === null || equity < tier.maxEquity);
    const { error } = await admin
      .from('competition_participants')
      .update({
        starting_equity: round2(equity),
        current_equity: round2(equity),
        peak_equity: round2(equity),
        baseline_lots: metrics.lots,
        baseline_deposits: metrics.deposits,
        last_synced_at: now,
        ...(inTier ? {} : { status: 'disqualified', disqualified_reason: 'equity_outside_tier' }),
      })
      .eq('id', p.id);
    if (error) throw error;
    return inTier ? 'updated' : 'disqualified';
  }

  // ---- regular update ----
  const peak = Math.max(Number(p.peak_equity), equity);
  const drawdown = peak > 0 ? ((peak - equity) / peak) * 100 : 0;
  const maxDrawdown = round2(Math.max(Number(p.max_drawdown), drawdown));
  const lots = metrics ? Math.max(0, round2(metrics.lots - Number(p.baseline_lots))) : Number(p.lots_traded);
  const depositDelta = metrics ? Math.abs(metrics.deposits - Number(p.baseline_deposits)) : 0;

  let reason: string | null = null;
  if (depositDelta > 1) reason = 'deposit_or_withdrawal';
  else if (maxDrawdown > tier.maxDrawdown) reason = 'max_drawdown_breached';

  const { error } = await admin
    .from('competition_participants')
    .update({
      current_equity: round2(equity),
      peak_equity: round2(peak),
      max_drawdown: maxDrawdown,
      lots_traded: lots,
      last_synced_at: now,
      ...(reason ? { status: 'disqualified', disqualified_reason: reason } : {}),
    })
    .eq('id', p.id);
  if (error) throw error;
  return reason ? 'disqualified' : 'updated';
}

async function run(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = serverClients().admin;
  const nowIso = new Date().toISOString();
  const summary = { activated: 0, deactivated: 0, processed: 0, updated: 0, disqualified: 0, skipped: 0, errors: 0, removed: 0 };

  // 1) lifecycle: activate cycles that started (an ended one is deactivated AFTER its final sync below)
  const { data: started } = await admin
    .from('competitions')
    .update({ is_active: true })
    .eq('is_active', false)
    .lte('start_date', nowIso)
    .gt('end_date', nowIso)
    .select('id');
  summary.activated = started?.length ?? 0;

  // 2) sync every ACTIVE participant of every active competition
  const { data: active } = await admin.from('competitions').select('id').eq('is_active', true);
  const activeIds = (active ?? []).map((c) => c.id as string);

  if (activeIds.length > 0) {
    const { data: rows, error } = await admin
      .from('competition_participants')
      .select(
        'id, competition_id, tier, metaapi_account_id, starting_equity, peak_equity, max_drawdown, baseline_lots, baseline_deposits, lots_traded'
      )
      .in('competition_id', activeIds)
      .eq('status', 'active')
      .not('metaapi_account_id', 'is', null);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const list = (rows ?? []) as ParticipantRow[];
    summary.processed = list.length;

    for (let i = 0; i < list.length; i += CONCURRENCY) {
      const results = await Promise.allSettled(list.slice(i, i + CONCURRENCY).map((p) => processOne(admin, p)));
      for (const r of results) {
        if (r.status === 'rejected') summary.errors++;
        else if (r.value === 'updated') summary.updated++;
        else if (r.value === 'disqualified') summary.disqualified++;
        else summary.skipped++;
      }
    }

    // 3) lucky draw
    for (const id of activeIds) {
      await admin.rpc('refresh_lucky_draw_entries', { p_competition_id: id });
    }
  }

  // 4) the run that happens after end_date was the final snapshot -> close the cycle
  const { data: ended } = await admin
    .from('competitions')
    .update({ is_active: false })
    .eq('is_active', true)
    .lt('end_date', nowIso)
    .select('id');
  summary.deactivated = ended?.length ?? 0;

  // 5) stop paying for tracking accounts of cycles that ended more than 24h ago
  const cutoff = new Date(Date.now() - 24 * 3_600_000).toISOString();
  const { data: old } = await admin.from('competitions').select('id').lt('end_date', cutoff);
  if (old?.length) {
    const { data: stale } = await admin
      .from('competition_participants')
      .select('id, metaapi_account_id')
      .in('competition_id', old.map((c) => c.id as string))
      .not('metaapi_account_id', 'is', null)
      .limit(50);
    for (const s of stale ?? []) {
      try {
        await removeAccount(s.metaapi_account_id as string);
        await admin.from('competition_participants').update({ metaapi_account_id: null }).eq('id', s.id);
        summary.removed++;
      } catch {
        summary.errors++;
      }
    }
  }

  return NextResponse.json({ ok: true, ...summary });
}

export const GET = run;
export const POST = run;
