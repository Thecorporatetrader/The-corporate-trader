import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Nav, Footer } from '@/components/Site';

export const metadata: Metadata = {
  title: 'The Corporate Trader',
  description: 'Trade. Track. Improve. Automate.',
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
