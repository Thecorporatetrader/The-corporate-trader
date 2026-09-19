export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All';

/** Keys understood by components/Library/VisualChartDiagram.tsx */
export type PatternKey =
  | 'head-shoulders-top'
  | 'double-top'
  | 'ascending-triangle'
  | 'bull-flag'
  | 'cup-handle'
  | 'hammer-candle'
  | 'bullish-engulfing'
  | 'doji'
  | 'liquidity-sweep'
  | 'demand-zone-retest'
  | 'support-break-retest';

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'example'; title: string; text: string }
  | { type: 'math'; formula: string; explanation: string }
  | { type: 'code'; language: string; code: string; description: string }
  | { type: 'concept-box'; title: string; points: string[] }
  | { type: 'chart-placeholder'; caption: string }
  | { type: 'cheat-sheet'; title: string; rows: { label: string; value: string }[] }
  | { type: 'diagram'; pattern: PatternKey; caption?: string };

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'interactive';
  duration: string;
  content: ContentBlock[];
}

export interface Module {
  id: string;
  level: Exclude<ExperienceLevel, 'All'>;
  order: number;
  title: string;
  focus: string;
  lessons: Lesson[];
}

/* ------------------------------------------------------------------ */
/* Universal Macroeconomics Hub — pinned across every level            */
/* ------------------------------------------------------------------ */

