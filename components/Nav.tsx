"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="font-bold text-xl tracking-tight">
          The Corporate Trader
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>

          {/* Products Dropdown */}
          <div className="relative" onMouseLeave={() => setProductsOpen(false)}>
            <button
              onMouseEnter={() => setProductsOpen(true)}
              onClick={() => setProductsOpen(!productsOpen)}
              className="flex items-center text-sm font-medium hover:text-primary transition-colors gap-1 focus:outline-none"
            >
              Products <ChevronDown className="w-4 h-4" />
            </button>
            {productsOpen && (
              <div className="absolute top-full left-0 w-56 bg-card border border-border shadow-lg rounded-md py-2 mt-1 z-50">
                <Link
                  href="/algo"
                  className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                >
                  TCT Algo
                </Link>
                <Link
                  href="/journal"
                  className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                >
                  Trading Journal
                </Link>
                <Link
                  href="/custom-algo"
                  className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                >
                  Build Your Own Algo
                </Link>
              </div>
            )}
          </div>

          {/* Learn Dropdown */}
          <div className="relative" onMouseLeave={() => setLearnOpen(false)}>
            <button
              onMouseEnter={() => setLearnOpen(true)}
              onClick={() => setLearnOpen(!learnOpen)}
              className="flex items-center text-sm font-medium hover:text-primary transition-colors gap-1 focus:outline-none"
            >
              Learn <ChevronDown className="w-4 h-4" />
            </button>
            {learnOpen && (
              <div className="absolute top-full left-0 w-56 bg-card border border-border shadow-lg rounded-md py-2 mt-1 z-50">
                <Link
                  href="/strategies"
                  className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                >
                  Strategies & Indicators
                </Link>
                <Link
                  href="/famous-strategies"
                  className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                >
                  Famous Strategies
                </Link>
                <Link
                  href="/library"
                  className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                >
                  Library (Academy)
                </Link>
                <Link
                  href="/articles"
                  className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                >
                  Articles
                </Link>
              </div>
            )}
          </div>

          <Link href="/market-watch" className="text-sm font-medium hover:text-primary transition-colors">
            Market Watch
          </Link>
          
          <Link href="/support" className="text-sm font-medium hover:text-primary transition-colors">
            Support
          </Link>
        </nav>

        {/* Right Actions / Auth */}
        <div className="hidden md:flex items-center space-x-4">
          <Link
            href="/account"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Account
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:bg-primary/90 transition-colors"
          >
            Login / Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-muted focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-4">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium py-1"
          >
            Home
          </Link>

          <div className="space-y-1 pl-2 border-l border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Products</p>
            <Link href="/algo" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1">TCT Algo</Link>
            <Link href="/journal" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1">Trading Journal</Link>
            <Link href="/custom-algo" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1">Build Your Own Algo</Link>
          </div>

          <div className="space-y-1 pl-2 border-l border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Learn</p>
            <Link href="/strategies" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1">Strategies & Indicators</Link>
            <Link href="/famous-strategies" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1">Famous Strategies</Link>
            <Link href="/library" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1">Library</Link>
            <Link href="/articles" onClick={() => setMobileMenuOpen(false)} className="block text-sm py-1">Articles</Link>
          </div>

          <Link
            href="/market-watch"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium py-1"
          >
            Market Watch
          </Link>

          <Link
            href="/support"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium py-1"
          >
            Support
          </Link>

          <Link
            href="/account"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base font-medium py-1"
          >
            Account
          </Link>

          <div className="pt-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center inline-block rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow hover:bg-primary/90"
            >
              Login / Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
