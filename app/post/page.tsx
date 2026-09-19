import type { Metadata } from 'next';
import MarketTicker from '@/components/MarketTicker';

/**
 * Replace app/post/page.tsx only. No extra packages, database migrations or keys.
 * Server-side public FRED CSV downloads; data is never fabricated.
 * The URL remains /post so existing links keep working.
 * To rename the shared navigation, separately change its Post label to Market Watch.
 */
export const metadata: Metadata = {
  title: 'Market Watch — The Corporate Trader',
  description: 'Explore US economic releases, growth, inflation, employment and the economic calendar.',
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
  ['us-data', '01', 'US Economic Data'],
  ['growth', '02', 'GDP & Growth'],
  ['inflation', '03', 'Inflation Dashboard'],
  ['labour', '04', 'Labour Market'],
  ['calendar', '05', 'Economic Calendar'],
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
    if (value === undefined || (mode === 'yoy' && value === 0)) return [];
    return [{ date: point.date, value: mode === 'yoy' ? (point.value / value - 1) * 100 : point.value - value }];
  });
}

async function readMetric(metric: Metric): Promise<Reading> {
  const start = String(new Date().getUTCFullYear() - 4) + '-01-01';
  const url = 'https://fred.stlouisfed.org/graph/fredgraph.csv?' +
    new URLSearchParams({ id: metric.id, cosd: start }).toString();
  try {
    // No API keys, no browser CORS dependency, no stored copies of provider data.
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
      headers: { Accept: 'text/csv,text/plain;q=0.9' },
    });
    if (!response.ok) throw new Error('Source unavailable');
    const csv = await response.text();
    if (csv.length > 500000) throw new Error('Unexpected response size');
    const points = calculate(parseCSV(csv, metric.id), metric.mode).slice(-24);
    return { metric, points, checked: points.length ? new Date().toISOString() : null };
  } catch {
    return { metric, points: [], checked: null };
  }
}

function period(date: string, frequency: Metric['frequency']) {
  if (frequency === 'Quarterly') return 'Q' + Math.ceil(Number(date.slice(5, 7)) / 3) + ' ' + date.slice(0, 4);
  return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric', ...(frequency === 'Weekly' ? { day: 'numeric' as const } : {}), timeZone: 'UTC' })
    .format(new Date(date + 'T00:00:00Z'));
}
function number(value: number, metric: Metric) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: metric.unit.includes('%') ? 2 : 0 }).format(value);
}
function isOld(reading: Reading) {
  const latest = reading.points[reading.points.length - 1];
  if (!latest) return false;
  const days = (Date.now() - Date.parse(latest.date + 'T00:00:00Z')) / 86400000;
  return days > (reading.metric.frequency === 'Quarterly' ? 220 : reading.metric.frequency === 'Weekly' ? 28 : 100);
}

function Sparkline({ points }: { points: Point[] }) {
  if (points.length < 2) return <p className="mw-muted">History unavailable</p>;
  const values = points.slice(-12).map(p => p.value);
  const min = Math.min(...values), max = Math.max(...values);
  const coordinates = values.map((value, i) => (i * 300 / (values.length - 1)).toFixed(1) + ',' + (max === min ? 40 : 72 - (value - min) / (max - min) * 62).toFixed(1)).join(' ');
  return <svg className="mw-spark" viewBox="0 0 300 84" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 78 H300" stroke="#223b48" fill="none" />
    <polyline points={coordinates} fill="none" stroke="#00dfd4" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
  </svg>;
}

