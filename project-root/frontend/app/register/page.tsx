"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.register(name, email, password);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4 overflow-hidden">
      {/* Background Orbs */}
      <div className="orb w-[400px] h-[400px] bg-primary/25 top-[-100px] left-[-100px] animate-float" />
      <div className="orb w-[450px] h-[450px] bg-secondary/15 bottom-[-100px] right-[-100px] animate-pulse-glow" />

      {/* Card */}
      <div className="w-full max-w-md glass rounded-3xl p-8 relative z-10 shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
              A
            </div>
            <span className="gradient-text font-bold text-lg tracking-tight">
              AI Career Mentor
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-sm text-muted mt-1">Get instant access to AI career mentoring</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger font-medium animate-pulse flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Pankaj Kumar"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. candidate@example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-premium glow-purple mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:text-primary-dark transition-premium">
            Sign in now
          </Link>
        </p>
      </div>
    </div>
  );
}
