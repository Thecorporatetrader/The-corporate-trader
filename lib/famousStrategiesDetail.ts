/**
 * Long-form educational detail for each entry in `famousStrategies` (lib/data.ts), keyed by slug.
 *
 * Editorial rules for this file:
 * - Educational, historical reference only. TCT does not teach, sell or recommend these systems.
 * - The two worked examples are ILLUSTRATIVE scenarios, not recorded trades, and carry no real prices.
 * - `sources` are plain-text titles only. Do not add URLs unless each one has been opened and checked.
 * - `classification` separates strategies with a documented, publishable rule set ('rulebook') from
 *   broad principles that were never published as one rigid system ('philosophy'). The page calls this out.
 */

export type StrategyClassification = 'rulebook' | 'philosophy';

export interface StrategyExample {
  title: string;
  scenario: string;
  entryNote: string;
  exitNote: string;
  stopNote: string;
  /** One line only. */
  lesson: string;
  /** Short labels drawn on the schematic chart (keep each under ~28 characters). */
  chart: { entryLabel: string; exitLabel: string; stopLabel: string; stopHonoured?: boolean };
}

export interface StrategyFaq {
  question: string;
  answer: string;
}

export interface StrategyDetail {
  classification: StrategyClassification;
  classificationNote: string;
  origin: string;
  corePrinciples: string[];
  howItWorks: string[];
  entryRules: string[];
  exitRules: string[];
  stopLossRules: string[];
  riskManagement: string[];
  successfulExample: StrategyExample;
  failedExample: StrategyExample;
  suitableConditions: string[];
  limitations: string[];
  commonMistakes: string[];
  practiceChecklist: string[];
  faqs: StrategyFaq[];
  /** Plain-text references only (no hyperlinks). */
  sources: string[];
}

