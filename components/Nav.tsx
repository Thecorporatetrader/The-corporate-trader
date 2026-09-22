"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  X, 
  ChevronDown, 
  TrendingUp, 
  Cpu, 
  Clock, 
  Code2, 
  BookOpen, 
  Layers, 
  BookMarked, 
  FileText, 
  Activity, 
  LifeBuoy, 
  User, 
  LogOut 
} from "lucide-react";

interface NavbarProps {
  user?: any; // Existing auth/user prop from your layout
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
}

export default function Navbar({ user, onLoginClick, onLogoutClick }: NavbarProps) {
  const pathname = usePathname();
  
  // State for mobile drawer and dropdowns
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  
  // Mobile accordion toggles
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobileLearnOpen, setMobileLearnOpen] = useState(false);
  const [mobileSupportOpen, setMobileSupportOpen] = useState(false);

  const productsRef = useRef<HTMLDivElement>(null);
  const learnRef = useRef<HTMLDivElement>(null);
  const supportRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setProductsOpen(false);
    setLearnOpen(false);
    setSupportOpen(false);
  }, [pathname]);

  // Handle click outside to close dropdowns & Escape key listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (productsRef.current && !productsRef.current.contains(event.target as Node)) {
        setProductsOpen(false);
      }
      if (learnRef.current && !learnRef.current.contains(event.target as Node)) {
        setLearnOpen(false);
      }
      if (supportRef.current && !supportRef.current.contains(event.target as Node)) {
        setSupportOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProductsOpen(false);
        setLearnOpen(false);
        setSupportOpen(false);
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Active section helpers
  const isProductsActive = pathname?.startsWith("/journal") || pathname?.startsWith("/algo") || pathname?.startsWith("/tct-auto") || pathname?.startsWith("/custom-algo");
  const isLearnActive = pathname?.startsWith("/library") || pathname?.startsWith("/strategies") || pathname?.startsWith("/famous-strategies") || pathname?.startsWith("/articles");
  const isSupportActive = pathname?.startsWith("/support") || pathname?.startsWith("/help") || pathname?.startsWith("/faq") || pathname?.startsWith("/contact");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg">
            <span className="text-lg font-bold tracking-wider text-white">
              THE CORPORATE TRADER
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {/* Home */}
          <Link
            href="/"
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname === "/" ? "text-blue-400 bg-gray-900" : "text-gray-300 hover:text-white hover:bg-gray-900"
            }`}
          >
            Home
          </Link>

          {/* Products Dropdown */}
          <div className="relative" ref={productsRef}>
            <button
              onClick={() => {
                setProductsOpen(!productsOpen);
                setLearnOpen(false);
                setSupportOpen(false);
              }}
              aria-expanded={productsOpen}
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isProductsActive || productsOpen ? "text-blue-400 bg-gray-900" : "text-gray-300 hover:text-white hover:bg-gray-900"
              }`}
            >
              Products
              <ChevronDown className={`w-4 h-4 transition-transform ${productsOpen ? "rotate-180" : ""}`} />
            </button>

            {productsOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl border border-gray-800 bg-gray-900 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                <Link
                  href="/journal"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/80 transition-colors group"
                >
                  <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      TCT Trading Journal
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Log, track, and analyze your performance.
                    </div>
                  </div>
                </Link>

                <Link
                  href="/algo"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/80 transition-colors group"
                >
                  <Cpu className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      TCT Algo
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Trade execution & management automation.
                    </div>
                  </div>
                </Link>

                <div className="flex items-start gap-3 p-3 rounded-lg opacity-75 cursor-not-allowed">
                  <Clock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">TCT Auto</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        COMING SOON
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Automated structured market analysis.
                    </div>
                  </div>
                </div>

                <Link
                  href="/custom-algo"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/80 transition-colors group"
                >
                  <Code2 className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      Build Your Own Algo
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Custom tailored algorithmic requirements.
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Learn Dropdown */}
          <div className="relative" ref={learnRef}>
            <button
              onClick={() => {
                setLearnOpen(!learnOpen);
                setProductsOpen(false);
                setSupportOpen(false);
              }}
              aria-expanded={learnOpen}
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isLearnActive || learnOpen ? "text-blue-400 bg-gray-900" : "text-gray-300 hover:text-white hover:bg-gray-900"
              }`}
            >
              Learn
              <ChevronDown className={`w-4 h-4 transition-transform ${learnOpen ? "rotate-180" : ""}`} />
            </button>

            {learnOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl border border-gray-800 bg-gray-900 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                <Link
                  href="/library"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/80 transition-colors group"
                >
                  <BookOpen className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      TCT Academy
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Comprehensive educational courses & guides.
                    </div>
                  </div>
                </Link>

                <Link
                  href="/strategies"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/80 transition-colors group"
                >
                  <Layers className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      Strategies
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Core structural trading frameworks.
                    </div>
                  </div>
                </Link>

                <Link
                  href="/famous-strategies"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/80 transition-colors group"
                >
                  <BookMarked className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      Famous Strategies
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Deep dives into renowned market setups.
                    </div>
                  </div>
                </Link>

                <Link
                  href="/articles"
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-800/80 transition-colors group"
                >
                  <FileText className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                      Articles
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Latest insights, notes, and market commentary.
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {/* Market Watch */}
          <Link
            href="/market-watch"
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              pathname === "/market-watch" ? "text-blue-400 bg-gray-900" : "text-gray-300 hover:text-white hover:bg-gray-900"
            }`}
          >
            Market Watch
          </Link>

          {/* Support */}
          <div className="relative" ref={supportRef}>
            <button
              onClick={() => {
                setSupportOpen(!supportOpen);
                setProductsOpen(false);
                setLearnOpen(false);
              }}
              aria-expanded={supportOpen}
              className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isSupportActive || supportOpen ? "text-blue-400 bg-gray-900" : "text-gray-300 hover:text-white hover:bg-gray-900"
              }`}
            >
              Support
              <ChevronDown className={`w-4 h-4 transition-transform ${supportOpen ? "rotate-180" : ""}`} />
            </button>

            {supportOpen && (
              <div className="absolute left-0 mt-2 w-56 rounded-xl border border-gray-800 bg-gray-900 p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                <Link
                  href="/support"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <LifeBuoy className="w-4 h-4 text-blue-400" />
                  Help Center / FAQ
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-200 hover:bg-gray-800 hover:text-white transition-colors"
                >
                  <Activity className="w-4 h-4 text-blue-400" />
                  Contact Us
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Account / Auth CTA Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-sm font-medium text-white hover:border-gray-700 transition-colors"
              >
                <User className="w-4 h-4 text-blue-400" />
                <span className="max-w-[120px] truncate">{user.email || "Account"}</span>
              </Link>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950"
            >
              Login / Sign Up
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-50 bg-gray-950/98 backdrop-blur-xl border-t border-gray-800 overflow-y-auto px-4 py-6 md:hidden">
          <div className="flex flex-col space-y-2">
            <Link
              href="/"
              className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                pathname === "/" ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-gray-200 hover:bg-gray-900"
              }`}
            >
              Home
            </Link>

            {/* Mobile Products Accordion */}
            <div className="rounded-xl border border-gray-800/80 bg-gray-900/50 overflow-hidden">
              <button
                onClick={() => setMobileProductsOpen(!mobileProductsOpen)}
                className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-gray-200 hover:bg-gray-900 transition-colors"
              >
                <span className={isProductsActive ? "text-blue-400 font-semibold" : ""}>Products</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${mobileProductsOpen ? "rotate-180" : ""}`} />
              </button>
              
              {mobileProductsOpen && (
                <div className="flex flex-col space-y-1 px-3 pb-3 pt-1 border-t border-gray-800/60 bg-gray-950/40">
                  <Link
                    href="/journal"
                    className="px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                  >
                    TCT Trading Journal
                  </Link>
                  <Link
                    href="/algo"
                    className="px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                  >
                    TCT Algo
                  </Link>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-gray-400 opacity-80">
                    <span>TCT Auto</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      COMING SOON
                    </span>
                  </div>
                  <Link
                    href="/custom-algo"
                    className="px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                  >
                    Build Your Own Algo
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Learn Accordion */}
            <div className="rounded-xl border border-gray-800/80 bg-gray-900/50 overflow-hidden">
              <button
                onClick={() => setMobileLearnOpen(!mobileLearnOpen)}
                className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-gray-200 hover:bg-gray-900 transition-colors"
              >
                <span className={isLearnActive ? "text-blue-400 font-semibold" : ""}>Learn</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${mobileLearnOpen ? "rotate-180" : ""}`} />
              </button>
              
              {mobileLearnOpen && (
                <div className="flex flex-col space-y-1 px-3 pb-3 pt-1 border-t border-gray-800/60 bg-gray-950/40">
                  <Link
                    href="/library"
                    className="px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                  >
                    TCT Academy
                  </Link>
                  <Link
                    href="/strategies"
                    className="px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                  >
                    Strategies
                  </Link>
                  <Link
                    href="/famous-strategies"
                    className="px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                  >
                    Famous Strategies
                  </Link>
                  <Link
                    href="/articles"
                    className="px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                  >
                    Articles
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/market-watch"
              className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                pathname === "/market-watch" ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "text-gray-200 hover:bg-gray-900"
              }`}
            >
              Market Watch
            </Link>

            {/* Mobile Support Accordion */}
            <div className="rounded-xl border border-gray-800/80 bg-gray-900/50 overflow-hidden">
              <button
                onClick={() => setMobileSupportOpen(!mobileSupportOpen)}
                className="flex items-center justify-between w-full px-4 py-3 text-base font-medium text-gray-200 hover:bg-gray-900 transition-colors"
              >
                <span className={isSupportActive ? "text-blue-400 font-semibold" : ""}>Support</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${mobileSupportOpen ? "rotate-180" : ""}`} />
              </button>
              
              {mobileSupportOpen && (
                <div className="flex flex-col space-y-1 px-3 pb-3 pt-1 border-t border-gray-800/60 bg-gray-950/40">
                  <Link
                    href="/support"
                    className="px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                  >
                    Help Center / FAQ
                  </Link>
                  <Link
                    href="/contact"
                    className="px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-900 transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              )}
            </div>

            <div className="pt-4 mt-2 border-t border-gray-800">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/account"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gray-900 border border-gray-800 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                  >
                    <User className="w-4 h-4 text-blue-400" />
                    <span>Account Management</span>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={onLoginClick}
                  className="w-full py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-colors"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