function Indicator({ reading }: { reading: Reading }) {
  const { metric, points } = reading;
  const latest = points[points.length - 1];
  const previous = points[points.length - 2];
  const change = latest && previous ? latest.value - previous.value : null;
  return <article className="mw-card" id={'indicator-' + metric.id}>
    <div className="mw-card-top"><span>{metric.frequency}</span><span>{metric.mode === 'yoy' ? 'Annual change' : metric.mode === 'change' ? 'Monthly change' : 'Published series'}</span></div>
    <h3>{metric.name}</h3>
    <div className="mw-value">{latest ? number(latest.value, metric) : 'Unavailable'} <small>{latest ? metric.unit : ''}</small></div>
    <p className="mw-meta">{latest ? 'Observation: ' + period(latest.date, metric.frequency) : 'The source did not return a valid reading.'}</p>
    {isOld(reading) && <p className="mw-warning">Older observation — check the source before relying on it.</p>}
    <Sparkline points={points} />
    <p className="mw-meta">{change === null ? 'No prior-period comparison available.' : (change > 0 ? '↑ ' : change < 0 ? '↓ ' : '→ ') + number(Math.abs(change), metric) + (metric.unit.includes('%') ? ' percentage points' : ' ' + metric.unit) + ' versus prior period.'}</p>
    <details className="mw-detail"><summary>Understand this indicator & view history</summary>
      <p>{metric.explanation}</p><p><strong>What to watch:</strong> {metric.watch}</p>
      <p className="mw-meta">Source: {metric.source}, via FRED. Previous readings reflect the current revised series, not necessarily the first release.</p>
      {points.length > 0 && <div className="mw-table-scroll" tabIndex={0} role="region" aria-label={metric.name + ' history'}>
        <table><caption>Latest 12 observations · {metric.unit}</caption><thead><tr><th scope="col">Period</th><th scope="col">Value</th></tr></thead><tbody>
          {points.slice(-12).reverse().map(p => <tr key={p.date}><th scope="row">{period(p.date, metric.frequency)}</th><td>{number(p.value, metric)}</td></tr>)}
        </tbody></table>
      </div>}
      <a className="mw-source" href={'https://fred.stlouisfed.org/series/' + metric.id} target="_blank" rel="noopener noreferrer">View source & release notes ↗</a>
    </details>
  </article>;
}

const calendarHTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;background:#0b1420;color:#eaf4ff;font:13px Arial,sans-serif}a{color:#65e4eb}.tradingview-widget-container{width:100%;height:680px}.tradingview-widget-copyright{padding:12px;text-align:center}</style></head><body>
<div class="tradingview-widget-container"><div class="tradingview-widget-container__widget"></div>
<div class="tradingview-widget-copyright"><a href="https://www.tradingview.com/economic-calendar/" target="_blank" rel="noopener noreferrer">Economic calendar by TradingView</a></div>
<script src="https://s3.tradingview.com/external-embedding/embed-widget-events.js" async>{"colorTheme":"dark","isTransparent":false,"width":"100%","height":"640","locale":"en","importanceFilter":"0,1","countryFilter":"us"}</script></div></body></html>`;

export default async function MarketWatchPage() {
  const readings = await Promise.all(metrics.map(readMetric));
  const available = readings.filter(r => r.points.length > 0).length;
  const checked = readings.find(r => r.checked)?.checked;
  const overview = ['A191RL1Q225SBEA', 'CPIAUCSL', 'UNRATE', 'PAYEMS'].map(id => readings.find(r => r.metric.id === id)!);
  return <>
    <MarketTicker />
    <main className="tct-mw">
    <style>{styles}</style>
    <div className="mw-shell">
      <header className="mw-hero">
        <div><p className="mw-kicker">THE CORPORATE TRADER / MACRO INTELLIGENCE</p>
          <h1>Market <span>Watch.</span></h1>
          <p className="mw-lead">Understand the economy behind the chart. Explore growth, inflation and employment before you form a market view.</p>
        </div>
        <div className="mw-status"><span className="mw-dot" /> LATEST PUBLISHED DATA
          <p>{available} of {metrics.length} indicators available</p>
          <small>{checked ? 'Retrieved ' + new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' }).format(new Date(checked)) + ' IST' : 'Sources temporarily unavailable'}</small>
        </div>
      </header>
      <nav className="mw-tabs" aria-label="Market Watch sections"><a href="#macro">Overview</a>{sections.map(([id, , title]) => <a key={id} href={'#' + id}>{title}</a>)}</nav>
      <section id="macro" className="mw-section">
        <div className="mw-heading"><div><p className="mw-kicker">THE BIG PICTURE</p><h2>Macro Dashboard</h2></div><span className="mw-badge">US ECONOMY</span></div>
        <div className="mw-overview">{overview.map(({ metric, points }) => {
          const latest = points[points.length - 1];
          return <a key={metric.id} href={'#indicator-' + metric.id} className="mw-stat"><span>{metric.name}</span><strong>{latest ? number(latest.value, metric) : '—'} <small>{latest ? metric.unit : 'Unavailable'}</small></strong><p>{latest ? period(latest.date, metric.frequency) : 'Check source availability'}</p><span className="mw-stat-link">Explore indicator ↗</span></a>;
        })}</div>
        <div className="mw-notice">Economic releases are periodic, not a live price feed. Each figure has its own observation date. Refresh this page to request updated data. Older or missing readings are flagged; no simulated values are used.</div>
        {available < metrics.length && <div className="mw-warning" role="status">Some sources could not be reached. Their explanations and source links remain available. Try refreshing later; unavailable does not mean zero.</div>}
      </section>
      <section id="us-data" className="mw-section">
        <div className="mw-heading"><div><p className="mw-kicker">01 / RELEASE MONITOR</p><h2>US Economic Data</h2></div><a className="mw-source" href="#calendar">See economic calendar ↓</a></div>
        <p className="mw-intro">Compare the latest available reading with its previous period. Select an indicator for its definition and history.</p>
        <div className="mw-table-scroll mw-panel" tabIndex={0} role="region" aria-label="US economic indicators">
          <table><caption>Latest observations, not a release-time forecast comparison</caption><thead><tr><th scope="col">Indicator</th><th scope="col">Latest</th><th scope="col">Previous period</th><th scope="col">Observation</th><th scope="col">Frequency</th></tr></thead><tbody>{readings.map(({ metric, points }) => {
            const last = points[points.length - 1], prior = points[points.length - 2];
            return <tr key={metric.id}><th scope="row"><a href={'#indicator-' + metric.id}>{metric.name} ↗</a><small>{metric.unit}</small></th><td>{last ? number(last.value, metric) : 'Unavailable'}</td><td>{prior ? number(prior.value, metric) : '—'}</td><td>{last ? period(last.date, metric.frequency) : '—'}</td><td>{metric.frequency}</td></tr>;
          })}</tbody></table>
        </div>
        <p className="mw-meta">Consensus forecasts and surprise scores are not supplied by these series. The calendar may show forecasts where its provider has coverage. Directional price reactions are never guaranteed.</p>
      </section>
      {(['growth', 'inflation', 'labour'] as const).map((group, i) => <section id={group} className="mw-section" key={group}>
        <div className="mw-heading"><div><p className="mw-kicker">0{i + 2} / {group === 'growth' ? 'ECONOMIC MOMENTUM' : group === 'inflation' ? 'PRICE PRESSURE' : 'JOBS & PARTICIPATION'}</p><h2>{group === 'growth' ? 'GDP & Growth' : group === 'inflation' ? 'Inflation Dashboard' : 'Labour Market'}</h2></div></div>
        <p className="mw-intro">{group === 'growth' ? 'Is activity expanding or slowing? Read real output alongside industrial activity.' : group === 'inflation' ? 'Distinguish headline price shocks from underlying inflation. Annual rates here are calculated from seasonally adjusted index levels.' : 'Connect hiring, unemployment, participation and new benefit claims to understand labour-market conditions.'}</p>
        <div className="mw-grid">{readings.filter(r => r.metric.group === group).map(reading => <Indicator key={reading.metric.id} reading={reading} />)}</div>
      </section>)}
      <section id="calendar" className="mw-section">
        <div className="mw-heading"><div><p className="mw-kicker">05 / PLAN AHEAD</p><h2>Economic Calendar</h2></div><span className="mw-badge">THIRD-PARTY WIDGET</span></div>
        <p className="mw-intro">Upcoming US releases, importance and available actual / forecast / previous readings. Check the timezone displayed inside the calendar before planning around an event.</p>
        <details className="mw-calendar mw-panel">
          <summary>Open economic calendar <span>Loads TradingView content</span></summary>
          <p className="mw-meta">This third-party embed contacts TradingView and follows its privacy terms. Provider branding and source links are retained.</p>
          <iframe title="US economic calendar provided by TradingView" srcDoc={calendarHTML} loading="lazy" sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" />
        </details>
        <p className="mw-meta">Calendar blank or blocked? <a className="mw-source" href="https://www.tradingview.com/economic-calendar/" target="_blank" rel="noopener noreferrer">Open the provider calendar ↗</a>. Verify important events against the official release schedules:</p>
        <div className="mw-links"><a href="https://www.bls.gov/schedule/" target="_blank" rel="noopener noreferrer">BLS schedule ↗</a><a href="https://www.bea.gov/news/schedule" target="_blank" rel="noopener noreferrer">BEA schedule ↗</a><a href="https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm" target="_blank" rel="noopener noreferrer">Federal Reserve meetings ↗</a></div>
      </section>
      <aside className="mw-method mw-panel">
        <h2>Read the data. Respect the uncertainty.</h2>
        <p>This dashboard is educational context, not investment advice, a signal service or a promise of market direction. Higher or lower readings can affect USD, equities, gold and bonds differently depending on expectations, revisions and policy.</p>
        <details className="mw-detail"><summary>Sources & calculation methods</summary>
          <p>Observations are retrieved server-side from public FRED CSV exports. Original agencies are credited on every indicator. This website is not endorsed by those agencies or the Federal Reserve Bank of St. Louis.</p>
          <p>Annual inflation / production change = (current index ÷ index for the same month one year earlier − 1) × 100. Payroll change = current month's employment minus the preceding month's employment, in thousands. GDP is the published quarter-on-quarter annualised growth series. Differences between percentage readings are percentage points.</p>
          <p>History uses the latest revised data, not vintage observations. Observation periods are not publication dates. A source may lag its originating agency. Charts show up to 12 observations, each with its own vertical scale; they are not directly comparable. All figures can be revised.</p>
          <a className="mw-source" href="https://fred.stlouisfed.org/legal/" target="_blank" rel="noopener noreferrer">FRED source terms ↗</a>
        </details>
      </aside>
    </div>
    </main>
  </>;
}

const styles = `
.tct-mw{color:#edf7ff;background:radial-gradient(ellipse at 85% 0,rgba(0,220,211,.09),transparent 28%),#070e16;padding:0 0 60px}
.tct-mw *{box-sizing:border-box}.mw-shell{width:min(1280px,92%);margin:auto}.tct-mw .mw-hero{display:flex;align-items:center;justify-content:space-between;gap:32px;padding:54px 0 30px}.tct-mw .mw-kicker{font-size:11px;letter-spacing:.17em;font-weight:800;color:#36e1e8;margin:0 0 12px}.tct-mw h1{font-size:clamp(38px,5.5vw,68px);font-weight:700;line-height:1.07;letter-spacing:-.04em;margin:0 0 18px}.tct-mw h1 span{color:#00d8e9}.tct-mw p{line-height:1.7}.mw-lead{color:#9fb5c7;max-width:660px;font-size:17px;margin:0}.mw-status{border:1px solid #22404b;background:#0b1b25;border-radius:14px;padding:20px;min-width:245px;font-size:10px;letter-spacing:.08em;color:#8aeadd}.mw-status p{font-size:14px;color:#e6f5ff;letter-spacing:0;margin:10px 0 4px}.mw-status small{font-size:11px;color:#a5bdcd;letter-spacing:0}.mw-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#48dec1;margin-right:6px}.mw-tabs{display:flex;gap:8px;overflow-x:auto;padding:12px 0 20px;border-bottom:1px solid #1c303d}.mw-tabs a{font-size:13px;white-space:nowrap;padding:11px 16px;border:1px solid #28404d;border-radius:8px;color:#c5d7e3;background:#0c1822}.mw-tabs a:hover{border-color:#1ed8d0;color:#51e5e1}.tct-mw a:focus-visible,.tct-mw summary:focus-visible,.tct-mw [tabindex]:focus-visible{outline:2px solid #66fff0;outline-offset:4px}.tct-mw .mw-section{padding:34px 0 8px;scroll-margin-top:170px}.tct-mw [id^="indicator-"]{scroll-margin-top:170px}.mw-heading{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:18px}.tct-mw h2{font-size:clamp(23px,3vw,30px);font-weight:650;line-height:1.25;margin:0}.mw-badge{font-size:10px;letter-spacing:.08em;color:#a1c9d6;border:1px solid #284451;border-radius:6px;padding:7px 10px;white-space:nowrap}.mw-overview{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}.mw-stat{display:block;background:linear-gradient(135deg,#10232e,#0a151f);border:1px solid #25404d;border-radius:14px;padding:20px}.mw-stat>span{font-size:13px;color:#b9cddc}.mw-stat strong{display:block;font-size:30px;font-weight:600;color:#e7fbff;margin:14px 0 6px;line-height:1.3}.mw-stat strong small{display:block;font-size:12px;font-weight:400;color:#8eabba}.mw-stat p{font-size:12px;color:#94adbf;margin:0}.mw-stat .mw-stat-link{display:block;font-size:11px;color:#59dedc;margin-top:16px}.mw-stat:hover{border-color:#42cfc8}.mw-notice{border-left:2px solid #29c8c8;padding:12px 16px;margin-top:20px;color:#9eb6c8;background:#0c1923;font-size:12px;line-height:1.8}.tct-mw .mw-warning{color:#ffd391;background:#2b2215;border-radius:8px;padding:10px 14px;font-size:12px;margin-top:12px;line-height:1.7}.mw-intro{font-size:14px;color:#a4bccc;margin:0 0 20px}.mw-panel{border:1px solid #223845;background:#0b1721;border-radius:14px}.mw-table-scroll{overflow-x:auto;max-width:100%}.tct-mw table{border-collapse:collapse;width:100%;font-size:13px;text-align:left;font-variant-numeric:tabular-nums}.tct-mw caption{text-align:left;font-size:12px;padding:15px;color:#9db6c6}.tct-mw th,.tct-mw td{padding:14px 16px;border-bottom:1px solid #20313f;white-space:nowrap}.tct-mw thead th{color:#9dbbcd;font-weight:500;font-size:11px;text-transform:uppercase;letter-spacing:.04em;background:#101e2b}.tct-mw tbody th{font-weight:500;color:#e0effb}.tct-mw tbody th small{display:block;font-size:10px;color:#89a6bc;font-weight:400;margin-top:4px}.tct-mw tbody tr:last-child>*{border-bottom:0}.tct-mw tbody tr:hover{background:#102532}.tct-mw td{color:#b6cbdc}.mw-meta,.mw-muted{color:#9cb4c5;font-size:12px;margin:12px 0}.mw-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.mw-card{min-width:0;padding:24px;background:linear-gradient(145deg,#0f202c,#0a141d);border:1px solid #243a48;border-radius:14px;align-self:start}.mw-card-top{display:flex;justify-content:space-between;gap:10px;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:#96b5c7;margin-bottom:17px}.tct-mw h3{font-size:18px;font-weight:600;margin:0 0 14px}.mw-value{font-size:32px;font-weight:600;letter-spacing:-.025em;color:#e6fcff;font-variant-numeric:tabular-nums}.mw-value small{font-size:12px;color:#9cb7c6;font-weight:400;letter-spacing:0}.mw-spark{display:block;width:100%;height:84px;margin:16px 0}.mw-detail{border-top:1px solid #29414e;margin-top:18px;padding-top:14px}.tct-mw summary{cursor:pointer;color:#70dfde;font-size:13px;line-height:1.6;padding:4px 0}.mw-detail p{font-size:13px;color:#b4c9d7}.mw-detail strong{color:#e1f1fa}.mw-source{font-size:12px;color:#67e1df!important;text-decoration:underline;text-underline-offset:4px}.mw-calendar{padding:18px}.mw-calendar summary{font-size:16px;color:#e9faff}.mw-calendar summary span{font-size:11px;color:#99b3c4;margin-left:12px}.mw-calendar iframe{border:0;width:100%;height:700px;display:block;margin-top:16px;border-radius:8px;background:#0b1420}.mw-links{display:flex;flex-wrap:wrap;gap:12px;margin:18px 0}.mw-links a{color:#a6dce7;border:1px solid #264451;padding:10px 14px;border-radius:8px;font-size:12px}.mw-method{margin-top:32px;padding:24px}.tct-mw .mw-method h2{font-size:20px}.mw-method>p{font-size:13px;color:#a1b9ca;max-width:1040px}
@media(max-width:950px){.tct-mw .mw-hero{flex-direction:column;align-items:stretch;padding-top:32px}.mw-status{min-width:0}.mw-overview{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.mw-shell{width:92%}.mw-grid{grid-template-columns:minmax(0,1fr)}.mw-card{padding:18px}.mw-heading{align-items:flex-start;flex-direction:column}.mw-overview{gap:10px}.mw-stat{padding:14px}.mw-stat strong{font-size:26px}.mw-stat>span{font-size:12px}.mw-calendar{padding:10px}.mw-calendar summary span{display:block;margin:6px 0 0}.mw-lead{font-size:15px}.tct-mw .mw-section{padding-top:28px}.mw-method{padding:18px}}
`;
