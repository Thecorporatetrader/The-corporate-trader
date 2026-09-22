'use client';

import Link from 'next/link';

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight text-white pointer-events-auto">
          TCT <span className="text-blue-500">Trading</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link href="/markets" className="hover:text-white transition-colors">Market Watch</Link>
          <Link href="/algo" className="hover:text-white transition-colors">TCT Algo</Link>
          <Link href="/strategies" className="hover:text-white transition-colors">Strategies</Link>
          <Link href="/help" className="hover:text-white transition-colors">Help Center</Link>
          <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
        </nav>

        <div className="flex items-center gap-3 pointer-events-auto">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            Log In
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors cursor-pointer shadow-sm"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}
