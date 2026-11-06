import type { Metadata } from 'next';
import { Gift, Medal, ShieldAlert, TrendingUp, Trophy, Users, Zap, CalendarClock } from 'lucide-react';
import { getCompetitionPageData } from '@/lib/competitions/queries';
import { TIERS, type Tier } from '@/lib/competitions/types';
import Leaderboard from '@/components/competitions/Leaderboard';
import RulesAccordion from '@/components/competitions/RulesAccordion';
import RegisterButton from '@/components/competitions/RegisterButton';

// Server Component. Cached for 60s; the leaderboard also refreshes itself on the client.
export const revalidate = 60;
// Registration connects the MT5 account via MetaApi, which can take a few seconds.
export const maxDuration = 60;

export const metadata: Metadata = {
  title: 'Monthly Trading Championship | The Corporate Trader',
  description:
    'Trade your live or demo MT5 account, scale your capital, and win cash multipliers, custom EAs, and high-tier hardware. Ranked by % equity growth.',
};

const usd0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// Full class strings (no string-built classes) so Tailwind's compiler can see them.
const TIER_STYLE: Record<
  Tier,
  { card: string; chip: string; icon: string; bar: string; badge: string | null }
> = {
  starter: {
    card: 'border-zinc-800 hover:border-zinc-600',
    chip: 'bg-zinc-800 text-zinc-200',
    icon: 'text-zinc-300',
    bar: 'from-zinc-500/0 via-zinc-400/60 to-zinc-500/0',
    badge: null,
  },
  pro: {
    card: 'border-emerald-500/40 hover:border-emerald-400/70 shadow-lg shadow-emerald-500/5',
    chip: 'bg-emerald-500/15 text-emerald-300',
    icon: 'text-emerald-400',
    bar: 'from-emerald-500/0 via-emerald-400/70 to-emerald-500/0',
    badge: 'Most popular',
  },
  elite: {
    card: 'border-amber-500/40 hover:border-amber-400/70 shadow-lg shadow-amber-500/5',
    chip: 'bg-amber-500/15 text-amber-300',
    icon: 'text-amber-300',
    bar: 'from-amber-500/0 via-amber-300/70 to-amber-500/0',
    badge: null,
  },
};

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3 backdrop-blur">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800/80">{icon}</span>
      <div className="min-w-0">
        <div className="truncate text-lg font-semibold tabular-nums text-white">{value}</div>
        <div className="text-xs text-zinc-500">{label}</div>
      </div>
    </div>
  );
}