export const famousStrategyDetails: Record<string, StrategyDetail> = {
  'turtle-trading': {
    classification: 'rulebook',
    classificationNote:
      'Rulebook: the Turtle entry, exit, sizing and stop rules were later published in detail, so the system can be described precisely and tested.',
    origin:
      "In the early 1980s, commodity trader Richard Dennis and his partner William Eckhardt disagreed about whether great traders are born or can be taught. Dennis recruited and trained a group of novices, nicknamed the Turtles, in 1983\u201384, gave them a written rule set and let them trade real capital. The rules were later made public by former participants, most notably Curtis Faith.",
    corePrinciples: [
      'Follow a written system and remove discretion from entries and exits.',
      'Trade breakouts of recent highs and lows, and let trends come to you.',
      'Size every position from market volatility so risk is comparable across markets.',
      'Accept many small losses in exchange for a few large trend winners.',
      'Diversify across many markets so that some trends are always in play.',
    ],
    howItWorks: [
      'The Turtles ran two breakout systems side by side. System 1 used a shorter 20-day channel and System 2 a longer 55-day channel. Both are close cousins of a Donchian channel: the highest high and lowest low over a lookback window.',
      "Position size came from \"N\", a measure of average daily volatility (a 20-day average of true range). One \"unit\" was sized so that a one-N move equalled roughly 1% of account equity, which made a unit in soybeans comparable in risk to a unit in gold or a currency.",
      'Winners could be added to in steps (pyramiding) as the trend extended, inside strict limits on units per market, per correlated group and per direction.',
    ],
    entryRules: [
      'System 1: go long on a break above the highest high of the previous 20 days (short on a break below the 20-day low).',
      "System 1 skip rule: ignore the signal if the previous System 1 breakout in that market would have been a winner. System 2's 55-day breakout then acts as the fail-safe entry.",
      'System 2: enter on any 55-day breakout in either direction, with no skip filter.',
      'Add one more unit each time price moves a further half N in your favour, up to four units in one market.',
      'Trade only liquid markets, spread across several sectors.',
    ],
    exitRules: [
      'System 1 exit: close a long position when price falls below the lowest low of the previous 10 days (for a short, when it rises above the 10-day high).',
      'System 2 exit: the same idea using a 20-day low (long) or 20-day high (short).',
      'Exit the whole position when the exit signal fires. Do not hold on hoping for a bounce.',
    ],
    stopLossRules: [
      'Place the initial protective stop 2N from the entry price, so one unit risks about 2% of equity at most.',
      'When units are added, the stop for the whole position moves so that it stays 2N from the most recent entry.',
      'A stop is honoured every time. The exit channel can end a trade earlier than the stop, but never later.',
    ],
    riskManagement: [
      'Risk is built into unit size: one unit is sized from N, and a 2N stop therefore risks roughly 2% of equity per unit.',
      'Original exposure limits: four units in one market, six in closely correlated markets, ten in loosely correlated markets and twelve in one direction.',
      'Expect long losing streaks and deep drawdowns. The edge only shows over many trades, so position size must let you survive the bad stretches.',
      'The original rules scaled down the notional account size used for sizing after a drawdown, to shrink risk while the system was losing.',
    ],
    successfulExample: {
      title: 'Illustrative winner: a sustained trend',
      scenario:
        'A liquid futures market has ranged for weeks, then breaks above its 55-day high and trends for months with only shallow pullbacks.',
      entryNote: 'Buy the 55-day breakout with one unit sized from N, then add units every half N as the trend extends (maximum four).',
      exitNote: 'Exit when price finally falls below the 20-day low, giving back part of the open profit.',
      stopNote: 'The stop trails 2N below the latest entry and is never touched.',
      lesson: 'One large trend can pay for a long string of small losses, but only if you take every signal.',
      chart: { entryLabel: 'Entry: 55-day high break', exitLabel: 'Exit: 20-day low break', stopLabel: 'Stop: 2N below entry' },
    },
    failedExample: {
      title: 'Illustrative loser: a false breakout',
      scenario: 'In a choppy, range-bound market price pokes through the 20-day high, then reverses almost immediately.',
      entryNote: 'Buy the 20-day breakout with a single unit.',
      exitNote: 'Stopped out when price falls 2N below entry, before the exit channel is reached.',
      stopNote: 'The 2N stop keeps the loss to roughly 2% of equity for that unit.',
      lesson: 'Small, planned losses are the cost of catching trends; the mistake is skipping the stop, not taking the loss.',
      chart: { entryLabel: 'Entry: 20-day high break', exitLabel: 'Exit: stopped at 2N', stopLabel: 'Stop: 2N below entry' },
    },
    suitableConditions: [
      'Markets that trend for weeks or months, such as commodities, currencies, interest rates and stock indices.',
      'Liquid instruments where breakouts can be traded without heavy slippage.',
      'A portfolio of many markets, so that at least a few trends appear each year.',
    ],
    limitations: [
      'Sideways markets produce whipsaws and long strings of small losses.',
      'A meaningful share of open profit is usually given back before the exit signal fires.',
      'The rules are public and widely known, so the original results should not be assumed to repeat.',
      'Volatility-based sizing across many markets needs adequate capital and market access.',
    ],
    commonMistakes: [
      'Skipping signals after a few losses, when the next trade may be the one that makes the year.',
      'Sizing by gut feel instead of from N.',
      'Removing or widening the stop once a trade goes against you.',
      'Ignoring correlation limits and stacking several bets on the same theme.',
      'Judging the system on a handful of trades.',
    ],
    practiceChecklist: [
      'Write the exact entry, exit and stop rules on one page before opening a chart.',
      'Calculate N and the unit size for one market on paper, and confirm that a 2N stop matches your risk limit.',
      'Log every breakout signal, including the ones the skip rule would filter out.',
      'Record correlation and total open risk each week.',
      'Review at least 30 signals before drawing any conclusion.',
    ],
    faqs: [
      {
        question: 'Are the Turtle rules public?',
        answer:
          'Yes. The rule set was released publicly in the early 2000s and is described in books by former participants. Because it is widely known, treat it as a teaching example rather than a guaranteed edge.',
      },
      {
        question: 'Can the system be applied to stocks or forex?',
        answer:
          'The original system was built for futures. Its ideas (breakouts, volatility sizing, fixed stops) are used elsewhere, but any adaptation needs its own testing.',
      },
      { question: 'What is N?', answer: 'A volatility measure: the average true range over about 20 days. It is used to size positions and to place stops.' },
      {
        question: 'Does TCT teach or sell this system?',
        answer: 'No. TCT lists it as historical, educational reference only and does not recommend trading it.',
      },
    ],
    sources: [
      'Curtis Faith \u2014 Way of the Turtle (2007)',
      'Curtis Faith \u2014 The Original Turtle Trading Rules (rule set published online by a former Turtle, early 2000s)',
      'Michael Covel \u2014 The Complete TurtleTrader (2007)',
    ],
  },

  'pivotal-points': {
    classification: 'philosophy',
    classificationNote:
      'Philosophy: Livermore left broad principles and market-reading habits rather than a rigid, published rulebook, so every rule below is an interpretation.',
    origin:
      "Jesse Livermore (1877\u20131940) was a US stock and commodity speculator whose career is described in Edwin Lef\u00e8vre's Reminiscences of a Stock Operator (1923) and in Livermore's own How to Trade in Stocks (1940). His approach centres on \"pivotal points\": price levels where a market's direction is confirmed. It also stresses adding to a position only when it is already working. Accounts of his life report large wins and large losses, including more than one bankruptcy, which is part of the lesson.",
    corePrinciples: [
      'Wait for the market to confirm an idea instead of predicting it.',
      'Trade with the line of least resistance: the direction in which price moves most easily.',
      'Add only to winning positions and never average down.',
      'Cut losses quickly. A small loss is information, not a failure.',
      'Patience: most of the work is waiting for the right moment.',
      'Look at leaders in an industry group for confirmation.',
    ],
    howItWorks: [
      "A pivotal point is a level, often a prior high or low or the edge of a long consolidation, where a decisive move through it suggests that the balance between buyers and sellers has changed. The idea is to commit a small amount only after price proves itself by moving through that level.",
      'If the market keeps confirming the idea, further positions are added at later confirmation points, so the largest position exists only when the trade is already profitable. If price fails to follow through, the small initial position is closed.',
      "Because this is a set of habits of judgement rather than a formula, two traders can apply \"pivotal points\" differently. That is why this page treats it as a philosophy.",
    ],
    entryRules: [
      'Identify a meaningful pivotal level in advance: an obvious prior high or low, or the boundary of a long consolidation.',
      'Enter only after price moves decisively through the level, ideally with expanding volume. Do not buy "cheap" below it.',
      'Start with a probe position that is a fraction of the intended size.',
      'Check whether leading stocks in the same group agree with the move.',
      'Add only at later confirmation points, and only while the first position is in profit.',
    ],
    exitRules: [
      'Exit when price action contradicts the reason for entry, for example a breakout that falls back through the pivotal level.',
      'Exit or reduce if a leader in the group breaks down while others stall.',
      'Consider taking profits into a climactic, one-sided run, and avoid turning a large winner into a loser.',
    ],
    stopLossRules: [
      'Decide the maximum loss before entering. Sources attribute a strict loss-cutting habit to Livermore, but exact figures vary, so set your own in advance.',
      'A close back through the pivotal level is a natural invalidation point.',
      'Never widen a stop and never average down on a losing position.',
    ],
    riskManagement: [
      'Risk only a small part of capital on the probe position; size up only after profit accumulates.',
      'Stay partly in cash when the market gives no clear signal instead of being fully invested all the time.',
      "Leverage magnified Livermore's gains and his ruin. Set size limits so that a bad streak cannot end your account.",
      'Decide in advance how realised profits will be protected from future risk-taking.',
    ],
    successfulExample: {
      title: 'Illustrative winner: confirmed breakout, then scaling in',
      scenario: 'After a long base, a market leader closes above an obvious prior high on rising volume, and peers in the same group follow.',
      entryNote: 'Probe with a small position after the pivotal-point break, then add tranches only as price clears later highs.',
      exitNote: 'Exit the remaining position when price falls back through the latest pivotal level or the leader weakens.',
      stopNote: 'The initial stop sits just below the original pivotal level.',
      lesson: 'Position size should be largest when the market has already proven you right.',
      chart: { entryLabel: 'Entry: probe above pivot', exitLabel: 'Exit: leader weakens', stopLabel: 'Stop: below the pivot' },
    },
    failedExample: {
      title: 'Illustrative loser: buying early and averaging down',
      scenario: 'A stock approaches a pivotal level, the trader buys early "for a better price", and price rejects the level.',
      entryNote: 'Buys before confirmation, then adds as price falls back.',
      exitNote: 'Finally sells far below the original level, after a much larger loss than planned.',
      stopNote: 'The planned stop was ignored.',
      lesson: 'Buying before confirmation and averaging down is the opposite of the pivotal-point idea.',
      chart: { entryLabel: 'Entry: early, unconfirmed', exitLabel: 'Exit: forced, deeper loss', stopLabel: 'Planned stop (ignored)', stopHonoured: false },
    },
    suitableConditions: [
      'Trending markets with clear leadership and visible volume.',
      'Markets that advance or decline in stages, with consolidations between moves.',
      'Liquid instruments where a decisive move through a level can actually be traded.',
    ],
    limitations: [
      'There is no published rulebook, so results depend heavily on judgement.',
      'Pivotal levels are subjective and easy to identify with hindsight.',
      'The material was written in the era of tape reading. Costs, speed and market structure have changed since.',
      'Livermore\'s own record shows that sound principles do not protect against over-leverage.',
    ],
    commonMistakes: [
      'Buying before the level is confirmed.',
      'Averaging down on a losing position.',
      'Treating every prior high as a pivotal point.',
      'Adding bigger tranches than the original position (an inverted pyramid).',
      'Ignoring the direction of the broader market.',
    ],
    practiceChecklist: [
      'Mark pivotal levels on a chart before the session and note why each one matters.',
      'Write the invalidation level and the maximum loss before entry.',
      'Enter a small probe only after the confirmation you defined.',
      'Write down what evidence would justify each add.',
      'Review afterwards: did any add happen while the trade was losing?',
    ],
    faqs: [
      {
        question: 'Is there an official Pivotal Points rulebook?',
        answer: "No. Livermore's own book presents a market-reading framework with worked examples, not a step-by-step rule set, and interpretations vary between authors.",
      },
      {
        question: 'Are these the same as pivot-point indicators?',
        answer:
          "No. Floor-trader pivot points are levels calculated from a prior session's high, low and close. Livermore's pivotal points are judgement-based turning or continuation points in price.",
      },
      {
        question: "Why is Livermore's story also a cautionary tale?",
        answer:
          'Accounts report that he made and lost several fortunes. Many readers take this as a reminder that a good market-reading method still needs strict risk limits.',
      },
    ],
    sources: [
      'Edwin Lef\u00e8vre \u2014 Reminiscences of a Stock Operator (1923)',
      'Jesse L. Livermore \u2014 How to Trade in Stocks (1940)',
      'Later biographies and commentary on Livermore (details of his trades and finances vary between accounts)',
    ],
  },

  'darvas-box-theory': {
    classification: 'rulebook',
    classificationNote:
      'Rulebook: Darvas described a specific, repeatable box-construction, entry and stop procedure in his own book, so it can be written down and tested.',
    origin:
      'Nicolas Darvas (1920\u20131977), a Hungarian-born professional dancer, described his method in How I Made $2,000,000 in the Stock Market (1960). He followed stocks while travelling, using price and volume, and developed a visual "box" framework to decide when a rising stock had resumed its advance. He also paid attention to which industries were strong.',
    corePrinciples: [
      'Focus on stocks making new highs on strong volume.',
      'Define a box: a tight range that price respects.',
      'Enter only when price breaks above the top of the box.',
      'Place the stop just under the box, and trail it under each new, higher box.',
      'Be selective, or step aside, when the overall market is weak.',
    ],
    howItWorks: [
      'Darvas looked at stocks trading at or near new highs on heavy volume. When one pulled back, he drew a box: the top is the high that price failed to exceed for several consecutive days, and the bottom is the low of the following pullback that also held for several days.',
      'A break above the top of the box marks the breakout. As the stock climbs it forms new, higher boxes, and the position is held as long as each new box holds.',
      'Volume and industry strength were supporting evidence, not stand-alone signals.',
    ],
    entryRules: [
      'Screen for stocks near new highs (commonly a 52-week high) with a surge in volume.',
      'Wait for a confirmed box: a top that holds for about three sessions, then a bottom that holds for about three sessions.',
      'Buy only when price breaks above the top of the box (Darvas used buy-stop orders just above it).',
      'Prefer stocks in strong industry groups and a healthy overall market.',
    ],
    exitRules: [
      'Sell when price falls below the bottom of the current box.',
      'As new, higher boxes form, the exit level rises with them.',
      'Step aside when the overall market turns decisively weak. Darvas describes doing this in his own account.',
    ],
    stopLossRules: [
      'Place the initial stop just below the bottom of the box at the time of purchase.',
      'Raise the stop to just below the bottom of each newly formed box, and never lower it.',
      'Enter the stop with the broker when you buy, rather than deciding later.',
    ],
    riskManagement: [
      'Trade risk is the distance between the entry and the box-bottom stop. Size the position so that this distance equals your fixed risk limit.',
      'Narrow boxes give tight, cheap stops. If a box is so wide that the stop does not fit your risk limit, skip the trade.',
      'Limit the number of simultaneous positions and avoid concentrating in one industry.',
      'Expect false breakouts. Several small stopped-out trades are normal.',
    ],
    successfulExample: {
      title: 'Illustrative winner: rising boxes in an advancing stock',
      scenario: 'A stock on strong volume forms a tight box, breaks out, and then forms a second, higher box.',
      entryNote: 'Buy the break above the first box top, with the stop just under the box bottom.',
      exitNote: 'The stop trails up under each new box. The position is exited when price drops below the latest box bottom.',
      stopNote: 'Initial stop sits just under the first box bottom and is raised with each new box.',
      lesson: 'Trailing under each new box lets a winner run while the risk stays defined.',
      chart: { entryLabel: 'Entry: break above box top', exitLabel: 'Exit: below latest box', stopLabel: 'Stop: just under box' },
    },
    failedExample: {
      title: 'Illustrative loser: breakout fails in a weak market',
      scenario: 'Price breaks above a box top, but the overall market turns down and price falls straight back through the box.',
      entryNote: 'Buy the breakout above the box top.',
      exitNote: 'Stopped out just below the bottom of the box.',
      stopNote: 'The stop was placed at the time of purchase, so the loss is the planned one.',
      lesson: 'Defined risk turns a failed breakout into a small, planned loss.',
      chart: { entryLabel: 'Entry: break above box top', exitLabel: 'Exit: stopped below box', stopLabel: 'Stop: just under box' },
    },
    suitableConditions: [
      'Rising markets with clear leadership and strong volume.',
      'Stocks in strong, trending industry groups.',
      'Liquid stocks where a stop order fills close to its level.',
    ],
    limitations: [
      'The approach is built for buying stocks in rising markets. The original method was not designed for shorting.',
      'Boxes are somewhat subjective: different traders can draw different boxes.',
      'A gap down can jump past a stop, so the realised loss can exceed the plan.',
      'A breakout that is obvious to everyone can also fail more often.',
    ],
    commonMistakes: [
      'Drawing boxes after the fact to fit a chart.',
      'Buying before the top of the box is exceeded.',
      'Moving the stop down to avoid being stopped out.',
      'Ignoring volume and the direction of the overall market.',
      'Chasing entries when the box is very wide.',
    ],
    practiceChecklist: [
      'Mark boxes on historical charts using written construction rules (how many sessions the top and bottom must hold).',
      'Compare breakout-day volume with the recent average.',
      'Compute the stop distance and position size before entry.',
      'Record every false breakout as well as the winners.',
      'Confirm the overall market trend before acting.',
    ],
    faqs: [
      {
        question: 'How many days confirm a box?',
        answer:
          "It is commonly summarised as about three sessions for the top and again for the bottom, but sources present the details differently. Read Darvas's own account and write your own version before testing it.",
      },
      {
        question: 'Does it work for forex or indices?',
        answer: 'The original method was for stocks. A box is a consolidation-breakout idea that could be tested elsewhere, but that would be your own adaptation.',
      },
      {
        question: 'Is a Darvas box just a support and resistance zone?',
        answer: 'It is related but more rigid: the top and bottom are defined by highs and lows that held for a set number of sessions.',
      },
    ],
    sources: [
      'Nicolas Darvas \u2014 How I Made $2,000,000 in the Stock Market (1960)',
      'Nicolas Darvas \u2014 Wall Street: The Other Las Vegas (1964)',
    ],
  },

  'can-slim': {
    classification: 'rulebook',
    classificationNote:
      'Rulebook: CAN SLIM is a published seven-part checklist with defined buy and sell rules, so it can be applied and tested step by step.',
    origin:
      "William J. O'Neil, founder of Investor's Business Daily, set out CAN SLIM in How to Make Money in Stocks (first published in 1988). The method grew out of his study of the common traits of large past stock winners, and it combines company earnings with price and volume behaviour.",
    corePrinciples: [
      'Buy leaders, not laggards.',
      'Combine fundamentals (earnings) with technicals (price and volume).',
      'Buy proper chart-pattern breakouts, not stocks that have already run.',
      'Cut losses while they are small.',
      'Buy only when the overall market is in a healthy uptrend.',
    ],
    howItWorks: [
      'CAN SLIM is a seven-part checklist: C, current quarterly earnings growth. A, annual earnings growth. N, something new (a product, management change or a new price high). S, supply and demand (share float and volume). L, leader rather than laggard, judged by relative strength. I, institutional sponsorship. M, market direction.',
      'A stock that passes the screen is then watched for a proper chart base (a common one is the "cup with handle") and bought only as it breaks out of that base.',
      'Market direction comes first in practice: even a checklist-perfect stock is usually a poor buy when the general market is in a correction.',
    ],
    entryRules: [
      'Confirm that the general market is in a confirmed uptrend (M).',
      'Screen for strong current quarterly earnings growth and multi-year annual growth (C, A). Commonly cited thresholds are around 20\u201325% or higher, and they are guidelines rather than laws.',
      'Look for a catalyst or new high (N) and a leader with high relative price strength (L).',
      'Check supply and demand and institutional interest (S, I).',
      'Buy the breakout from a sound base on clearly above-average volume (often cited as 40\u201350% higher), close to the pivot point and not extended well above it.',
    ],
    exitRules: [
      'Sell immediately if the stock reaches the maximum-loss level (see stop-loss rules).',
      'Take profits in the commonly cited 20\u201325% area on ordinary breakouts. Hold longer only for exceptional fast starters.',
      'Sell into climactic price runs on very heavy volume, or when a leader breaks a key moving average on heavy volume.',
      'Reduce or exit when the overall market shifts into a correction.',
    ],
    stopLossRules: [
      "Cut the loss when price falls 7\u20138% below your purchase price. This is the rule O'Neil is best known for.",
      'Never average down, and do not renegotiate the stop after entry.',
      'In very volatile stocks or markets, use smaller position size rather than a wider stop.',
    ],
    riskManagement: [
      'With a fixed stop percentage, position size = your risk limit \u00f7 stop percentage. A tighter stop allows a larger position for the same risk.',
      'Hold a limited number of leaders rather than many names, and avoid heavy concentration in one industry.',
      'Reduce exposure when the market direction turns.',
      'Keep a written record of the reason for every buy and sell.',
    ],
    successfulExample: {
      title: 'Illustrative winner: a leader breaking out of a base',
      scenario: 'A strong-earnings leader forms a multi-week base while the market is in a confirmed uptrend, then breaks out on heavy volume.',
      entryNote: 'Buy at the breakout, within a few percent of the pivot point.',
      exitNote: 'Sell into strength in the commonly cited profit-taking zone, or when the stock breaks a key moving average on heavy volume.',
      stopNote: 'The stop sits 7\u20138% below the purchase price and is never touched.',
      lesson: 'Aligning earnings, chart base and market direction puts the odds on your side but does not remove the stop.',
      chart: { entryLabel: 'Entry: base breakout', exitLabel: 'Exit: sell into strength', stopLabel: 'Stop: 7\u20138% below entry' },
    },
    failedExample: {
      title: 'Illustrative loser: buying just before a market correction',
      scenario: 'A good-looking breakout occurs, but the overall market rolls over into a correction a few days later.',
      entryNote: 'Buy the base breakout.',
      exitNote: 'Stopped out when the loss reaches 7\u20138%.',
      stopNote: 'The stop caps the loss at the planned percentage.',
      lesson: 'Even a checklist-perfect stock fails when the market turns; the 7\u20138% rule keeps the loss small.',
      chart: { entryLabel: 'Entry: base breakout', exitLabel: 'Exit: stopped at ~8% loss', stopLabel: 'Stop: 7\u20138% below entry' },
    },
    suitableConditions: [
      'Confirmed market uptrends, especially early in a new advance.',
      'Periods when several strong-earnings leaders are forming bases.',
      'Liquid growth stocks with reliable quarterly reporting.',
    ],
    limitations: [
      'It is a long-only stock method with little to say in sustained bear markets except to stay small or in cash.',
      'It relies on earnings data and relative-strength ratings that may come from paid or delayed sources.',
      'Thresholds are quoted differently across editions and sources, so do not treat any single number as a fixed law.',
      'It is tilted towards growth stocks, which can struggle when markets rotate away from growth.',
      'The criteria were built on US stock history, so applying them to other markets, such as Indian stocks, needs adaptation and testing.',
    ],
    commonMistakes: [
      'Buying extended stocks well past the buy point.',
      'Ignoring the market-direction step.',
      'Averaging down on a loser.',
      'Screening on earnings alone and skipping the chart base.',
      'Holding through the stop "because the fundamentals are good".',
    ],
    practiceChecklist: [
      'Write down the seven CAN SLIM answers for a candidate before looking at its price.',
      'Identify the base type and its pivot point.',
      'Confirm volume on the breakout day.',
      'Compute the stop from your maximum loss and work out position size from it.',
      'Log the market status (uptrend or correction) next to every entry.',
    ],
    faqs: [
      {
        question: 'Do I need paid tools to use CAN SLIM?',
        answer: "O'Neil's own materials rely on Investor's Business Daily data and ratings. You can approximate the screens with public financial data, but results may differ.",
      },
      {
        question: 'Does CAN SLIM work outside the US?',
        answer:
          'It was built from US stock history. The ideas (earnings growth, leadership, base breakouts, loss-cutting) can be tested on other markets, but the thresholds may need adapting. Test before trusting.',
      },
      {
        question: 'Is the 7\u20138% stop fixed?',
        answer: 'It is the rule most associated with O\'Neil, and exact thresholds are guidelines. What matters is having a written maximum loss and sticking to it.',
      },
    ],
    sources: [
      "William J. O'Neil \u2014 How to Make Money in Stocks (first published 1988; several later editions)",
      "Investor's Business Daily educational material from William O'Neil + Co.",
    ],
  },

  'systematic-trend-following': {
    classification: 'philosophy',
    classificationNote:
      "Philosophy: Seykota is known for principles (follow the trend, cut losses, manage your own psychology), not for one published rule set, so this page describes the general trend-following approach, not a copy of his system.",
    origin:
      "Ed Seykota, an MIT-trained engineer, was among the earliest traders to build computerised trend-following systems, beginning in the 1970s. He is profiled in Jack Schwager's Market Wizards (1989) and is also known for his writing on trading psychology. His name is attached to the general idea of systematic trend following: define rules in advance, trade many markets, cut losses and let profits run.",
    corePrinciples: [
      'Follow trends and do not try to predict tops or bottoms.',
      'Cut losses and let profits run.',
      'Manage risk on every position.',
      'Diversify across many markets.',
      'Master your own psychology, because most failures are behavioural.',
      'Use tested rules instead of moment-to-moment opinion.',
    ],
    howItWorks: [
      'A trend-following system is a set of rules that identifies an established trend (for example a moving-average signal or a breakout of a range), takes a position in its direction, and stays in until an opposing signal or a trailing stop ends the trade.',
      'Because trends are rare and losses are frequent, trend followers trade many markets and accept a low win rate. A small number of large winners drives the results.',
      'Seykota-style thinking adds an emphasis on the trader: taking losses without hesitation, sizing risk sensibly and recognising how fear and hope distort decisions.',
    ],
    entryRules: [
      'Define the trend signal in writing, for example a breakout of a chosen lookback high or low, or a moving-average crossover. The specific choice is yours to test.',
      'Trade only in the direction of the signal, long or short.',
      'Decide position size from risk, not from conviction.',
      'Take every signal your rules generate and do not cherry-pick.',
      'Spread risk across several unrelated markets.',
    ],
    exitRules: [
      'Exit on an opposite signal or on a trailing exit level defined in advance.',
      'Let profitable trades run without a fixed profit target.',
      'Exit immediately when the stop is hit, without waiting for a bounce.',
    ],
    stopLossRules: [
      "Set the initial stop at entry, at a distance that reflects the market's normal volatility.",
      'Trail the stop with the trend using a fixed rule, for example a volatility multiple or an N-period low.',
      'Cut losses without exception. The stop defines the maximum risk and is never loosened.',
    ],
    riskManagement: [
      'Risk a small, fixed fraction of equity per trade. Many trend followers are often described as using roughly 1\u20132% or less per idea.',
      'Cap total open risk and correlated exposure.',
      'Reduce size during drawdowns and increase it only as equity grows.',
      'Expect long, uncomfortable drawdowns and flat periods. Decide in advance at what drawdown you will review the system, and do not simply abandon it.',
    ],
    successfulExample: {
      title: 'Illustrative winner: a long trend with a trailing exit',
      scenario: 'A market breaks out of a long range and trends for months, and the trader holds through shallow pullbacks.',
      entryNote: 'Enter on a break of the chosen lookback high, with risk-based position size.',
      exitNote: 'The trailing exit is hit after the trend matures, giving back part of the gain.',
      stopNote: 'The initial stop is a volatility-based distance and is trailed upward.',
      lesson: 'Cutting losses fast is what makes it possible to hold winners through the noise.',
      chart: { entryLabel: 'Entry: trend signal fires', exitLabel: 'Exit: trailing stop hit', stopLabel: 'Stop: volatility-based' },
    },
    failedExample: {
      title: 'Illustrative loser: a whipsaw in a sideways market',
      scenario: 'The signal fires in a choppy market, price reverses and the position is stopped. The sequence may repeat several times.',
      entryNote: 'Enter on the trend signal.',
      exitNote: 'Stopped out with a small, pre-defined loss.',
      stopNote: 'The volatility-based stop limits each attempt to a small fraction of equity.',
      lesson: 'A string of small losses is the price of admission; skipping signals afterwards destroys the edge.',
      chart: { entryLabel: 'Entry: trend signal fires', exitLabel: 'Exit: stopped out', stopLabel: 'Stop: volatility-based' },
    },
    suitableConditions: [
      'Markets that produce sustained directional moves.',
      'A broad basket of markets such as interest rates, currencies, commodities and indices.',
      'Traders who can accept drawdowns and hold positions for weeks or months.',
    ],
    limitations: [
      'Whipsaws and low win rates test discipline.',
      'Large open profits are often partly given back before the exit signal fires.',
      'No single "Seykota system" is published, so you must build and test your own parameters.',
      'Performance can be poor for long stretches when markets are range-bound.',
      'Diversifying across many markets needs capital and access.',
    ],
    commonMistakes: [
      'Overriding signals after a few losses.',
      'Over-optimising parameters on past data.',
      'Trading too few markets.',
      'Risking so much per trade that a normal losing streak becomes unbearable.',
      'Taking profits early because a gain feels fragile.',
    ],
    practiceChecklist: [
      'Write the signal, exit and sizing rules on one page.',
      "Test them on data you did not use to design the rules, and record the worst drawdown.",
      'Paper trade, or trade a very small size, for at least three months.',
      "Journal each trade's emotions against the rules you followed.",
      'Track the percentage of signals actually taken.',
    ],
    faqs: [
      {
        question: 'Is there a Seykota system I can copy?',
        answer:
          'Not as a single published rulebook. His principles and interviews are public, but the specifics of his systems are not. Treat this page as a general trend-following guide.',
      },
      {
        question: 'What win rate should I expect?',
        answer: 'Often below 50%. Trend followers rely on the size of winners relative to losers, not on the frequency of wins. Your own tested rules define your expectations.',
      },
      {
        question: 'Is trend following the same as momentum investing?',
        answer:
          "They are related but different. Trend following times entries and exits on a single market's own trend, usually with stops, while momentum investing typically ranks assets against each other.",
      },
    ],
    sources: [
      'Jack Schwager \u2014 Market Wizards (1989), interview with Ed Seykota',
      'Michael Covel \u2014 Trend Following (first published 2004)',
      "Ed Seykota's own published essays on trading and psychology (personal website)",
    ],
  },

  'risk-first-macro': {
    classification: 'philosophy',
    classificationNote:
      'Philosophy: Paul Tudor Jones has shared principles on defence, asymmetric risk and long-term trend in interviews, but no complete, published rulebook exists.',
    origin:
      "Paul Tudor Jones founded Tudor Investment Corporation in 1980 and is one of the best-known global macro traders. He has been widely reported to have profited around the 1987 stock market crash. Most of what is public about his approach comes from interviews, notably in Jack Schwager's Market Wizards (1989) and later books, so it is a collection of principles rather than a system.",
    corePrinciples: [
      'Play defence first: think about what can go wrong before what can go right.',
      'Look for asymmetric trades where the potential reward is a multiple of the risk. He has been quoted as seeking roughly five-to-one payoffs.',
      'Respect the long-term trend. The 200-day moving average is often cited as his reference.',
      'Cut losses quickly and never average down on a losing position.',
      'Size positions so that one mistake cannot do serious damage.',
      'Stay flexible and change your mind when the market disagrees.',
    ],
    howItWorks: [
      'As described publicly, the approach starts with a market view, often a macro theme across currencies, interest rates, commodities and stock indices, but the view is only the start. Before any trade the question is: where am I wrong, and how much do I lose if I am?',
      'Positions are sized so that the worst case is small relative to capital and the potential gain is a multiple of the risk. The long-term trend is used as a reference for whether the market is in favour of the trade.',
      'When the market moves against a position, exposure is cut quickly. When it confirms, size may be increased. Because macro views can be wrong for a long time, survival takes priority over being right.',
    ],
    entryRules: [
      'State the thesis, and the evidence that would prove it wrong, before entering.',
      'Look for setups where the reward is a clear multiple of the risk. Commonly quoted targets range from three-to-one to five-to-one.',
      'Prefer entries that agree with the prevailing long-term trend, such as price on the favourable side of its 200-day average.',
      'Enter in stages, so that the first position is small relative to the full intended size.',
    ],
    exitRules: [
      'Exit when the thesis is invalidated, not merely when it is uncomfortable.',
      'Cut exposure quickly when price closes on the wrong side of the long-term trend reference or hits the stop.',
      'Reduce or exit when the remaining reward-to-risk has shrunk because much of the move has been captured.',
      'After losses, reduce size rather than trade to get even.',
    ],
    stopLossRules: [
      'Define the loss limit before entry, as a price level or a maximum percentage of capital.',
      'Never average down on a losing position.',
      'A break of a long-term moving average is often used as a warning to reduce risk.',
      'Never move a stop further away.',
    ],
    riskManagement: [
      'Risk a small percentage of capital per idea, and count correlated macro bets as one larger bet.',
      "Review every position's worst-case loss regularly and manage total portfolio risk.",
      'Keep the ability to survive a run of wrong calls, and avoid leverage that could force liquidation.',
      'After losses, cut size first and analyse afterwards.',
    ],
    successfulExample: {
      title: 'Illustrative winner: an asymmetric trade with the trend',
      scenario: 'A currency pair trades above its long-term average as a macro theme builds, and the risk is small relative to the potential move.',
      entryNote: 'Take a small initial position with a defined stop below the long-term average, and add as the theme confirms.',
      exitNote: 'Exit or reduce when the thesis weakens or price closes back under the long-term average.',
      stopNote: 'The stop was defined before entry, below the recent swing.',
      lesson: 'Small, defined risk with a large potential payoff lets a few right calls outweigh several wrong ones.',
      chart: { entryLabel: 'Entry: with long-term trend', exitLabel: 'Exit: trend reference lost', stopLabel: 'Stop: set before entry' },
    },
    failedExample: {
      title: 'Illustrative loser: a strong view the market rejects',
      scenario: 'A trader is convinced of a macro reversal and enters against the prevailing trend, but the market keeps going.',
      entryNote: 'Enter early, against the long-term trend.',
      exitNote: 'The stop is hit and exposure is cut quickly.',
      stopNote: 'The stop was defined before entry, so the loss stays small enough to try again.',
      lesson: 'Being early is indistinguishable from being wrong, and defence keeps that mistake affordable.',
      chart: { entryLabel: 'Entry: against the trend', exitLabel: 'Exit: stop hit, cut fast', stopLabel: 'Stop: set before entry' },
    },
    suitableConditions: [
      'Liquid global markets (currencies, rates, indices, commodities) where macro themes can develop.',
      'Periods with clear macro catalysts such as policy shifts or inflation and growth surprises.',
      'Traders able to size small and hold a diversified set of ideas.',
    ],
    limitations: [
      'It depends heavily on judgement, and there is no complete rulebook.',
      'Macro views can be early for a long time.',
      'What is known about how Tudor Jones actually trades comes from interviews and reports, so the retail version is an interpretation.',
      'Institutional resources (information, execution, leverage) are not available to most individual traders.',
      'The 200-day average is a simple guide and gives late signals.',
    ],
    commonMistakes: [
      'Reading the philosophy as a promise of results.',
      'Averaging down on a "great value" idea.',
      'Ignoring the correlation between macro positions.',
      'Using excessive leverage.',
      'Moving stops because the view still feels right.',
    ],
    practiceChecklist: [
      'Write the thesis and the invalidation level before any entry.',
      'Compute reward-to-risk before entering and skip trades that fall short of your threshold.',
      'Note where price sits relative to its 200-day average for each trade.',
      'Add up total risk across correlated trades.',
      'Hold a weekly review: which losses were cut on plan?',
    ],
    faqs: [
      {
        question: 'What does "risk-first" mean?',
        answer: 'Deciding how much you can lose, and where you are wrong, before thinking about how much you could make.',
      },
      {
        question: 'Do I need the 200-day moving average?',
        answer:
          'It is a commonly cited reference from his interviews. It is a simple trend filter, not a guarantee, and you can test alternatives.',
      },
      {
        question: 'Is this only for macro traders?',
        answer: 'It is a risk-management stance applied to macro trading, but the risk-first ideas can be applied to any trading style.',
      },
    ],
    sources: [
      'Jack Schwager \u2014 Market Wizards (1989), interview with Paul Tudor Jones',
      'Tony Robbins \u2014 Money: Master the Game (2014), chapter featuring an interview with Paul Tudor Jones',
      'Public interviews and profiles of Paul Tudor Jones (details vary between sources)',
    ],
  },
};

export function getStrategyDetail(slug: string): StrategyDetail | undefined {
  return Object.prototype.hasOwnProperty.call(famousStrategyDetails, slug) ? famousStrategyDetails[slug] : undefined;
}
