import type { ReactNode } from 'react';
import type { PatternKey } from '@/lib/curriculum';

interface VisualChartDiagramProps {
  pattern: PatternKey;
  caption?: string;
}

/** A single OHLC candle, drawn with currentColor so it inherits the theme color passed on the wrapper. */
function Candle({ x, open, close, high, low, bullish }: { x: number; open: number; close: number; high: number; low: number; bullish: boolean }) {
  const top = Math.min(open, close);
  const bodyHeight = Math.max(Math.abs(open - close), 3);
  const color = bullish ? 'text-green' : 'text-red';
  return (
    <g className={color}>
      <line x1={x} x2={x} y1={high} y2={low} stroke="currentColor" strokeWidth={1.5} />
      <rect x={x - 8} y={top} width={16} height={bodyHeight} fill="currentColor" stroke="currentColor" />
    </g>
  );
}

function Frame({ children, labels }: { children: ReactNode; labels?: { x: number; y: number; text: string; color?: string }[] }) {
  return (
    <svg viewBox="0 0 420 220" className="h-full w-full">
      <line x1={10} y1={210} x2={410} y2={210} className="text-line" stroke="currentColor" strokeWidth={1} />
      {children}
      {labels?.map((l, i) => (
        <text key={i} x={l.x} y={l.y} fontSize="11" fontWeight={700} className={l.color ?? 'text-muted'} fill="currentColor">
          {l.text}
        </text>
      ))}
    </svg>
  );
}

function DashedLevel({ y, from = 10, to = 410 }: { y: number; from?: number; to?: number }) {
  return <line x1={from} y1={y} x2={to} y2={y} className="text-warn" stroke="currentColor" strokeWidth={1.2} strokeDasharray="6 5" />;
}

function Arrow({ x, yFrom, yTo, color = 'text-red' }: { x: number; yFrom: number; yTo: number; color?: string }) {
  const down = yTo > yFrom;
  return (
    <g className={color}>
      <line x1={x} y1={yFrom} x2={x} y2={yTo} stroke="currentColor" strokeWidth={2} />
      <polygon
        points={down ? `${x - 5},${yTo - 8} ${x + 5},${yTo - 8} ${x},${yTo}` : `${x - 5},${yTo + 8} ${x + 5},${yTo + 8} ${x},${yTo}`}
        fill="currentColor"
      />
    </g>
  );
}