export default async function CompetitionsPage() {
  const { competition, registrationCompetition, stats, leaderboard, updatedAt, isDemo } =
    await getCompetitionPageData();

  const headlineCompetition = competition ?? registrationCompetition;

  return (
    <main className="min-h-screen bg-bg text-zinc-100">
      {/* ============ 1. HERO ============ */}
      <section className="relative overflow-hidden border-b border-zinc-900">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.16),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(245,158,11,0.10),_transparent_50%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="flex flex-wrap items-center gap-2">
            {headlineCompetition && (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {competition ? `Live now: ${competition.title}` : `Next up: ${headlineCompetition.title}`}
              </span>
            )}
            {isDemo && (
              <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-400">
                Demo data
              </span>
            )}
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Monthly Trading{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">
              Championship
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-400">
            Trade your live or demo account, scale your capital, and win cash multipliers, custom EAs, and high-tier
            hardware.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <RegisterButton
              label="Register for Next Month"
              competitionTitle={registrationCompetition?.title}
              disabled={!registrationCompetition}
            />
            <a
              href="#leaderboard"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-100 transition hover:border-emerald-500/60"
            >
              <TrendingUp className="h-4 w-4" aria-hidden /> View leaderboard
            </a>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-3">
            <Stat
              icon={<Trophy className="h-5 w-5 text-amber-300" aria-hidden />}
              label="Total Prize Pool"
              value={stats.totalPrizePool > 0 ? usd0.format(stats.totalPrizePool) : 'To be announced'}
            />
            <Stat
              icon={<Users className="h-5 w-5 text-emerald-400" aria-hidden />}
              label="Current Active Traders"
              value={stats.activeTraders.toLocaleString('en-US')}
            />
            <Stat
              icon={<CalendarClock className="h-5 w-5 text-emerald-400" aria-hidden />}
              label="Days Left in Current Cycle"
              value={stats.daysLeft === null ? '—' : String(stats.daysLeft)}
            />
          </div>
        </div>
      </section>

      {/* ============ 2. TIERS ============ */}
      <section id="tiers" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">Pick your tier</h2>
          <p className="mt-2 text-zinc-400">
            Tiers are set by your account equity, so you compete against traders with similar capital. Scoring is always
            percentage growth.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TIERS.map((t) => {
            const s = TIER_STYLE[t.id];
            return (
              <article
                key={t.id}
                className={`relative flex flex-col overflow-hidden rounded-2xl border bg-zinc-900/60 p-6 transition ${s.card}`}
              >
                <div aria-hidden className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${s.bar}`} />
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold ${s.chip}`}>
                    <Medal className="h-4 w-4" aria-hidden />
                    {t.name}
                  </span>
                  {s.badge && (
                    <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-950">
                      {s.badge}
                    </span>
                  )}
                </div>

                <div className="mt-5 text-3xl font-bold tracking-tight text-white">{t.balanceRange}</div>
                <div className="text-sm text-zinc-500">account balance</div>

                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-2 text-zinc-400">
                      <Zap className={`h-4 w-4 ${s.icon}`} aria-hidden /> Min volume
                    </dt>
                    <dd className="font-medium text-white">{t.minLots.toFixed(1)} Lot{t.minLots === 1 ? '' : 's'}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-2 text-zinc-400">
                      <ShieldAlert className={`h-4 w-4 ${s.icon}`} aria-hidden /> Max drawdown
                    </dt>
                    <dd className="font-medium text-white">{t.maxDrawdown}%</dd>
                  </div>
                </dl>

                <div className="mt-6 border-t border-zinc-800 pt-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    <Gift className={`h-4 w-4 ${s.icon}`} aria-hidden /> Prizes
                  </div>
                  <ul className="mt-3 space-y-1.5 text-sm text-zinc-200">
                    {t.prizes.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current ${s.icon}`} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        {/* Grand Champion */}
        <div className="relative mt-6 overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-emerald-500/10 p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl"
          />
          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 ring-1 ring-amber-300/40">
              <Trophy className="h-8 w-8 text-amber-300" aria-hidden />
            </span>
            <div className="flex-1">
              <div className="text-xs font-semibold uppercase tracking-widest text-amber-300">Grand Champion</div>
              <h3 className="mt-1 text-xl font-bold text-white sm:text-2xl">Highest overall % gain across all tiers</h3>
              <p className="mt-1.5 max-w-2xl text-sm text-zinc-300">
                One winner, any tier. Your percentage gain competes against every participant, whatever your starting
                balance — a small account can beat a large one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 3. LEADERBOARD ============ */}
      <section id="leaderboard" className="mx-auto max-w-6xl scroll-mt-8 px-4 pb-16 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Live leaderboard</h2>
            <p className="mt-2 text-zinc-400">
              {competition ? competition.title : 'Rankings appear when the next cycle starts.'}
            </p>
          </div>
        </div>
        <Leaderboard
          competitionId={competition?.id ?? null}
          initialRows={leaderboard}
          isDemo={isDemo}
          updatedAt={updatedAt}
        />
      </section>

      {/* ============ 4. RULES ============ */}
      <section id="rules" className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">Rules &amp; risk rules</h2>
        <p className="mb-6 mt-2 text-zinc-400">Simple, automatic, and the same for everyone.</p>
        <RulesAccordion />
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-zinc-900 p-8 text-center sm:p-10">
          <Trophy className="mx-auto h-9 w-9 text-amber-300" aria-hidden />
          <h2 className="mt-4 text-2xl font-bold text-white">Ready to compete?</h2>
          <p className="mx-auto mt-2 max-w-xl text-zinc-400">
            Any MT5 account — live or demo — can join. Register once and we track your results automatically, read-only.
          </p>
          <div className="mt-6 flex justify-center">
            <RegisterButton
              label="Register for Next Month"
              competitionTitle={registrationCompetition?.title}
              disabled={!registrationCompetition}
            />
          </div>
          <p className="mx-auto mt-6 max-w-xl text-[11px] leading-relaxed text-zinc-600">
            Trading leveraged products involves significant risk of loss. Competition results are not indicative of future
            performance and nothing here is financial advice.
          </p>
        </div>
      </section>
    </main>
  );
}