export const macroHub: Module = {
  id: 'macro_hub',
  level: 'Beginner', // not filtered on; rendered separately & pinned for all
  order: 0,
  title: 'Macroeconomics Hub',
  focus: 'How global data releases move XAU/USD, Forex & Indices — for every level.',
  lessons: [
    {
      id: 'macro_1',
      title: 'The US Data Calendar: CPI, NFP, FOMC, Retail Sales & PPI',
      type: 'article',
      description: 'What each release measures and why price reacts.',
      duration: '18m',
      content: [
        {
          type: 'paragraph',
          text: 'Macro releases do not create market structure — they act as a catalyst that accelerates price toward liquidity that already exists on the chart. Understanding what each release measures tells you which asset classes are most sensitive to it.',
        },
        {
          type: 'cheat-sheet',
          title: 'High-Impact US Release Cheat-Sheet',
          rows: [
            { label: 'CPI (Consumer Price Index)', value: 'Inflation gauge. Hot print → rate-cut odds fall → USD strength, Gold pressure.' },
            { label: 'NFP (Non-Farm Payrolls)', value: 'Labour market health, released first Friday of the month. Drives the largest single-day volatility in Gold and Indices.' },
            { label: 'FOMC (Fed Rate Decision)', value: 'Sets the policy rate; the statement + press conference tone often matters more than the rate itself.' },
            { label: 'Retail Sales', value: 'Consumer spending proxy. A leading signal for growth expectations and risk-on/off flows.' },
            { label: 'PPI (Producer Price Index)', value: 'Upstream inflation. A leading indicator that often pre-signals the following month\u2019s CPI.' },
          ],
        },
        {
          type: 'chart-placeholder',
          caption: 'Embed: XAU/USD 1-minute chart overlay across the last 4 NFP releases (spike + retrace pattern).',
        },
      ],
    },
    {
      id: 'macro_2',
      title: 'Risk Management Around High-Impact News',
      type: 'article',
      description: 'Position sizing and execution rules for event risk.',
      duration: '12m',
      content: [
        {
          type: 'paragraph',
          text: 'During Tier-1 news, algorithmic liquidity providers pull resting limit orders, and the bid/ask spread can widen from a fraction of a pip to several pips in seconds. Retail stop-losses sitting at obvious structural levels are frequently swept before the "real" directional move begins.',
        },
        {
          type: 'concept-box',
          title: 'Non-negotiable event-risk rules',
          points: [
            'Reduce position size or stand aside 15 minutes before Tier-1 releases (CPI, NFP, FOMC).',
            'Never enter with a market order in the first 1–3 minutes after release — you are paying maximum spread and slippage.',
            'If holding a swing position through news, widen protective stops using a multiple of ATR rather than a fixed pip value.',
            'Journal every news-driven trade separately from your systematic setups — the sample statistics are not comparable.',
          ],
        },
      ],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Beginner track                                                      */
/* ------------------------------------------------------------------ */

const beginnerModules: Module[] = [
  {
    id: 'mod_b1',
    level: 'Beginner',
    order: 1,
    title: 'Module 1 — Chart Anatomy & Candle Psychology',
    focus: 'Reading raw price before touching a single indicator.',
    lessons: [
      {
        id: 'b1_1',
        title: 'Anatomy of a Candlestick',
        type: 'article',
        description: 'Body, wicks, and what each one tells you about the fight between buyers and sellers.',
        duration: '15m',
        content: [
          {
            type: 'paragraph',
            text: 'Every candle is a compressed record of a battle between buyers and sellers over a fixed period. The body shows where the fight ended; the wicks show how far one side was pushed before being rejected.',
          },
          {
            type: 'concept-box',
            title: 'The three things every candle tells you',
            points: [
              'Direction: which side controlled the close.',
              'Conviction: body-to-wick ratio — a long body with short wicks means one side dominated from open to close.',
              'Rejection: long wicks show a level where the opposing side stepped in with force.',
            ],
          },
          { type: 'chart-placeholder', caption: 'Embed: labelled diagram of open/high/low/close and wick anatomy.' },
        ],
      },
      {
        id: 'b1_2',
        title: 'Boring vs. Explosive Candles',
        type: 'article',
        description: 'Why the size and speed of a move matters more than its direction.',
        duration: '18m',
        content: [
          {
            type: 'paragraph',
            text: '"Boring" candles have small bodies relative to recent average range — they reflect indecision, low participation, or a market waiting for a catalyst. "Explosive" candles are large-bodied, high-volume moves that usually mark an institutional footprint: a large participant entering or exiting a position.',
          },
          {
            type: 'example',
            title: 'Reading the shift from boring to explosive',
            text: 'A tight, boring range on low volume followed by a sudden explosive candle that closes near its extreme often marks the true start of a directional move — the "boring" phase was accumulation, not indecision.',
          },
        ],
      },
      {
        id: 'b1_3',
        title: 'Why Math Beats Lagging Indicators',
        type: 'article',
        description: 'Indicators are derivatives of price — not the source of truth.',
        duration: '15m',
        content: [
          {
            type: 'paragraph',
            text: 'Indicators apply mathematical smoothing to past price. By the time a moving-average cross or an RSI reading appears, the price action that generated it has already happened. This is not a reason to never use indicators — it is a reason to treat them as confirmation, not entry triggers.',
          },
          {
            type: 'paragraph',
            text: 'In range-bound markets especially, lagging indicators are tuned for trending conditions and will generate frequent false signals (whipsaws). Structure and price extremes are the primary tool; indicators are a secondary filter.',
          },
        ],
      },
      {
        id: 'b1_4',
        title: 'Candlestick Reversal Patterns',
        type: 'article',
        description: 'Hammer, shooting star, engulfing, piercing, dark cloud cover and doji — with entry, stop and confirmation rules.',
        duration: '28m',
        content: [
          {
            type: 'paragraph',
            text: 'Candlestick patterns provide entry and stop-loss criteria, but — unlike classical chart patterns — they do not by themselves give you a price target. Every reversal candle needs a prior trend to reverse and a confirmation candle before it is tradeable; a hammer-shaped candle with no confirmation has no real significance.',
          },
          {
            type: 'diagram',
            pattern: 'hammer-candle',
            caption: 'Hammer: small body near the top of the range, a lower shadow at least twice the body, and little or no upper shadow.',
          },
          {
            type: 'concept-box',
            title: 'Hammer & Inverted Hammer (bullish reversal)',
            points: [
              'Hammer: appears after a down-trend; small body, lower shadow ≥ 2× the body, negligible upper shadow.',
              'Inverted Hammer: mirror image — small body, upper shadow ≥ 2× the body — also after a down-trend.',
              'Confirmation: price must move above the candle\u2019s high within the next 2–3 candles.',
              'Entry: buy on confirmation; stop-loss below the low of the candle.',
            ],
          },
          {
            type: 'concept-box',
            title: 'Shooting Star & Hanging Man (bearish reversal)',
            points: [
              'Shooting Star: appears after an up-trend; small body, upper shadow ≥ 2× the body.',
              'Hanging Man: same shape as a hammer but appears after an up-move — small body, long lower shadow.',
              'Confirmation: price must move below the candle\u2019s low within the next 2–3 candles.',
              'Entry: sell on confirmation; stop-loss above the high of the candle.',
            ],
          },
          {
            type: 'diagram',
            pattern: 'bullish-engulfing',
            caption: 'Bullish Engulfing: a red candle followed by a green candle whose body fully engulfs the first.',
          },
          {
            type: 'concept-box',
            title: 'Two-candle patterns: Engulfing, Piercing & Dark Cloud Cover',
            points: [
              'Bullish Engulfing: red candle → green candle that fully engulfs its body; buy on a break of the two-candle high, stop below the two-candle low.',
              'Bearish Engulfing: green candle → red candle that fully engulfs its body; sell on a break of the two-candle low, stop above the two-candle high. The larger the second candle, the more significant the signal.',
              'Piercing Pattern: bullish, but the second candle only closes above the midpoint of the first body rather than fully engulfing it.',
              'Dark Cloud Cover: bearish mirror of the Piercing Pattern — the second candle closes below the midpoint of the first body.',
            ],
          },
          {
            type: 'diagram',
            pattern: 'doji',
            caption: 'Doji: open and close are almost identical — pure indecision after a trending move.',
          },
          {
            type: 'paragraph',
            text: 'A Doji forms when the open and close of a candle sit at nearly the same price. On its own it is neutral, but appearing after a sustained trend it is a caution flag: the probability rises that the trend is losing control, though price may reverse, consolidate, or simply continue.',
          },
        ],
      },
    ],
  },
  {
    id: 'mod_b2',
    level: 'Beginner',
    order: 2,
    title: 'Module 2 — Classical Chart Patterns & Trade Construction',
    focus: 'Reversal and continuation patterns, target-price math, and how to actually trade a breakout.',
    lessons: [
      {
        id: 'b2_patterns_1',
        title: 'Reversal Patterns: Head & Shoulders, Double/Triple Tops & Bottoms',
        type: 'article',
        description: 'The most reliable geometric patterns that signal a trend is ending.',
        duration: '25m',
        content: [
          {
            type: 'paragraph',
            text: 'A reversal pattern requires an existing trend to reverse — the same shape appearing in a random walk means nothing. Reversal patterns are considered part of "distribution" when they form at the top of a move, and "accumulation" when they form at the bottom.',
          },
          {
            type: 'diagram',
            pattern: 'head-shoulders-top',
            caption: 'Head & Shoulders top: three peaks, the middle one highest. A break of the neckline confirms the pattern.',
          },
          {
            type: 'concept-box',
            title: 'Head & Shoulders (one of the lowest failure rates of any pattern)',
            points: [
              'Three consecutive peaks; the middle (the "head") is higher than the two "shoulders".',
              'The neckline connects the two troughs between the peaks.',
              'Entry: short on a confirmed close below the neckline; stop-loss above the nearest shoulder.',
              'Target: the vertical distance from the head to the neckline, projected down from the break.',
              'An Inverse Head & Shoulders is the mirror-image bullish version after a down-trend, traded the same way in reverse.',
            ],
          },
          {
            type: 'diagram',
            pattern: 'double-top',
            caption: 'Double Top: two peaks at roughly the same resistance level, confirmed on a break of the middle trough.',
          },
          {
            type: 'concept-box',
            title: 'Double & Triple Tops / Bottoms',
            points: [
              'Two (or three) peaks/troughs at roughly the same price, unable to break through — the market rejects the level repeatedly.',
              'Confirmation: a close through the support (top pattern) or resistance (bottom pattern) formed by the middle trough/peak.',
              'Target (Double Top): height from the peak to the middle trough, subtracted from the breakout price.',
              'Target (Double Bottom): height from the trough to the middle peak, added to the breakout price.',
              'Triple patterns work the same way but require three tests of the level and are somewhat less common than double patterns.',
            ],
          },
        ],
      },
      {
        id: 'b2_patterns_2',
        title: 'Continuation Patterns: Triangles, Flags, Wedges, Rectangles & Cup-and-Handle',
        type: 'article',
        description: 'When a consolidation is just a pause, not a reversal — with target-price formulas for each.',
        duration: '28m',
        content: [
          {
            type: 'diagram',
            pattern: 'ascending-triangle',
            caption: 'Ascending Triangle: flat resistance, rising support — a bullish continuation shape (though it can break either way).',
          },
          {
            type: 'concept-box',
            title: 'Triangles (symmetrical, ascending, descending)',
            points: [
              'Symmetrical: downward-sloping upper trendline + upward-sloping lower trendline; price must touch each bound at least twice.',
              'Ascending: flat upper resistance + rising lower support — breaks more often to the upside, but not always.',
              'Descending: flat lower support + falling upper resistance — breaks more often to the downside.',
              'Target price (all triangle types): height from the pattern\u2019s highest peak to its lowest trough, added to (upward breakout) or subtracted from (downward breakout) the breakout price.',
            ],
          },
          {
            type: 'diagram',
            pattern: 'bull-flag',
            caption: 'Flag / Pennant: a brief, parallel-channel pause after a sharp "pole" move, resolving back in the direction of the pole.',
          },
          {
            type: 'concept-box',
            title: 'Flags, Pennants & Wedges',
            points: [
              'Flags/Pennants: a sharp "pole" move followed by a short (roughly 1–4 week) sideways or slightly counter-sloping consolidation.',
              'Target: the height of the flag pole, projected from the breakout point of the flag.',
              'Wedges: two converging trendlines sloping in the same direction; price should touch a trendline at least five times before breaking.',
              'A rising wedge is generally bearish; a falling wedge is generally bullish — the opposite of what the slope alone would suggest.',
              'Rectangles: horizontal support and resistance bounding a trading range; target is the height of the rectangle projected from the breakout.',
            ],
          },
          {
            type: 'diagram',
            pattern: 'cup-handle',
            caption: 'Cup & Handle: a rounded "cup" consolidation followed by a small "handle" pullback before the continuation breakout.',
          },
          {
            type: 'concept-box',
            title: 'Cup & Handle',
            points: [
              'A rounded (not V-shaped) bottom, two roughly equal "lips", then a small handle that behaves like a mini flag.',
              'Confirmation: a break above both lips.',
              'Target: the height from the right lip to the bottom of the cup, added to the breakout price.',
            ],
          },
        ],
      },
      {
        id: 'b2_patterns_3',
        title: 'Trading the Breakout: Confirmation Filters, Stops & Retracements',
        type: 'article',
        description: 'A pattern is not a trade until it breaks out — and most breakouts need a filter.',
        duration: '20m',
        content: [
          {
            type: 'paragraph',
            text: 'A pattern is bounded by at least two trend lines and is not complete or tradeable until an actual breakout occurs. Human pattern-recognition bias runs both ways: traders see patterns that are not really there, and traders cling to an original price target after the conditions that produced it have changed.',
          },
          {
            type: 'concept-box',
            title: 'Confirmation filter types (pick one before you trade any pattern)',
            points: [
              'Intrabar: any touch beyond the level counts — fastest, most false signals.',
              'Multiple closes: require 2–3 consecutive closes beyond the level.',
              'Time filter: require the breakout to hold for a set number of bars.',
              'Percentage / point filter: require price to clear the level by a minimum distance.',
            ],
          },
          {
            type: 'concept-box',
            title: 'False breakouts, failed breakouts & retracements',
            points: [
              'False breakout: price breaks the level but almost immediately returns through it.',
              'Failed breakout ("trap"): a false breakout followed by a move in the opposite direction — often the more profitable trade if you had a stop-and-reverse order in place.',
              'Pullback: a retracement back toward the breakout level after a downward breakout.',
              'Throwback: the same retracement behaviour after an upward breakout.',
              'Retracements do not always occur — waiting for one can mean missing the trade entirely.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mod_b3',
    level: 'Beginner',
    order: 3,
    title: 'Module 3 — Market Structure Basics',
    focus: 'Trend vs. range, and the swing points that define both.',
    lessons: [
      {
        id: 'b2_1',
        title: 'Higher Highs, Higher Lows & Trend Definition',
        type: 'article',
        description: 'The objective, repeatable definition of an uptrend and a downtrend.',
        duration: '20m',
        content: [
          {
            type: 'concept-box',
            title: 'Structure in one page',
            points: [
              'Uptrend: a sequence of higher swing highs and higher swing lows.',
              'Downtrend: a sequence of lower swing highs and lower swing lows.',
              'Range: swing highs and lows repeatedly test roughly the same two levels.',
              'A "break of structure" is the first objective clue that a trend may be changing.',
            ],
          },
          { type: 'chart-placeholder', caption: 'Embed: annotated swing-point chart showing HH/HL vs LH/LL.' },
        ],
      },
      {
        id: 'b2_2',
        title: 'Introduction to Risk Management',
        type: 'article',
        description: 'Position sizing, stop placement, and why survival comes first.',
        duration: '20m',
        content: [
          {
            type: 'paragraph',
            text: 'No entry method survives a large enough position size against an untested account. Risk management is the only part of trading you fully control — it should be decided before you look for an entry, not after.',
          },
          {
            type: 'math',
            formula: 'Position Size = (Account Risk %) × (Account Balance) ÷ (Stop-Loss Distance)',
            explanation: 'A trader risking 1% of a $10,000 account with a 20-pip stop is solving for the lot size that makes a full stop-out equal to exactly $100 — not guessing a lot size and hoping the loss is tolerable.',
          },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Intermediate track                                                   */
/* ------------------------------------------------------------------ */

const intermediateModules: Module[] = [
  {
    id: 'mod_i1',
    level: 'Intermediate',
    order: 4,
    title: 'Module 4 — Institutional Demand & Supply',
    focus: 'Zone identification, freshness, strength, and curve analysis.',
    lessons: [
      {
        id: 'i1_1',
        title: 'Defining a Valid Supply or Demand Zone',
        type: 'article',
        description: 'Identifying the structural extremes that matter.',
        duration: '25m',
        content: [
          {
            type: 'paragraph',
            text: 'A valid supply or demand zone is created by an explosive departure in price, leaving behind an imbalance between buyers and sellers. Not every consolidation qualifies — the departure must be sharp enough to suggest a large participant left resting orders behind.',
          },
          {
            type: 'concept-box',
            title: 'The freshness grading system',
            points: [
              'Fresh (highest probability): the zone has never been retested since it formed.',
              'Mitigated (lower probability): price has tapped the zone once, consuming some resting liquidity.',
              'Consumed (avoid): price has tapped the zone twice or more — the probability of it holding drops sharply.',
            ],
          },
          {
            type: 'diagram',
            pattern: 'demand-zone-retest',
            caption: 'A fresh demand zone: price departs sharply, later returns to retest the same origin, then continues in the original direction.',
          },
        ],
      },
      {
        id: 'i1_2',
        title: 'Zone Strength & Curve Analysis',
        type: 'article',
        description: 'Reading the approach into a zone, not just the zone itself.',
        duration: '22m',
        content: [
          {
            type: 'paragraph',
            text: 'Strength is measured by the character of the move away from a zone — a fast, single-leg departure with minimal overlap between candles indicates strong, one-sided conviction. A slow, choppy departure suggests the zone is weaker than it looks.',
          },
          {
            type: 'example',
            title: 'Curve analysis in practice',
            text: 'A demand zone approached by a flat, decelerating curve (price grinding down in smaller and smaller candles) is statistically more likely to hold than one approached by a steep, accelerating drop into the level.',
          },
          { type: 'chart-placeholder', caption: 'Embed: side-by-side comparison of a strong vs. weak approach curve into a demand zone.' },
        ],
      },
      {
        id: 'i1_3',
        title: 'Liquidity Sweeps & Role Reversal',
        type: 'article',
        description: 'Why price often spikes through an obvious level before actually reversing.',
        duration: '22m',
        content: [
          {
            type: 'paragraph',
            text: 'Retail stop-losses and breakout orders cluster at obvious levels — the last swing high or low, a round number, an untested zone. A liquidity sweep is a deliberate (or simply mechanical, algorithm-driven) spike through that level to fill those resting orders before price reverses in the opposite direction.',
          },
          {
            type: 'diagram',
            pattern: 'liquidity-sweep',
            caption: 'Price wicks through resting liquidity below a level, then reverses sharply — the wick is the sweep, the reversal is the signal.',
          },
          {
            type: 'concept-box',
            title: 'Reading a sweep instead of being caught by it',
            points: [
              'A sweep is usually a single wick or a small cluster of candles piercing the level, not a sustained close beyond it.',
              'The faster and sharper the reversal back through the level, the more likely it was a genuine sweep rather than the start of a new trend.',
              'Avoid placing stops at the most obvious level — either tighten inside it with a smaller size, or give the stop enough room to survive a sweep.',
            ],
          },
          {
            type: 'diagram',
            pattern: 'support-break-retest',
            caption: 'Role reversal: once support is broken with conviction, the same level frequently acts as new resistance on the retest.',
          },
          {
            type: 'concept-box',
            title: 'Role reversal (support ↔ resistance)',
            points: [
              'Once a support or resistance line is broken by a significant amount, it tends to reverse its role — old support becomes new resistance and vice versa.',
              'A true role-reversal needs a strong, convicted move through the line, not a marginal poke through it.',
              'The retest of a broken level (from the opposite side) is often a lower-risk entry than chasing the original breakout.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mod_i3',
    level: 'Intermediate',
    order: 5,
    title: 'Module 5 — Classical Market Theory & Core Indicators',
    focus: 'Dow Theory, Elliott Wave, Fibonacci, Gann, pivot points, and the indicators built on top of price.',
    lessons: [
      {
        id: 'i3_1',
        title: 'Dow Theory: The Foundation of Modern Technical Analysis',
        type: 'article',
        description: 'Three trends, three market phases, and the tenets still used today.',
        duration: '22m',
        content: [
          {
            type: 'paragraph',
            text: 'Derived from Charles H. Dow\u2019s 255 Wall Street Journal editorials and still applied over a century later, Dow Theory holds that the market moves in three concurrent trends and that stock market averages must confirm each other before a move is trusted.',
          },
          {
            type: 'concept-box',
            title: 'The three trends and three phases',
            points: [
              'Primary (main) trend: the major move, lasting from under a year to several years.',
              'Secondary (medium swing): an intermediate reaction lasting 10 days to 3 months, typically retracing 33%–66% of the primary move.',
              'Minor trend: short-term noise from hours to a few weeks — largely irrelevant to the primary trend.',
              'Accumulation phase: informed participants buy quietly against prevailing sentiment; price barely moves.',
              'Public participation phase: trend-followers pile in; the fastest, most visible price change happens here.',
              'Distribution phase: early participants begin selling into rampant speculation from the crowd.',
            ],
          },
          {
            type: 'concept-box',
            title: 'Core tenets',
            points: [
              'The market discounts all known news almost immediately.',
              'Trends are confirmed by volume — a price move on low volume is suspect.',
              'A trend is assumed to remain in force until a definitive reversal signal appears; ordinary noise does not count.',
            ],
          },
        ],
      },
      {
        id: 'i3_2',
        title: 'Elliott Wave Theory',
        type: 'article',
        description: 'Five motive waves, three corrective waves, and the three rules that can never be broken.',
        duration: '25m',
        content: [
          {
            type: 'paragraph',
            text: 'Ralph Nelson Elliott proposed that collective crowd psychology moves between optimism and pessimism in a repeatable five-wave-then-three-wave sequence at every degree of trend, from multi-decade supercycles down to minute-by-minute moves.',
          },
          {
            type: 'concept-box',
            title: 'Wave structure',
            points: [
              'Waves 1, 3 and 5 are "motive" — they move with the larger trend, and each subdivides into five smaller waves.',
              'Waves 2 and 4 are "corrective" — they move against the trend, and each subdivides into three smaller waves.',
              'After the five-wave motive sequence, a three-wave A-B-C correction typically follows.',
            ],
          },
          {
            type: 'concept-box',
            title: 'The three rules that are never violated',
            points: [
              'Wave 2 never retraces more than 100% of wave 1.',
              'Wave 3 is never the shortest of waves 1, 3 and 5 — it is usually the longest.',
              'Wave 4 never overlaps the price territory of wave 1 (except in a rare diagonal triangle).',
            ],
          },
        ],
      },
      {
        id: 'i3_3',
        title: 'Fibonacci Retracements, Gann Angles & Pivot Points',
        type: 'article',
        description: 'Three classical tools for projecting support, resistance and price targets.',
        duration: '22m',
        content: [
          {
            type: 'concept-box',
            title: 'Fibonacci retracement levels',
            points: [
              'Derived from the Fibonacci sequence (0, 1, 1, 2, 3, 5, 8, 13, 21…): the four core retracement levels are 23.6%, 38.2%, 50.0% and 61.8% of the prior impulse move.',
              '0.0% marks the start of the retracement; 100.0% marks a complete reversal of the move.',
              'The 38.2% and 61.8% levels are considered the most statistically significant.',
            ],
          },
          {
            type: 'concept-box',
            title: 'Gann angles & the pivot-point formula',
            points: [
              'Gann\u2019s 1×1 (45°) angle is the most important; a market holding above a rising 1×1 angle is considered strong.',
              'When price breaks below an ascending Gann angle, it tends to drift to the next angle below it.',
              'Pivot points use the prior period\u2019s Open/High/Low/Close to project the next period\u2019s support/resistance.',
            ],
          },
          {
            type: 'math',
            formula: 'P = (H + L + C) ÷ 3   |   R1 = 2P − L   |   S1 = 2P − H   |   R2 = P + (H − L)   |   S2 = P − (H − L)',
            explanation: 'P is the pivot; R1/R2 project resistance above it and S1/S2 project support below it, all from the previous session\u2019s High (H), Low (L) and Close (C).',
          },
        ],
      },
      {
        id: 'i3_4',
        title: 'Core Technical Indicators: Moving Averages, RSI, MACD, Bollinger Bands & ADX',
        type: 'article',
        description: 'The formulas behind the five most widely used indicators — and how each is meant to be read.',
        duration: '30m',
        content: [
          {
            type: 'paragraph',
            text: 'An indicator is a mathematical derivative of price and/or volume. None of these predict the future on their own — each measures a different property (trend direction, momentum, volatility) and is strongest when used to confirm a setup you already identified from price structure.',
          },
          {
            type: 'math',
            formula: 'SMA(n) = (P\u2081 + P\u2082 + … + P\u2099) ÷ n',
            explanation: 'A Simple Moving Average smooths the last n closing prices into a single line. Shorter periods (5, 8, 13) hug price closely; longer periods (100, 200) smooth more and lag more. A bullish crossover occurs when a shorter SMA crosses above a longer one; a bearish crossover is the reverse.',
          },
          {
            type: 'math',
            formula: 'RSI = 100 − [100 ÷ (1 + RS)]   where RS = Average Gain ÷ Average Loss (over 14 periods by default)',
            explanation: 'The Relative Strength Index oscillates between 0–100. Readings above 70 are considered overbought and below 30 oversold; the 50 midpoint is often used to distinguish bullish from bearish momentum.',
          },
          {
            type: 'math',
            formula: 'MACD = EMA(12) − EMA(26)   |   Signal = EMA(9) of MACD',
            explanation: 'The Moving Average Convergence Divergence line crossing above zero signals positive momentum; crossing below signals negative momentum. A crossover of the MACD line and its 9-period signal line is read the same way as a moving-average crossover. Divergence between MACD and price (price makes a new extreme, MACD does not) warns that the trend is losing momentum.',
          },
          {
            type: 'math',
            formula: 'Upper Band = SMA(20) + (2 × StdDev)   |   Lower Band = SMA(20) − (2 × StdDev)',
            explanation: 'Bollinger Bands measure volatility around a 20-period moving average. Roughly 95% of price action falls between the two bands; the bands widen in volatile conditions and contract in quiet ones. Price pressing the upper band suggests an overbought condition, and the lower band an oversold one.',
          },
          {
            type: 'concept-box',
            title: 'ADX — measuring trend strength, not direction',
            points: [
              'ADX above 20–25 signals the market is trending (up or down); below that, it is more likely ranging.',
              '+DI crossing above −DI favours the upside; −DI crossing above +DI favours the downside.',
              'ADX says nothing about direction on its own — it must be paired with +DI/−DI or price structure.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mod_i2',
    level: 'Intermediate',
    order: 6,
    title: 'Module 6 — Multi-Timeframe Analysis & Risk Refinement',
    focus: 'Aligning higher-timeframe bias with lower-timeframe execution.',
    lessons: [
      {
        id: 'i2_1',
        title: 'Top-Down Multi-Timeframe Analysis',
        type: 'article',
        description: 'HTF bias, MTF structure, LTF execution.',
        duration: '20m',
        content: [
          {
            type: 'concept-box',
            title: 'A repeatable top-down workflow',
            points: [
              'HTF (Daily/H4): identify the dominant trend or range and the highest-probability zones.',
              'MTF (H1): confirm structure aligns with the HTF bias before looking for setups.',
              'LTF (M15/M5): time the precise entry once price reaches the zone of interest.',
            ],
          },
        ],
      },
      {
        id: 'i2_2',
        title: 'Volatility-Adjusted Stop Placement',
        type: 'article',
        description: 'Using ATR to size stops instead of fixed pip values.',
        duration: '18m',
        content: [
          {
            type: 'math',
            formula: 'Stop-Loss = Entry Price − (ATR × Multiplier)',
            explanation: 'A fixed 20-pip stop is arbitrary — it does not account for whether the market is currently calm or volatile. Sizing the stop as a multiple of ATR keeps the stop proportional to current conditions.',
          },
        ],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Advanced track                                                       */
/* ------------------------------------------------------------------ */

const advancedModules: Module[] = [
  {
    id: 'mod_a1',
    level: 'Advanced',
    order: 7,
    title: 'Module 7 — Systematic Rule-Books & Quantitative Probability',
    focus: 'Turning discretionary ideas into testable, rule-based systems.',
    lessons: [
      {
        id: 'a1_1',
        title: 'Writing a Systematic Rule-Book',
        type: 'article',
        description: 'Converting discretionary judgment into an unambiguous checklist.',
        duration: '25m',
        content: [
          {
            type: 'paragraph',
            text: 'A rule-book removes the question "was that a valid setup?" after the fact. Every condition — zone freshness, HTF bias, session, and risk — must be written as a binary yes/no check so the strategy can be backtested and audited honestly.',
          },
          {
            type: 'math',
            formula: 'Lot Size = (Account Balance ÷ 50) × 0.01',
            explanation: 'A simplified, broker-agnostic fractional-risk formula: it scales position size directly with account balance so risk stays proportional as the account grows or shrinks, without hardcoding a lot size that only made sense at one balance. Treat the "50" as a risk-aversion constant you tune per strategy — a smaller number increases position size (more aggressive), a larger number decreases it (more conservative). Always cross-check the result against the ATR-based stop-loss distance covered earlier, since position size and stop distance must be solved together, not independently.',
          },
        ],
      },
      {
        id: 'a1_2',
        title: 'Mathematical Expectancy',
        type: 'article',
        description: 'Why win rate alone tells you almost nothing.',
        duration: '20m',
        content: [
          {
            type: 'math',
            formula: 'Expectancy = (Win% × Avg Win) − (Loss% × Avg Loss)',
            explanation: 'A 55% win-rate model averaging a $200 win and a $150 loss has an expectancy of (0.55 × 200) − (0.45 × 150) = $42.50 per trade — a mathematically sound edge even without a high win rate.',
          },
          {
            type: 'concept-box',
            title: 'What expectancy actually tells you',
            points: [
              'Positive expectancy over a large sample size is the only statistically meaningful measure of edge.',
              'A high win rate with poor risk/reward can still be net-negative.',
              'Expectancy must be recalculated after every material rule change — it is not fixed forever.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'mod_a2',
    level: 'Advanced',
    order: 8,
    title: 'Module 8 — Quantitative MQL5 Automation',
    focus: 'Coding a systematic rule-book into an executable Expert Advisor.',
    lessons: [
      {
        id: 'a2_1',
        title: 'Session-Isolated Mean-Reversion Logic (MQL5)',
        type: 'article',
        description: 'Coding a range-bound scalper that trades only during a defined session.',
        duration: '40m',
        content: [
          {
            type: 'paragraph',
            text: 'This example isolates the New York session and executes purely on mathematical distance from a rolling mean — deliberately avoiding lagging visual indicators so the logic stays auditable.',
          },
          {
            type: 'code',
            language: 'MQL5',
            description: 'NY-session mean-reversion entry logic',
            code: `//+------------------------------------------------------------------+
//| XAU/USD Quant Scalper — Range-Bound Mean Reversion                |
//+------------------------------------------------------------------+
input double LotSize        = 0.1;
input int    RangePeriod    = 20;   // candles used to compute the mean
input double DeviationPips  = 30.0; // distance from mean required to trigger

bool IsNewYorkSession() {
    MqlDateTime t;
    TimeCurrent(t);
    return (t.hour >= 13 && t.hour < 22); // approx NY session, UTC
}

void OnTick() {
    if (!IsNewYorkSession()) return;
    if (PositionsTotal() > 0) return; // one position at a time

    double sum = 0;
    for (int i = 1; i <= RangePeriod; i++)
        sum += iClose(_Symbol, PERIOD_M15, i);
    double meanPrice = sum / RangePeriod;

    double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
    double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);

    if (meanPrice - ask >= DeviationPips * 0.1)
        trade.Buy(LotSize, _Symbol, ask, ask - 1.5, meanPrice);

    if (bid - meanPrice >= DeviationPips * 0.1)
        trade.Sell(LotSize, _Symbol, bid, bid + 1.5, meanPrice);
}`,
          },
          {
            type: 'concept-box',
            title: 'Before you deploy this on a live account',
            points: [
              'Backtest across multiple years and market regimes, not just recent trending or ranging conditions.',
              'Forward-test on a demo account through at least one full high-impact news cycle.',
              'Add explicit news-time filters — this example does not pause for CPI/NFP/FOMC by default.',
            ],
          },
        ],
      },
      {
        id: 'a2_2',
        title: 'Enforcing a Daily Trade Limit & Dynamic Lot Allocation (MQL5)',
        type: 'article',
        description: 'Hard account-protection rules every EA should have before it touches a live account.',
        duration: '30m',
        content: [
          {
            type: 'paragraph',
            text: 'Two of the most common ways a mechanically sound strategy still blows up an account are overtrading and static position sizing. This guard enforces a hard cap of 2 trades per calendar day and recalculates lot size from the live account balance on every trade, rather than trading a hardcoded lot value.',
          },
          {
            type: 'code',
            language: 'MQL5',
            description: 'Daily trade-count guard + balance-proportional dynamic lot sizing',
            code: `//+------------------------------------------------------------------+
//| Account-Protection Guard — Daily Limit + Dynamic Lot Allocation    |
//+------------------------------------------------------------------+
input int    MaxTradesPerDay = 2;     // hard daily cap
input double RiskDivisor     = 50.0;  // Lot Size = Balance / RiskDivisor * RiskFactor
input double RiskFactor      = 0.01;  // 0.01 = conservative; raise to increase size

datetime lastTradeDay = 0;
int      tradesToday  = 0;

// Reset the counter the moment the calendar day rolls over.
void RefreshDailyCounter() {
    MqlDateTime t;
    TimeCurrent(t);
    datetime today = StringToTime(StringFormat("%04d.%02d.%02d", t.year, t.mon, t.day));
    if (today != lastTradeDay) {
        lastTradeDay = today;
        tradesToday  = 0;
    }
}

bool DailyLimitReached() {
    RefreshDailyCounter();
    return (tradesToday >= MaxTradesPerDay);
}

// Balance-proportional lot size, normalized to the broker's allowed step and bounds.
double CalculateDynamicLot() {
    double balance  = AccountInfoDouble(ACCOUNT_BALANCE);
    double rawLot   = (balance / RiskDivisor) * RiskFactor;

    double minLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
    double maxLot  = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
    double lotStep = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);

    double lot = MathRound(rawLot / lotStep) * lotStep;
    return MathMax(minLot, MathMin(maxLot, lot));
}

// Call this immediately before any trade.Buy()/trade.Sell() in OnTick().
bool TryExecuteTrade(bool isBuy) {
    if (DailyLimitReached()) return false; // account-protection: stop for the day

    double lot = CalculateDynamicLot();
    double price = isBuy ? SymbolInfoDouble(_Symbol, SYMBOL_ASK) : SymbolInfoDouble(_Symbol, SYMBOL_BID);

    bool sent = isBuy ? trade.Buy(lot, _Symbol, price) : trade.Sell(lot, _Symbol, price);
    if (sent) tradesToday++;
    return sent;
}`,
          },
          {
            type: 'concept-box',
            title: 'Why both rules matter together',
            points: [
              'A daily trade cap prevents revenge-trading and overtrading from turning one bad session into an account-ending one.',
              'Dynamic lot sizing means the EA automatically de-risks after a losing streak (lower balance → smaller lot) and scales up only as equity actually grows.',
              'Neither rule replaces a stop-loss — they cap frequency and size, not the risk of any single trade.',
            ],
          },
        ],
      },
    ],
  },
];

export const academyModules: Module[] = [...beginnerModules, ...intermediateModules, ...advancedModules];

/* ------------------------------------------------------------------ */
/* "Check Your Level" diagnostic quiz                                   */
/* ------------------------------------------------------------------ */

export interface QuizQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    topic: 'Indicators',
    question: 'What is the main limitation of a lagging indicator such as a moving average?',
    options: [
      'It updates faster than raw price',
      'It applies smoothing to past price, so signals arrive after the move has started',
      'It cannot be plotted on a candlestick chart',
      'It only works on the Daily timeframe',
    ],
    correctIndex: 1,
  },
  {
    id: 'q2',
    topic: 'Candle Anatomy',
    question: 'A candle with a long lower wick and a small body near the top most likely shows:',
    options: [
      'Sellers were rejected after pushing price lower',
      'A period of no trading activity',
      'The market is closed',
      'A guaranteed trend reversal',
    ],
    correctIndex: 0,
  },
  {
    id: 'q3',
    topic: 'Market Structure',
    question: 'Which sequence of swing points defines an uptrend?',
    options: [
      'Lower highs and lower lows',
      'Higher highs and higher lows',
      'Equal highs and equal lows',
      'Random, unrelated swing points',
    ],
    correctIndex: 1,
  },
  {
    id: 'q4',
    topic: 'Demand & Supply',
    question: 'What most increases the probability that a demand zone holds?',
    options: [
      'It has already been retested three times',
      'It sits at a round psychological number only',
      'It formed from a sharp, explosive departure creating an imbalance',
      'It aligns with a 50-period moving average',
    ],
    correctIndex: 2,
  },
  {
    id: 'q5',
    topic: 'Multi-Timeframe Analysis',
    question: 'In a top-down workflow, what is the primary role of the higher timeframe (e.g. Daily/H4)?',
    options: [
      'To time the exact entry candle',
      'To set the overall bias and identify the zones worth watching',
      'It has no role — only the entry timeframe matters',
      'To calculate position size',
    ],
    correctIndex: 1,
  },
  {
    id: 'q6',
    topic: 'Risk Management',
    question: 'Why is sizing a stop-loss as a multiple of ATR usually preferred over a fixed pip value?',
    options: [
      'It guarantees a winning trade',
      'It keeps the stop proportional to current market volatility',
      'It removes the need for a stop-loss entirely',
      'Fixed pip stops are illegal on most brokers',
    ],
    correctIndex: 1,
  },
  {
    id: 'q7',
    topic: 'Macroeconomics',
    question: 'What typically happens to spreads and liquidity in the seconds around an NFP release?',
    options: [
      'Spreads tighten and liquidity increases',
      'Nothing changes — NFP only affects bonds',
      'Spreads widen and liquidity is pulled as algorithmic market-makers step back',
      'Trading is automatically halted on all brokers',
    ],
    correctIndex: 2,
  },
  {
    id: 'q8',
    topic: 'Systematic Rule-Books',
    question: 'What is the main purpose of writing a systematic, rule-based checklist for a strategy?',
    options: [
      'To make discretionary decisions sound more official',
      'To remove ambiguity so setups can be backtested and audited consistently',
      'To guarantee a higher win rate',
      'Rule-books are only useful for tax reporting',
    ],
    correctIndex: 1,
  },
  {
    id: 'q9',
    topic: 'Quantitative Probability',
    question: 'A strategy wins 55% of trades, averaging a $200 win and a $150 loss. What is its expectancy per trade?',
    options: [
      '$110.00',
      '$42.50',
      '-$42.50',
      'Cannot be calculated from this information',
    ],
    correctIndex: 1,
  },
  {
    id: 'q10',
    topic: 'MQL5 Algorithmic Execution',
    question: 'In an MQL5 Expert Advisor, which approach correctly restricts trading logic to a specific session?',
    options: [
      'Hardcoding a single calendar date range',
      'Checking TimeHour()/TimeMinute() (or MqlDateTime fields) inside OnTick() before executing',
      'Relying on the Strategy Tester\u2019s default settings alone',
      'Session filtering is not possible in MQL5',
    ],
    correctIndex: 1,
  },
];

export function levelFromScore(score: number): Exclude<ExperienceLevel, 'All'> {
  if (score <= 3) return 'Beginner';
  if (score <= 7) return 'Intermediate';
  return 'Advanced';
}
