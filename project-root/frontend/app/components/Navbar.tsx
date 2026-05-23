"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setUser(api.getUser());
  }, []);

  const handleLogout = () => {
    api.logout();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:scale-105 transition-premium">
              A
            </div>
            <span className="gradient-text font-bold text-lg tracking-tight">
              AI Career Mentor
            </span>
          </Link>

          {}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-muted hover:text-white transition-premium">
              Home
            </Link>
            <Link href="#features" className="text-sm font-medium text-muted hover:text-white transition-premium">
              Features
            </Link>
            {user ? (
              <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-white transition-premium">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-medium text-muted hover:text-white transition-premium">
                Dashboard
              </Link>
            )}
          </nav>

          {}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted">Hi, <b className="text-white">{user.name}</b></span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-danger/20 hover:border-danger/30 text-white transition-premium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-muted hover:text-white transition-premium"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-premium glow-purple"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-premium"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl px-4 py-4 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-muted hover:text-white hover:bg-white/5 transition-premium"
          >
            Home
          </Link>
          <Link
            href="#features"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 rounded-xl text-base font-medium text-muted hover:text-white hover:bg-white/5 transition-premium"
          >
            Features
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-xl text-base font-medium text-muted hover:text-white hover:bg-white/5 transition-premium"
              >
                Dashboard
              </Link>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between px-3">
                <span className="text-sm text-muted">Signed in as <b className="text-white">{user.name}</b></span>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-danger/10 hover:bg-danger/20 text-danger transition-premium"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 border-t border-white/5 flex flex-col gap-2.5">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="text-center px-4 py-2.5 rounded-xl text-base font-medium text-muted hover:bg-white/5 transition-premium"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileOpen(false)}
                className="text-center px-4 py-2.5 rounded-xl text-base font-semibold bg-primary text-white shadow-lg transition-premium"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
