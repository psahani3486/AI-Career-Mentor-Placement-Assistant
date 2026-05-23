"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { id: "nav-dashboard", label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { id: "nav-resume", label: "Resume", href: "/dashboard/resume", icon: "📄" },
  { id: "nav-interview", label: "Interview", href: "/dashboard/interview", icon: "🎤" },
  { id: "nav-roadmap", label: "Roadmap", href: "/dashboard/roadmap", icon: "🗺️" },
  { id: "nav-chatbot", label: "Chatbot", href: "/dashboard/chatbot", icon: "🤖" },
  { id: "nav-knowledge", label: "Knowledge", href: "/dashboard/knowledge", icon: "📚" },
  { id: "nav-analytics", label: "Analytics", href: "/dashboard/analytics", icon: "📊" },
  { id: "nav-settings", label: "Settings", href: "/dashboard/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {}
      <button
        id="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden glass rounded-xl p-2.5 hover:bg-white/10 transition-premium"
        aria-label="Toggle sidebar"
      >
        <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full flex flex-col
          glass-strong transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {}
        <div className="flex items-center gap-3 px-4 py-6 border-b border-white/5">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg">
            A
          </div>
          {!collapsed && (
            <span className="gradient-text font-bold text-lg tracking-tight whitespace-nowrap">
              AI Mentor
            </span>
          )}
        </div>

        {}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                id={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-premium relative overflow-hidden
                  ${active
                    ? "bg-primary/15 text-white shadow-lg shadow-primary/5"
                    : "text-muted hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                )}
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {}
        <div className="border-t border-white/5 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              P
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">Pankaj</p>
                <p className="text-xs text-muted truncate">Pro Plan</p>
              </div>
            )}
          </div>
        </div>

        {}
        <button
          id="sidebar-collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-surface-light border border-white/10 items-center justify-center text-muted hover:text-white hover:bg-primary/30 transition-premium"
          aria-label="Collapse sidebar"
        >
          <svg
            width="14"
            height="14"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>
    </>
  );
}
