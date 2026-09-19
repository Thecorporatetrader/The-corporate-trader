/**
 * Schematic, annotated line chart used on /famous-strategies/[slug].
 * It is a hand-drawn placeholder shape (NOT real market data and never fed from a price series).
 * Colours follow the site palette: green #00d084 for the successful example, red #ff4d6d for the failed one,
 * on the dark #0e1520 / #121c29 panel background. Server-safe: no hooks, no browser APIs.
 */
type Pt = readonly [number, number];

export interface StrategyExampleChartProps {
  variant: 'success' | 'fail';
  entryLabel: string;
  exitLabel: string;
  stopLabel: string;
  /** Accessible name for the chart, for example "Illustrative winner". */
  title?: string;
  /** Fail variant only: false draws the exit further beyond the stop line (the stop was not honoured). */
  stopHonoured?: boolean;
}

const COLORS = { success: '#00d084', fail: '#ff4d6d' } as const;
const PANEL = '#0e1520';
const PLOT = '#121c29';
const LINE = '#1e3042';
const MUTED = '#8fa3b8';
const TEXT = '#eef6ff';
const STOP = '#ffcc66';

// Fixed schematic shapes. Indices mark the entry and exit vertices.
const SHAPES = {
  success: {
    points: [[20, 132], [44, 120], [68, 138], [92, 118], [116, 134], [140, 114], [160, 112], [176, 100], [200, 88], [222, 96], [246, 70], [270, 78], [296, 52], [316, 48], [334, 64]] as Pt[],
    entry: 7, exit: 14, exitAlt: 14, stopY: 142,
    entryTag: { x: 184, y: 118, anchor: 'start' }, exitTag: { x: 334, y: 82, anchor: 'middle' }, stopTag: { x: 346, y: 156, anchor: 'end' },
    exitAltTag: { x: 334, y: 82, anchor: 'middle' },
  },
  fail: {
    points: [[20, 108], [44, 122], [68, 104], [92, 120], [116, 102], [140, 116], [160, 100], [176, 92], [196, 104], [210, 124], [218, 132], [224, 138], [250, 150], [280, 158], [312, 165], [344, 170]] as Pt[],
    entry: 7, exit: 10, exitAlt: 13, stopY: 132,
    entryTag: { x: 176, y: 80, anchor: 'middle' }, exitTag: { x: 212, y: 146, anchor: 'end' }, stopTag: { x: 346, y: 126, anchor: 'end' },
    exitAltTag: { x: 280, y: 174, anchor: 'middle' },
  },
} as const;

const clip = (text: string, max = 44) => (text.length > max ? text.slice(0, max - 1).trimEnd() + '\u2026' : text);
const poly = (pts: readonly Pt[]) => pts.map(([x, y]) => `${x},${y}`).join(' ');

export function StrategyExampleChart({ variant, entryLabel, exitLabel, stopLabel, title, stopHonoured = true }: StrategyExampleChartProps) {
  const color = COLORS[variant];
  const shape = SHAPES[variant];
  const exitIndex = variant === 'fail' && !stopHonoured ? shape.exitAlt : shape.exit;
  const exitTag = variant === 'fail' && !stopHonoured ? shape.exitAltTag : shape.exitTag;
  const pts = shape.points;
  const entry = pts[shape.entry];
  const exit = pts[exitIndex];
  const before = pts.slice(0, shape.entry + 1);
  const trade = pts.slice(shape.entry, exitIndex + 1);
  const after = pts.slice(exitIndex);
  const name = `${title || (variant === 'success' ? 'Successful example' : 'Failed example')}: schematic price line with entry, exit and stop markers. Not real market data.`;
  return (
    <svg viewBox="0 0 360 262" width="100%" role="img" aria-label={name} style={{ display: 'block', maxWidth: '100%', height: 'auto' }}>
      <title>{name}</title>
      <rect x="0.5" y="0.5" width="359" height="261" rx="14" fill={PANEL} stroke={LINE} />
      <rect x="14" y="14" width="332" height="172" rx="10" fill={PLOT} />
      {[56, 100, 144].map((y) => <line key={y} x1="14" x2="346" y1={y} y2={y} stroke={LINE} strokeWidth="1" />)}

      {/* Risk zone between entry and stop */}
      <rect x={entry[0]} y={Math.min(entry[1], shape.stopY)} width={346 - entry[0]} height={Math.abs(shape.stopY - entry[1])} fill={STOP} fillOpacity="0.07" />
      <line x1={entry[0]} x2="346" y1={shape.stopY} y2={shape.stopY} stroke={STOP} strokeWidth="1.5" strokeDasharray="5 4" />
      <text x={shape.stopTag.x} y={shape.stopTag.y} textAnchor={shape.stopTag.anchor} fontSize="10" fontWeight="700" fill={STOP}>Stop</text>

      {/* Price line: muted before entry, coloured while in the trade, faded after exit */}
      <polyline points={poly(before)} fill="none" stroke={MUTED} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <polyline points={poly(trade)} fill="none" stroke={color} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      {after.length > 1 && <polyline points={poly(after)} fill="none" stroke={MUTED} strokeWidth="2" strokeDasharray="3 4" strokeLinejoin="round" strokeLinecap="round" />}

      {/* Markers */}
      <circle cx={entry[0]} cy={entry[1]} r="5" fill={PANEL} stroke={TEXT} strokeWidth="2" />
      <text x={shape.entryTag.x} y={shape.entryTag.y} textAnchor={shape.entryTag.anchor} fontSize="10" fontWeight="700" fill={TEXT}>Entry</text>
      <circle cx={exit[0]} cy={exit[1]} r="5" fill={color} stroke={PANEL} strokeWidth="2" />
      <text x={exitTag.x} y={exitTag.y} textAnchor={exitTag.anchor} fontSize="10" fontWeight="700" fill={color}>Exit</text>

      {/* Legend carries the full labels so nothing collides with the price line */}
      <circle cx="24" cy="204" r="4.5" fill={PANEL} stroke={TEXT} strokeWidth="2" />
      <text x="36" y="208" fontSize="11" fill={TEXT}>{clip(entryLabel)}</text>
      <circle cx="24" cy="222" r="4.5" fill={color} stroke={PANEL} strokeWidth="1.5" />
      <text x="36" y="226" fontSize="11" fill={TEXT}>{clip(exitLabel)}</text>
      <line x1="18" x2="30" y1="240" y2="240" stroke={STOP} strokeWidth="2" strokeDasharray="4 3" />
      <text x="36" y="244" fontSize="11" fill={TEXT}>{clip(stopLabel)}</text>
      <text x="346" y="255" textAnchor="end" fontSize="9" fill={MUTED}>Schematic only. Not real market data.</text>
    </svg>
  );
}
