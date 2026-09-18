import type { LucideIcon } from 'lucide-react';
import { Bot, GraduationCap, Settings2, Smartphone } from 'lucide-react';

export interface Product {
  icon: LucideIcon;
  title: string;
  text: string;
  href: string;
  tag: string;
}

export const products: Product[] = [
  {
    icon: Bot,
    title: 'TCT Algo',
    text: 'Our own MT5 Expert Advisor — get your first TCT MT5 algo free, automating take profit, stop loss, trailing stops and risk-to-reward settings, so you spend less time managing trades manually.',
    href: '/algo',
    tag: 'MT5 EA',
  },
  {
    icon: Settings2,
    title: 'Custom Algo Development',
    text: 'Bring your own entry logic and risk rules — we develop custom trading algos for forex and Indian markets, tailored to your strategy.',
    href: '/algo#custom',
    tag: 'BUILT FOR YOU',
  },
  {
    icon: Smartphone,
    title: 'TCT Trading Journal',
    text: 'Add your trades and let AI automatically rate them — gain insights into your trading decisions, spot patterns, and build better habits with TCT Trading Journal.',
    href: '/journal',
    tag: 'ANDROID',
  },
  {
    icon: GraduationCap,
    title: 'Free Structured Trading Education',
    text: 'Learn step by step with free, mentor-style guidance — understand the markets, manage risk, and build a disciplined trading process.',
    href: '/library',
    tag: 'LEARN',
  },
];

export interface ArticleSummary {
  title: string;
  category: string;
  description: string;
}

/** Latest 3 shown on the homepage. */
export const articles: ArticleSummary[] = [
  {
    title: 'Understanding Liquidity Sweeps',
    category: 'Liquidity',
    description:
      'How price can trade through a liquidity area before displacement and confirmation.',
  },
  {
    title: 'Risk-to-Reward Is Not Enough',
    category: 'Risk Management',
    description:
      'Why position sizing and execution discipline matter alongside planned R:R.',
  },
  {
    title: 'Building a Repeatable Trade Journal',
    category: 'Trading Journal',
    description:
      'What to record before and after a trade so your review produces useful feedback.',
  },
];

/** Extra entries shown only on the full /articles listing. */
export const moreArticles: ArticleSummary[] = [
  {
    title: 'Execution Discipline: Planned vs Actual',
    category: 'Psychology',
    description:
      'A framework for reviewing whether your execution matched the trade you planned.',
  },
  {
    title: 'What an MT5 EA Actually Does',
    category: 'Algo Trading',
    description:
      'A practical introduction to Expert Advisors, automation and operational controls.',
  },
  {
    title: 'Building a Trading Review Routine',
    category: 'Trading',
    description: 'Turn individual trades into structured feedback.',
  },
];

export interface FamousStrategy {
  name: string;
  trader: string;
  era: string;
  summary: string;
  principle: string;
}

/**
 * Publicly documented strategies associated with well-known traders.
 * Educational reference only — TCT does not teach, sell or reproduce these systems,
 * and inclusion here is not a recommendation to trade them.
 */
export const famousStrategies: FamousStrategy[] = [
  {
    name: 'Turtle Trading',
    trader: 'Richard Dennis & William Eckhardt',
    era: '1980s',
    summary:
      'A rules-based breakout experiment: enter on new highs or lows over a fixed lookback window, size positions from market volatility, and exit on an opposing breakout.',
    principle: 'Mechanical rules over discretion',
  },
  {
    name: 'Pivotal Points',
    trader: 'Jesse Livermore',
    era: '1900s–1930s',
    summary:
      'Waiting for price to confirm a decisive turning point before committing, then adding to a position only while the market keeps proving the idea correct.',
    principle: 'Let the market confirm first',
  },
  {
    name: 'Box Theory',
    trader: 'Nicolas Darvas',
    era: '1950s',
    summary:
      'Tracking stocks as they consolidate inside price "boxes", buying breakouts above the box on rising volume and placing stops just beneath it.',
    principle: 'Defined risk at every entry',
  },
  {
    name: 'CAN SLIM',
    trader: "William J. O'Neil",
    era: '1980s',
    summary:
      'A checklist approach combining earnings growth, relative strength, supply and demand, and overall market direction before a position is considered.',
    principle: 'Screen before you trade',
  },
  {
    name: 'Systematic Trend Following',
    trader: 'Ed Seykota',
    era: '1970s onward',
    summary:
      'Computerised trend systems traded across many markets, with strict loss cutting and a strong emphasis on the trader\u2019s own psychology and discipline.',
    principle: 'Cut losses, ride trends',
  },
  {
    name: 'Risk-First Macro',
    trader: 'Paul Tudor Jones',
    era: '1980s onward',
    summary:
      'Macro positioning where defence comes first: asymmetric risk-to-reward, respect for long-term moving averages, and cutting exposure quickly when wrong.',
    principle: 'Defence before offence',
  },
];

export interface LibraryCategory {
  title: string;
  description: string;
}

export const libraryCategories: LibraryCategory[] = [
  { title: 'Trading & Markets', description: 'Curated public/legal learning resources' },
  {
    title: 'Technical Analysis',
    description: 'Foundational charting and market-structure material',
  },
  {
    title: 'Risk Management',
    description: 'Position sizing, drawdown and trading-risk resources',
  },
  {
    title: 'Trading Psychology',
    description: 'Decision-making, discipline and behavioral resources',
  },
  { title: 'Market History', description: 'Historical market education and archives' },
  { title: 'Economics', description: 'Macro and economic learning material' },
];
