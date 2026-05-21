"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import { api } from "@/lib/api";

const features = [
  {
    icon: "📄",
    title: "Resume Analyzer",
    desc: "Scan and grade your resumes instantly. Detect critical skills, obtain structural feedback, and fix missing sections automatically using custom ML models.",
  },
  {
    icon: "🤖",
    title: "AI Career Guidance",
    desc: "Have a continuous conversation with a personalized AI mentor specializing in tech careers, planning, system design, and placement prep.",
  },
  {
    icon: "🎤",
    title: "AI Mock Interviews",
    desc: "Simulate pressure-filled technical and behavioral interviews. Receive automated scoring, evaluation, and Simulated emotional/vocal analytics.",
  },
  {
    icon: "📚",
    title: "PDF Knowledge RAG",
    desc: "Upload placement textbooks, syllabus guides, or cheatsheets and search them instantly with context-aware Retrieval-Augmented Generation.",
  },
  {
    icon: "🗺️",
    title: "Personalized Roadmaps",
    desc: "Describe your professional target roles and receive customized sequential week-by-week curriculum maps curated by cooperative AI planner crews.",
  },
  {
    icon: "⚡",
    title: "Multi-Agent Planners",
    desc: "Harness CrewAI coordinate workflows (Curriculum Architects, Learning Librarians, Recruiter Agents) to orchestrate optimal placement preparation.",
  },
];

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(api.getUser());
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="orb w-[500px] h-[500px] bg-primary/25 top-[-100px] left-[-150px] animate-float" />
      <div className="orb w-[600px] h-[600px] bg-secondary/15 bottom-[-150px] right-[-200px] animate-pulse-glow" />
      <div className="orb w-[400px] h-[400px] bg-accent/10 top-[40%] right-[10%] animate-spin-slow" />

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 flex flex-col items-center justify-center text-center">
        <div className="animate-fade-in-up stagger-children flex flex-col items-center">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border-white/5 text-xs font-semibold text-primary mb-6 animate-bounce">
            ✨ Next-Gen AI Placement Assistant
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.1] mb-6">
            Your Personalized AI-Powered{" "}
            <span className="gradient-text">Career Mentor</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-muted max-w-2xl mb-10 leading-relaxed">
            Accelerate your career preparation. Generate customized learning roadmaps,
            analyze resumes with ML, practice mock interviews, and query knowledge bases instantly.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-20">
            {user ? (
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-xl text-base font-bold bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25 hover:scale-[1.03] active:scale-[0.97] transition-premium glow-purple"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-8 py-4 rounded-xl text-base font-bold bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/25 hover:scale-[1.03] active:scale-[0.97] transition-premium glow-purple"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-xl text-base font-bold glass hover:bg-white/10 text-white border border-white/10 transition-premium"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="w-full pt-16 border-t border-white/5">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
              Everything You Need to <span className="gradient-text-blue">Land the Offer</span>
            </h2>
            <p className="text-muted text-sm sm:text-base max-w-xl mx-auto">
              Our advanced AI features deliver a unified, industry-grade workspace that acts as a real personal placement coach.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="glass rounded-2xl p-6 text-left hover:bg-white/[0.06] hover:scale-[1.02] hover:shadow-xl transition-premium group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-premium">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050508]/80 py-8 text-center relative z-10">
        <p className="text-xs text-muted">
          &copy; {new Date().getFullYear()} AI Career Mentor & Placement Assistant. Built with Next.js & FastAPI.
        </p>
      </footer>
    </div>
  );
}
