import type { Metadata } from 'next';
import { PageHero } from '@/components/Site';
import TraderAssessment from '@/components/TraderAssessment';

export const metadata: Metadata = { title: 'Know Your Inner Trader | The Corporate Trader', description: 'A free, 10-question trading habits self-assessment with practical recommendations to build discipline.' };

export default function KnowYourInnerTrader() {
  return <main>
    <PageHero kicker="TRADING PSYCHOLOGY · FREE SELF-ASSESSMENT" title="Know Your Inner Trader">Discover your trading personality, understand your strengths, identify your weaknesses, and become a more disciplined trader.</PageHero>
    <section className="container assessment-container" aria-label="Trading self-assessment"><TraderAssessment /></section>
  </main>;
}
