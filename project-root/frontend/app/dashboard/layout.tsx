"use client";

import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { api } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = api.getUser();
    if (!u) {
      // Redirect to login if unauthenticated
      window.location.href = "/login";
    } else {
      setUser(u);
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <span className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted font-medium">Verifying Session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 min-h-screen overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-30 glass border-b border-white/5 backdrop-blur-md px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider hidden sm:block">
            AI Placement Assistant Hub
          </h2>
          <div className="flex items-center gap-4 ml-auto">
            {/* User Meta */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-white">{user.name}</p>
                <p className="text-[10px] text-muted">Placement Candidate</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shadow-lg">
                {user.name[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner page content */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
