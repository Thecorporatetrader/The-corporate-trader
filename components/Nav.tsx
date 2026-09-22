'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800 pointer-events-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Brand Home Link */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="text-xl font-bold text-white tracking-wider hover:text-blue-400 transition-colors pointer-events-auto cursor-pointer"
            >
              The Corporate Trader
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors pointer-events-auto cursor-pointer ${
                pathname === '/' ? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              href="/market-watch"
              className={`text-sm font-medium transition-colors pointer-events-auto cursor-pointer ${
                pathname === '/market-watch' ? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Market Watch
            </Link>
            <Link
              href="/support"
              className={`text-sm font-medium transition-colors pointer-events-auto cursor-pointer ${
                pathname === '/support' ? 'text-blue-400 font-semibold' : 'text-gray-300 hover:text-white'
              }`}
            >
              Support
            </Link>
          </nav>

          {/* Auth Buttons (Login & Register) */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors pointer-events-auto cursor-pointer"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow transition-all pointer-events-auto cursor-pointer"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="text-gray-400 hover:text-white p-2 focus:outline-none cursor-pointer pointer-events-auto"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 px-4 pt-2 pb-6 space-y-3 pointer-events-auto">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-gray-200 hover:text-blue-400 py-2"
          >
            Home
          </Link>
          <Link
            href="/market-watch"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-gray-200 hover:text-blue-400 py-2"
          >
            Market Watch
          </Link>
          <Link
            href="/support"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium text-gray-200 hover:text-blue-400 py-2"
          >
            Support
          </Link>
          <div className="pt-4 border-t border-gray-800 flex flex-col space-y-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-sm font-medium text-gray-300 bg-gray-800 hover:bg-gray-700 py-2.5 rounded-lg"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 py-2.5 rounded-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