function diagramFor(pattern: PatternKey) {
  switch (pattern) {
    case 'head-shoulders-top':
      return (
        <Frame
          labels={[
            { x: 55, y: 95, text: 'Left Shoulder' },
            { x: 175, y: 45, text: 'Head' },
            { x: 275, y: 95, text: 'Right Shoulder' },
            { x: 330, y: 190, text: 'Breakout', color: 'text-red' },
          ]}
        >
          <polyline
            points="20,190 70,110 120,150 190,60 260,150 310,115 330,150 400,195"
            fill="none"
            className="text-cyan"
            stroke="currentColor"
            strokeWidth={2.5}
          />
          <DashedLevel y={150} from={95} to={335} />
          <Arrow x={365} yFrom={150} yTo={200} />
        </Frame>
      );

    case 'double-top':
      return (
        <Frame labels={[{ x: 95, y: 55, text: 'Top 1' }, { x: 245, y: 55, text: 'Top 2' }, { x: 330, y: 195, text: 'Breakout', color: 'text-red' }]}>
          <polyline
            points="20,190 110,70 170,140 250,70 320,150 400,195"
            fill="none"
            className="text-cyan"
            stroke="currentColor"
            strokeWidth={2.5}
          />
          <DashedLevel y={70} from={90} to={270} />
          <Arrow x={360} yFrom={150} yTo={200} />
        </Frame>
      );

    case 'ascending-triangle':
      return (
        <Frame labels={[{ x: 300, y: 60, text: 'Resistance (flat)' }, { x: 40, y: 195, text: 'Rising support' }, { x: 350, y: 55, text: 'Breakout', color: 'text-green' }]}>
          <line x1={20} y1={80} x2={400} y2={80} className="text-warn" stroke="currentColor" strokeWidth={1.5} strokeDasharray="6 5" />
          <line x1={20} y1={195} x2={330} y2={80} className="text-green" stroke="currentColor" strokeWidth={1.5} strokeDasharray="6 5" />
          <polyline
            points="20,180 70,120 110,160 150,100 190,140 230,90 270,130 310,80 340,60 400,30"
            fill="none"
            className="text-cyan"
            stroke="currentColor"
            strokeWidth={2.5}
          />
          <Arrow x={365} yFrom={80} yTo={35} color="text-green" />
        </Frame>
      );

    case 'bull-flag':
      return (
        <Frame labels={[{ x: 40, y: 60, text: 'Flag pole' }, { x: 230, y: 175, text: 'Flag (channel)' }, { x: 350, y: 55, text: 'Continuation', color: 'text-green' }]}>
          <polyline points="20,195 70,50" fill="none" className="text-green" stroke="currentColor" strokeWidth={2.5} />
          <polyline points="70,50 130,90 190,75 250,115 300,100" fill="none" className="text-cyan" stroke="currentColor" strokeWidth={2.5} />
          <line x1={70} y1={50} x2={310} y2={80} className="text-line" stroke="currentColor" strokeDasharray="4 4" />
          <line x1={70} y1={90} x2={310} y2={120} className="text-line" stroke="currentColor" strokeDasharray="4 4" />
          <polyline points="300,100 340,60 400,25" fill="none" className="text-green" stroke="currentColor" strokeWidth={2.5} />
          <Arrow x={360} yFrom={60} yTo={30} color="text-green" />
        </Frame>
      );

    case 'cup-handle':
      return (
        <Frame labels={[{ x: 150, y: 195, text: 'Cup' }, { x: 330, y: 90, text: 'Handle' }, { x: 370, y: 45, text: 'Breakout', color: 'text-green' }]}>
          <path d="M 30 70 C 100 190, 220 190, 290 70" fill="none" className="text-cyan" stroke="currentColor" strokeWidth={2.5} />
          <polyline points="290,70 320,100 350,80" fill="none" className="text-cyan" stroke="currentColor" strokeWidth={2.5} />
          <line x1={30} y1={70} x2={350} y2={70} className="text-warn" stroke="currentColor" strokeWidth={1.2} strokeDasharray="6 5" />
          <polyline points="350,80 400,30" fill="none" className="text-green" stroke="currentColor" strokeWidth={2.5} />
          <Arrow x={385} yFrom={45} yTo={20} color="text-green" />
        </Frame>
      );

    case 'hammer-candle':
      return (
        <Frame labels={[{ x: 150, y: 40, text: 'Downtrend into the candle' }, { x: 235, y: 165, text: 'Small body near top' }, { x: 235, y: 200, text: 'Long lower wick \u2265 2\u00d7 body' }]}>
          <polyline points="20,50 90,90 160,130 210,160" fill="none" className="text-red" stroke="currentColor" strokeWidth={2} />
          <Candle x={250} open={150} close={160} high={145} low={205} bullish />
          <polyline points="270,155 340,150 400,145" fill="none" className="text-green" stroke="currentColor" strokeWidth={2} strokeDasharray="4 4" />
        </Frame>
      );

    case 'bullish-engulfing':
      return (
        <Frame labels={[{ x: 40, y: 40, text: 'Downtrend' }, { x: 220, y: 195, text: 'Body #2 engulfs body #1', color: 'text-green' }]}>
          <polyline points="20,60 80,100 140,140" fill="none" className="text-red" stroke="currentColor" strokeWidth={2} />
          <Candle x={190} open={140} close={165} high={135} low={172} bullish={false} />
          <Candle x={230} open={175} close={125} high={120} low={182} bullish />
          <polyline points="260,120 330,90 400,60" fill="none" className="text-green" stroke="currentColor" strokeWidth={2} strokeDasharray="4 4" />
        </Frame>
      );

    case 'doji':
      return (
        <Frame labels={[{ x: 160, y: 40, text: 'Trend into the Doji' }, { x: 190, y: 200, text: 'Open \u2248 Close \u2014 indecision' }]}>
          <polyline points="20,180 90,140 160,110 210,95" fill="none" className="text-green" stroke="currentColor" strokeWidth={2} />
          <g className="text-warn">
            <line x1={250} y1={60} x2={250} y2={150} stroke="currentColor" strokeWidth={1.5} />
            <line x1={235} y1={100} x2={265} y2={100} stroke="currentColor" strokeWidth={3} />
          </g>
          <polyline points="270,105 340,120 400,140" fill="none" className="text-muted" stroke="currentColor" strokeWidth={2} strokeDasharray="4 4" />
        </Frame>
      );

    case 'liquidity-sweep':
      return (
        <Frame labels={[{ x: 30, y: 100, text: 'Resting liquidity / stops', color: 'text-warn' }, { x: 250, y: 190, text: 'Sweep below level' }, { x: 320, y: 55, text: 'Sharp reversal', color: 'text-green' }]}>
          <DashedLevel y={130} />
          <polyline
            points="20,90 90,110 160,125 220,132 260,175 300,110 350,70 400,45"
            fill="none"
            className="text-cyan"
            stroke="currentColor"
            strokeWidth={2.5}
          />
          <Arrow x={280} yFrom={140} yTo={172} color="text-red" />
        </Frame>
      );

    case 'demand-zone-retest':
      return (
        <Frame labels={[{ x: 30, y: 195, text: 'Demand zone', color: 'text-green' }, { x: 220, y: 60, text: 'Departure' }, { x: 300, y: 150, text: 'Retest' }]}>
          <rect x={10} y={155} width={400} height={30} className="text-green" fill="currentColor" opacity={0.12} />
          <line x1={10} y1={155} x2={410} y2={155} className="text-green" stroke="currentColor" strokeDasharray="5 4" />
          <line x1={10} y1={185} x2={410} y2={185} className="text-green" stroke="currentColor" strokeDasharray="5 4" />
          <polyline
            points="20,170 60,168 100,60 180,50 230,120 270,168 310,165 360,80 400,50"
            fill="none"
            className="text-cyan"
            stroke="currentColor"
            strokeWidth={2.5}
          />
        </Frame>
      );

    case 'support-break-retest':
      return (
        <Frame labels={[{ x: 300, y: 90, text: 'Old support' }, { x: 300, y: 130, text: 'New resistance', color: 'text-red' }]}>
          <line x1={10} y1={110} x2={410} y2={110} className="text-line" stroke="currentColor" strokeDasharray="5 4" />
          <polyline
            points="20,70 90,95 160,90 210,108 250,150 300,140 340,118 400,150"
            fill="none"
            className="text-cyan"
            stroke="currentColor"
            strokeWidth={2.5}
          />
          <Arrow x={225} yFrom={108} yTo={145} color="text-red" />
        </Frame>
      );

    default:
      return null;
  }
}

const PATTERN_TITLES: Record<PatternKey, string> = {
  'head-shoulders-top': 'Head & Shoulders (Top)',
  'double-top': 'Double Top',
  'ascending-triangle': 'Ascending Triangle',
  'bull-flag': 'Bull Flag',
  'cup-handle': 'Cup & Handle',
  'hammer-candle': 'Hammer',
  'bullish-engulfing': 'Bullish Engulfing',
  doji: 'Doji',
  'liquidity-sweep': 'Liquidity Sweep',
  'demand-zone-retest': 'Demand Zone Retest',
  'support-break-retest': 'Support Break & Retest',
};

export function VisualChartDiagram({ pattern, caption }: VisualChartDiagramProps) {
  return (
    <div className="my-8 overflow-hidden rounded-card border border-line bg-panel2">
      <div className="border-b border-line px-5 py-3 text-sm font-bold text-text">{PATTERN_TITLES[pattern]}</div>
      <div className="aspect-[420/220] w-full p-2">{diagramFor(pattern)}</div>
      {caption && <div className="border-t border-line px-5 py-3 text-xs text-muted">{caption}</div>}
    </div>
  );
}
