"use client";

import { useState, useEffect } from "react";
import FileUpload from "../../components/FileUpload";
import { api } from "@/lib/api";

export default function ResumePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeResume, setActiveResume] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const h = await api.getResumeHistory();
        setHistory(h);
        if (h.length > 0) {
          setActiveResume(h[0]); // Default to latest resume
        }
      } catch (err: any) {
        console.error("Failed to load history:", err);
      }
    }
    loadHistory();
  }, []);

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Upload PDF
      const uploadRes = await api.uploadResume(file);
      const resumeId = uploadRes.id;

      // 2. Perform ML analysis
      const analysisRes = await api.analyzeResume(resumeId);
      
      // Reload history to pull full analysis
      const updatedHistory = await api.getResumeHistory();
      setHistory(updatedHistory);
      
      const newActive = updatedHistory.find(r => r.id === resumeId);
      setActiveResume(newActive || analysisRes);
    } catch (err: any) {
      setError(err.message || "Failed to process resume. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Resume <span className="gradient-text">Analyzer</span>
        </h1>
        <p className="text-sm text-muted mt-1.5">
          Scan your resume PDF with custom ML modeling to discover gaps, matching skills, and suggestions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-sm text-danger font-medium animate-pulse flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload & History (Left Column) */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass rounded-2xl p-6 border-white/5 space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Upload New Resume
            </h2>
            <FileUpload onFileSelect={handleFileSelect} label="Drag resume here (.pdf only)" />
            {loading && (
              <div className="flex items-center gap-2.5 justify-center py-2 text-xs text-primary font-medium animate-pulse">
                <span className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                Analyzing resume structure...
              </div>
            )}
          </div>

          {/* History */}
          <div className="glass rounded-2xl p-6 border-white/5 space-y-4">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Analysis History
            </h2>
            {history.length === 0 ? (
              <p className="text-xs text-muted">No resume analyses saved yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                {history.map((hItem) => (
                  <button
                    key={hItem.id}
                    onClick={() => setActiveResume(hItem)}
                    className={`
                      w-full p-3 rounded-xl border text-left text-xs transition-premium flex items-center justify-between gap-3
                      ${activeResume?.id === hItem.id
                        ? "bg-primary/10 border-primary/30 text-white"
                        : "bg-white/[0.02] border-white/5 text-muted hover:bg-white/[0.05] hover:text-white"
                      }
                    `}
                  >
                    <span className="truncate max-w-[120px] font-medium">{hItem.filename}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      hItem.score >= 80 
                        ? "bg-accent/10 text-accent" 
                        : hItem.score >= 60 
                          ? "bg-warning/10 text-warning" 
                          : "bg-danger/10 text-danger"
                    }`}>
                      {hItem.score ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Showcase (Right Column) */}
        <div className="lg:col-span-2">
          {activeResume ? (
            <div className="glass rounded-3xl p-6 sm:p-8 border-white/5 space-y-8 animate-fade-in-up">
              {/* Top Meta info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                  <h3 className="text-xl font-bold text-white truncate max-w-sm sm:max-w-md">
                    {activeResume.filename}
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    Uploaded: {new Date(activeResume.uploaded_at || Date.now()).toLocaleDateString()}
                  </p>
                </div>

                {/* Score Dial */}
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-full flex items-center justify-center border-4 border-white/5 bg-white/[0.02] overflow-hidden">
                    <span className="text-lg font-extrabold text-white">
                      {activeResume.score ?? 0}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted">Analysis Score</p>
                    <p className={`text-sm font-extrabold capitalize ${
                      activeResume.score >= 80 
                        ? "text-accent" 
                        : activeResume.score >= 60 
                          ? "text-warning" 
                          : "text-danger"
                    }`}>
                      {activeResume.feedback?.overall ?? "Weak"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Strengths / Improvements Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="space-y-3.5">
                  <h4 className="text-sm font-semibold text-accent flex items-center gap-2">
                    <span>🟢</span> Strengths Detected
                  </h4>
                  <ul className="space-y-2">
                    {(activeResume.feedback?.strengths || []).map((str: string, index: number) => (
                      <li key={index} className="text-xs text-muted flex items-start gap-2">
                        <span className="text-accent mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="space-y-3.5">
                  <h4 className="text-sm font-semibold text-warning flex items-center gap-2">
                    <span>🟡</span> Areas of Improvement
                  </h4>
                  <ul className="space-y-2">
                    {(activeResume.feedback?.improvements || []).map((imp: string, index: number) => (
                      <li key={index} className="text-xs text-muted flex items-start gap-2">
                        <span className="text-warning mt-0.5">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Missing sections */}
              {activeResume.feedback?.missing_sections?.length > 0 && (
                <div className="p-4 rounded-xl bg-danger/5 border border-danger/10 space-y-2.5">
                  <h4 className="text-xs font-semibold text-danger flex items-center gap-1.5">
                    🚨 Crucial Sections Missing
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeResume.feedback.missing_sections.map((sect: string, index: number) => (
                      <span key={index} className="px-2.5 py-1 rounded-lg bg-danger/10 border border-danger/20 text-[10px] font-extrabold text-danger uppercase tracking-wider">
                        {sect}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Tags */}
              <div className="space-y-3.5">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>💼</span> Technical Skills Extracted
                </h4>
                {activeResume.skills_detected?.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                    {activeResume.skills_detected.map((skill: string, index: number) => (
                      <span key={index} className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-white hover:bg-primary/20 transition-premium">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted">No explicit matching keywords matched SKILL_KEYWORDS list.</p>
                )}
              </div>

            </div>
          ) : (
            <div className="glass rounded-3xl p-12 text-center border-white/5 flex flex-col items-center justify-center min-h-[400px]">
              <span className="text-4xl mb-4">📄</span>
              <h3 className="text-lg font-bold text-white">No Resume Selected</h3>
              <p className="text-sm text-muted mt-1 max-w-sm">
                Upload a PDF resume on the left sidebar to generate detailed ML feedback diagnostics here.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
