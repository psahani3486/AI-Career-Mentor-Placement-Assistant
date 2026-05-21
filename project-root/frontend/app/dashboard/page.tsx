"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatsCard from "../components/StatsCard";
import { api } from "@/lib/api";

export default function DashboardHome() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    resumeScore: "N/A",
    chatCount: 0,
    interviewsCount: 0,
    roadmapsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = api.getUser();
    setUser(u);

    async function loadStats() {
      try {
        const [resumes, chats, interviews] = await Promise.all([
          api.getResumeHistory(),
          api.getChatHistory(),
          api.getInterviewHistory(),
        ]);

        const topScore = resumes.length > 0 
          ? `${Math.max(...resumes.map(r => r.score || 0))}/100` 
          : "N/A";

        setStats({
          resumeScore: topScore,
          chatCount: chats.length,
          interviewsCount: interviews.length,
          roadmapsCount: resumes.length > 0 ? 1 : 0, // Placeholder
        });
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    }

    if (u) {
      loadStats();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-r from-primary/10 via-transparent to-transparent border-primary/10">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Welcome Back, <span className="gradient-text">{user?.name}</span> 👋
          </h1>
          <p className="text-sm text-muted max-w-xl">
            Your placement readiness dashboard is active. Practice mock sessions or upload your resumes to pinpoint skills gap.
          </p>
        </div>
        <Link
          href="/dashboard/resume"
          className="flex-shrink-0 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-premium glow-purple"
        >
          🚀 Upload Resume
        </Link>
      </div>

      {/* Grid Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          id="stat-resume-score"
          icon="📄"
          value={stats.resumeScore}
          label="Top Resume Score"
          trend={stats.resumeScore !== "N/A" ? "Updated" : "Pending"}
          color="purple"
        />
        <StatsCard
          id="stat-chat-sessions"
          icon="🤖"
          value={stats.chatCount.toString()}
          label="AI Mentor Chats"
          trend={`${stats.chatCount} sessions`}
          color="blue"
        />
        <StatsCard
          id="stat-mock-interviews"
          icon="🎤"
          value={stats.interviewsCount.toString()}
          label="Simulated Interviews"
          trend={`${stats.interviewsCount} sessions`}
          color="accent"
        />
        <StatsCard
          id="stat-roadmap-progress"
          icon="🗺️"
          value={stats.roadmapsCount > 0 ? "Active" : "None"}
          label="Personalized Roadmap"
          trend="Plan progress"
          color="warning"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Quick Prep Toolbox</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Action 1 */}
          <Link
            href="/dashboard/resume"
            className="glass rounded-2xl p-6 hover:bg-white/[0.06] hover:scale-[1.01] border-white/5 hover:border-primary/20 transition-premium flex flex-col gap-4 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg group-hover:scale-110 transition-premium">
              📄
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-primary transition-premium">Resume Analyzer</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Scan your PDF resume to receive scoring, missing skill analysis, and optimization suggestions.
              </p>
            </div>
          </Link>

          {/* Action 2 */}
          <Link
            href="/dashboard/chatbot"
            className="glass rounded-2xl p-6 hover:bg-white/[0.06] hover:scale-[1.01] border-white/5 hover:border-secondary/20 transition-premium flex flex-col gap-4 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center text-lg group-hover:scale-110 transition-premium">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-secondary transition-premium">Career Chatbot</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Receive continuous mentoring, learning resource tags, and portfolio structuring advice.
              </p>
            </div>
          </Link>

          {/* Action 3 */}
          <Link
            href="/dashboard/interview"
            className="glass rounded-2xl p-6 hover:bg-white/[0.06] hover:scale-[1.01] border-white/5 hover:border-accent/20 transition-premium flex flex-col gap-4 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center text-lg group-hover:scale-110 transition-premium">
              🎤
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-accent transition-premium">Mock Interviews</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Simulate targeted interviews with real-time video/audio emotional feedback.
              </p>
            </div>
          </Link>

          {/* Action 4 */}
          <Link
            href="/dashboard/knowledge"
            className="glass rounded-2xl p-6 hover:bg-white/[0.06] hover:scale-[1.01] border-white/5 hover:border-warning/20 transition-premium flex flex-col gap-4 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center text-lg group-hover:scale-110 transition-premium">
              📚
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-warning transition-premium">RAG Search</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Upload interview cheatsheets and search them instantly with context-aware RAG pipelines.
              </p>
            </div>
          </Link>

          {/* Action 5 */}
          <Link
            href="/dashboard/roadmap"
            className="glass rounded-2xl p-6 hover:bg-white/[0.06] hover:scale-[1.01] border-white/5 hover:border-purple-400/20 transition-premium flex flex-col gap-4 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg group-hover:scale-110 transition-premium">
              🗺️
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-purple-400 transition-premium">Agentic Roadmaps</h3>
              <p className="text-xs text-muted mt-1 leading-relaxed">
                Utilize cooperative CrewAI planner crews to schedule custom week-by-week roadmaps.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
