"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.login(email, password);
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.login("demo@example.com", "password123");
      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to login with demo credentials. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-4 overflow-hidden">
      {}
      <div className="orb w-[400px] h-[400px] bg-primary/25 top-[-100px] left-[-100px] animate-float" />
      <div className="orb w-[450px] h-[450px] bg-secondary/15 bottom-[-100px] right-[-100px] animate-pulse-glow" />

      {}
      <div className="w-full max-w-md glass rounded-3xl p-8 relative z-10 shadow-2xl animate-fade-in-up">
        {}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
              A
            </div>
            <span className="gradient-text font-bold text-lg tracking-tight">
              AI Career Mentor
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-sm text-muted mt-1">Please enter your credentials to sign in</p>

          {}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mt-5 py-3 rounded-2xl font-semibold bg-gradient-to-r from-primary/10 via-secondary/15 to-accent/10 hover:from-primary/20 hover:via-secondary/25 hover:to-accent/20 border border-primary/30 hover:border-primary/60 text-white transition-premium shadow-md shadow-primary/5 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2.5 text-sm cursor-pointer disabled:opacity-50"
          >
            ⚡ Quick Demo Access (One-Click)
          </button>
        </div>

        {}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger font-medium animate-pulse flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        {}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. candidate@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium text-sm"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
                Password
              </label>
              <a href="#" className="text-xs font-semibold text-primary hover:text-primary-dark transition-premium">
                Forgot password?
              </a>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-premium glow-purple mt-6 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0b0b11] px-2 text-muted">Or continue with</span>
          </div>
        </div>

        <button
          onClick={() => {
            alert("Google Sign-In is simulated! Please use email registration for development.");
          }}
          className="w-full py-3 rounded-xl font-semibold bg-white/[0.03] hover:bg-white/[0.07] text-white border border-white/10 transition-premium flex items-center justify-center gap-2.5 text-sm"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.887H12.24z" />
          </svg>
          Google Account
        </button>

        {}
        <p className="text-center text-sm text-muted mt-8">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:text-primary-dark transition-premium">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
