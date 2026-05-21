"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Analytics() {
  const [stats, setStats] = useState({
    totalResumes: 0,
    avgResumeScore: 0,
    totalChats: 0,
    totalInterviews: 0,
    totalRoadmaps: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const user = api.getUser();
        if (!user) {
          setError("Please log in to view analytics");
          return;
        }

        const [resumes, chats, interviews] = await Promise.all([
          api.getResumeHistory(),
          api.getChatHistory(),
          api.getInterviewHistory(),
        ]);

        const avgScore = resumes.length > 0
          ? (resumes.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / resumes.length).toFixed(1)
          : 0;

        setStats({
          totalResumes: resumes.length,
          avgResumeScore: parseFloat(avgScore as string),
          totalChats: chats.length,
          totalInterviews: interviews.length,
          totalRoadmaps: 1, // Placeholder
        });
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">Analytics</h1>
          <p className="text-muted">Track your career mentoring progress and usage statistics</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard
            label="Total Resumes"
            value={stats.totalResumes}
            icon="📄"
            color="primary"
          />
          <StatCard
            label="Avg Resume Score"
            value={`${stats.avgResumeScore}/100`}
            icon="⭐"
            color="secondary"
          />
          <StatCard
            label="Total Chats"
            value={stats.totalChats}
            icon="💬"
            color="green"
          />
          <StatCard
            label="Interviews"
            value={stats.totalInterviews}
            icon="🎤"
            color="blue"
          />
          <StatCard
            label="Roadmaps"
            value={stats.totalRoadmaps}
            icon="🗺️"
            color="purple"
          />
        </div>

        {/* Detailed Analytics Section */}
        <div className="glass rounded-3xl p-6 md:p-8">
          <h2 className="text-xl font-bold mb-4">Performance Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <span className="text-muted">Resume Analysis Score</span>
              <div className="flex items-center gap-2">
                <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    style={{ width: `${(stats.avgResumeScore / 100) * 100}%` }}
                  />
                </div>
                <span className="font-bold">{stats.avgResumeScore}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <span className="text-muted">Engagement Level</span>
              <span className="font-bold">
                {stats.totalChats + stats.totalInterviews > 10 ? "High" : stats.totalChats + stats.totalInterviews > 5 ? "Medium" : "Low"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className="glass rounded-2xl p-4 md:p-6 hover:bg-white/10 transition-premium">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl md:text-3xl">{icon}</span>
      </div>
      <p className="text-muted text-sm mb-1">{label}</p>
      <p className="text-2xl md:text-3xl font-bold">{value}</p>
    </div>
  );
}
