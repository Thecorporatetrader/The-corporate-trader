import type { Metadata } from 'next';
import MarketTicker from '@/components/MarketTicker';
import OptionsMatrix from '@/components/OptionsMatrix';

/**
 * Replace app/post/page.tsx only. No extra packages, database migrations or keys.
 * Server-side public FRED CSV downloads; data is never fabricated.
 * Includes real-time Delta Exchange Crypto Options Analytics & Market Structure Matrix.
 * The URL remains /post so existing links keep working.
 */
export const metadata: Metadata = {
  title: 'Market Watch — The Corporate Trader',
  description: 'Explore US economic releases, growth, inflation, employment, options market structure and the economic calendar.',
};
export const dynamic = 'force-dynamic';

type Point = { date: string; value: number };
type Metric = {
  id: string;
  name: string;
  group: 'growth' | 'inflation' | 'labour';
  unit: string;
  frequency: 'Monthly' | 'Quarterly' | 'Weekly';
  mode: 'level' | 'yoy' | 'change';
  source: string;
  explanation: string;
  watch: string;
};
type Reading = { metric: Metric; points: Point[]; checked: string | null };

const metrics: Metric[] = [
  { id: 'A191RL1Q225SBEA', name: 'Real GDP growth', group: 'growth', unit: '% annualised', frequency: 'Quarterly', mode: 'level', source: 'US Bureau of Economic Analysis',
    explanation: 'Inflation-adjusted output growth from the preceding quarter, expressed at an annual rate. It is not year-on-year growth. Advance, second and third estimates can differ.',
    watch: 'Read consumption, investment, inventories and trade together. An inventory-driven increase does not mean household demand strengthened.' },
  { id: 'INDPRO', name: 'Industrial production', group: 'growth', unit: '% YoY', frequency: 'Monthly', mode: 'yoy', source: 'Board of Governors of the Federal Reserve System',
    explanation: 'Output of manufacturing, mining and utilities. The annual change is calculated from the seasonally adjusted index.',
    watch: 'Look for a sustained change across several months. Weather-related utility output can distort a single reading.' },
  { id: 'CPIAUCSL', name: 'Headline CPI', group: 'inflation', unit: '% YoY', frequency: 'Monthly', mode: 'yoy', source: 'US Bureau of Labor Statistics',
    explanation: 'Consumer-price inflation including food and energy. This dashboard calculates the annual change from the seasonally adjusted index, which can differ from the commonly reported unadjusted annual rate.',
    watch: 'Separate broad price pressure from energy shocks and base effects. A lower inflation rate still means prices are rising when the rate remains positive.' },
  { id: 'CPILFESL', name: 'Core CPI', group: 'inflation', unit: '% YoY', frequency: 'Monthly', mode: 'yoy', source: 'US Bureau of Labor Statistics',
    explanation: 'Consumer prices excluding food and energy. Annual change calculated from the seasonally adjusted index; this is not a month-on-month reading.',
    watch: 'Shelter and services can keep core inflation persistent. Compare the direction with headline CPI rather than treating one release as a trading signal.' },
  { id: 'PCEPI', name: 'Headline PCE', group: 'inflation', unit: '% YoY', frequency: 'Monthly', mode: 'yoy', source: 'US Bureau of Economic Analysis',
    explanation: 'The personal consumption expenditures price index covers a broad mix of consumer spending. Annual change is calculated from its seasonally adjusted index.',
    watch: 'PCE and CPI use different coverage and weights. They are useful together, but their levels should not be treated as interchangeable.' },
  { id: 'PCEPILFE', name: 'Core PCE', group: 'inflation', unit: '% YoY', frequency: 'Monthly', mode: 'yoy', source: 'US Bureau of Economic Analysis',
    explanation: 'PCE prices excluding food and energy, shown as annual inflation. It helps assess underlying price pressure, but is not itself a policy decision.',
    watch: 'Assess persistence alongside employment and growth. Softer inflation does not guarantee a rate cut or a particular market reaction.' },
  { id: 'PAYEMS', name: 'Nonfarm payroll change', group: 'labour', unit: 'thousand jobs', frequency: 'Monthly', mode: 'change', source: 'US Bureau of Labor Statistics',
    explanation: 'The change in total nonfarm payroll employment from the previous month, calculated from seasonally adjusted employment levels. These are jobs, not a count of unique employed people.',
    watch: 'Review revisions and the broader trend. Payrolls and unemployment come from different surveys and can move in different directions.' },
  { id: 'UNRATE', name: 'Unemployment rate', group: 'labour', unit: '%', frequency: 'Monthly', mode: 'level', source: 'US Bureau of Labor Statistics',
    explanation: 'Unemployed people as a share of the civilian labour force, seasonally adjusted. It excludes people outside the labour force.',
    watch: 'Read alongside participation and payrolls. A falling unemployment rate can reflect either hiring or people leaving the labour force.' },
  { id: 'CIVPART', name: 'Labour participation', group: 'labour', unit: '%', frequency: 'Monthly', mode: 'level', source: 'US Bureau of Labor Statistics',
    explanation: 'The civilian labour force as a share of the civilian noninstitutional population aged 16 and over, seasonally adjusted.',
    watch: 'Participation provides context for unemployment. Demographics and changes in willingness or ability to work can influence it.' },
  { id: 'ICSA', name: 'Initial jobless claims', group: 'labour', unit: 'claims', frequency: 'Weekly', mode: 'level', source: 'US Employment and Training Administration',
    explanation: 'New claims for unemployment insurance, seasonally adjusted. The observation date identifies the week ending, not the release timestamp.',
    watch: 'Weekly figures can be volatile around holidays and disruptions. Several weeks of movement are more informative than one isolated change.' },
];

const sections = [
  ['options-matrix', '01', 'Options Matrix'],
  ['us-data', '02', 'US Economic Data'],
  ['growth', '03', 'GDP & Growth'],
  ['inflation', '04', 'Inflation Dashboard'],
  ['labour', '05', 'Labour Market'],
  ['calendar', '06', 'Economic Calendar'],
] as const;

function parseCSV(csv: string, series: string): Point[] {
  const lines = csv.trim().split(/\r?\n/);
  const header = (lines.shift() || '').replace(/^\uFEFF/, '').split(',').map(s => s.trim().replace(/^"|"$/g, ''));
  if (!['observation_date', 'DATE'].includes(header[0]) || header[1] !== series) return [];
  const map = new Map<string, number>();
  for (const line of lines) {
    const [rawDate, rawValue] = line.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
    if (!rawDate || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate) || !rawValue || rawValue === '.') continue;
    const value = Number(rawValue);
    if (Number.isFinite(value)) map.set(rawDate, value);
  }
  return [...map].map(([date, value]) => ({ date, value })).sort((a, b) => a.date.localeCompare(b.date));
}

function calculate(points: Point[], mode: Metric['mode']): Point[] {
  if (mode === 'level') return points;
  const lookup = new Map(points.map(p => [p.date.slice(0, 7), p.value]));
  return points.flatMap(point => {
    const year = Number(point.date.slice(0, 4));
    const month = Number(point.date.slice(5, 7));
    const prior = mode === 'yoy'
      ? String(year - 1) + point.date.slice(4, 7)
      : (month === 1 ? String(year - 1) + '-12' : String(year) + '-' + String(month - 1).padStart(2, '0'));
    const value = lookup.get(prior);
