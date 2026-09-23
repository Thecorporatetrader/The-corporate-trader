import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Nav, Footer } from '@/components/Site';

export const metadata: Metadata = {
  title: 'The Corporate Trader',
  description: 'Build a disciplined trading routine with The Corporate Trader: private trading journals, MT5 automation, custom algorithms, and practical market education.',
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
