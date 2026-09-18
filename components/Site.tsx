import type { ReactNode } from 'react';
import { ArrowRight, BookOpen, ChartNoAxesCombined, ShieldCheck } from 'lucide-react';
import { Nav } from './Nav';
import { Footer } from './Footer';

interface PageHeroProps {
  kicker: string;
  title: string;
  children: ReactNode;
}

export function PageHero({ kicker, title, children }: PageHeroProps) {
  return (
    <div className="pagehero container">
      <div className="eyebrow">{kicker}</div>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}

/** Re-exported so existing imports from '@/components/Site' keep working. */
export { Nav, Footer };
export { ArrowRight, BookOpen, ChartNoAxesCombined, ShieldCheck };
