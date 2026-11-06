'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, Gift, ShieldAlert, TrendingUp, Zap } from 'lucide-react';

interface Rule {
  icon: ReactNode;
  title: string;
  body: ReactNode;
}

const iconCls = 'h-5 w-5';

const RULES: Rule[] = [
  {
    icon: <TrendingUp className={`${iconCls} text-emerald-400`} aria-hidden />,
    title: 'Scoring: strictly % equity growth',
    body: (
      <>
        <p>
          Your score is the percentage growth of your account equity over the monthly cycle:{' '}
          <span className="text-zinc-200">(ending equity − starting equity) ÷ starting equity</span>.
        </p>
        <p>
          Your starting equity is captured from your account when the cycle begins. Dollar profit does not matter —
          only percentage — so a $150 account and a $20,000 account compete on equal terms. The Grand Champion is the
          highest % gain across all tiers.
        </p>
      </>
    ),
  },
  {
    icon: <ShieldAlert className={`${iconCls} text-rose-400`} aria-hidden />,
    title: 'Maximum drawdown: breach = automatic disqualification',
    body: (
      <>
        <p>
          Drawdown is measured on equity, peak to trough, including floating losses. Limits: Starter 20%, Pro 15%, Elite
          10%.
        </p>
        <p>
          If you breach your tier&apos;s limit you are disqualified automatically. Your row stays on the board marked
          Disqualified and your result is frozen.
        </p>
      </>
    ),
  },
  {
    icon: <Gift className={`${iconCls} text-amber-300`} aria-hidden />,
    title: 'Monthly Lucky Draw — regardless of rank',
    body: (
      <>
        <p>
          Every active participant who reaches the minimum trading volume for their tier (Starter 1.0 · Pro 3.0 · Elite
          5.0 lots) is entered into the monthly Lucky Draw, whatever their rank on the leaderboard.
        </p>
        <p>Participants disqualified during the cycle are not eligible for the draw.</p>
      </>
    ),
  },
  {
    icon: <Zap className={`${iconCls} text-emerald-400`} aria-hidden />,
    title: 'Eligibility & fair play',
    body: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Any trader with an MT5 account (live or demo) can join. One account per trader per cycle.</li>
        <li>Your equity at the start of the cycle must fall inside the balance range of the tier you picked.</li>
        <li>
          No deposits or withdrawals during the cycle. They are detected automatically and lead to disqualification.
        </li>
        <li>Account sharing, multi-account hedging and any manipulation lead to disqualification.</li>
      </ul>
    ),
  },
  {
    icon: <ShieldAlert className={`${iconCls} text-emerald-400`} aria-hidden />,
    title: 'Read-only tracking & your data',
    body: (
      <>
        <p>
          We only ever ask for your <span className="text-zinc-200">investor (read-only) password</span>. It cannot
          place or modify trades, and we never ask for your trading or master password.
        </p>
        <p>
          The public leaderboard shows only your chosen handle, tier and stats. Your name, email and account number are
          never shown.
        </p>
      </>
    ),
  },
];

export default function RulesAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-zinc-800 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
      {RULES.map((rule, i) => {
        const isOpen = open === i;
        return (
          <div key={rule.title}>
            <h3>
              <button
                type="button"
                id={`rule-btn-${i}`}
                aria-expanded={isOpen}
                aria-controls={`rule-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-zinc-800/40"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-800/80">
                  {rule.icon}
                </span>
                <span className="flex-1 font-medium text-white">{rule.title}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={`rule-panel-${i}`}
              role="region"
              aria-labelledby={`rule-btn-${i}`}
              hidden={!isOpen}
              className="space-y-3 px-5 pb-5 pl-[4.25rem] text-sm leading-relaxed text-zinc-400"
            >
              {rule.body}
            </div>
          </div>
        );
      })}
    </div>
  );
}
