"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function InterviewPage() {
  const [stage, setStage] = useState<"setup" | "interview" | "result">("setup");
  const [type, setType] = useState("technical");
  const [role, setRole] = useState("Software Engineer");
  const [skills, setSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  const [interviewId, setInterviewId] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");

  
  const [videoOn, setVideoOn] = useState(false);
  const [audioOn, setAudioOn] = useState(false);

  
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const h = await api.getInterviewHistory();
        setHistory(h);
      } catch (err) {
        console.error("Failed to load interview history:", err);
      }
    }
    loadHistory();
  }, [stage]);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const skillsArray = skills.split(",").map(s => s.trim()).filter(Boolean);
      const res = await api.startInterview(type, role, skillsArray);
      
      setQuestions(res.questions || []);
      setInterviewId(res.interview_id);
      setAnswers([]);
      setCurrentIdx(0);
      setCurrentAnswer("");
      setStage("interview");
    } catch (err: any) {
      setError(err.message || "Failed to initialize interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentIdx] = currentAnswer;
    setAnswers(updatedAnswers);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setCurrentAnswer(answers[currentIdx + 1] || "");
    } else {
      
      handleEvaluate(updatedAnswers);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      const updatedAnswers = [...answers];
      updatedAnswers[currentIdx] = currentAnswer;
      setAnswers(updatedAnswers);
      
      setCurrentIdx(prev => prev - 1);
      setCurrentAnswer(answers[currentIdx - 1] || "");
    }
  };

  const handleEvaluate = async (finalAnswers: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const evalRes = await api.evaluateAnswers(interviewId, finalAnswers, videoOn, audioOn);
      setResult(evalRes);
      setStage("result");
    } catch (err: any) {
      setError(err.message || "Evaluation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          AI Mock <span className="gradient-text">Interview</span>
        </h1>
        <p className="text-sm text-muted mt-1.5">
          Simulate professional, pressure-filled interviews and get instant emotional and vocal evaluations.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger font-medium animate-pulse">
          ⚠️ {error}
        </div>
      )}

      {}
      {stage === "setup" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {}
          <div className="lg:col-span-2 glass rounded-3xl p-6 sm:p-8 border-white/5 space-y-6">
            <h2 className="text-lg font-bold text-white">Configure Interview Session</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Interview Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["technical", "behavioral", "hr"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={`
                        py-3 rounded-xl border text-xs font-bold capitalize transition-premium
                        ${type === t
                          ? "bg-primary/10 border-primary/20 text-white glow-purple"
                          : "bg-white/[0.02] border-white/5 text-muted hover:bg-white/[0.05] hover:text-white"
                        }
                      `}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Target Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer, Product Manager"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Focus Stacks / Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. React, Node.js, System Design"
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium text-sm"
                />
              </div>

              {}
              <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setVideoOn(!videoOn)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-xs font-semibold transition-premium
                    ${videoOn 
                      ? "bg-accent/10 border-accent/20 text-white" 
                      : "bg-white/[0.02] border-white/5 text-muted hover:bg-white/[0.04]"
                    }
                  `}
                >
                  <span>📷</span>
                  <div>
                    <p className="font-bold">Simulate Web Camera</p>
                    <p className="text-[10px] text-muted">Enables emotional predictions</p>
                  </div>
                </button>

                <button
                  onClick={() => setAudioOn(!audioOn)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-xs font-semibold transition-premium
                    ${audioOn 
                      ? "bg-accent/10 border-accent/20 text-white" 
                      : "bg-white/[0.02] border-white/5 text-muted hover:bg-white/[0.04]"
                    }
                  `}
                >
                  <span>🎤</span>
                  <div>
                    <p className="font-bold">Simulate Speech Feed</p>
                    <p className="text-[10px] text-muted">Enables speech analytics</p>
                  </div>
                </button>
              </div>

              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white shadow-lg transition-premium glow-purple mt-6 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  "🚀 Generate Customized Questions"
                )}
              </button>

            </div>
          </div>

          {}
          <div className="glass rounded-3xl p-6 border-white/5 space-y-4 max-h-[500px] overflow-y-auto lg:col-span-1">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Past Evaluations
            </h2>
            {history.length === 0 ? (
              <p className="text-xs text-muted">No past interview records found.</p>
            ) : (
              <div className="space-y-3">
                {history.map((hItem) => (
                  <div key={hItem.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold capitalize text-white">{hItem.interview_type}</span>
                      <span className="px-2 py-0.5 rounded bg-primary/20 text-[10px] font-bold text-white">
                        Score: {hItem.score ?? "Pending"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted truncate">
                      {hItem.feedback?.overall_feedback || "Click to review feedbacks"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {}
      {stage === "interview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-3xl p-6 sm:p-8 border-white/5 space-y-6 relative overflow-hidden">
              
              {}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className="px-2.5 py-1 rounded bg-[#0a0a0f] border border-white/5 text-[10px] font-semibold text-muted">
                  Format: {type.toUpperCase()}
                </span>
              </div>

              {}
              <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                {questions[currentIdx]}
              </h3>

              {}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider">
                  Your Answer Response
                </label>
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Formulate your answer here. We recommend using the STAR framework (Situation, Task, Action, Result) for behavioral questions."
                  className="w-full h-44 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary focus:bg-white/[0.05] transition-premium text-sm leading-relaxed"
                />
              </div>

              {}
              <div className="flex items-center justify-between pt-4">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentIdx === 0}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 disabled:opacity-40 text-xs font-bold hover:bg-white/10 transition-premium"
                >
                  ⬅️ Back
                </button>
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-xs font-bold text-white shadow-lg glow-purple transition-premium"
                >
                  {currentIdx === questions.length - 1 ? "Submit Interview 🚀" : "Next Question ➡️"}
                </button>
              </div>

            </div>
          </div>

          {}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-3xl p-6 border-white/5 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px] text-center bg-black/40">
              
              {videoOn ? (
                <>
                  {}
                  <div className="w-full aspect-video rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <span className="absolute inset-0 border-t border-accent/20 animate-pulse pointer-events-none" />
                    <span className="text-xs text-accent font-medium uppercase tracking-widest animate-pulse">
                      🔴 Live Simulated Web Camera Feed
                    </span>
                  </div>
                  <div className="mt-4 w-full space-y-2 text-left">
                    <p className="text-xs font-bold text-white">📷 Dynamic Expression Scans</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded bg-white/[0.02] border border-white/5 text-[10px]">
                        <p className="text-muted">Confidence</p>
                        <p className="text-accent font-bold">Excellent</p>
                      </div>
                      <div className="p-2 rounded bg-white/[0.02] border border-white/5 text-[10px]">
                        <p className="text-muted">Eye-Contact</p>
                        <p className="text-accent font-bold">Stable</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-4xl mb-4">📷</span>
                  <h3 className="text-sm font-bold text-white">Camera Simulation Disabled</h3>
                  <p className="text-xs text-muted mt-1 max-w-xs leading-relaxed">
                    Toggle Camera Simulation on the setup page to get automated emotional indicators during review.
                  </p>
                </>
              )}

            </div>
          </div>

        </div>
      )}

      {}
      {stage === "result" && result && (
        <div className="space-y-8 animate-fade-in-up">
          {}
          <div className="glass rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Interview <span className="gradient-text-blue">Evaluation Scorecard</span>
              </h2>
              <p className="text-xs text-muted mt-1">
                Completed Mock Session ID: {interviewId}
              </p>
            </div>
            <button
              onClick={() => setStage("setup")}
              className="px-5 py-3 rounded-xl bg-primary text-xs font-bold text-white shadow-lg glow-purple transition-premium hover:scale-105"
            >
              🔄 Start New Session
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {}
            <div className="lg:col-span-2 space-y-6">
              {}
              <div className="glass rounded-3xl p-6 sm:p-8 border-white/5 space-y-6 bg-gradient-to-br from-primary/10 via-transparent to-transparent">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border-2 border-primary/20 flex items-center justify-center text-3xl font-extrabold text-white">
                    {result.score}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Evaluation Summary</h3>
                    <p className="text-xs text-muted leading-relaxed mt-1">
                      {result.feedback?.overall_feedback}
                    </p>
                  </div>
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-accent flex items-center gap-2">
                      <span>🟢</span> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {(result.feedback?.strengths || []).map((s: string, idx: number) => (
                        <li key={idx} className="text-xs text-muted flex items-start gap-1.5">
                          <span className="text-accent mt-0.5">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-warning flex items-center gap-2">
                      <span>🟡</span> Improvements
                    </h4>
                    <ul className="space-y-2">
                      {(result.feedback?.improvements || []).map((imp: string, idx: number) => (
                        <li key={idx} className="text-xs text-muted flex items-start gap-1.5">
                          <span className="text-warning mt-0.5">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>

              {}
              <div className="glass rounded-3xl p-6 sm:p-8 border-white/5 space-y-6">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Question-by-Question Diagnostics
                </h3>
                <div className="space-y-4">
                  {(result.feedback?.detailed_breakdown || []).map((item: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-white">Q{idx+1}: {item.question?.substring(0, 80)}...</span>
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-[10px] font-extrabold text-primary">
                          {item.score ?? 70}%
                        </span>
                      </div>
                      <p className="text-xs text-muted leading-relaxed">
                        {item.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {}
            <div className="lg:col-span-1 space-y-6">
              
              {}
              {result.emotion_analysis && (
                <div className="glass rounded-3xl p-6 border-white/5 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>📷</span> Emotional Predictions
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(result.emotion_analysis).map(([key, val]: any) => (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs capitalize">
                          <span className="text-muted">{key}</span>
                          <span className="text-white font-bold">{Math.round(val * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${val * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {}
              {result.voice_analysis && (
                <div className="glass rounded-3xl p-6 border-white/5 space-y-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span>🎤</span> Speech & Vocal Analytics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] text-muted uppercase">Pace</p>
                      <p className="text-base font-bold text-white">{result.voice_analysis.speaking_rate_wpm} WPM</p>
                      <p className="text-[8px] text-accent mt-0.5">Optimal pace</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <p className="text-[10px] text-muted uppercase">Vocal Energy</p>
                      <p className="text-base font-bold text-white">{Math.round(result.voice_analysis.energy_level * 100)}%</p>
                      <p className="text-[8px] text-accent mt-0.5">Confident flow</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 col-span-2">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-muted">Speech Clarity</span>
                        <span className="text-white font-bold">{Math.round(result.voice_analysis.clarity_score * 100)}%</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${result.voice_analysis.clarity_score * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
