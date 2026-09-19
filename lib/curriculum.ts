export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All';

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'example'; title: string; text: string }
  | { type: 'math'; formula: string; explanation: string }
  | { type: 'code'; language: string; code: string; description: string }
  | { type: 'concept-box'; title: string; points: string[] }
  | { type: 'chart-placeholder'; caption: string }
  | { type: 'cheat-sheet'; title: string; rows: { label: string; value: string }[] };

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
    ],
  },
  {
    id: 'mod_b2',
    level: 'Beginner',
    order: 2,
    title: 'Module 2 — Market Structure Basics',
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
    order: 3,
    title: 'Module 3 — Institutional Demand & Supply',
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
    ],
  },
  {
    id: 'mod_i2',
    level: 'Intermediate',
    order: 4,
    title: 'Module 4 — Multi-Timeframe Analysis & Risk Refinement',
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
    order: 5,
    title: 'Module 5 — Systematic Rule-Books & Quantitative Probability',
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
    order: 6,
    title: 'Module 6 — Quantitative MQL5 Automation',
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
